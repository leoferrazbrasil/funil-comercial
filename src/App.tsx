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
} from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
  const route = (
    location.pathname === "/" ? "dashboard" : location.pathname.slice(1)
  ) as AppRoute;
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
        navigate("/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
              data: { nome: email.split("@")[0] },
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
    return <LoadingScreen label="Conectando ao Supabase..." />;
  }

  if (!session || route === "login") {
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
          query={query}
          route={route}
          navItems={visibleNavItems}
          onQueryChange={setQuery}
          onSignOut={handleSignOut}
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

function LoginScreen({
  authError,
  onAuth,
}: {
  authError: string | null;
  onAuth: (
    email: string,
    password: string,
    mode: "login" | "signup",
  ) => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const mode = submitter?.value === "signup" ? "signup" : "login";
    setIsSubmitting(true);
    await onAuth(
      getFormValue(formData, "email"),
      getFormValue(formData, "password"),
      mode,
    );
    setIsSubmitting(false);
  };

  return (
    <main className="login-page">
      <section className="login-visual" aria-label="Funil Comercial">
        <img className="brand-logo brand-logo-login" src={brandConfig.logoPath} alt={brandConfig.name} />
        <p className="eyebrow">{brandConfig.login.eyebrow}</p>
        <h1>{brandConfig.login.headline}</h1>
        <p>{brandConfig.login.description}</p>
        <div className="login-proof-grid" aria-label="Fluxo principal do MVP">
          <span>
            <strong>WhatsApp</strong>
            <small>Conversas centralizadas</small>
          </span>
          <span>
            <strong>CRM</strong>
            <small>Contatos e leads conectados</small>
          </span>
          <span>
            <strong>Funil</strong>
            <small>Oportunidades em andamento</small>
          </span>
        </div>
        <div className="flow-line" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
      </section>

      <form
        className="login-card"
        aria-label="Entrar na plataforma"
        onSubmit={handleSubmit}
      >
        <div>
          <p className="eyebrow">Acesso ao MVP</p>
          <h2>Entrar na plataforma</h2>
          <p className="muted">
            Use uma conta cadastrada no Supabase para acessar o CRM.
          </p>
        </div>

        {!isSupabaseConfigured && (
          <p className="config-warning">
            Configure `VITE_SUPABASE_ANON_KEY` para ativar login, cadastro e
            dados reais.
          </p>
        )}

        {authError && (
          <p className="alert error" role="alert">
            {authError}
          </p>
        )}

        <label>
          E-mail corporativo
          <input
            name="email"
            placeholder="gestor@empresa.com.br"
            required
            type="email"
          />
        </label>
        <label>
          Senha
          <input
            minLength={6}
            name="password"
            placeholder="Mínimo 6 caracteres"
            required
            type="password"
          />
        </label>

        <button
          className="primary-button"
          disabled={!isSupabaseConfigured || isSubmitting}
          type="submit"
          value="login"
        >
          {isSubmitting ? "Entrando..." : "Entrar na plataforma"}{" "}
          <MoveRight size={18} />
        </button>

        <button
          className="secondary-button"
          disabled={!isSupabaseConfigured || isSubmitting}
          type="submit"
          value="signup"
        >
          Criar conta de teste
        </button>
      </form>
    </main>
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
        <img className="brand-logo" src={brandConfig.logoPath} alt="Logo" />
        <span>
          <strong>{brandConfig.name}</strong>
          <small>{brandConfig.category}</small>
        </span>
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
  query,
  route,
  theme,
  navItems,
  onQueryChange,
  onSignOut,
  toggleTheme,
}: {
  profileName: string;
  query: string;
  route: AppRoute;
  theme?: "light" | "dark";
  navItems: NavigationItem[];
  onQueryChange: (q: string) => void;
  onSignOut: () => void;
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
        <span className="user-chip" title={profileName}>
          {initials || "FC"}
        </span>
        <button className="icon-button" aria-label="Sair" onClick={onSignOut}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

function Dashboard({
  snapshot,
  onOpenModal,
}: {
  snapshot: CrmSnapshot;
  onOpenModal: (modal: ModalType) => void;
}) {
  const activeLeads = snapshot.leads.filter(
    (lead) => !["convertido", "perdido"].includes(lead.status),
  );
  const openPipeline = snapshot.opportunities
    .filter((item) => !["Ganho", "Perdido"].includes(item.etapa))
    .reduce((sum, item) => sum + Number(item.valor), 0);
  const conversionRate = snapshot.leads.length
    ? Math.round((snapshot.opportunities.length / snapshot.leads.length) * 100)
    : 0;
  const pendingMessages = snapshot.messages.filter(
    (message) => message.unread_count > 0 || message.status !== "Resolvido",
  );
  const recommendations = buildCommercialRecommendations(snapshot);

  return (
    <div className="page-stack">
      <HeroPanel
        action="Novo lead"
        description={brandConfig.dashboard.description}
        eyebrow={brandConfig.dashboard.eyebrow}
        title={brandConfig.dashboard.headline}
        onAction={() => onOpenModal("lead")}
      />

      <section className="metrics-grid">
        <MetricCard
          icon={UsersRound}
          label="Leads ativos"
          value={String(activeLeads.length)}
          hint="Leads não convertidos"
        />
        <MetricCard
          icon={MessageCircle}
          label="Conversas pendentes"
          value={String(pendingMessages.length)}
          hint="Inbox com ação necessária"
          tone={pendingMessages.length ? "warning" : "neutral"}
        />
        <MetricCard
          icon={CircleDollarSign}
          label="Pipeline aberto"
          value={formatMoney(openPipeline)}
          hint="Oportunidades em andamento"
        />
        <MetricCard
          icon={TrendingUp}
          label="Conversão base"
          value={`${conversionRate}%`}
          hint="Oportunidades sobre leads"
          tone="success"
        />
      </section>

      <section className="split-grid">
        <Panel title="Prioridades do dia" eyebrow="Ação comercial">
          <div className="action-list">
            {recommendations.map((recommendation) => (
              <ActionItem
                key={recommendation.id}
                description={recommendation.summary}
                priority={formatPriority(recommendation.priority)}
                title={recommendation.title}
              />
            ))}
            {recommendations.length === 0 && (
              <EmptyState
                action="Criar primeiro contato"
                description="Cadastre um contato ou lead para iniciar a operação."
                onAction={() => onOpenModal("contact")}
              />
            )}
          </div>
        </Panel>

        <Panel title="Funil resumido" eyebrow="Oportunidades">
          <div className="funnel-mini">
            {stages.slice(0, 6).map((stage) => {
              const count = snapshot.opportunities.filter(
                (item) => item.etapa === stage,
              ).length;
              return (
                <div key={stage}>
                  <span>{stage}</span>
                  <strong>{count}</strong>
                </div>
              );
            })}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function InboxPage({
  channels,
  contacts,
  isSaving,
  leads,
  messages,
  opportunities,
  query,
  onCreateContact,
  onCreateLead,
  onCreateOpportunity,
  onOpenModal,
  onSendReply,
  onUpdateChannelStatus,
  onUpdateMessageStatus,
}: {
  channels: IntegrationChannel[];
  contacts: Contact[];
  isSaving: boolean;
  leads: Lead[];
  messages: InboxMessage[];
  opportunities: Opportunity[];
  query: string;
  onCreateContact: (message: InboxMessage) => Promise<void>;
  onCreateLead: (message: InboxMessage) => Promise<void>;
  onCreateOpportunity: (message: InboxMessage) => Promise<void>;
  onOpenModal: (modal: ModalType) => void;
  onSendReply: (message: InboxMessage, reply: string) => Promise<void>;
  onUpdateChannelStatus: (
    channel: IntegrationChannel,
    status: IntegrationChannel["status"],
  ) => Promise<void>;
  onUpdateMessageStatus: (
    message: InboxMessage,
    status: string,
    unreadCount: number,
  ) => Promise<void>;
}) {
  const filteredMessages = messages.filter((message) =>
    matchesQuery(query, [
      message.remetente_nome,
      message.telefone,
      message.mensagem,
      message.status,
    ]),
  );
  const conversations = useMemo(() => {
    const grouped = new Map<string, InboxMessage[]>();

    for (const message of filteredMessages) {
      const key = message.telefone || message.id;
      grouped.set(key, [...(grouped.get(key) ?? []), message]);
    }

    return Array.from(grouped.entries())
      .map(([key, conversationMessages]) => {
        const sortedMessages = [...conversationMessages].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        const latest = sortedMessages[sortedMessages.length - 1];
        const latestInbound =
          [...sortedMessages].reverse().find((item) => item.direction === "inbound") ??
          latest;

        return {
          key,
          latest,
          latestInbound,
          messages: sortedMessages,
          unreadCount: sortedMessages.reduce(
            (sum, item) => sum + Number(item.unread_count || 0),
            0,
          ),
        };
      })
      .sort(
        (a, b) =>
          new Date(b.latest.created_at).getTime() -
          new Date(a.latest.created_at).getTime(),
      );
  }, [filteredMessages]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const activeChannels = channels.filter((channel) => channel.status === "ativo");
  const selectedConversation =
    conversations.find((conversation) => conversation.key === selectedKey) ??
    conversations[0];
  const selected = selectedConversation?.latest;
  const sourceMessage = selectedConversation?.latestInbound;
  const recommendation = selectedConversation
    ? buildInboxRecommendation(selectedConversation.latestInbound)
    : undefined;
  const sourcePhone = sourceMessage?.telefone ?? selected?.telefone ?? "";
  const conversationContactId =
    selectedConversation?.messages.find((message) => message.contact_id)
      ?.contact_id ?? null;
  const conversationLeadId =
    selectedConversation?.messages.find((message) => message.lead_id)
      ?.lead_id ?? null;
  const contactByPhone = contacts.find(
    (contact) => normalizePhone(contact.telefone) === normalizePhone(sourcePhone),
  );
  const leadByPhone = leads.find(
    (lead) => normalizePhone(lead.telefone) === normalizePhone(sourcePhone),
  );
  const linkedContact =
    contacts.find((contact) => contact.id === conversationContactId) ??
    contactByPhone;
  const linkedLead =
    leads.find((lead) => lead.id === conversationLeadId) ?? leadByPhone;
  const linkedOpportunity = linkedLead
    ? opportunities.find((opportunity) => opportunity.lead_id === linkedLead.id)
    : undefined;
  const conversationHasContactLink = Boolean(conversationContactId);
  const conversationHasLeadLink = Boolean(conversationLeadId);
  const conversationHasOpportunityReady = Boolean(
    conversationHasLeadLink && linkedOpportunity,
  );
  const contactActionLabel = conversationHasContactLink
    ? "Contato vinculado"
    : linkedContact
      ? "Vincular contato"
      : "Criar contato";
  const leadActionLabel = conversationHasLeadLink
    ? "Lead vinculado"
    : linkedLead
      ? "Vincular lead"
      : "Criar lead";
  const opportunityActionLabel = conversationHasOpportunityReady
    ? "Oportunidade aberta"
    : linkedOpportunity
      ? "Vincular oportunidade"
      : "Criar oportunidade";
  const crmBridgeTitle = linkedLead
    ? `Lead: ${linkedLead.nome}`
    : linkedContact
      ? `Contato: ${linkedContact.nome}`
      : "Ainda sem registro CRM";
  const crmBridgeDescription = conversationHasOpportunityReady
    ? `Oportunidade em ${linkedOpportunity?.etapa} no funil.`
    : conversationHasLeadLink
    ? "Esta conversa ja alimenta um lead do funil."
    : conversationHasContactLink
      ? "Contato vinculado. Crie ou vincule um lead quando houver interesse claro."
      : linkedLead || linkedContact
        ? "Encontramos um registro com este telefone. Vincule para manter o historico unido."
        : "Crie um contato ou lead com os dados da conversa.";

  useEffect(() => {
    setReplyText(recommendation?.suggestedReply ?? "");
  }, [selectedConversation?.key, recommendation?.suggestedReply]);

  const handleReplySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sourceMessage || !replyText.trim()) return;

    await onSendReply(sourceMessage, replyText.trim());
    setReplyText("");
  };

  return (
    <div className="page-stack">
      <HeroPanel
        action="Simular entrada"
        description="O inbox centraliza conversas vindas do WhatsApp e prepara o lead para o funil."
        eyebrow="WhatsApp comercial"
        title="Converse, qualifique e transforme mensagens em oportunidades."
        onAction={() => onOpenModal("message")}
      />

      <Panel title="Canais de entrada" eyebrow="Mensagens">
        {channels.length === 0 ? (
          <EmptyState
            action="Configurar canal"
            description="Cadastre o numero que recebe mensagens para separar cada entrada no CRM."
            onAction={() => onOpenModal("channel")}
          />
        ) : (
          <div className="channel-list">
            {channels.map((channel) => (
              <article className="channel-item" key={channel.id}>
                <MessageCircle size={18} />
                <div>
                  <strong>{channel.nome}</strong>
                  <p>
                    {formatProviderName(channel.provider)} · {channel.numero}
                  </p>
                </div>
                <span className={`channel-status ${channel.status}`}>
                  {channel.status}
                </span>
                <button
                  className="table-action"
                  disabled={isSaving}
                  onClick={() =>
                    onUpdateChannelStatus(
                      channel,
                      channel.status === "ativo" ? "pausado" : "ativo",
                    )
                  }
                  type="button"
                >
                  {channel.status === "ativo" ? "Pausar" : "Ativar"}
                </button>
              </article>
            ))}
            <button
              className="secondary-button channel-add-button"
              onClick={() => onOpenModal("channel")}
              type="button"
            >
              <Plus size={16} />
              Adicionar canal
            </button>
          </div>
        )}
      </Panel>

      {activeChannels.length === 0 && channels.length > 0 && (
        <div className="alert warning" role="status">
          Nenhum canal ativo para receber mensagens reais.
        </div>
      )}

      {conversations.length === 0 ? (
        <EmptyState
          action="Criar mensagem de teste"
          description="Nenhuma conversa encontrada para esta conta."
          onAction={() => onOpenModal("message")}
        />
      ) : (
        <section className="inbox-layout">
          <Panel title="Conversas" eyebrow="Entrada">
            <div className="conversation-list">
              {conversations.map((conversation) => (
                <button
                  key={conversation.key}
                  className={
                    selectedConversation?.key === conversation.key
                      ? "selected conversation-item"
                      : "conversation-item"
                  }
                  onClick={() => setSelectedKey(conversation.key)}
                >
                  <span>
                    <strong>{conversation.latestInbound.remetente_nome}</strong>
                    <small>{conversation.latest.mensagem}</small>
                  </span>
                  <em>
                    <span>{conversation.latest.status}</span>
                    <small>
                      {conversation.unreadCount
                        ? `${conversation.unreadCount} nova`
                        : `${conversation.messages.length} mensagem`}
                    </small>
                  </em>
                </button>
              ))}
            </div>
          </Panel>

          <Panel
            title={sourceMessage?.remetente_nome ?? selected?.remetente_nome ?? "Conversa"}
            eyebrow={selected?.status ?? "Atendimento"}
          >
            {recommendation && (
              <div className="inbox-recommendation">
                <span>Prioridade {recommendation.priority}</span>
                <strong>{recommendation.nextAction}</strong>
                <p>{recommendation.suggestedReply}</p>
              </div>
            )}
            <div className="inbox-crm-bridge">
              <div>
                <span>Registro CRM</span>
                <strong>{crmBridgeTitle}</strong>
                <p>{crmBridgeDescription}</p>
              </div>
              <div className="inbox-bridge-actions">
                <button
                  className="secondary-button"
                  disabled={
                    isSaving || !sourceMessage || conversationHasContactLink
                  }
                  onClick={() => sourceMessage && onCreateContact(sourceMessage)}
                  type="button"
                >
                  <UsersRound size={16} />
                  {contactActionLabel}
                </button>
                <button
                  className="primary-button"
                  disabled={isSaving || !sourceMessage || conversationHasLeadLink}
                  onClick={() => sourceMessage && onCreateLead(sourceMessage)}
                  type="button"
                >
                  <Target size={16} />
                  {leadActionLabel}
                </button>
                <button
                  className="primary-button"
                  disabled={
                    isSaving || !sourceMessage || conversationHasOpportunityReady
                  }
                  onClick={() =>
                    sourceMessage && onCreateOpportunity(sourceMessage)
                  }
                  type="button"
                >
                  <CircleDollarSign size={16} />
                  {opportunityActionLabel}
                </button>
              </div>
            </div>
            <div className="chat-window">
              {selectedConversation.messages.map((message) => (
                <p className={`message ${message.direction}`} key={message.id}>
                  <small>{message.remetente_nome}</small>
                  {message.mensagem}
                </p>
              ))}
            </div>
            <div className="inbox-actions">
              <button
                className="secondary-button"
                disabled={isSaving}
                onClick={() =>
                  sourceMessage &&
                  onUpdateMessageStatus(sourceMessage, "Em atendimento", 1)
                }
                type="button"
              >
                <RotateCcw size={16} />
                Marcar em atendimento
              </button>
              <button
                className="primary-button"
                disabled={isSaving}
                onClick={() =>
                  sourceMessage && onUpdateMessageStatus(sourceMessage, "Resolvido", 0)
                }
                type="button"
              >
                <CheckCircle2 size={16} />
                Marcar resolvida
              </button>
            </div>
            <form className="composer" onSubmit={handleReplySubmit}>
              <input
                aria-label="Resposta"
                onChange={(event) => setReplyText(event.target.value)}
                placeholder="Escreva uma resposta..."
                value={replyText}
              />
              <button
                className="primary-button"
                disabled={isSaving || !replyText.trim()}
                type="submit"
              >
                <Send size={16} />
                Registrar resposta
              </button>
            </form>
          </Panel>
        </section>
      )}
    </div>
  );
}

function ContactsPage({
  contacts,
  query,
  isSaving,
  onConvertContact,
  onEditContact,
  onOpenModal,
}: {
  contacts: Contact[];
  query: string;
  isSaving: boolean;
  onConvertContact: (contact: Contact) => Promise<void>;
  onEditContact: (contact: Contact) => void;
  onOpenModal: (modal: ModalType) => void;
}) {
  const filteredContacts = contacts.filter((contact) =>
    matchesQuery(query, [
      contact.nome,
      contact.telefone,
      contact.email,
      contact.origem,
      contact.potencial,
    ]),
  );

  return (
    <div className="page-stack">
      <PageIntro
        action="Novo contato"
        description="Cadastre, organize e encontre rapidamente pessoas e empresas que podem virar leads."
        eyebrow="Base comercial"
        title="Contatos"
        onAction={() => onOpenModal("contact")}
      />
      <TablePanel
        emptyAction={() => onOpenModal("contact")}
        emptyLabel="Cadastrar contato"
        isEmpty={filteredContacts.length === 0}
      >
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Origem</th>
              <th>Potencial</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.nome}</td>
                <td>{contact.telefone}</td>
                <td>{contact.origem}</td>
                <td>{contact.potencial}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="table-action"
                      onClick={() => onEditContact(contact)}
                      type="button"
                    >
                      <Pencil size={14} />
                      Editar
                    </button>
                    <button
                      className="table-action"
                      disabled={isSaving}
                      onClick={() => onConvertContact(contact)}
                      type="button"
                    >
                      Converter em lead
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TablePanel>
    </div>
  );
}

function LeadsPage({
  leads,
  opportunities,
  query,
  isSaving,
  onCreateOpportunity,
  onEditLead,
  onOpenModal,
}: {
  leads: Lead[];
  opportunities: Opportunity[];
  query: string;
  isSaving: boolean;
  onCreateOpportunity: (lead: Lead) => Promise<void>;
  onEditLead: (lead: Lead) => void;
  onOpenModal: (modal: ModalType) => void;
}) {
  const filteredLeads = leads.filter((lead) =>
    matchesQuery(query, [
      lead.nome,
      lead.telefone,
      lead.email,
      lead.interesse,
      lead.status,
      lead.origem,
    ]),
  );
  const activeLeads = filteredLeads.filter(isActiveLead);
  const opportunityByLeadId = new Map(
    opportunities
      .filter((opportunity) => opportunity.lead_id)
      .map((opportunity) => [opportunity.lead_id, opportunity]),
  );
  const leadQualifications = filteredLeads.map(buildLeadQualification);
  const qualifiedLeads = leadQualifications.filter(
    (qualification) =>
      qualification.score >= 80 &&
      !opportunityByLeadId.has(qualification.lead.id),
  );
  const incompleteQualifications = leadQualifications.filter(
    (qualification) => qualification.missingFields.length > 0,
  );
  const leadsWithOpportunity = filteredLeads.filter((lead) =>
    opportunityByLeadId.has(lead.id),
  );
  const qualificationRisks = incompleteQualifications
    .sort((a, b) => a.score - b.score)
    .slice(0, 4);

  return (
    <div className="page-stack">
      <PageIntro
        action="Novo lead"
        description="Acompanhe interessados, próximos passos e conversões para oportunidade."
        eyebrow="Qualificação"
        title="Leads"
        onAction={() => onOpenModal("lead")}
      />
      <section className="lead-health-grid" aria-label="Qualificacao de leads">
        <PipelineSignalCard
          icon={UsersRound}
          label="Leads ativos"
          value={String(activeLeads.length)}
          hint="Ainda em atendimento ou qualificacao"
          tone="success"
        />
        <PipelineSignalCard
          icon={Target}
          label="Prontos"
          value={String(qualifiedLeads.length)}
          hint="Com dados suficientes e sem oportunidade"
          tone={qualifiedLeads.length ? "success" : "neutral"}
        />
        <PipelineSignalCard
          icon={CircleDollarSign}
          label="No funil"
          value={String(leadsWithOpportunity.length)}
          hint="Ja conectados a oportunidades"
        />
        <PipelineSignalCard
          icon={Clock3}
          label="Com pendencias"
          value={String(incompleteQualifications.length)}
          hint="Precisam de dados antes da conversao"
          tone={incompleteQualifications.length ? "warning" : "success"}
        />
      </section>
      {qualificationRisks.length > 0 && (
        <Panel title="Qualificacao pendente" eyebrow="Proximas acoes">
          <div className="lead-risk-list">
            {qualificationRisks.map((qualification) => (
              <article className="lead-risk-item" key={qualification.id}>
                <div>
                  <strong>{qualification.lead.nome}</strong>
                  <p>{qualification.nextAction}</p>
                  <small>
                    Faltando: {qualification.missingFields.join(", ")}
                  </small>
                </div>
                <span>{qualification.score}%</span>
                <button
                  className="table-action"
                  onClick={() => onEditLead(qualification.lead)}
                  type="button"
                >
                  <Pencil size={14} />
                  Completar
                </button>
              </article>
            ))}
          </div>
        </Panel>
      )}
      {filteredLeads.length === 0 ? (
        <EmptyState
          action="Cadastrar lead"
          description="Nenhum lead encontrado para esta conta."
          onAction={() => onOpenModal("lead")}
        />
      ) : (
        <div className="lead-grid">
          {filteredLeads.map((lead) => (
            <article className="lead-card" key={lead.id}>
              {(() => {
                const qualification = buildLeadQualification(lead);
                const opportunity = opportunityByLeadId.get(lead.id);
                return (
                  <div className="lead-card-topline">
                    <span className={`status-badge ${lead.status}`}>
                      {lead.status.replace("_", " ")}
                    </span>
                    <small>{qualification.score}% qualificado</small>
                    {opportunity && <small>{opportunity.etapa}</small>}
                  </div>
                );
              })()}
              <h3>{lead.nome}</h3>
              <p>{lead.interesse}</p>
              <div className="lead-card-meta">
                <strong>{formatMoney(Number(lead.valor_estimado))}</strong>
                <small>{lead.origem}</small>
              </div>
              <footer>
                <Clock3 size={16} />
                {lead.proxima_acao}
              </footer>
              <div className="card-actions">
                <button
                  className="secondary-button"
                  onClick={() => onEditLead(lead)}
                  type="button"
                >
                  <Pencil size={16} />
                  Editar
                </button>
                <button
                  className="secondary-button"
                  disabled={isSaving || opportunityByLeadId.has(lead.id)}
                  onClick={() => onCreateOpportunity(lead)}
                  type="button"
                >
                  {opportunityByLeadId.has(lead.id)
                    ? "No funil"
                    : "Criar oportunidade"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function PipelineCard({
  item,
  onEdit,
}: {
  item: Opportunity;
  onEdit: (opportunity: Opportunity) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: { item },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      }
    : undefined;

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="opportunity-card"
    >
      <h3>{item.titulo}</h3>
      <strong>{formatMoney(Number(item.valor))}</strong>
      <p>{item.proxima_acao}</p>
      <footer className="opportunity-card-footer">
        <small>{item.responsavel}</small>
        <button
          className="table-action"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(item);
          }}
          onPointerDown={(event) => event.stopPropagation()}
          type="button"
        >
          <Pencil size={14} />
          Editar
        </button>
      </footer>
    </article>
  );
}

function PipelineColumn({ column }: { column: any }) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.stage,
  });

  return (
    <div
      ref={setNodeRef}
      className={`pipeline-column ${isOver ? "column-over" : ""}`}
      style={{ backgroundColor: isOver ? "var(--color-muted)" : undefined }}
    >
      <header>
        <span>{column.stage}</span>
        <strong>{column.items.length}</strong>
      </header>
      <div className="pipeline-items">
        {column.items.map((item: any) => (
          <PipelineCard key={item.id} item={item} onEdit={column.onEdit} />
        ))}
        {column.items.length === 0 && (
          <p className="empty-column">Solte aqui.</p>
        )}
      </div>
    </div>
  );
}

function PipelineSignalCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "neutral",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tone?: "neutral" | "warning" | "success";
}) {
  return (
    <article className={`pipeline-signal-card ${tone}`}>
      <Icon size={19} />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
    </article>
  );
}

function PipelineRiskItem({
  risk,
  onEdit,
}: {
  risk: PipelineRisk;
  onEdit: (opportunity: Opportunity) => void;
}) {
  return (
    <article className="pipeline-risk-item">
      <Target size={18} />
      <div>
        <strong>{risk.opportunity.titulo}</strong>
        <p>{risk.reason}</p>
        <small>{risk.nextAction}</small>
      </div>
      <span>{risk.priority}</span>
      <button
        className="table-action"
        onClick={() => onEdit(risk.opportunity)}
        type="button"
      >
        <Pencil size={14} />
        Ajustar
      </button>
    </article>
  );
}

function PipelinePage({
  leads,
  opportunities,
  onEditOpportunity,
  onOpenModal,
  onDragEnd,
}: {
  leads: Lead[];
  opportunities: CrmSnapshot["opportunities"];
  onEditOpportunity: (opportunity: Opportunity) => void;
  onOpenModal: (modal: ModalType) => void;
  onDragEnd: (event: any) => void;
}) {
  const grouped = useMemo(
    () =>
      stages.map((stage) => ({
        stage,
        items: opportunities.filter((item) => item.etapa === stage),
        onEdit: onEditOpportunity,
      })),
    [onEditOpportunity, opportunities],
  );
  const openOpportunities = opportunities.filter(isOpenOpportunity);
  const weakActionCount = openOpportunities.filter(isWeakNextAction).length;
  const noValueCount = openOpportunities.filter(
    (opportunity) => Number(opportunity.valor) <= 0,
  ).length;
  const closingCount = openOpportunities.filter(isClosingStage).length;
  const openValue = openOpportunities.reduce(
    (sum, opportunity) => sum + Number(opportunity.valor),
    0,
  );
  const pipelineRisks = buildPipelineRisks(opportunities);

  return (
    <div className="page-stack">
      <PageIntro
        action="Nova oportunidade"
        description="Visualize oportunidades por etapa e mantenha sempre uma próxima ação definida. Arraste os cards para mover."
        eyebrow="Pipeline"
        title="Funil de vendas"
        onAction={() => onOpenModal(leads.length ? "opportunity" : "lead")}
      />

      <section className="pipeline-health-grid" aria-label="Saude do funil">
        <PipelineSignalCard
          icon={TrendingUp}
          label="Pipeline aberto"
          value={formatMoney(openValue)}
          hint={`${openOpportunities.length} oportunidade(s) em andamento`}
          tone="success"
        />
        <PipelineSignalCard
          icon={Clock3}
          label="Sem proxima acao"
          value={String(weakActionCount)}
          hint="Precisam de compromisso claro"
          tone={weakActionCount ? "warning" : "success"}
        />
        <PipelineSignalCard
          icon={CircleDollarSign}
          label="Sem valor"
          value={String(noValueCount)}
          hint="Afetam previsao comercial"
          tone={noValueCount ? "warning" : "success"}
        />
        <PipelineSignalCard
          icon={Target}
          label="Etapas finais"
          value={String(closingCount)}
          hint="Proposta ou negociacao"
        />
      </section>

      <Panel title="Higiene do funil" eyebrow="Riscos operacionais">
        {pipelineRisks.length ? (
          <div className="pipeline-risk-list">
            {pipelineRisks.map((risk) => (
              <PipelineRiskItem
                key={risk.id}
                risk={risk}
                onEdit={onEditOpportunity}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            action="Nova oportunidade"
            description="Nenhum risco operacional detectado no funil aberto."
            onAction={() => onOpenModal(leads.length ? "opportunity" : "lead")}
          />
        )}
      </Panel>

      <DndContext onDragEnd={onDragEnd}>
        <section className="pipeline-board" aria-label="Funil de vendas">
          {grouped.map((column) => (
            <PipelineColumn key={column.stage} column={column} />
          ))}
        </section>
      </DndContext>
    </div>
  );
}

function HeroPanel({
  eyebrow,
  title,
  description,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <section className="hero-panel">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <button className="secondary-button" onClick={onAction}>
        <Sparkles size={17} />
        {action}
      </button>
    </section>
  );
}

function PageIntro({
  eyebrow,
  title,
  description,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <section className="page-intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <button className="primary-button" onClick={onAction}>
        <Plus size={17} />
        {action}
      </button>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "neutral",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tone?: "neutral" | "warning" | "success";
}) {
  return (
    <article className={`metric-card ${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
      <Icon size={22} />
    </article>
  );
}

function Panel({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <section className="panel">
      <header>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </header>
      {children}
    </section>
  );
}

function ActionItem({
  title,
  description,
  priority,
}: {
  title: string;
  description: string;
  priority: string;
}) {
  return (
    <article className="action-item">
      <Target size={18} />
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <span>{priority}</span>
    </article>
  );
}

function TablePanel({
  children,
  emptyAction,
  emptyLabel,
  isEmpty,
}: {
  children: ReactNode;
  emptyAction: () => void;
  emptyLabel: string;
  isEmpty: boolean;
}) {
  return (
    <section className="table-panel">
      {isEmpty ? (
        <EmptyState
          action={emptyLabel}
          description="Nenhum registro encontrado. Comece criando o primeiro item."
          onAction={emptyAction}
        />
      ) : (
        <div className="table-scroll">{children}</div>
      )}
    </section>
  );
}

function EmptyState({
  action,
  description,
  onAction,
}: {
  action: string;
  description: string;
  onAction: () => void;
}) {
  return (
    <div className="empty-state">
      <p>{description}</p>
      <button className="secondary-button" onClick={onAction}>
        <Plus size={16} />
        {action}
      </button>
    </div>
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
}: {
  children: ReactNode;
  defaultValue?: string | null;
  label: string;
  name: string;
}) {
  return (
    <label>
      {label}
      <select name={name} defaultValue={defaultValue ?? ""}>
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
