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
  Settings as SettingsIcon,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { Toaster, toast } from "react-hot-toast";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { IMaskInput } from "react-imask";
import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
  Link,
} from "react-router";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
const LandingPage = lazy(() => import("./pages/Landing"));
const CrmLandingPage = lazy(() => import("./pages/CrmLanding"));
const BrandbookPage = lazy(() => import("./pages/Brandbook"));
const LocalBusinessWebsiteLanding = lazy(() => import("./pages/LocalBusinessWebsiteLanding"));
const SalesStructureDiagnosticLanding = lazy(() => import("./pages/SalesStructureDiagnosticLanding"));
const GoogleBusinessProfileLanding = lazy(() => import("./pages/GoogleBusinessProfileLanding"));
const PaidTrafficLocalBusinessLanding = lazy(() => import("./pages/PaidTrafficLocalBusinessLanding"));
const CrmWhatsappLanding = lazy(() => import("./pages/CrmWhatsappLanding"));

const NutritionistWebsiteLanding = lazy(() => import("./pages/NutritionistWebsiteLanding"));
const PsychologistWebsiteLanding = lazy(() => import("./pages/PsychologistWebsiteLanding"));
const LocalCityLanding = lazy(() => import("./pages/LocalCityLanding"));
const CitiesDirectory = lazy(() => import("./pages/CitiesDirectory"));
const ConsultoriaLanding = lazy(() => import("./pages/ConsultoriaLanding"));
const ContactPage = lazy(() => import("./pages/Contact"));
import { AnnouncementBar } from "./components/AnnouncementBar";
import { SeoHead } from "./components/SeoHead";
import { CookieBanner } from "./components/CookieBanner";
import { useUtmTracking } from "./hooks/useUtmTracking";
const BlogIndex = lazy(() => import("./pages/BlogIndex"));
const LpNutricionistas = lazy(() => import("./pages/LpNutricionistas"));
const LpPsicologas = lazy(() => import("./pages/LpPsicologas"));
const LpDentistas = lazy(() => import("./pages/LpDentistas"));
const LpTerapeutas = lazy(() => import("./pages/LpTerapeutas"));
const LpMassoterapeutas = lazy(() => import("./pages/LpMassoterapeutas"));
const LpAdvogados = lazy(() => import("./pages/LpAdvogados"));
const LpArquitetos = lazy(() => import("./pages/LpArquitetos"));
const LpContabilidade = lazy(() => import("./pages/LpContabilidade"));
const LpEstetica = lazy(() => import("./pages/LpEstetica"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const GlossarioIndex = lazy(() => import("./pages/GlossarioIndex"));
const GlossarioTermo = lazy(() => import("./pages/GlossarioTermo"));
const ProgrammaticBlogPost = lazy(() => import("./pages/ProgrammaticBlogPost"));
const ProgrammaticIntentLanding = lazy(() => import("./pages/ProgrammaticIntentLanding"));
const PrivacyPage = lazy(() => import("./pages/LegalPages").then(module => ({ default: module.PrivacyPage })));
const TermsPage = lazy(() => import("./pages/LegalPages").then(module => ({ default: module.TermsPage })));
const DataDeletionPage = lazy(() => import("./pages/LegalPages").then(module => ({ default: module.DataDeletionPage })));
const SignUpScreen = lazy(() => import("./pages/SignUp"));
const LoginScreen = lazy(() => import("./pages/Login"));
const PipelinePage = lazy(() => import("./pages/Pipeline"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const EditorialPlannerPage = lazy(() => import("./pages/EditorialPlanner"));
const AggregatorsAdminPage = lazy(() => import("./pages/AggregatorsAdmin"));
const PieceStudioPage = lazy(() => import("./pages/PieceStudio"));
import Logo from "./components/Logo";
import {
  convertContactToLead,
  createContact,
  createInboxMessage,
  createIntegrationChannel,
  createLead,
  createOpportunity,
  deleteContact,
  deleteLead,
  deleteOpportunity,
  markInboxConversationRead,
  getApprovedWhatsAppTemplates,
  sendInboxReply,
  sendInboxTemplate,
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
import { PRODUCTS, inferProductFromMessage, priceForProduct } from "./lib/products";
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
const Dashboard = lazy(() => import("./pages/Dashboard"));
const InboxPage = lazy(() => import("./pages/Inbox"));
const ContactsPage = lazy(() => import("./pages/Contacts"));
const LeadsPage = lazy(() => import("./pages/Leads"));
const CreativesPage = lazy(() => import("./pages/Creatives"));
const CampaignsPage = lazy(() => import("./pages/Campaigns"));
const MetaOAuthCallback = lazy(() => import("./pages/MetaOAuthCallback"));
const InstagramOAuthCallback = lazy(() => import("./pages/InstagramOAuthCallback"));
const WhatsappPage = lazy(() => import("./pages/Whatsapp"));
const LinkAggregatorPage = lazy(() => import("./pages/LinkAggregator"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPassword"));
const ProspectingPreviewPage = lazy(() => import("./pages/ProspectingPreview"));
import {
  isProspectingPreviewPath,
  normalizePublicPath,
} from "./lib/prospectingPreviews";

type ModalType = "contact" | "lead" | "opportunity" | "message" | "channel";
type EditingTarget =
  | { type: "contact"; record: Contact }
  | { type: "lead"; record: Lead }
  | { type: "opportunity"; record: Opportunity };

const navItems = navigationItems;

// Rotas acessíveis SEM autenticação (o rastreador da Meta e visitantes não logados
// precisam abri-las). Usada tanto no gate de render quanto no guard de auth que
// redireciona para /login — manter as duas em sincronia evita o bug de páginas
// públicas caírem no login.
const PUBLIC_PATHS = [
  "/",
  "/cidades-atendidas",
  "/consultoria",
  "/contato",
  "/blog",
  "/glossario",
  "/crm",
  "/brandbook",
  "/site-para-negocios-locais",
  "/diagnostico-estrutura-de-vendas",
  "/google-meu-negocio",
  "/trafego-pago-negocios-locais",
  "/crm-whatsapp-organizado",
  "/site-para-dentistas",
  "/site-para-nutricionistas",
  "/estrutura-de-vendas-para-nutricionistas",
  "/estrutura-de-vendas-para-psicologas",
  "/estrutura-de-vendas-para-dentistas",
  "/estrutura-de-vendas-para-terapeutas",
  "/estrutura-de-vendas-para-massoterapeutas",
  "/estrutura-de-vendas-para-advogados",
  "/estrutura-de-vendas-para-arquitetos",
  "/estrutura-de-vendas-para-contabilidade",
  "/estrutura-de-vendas-para-estetica",
  "/site-para-psicologas",
  "/privacidade",
  "/termos",
  "/exclusao-de-dados",
  "/redefinir-senha",
];

// Pública: match exato (com normalização), agregador de links (/l/:slug — bio/produto)
// ou preview de prospecção, ou rotas locais programáticas (/local/...).
const isPublicPath = (pathname: string) =>
  PUBLIC_PATHS.includes(normalizePublicPath(pathname)) ||
  pathname.startsWith("/l/") ||
  pathname.startsWith("/local/") ||
  pathname.startsWith("/blog/") ||
  pathname.startsWith("/glossario/") ||
  pathname.startsWith("/agencia-de-marketing/") ||
  pathname.startsWith("/empresa-de-captacao/") ||
  pathname.startsWith("/melhor-crm/") ||
  isProspectingPreviewPath(pathname);

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
  conversationStates: [],
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

// Chave de COMPARAÇÃO de telefone (não de armazenamento): unifica com/sem o 9º
// dígito e com/sem DDI 55, para casar contatos independentemente do formato salvo
// (o contato guarda o número real com o 9; mensagens/wa_id podem vir sem o 9).
const phoneMatchKey = (value: string | null | undefined) => {
  let p = normalizePhone(value ?? "");
  if (!p) return "";
  while (p.startsWith("0")) p = p.substring(1);
  if (p.length === 10 || p.length === 11) p = "55" + p;
  if (p.startsWith("55") && p.length === 13 && p[4] === "9") return p.slice(0, 4) + p.slice(5);
  return p;
};

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

// Traduz as mensagens (em inglês) que o Supabase devolve no hash da URL ao
// redirecionar de confirmações de auth (troca de e-mail, etc.).
const translateAuthMessage = (text: string) => {
  if (/proceed to confirm link sent to the other email/i.test(text))
    return "Confirmação aceita! Para concluir a troca, confirme também o link enviado ao OUTRO e-mail (o antigo).";
  if (/Confirmation link accepted/i.test(text))
    return "Confirmação recebida com sucesso.";
  if (/Email (address )?(changed|updated)/i.test(text))
    return "E-mail alterado com sucesso.";
  return text;
};

// Lê message/error do hash do Supabase (#message=... ou #error=...). Retorna null
// quando não há nada a exibir.
const readAuthRedirectMessage = (): { text: string; isError: boolean } | null => {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash || !/[#&](message|error|error_description)=/.test(hash)) return null;
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const error = params.get("error_description") || params.get("error");
  if (error) return { text: error, isError: true };
  const message = params.get("message");
  if (message) return { text: translateAuthMessage(message), isError: false };
  return null;
};

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

const buildOpportunityTitleFromMessage = (
  message: InboxMessage,
  name: string,
  produto?: string | null,
) => {
  const base = name || message.remetente_nome;
  return produto ? `${base} · ${produto}` : `${base} - ${message.canal || "Inbox"}`;
};

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
  ["Proposta", "Negociação"].includes(opportunity.etapa);

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
  useUtmTracking();
  const location = useLocation();
  const navigate = useNavigate();
  const route = (location.pathname === "/" ? "dashboard" : location.pathname.slice(1)) as AppRoute;
  const isPublicRoute = isPublicPath(location.pathname);
  const [session, setSession] = useState<Session | null>(null);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<ModalType | null>(null);
  const [editing, setEditing] = useState<EditingTarget | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const queryClient = useQueryClient();
  const [authMessage, setAuthMessage] = useState(readAuthRedirectMessage);

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
        if (!isPublicPath(path) && path !== "/cadastro" && path !== "/login") {
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
      .on(
        // Refresh the snapshot when the WhatsApp channel connects/disconnects so
        // the Inbox "WhatsApp Desconectado" banner and the composer reflect the
        // live connection state without a manual reload.
        'postgres_changes',
        { event: '*', schema: 'public', table: 'integration_channels', filter: `owner_id=eq.${session.user.id}` },
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

  // Guarda de rota: além de esconder no menu, bloqueia o acesso direto por URL.
  // Se o papel não tem a rota liberada (ex.: vendedor em /criativos), redireciona
  // para o /dashboard. Fonte única de verdade: getAllowedRoutes (accessControl).
  const guardRoute = (id: Exclude<AppRoute, "login">, element: ReactNode) =>
    allowedRoutes.includes(id) ? element : <Navigate to="/dashboard" replace />;

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

  const handleDeleteContact = (contactId: string) =>
    runMutation(() => deleteContact(contactId), "Contato excluído com sucesso.");
  const handleDeleteLead = (leadId: string) =>
    runMutation(() => deleteLead(leadId), "Lead excluído com sucesso.");
  const handleDeleteOpportunity = (opportunityId: string) =>
    runMutation(() => deleteOpportunity(opportunityId), "Oportunidade excluída com sucesso.");

  const ownerId = session?.user.id;
  const findContactByPhone = (phone: string) => {
    const key = phoneMatchKey(phone);
    return snapshot.contacts.find(
      (contact) => phoneMatchKey(contact.telefone) === key,
    );
  };
  const findLeadByPhone = (phone: string) => {
    const key = phoneMatchKey(phone);
    return snapshot.leads.find(
      (lead) => phoneMatchKey(lead.telefone) === key,
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
      site: getFormValue(formData, "site"),
      instagram: getFormValue(formData, "instagram"),
      linkedin: getFormValue(formData, "linkedin"),
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
      produto: getFormValue(formData, "produto") || null,
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

  // Marca a conversa como lida ao ABRIR (silencioso: sem toast/fechar modal).
  // Falha aqui não deve atrapalhar a leitura — apenas loga.
  const handleMarkConversationRead = async (messageIds: string[]) => {
    if (messageIds.length === 0) return;
    try {
      await markInboxConversationRead(messageIds);
      reloadData();
    } catch (error) {
      console.error("markConversationRead", error);
    }
  };

  const handleSendInboxTemplate = async (payload: {
    phone: string;
    contactId?: string | null;
    leadId?: string | null;
    renderedText: string;
    template: { name: string; language: string; variables: string[] };
  }) => {
    try {
      await sendInboxTemplate(payload);
      toast.success("Template enviado!");
      reloadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
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
          // Auto-detecta o produto/serviço tratado (site, tráfego, GMN, social...)
          // varrendo TODA a conversa daquele telefone (não só a última mensagem),
          // mais a mensagem atual e o interesse do lead. Editável se falhar.
          const conversationText = snapshot.messages
            .filter(
              (m) => normalizePhone(m.telefone) === normalizePhone(message.telefone),
            )
            .map((m) => m.mensagem)
            .join(" ");
          const produto = inferProductFromMessage(
            `${conversationText} ${message.mensagem} ${lead.interesse ?? ""}`,
          );
          // Preço pré-definido do produto detectado; se não houver, mantém o
          // valor estimado do lead.
          const precoProduto = priceForProduct(produto);
          await createOpportunity(ownerId, {
            lead_id: lead.id,
            titulo: buildOpportunityTitleFromMessage(message, lead.nome, produto),
            etapa: inferOpportunityStageFromMessage(message),
            valor: precoProduto ?? lead.valor_estimado,
            responsavel: snapshot.profile?.nome ?? "Equipe comercial",
            proxima_acao: buildOpportunityNextActionFromMessage(message),
            produto,
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

  // Feedback de redirects de auth do Supabase (ex.: confirmação de troca de e-mail)
  // que caem numa rota com #message=.../#error=... — renderiza ANTES do gate público
  // (a home não tem Toaster), para o usuário sempre ter retorno no navegador.
  if (authMessage) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background text-foreground p-6">
        <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full text-center shadow-xl flex flex-col items-center gap-4">
          <Logo iconSize={40} />
          {authMessage.isError ? (
            <X className="text-destructive" size={44} />
          ) : (
            <CheckCircle2 className="text-green-500" size={44} />
          )}
          <h2 className="text-xl font-bold tracking-tight">
            {authMessage.isError ? "Não foi possível concluir" : "Confirmação recebida"}
          </h2>
          <p className="text-sm text-muted-foreground">{authMessage.text}</p>
          <button
            onClick={() => {
              setAuthMessage(null);
              window.history.replaceState(null, "", window.location.pathname);
              navigate("/");
            }}
            className="mt-2 h-12 px-6 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  // Rotas públicas (home da marca, /crm, legais, previews) NÃO dependem de sessão
  // e por isso renderizam antes do boot de autenticação — assim o visitante que
  // chega pela primeira vez vê a página imediatamente, sem a tela de carregamento.
  if (isPublicRoute) {
    return (
      <>
        <AnnouncementBar />
        <Suspense fallback={<PageLoader />}><Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/crm" element={<CrmLandingPage />} />
          <Route path="/consultoria" element={<ConsultoriaLanding />} />
          <Route path="/contato" element={<ContactPage />} />
          <Route path="/brandbook" element={<BrandbookPage />} />
          <Route path="/site-para-negocios-locais" element={<LocalBusinessWebsiteLanding />} />
          <Route path="/diagnostico-estrutura-de-vendas" element={<SalesStructureDiagnosticLanding />} />
          <Route path="/google-meu-negocio" element={<GoogleBusinessProfileLanding />} />
          <Route path="/trafego-pago-negocios-locais" element={<PaidTrafficLocalBusinessLanding />} />
          <Route path="/crm-whatsapp-organizado" element={<CrmWhatsappLanding />} />

          <Route path="/site-para-nutricionistas" element={<NutritionistWebsiteLanding />} />
          <Route path="/estrutura-de-vendas-para-nutricionistas" element={<LpNutricionistas />} />
          <Route path="/estrutura-de-vendas-para-psicologas" element={<LpPsicologas />} />
          <Route path="/estrutura-de-vendas-para-dentistas" element={<LpDentistas />} />
          <Route path="/estrutura-de-vendas-para-terapeutas" element={<LpTerapeutas />} />
          <Route path="/estrutura-de-vendas-para-massoterapeutas" element={<LpMassoterapeutas />} />
          <Route path="/estrutura-de-vendas-para-advogados" element={<LpAdvogados />} />
          <Route path="/estrutura-de-vendas-para-arquitetos" element={<LpArquitetos />} />
          <Route path="/estrutura-de-vendas-para-contabilidade" element={<LpContabilidade />} />
          <Route path="/estrutura-de-vendas-para-estetica" element={<LpEstetica />} />
          <Route path="/site-para-psicologas" element={<PsychologistWebsiteLanding />} />
          <Route path="/privacidade" element={<PrivacyPage />} />
          <Route path="/termos" element={<TermsPage />} />
          <Route path="/exclusao-de-dados" element={<DataDeletionPage />} />
          <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
          <Route path="/cidades-atendidas" element={<CitiesDirectory />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/glossario" element={<GlossarioIndex />} />
          <Route path="/glossario/:slug" element={<GlossarioTermo />} />
          <Route path="/blog/guia-de-vendas/:nicho/:estado/:cidade" element={<ProgrammaticBlogPost />} />
          <Route path="/local/:nicho/:estado/:cidade" element={<LocalCityLanding />} />
          <Route path="/agencia-de-marketing/:nicho/:estado/:cidade" element={<ProgrammaticIntentLanding intentType="agencia" />} />
          <Route path="/empresa-de-captacao/:nicho/:estado/:cidade" element={<ProgrammaticIntentLanding intentType="captacao" />} />
          <Route path="/melhor-crm/:nicho/:estado/:cidade" element={<ProgrammaticIntentLanding intentType="crm" />} />
          <Route path="/l/:slug" element={<LinkAggregatorPage />} />
          <Route path="/:slug" element={<ProspectingPreviewPage />} />
          <Route path="/:slug/index.html" element={<ProspectingPreviewPage />} />
        </Routes></Suspense>
      </>
    );
  }

  // Rota privada: aguardamos a sessão resolver para não piscar o login.
  if (isBooting) {
    return <LoadingScreen label="Preparando sua experiência..." />;
  }

  if (!session || route === "login" || route === "cadastro") {
    if (route === "cadastro") {
      return <SignUpScreen authError={authError} onAuth={handleAuth} />;
    }
    return <LoginScreen authError={authError} onAuth={handleAuth} />;
  }

  return (
    <div className="shell">
      <SeoHead noindex />
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
          <Suspense fallback={<PageLoader />}><Routes>
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
            <Route path="/configuracoes" element={<SettingsPage />} />
            <Route
              path="/dashboard"
              element={<Dashboard snapshot={snapshot} onOpenModal={openModal} />}
            />
            <Route
              path="/inbox"
              element={
                <InboxPage
                  channels={snapshot.channels}
                  conversationStates={snapshot.conversationStates}
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
                  onMarkConversationRead={handleMarkConversationRead}
                  onLoadTemplates={getApprovedWhatsAppTemplates}
                  onSendTemplate={handleSendInboxTemplate}
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
                  onDeleteContact={handleDeleteContact}
                  onEditContact={(contact) =>
                    openEditModal({ type: "contact", record: contact })
                  }
                  onOpenModal={openModal}
                  onQueryChange={setQuery}
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
                  onDeleteLead={handleDeleteLead}
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
                  onDeleteOpportunity={handleDeleteOpportunity}
                  onOpenModal={openModal}
                  onDragEnd={handleDragEnd}
                />
              }
            />
            <Route path="/criativos" element={guardRoute("criativos", <CreativesPage />)} />
            <Route path="/roteiro" element={guardRoute("roteiro", <EditorialPlannerPage />)} />
            <Route path="/agregadores" element={guardRoute("agregadores", <AggregatorsAdminPage />)} />
            <Route path="/pecas" element={guardRoute("pecas", <PieceStudioPage />)} />
            <Route
              path="/campanhas"
              element={guardRoute(
                "campanhas",
                <CampaignsPage
                  contacts={snapshot.contacts}
                  channels={snapshot.channels}
                />,
              )}
            />
            <Route path="/whatsapp" element={<WhatsappPage />} />
            <Route path="/oauth/meta" element={<MetaOAuthCallback />} />
            <Route path="/oauth/instagram" element={<InstagramOAuthCallback />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes></Suspense>
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
        <p className="eyebrow">{brandConfig.appName}</p>
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
          className="icon-button"
          aria-label="Configurações"
          title="Configurações"
          onClick={() => onNavigate?.("configuracoes")}
        >
          <SettingsIcon size={18} />
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

// Opções padronizadas de origem e potencial do contato.
const CONTACT_ORIGINS = [
  "Meta Ads",
  "Google Ads",
  "Site",
  "WhatsApp",
  "Indicação",
  "Prospecção Ativa",
];
const CONTACT_POTENTIALS = ["Frio", "Morno", "Quente"];

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
          required
        />
        <TextField
          defaultValue={contact?.email}
          label="E-mail"
          name="email"
          type="email"
        />
        <TextField
          defaultValue={contact?.site ?? ""}
          label="Site"
          name="site"
          placeholder="https://exemplo.com.br"
        />
        <TextField
          defaultValue={contact?.instagram ?? ""}
          label="Instagram"
          name="instagram"
          placeholder="@usuario"
        />
        <TextField
          defaultValue={contact?.linkedin ?? ""}
          label="LinkedIn"
          name="linkedin"
          placeholder="linkedin.com/in/usuario"
        />
        <SelectField
          defaultValue={contact?.origem}
          label="Origem"
          name="origem"
        >
          <option value="">Selecione a origem</option>
          {contact?.origem && !CONTACT_ORIGINS.includes(contact.origem) && (
            <option value={contact.origem}>{contact.origem}</option>
          )}
          {CONTACT_ORIGINS.map((origem) => (
            <option key={origem} value={origem}>
              {origem}
            </option>
          ))}
        </SelectField>
        <SelectField
          defaultValue={contact?.potencial}
          label="Potencial"
          name="potencial"
        >
          <option value="">Selecione o potencial</option>
          {contact?.potencial && !CONTACT_POTENTIALS.includes(contact.potencial) && (
            <option value={contact.potencial}>{contact.potencial}</option>
          )}
          {CONTACT_POTENTIALS.map((potencial) => (
            <option key={potencial} value={potencial}>
              {potencial}
            </option>
          ))}
        </SelectField>
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
  // `valor` controlado só para permitir auto-preenchimento ao escolher o produto.
  // O usuário ainda pode digitar por cima; o FormData lê o valor final do campo.
  const [valor, setValor] = useState(String(opportunity?.valor ?? 0));

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
        <SelectField
          defaultValue={opportunity?.produto ?? ""}
          label="Produto / Serviço"
          name="produto"
          onChange={(event) => {
            const preco = priceForProduct(event.target.value);
            if (preco != null) setValor(String(preco));
          }}
        >
          <option value="">Não definido</option>
          {PRODUCTS.map((produto) => (
            <option key={produto} value={produto}>
              {produto}
            </option>
          ))}
        </SelectField>
        <TextField
          key={valor}
          defaultValue={valor}
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

  // Remove o DDI 55 de números salvos em formato internacional, para a máscara
  // (00) 00000-0000 mostrar o DDD real (e não ler o 55 como DDD, o que truncaria o
  // número ao salvar). O 55 é re-adicionado ao discar/enviar. Conserta leads e contatos.
  const phoneDefault = (() => {
    if (!isPhone || !defaultText) return defaultText;
    const d = defaultText.replace(/\D/g, "");
    if (!d.startsWith("55")) return defaultText;
    if (d.length === 12 || d.length === 13) return d.slice(2);
    if (d.length === 11 && d[2] !== "9") return d.slice(2);
    return defaultText;
  })();

  return (
    <label>
      {label}
      {isPhone ? (
        <IMaskInput
          defaultValue={phoneDefault}
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
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6 font-sans">
      <div className="animate-pulse">
        <Logo variant="stacked" iconSize={56} />
      </div>
      <p className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
        <span className="h-4 w-4 rounded-full border-2 border-primary border-r-transparent animate-spin" />
        {label}
      </p>
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


const PageLoader = () => (
  <div className="flex min-h-[100dvh] items-center justify-center bg-background text-foreground">
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <span className="text-sm text-muted-foreground font-medium animate-pulse">Carregando...</span>
    </div>
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
        <CookieBanner />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
