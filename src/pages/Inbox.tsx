import { HeroPanel, PageIntro, MetricCard, Panel, ActionItem, TablePanel, EmptyState, Modal, ContactModal, LeadModal, OpportunityModal, MessageModal, ChannelModal, EntityForm, TextField, SelectField, LoadingScreen } from "../components/SharedUI";
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
  FileText,
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
  Smartphone,
  Check,
  CheckCheck,
  AlertTriangle,
  Archive,
  ArchiveRestore,
  UserPlus,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { Toaster, toast } from "react-hot-toast";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { IMaskInput } from "react-imask";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  useSearchParams,
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
  getMyProfile,
  getTeamMembers,
  getConversationAssignments,
  assignConversation,
  archiveInboxConversations,
  conversationStatePhoneKey,
  unarchiveInboxConversation,
} from "../lib/crmService";
import { TemplatePicker } from "../components/TemplatePicker";
import type { WhatsAppTemplate } from "../lib/crmService";
import { getAllowedRoutes } from "../lib/accessControl";
import { brandConfig } from "../lib/branding";
import {
  navigationItems,
  pipelineStages,
  type NavigationItem,
} from "../lib/navigation";
import {
  buildCommercialRecommendations,
  formatPriority,
} from "../services/commercialIntelligence";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type {
  Contact,
  ConversationAssignment,
  CrmSnapshot,
  InboxConversationState,
  InboxMessage,
  IntegrationChannel,
  Lead,
  Opportunity,
  OpportunityStage,
  Profile,
  Route as AppRoute,
  TeamMember,
} from "../lib/types";

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
  conversationStates: [],
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  
  const diffInTime = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));
  
  if (diffInDays === 0) {
    if (date.getDate() === now.getDate()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return "Ontem";
    }
  } else if (diffInDays === 1) {
    return "Ontem";
  } else if (diffInDays < 7) {
    return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  } else {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
};

// Selinho de entrega da mensagem de saída (atualizado pelo webhook de status da
// Meta). `null` = sem status ainda (ex.: envio local/manual) → não mostra nada.
function DeliveryBadge({
  status,
  error,
}: {
  status?: InboxMessage["delivery_status"];
  error?: string | null;
}) {
  if (!status) return null;
  if (status === "failed") {
    return (
      <span
        className="inline-flex items-center gap-0.5 text-red-500"
        title={error ?? "Falha na entrega"}
      >
        <AlertTriangle size={12} /> Falhou
      </span>
    );
  }
  if (status === "read") {
    return <CheckCheck size={13} className="text-sky-400" aria-label="Lida" />;
  }
  if (status === "delivered") {
    return <CheckCheck size={13} aria-label="Entregue" />;
  }
  // sent
  return <Check size={13} aria-label="Enviada" />;
}

const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const normalizePhone = (value: string) => value.replace(/\D/g, "");

// Helper to unify Brazilian numbers (with or without 9th digit, and missing 55) for grouping
const unifyPhone = (phone: string | null | undefined) => {
  if (!phone) return "";
  let p = normalizePhone(phone);
  if (!p) return "";
  
  // Strip any leading zeros that might come from raw input
  while (p.startsWith("0")) {
    p = p.substring(1);
  }
  
  // If it starts with 550, strip the 0
  while (p.startsWith("550")) {
    p = "55" + p.substring(3);
  }
  
  if (p.length === 10 || p.length === 11) {
    p = "55" + p;
  }
  
  if (p.startsWith("55") && p.length === 13 && p[4] === "9") {
    // Return the 12-digit version (removing the 9th digit)
    return p.slice(0, 4) + p.slice(5);
  }
  return p;
};

// Reconstrói o 9º dígito para EXIBIÇÃO. As mensagens são gravadas SEM o 9 (formato
// de agrupamento/RLS), mas o número real do contato tem o 9 — então exibimos com ele.
const displayPhone = (value?: string | null) => {
  const p = (value ?? "").replace(/\D/g, "");
  return p.length === 12 && p.startsWith("55") ? p.slice(0, 4) + "9" + p.slice(4) : p;
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


// A synthetic "draft" message used to open a brand-new conversation (from the
// Contacts "WhatsApp" button) when the contact has no message history yet. It
// lets the composer target the phone; once the first reply is sent, the real
// conversation replaces it via realtime.
type WhatsAppTarget = { phone: string; nome: string; contactId: string | null };

const buildDraftMessage = (target: WhatsAppTarget): InboxMessage => ({
  id: "",
  owner_id: "",
  contact_id: target.contactId,
  lead_id: null,
  canal: "WhatsApp",
  provider: "z-api",
  provider_message_id: null,
  remetente_nome: target.nome,
  telefone: target.phone,
  mensagem: "",
  status: "Nova conversa",
  unread_count: 0,
  direction: "inbound",
  created_at: new Date().toISOString(),
});

// Estágio (exclusivo) de uma conversa no funil e os filtros da lista.
// "nao_cadastrado" = conversa de um número que NÃO está no CRM (nem contato,
// nem lead) — aparece só em "Todos", nunca no filtro "Contato".
type ConversationStage = "contato" | "lead" | "oportunidade" | "nao_cadastrado";
type DateFilter = "tudo" | "hoje" | "7d" | "30d";
type TypeFilter = "todos" | ConversationStage;
type ChannelFilter = "ativos" | "legado" | "todos" | string;

export function conversationMatchesChannelFilter(
  channelId: string | null,
  channelFilter: ChannelFilter,
  activeChannelIds: ReadonlySet<string>,
  isSeller: boolean,
) {
  if (channelFilter === "ativos") {
    // Sellers cannot read the admin's integration_channels rows through RLS.
    // Their assigned messages are already scoped by message RLS, so the default
    // view must not require unavailable channel metadata.
    return isSeller || (channelId !== null && activeChannelIds.has(channelId));
  }
  if (channelFilter === "legado") return channelId === null;
  if (channelFilter === "todos") return true;
  return channelId === channelFilter;
}

type ConversationViewModel = {
  key: string;
  latest: InboxMessage;
  latestInbound: InboxMessage;
  displayName: string;
  stage: ConversationStage;
  isResolved: boolean;
  messages: InboxMessage[];
  unreadCount: number;
  channelId: string | null;
  channelLabel: string;
  archiveState: InboxConversationState | null;
  isArchived: boolean;
  isDraft: boolean;
};

const DATE_FILTERS: ReadonlyArray<{ value: DateFilter; label: string }> = [
  { value: "tudo", label: "Tudo" },
  { value: "hoje", label: "Hoje" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
];

const TYPE_FILTERS: ReadonlyArray<{ value: TypeFilter; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "contato", label: "Contato" },
  { value: "lead", label: "Lead" },
  { value: "oportunidade", label: "Oport." },
];

// Timestamp de corte para o filtro de data (null = sem filtro).
function dateFilterCutoff(filter: DateFilter): number | null {
  if (filter === "tudo") return null;
  const now = new Date();
  if (filter === "hoje") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }
  const days = filter === "7d" ? 7 : 30;
  return now.getTime() - days * 24 * 60 * 60 * 1000;
}

