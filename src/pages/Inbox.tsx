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
  const [filterTab, setFilterTab] = useState<"abertas" | "nao_lidas" | "todas">("abertas");
  
  // Mobile UI States: "list" | "chat" | "context"
  const [mobileView, setMobileView] = useState<"list" | "chat" | "context">("list");

  const displayedConversations = useMemo(() => {
    return conversations.filter(conv => {
      if (filterTab === "nao_lidas") return conv.unreadCount > 0;
      if (filterTab === "abertas") return conv.latest.status !== "Resolvido";
      return true;
    });
  }, [conversations, filterTab]);

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
    <div className={`flex-col bg-card border-r border-white/5 h-full overflow-hidden ${mobileView === "list" ? "flex" : "hidden lg:flex"} lg:w-[320px] xl:w-[380px] shrink-0`}>
      <div className="p-4 border-b border-white/5 bg-black/20 flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Inbox</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => onOpenModal("channel")} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors" title="Canais">
              <Plus size={18} />
            </button>
          </div>
        </div>
        
        {/* Search / Filters */}
        <div className="flex bg-white/5 rounded-xl p-1">
          <button 
            onClick={() => setFilterTab("abertas")}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors ${filterTab === 'abertas' ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Abertas
          </button>
          <button 
            onClick={() => setFilterTab("nao_lidas")}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors ${filterTab === 'nao_lidas' ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Não Lidas
          </button>
          <button 
            onClick={() => setFilterTab("todas")}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors ${filterTab === 'todas' ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Todas
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {activeChannels.length === 0 && channels.length > 0 && (
          <div className="p-4 m-4 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl">
            Nenhum canal ativo para receber mensagens.
          </div>
        )}
        
        {displayedConversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageCircle size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nenhuma conversa encontrada.</p>
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
                  className={`flex items-start gap-3 p-4 border-b border-white/5 text-left transition-all hover:bg-white/[0.02] ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'}`}
                >
                  <div className="relative shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-muted-foreground">
                      {conv.latestInbound.remetente_nome.charAt(0).toUpperCase()}
                    </div>
                    {hasUnread && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full border-2 border-[#121212]" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <strong className={`text-sm truncate ${hasUnread ? 'text-foreground' : 'text-foreground/80'}`}>
                        {conv.latestInbound.remetente_nome}
                      </strong>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {new Date(conv.latest.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        <div className={`flex-1 bg-black/20 hidden lg:flex flex-col items-center justify-center text-center p-8`}>
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <MessageCircle size={32} className="text-muted-foreground/30" />
          </div>
          <h2 className="text-xl font-bold mb-2">Central de Atendimento</h2>
          <p className="text-muted-foreground max-w-sm">Selecione uma conversa na barra lateral para começar a responder e qualificar seus leads.</p>
        </div>
      );
    }

    return (
      <div className={`flex-1 bg-black/20 flex-col h-full ${mobileView === "chat" ? "flex" : "hidden lg:flex"}`}>
        {/* Chat Header */}
        <div className="h-16 shrink-0 border-b border-white/5 bg-card/50 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile back button */}
            <button onClick={() => setMobileView("list")} className="lg:hidden p-3 -ml-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-muted-foreground hover:bg-white/5">
              <MoveRight size={20} className="rotate-180" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">
                {sourceMessage?.remetente_nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm leading-tight truncate max-w-[160px] sm:max-w-xs">{sourceMessage?.remetente_nome}</h3>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block shrink-0" />
                  <span className="truncate">{selected?.status ?? "Atendimento"} • {sourceMessage?.canal}</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => sourceMessage && onUpdateMessageStatus(sourceMessage, "Resolvido", 0)}
              className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 font-semibold text-xs hover:bg-green-500/20 transition-colors hidden sm:flex items-center gap-1"
            >
              <CheckCircle2 size={14} /> Resolver
            </button>
            <button 
              onClick={() => setMobileView("context")}
              className="lg:hidden p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-muted-foreground hover:bg-white/5"
            >
              <UsersRound size={20} />
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4">
          <div className="text-center my-4">
            <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-white/5 rounded-full text-muted-foreground">Início da conversa</span>
          </div>
          
          {selectedConversation.messages.map((message) => {
            const isInbound = message.direction === "inbound";
            return (
              <div key={message.id} className={`flex flex-col max-w-[85%] ${isInbound ? 'self-start' : 'self-end'}`}>
                <div 
                  className={`p-3.5 rounded-2xl text-sm ${
                    isInbound 
                      ? 'bg-white/10 text-foreground rounded-tl-sm' 
                      : 'bg-primary text-primary-foreground rounded-tr-sm'
                  }`}
                >
                  {message.mensagem}
                </div>
                <div className={`text-[10px] text-muted-foreground mt-1 ${isInbound ? 'text-left' : 'text-right'}`}>
                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Footer / Composer */}
        <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:pb-4 bg-card/80 border-t border-white/5 shrink-0">
          <form onSubmit={handleReplySubmit} className="flex items-end gap-3 max-w-4xl mx-auto">
            <div className="flex-1 bg-black/40 rounded-2xl border border-white/10 overflow-hidden focus-within:border-primary/50 transition-colors">
              <textarea
                className="w-full bg-transparent p-4 text-sm resize-none outline-none min-h-[50px] max-h-[150px]"
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
              className="shrink-0 h-[50px] w-[50px] rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-lg"
            >
              <Send size={18} className="ml-1" />
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
      <div className={`flex-col bg-card border-l border-white/5 h-full overflow-y-auto ${mobileView === "context" ? "flex absolute inset-0 z-50" : "hidden lg:flex"} lg:w-[320px] xl:w-[380px] shrink-0`}>
        
        {/* Mobile header for context */}
        <div className="lg:hidden h-16 shrink-0 border-b border-white/5 bg-card flex items-center px-4">
          <button onClick={() => setMobileView("chat")} className="p-3 -ml-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-muted-foreground hover:bg-white/5 gap-2">
            <MoveRight size={20} className="rotate-180 shrink-0" /> <span className="font-semibold text-sm">Voltar ao Chat</span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-8">
          
          {/* AI Recommendation Panel */}
          {recommendation && (
            <div className={`p-5 rounded-3xl border ${recommendation.priority === 'Alta' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-primary/5 border-primary/20'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className={recommendation.priority === 'Alta' ? 'text-amber-500' : 'text-primary'} />
                <h3 className="font-bold text-sm">Inteligência Comercial</h3>
              </div>
              <p className="text-sm font-medium text-foreground mb-2">{recommendation.nextAction}</p>
              <div 
                className="p-3 rounded-xl bg-black/20 text-xs text-muted-foreground border border-white/5 cursor-pointer hover:bg-white/5 transition-colors group"
                onClick={() => setReplyText(recommendation.suggestedReply)}
                title="Clique para usar esta sugestão"
              >
                <span className="block mb-1 text-[10px] uppercase font-bold tracking-wider opacity-50 group-hover:text-primary transition-colors">Sugestão de resposta (Clique para usar)</span>
                "{recommendation.suggestedReply}"
              </div>
            </div>
          )}

          {/* CRM Context Panel */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-sm tracking-widest uppercase text-muted-foreground">Contexto de CRM</h3>
            
            <div className="flex flex-col gap-3">
              {/* Contato Link */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <UsersRound size={16} className="text-muted-foreground" />
                    <span>Contato</span>
                  </div>
                  {linkedContact && <CheckCircle2 size={14} className="text-green-500" />}
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {linkedContact ? `${linkedContact.nome} (${linkedContact.telefone})` : "Nenhum contato encontrado. Deseja registrar no banco de dados?"}
                </p>

                <button
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${conversationHasContactLink ? 'bg-white/5 text-muted-foreground cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-foreground'}`}
                  disabled={isSaving || !sourceMessage || conversationHasContactLink}
                  onClick={() => sourceMessage && onCreateContact(sourceMessage)}
                >
                  {contactActionLabel}
                </button>
              </div>

              {/* Lead Link */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Target size={16} className="text-muted-foreground" />
                    <span>Lead</span>
                  </div>
                  {linkedLead && <CheckCircle2 size={14} className="text-green-500" />}
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {linkedLead ? `Lead ativo com interesse em ${linkedLead.interesse || 'indefinido'}.` : "O contato demonstrou interesse comercial? Transforme-o em Lead."}
                </p>

                <button
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${conversationHasLeadLink ? 'bg-white/5 text-muted-foreground cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg'}`}
                  disabled={isSaving || !sourceMessage || conversationHasLeadLink}
                  onClick={() => sourceMessage && onCreateLead(sourceMessage)}
                >
                  {leadActionLabel}
                </button>
              </div>

              {/* Oportunidade Link */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <CircleDollarSign size={16} className="text-muted-foreground" />
                    <span>Oportunidade</span>
                  </div>
                  {linkedOpportunity && <CheckCircle2 size={14} className="text-green-500" />}
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {linkedOpportunity ? `Oportunidade aberta na etapa: ${linkedOpportunity.etapa}.` : "Negociação iniciada? Abra uma oportunidade no Funil."}
                </p>

                <button
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${conversationHasOpportunityReady ? 'bg-white/5 text-muted-foreground cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg'}`}
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
    <div className="flex -mx-4 sm:-mx-8 h-[calc(100dvh-5rem)] lg:h-[calc(100vh-6rem)] lg:min-h-[600px] border-t border-white/5 overflow-hidden relative">
      {renderListColumn()}
      {renderChatColumn()}
      {renderContextColumn()}
    </div>
  );
}
