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
import { useEffect, useMemo, useState, useRef } from "react";
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
} from "../lib/crmService";
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
  CrmSnapshot,
  InboxMessage,
  IntegrationChannel,
  Lead,
  Opportunity,
  OpportunityStage,
  Route as AppRoute,
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
  
  if (p.length === 10 || p.length === 11) {
    p = "55" + p;
  }
  
  if (p.startsWith("55") && p.length === 13 && p[4] === "9") {
    // Return the 12-digit version (removing the 9th digit)
    return p.slice(0, 4) + p.slice(5);
  }
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


export default function InboxPage({
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
  const [filterTab, setFilterTab] = useState<"abertas" | "nao_lidas" | "todas">("abertas");
  const [localSearch, setLocalSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mobile UI States: "list" | "chat" | "context"
  const [mobileView, setMobileView] = useState<"list" | "chat" | "context">("list");

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, selectedKey]);

  const displayedConversations = useMemo(() => {
    return conversations.filter(conv => {
      if (filterTab === "nao_lidas" && conv.unreadCount === 0) return false;
      if (filterTab === "abertas" && conv.latest.status === "Resolvido") return false;
      
      if (localSearch) {
        const searchTerms = [
          conv.latestInbound.remetente_nome,
          conv.latest.mensagem,
          conv.key
        ];
        if (!matchesQuery(localSearch, searchTerms)) {
          return false;
        }
      }
      return true;
    });
  }, [conversations, filterTab, localSearch]);

  // Selection Logic
  useEffect(() => {
    if (!selectedKey && displayedConversations.length > 0) {
      // Don't auto-select on mobile to keep the list view open initially
      if (window.innerWidth >= 1024) {
        setSelectedKey(displayedConversations[0].key);
      }
    }
  }, [displayedConversations, selectedKey]);

  // View handlers for mobile
  const handleSelectConversation = (key: string) => {
    setSelectedKey(key);
    setMobileView("chat");
  };

  const activeChannels = channels.filter((channel) => channel.status === "ativo");
  const selectedConversation = conversations.find((c) => c.key === selectedKey);
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
      <div className="p-4 border-b border-border bg-black/20 flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Inbox</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => onOpenModal("channel")} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-foreground" title="Canais">
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
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:border-primary/50 focus:bg-white/10 transition-colors text-foreground placeholder:text-muted-foreground"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        
        {/* Search / Filters (Segmented Control) */}
        <div className="flex bg-white/5 rounded-xl p-1 relative">
          <button 
            onClick={() => setFilterTab("abertas")}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all relative z-10 ${filterTab === 'abertas' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}
          >
            Abertas
          </button>
          <button 
            onClick={() => setFilterTab("nao_lidas")}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all relative z-10 ${filterTab === 'nao_lidas' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}
          >
            Não Lidas
          </button>
          <button 
            onClick={() => setFilterTab("todas")}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all relative z-10 ${filterTab === 'todas' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}
          >
            Todas
          </button>
          {/* Active pill background */}
          <div 
            className="absolute top-1 bottom-1 bg-white/10 shadow-sm rounded-lg transition-all duration-300 ease-in-out border border-white/5"
            style={{
              width: 'calc(33.333% - 2.6px)',
              left: filterTab === 'abertas' ? '4px' : filterTab === 'nao_lidas' ? 'calc(33.333% + 2px)' : 'calc(66.666%)'
            }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {activeChannels.length === 0 && channels.length > 0 && (
          <div className="p-4 m-4 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl">
            Nenhum canal ativo para receber mensagens.
          </div>
        )}
        
        {displayedConversations.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground h-full">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <MessageCircle size={28} className="opacity-40" />
            </div>
            <p className="text-sm font-medium">Nenhuma conversa por aqui.</p>
            <p className="text-xs opacity-70 mt-1 max-w-[200px]">Ajuste seus filtros ou aguarde novas mensagens.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {displayedConversations.map((conv) => {
              const isSelected = selectedKey === conv.key;
              const hasUnread = conv.unreadCount > 0;
              return (
                <button
                  key={conv.key}
                  onClick={() => handleSelectConversation(conv.key)}
                  className={`flex items-start gap-3 p-4 border-b border-border text-left transition-all ${isSelected ? 'bg-primary/10 lg:border-l-2 lg:border-l-primary' : 'hover:bg-white/[0.03] lg:border-l-2 lg:border-l-transparent'}`}
                >
                  <div className="relative shrink-0 mt-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-bold text-lg text-foreground shadow-sm border border-white/10">
                      {conv.latestInbound.remetente_nome.charAt(0).toUpperCase()}
                    </div>
                    {hasUnread && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full border-2 border-background shadow-sm animate-pulse" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 mt-0.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <strong className={`text-sm truncate ${hasUnread ? 'text-foreground font-bold' : 'text-foreground/90 font-medium'}`}>
                        {conv.latestInbound.remetente_nome}
                      </strong>
                      <span className={`text-[11px] shrink-0 ml-2 font-medium ${hasUnread ? 'text-primary' : 'text-muted-foreground'}`}>
                        {formatRelativeDate(conv.latest.created_at)}
                      </span>
                    </div>
                    <p className={`text-xs line-clamp-1 ${hasUnread ? 'text-foreground/80 font-medium' : 'text-muted-foreground'}`}>
                      {conv.latest.mensagem}
                    </p>
                  </div>
                </button>
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
          <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mb-6 shadow-xl border border-white/10 relative overflow-hidden">
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
            <button onClick={() => setMobileView("list")} className="lg:hidden p-2.5 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-foreground hover:bg-white/10 transition-colors">
              <MoveRight size={22} className="rotate-180" />
            </button>
            
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setMobileView("context")}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-bold text-foreground shadow-sm border border-white/10">
                {sourceMessage?.remetente_nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm leading-tight truncate max-w-[160px] sm:max-w-xs text-foreground">{sourceMessage?.remetente_nome}</h3>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  <span className="truncate font-medium">{selected?.status ?? "Atendimento"} • {sourceMessage?.canal}</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => sourceMessage && onUpdateMessageStatus(sourceMessage, "Resolvido", 0)}
              className="px-4 py-2 rounded-xl bg-green-500/10 text-green-500 font-bold text-xs hover:bg-green-500/20 transition-all hidden sm:flex items-center gap-1.5 border border-green-500/20"
            >
              <CheckCircle2 size={16} /> Resolver
            </button>
            <button 
              onClick={() => setMobileView("context")}
              className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-foreground bg-white/5 hover:bg-white/10 transition-colors"
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
            // Check if previous message is from same sender to group them (optional enhancement, skipping complex logic for now)
            return (
              <div key={message.id} className={`flex flex-col max-w-[85%] lg:max-w-[75%] ${isInbound ? 'self-start' : 'self-end'} group`}>
                <div 
                  className={`px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
                    isInbound 
                      ? 'bg-card text-card-foreground rounded-2xl rounded-tl-sm border border-border' 
                      : 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
                  }`}
                >
                  {message.mensagem}
                </div>
                <div className={`text-[10px] font-medium text-muted-foreground mt-1.5 opacity-70 group-hover:opacity-100 transition-opacity ${isInbound ? 'text-left ml-1' : 'text-right mr-1'}`}>
                  {formatRelativeDate(message.created_at)}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Footer / Composer */}
        <div className="p-3 lg:p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-background lg:bg-card/90 border-t border-border shrink-0 backdrop-blur-lg">
          <form onSubmit={handleReplySubmit} className="flex items-end gap-2 lg:gap-3 max-w-4xl mx-auto">
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
        </div>
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
          <button onClick={() => setMobileView("chat")} className="p-2.5 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-foreground hover:bg-white/10 transition-colors gap-2">
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
    <div className="flex -mx-4 sm:-mx-8 -mt-[18px] lg:-mt-8 h-[calc(100dvh-5rem+18px)] lg:h-[calc(100vh-6rem+32px)] lg:min-h-[600px] border-t border-border overflow-hidden relative">
      {renderListColumn()}
      {renderChatColumn()}
      {renderContextColumn()}
    </div>
  );
}
