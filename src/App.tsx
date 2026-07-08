import type { Session } from "@supabase/supabase-js";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  LogOut,
  MessageCircle,
  MoveRight,
  Pencil,
  Plus,
  Send,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UsersRound,
  RotateCcw,
  Moon,
  Sun,
  X,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { Toaster, toast } from "react-hot-toast";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { IMaskInput } from "react-imask";
import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
  Link,
} from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import LandingPage from "./pages/Landing";
import BrandbookPage from "./pages/Brandbook";
import SignUpScreen from "./pages/SignUp";
import LoginScreen from "./pages/Login";
import PipelinePage from "./pages/Pipeline";
import ProfilePage from "./pages/Profile";
import Logo from "./components/Logo";
import {
  convertContactToLead,
  createContact,
  createInboxMessage,
  createIntegrationChannel,
  createLead,
  createOpportunity,
  sendInboxReply,
  updateContact,
  updateIntegrationChannelStatus,
  updateInboxConversationLinks,
  updateInboxMessageStatus,
  updateLead,
  updateOpportunity,
  updateOpportunityStage,
  ensureDefaultStages,
  getCrmSnapshot,
  upsertProfile,
} from "./lib/crmService";
import { getAllowedRoutes } from "./lib/accessControl";
import { brandConfig } from "./lib/branding";
import {
  navigationItems,
  pipelineStages,
  type NavigationItem,
} from "./lib/navigation";
import {
  buildCommercialRecommendations,
  formatPriority,
} from "./services/commercialIntelligence";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import type {
  Contact,
  CrmSnapshot,
  InboxMessage,
  IntegrationChannel,
  Lead,
  Opportunity,
  OpportunityStage,
  Route as AppRoute,
} from "./lib/types";
import Dashboard from "./pages/Dashboard";
import InboxPage from "./pages/Inbox";
import ContactsPage from "./pages/Contacts";
import LeadsPage from "./pages/Leads";
import CreativesPage from "./pages/Creatives";
import MetaOAuthCallback from "./pages/MetaOAuthCallback";
import WhatsappPage from "./pages/Whatsapp";

type ModalType = "contact" | "lead" | "opportunity" | "message" | "channel";
type EditingTarget =
  | { type: "contact"; record: Contact }
  | { type: "lead"; record: Lead }
  | { type: "opportunity"; record: Opportunity };

const navItems = navigationItems;

const stages: OpportunityStage[] = pipelineStages;
const leadStatuses: Array<{ label: string; value: Lead["status"] }> = [
  { label: "Novo", value: "novo" },
  { label: "Em atendimento", value: "em_atendimento" },
  { label: "Qualificado", value: "qualificado" },
  { label: "Convertido", value: "convertido" },
  { label: "Perdido", value: "perdido" },
];