export default function InboxPage({
  channels,
  conversationStates,
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
  onMarkConversationRead,
  onLoadTemplates,
  onSendTemplate,
  onUpdateChannelStatus,
  onUpdateMessageStatus,
}: {
  channels: IntegrationChannel[];
  conversationStates: InboxConversationState[];
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
  onMarkConversationRead: (messageIds: string[]) => Promise<void>;
  onLoadTemplates: () => Promise<WhatsAppTemplate[]>;
  onSendTemplate: (payload: {
    phone: string;
    contactId?: string | null;
    leadId?: string | null;
    renderedText: string;
    template: { name: string; language: string; variables: string[] };
  }) => Promise<void>;
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const filteredMessages = messages.filter((message) =>
    matchesQuery(query, [
      message.remetente_nome,
      message.telefone,
      message.mensagem,
      message.status,
    ]),
  );

  const archiveStateByConversation = useMemo(() => {
    const map = new Map<string, InboxConversationState>();
    for (const state of conversationStates) {
      const channelKey = state.channel_id ?? "legacy";
      map.set(
        `${conversationStatePhoneKey(state.telefone)}:${channelKey}`,
        state,
      );
    }
    return map;
  }, [conversationStates]);

  const conversations = useMemo(() => {
    const grouped = new Map<string, InboxMessage[]>();

      for (const message of filteredMessages) {
        // We prioritize grouping by phone to merge inbound/outbound from same person.
        // If phone is missing, fallback to contact_id or message_id.
        const key = unifyPhone(message.telefone) || message.contact_id || message.id;
        grouped.set(key, [...(grouped.get(key) ?? []), message]);
      }

    return Array.from(grouped.entries())
      .map(([key, conversationMessages]) => {
        const sortedMessages = [...conversationMessages].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        const latest = sortedMessages[sortedMessages.length - 1];
        const realInbound = [...sortedMessages]
          .reverse()
          .find((item) => item.direction === "inbound");
        const latestInbound = realInbound ?? latest;

        // Nome da conversa = o CONTATO (a outra parte), NUNCA o remetente de uma
        // mensagem de saída (que é o titular da conta conectada). Prioridade:
        // contato vinculado por telefone → remetente de uma mensagem recebida →
        // telefone.
        const contact = contacts.find(
          (c) => unifyPhone(c.telefone) === key,
        );
        const displayName =
          contact?.nome || realInbound?.remetente_nome || latest.telefone;

        // Estágio no funil (exclusivo) para o filtro de Tipo. "Contato" exige
        // que a pessoa esteja REGISTRADA no CRM (existe em `contacts` por
        // telefone, ou alguma mensagem já tem contact_id) — não basta ter
        // conversado no WhatsApp. Sem esse registro e sem lead → "nao_cadastrado".
        const leadId = sortedMessages.find((m) => m.lead_id)?.lead_id ?? null;
        const hasContactRecord =
          Boolean(contact) || sortedMessages.some((m) => m.contact_id);
        const stage: ConversationStage = leadId
          ? opportunities.some((o) => o.lead_id === leadId)
            ? "oportunidade"
            : "lead"
          : hasContactRecord
            ? "contato"
            : "nao_cadastrado";

        // "Resolvida" = a última mensagem RECEBIDA foi marcada como "Resolvido"
        // (uma nova mensagem recebida reabre a conversa). Usado pela aba "Abertas".
        const isResolved = latestInbound.status === "Resolvido";
        const channelId = latest.channel_id ?? null;
        const channel = channelId
          ? channels.find((item) => item.id === channelId)
          : null;
        const channelKey = channelId ?? "legacy";
        const archiveState =
          archiveStateByConversation.get(`${key}:${channelKey}`) ?? null;
        const isArchived = Boolean(archiveState?.archived_at);
        const channelLabel = channel
          ? `${formatProviderName(channel.provider)} ${displayPhone(channel.numero)}`
          : "Legado / sem canal";

        return {
          key,
          latest,
          latestInbound,
          displayName,
          stage,
          isResolved,
          messages: sortedMessages,
          unreadCount: sortedMessages.reduce(
            (sum, item) => sum + Number(item.unread_count || 0),
            0,
          ),
          channelId,
          channelLabel,
          archiveState,
          isArchived,
          isDraft: false,
        } satisfies ConversationViewModel;
      })
      .sort(
        (a, b) =>
          new Date(b.latest.created_at).getTime() -
          new Date(a.latest.created_at).getTime(),
      );
  }, [
    filteredMessages,
    contacts,
    opportunities,
    channels,
    archiveStateByConversation,
  ]);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [filterTab, setFilterTab] = useState<
    "abertas" | "nao_lidas" | "arquivadas" | "todas"
  >("abertas");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("ativos");
  const [dateFilter, setDateFilter] = useState<DateFilter>("tudo");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("todos");
  const [localSearch, setLocalSearch] = useState("");
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handoff (time): perfil próprio, vendedores do time (só admin) e mapa de
  // atribuições por telefone. Carregados uma vez; atribuições recarregam após
  // transferir uma conversa.
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [assignments, setAssignments] = useState<ConversationAssignment[]>([]);
  const [onlyMine, setOnlyMine] = useState(false);
  const [transferMenuOpen, setTransferMenuOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  
  // Mobile UI States: "list" | "chat" | "context"
  const [mobileView, setMobileView] = useState<"list" | "chat" | "context">("list");

  // Target conversation opened from another page (Contacts "WhatsApp" button)
  // via ?to=<phone>&nome=<name>&contact=<id>.
  const [searchParams, setSearchParams] = useSearchParams();
  const [target, setTarget] = useState<WhatsAppTarget | null>(null);

  useEffect(() => {
    const to = searchParams.get("to");
    if (!to) return;
    setTarget({
      phone: to,
      nome: searchParams.get("nome") ?? to,
      contactId: searchParams.get("contact"),
    });
    setSelectedKey(unifyPhone(to));
    setMobileView("chat");
    // Consume the params so a reload/back doesn't re-open the draft.
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, selectedKey]);

  // Handoff: carrega perfil próprio + atribuições sempre; time de vendedores
  // só quando o usuário logado é admin (role !== "vendedor" e sem admin_id).
  const reloadAssignments = useCallback(async () => {
    try {
      setAssignments(await getConversationAssignments());
    } catch (error) {
      console.error("[Inbox] load assignments", error);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const profile = await getMyProfile();
        setMyProfile(profile);
        const isAdminUser = Boolean(
          profile && profile.role !== "vendedor" && !profile.admin_id,
        );
        if (isAdminUser) {
          setTeamMembers(await getTeamMembers());
        }
      } catch (error) {
        console.error("[Inbox] load profile/team", error);
      }
    })();
    reloadAssignments();
  }, [reloadAssignments]);

  // Fecha o menu de transferência ao trocar de conversa.
  useEffect(() => {
    setTransferMenuOpen(false);
  }, [selectedKey]);

  // Handoff: sou admin (dono do time) se tenho perfil, não sou vendedor e não
  // tenho admin_id (vendedores sempre apontam pro admin dono da conta).
  const isAdmin = Boolean(
    myProfile && myProfile.role !== "vendedor" && !myProfile.admin_id,
  );
  // Vendedor: vinculado a um admin. Responde pelo canal do admin (resolvido no
  // server pelo whatsapp-send), então não precisa de canal próprio conectado.
  const isSeller = Boolean(myProfile?.admin_id);

  useEffect(() => {
    if (!supabase) return;

    const archiveStateChannel = supabase
      .channel("inbox-conversation-states-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inbox_conversation_states",
        },
        () => queryClient.invalidateQueries({ queryKey: ["crmSnapshot"] }),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(archiveStateChannel);
    };
  }, [queryClient]);

  // Mapa telefone (unificado) -> atribuição, para casar com `conv.key` (que já
  // é `unifyPhone`). `conversation_assignments.telefone` é gravado cru, então
  // unificamos aqui do mesmo jeito que as conversas são agrupadas.
  const assignmentByKey = useMemo(() => {
    const map = new Map<string, ConversationAssignment>();
    for (const assignment of assignments) {
      const key = unifyPhone(assignment.telefone) || assignment.telefone;
      map.set(key, assignment);
    }
    return map;
  }, [assignments]);

  // Nome do responsável por id: inclui o time (visão do admin) e o próprio
  // perfil (para o vendedor conseguir ver seu próprio nome no selo).
  const membersById = useMemo(() => {
    const map = new Map<string, { nome: string | null; email: string | null }>();
    for (const member of teamMembers) map.set(member.id, member);
    if (myProfile) map.set(myProfile.id, myProfile);
    return map;
  }, [teamMembers, myProfile]);

  const showAssignedFilter = isAdmin ? teamMembers.length > 0 : Boolean(myProfile);
  const activeChannels = useMemo(
    () => channels.filter((channel) => channel.status === "ativo"),
    [channels],
  );
  const activeChannelIds = useMemo(
    () => new Set(activeChannels.map((channel) => channel.id)),
    [activeChannels],
  );

  const displayedConversations = useMemo(() => {
    const dateCutoff = dateFilterCutoff(dateFilter);
    return conversations.filter(conv => {
      // Abas de status
      if (filterTab === "arquivadas" && !conv.isArchived) return false;
      if (
        filterTab !== "arquivadas" &&
        filterTab !== "todas" &&
        conv.isArchived
      ) {
        return false;
      }
      if (filterTab === "abertas" && conv.isResolved) return false;
      if (filterTab === "nao_lidas" && conv.unreadCount === 0) return false;

      // Filtro de canal
      if (
        !conversationMatchesChannelFilter(
          conv.channelId,
          channelFilter,
          activeChannelIds,
          isSeller,
        )
      ) {
        return false;
      }

      // Filtro de Tipo (estágio exclusivo do funil)
      if (typeFilter !== "todos" && conv.stage !== typeFilter) return false;

      // Filtro "Atribuídas a mim"
      if (onlyMine) {
        const assignment = assignmentByKey.get(conv.key);
        if (!assignment || assignment.assigned_to !== myProfile?.id) return false;
      }

      // Filtro de Data (pela data da última mensagem da conversa)
      if (dateCutoff !== null && new Date(conv.latest.created_at).getTime() < dateCutoff) {
        return false;
      }

      if (localSearch) {
        // Busca nos campos que o usuário VÊ na lista: nome do contato
        // (displayName), nome de perfil do WhatsApp, telefone exibido, texto da
        // última mensagem e a chave (telefone unificado).
        const searchTerms = [
          conv.displayName,
          conv.latestInbound.remetente_nome,
          conv.latest.telefone,
          conv.latest.mensagem,
          conv.key,
        ];
        // Fallback de telefone: casa só pelos dígitos (ignora +, espaços, ( ) e -),
        // para achar o número mesmo digitado com formatação.
        const queryDigits = localSearch.replace(/\D/g, "");
        const phoneDigits = String(conv.latest.telefone ?? "").replace(/\D/g, "");
        const phoneMatch = queryDigits.length >= 3 && phoneDigits.includes(queryDigits);

        if (!matchesQuery(localSearch, searchTerms) && !phoneMatch) {
          return false;
        }
      }
      return true;
    });
  }, [
    conversations,
    filterTab,
    channelFilter,
    activeChannelIds,
    isSeller,
    localSearch,
    typeFilter,
    dateFilter,
    onlyMine,
    assignmentByKey,
    myProfile,
  ]);

  // Selection Logic — auto-select the first conversation on desktop, BUT never
  // when a specific conversation was requested via ?to= (Contacts "WhatsApp"
  // button) or is already open, otherwise it would clobber the target with the
  // top conversation on mount.
  useEffect(() => {
    if (selectedKey || target || searchParams.get("to")) return;
    if (displayedConversations.length > 0 && window.innerWidth >= 1024) {
      setSelectedKey(displayedConversations[0].key);
    }
  }, [displayedConversations, selectedKey, target, searchParams]);

  // View handlers for mobile
  const handleSelectConversation = (key: string) => {
    setSelectedKey(key);
    setMobileView("chat");
    // Semântica literal de "não lida": abrir a conversa zera o unread das suas
    // mensagens (persistido no banco). Só no clique explícito — a auto-seleção
    // da 1ª conversa no desktop usa setSelectedKey direto e não marca como lida.
    const conv = conversations.find((c) => c.key === key);
    const unreadIds = (conv?.messages ?? [])
      .filter((m) => Number(m.unread_count) > 0)
      .map((m) => m.id);
    if (unreadIds.length > 0) void onMarkConversationRead(unreadIds);
  };

  // Templates são exclusivos da Meta Cloud API — o botão só aparece com Meta ativa.
  const metaActive = activeChannels.some(
    (c) => c.provider === "whatsapp" || c.provider === "whatsapp_cloud",
  );

  const targetKey = target ? unifyPhone(target.phone) : null;
  const hasRealTargetConversation = targetKey
    ? conversations.some((c) => c.key === targetKey)
    : false;
  // Draft conversation for a contact with no history yet (opened via the
  // Contacts "WhatsApp" button). Replaced by the real conversation once the
  // first reply lands (realtime).
  const draftConversation =
    target && targetKey && !hasRealTargetConversation
      ? {
          key: targetKey,
          latest: buildDraftMessage(target),
          latestInbound: buildDraftMessage(target),
          displayName: target.nome,
          stage: "contato" as ConversationStage,
          isResolved: false,
          messages: [] as InboxMessage[],
          unreadCount: 0,
          channelId: null,
          channelLabel: "Nova conversa",
          archiveState: null,
          isArchived: false,
          isDraft: true,
        }
      : null;
  const showDraft = Boolean(draftConversation && selectedKey === draftConversation!.key);
  const displayedConversationsWithDraft: ConversationViewModel[] =
    showDraft ? [draftConversation!, ...displayedConversations] : displayedConversations;

  const selectedConversation =
    conversations.find((c) => c.key === selectedKey) ??
    (showDraft ? draftConversation! : undefined);
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
    (contact) => unifyPhone(contact.telefone) === unifyPhone(sourcePhone),
  );
  const leadByPhone = leads.find(
    (lead) => unifyPhone(lead.telefone) === unifyPhone(sourcePhone),
  );
  
  const linkedContact = contacts.find((contact) => contact.id === conversationContactId) ?? contactByPhone;
  const linkedLead = leads.find((lead) => lead.id === conversationLeadId) ?? leadByPhone;
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
      : "Sem registro comercial";

  // Handoff: quem está atendendo a conversa selecionada (se houver atribuição).
  const selectedAssignment = selectedConversation
    ? assignmentByKey.get(selectedConversation.key)
    : undefined;
  const selectedAssigneeName = selectedAssignment
    ? membersById.get(selectedAssignment.assigned_to)?.nome ||
      membersById.get(selectedAssignment.assigned_to)?.email ||
      "Vendedor"
    : null;

  // Botão "Transferir": só admin, só se há vendedores no time, e só numa
  // conversa real (o rascunho de conversa nova ainda não tem owner_id).
  const canTransfer = isAdmin && teamMembers.length > 0 && Boolean(selected?.owner_id);

  const cleanupCandidates = useMemo(
    () =>
      isAdmin
        ? conversations.filter((conv) => {
            if (conv.isArchived || conv.unreadCount > 0) return false;
            if (conv.channelId === null) return true;
            return !activeChannels.some((channel) => channel.id === conv.channelId);
          })
        : [],
    [conversations, activeChannels, isAdmin],
  );

  const handleArchiveConversation = async (conv: ConversationViewModel) => {
    if (!isAdmin || !conv.latest.owner_id || conv.isDraft) return;
    try {
      await archiveInboxConversations(
        [
          {
            owner_id: conv.latest.owner_id,
            telefone: conv.key,
            channel_id: conv.channelId,
          },
        ],
        "Arquivado manualmente na Inbox",
      );
      await queryClient.invalidateQueries({ queryKey: ["crmSnapshot"] });
      toast.success("Conversa arquivada.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleUnarchiveConversation = async (conv: ConversationViewModel) => {
    if (!isAdmin || !conv.latest.owner_id || conv.isDraft) return;
    try {
      await unarchiveInboxConversation({
        owner_id: conv.latest.owner_id,
        telefone: conv.key,
        channel_id: conv.channelId,
      });
      await queryClient.invalidateQueries({ queryKey: ["crmSnapshot"] });
      toast.success("Conversa reaberta.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleArchiveCleanupCandidates = async () => {
    if (!isAdmin || cleanupCandidates.length === 0) return;
    try {
      await archiveInboxConversations(
        cleanupCandidates.map((conv) => ({
          owner_id: conv.latest.owner_id,
          telefone: conv.key,
          channel_id: conv.channelId,
        })),
        "Arquivado por troca de numero/canal WhatsApp",
      );
      await queryClient.invalidateQueries({ queryKey: ["crmSnapshot"] });
      toast.success("Conversas antigas arquivadas.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleAssign = async (member: TeamMember) => {
    const ownerId = selected?.owner_id;
    if (!ownerId || !sourcePhone) return;
    setAssigning(true);
    try {
      await assignConversation(ownerId, sourcePhone, member.id);
      await reloadAssignments();
      toast.success("Conversa transferida para " + (member.nome || member.email || "vendedor"));
      setTransferMenuOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setAssigning(false);
    }
  };

  useEffect(() => {
    setReplyText("");
  }, [selectedConversation?.key]);

  const handleReplySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sourceMessage || !replyText.trim()) return;
    await onSendReply(sourceMessage, replyText.trim());
    setReplyText("");
  };

  // Renders the list column
  const renderListColumn = () => (
    <div className={`flex-col bg-background lg:bg-card border-r border-border h-full overflow-hidden ${mobileView === "list" ? "flex animate-in slide-in-from-left duration-200" : "hidden lg:flex"} w-full lg:w-[320px] xl:w-[380px] shrink-0 z-10`}>
      <div className="p-4 border-b border-border bg-foreground/5 flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Inbox</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => onOpenModal("channel")} className="p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors text-foreground" title="Canais">
              <Plus size={18} />
            </button>
          </div>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar mensagens..."
            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:border-primary/50 focus:bg-foreground/10 transition-colors text-foreground placeholder:text-muted-foreground"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        
        {/* Search / Filters (Segmented Control) */}
        <div className="flex bg-foreground/5 rounded-xl p-1 relative">
          <button 
            onClick={() => setFilterTab("abertas")}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all relative z-10 ${filterTab === 'abertas' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}
          >
            Abertas
          </button>
          <button
            onClick={() => setFilterTab("nao_lidas")}
            className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all relative z-10 ${filterTab === 'nao_lidas' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}
          >
            Não Lidas
          </button>
          <button 
            onClick={() => setFilterTab("arquivadas")}
            className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all relative z-10 ${filterTab === 'arquivadas' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}
          >
            Arquivadas
          </button>
          <button
            onClick={() => setFilterTab("todas")}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all relative z-10 ${filterTab === 'todas' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}
          >
            Todas
          </button>
          {/* Active pill background */}
          <div
            className="absolute top-1 bottom-1 bg-foreground/10 shadow-sm rounded-lg transition-all duration-300 ease-in-out border border-foreground/5"
            style={{
              width: 'calc(25% - 3px)',
              left: filterTab === 'abertas'
                ? '4px'
                : filterTab === 'nao_lidas'
                  ? 'calc(25% + 1px)'
                  : filterTab === 'arquivadas'
                    ? 'calc(50% - 1px)'
                    : 'calc(75% - 3px)'
            }}
          />
        </div>

        {/* Filtros: Data + Tipo + Time (combinam com as abas acima) */}
        <div className="space-y-1.5">
          {(dateFilter !== "tudo" || typeFilter !== "todos" || onlyMine || channelFilter !== "ativos") && (
            <div className="flex justify-end">
              <button
                onClick={() => { setDateFilter("tudo"); setTypeFilter("todos"); setOnlyMine(false); setChannelFilter("ativos"); }}
                className="text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground w-9 shrink-0">Canal</span>
            <select
              value={channelFilter}
              onChange={(event) => setChannelFilter(event.target.value)}
              className="flex-1 bg-foreground/5 border border-foreground/10 rounded-lg px-2 py-1 text-[11px] text-foreground"
            >
              <option value="ativos">Numero atual</option>
              <option value="legado">Legado</option>
              <option value="todos">Todos</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {formatProviderName(channel.provider)} {displayPhone(channel.numero)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground w-9 shrink-0">Data</span>
            <div className="flex gap-1 flex-1">
              {DATE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setDateFilter(f.value)}
                  className={`flex-1 py-1 text-[11px] font-medium rounded-lg border transition-colors ${dateFilter === f.value ? "bg-primary/15 border-primary/40 text-primary" : "bg-foreground/5 border-foreground/10 text-muted-foreground hover:text-foreground hover:bg-foreground/10"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground w-9 shrink-0">Tipo</span>
            <div className="flex gap-1 flex-1">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setTypeFilter(f.value)}
                  className={`flex-1 py-1 text-[11px] font-medium rounded-lg border transition-colors ${typeFilter === f.value ? "bg-primary/15 border-primary/40 text-primary" : "bg-foreground/5 border-foreground/10 text-muted-foreground hover:text-foreground hover:bg-foreground/10"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          {showAssignedFilter && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground w-9 shrink-0">Time</span>
              <div className="flex gap-1 flex-1">
                <button
                  onClick={() => setOnlyMine((v) => !v)}
                  className={`flex-1 py-1 text-[11px] font-medium rounded-lg border transition-colors ${onlyMine ? "bg-primary/15 border-primary/40 text-primary" : "bg-foreground/5 border-foreground/10 text-muted-foreground hover:text-foreground hover:bg-foreground/10"}`}
                >
                  Atribuídas a mim
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {activeChannels.length === 0 && channels.length > 0 && (
          <div className="p-4 m-4 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl">
            <strong>WhatsApp Desconectado</strong>
            <p className="mt-1">Seu histórico de conversas está preservado.</p>
          </div>
        )}
        {isAdmin && cleanupCandidates.length > 0 && (
          <div className="p-4 m-4 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl">
            <strong>Conversas antigas encontradas</strong>
            <p className="mt-1">Arquive conversas de canais antigos para manter a Inbox limpa.</p>
            <button
              type="button"
              onClick={handleArchiveCleanupCandidates}
              className="mt-3 rounded-lg border border-amber-500/40 px-2.5 py-1.5 text-[11px] font-semibold hover:bg-amber-500/10 transition-colors"
            >
              Arquivar conversas antigas
            </button>
          </div>
        )}
        
        {displayedConversationsWithDraft.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground h-full">
            <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mb-4">
              <MessageCircle size={28} className="opacity-40" />
            </div>
            <p className="text-sm font-medium">Nenhuma conversa por aqui.</p>
            <p className="text-xs opacity-70 mt-1 max-w-[200px]">Ajuste seus filtros ou aguarde novas mensagens.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {displayedConversationsWithDraft.map((conv) => {
              const isSelected = selectedKey === conv.key;
              const hasUnread = conv.unreadCount > 0;
              const assignment = assignmentByKey.get(conv.key);
              const assigneeName = assignment
                ? membersById.get(assignment.assigned_to)?.nome ||
                  membersById.get(assignment.assigned_to)?.email ||
                  "vendedor"
                : null;
              return (
                <div
                  key={conv.key}
                  className={`relative border-b border-border transition-all ${isSelected ? 'bg-primary/10 lg:border-l-2 lg:border-l-primary' : 'hover:bg-foreground/[0.03] lg:border-l-2 lg:border-l-transparent'}`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectConversation(conv.key)}
                    className="flex w-full items-start gap-3 p-4 pr-24 text-left"
                  >
                    <div className="relative shrink-0 mt-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center font-bold text-lg text-foreground shadow-sm border border-foreground/10">
                        {conv.displayName.charAt(0).toUpperCase()}
                      </div>
                      {hasUnread && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full border-2 border-background shadow-sm animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 mt-0.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <strong className={`text-sm truncate ${hasUnread ? 'text-foreground font-bold' : 'text-foreground/90 font-medium'}`}>
                          {conv.displayName} ({displayPhone(conv.latest.telefone)})
                        </strong>
                        <span className={`text-[11px] shrink-0 ml-2 font-medium ${hasUnread ? 'text-primary' : 'text-muted-foreground'}`}>
                          {formatRelativeDate(conv.latest.created_at)}
                        </span>
                      </div>
                      <p className={`text-xs line-clamp-1 ${hasUnread ? 'text-foreground/80 font-medium' : 'text-muted-foreground'}`}>
                        {conv.latest.mensagem}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="max-w-full truncate text-[10px] font-medium text-muted-foreground">
                          {conv.channelLabel}
                        </span>
                        {assigneeName && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary/90 bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                            <UserPlus size={10} /> Atendendo: {assigneeName}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                  {isAdmin && !conv.isDraft && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        void (conv.isArchived
                          ? handleUnarchiveConversation(conv)
                          : handleArchiveConversation(conv));
                      }}
                      className="absolute right-4 bottom-4 inline-flex items-center gap-1 rounded-lg border border-foreground/10 bg-background/80 px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
                    >
                      {conv.isArchived ? <ArchiveRestore size={12} /> : <Archive size={12} />}
                      {conv.isArchived ? "Reabrir" : "Arquivar"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Renders the chat column
  const renderChatColumn = () => {
    if (!selectedConversation) {
      return (
        <div className={`flex-1 bg-background lg:bg-card/50 hidden lg:flex flex-col items-center justify-center text-center p-8 z-0`}>
          <div className="w-24 h-24 rounded-3xl bg-foreground/5 flex items-center justify-center mb-6 shadow-xl border border-foreground/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
            <MessageCircle size={40} className="text-foreground/60 relative z-10" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-foreground tracking-tight">Inbox do Funil Comercial</h2>
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed">Selecione uma conversa na lista para começar o atendimento. Responda rapidamente e acompanhe o contexto de CRM do seu contato em tempo real.</p>
        </div>
      );
    }

    return (
      <div className={`flex-1 bg-background lg:bg-card/30 flex-col h-full ${mobileView === "chat" ? "flex animate-in slide-in-from-right duration-200 absolute inset-0 z-20 lg:static" : "hidden lg:flex"}`}>
        {/* Chat Header */}
        <div className="h-16 shrink-0 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 shadow-sm z-10">
          <div className="flex items-center gap-3">
            {/* Mobile back button */}
            <button onClick={() => setMobileView("list")} className="lg:hidden p-2.5 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-foreground hover:bg-foreground/10 transition-colors">
              <MoveRight size={22} className="rotate-180" />
            </button>
            
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setMobileView("context")}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center font-bold text-foreground shadow-sm border border-foreground/10">
                {(selectedConversation?.displayName ?? "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm leading-tight truncate max-w-[160px] sm:max-w-xs text-foreground">{selectedConversation?.displayName}</h3>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  <span className="truncate font-medium">{selected?.status ?? "Atendimento"} • {sourceMessage?.canal}</span>
                  {selectedAssigneeName && (
                    <span className="truncate font-medium text-primary">• Atendendo: {selectedAssigneeName}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canTransfer && (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setTransferMenuOpen((v) => !v)}
                  disabled={assigning}
                  className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-all flex items-center gap-1.5 border border-primary/20 disabled:opacity-50"
                >
                  <UserPlus size={16} /> Transferir
                </button>
                {transferMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 max-h-72 overflow-y-auto bg-card border border-border rounded-xl shadow-xl z-50 py-1.5">
                    {teamMembers.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleAssign(member)}
                        disabled={assigning}
                        className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors flex items-center justify-between gap-2 hover:bg-foreground/10 disabled:opacity-50 ${selectedAssignment?.assigned_to === member.id ? "text-primary" : "text-foreground"}`}
                      >
                        <span className="truncate">{member.nome || member.email}</span>
                        {selectedAssignment?.assigned_to === member.id && (
                          <CheckCircle2 size={14} className="shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => sourceMessage && onUpdateMessageStatus(sourceMessage, "Resolvido", 0)}
              className="px-4 py-2 rounded-xl bg-green-500/10 text-green-500 font-bold text-xs hover:bg-green-500/20 transition-all hidden sm:flex items-center gap-1.5 border border-green-500/20"
            >
              <CheckCircle2 size={16} /> Resolver
            </button>
            <button
              onClick={() => setMobileView("context")}
              className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-foreground bg-foreground/5 hover:bg-foreground/10 transition-colors"
            >
              <UsersRound size={20} />
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4 scroll-smooth">
          <div className="text-center my-6 sticky top-0 z-0">
            <span className="px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase bg-card shadow-md border border-border rounded-full text-muted-foreground backdrop-blur-md">
              Início da conversa
            </span>
          </div>
          
          {selectedConversation.messages.map((message, index) => {
            const isInbound = message.direction === "inbound";
            const failed = !isInbound && message.delivery_status === "failed";
            // Check if previous message is from same sender to group them (optional enhancement, skipping complex logic for now)
            return (
              <div key={message.id} className={`flex flex-col max-w-[85%] lg:max-w-[75%] ${isInbound ? 'self-start' : 'self-end'} group`}>
                <div
                  className={`px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
                    isInbound
                      ? 'bg-card text-card-foreground rounded-2xl rounded-tl-sm border border-border'
                      : failed
                        ? 'bg-primary/60 text-primary-foreground rounded-2xl rounded-tr-sm ring-1 ring-red-500/50'
                        : 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
                  }`}
                >
                  {message.mensagem}
                </div>
                <div className={`text-[10px] font-medium mt-1.5 opacity-70 group-hover:opacity-100 transition-opacity ${isInbound ? 'text-left ml-1 text-muted-foreground' : 'text-right mr-1 flex items-center justify-end gap-1.5 text-muted-foreground'}`}>
                  <span>{formatRelativeDate(message.created_at)}</span>
                  {!isInbound && (
                    <DeliveryBadge status={message.delivery_status} error={message.delivery_error} />
                  )}
                </div>
                {failed && message.delivery_error && (
                  <div className="text-[10px] text-red-500 mt-1 mr-1 text-right leading-snug">
                    {message.delivery_error}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Footer / Composer */}
        <div className="p-3 lg:p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-background lg:bg-card/90 border-t border-border shrink-0 backdrop-blur-lg">
          {activeChannels.length === 0 && !isSeller ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 max-w-4xl mx-auto">
              <div className="flex items-center gap-3 text-sm">
                <span className="shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Smartphone size={16} />
                </span>
                <div>
                  <strong className="block">WhatsApp Desconectado</strong>
                  <span className="opacity-80">Conecte uma instância para continuar atendendo seus contatos.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/perfil")}
                className="shrink-0 whitespace-nowrap px-4 py-2 bg-amber-500 text-amber-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors w-full sm:w-auto"
              >
                Reconectar WhatsApp
              </button>
            </div>
          ) : (
            <form onSubmit={handleReplySubmit} className="flex items-end gap-2 lg:gap-3 max-w-4xl mx-auto">
              {metaActive && (
                <button
                  type="button"
                  onClick={() => setTemplatePickerOpen(true)}
                  title="Enviar template aprovado (Meta)"
                  className="shrink-0 h-[52px] w-[52px] rounded-2xl bg-foreground/5 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
                >
                  <FileText size={20} />
                </button>
              )}
              <div className="flex-1 bg-card rounded-2xl border border-border overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all shadow-inner">
                <textarea
                  className="w-full bg-transparent px-4 py-3.5 text-sm resize-none outline-none min-h-[52px] max-h-[150px] text-foreground placeholder:text-muted-foreground/70"
                  rows={1}
                  placeholder="Escreva sua resposta..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleReplySubmit(e as any);
                    }
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isSaving || !replyText.trim()}
                className="shrink-0 h-[52px] w-[52px] rounded-2xl bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-md disabled:shadow-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSaving ? <RotateCcw size={20} className="animate-spin" /> : <Send size={20} className="ml-1" />}
              </button>
            </form>
          )}
        </div>

        <TemplatePicker
          open={templatePickerOpen}
          onClose={() => setTemplatePickerOpen(false)}
          loadTemplates={onLoadTemplates}
          contactName={selectedConversation?.displayName ?? ""}
          onSend={async (template, variables, renderedText) => {
            await onSendTemplate({
              phone: sourcePhone || selectedConversation?.key || "",
              contactId: conversationContactId ?? contactByPhone?.id ?? null,
              leadId: conversationLeadId ?? leadByPhone?.id ?? null,
              renderedText,
              template: {
                name: template.name,
                language: template.language,
                variables,
              },
            });
          }}
        />
      </div>
    );
  };

  // Renders the CRM Context column
  const renderContextColumn = () => {
    if (!selectedConversation) return null;

    return (
      <div className={`flex-col bg-background border-l border-border h-full overflow-y-auto ${mobileView === "context" ? "flex animate-in slide-in-from-right duration-200 absolute inset-0 z-50 lg:static" : "hidden lg:flex"} w-full lg:w-[320px] xl:w-[380px] shrink-0`}>
        
        {/* Mobile header for context */}
        <div className="lg:hidden h-16 shrink-0 border-b border-border bg-background/80 backdrop-blur-md flex items-center px-4 shadow-sm z-10 sticky top-0">
          <button onClick={() => setMobileView("chat")} className="p-2.5 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-foreground hover:bg-foreground/10 transition-colors gap-2">
            <MoveRight size={22} className="rotate-180 shrink-0" /> <span className="font-bold text-sm">Voltar ao Chat</span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-8 scroll-smooth">
          
          {/* AI Recommendation Panel */}
          {recommendation && (
            <div className={`p-5 rounded-3xl border shadow-lg relative overflow-hidden ${recommendation.priority === 'Alta' ? 'bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/30' : 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30'}`}>
              <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-20 pointer-events-none ${recommendation.priority === 'Alta' ? 'bg-amber-500' : 'bg-primary'}`} />
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <Sparkles size={18} className={recommendation.priority === 'Alta' ? 'text-amber-500' : 'text-primary'} />
                <h3 className="font-bold text-sm text-foreground">Inteligência Comercial</h3>
              </div>
              <p className="text-[13px] font-medium text-foreground/90 mb-4 relative z-10 leading-relaxed">{recommendation.nextAction}</p>
              <button 
                type="button"
                className={`w-full p-3.5 rounded-xl text-left text-[13px] border transition-all relative z-10 shadow-sm flex flex-col gap-1.5 ${recommendation.priority === 'Alta' ? 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 text-amber-600 dark:text-amber-100 hover:border-amber-500/40' : 'bg-primary/10 border-primary/20 hover:bg-primary/20 text-primary-600 dark:text-primary-100 hover:border-primary/40'}`}
                onClick={() => setReplyText(recommendation.suggestedReply)}
                title="Clique para preencher a resposta"
              >
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Usar Sugestão</span>
                <span className="font-medium">"{recommendation.suggestedReply}"</span>
              </button>
            </div>
          )}

          {/* CRM Context Panel */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-xs tracking-widest uppercase text-muted-foreground ml-1">Contexto de CRM</h3>
            
            <div className="flex flex-col gap-4">
              {/* Contato Link */}
              <div className={`p-5 rounded-2xl border flex flex-col gap-3.5 shadow-sm transition-all ${linkedContact ? 'bg-card border-green-500/20' : 'bg-card border-border'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <UsersRound size={18} className={linkedContact ? 'text-green-500' : 'text-muted-foreground'} />
                    <span>Contato</span>
                  </div>
                  {linkedContact && <CheckCircle2 size={16} className="text-green-500" />}
                </div>
                
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {linkedContact ? <span className="text-foreground/80">{linkedContact.nome} <br/><span className="opacity-70 text-[11px] font-medium">{linkedContact.telefone}</span></span> : "Nenhum contato encontrado. Deseja registrar no banco de dados?"}
                </p>

                <button
                  type="button"
                  className={`w-full py-2.5 px-3 rounded-xl text-[13px] font-bold transition-all ${conversationHasContactLink ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md'}`}
                  disabled={isSaving || !sourceMessage || conversationHasContactLink}
                  onClick={() => sourceMessage && onCreateContact(sourceMessage)}
                >
                  {contactActionLabel}
                </button>
              </div>

              {/* Lead Link */}
              <div className={`p-5 rounded-2xl border flex flex-col gap-3.5 shadow-sm transition-all ${linkedLead ? 'bg-card border-green-500/20' : 'bg-card border-border'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Target size={18} className={linkedLead ? 'text-green-500' : 'text-muted-foreground'} />
                    <span>Lead</span>
                  </div>
                  {linkedLead && <CheckCircle2 size={16} className="text-green-500" />}
                </div>
                
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {linkedLead ? <span className="text-foreground/80">Lead ativo com interesse em <strong>{linkedLead.interesse || 'indefinido'}</strong>.</span> : "O contato demonstrou interesse comercial? Transforme-o em Lead."}
                </p>

                <button
                  type="button"
                  className={`w-full py-2.5 px-3 rounded-xl text-[13px] font-bold transition-all ${conversationHasLeadLink ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md'}`}
                  disabled={isSaving || !sourceMessage || conversationHasLeadLink}
                  onClick={() => sourceMessage && onCreateLead(sourceMessage)}
                >
                  {leadActionLabel}
                </button>
              </div>

              {/* Oportunidade Link */}
              <div className={`p-5 rounded-2xl border flex flex-col gap-3.5 shadow-sm transition-all ${linkedOpportunity ? 'bg-card border-green-500/20' : 'bg-card border-border'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <CircleDollarSign size={18} className={linkedOpportunity ? 'text-green-500' : 'text-muted-foreground'} />
                    <span>Oportunidade</span>
                  </div>
                  {linkedOpportunity && <CheckCircle2 size={16} className="text-green-500" />}
                </div>
                
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {linkedOpportunity ? <span className="text-foreground/80">Oportunidade aberta na etapa: <strong>{linkedOpportunity.etapa}</strong>.</span> : "Negociação iniciada? Abra uma oportunidade no Funil."}
                </p>

                <button
                  type="button"
                  className={`w-full py-2.5 px-3 rounded-xl text-[13px] font-bold transition-all ${conversationHasOpportunityReady ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md'}`}
                  disabled={isSaving || !sourceMessage || conversationHasOpportunityReady}
                  onClick={() => sourceMessage && onCreateOpportunity(sourceMessage)}
                >
                  {opportunityActionLabel}
                </button>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    );
  };

  return (
    // Fixed height wrapper taking full space below top navbar
    // Added negative top margin to counteract `.content` padding (18px mobile, 32px desktop)
    <div className="flex -mx-4 sm:-mx-8 -mt-[18px] lg:-mt-8 -mb-[18px] lg:-mb-8 h-[calc(100%+2.25rem)] lg:h-[calc(100%+4rem)] border-t border-border overflow-hidden relative">
      {renderListColumn()}
      {renderChatColumn()}
      {renderContextColumn()}
    </div>
  );
}