const emptySnapshot: CrmSnapshot = {
  profile: null,
  contacts: [],
  leads: [],
  opportunities: [],
  messages: [],
  channels: [],
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const normalizePhone = (value: string) => value.replace(/\D/g, "");

const formatProviderName = (provider: string) => {
  const normalized = provider.trim().toLowerCase();
  if (normalized === "whatsapp") return "WhatsApp";
  if (normalized === "twilio") return "Twilio";
  return provider.trim() || "Canal";
};

const matchesQuery = (
  query: string,
  values: Array<string | number | null | undefined>,
) => {
  const normalizedQuery = normalizeSearch(query.trim());
  if (!normalizedQuery) return true;
  return values.some((value) =>
    normalizeSearch(String(value ?? "")).includes(normalizedQuery),
  );
};

const getErrorMessage = (error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : "Não foi possível concluir a operação.";
  if (message.toLowerCase().includes("duplicate"))
    return "Este telefone já está cadastrado nesta conta.";
  return message;
};

const getFormValue = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

const buildInboxRecommendation = (message: InboxMessage) => {
  const text = normalizeSearch(
    [message.mensagem, message.status, message.canal].join(" "),
  );
  const hasPriceSignal = [
    "preco",
    "valor",
    "orcamento",
    "investimento",
    "pagamento",
  ].some((signal) => text.includes(signal));
  const hasVisitSignal = ["visita", "conhecer", "agenda", "horario"].some(
    (signal) => text.includes(signal),
  );
  const hasUrgencySignal = ["urgente", "hoje", "agora", "rapido"].some(
    (signal) => text.includes(signal),
  );

  if (hasUrgencySignal) {
    return {
      priority: "Alta",
      nextAction: "Responder agora e confirmar qual necessidade precisa ser resolvida primeiro.",
      suggestedReply:
        "Vi sua mensagem e ja vou te direcionar. Qual e a prioridade agora: prazo, valor ou detalhes da solucao?",
    };
  }

  if (hasVisitSignal) {
    return {
      priority: "Alta",
      nextAction: "Confirmar interesse e propor um horario de conversa ou demonstracao.",
      suggestedReply:
        "Perfeito. Para eu organizar o melhor proximo passo, voce prefere conversar hoje ou amanha?",
    };
  }

  if (hasPriceSignal) {
    return {
      priority: "Media",
      nextAction: "Entender faixa de investimento e contexto antes de enviar proposta.",
      suggestedReply:
        "Consigo te orientar melhor. Qual faixa de investimento ou necessidade voce tem em mente?",
    };
  }

  return {
    priority: message.unread_count > 0 ? "Media" : "Baixa",
    nextAction: "Qualificar interesse, origem e proximo passo comercial.",
    suggestedReply:
      "Entendi. Para eu te direcionar melhor, qual resultado voce quer resolver primeiro?",
  };
};

const inferOpportunityStageFromMessage = (
  message: InboxMessage,
): OpportunityStage => {
  const text = normalizeSearch([message.mensagem, message.status].join(" "));
  const hasProposalSignal = [
    "proposta",
    "orcamento",
    "valor",
    "preco",
    "investimento",
    "pagamento",
  ].some((signal) => text.includes(signal));
  const hasStrongIntent = [
    "urgente",
    "hoje",
    "agora",
    "conhecer",
    "demo",
    "reuniao",
    "agenda",
  ].some((signal) => text.includes(signal));

  if (hasProposalSignal) return "Qualificado";
  if (hasStrongIntent) return "Em atendimento";
  return "Novo";
};

const buildOpportunityNextActionFromMessage = (message: InboxMessage) => {
  const text = normalizeSearch(message.mensagem);

  if (
    ["proposta", "orcamento", "valor", "preco", "investimento"].some(
      (signal) => text.includes(signal),
    )
  ) {
    return "Confirmar necessidade, valor esperado e prazo de decisao.";
  }

  if (
    ["agenda", "reuniao", "demo", "conhecer"].some((signal) =>
      text.includes(signal),
    )
  ) {
    return "Agendar conversa e validar criterios de compra.";
  }

  return "Qualificar necessidade e definir proximo passo comercial.";
};

const buildOpportunityTitleFromMessage = (message: InboxMessage, name: string) =>
  `${name || message.remetente_nome} - ${message.canal || "Inbox"}`;

type PipelineRisk = {
  id: string;
  opportunity: Opportunity;
  priority: "Alta" | "Media";
  reason: string;
  nextAction: string;
};

type LeadQualification = {
  id: string;
  lead: Lead;
  score: number;
  missingFields: string[];
  priority: "Alta" | "Media";
  nextAction: string;
};

const isOpenOpportunity = (opportunity: Opportunity) =>
  !["Ganho", "Perdido"].includes(opportunity.etapa);

const isWeakNextAction = (opportunity: Opportunity) => {
  const nextAction = normalizeSearch(opportunity.proxima_acao ?? "");
  return !nextAction || nextAction.includes("definir");
};

const isClosingStage = (opportunity: Opportunity) =>
  ["Proposta", "NegociaÃ§Ã£o"].includes(opportunity.etapa);

const buildPipelineRisks = (opportunities: Opportunity[]): PipelineRisk[] => {
  const risks: PipelineRisk[] = [];

  for (const opportunity of opportunities.filter(isOpenOpportunity)) {
    if (isWeakNextAction(opportunity)) {
      risks.push({
        id: `${opportunity.id}-next-action`,
        opportunity,
        priority: "Alta",
        reason: "Sem proxima acao especifica.",
        nextAction: "Editar e registrar o proximo compromisso comercial.",
      });
      continue;
    }

    if (Number(opportunity.valor) <= 0 && opportunity.etapa !== "Novo") {
      risks.push({
        id: `${opportunity.id}-value`,
        opportunity,
        priority: "Media",
        reason: "Valor estimado ainda nao informado.",
        nextAction: "Atualizar valor para deixar o pipeline mensuravel.",
      });
    }
  }

  return risks.slice(0, 4);
};

const isActiveLead = (lead: Lead) =>
  !["convertido", "perdido"].includes(lead.status);

const leadHasClearNextAction = (lead: Lead) => {
  const nextAction = normalizeSearch(lead.proxima_acao ?? "");
  return Boolean(nextAction) && !nextAction.includes("realizar primeiro contato");
};

const buildLeadQualification = (lead: Lead): LeadQualification => {
  const missingFields = [
    !lead.telefone ? "telefone" : null,
    !lead.origem ? "origem" : null,
    !lead.interesse ? "interesse" : null,
    Number(lead.valor_estimado) <= 0 ? "valor estimado" : null,
    !leadHasClearNextAction(lead) ? "proxima acao" : null,
  ].filter(Boolean) as string[];
  const totalFields = 5;
  const score = Math.round(
    ((totalFields - missingFields.length) / totalFields) * 100,
  );

  return {
    id: `${lead.id}-qualification`,
    lead,
    score,
    missingFields,
    priority: missingFields.length >= 3 ? "Alta" : "Media",
    nextAction: missingFields.length
      ? `Completar ${missingFields.slice(0, 2).join(" e ")}.`
      : "Converter em oportunidade ou atualizar etapa comercial.",
  };
};

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const route = (location.pathname === "/" ? "dashboard" : location.pathname.slice(1)) as AppRoute;
  const isPublicRoute = location.pathname === "/" || location.pathname === "/brandbook";
  const [session, setSession] = useState<Session | null>(null);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<ModalType | null>(null);
  const [editing, setEditing] = useState<EditingTarget | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const queryClient = useQueryClient();

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    return (
      (saved as "light" | "dark") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
    );
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  const [isSaving, setIsSaving] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [crmError, setCrmError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsBooting(false);
      return undefined;
    }

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        if (data.session && location.pathname === "/login")
          navigate("/dashboard");
      })
      .finally(() => {
        if (mounted) setIsBooting(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        queryClient.removeQueries({ queryKey: ["crmSnapshot"] });
        const path = window.location.pathname;
        if (path !== "/" && path !== "/brandbook" && path !== "/cadastro" && path !== "/login") {
          navigate("/login");
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, queryClient]);

  const {
    data: snapshotData,
    isLoading: isLoadingData,
    error: fetchError,
  } = useQuery({
    queryKey: ["crmSnapshot", session?.user?.id],
    queryFn: async () => {
      const currentUser = session!.user;
      await upsertProfile(currentUser);
      await ensureDefaultStages(currentUser.id);
      return await getCrmSnapshot(currentUser.id);
    },
    enabled: !!session?.user && !!isSupabaseConfigured && !!supabase,
  });

  useEffect(() => {
    if (!session?.user?.id || !supabase) return;

    const channel = supabase
      .channel('inbox-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inbox_messages', filter: `owner_id=eq.${session.user.id}` },
        () => queryClient.invalidateQueries({ queryKey: ["crmSnapshot"] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, queryClient]);

  const snapshot = snapshotData ?? emptySnapshot;
  const allowedRoutes = getAllowedRoutes(snapshot.profile?.role);
  const visibleNavItems = navItems.filter((item) =>
    allowedRoutes.includes(item.id),
  );

  useEffect(() => {
    if (fetchError) {
      setCrmError(getErrorMessage(fetchError));
    }
  }, [fetchError]);

  const reloadData = () => {
    queryClient.invalidateQueries({ queryKey: ["crmSnapshot"] });
  };

  const openModal = (nextModal: ModalType) => {
    setEditing(null);
    setModal(nextModal);
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
  };

  const openEditModal = (target: EditingTarget) => {
    setEditing(target);
    setModal(target.type);
  };

  const handleAuth = async (
    email: string,
    password: string,
    mode: "login" | "signup",
    name?: string
  ) => {
    if (!supabase) {
      setAuthError(
        "Configure a chave VITE_SUPABASE_ANON_KEY antes de acessar a plataforma.",
      );
      return;
    }

    setAuthError(null);

    const request =
      mode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: {
              data: { nome: name || email.split("@")[0] },
            },
          });

    const { data, error } = await request;
    if (error) {
      setAuthError(getErrorMessage(error));
      return;
    }

    if (data.session) {
      setSession(data.session);
      navigate("/dashboard");
      return;
    }

    setAuthError(
      "Conta criada. Confirme o e-mail, se a confirmação estiver ativada no Supabase, e faça login.",
    );
  };

  const handleSignOut = async () => {
    await supabase?.auth.signOut();
    setSession(null);
    navigate("/login");
  };

  const runMutation = async (
    mutation: () => Promise<unknown>,
    successMsg = "Operação concluída!",
  ) => {
    setIsSaving(true);
    setCrmError(null);

    try {
      await mutation();
      closeModal();
      reloadData();
      toast.success(successMsg);
    } catch (error) {
      const msg = getErrorMessage(error);
      setCrmError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const ownerId = session?.user.id;
  const findContactByPhone = (phone: string) => {
    const normalizedPhone = normalizePhone(phone);
    return snapshot.contacts.find(
      (contact) => normalizePhone(contact.telefone) === normalizedPhone,
    );
  };
  const findLeadByPhone = (phone: string) => {
    const normalizedPhone = normalizePhone(phone);
    return snapshot.leads.find(
      (lead) => normalizePhone(lead.telefone) === normalizedPhone,
    );
  };
  const findOpportunityByLeadId = (leadId?: string | null) =>
    leadId
      ? snapshot.opportunities.find(
          (opportunity) => opportunity.lead_id === leadId,
        )
      : undefined;

  const createContactFromForm = async (formData: FormData) => {
    if (!ownerId) return;
    const payload = {
      nome: getFormValue(formData, "nome"),
      telefone: getFormValue(formData, "telefone"),
      email: getFormValue(formData, "email"),
      origem: getFormValue(formData, "origem"),
      potencial: getFormValue(formData, "potencial"),
    };

    await runMutation(
      () =>
        editing?.type === "contact"
          ? updateContact(editing.record.id, payload)
          : createContact(ownerId, payload),
      editing?.type === "contact"
        ? "Contato atualizado com sucesso!"
        : "Contato cadastrado com sucesso!",
    );
  };

  const createLeadFromForm = async (formData: FormData) => {
    if (!ownerId) return;
    const payload = {
      nome: getFormValue(formData, "nome"),
      telefone: getFormValue(formData, "telefone"),
      email: getFormValue(formData, "email"),
      interesse: getFormValue(formData, "interesse"),
      status: (getFormValue(formData, "status") || "novo") as Lead["status"],
      origem: getFormValue(formData, "origem"),
      valor_estimado: Number(getFormValue(formData, "valor_estimado") || 0),
      proxima_acao: getFormValue(formData, "proxima_acao"),
    };

    await runMutation(
      () =>
        editing?.type === "lead"
          ? updateLead(editing.record.id, payload)
          : createLead(ownerId, payload),
      editing?.type === "lead"
        ? "Lead atualizado com sucesso!"
        : "Lead cadastrado com sucesso!",
    );
  };

  const createOpportunityFromForm = async (formData: FormData) => {
    if (!ownerId) return;
    const payload = {
      lead_id: getFormValue(formData, "lead_id") || null,
      titulo: getFormValue(formData, "titulo"),
      etapa: (getFormValue(formData, "etapa") || "Novo") as OpportunityStage,
      valor: Number(getFormValue(formData, "valor") || 0),
      responsavel: getFormValue(formData, "responsavel"),
      proxima_acao: getFormValue(formData, "proxima_acao"),
    };

    await runMutation(
      () =>
        editing?.type === "opportunity"
          ? updateOpportunity(editing.record.id, payload)
          : createOpportunity(ownerId, payload),
      editing?.type === "opportunity"
        ? "Oportunidade atualizada com sucesso!"
        : "Oportunidade criada com sucesso!",
    );
  };

  const createMessageFromForm = async (formData: FormData) => {
    if (!ownerId) return;
    await runMutation(
      () =>
        createInboxMessage(ownerId, {
          remetente_nome: getFormValue(formData, "remetente_nome"),
          telefone: getFormValue(formData, "telefone"),
          mensagem: getFormValue(formData, "mensagem"),
          status: getFormValue(formData, "status"),
        }),
      "Mensagem simulada com sucesso!",
    );
  };

  const createChannelFromForm = async (formData: FormData) => {
    if (!ownerId) return;
    await runMutation(
      () =>
        createIntegrationChannel(ownerId, {
          provider: getFormValue(formData, "provider") || "whatsapp",
          nome: getFormValue(formData, "nome"),
          numero: getFormValue(formData, "numero"),
          phone_number_id: getFormValue(formData, "phone_number_id"),
          status: "ativo",
        }),
      "Canal de entrada configurado.",
    );
  };

  const handleUpdateChannelStatus = async (
    channel: IntegrationChannel,
    status: IntegrationChannel["status"],
  ) => {
    await runMutation(
      () => updateIntegrationChannelStatus(channel.id, status),
      status === "ativo"
        ? "Canal ativado para entrada."
        : "Canal pausado.",
    );
  };

  const handleUpdateInboxStatus = async (
    message: InboxMessage,
    status: string,
    unreadCount: number,
  ) => {
    await runMutation(
      () =>
        updateInboxMessageStatus(message.id, {
          status,
          unread_count: unreadCount,
        }),
      status === "Resolvido"
        ? "Conversa marcada como resolvida."
        : "Conversa marcada para atendimento.",
    );
  };

  const handleSendInboxReply = async (
    message: InboxMessage,
    reply: string,
  ) => {
    if (!ownerId) return;

    await runMutation(
      () =>
        sendInboxReply(
          ownerId,
          message,
          reply,
          snapshot.profile?.nome ?? "Equipe comercial",
        ),
      "Resposta processada no inbox.",
    );
  };

  const handleCreateContactFromInbox = async (message: InboxMessage) => {
    if (!ownerId) return;

    await runMutation(
      async () => {
        const contact =
          findContactByPhone(message.telefone) ??
          (await createContact(ownerId, {
            nome: message.remetente_nome || "Contato sem nome",
            telefone: message.telefone,
            origem: message.canal || "WhatsApp",
            potencial: "Novo",
          }));

        await updateInboxConversationLinks(ownerId, message.telefone, {
          contact_id: contact.id,
          status: "Contato em atendimento",
          unread_count: 0,
        });
      },
      "Conversa vinculada ao contato.",
    );
  };

  const handleCreateLeadFromInbox = async (message: InboxMessage) => {
    if (!ownerId) return;

    await runMutation(
      async () => {
        const contact =
          findContactByPhone(message.telefone) ??
          (await createContact(ownerId, {
            nome: message.remetente_nome || "Contato sem nome",
            telefone: message.telefone,
            origem: message.canal || "WhatsApp",
            potencial: "Novo",
          }));
        const lead =
          findLeadByPhone(message.telefone) ??
          (await createLead(ownerId, {
            contact_id: contact.id,
            nome: contact.nome,
            telefone: contact.telefone,
            email: contact.email,
            interesse: message.mensagem.slice(0, 180),
            status: "em_atendimento",
            origem: message.canal || "WhatsApp",
            proxima_acao: "Responder e qualificar necessidade comercial",
          }));

        await updateInboxConversationLinks(ownerId, message.telefone, {
          contact_id: contact.id,
          lead_id: lead.id,
          status: "Lead em atendimento",
          unread_count: 0,
        });
      },
      "Lead criado e vinculado ao inbox.",
    );
  };

  const handleCreateOpportunityFromInbox = async (message: InboxMessage) => {
    if (!ownerId) return;

    await runMutation(
      async () => {
        const contact =
          findContactByPhone(message.telefone) ??
          (await createContact(ownerId, {
            nome: message.remetente_nome || "Contato sem nome",
            telefone: message.telefone,
            origem: message.canal || "WhatsApp",
            potencial: "Novo",
          }));
        const lead =
          findLeadByPhone(message.telefone) ??
          (await createLead(ownerId, {
            contact_id: contact.id,
            nome: contact.nome,
            telefone: contact.telefone,
            email: contact.email,
            interesse: message.mensagem.slice(0, 180),
            status: "em_atendimento",
            origem: message.canal || "WhatsApp",
            proxima_acao: "Responder e qualificar necessidade comercial",
          }));
        const opportunity = findOpportunityByLeadId(lead.id);

        if (!opportunity) {
          await createOpportunity(ownerId, {
            lead_id: lead.id,
            titulo: buildOpportunityTitleFromMessage(message, lead.nome),
            etapa: inferOpportunityStageFromMessage(message),
            valor: lead.valor_estimado,
            responsavel: snapshot.profile?.nome ?? "Equipe comercial",
            proxima_acao: buildOpportunityNextActionFromMessage(message),
          });
        }

        await updateInboxConversationLinks(ownerId, message.telefone, {
          contact_id: contact.id,
          lead_id: lead.id,
          status: opportunity ? "Oportunidade vinculada" : "Oportunidade aberta",
          unread_count: 0,
        });
      },
      "Oportunidade preparada no funil.",
    );
  };

  const handleConvertContact = async (contact: Contact) => {
    if (!ownerId) return;
    await runMutation(
      () => convertContactToLead(ownerId, contact),
      "Contato convertido em lead!",
    );
  };

  const handleCreateOpportunityFromLead = async (lead: Lead) => {
    if (!ownerId) return;
    const existingOpportunity = findOpportunityByLeadId(lead.id);
    if (existingOpportunity) {
      toast.success("Este lead ja tem oportunidade no funil.");
      return;
    }

    await runMutation(
      () =>
        createOpportunity(ownerId, {
          lead_id: lead.id,
          titulo: lead.nome,
          etapa: "Novo",
          valor: lead.valor_estimado,
          responsavel: snapshot.profile?.nome ?? "Equipe comercial",
          proxima_acao: lead.proxima_acao,
        }),
      "Oportunidade criada com sucesso!",
    );
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const opportunityId = active.id;
    const novaEtapa = over.id;

    queryClient.setQueryData(["crmSnapshot", session?.user?.id], (prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        opportunities: prev.opportunities.map((opp: any) =>
          opp.id === opportunityId ? { ...opp, etapa: novaEtapa } : opp,
        ),
      };
    });

    try {
      await updateOpportunityStage(opportunityId, novaEtapa);
      toast.success("Movido para " + novaEtapa);
    } catch (error) {
      toast.error("Erro ao mover");
      reloadData();
    }
  };

  if (isBooting) {
    return <LoadingScreen label="Preparando sua experiência..." />;
  }

  if (isPublicRoute) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/brandbook" element={<BrandbookPage />} />
      </Routes>
    );
  }

  if (!session || route === "login" || route === "cadastro") {
    if (route === "cadastro") {
      return <SignUpScreen authError={authError} onAuth={handleAuth} />;
    }
    return <LoginScreen authError={authError} onAuth={handleAuth} />;
  }

  return (
    <div className="shell">
      <Toaster position="bottom-right" />
      {session ? (
        <Sidebar
          navItems={visibleNavItems}
          route={route}
          onNavigate={(path) => navigate("/" + path)}
          onSignOut={handleSignOut}
        />
      ) : null}
      <main className="workspace">
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          profileName={
            snapshot.profile?.nome ?? session.user.email ?? "Usuário"
          }
          profileAvatar={snapshot.profile?.avatar_url}
          query={query}
          route={route}
          navItems={visibleNavItems}
          onQueryChange={setQuery}
          onSignOut={handleSignOut}
          onNavigate={(path) => navigate("/" + path)}
        />
        <section className="content">
          {crmError && (
            <div className="alert error" role="alert">
              {crmError}
            </div>
          )}
          {isLoadingData && (
            <div className="loading-strip">Atualizando dados do CRM...</div>
          )}
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/perfil"
              element={
                <ProfilePage
                  profile={snapshot.profile}
                  onProfileUpdated={reloadData}
                />
              }
            />
            <Route
              path="/dashboard"
              element={<Dashboard snapshot={snapshot} onOpenModal={openModal} />}
            />
            <Route
              path="/inbox"
              element={
                <InboxPage
                  channels={snapshot.channels}
                  contacts={snapshot.contacts}
                  isSaving={isSaving}
                  leads={snapshot.leads}
                  messages={snapshot.messages}
                  opportunities={snapshot.opportunities}
                  query={query}
                  onCreateContact={handleCreateContactFromInbox}
                  onCreateLead={handleCreateLeadFromInbox}
                  onCreateOpportunity={handleCreateOpportunityFromInbox}
                  onOpenModal={openModal}
                  onSendReply={handleSendInboxReply}
                  onUpdateChannelStatus={handleUpdateChannelStatus}
                  onUpdateMessageStatus={handleUpdateInboxStatus}
                />
              }
            />
            <Route
              path="/contatos"
              element={
                <ContactsPage
                  contacts={snapshot.contacts}
                  query={query}
                  isSaving={isSaving}
                  onConvertContact={handleConvertContact}
                  onEditContact={(contact) =>
                    openEditModal({ type: "contact", record: contact })
                  }
                  onOpenModal={openModal}
                />
              }
            />
            <Route
              path="/leads"
              element={
                <LeadsPage
                  isSaving={isSaving}
                  leads={snapshot.leads}
                  opportunities={snapshot.opportunities}
                  query={query}
                  onCreateOpportunity={handleCreateOpportunityFromLead}
                  onEditLead={(lead) =>
                    openEditModal({ type: "lead", record: lead })
                  }
                  onOpenModal={openModal}
                />
              }
            />
            <Route
              path="/funil"
              element={
                <PipelinePage
                  leads={snapshot.leads}
                  opportunities={snapshot.opportunities}
                  onEditOpportunity={(opportunity) =>
                    openEditModal({
                      type: "opportunity",
                      record: opportunity,
                    })
                  }
                  onOpenModal={openModal}
                  onDragEnd={handleDragEnd}
                />
              }
            />
            <Route path="/criativos" element={<CreativesPage />} />
            <Route path="/whatsapp" element={<WhatsappPage />} />
            <Route path="/oauth/meta" element={<MetaOAuthCallback />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </section>
      </main>

      {modal === "contact" && (
        <ContactModal
          contact={editing?.type === "contact" ? editing.record : undefined}
          isSaving={isSaving}
          onClose={closeModal}
          onSubmit={createContactFromForm}
        />
      )}
      {modal === "lead" && (
        <LeadModal
          isSaving={isSaving}
          lead={editing?.type === "lead" ? editing.record : undefined}
          onClose={closeModal}
          onSubmit={createLeadFromForm}
        />
      )}
      {modal === "opportunity" && (
        <OpportunityModal
          isSaving={isSaving}
          leads={snapshot.leads}
          opportunity={
            editing?.type === "opportunity" ? editing.record : undefined
          }
          onClose={closeModal}
          onSubmit={createOpportunityFromForm}
        />
      )}
      {modal === "message" && (
        <MessageModal
          isSaving={isSaving}
          onClose={closeModal}
          onSubmit={createMessageFromForm}
        />
      )}
      {modal === "channel" && (
        <ChannelModal
          isSaving={isSaving}
          onClose={closeModal}
          onSubmit={createChannelFromForm}
        />
      )}
    </div>
  );
}


function Sidebar({
  navItems,
  route,
  onNavigate,
  onSignOut,
}: {
  navItems: NavigationItem[];
  route: AppRoute;
  onNavigate: (id: AppRoute) => void;
  onSignOut: () => void;
}) {
  return (
    <aside className="sidebar">
      <button className="logo-button" onClick={() => onNavigate("dashboard")}>
        <div className="sidebar-header">
          <Logo iconSize={32} />
        </div>
      </button>

      <nav aria-label="Menu principal">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={route === item.id ? "active" : ""}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="health-pill">
          <ShieldCheck size={16} />
          Supabase ativo
        </div>
        <button onClick={onSignOut}>
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}

function Header({
  profileName,
  profileAvatar,
  query,
  route,
  theme,
  navItems,
  onQueryChange,
  onSignOut,
  onNavigate,
  toggleTheme,
}: {
  profileName: string;
  profileAvatar?: string | null;
  query: string;
  route: AppRoute;
  theme?: "light" | "dark";
  navItems: NavigationItem[];
  onQueryChange: (q: string) => void;
  onSignOut: () => void;
  onNavigate?: (id: AppRoute) => void;
  toggleTheme?: () => void;
}) {
  const title =
    navItems.find((item) => item.id === route)?.label ?? "Dashboard";
  const initials = profileName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{brandConfig.name}</p>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <label className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar..."
          />
        </label>

        {toggleTheme && (
          <button
            className="icon-button"
            aria-label="Alternar Tema"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        <button className="icon-button" aria-label="Notificações">
          <Bell size={18} />
        </button>
        <button 
          className="user-chip border border-transparent hover:border-primary/50 transition-colors p-0 overflow-hidden" 
          title={profileName}
          onClick={() => onNavigate?.("perfil")}
        >
          {profileAvatar ? (
            <img src={profileAvatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            initials || "FC"
          )}
        </button>
        <button className="icon-button" aria-label="Sair" onClick={onSignOut}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section aria-modal="true" className="modal-card" role="dialog">
        <header>
          <h2>{title}</h2>
          <button aria-label="Fechar" className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function ContactModal({
  contact,
  isSaving,
  onClose,
  onSubmit,
}: {
  contact?: Contact;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  return (
    <Modal title={contact ? "Editar contato" : "Novo contato"} onClose={onClose}>
      <EntityForm
        isSaving={isSaving}
        submitLabel={contact ? "Salvar alteracoes" : "Salvar contato"}
        onClose={onClose}
        onSubmit={onSubmit}
      >
        <TextField
          defaultValue={contact?.nome}
          label="Nome"
          name="nome"
          required
        />
        <TextField
          defaultValue={contact?.telefone}
          label="Telefone"
          name="telefone"
          placeholder="5511999999999"
          required
        />
        <TextField
          defaultValue={contact?.email}
          label="E-mail"
          name="email"
          type="email"
        />
        <TextField
          defaultValue={contact?.origem}
          label="Origem"
          name="origem"
          placeholder="WhatsApp, indicação, landing page..."
        />
        <TextField
          defaultValue={contact?.potencial}
          label="Potencial"
          name="potencial"
          placeholder="Novo, alto, médio..."
        />
      </EntityForm>
    </Modal>
  );
}

function LeadModal({
  isSaving,
  lead,
  onClose,
  onSubmit,
}: {
  isSaving: boolean;
  lead?: Lead;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  return (
    <Modal title={lead ? "Editar lead" : "Novo lead"} onClose={onClose}>
      <EntityForm
        isSaving={isSaving}
        submitLabel={lead ? "Salvar alteracoes" : "Salvar lead"}
        onClose={onClose}
        onSubmit={onSubmit}
      >
        <TextField defaultValue={lead?.nome} label="Nome" name="nome" required />
        <TextField
          defaultValue={lead?.telefone}
          label="Telefone"
          name="telefone"
          placeholder="5511999999999"
          required
        />
        <TextField
          defaultValue={lead?.email}
          label="E-mail"
          name="email"
          type="email"
        />
        <TextField
          defaultValue={lead?.interesse}
          label="Interesse"
          name="interesse"
          placeholder="Produto, serviço ou necessidade"
          required
        />
        <SelectField label="Status" name="status" defaultValue={lead?.status}>
          {leadStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </SelectField>
        <TextField
          defaultValue={lead?.origem}
          label="Origem"
          name="origem"
          placeholder="WhatsApp, Meta Ads, indicação..."
        />
        <TextField
          defaultValue={lead?.valor_estimado}
          label="Valor estimado"
          name="valor_estimado"
          type="number"
        />
        <TextField
          defaultValue={lead?.proxima_acao}
          label="Proxima acao"
          name="proxima_acao"
          placeholder="Realizar primeiro contato"
        />
      </EntityForm>
    </Modal>
  );
}

function OpportunityModal({
  isSaving,
  leads,
  opportunity,
  onClose,
  onSubmit,
}: {
  isSaving: boolean;
  leads: Lead[];
  opportunity?: Opportunity;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  return (
    <Modal
      title={opportunity ? "Editar oportunidade" : "Nova oportunidade"}
      onClose={onClose}
    >
      <EntityForm
        isSaving={isSaving}
        submitLabel={opportunity ? "Salvar alteracoes" : "Salvar oportunidade"}
        onClose={onClose}
        onSubmit={onSubmit}
      >
        <SelectField
          defaultValue={opportunity?.lead_id}
          label="Lead vinculado"
          name="lead_id"
        >
          <option value="">Sem vínculo</option>
          {leads.map((lead) => (
            <option key={lead.id} value={lead.id}>
              {lead.nome}
            </option>
          ))}
        </SelectField>
        <TextField
          defaultValue={opportunity?.titulo}
          label="Titulo"
          name="titulo"
          required
        />
        <SelectField
          defaultValue={opportunity?.etapa}
          label="Etapa"
          name="etapa"
        >
          {stages.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </SelectField>
        <TextField
          defaultValue={opportunity?.valor}
          label="Valor"
          name="valor"
          type="number"
        />
        <TextField
          defaultValue={opportunity?.responsavel}
          label="Responsavel"
          name="responsavel"
        />
        <TextField
          defaultValue={opportunity?.proxima_acao}
          label="Proxima acao"
          name="proxima_acao"
        />
      </EntityForm>
    </Modal>
  );
}

function MessageModal({
  isSaving,
  onClose,
  onSubmit,
}: {
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  return (
    <Modal title="Simular mensagem recebida" onClose={onClose}>
      <EntityForm
        isSaving={isSaving}
        submitLabel="Salvar mensagem"
        onClose={onClose}
        onSubmit={onSubmit}
      >
        <TextField label="Nome do remetente" name="remetente_nome" required />
        <TextField
          label="Telefone"
          name="telefone"
          placeholder="5511999999999"
          required
        />
        <TextField label="Status" name="status" placeholder="Novo lead" />
        <label className="field-wide">
          Mensagem
          <textarea
            name="mensagem"
            placeholder="Tenho interesse em conhecer a solução."
            required
          />
        </label>
      </EntityForm>
    </Modal>
  );
}


function ChannelModal({
  isSaving,
  onClose,
  onSubmit,
}: {
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  const [provider, setProvider] = useState("whatsapp");
  const [qrCodeStatus, setQrCodeStatus] = useState<"idle" | "generating" | "scanning" | "done">("idle");
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [generatedInstance, setGeneratedInstance] = useState<string | null>(null);

  const handleGenerateQrCode = async () => {
    if (!supabase) return;
    setQrCodeStatus("generating");
    try {
      const { data, error } = await supabase.functions.invoke("evolution-proxy", {
        body: { action: "create_instance" },
      });
      if (error || !data?.ok) throw error || new Error(data?.error || "Erro desconhecido");
      
      setQrCodeBase64(data.qrcode_base64);
      setGeneratedInstance(data.instance_name);
      setQrCodeStatus("scanning");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar QR Code. Verifique se o backend proxy está online e os Secrets configurados.");
      setQrCodeStatus("idle");
    }
  };

  const handleScanDone = () => {
    setQrCodeStatus("done");
  };

  return (
    <Modal title="Configurar canal de entrada" onClose={onClose}>
      <EntityForm
        isSaving={isSaving}
        submitLabel={provider === "evolution_api" && qrCodeStatus !== "done" ? "" : "Salvar canal"}
        onClose={onClose}
        onSubmit={async (formData) => {
          if (provider === "evolution_api") {
            if (qrCodeStatus !== "done" || !generatedInstance) {
              toast.error("Por favor, conclua o pareamento do QR Code primeiro.");
              return;
            }
            formData.set("instance_name", generatedInstance);
            formData.set("instance_token", "");
          }
          await onSubmit(formData);
        }}
      >
        <SelectField
          defaultValue="whatsapp"
          label="Tipo de canal"
          name="provider"
          onChange={(e) => {
            setProvider(e.target.value);
            setQrCodeStatus("idle");
          }}
        >
          <option value="whatsapp">WhatsApp Oficial (Cloud API)</option>
          <option value="evolution_api">WhatsApp QR Code (Evolution API)</option>
        </SelectField>
        <TextField
          label="Nome amigavel"
          name="nome"
          placeholder="WhatsApp Atendimento"
          required
        />
        <TextField
          label="Numero de entrada"
          name="numero"
          placeholder="5511999999999"
          required
        />
        
        {provider === "whatsapp" && (
          <TextField
            label="ID do numero na Meta"
            name="phone_number_id"
            placeholder="Opcional"
          />
        )}

        {provider === "evolution_api" && (
          <div className="qr-code-section" style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            {qrCodeStatus === "idle" && (
              <button 
                type="button" 
                className="secondary-button" 
                onClick={handleGenerateQrCode}
                style={{ width: "100%", justifyContent: "center" }}
              >
                <Sparkles size={16} /> Gerar QR Code de Conexão
              </button>
            )}

            {qrCodeStatus === "generating" && (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-primary)" }}>
                Conectando ao provedor de QR Code...
              </div>
            )}

            {qrCodeStatus === "scanning" && qrCodeBase64 && (
              <div style={{ textAlign: "center", padding: "1rem", background: "white", borderRadius: "8px" }}>
                <h4 style={{ marginBottom: "1rem", color: "#333" }}>Escaneie este código</h4>
                <img 
                  src={qrCodeBase64.startsWith("data:image") ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`} 
                  alt="WhatsApp QR Code" 
                  style={{ width: "250px", height: "250px", objectFit: "contain", margin: "0 auto", display: "block" }} 
                />
                <p style={{ fontSize: "14px", marginTop: "1rem", color: "#666" }}>
                  1. Abra o WhatsApp no seu celular<br />
                  2. Toque em <strong>Mais opções</strong> (Android) ou <strong>Configurações</strong> (iPhone)<br />
                  3. Toque em <strong>Aparelhos conectados</strong> {">"} <strong>Conectar um aparelho</strong>
                </p>
                <button 
                  type="button" 
                  className="primary-button" 
                  onClick={handleScanDone}
                  style={{ width: "100%", marginTop: "1.5rem" }}
                >
                  Já escaneei e conectei
                </button>
              </div>
            )}

            {qrCodeStatus === "done" && (
              <div className="alert success" style={{ background: "var(--color-success)", color: "white", padding: "1rem", borderRadius: "6px", textAlign: "center" }}>
                <CheckCircle2 size={24} style={{ margin: "0 auto 8px" }} />
                <p><strong>Aparelho Conectado!</strong></p>
                <small>Clique em "Salvar canal" abaixo para finalizar.</small>
              </div>
            )}
          </div>
        )}
      </EntityForm>
    </Modal>
  );
}

function EntityForm({
  children,
  isSaving,
  submitLabel,
  onClose,
  onSubmit,
}: {
  children: ReactNode;
  isSaving: boolean;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(new FormData(event.currentTarget));
  };

  return (
    <form className="entity-form" onSubmit={handleSubmit}>
      <div className="form-grid">{children}</div>
      <footer className="form-actions">
        <button className="secondary-button" onClick={onClose} type="button">
          Cancelar
        </button>
        <button className="primary-button" disabled={isSaving} type="submit">
          {isSaving ? "Salvando..." : submitLabel}
        </button>
      </footer>
    </form>
  );
}

function TextField({
  defaultValue,
  label,
  name,
  placeholder,
  required,
  type = "text",
}: {
  defaultValue?: string | number | null;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  const isPhone = name === "telefone";
  const isMoney = name === "valor_estimado" || name === "valor";
  const defaultText =
    defaultValue === null || defaultValue === undefined
      ? undefined
      : String(defaultValue);

  return (
    <label>
      {label}
      {isPhone ? (
        <IMaskInput
          defaultValue={defaultText}
          name={name}
          mask="(00) 00000-0000"
          placeholder={placeholder || "(11) 99999-9999"}
          required={required}
        />
      ) : isMoney ? (
        <IMaskInput
          defaultValue={defaultText}
          name={name}
          mask={Number}
          scale={0}
          thousandsSeparator="."
          normalizeZeros={true}
          padFractionalZeros={false}
          unmask={true}
          placeholder={placeholder || "R$ 0,00"}
          required={required}
        />
      ) : (
        <input
          defaultValue={defaultText}
          name={name}
          placeholder={placeholder}
          required={required}
          type={type}
        />
      )}
    </label>
  );
}

function SelectField({
  children,
  defaultValue,
  label,
  name,
  onChange,
}: {
  children: ReactNode;
  defaultValue?: string | null;
  label: string;
  name: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <label>
      {label}
      <select name={name} defaultValue={defaultValue ?? ""} onChange={onChange}>
        {children}
      </select>
    </label>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <main className="loading-state">
      <div className="brand-mark">
        <span />
        <strong>FC</strong>
      </div>
      <p>{label}</p>
    </main>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
