import { HeroPanel, PageIntro, MetricCard, Panel, ActionItem, TablePanel, EmptyState, Modal, ContactModal, LeadModal, OpportunityModal, MessageModal, ChannelModal, EntityForm, TextField, SelectField, LoadingScreen } from "../components/SharedUI";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { monthlyForProduct, effectiveValue } from "../lib/products";
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
  Trash2,
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


// Avatar Utilities
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-red-500/20 text-red-500",
    "bg-blue-500/20 text-blue-500",
    "bg-green-500/20 text-green-500",
    "bg-amber-500/20 text-amber-500",
    "bg-purple-500/20 text-purple-500",
    "bg-pink-500/20 text-pink-500",
    "bg-indigo-500/20 text-indigo-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (name.substring(0, 2)).toUpperCase();
};

function PipelineCard({
  item,
  onEdit,
  onDelete,
  onClick,
}: {
  item: Opportunity;
  onEdit: (opportunity: Opportunity) => void;
  onDelete: (opportunity: Opportunity) => void;
  onClick: (opportunity: Opportunity) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
      }
    : undefined;

  const isWeak = isWeakNextAction(item);
  const isNoValue = Number(item.valor) <= 0;
  const showWarning = isWeak || isNoValue;

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onPointerUp={(e) => {
        // Prevent click if dragging
        if (!transform) onClick(item);
      }}
      className={`group w-full min-w-0 max-w-full bg-card p-4 flex flex-col gap-3 rounded-2xl border transition-all cursor-grab active:cursor-grabbing hover:border-primary/50 relative overflow-hidden
        ${isDragging ? 'shadow-2xl border-primary scale-[1.03] rotate-2' : 'border-foreground/10 shadow-sm'}
        ${showWarning ? 'border-amber-500/30' : ''}
      `}
    >
      {/* Risk Ribbon */}
      {showWarning && (
        <div className="absolute top-0 right-0 p-1.5 px-3 bg-amber-500 text-amber-950 text-[9px] font-bold uppercase tracking-wider rounded-bl-lg flex items-center gap-1 shadow-lg">
          <Clock3 size={10} /> Pendente
        </div>
      )}

      <div className="w-full min-w-0 max-w-full overflow-hidden">
        <h3 className="font-bold text-sm text-foreground leading-tight truncate pr-16 w-full break-all">{item.titulo}</h3>
        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1 block truncate w-full break-all">
          {item.lead_id ? "Lead" : "Contato"}
        </span>
        {item.produto && (
          <span className="inline-block mt-1.5 max-w-full truncate text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
            {item.produto}
          </span>
        )}
      </div>
      
      <div className="flex items-baseline gap-2 flex-wrap">
        <strong className="text-xl font-black tracking-tight text-primary">{formatMoney(effectiveValue(item.valor, item.produto))}</strong>
        {monthlyForProduct(item.produto) > 0 && (
          <span className="text-[11px] font-semibold text-muted-foreground">
            + {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(monthlyForProduct(item.produto))}/mês
          </span>
        )}
      </div>
      
      <div className="bg-foreground/5 p-2 rounded-xl border border-foreground/5 w-full min-w-0 max-w-full overflow-hidden">
        <p className="text-xs text-muted-foreground font-medium flex items-start gap-1.5 leading-snug">
          <Target size={14} className="shrink-0 mt-0.5" /> 
          <span className="min-w-0 flex-1 break-words line-clamp-3">
            {item.proxima_acao || "Ação não definida"}
          </span>
        </p>
      </div>
      
      <footer className="flex items-center justify-between mt-auto pt-2 border-t border-foreground/5">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${getAvatarColor(item.responsavel)}`} title={item.responsavel}>
            {getInitials(item.responsavel)}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-foreground/10 px-2 py-1.5 rounded-lg transition-colors"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(item);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            type="button"
          >
            <Pencil size={12} /> Editar
          </button>
          <button
            className="flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(item);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            type="button"
            title="Excluir"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </footer>
    </article>
  );
}

function PipelineColumn({ column, onCardClick }: { column: any, onCardClick: (item: Opportunity) => void }) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.stage,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[85vw] w-[85vw] max-w-[85vw] md:min-w-[340px] md:w-[340px] md:max-w-[340px] rounded-[1.5rem] bg-card/40 border border-foreground/5 overflow-hidden transition-colors ${isOver ? "bg-primary/5 border-primary/30 ring-1 ring-primary/30" : ""}`}
    >
      <header className="flex items-center justify-between p-5 border-b border-foreground/5 bg-background/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-wide text-foreground">{column.stage}</span>
        </div>
        <strong className="text-xs font-black bg-foreground/10 text-muted-foreground px-2.5 py-1 rounded-full shadow-inner">{column.items.length}</strong>
      </header>
      <div className="flex-1 p-3 space-y-3 overflow-y-auto overflow-x-hidden min-h-[150px] relative w-full max-w-full">
        {isOver && (
          <div className="absolute inset-0 bg-primary/5 z-0 pointer-events-none rounded-b-[1.5rem]" />
        )}
        {column.items.map((item: any) => (
          <PipelineCard key={item.id} item={item} onEdit={column.onEdit} onDelete={column.onDelete} onClick={onCardClick} />
        ))}
        {column.items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-foreground/10 rounded-2xl opacity-50">
            <MoveRight size={24} className="mb-2 text-muted-foreground" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Solte aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function PipelineSignalCard({
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
  let styleClasses = "bg-card border border-foreground/5 text-muted-foreground";
  let iconColor = "text-muted-foreground opacity-50";
  
  if (tone === "warning") {
    styleClasses = "bg-amber-500/5 border border-amber-500/20";
    iconColor = "text-amber-500 opacity-20";
  } else if (tone === "success") {
    styleClasses = "bg-primary/5 border border-primary/20";
    iconColor = "text-primary opacity-20";
  }

  return (
    <article className={`rounded-2xl p-4 md:p-5 flex flex-col gap-3 relative overflow-hidden group ${styleClasses}`}>
      <div className={`absolute top-0 right-0 p-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 ${iconColor}`}>
        <Icon size={64} />
      </div>
      <div className="flex items-center justify-between z-10 relative">
        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 ${tone === 'warning' ? 'text-amber-500' : tone === 'success' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Icon size={14}/> {label}
        </span>
      </div>
      <strong className="text-3xl sm:text-4xl font-black text-foreground z-10 relative tracking-tighter">{value}</strong>
      <small className="z-10 relative text-[10px] uppercase font-bold tracking-wider opacity-70 mt-auto truncate">{hint}</small>
    </article>
  );
}

export default function PipelinePage({
  leads,
  opportunities,
  onEditOpportunity,
  onDeleteOpportunity,
  onOpenModal,
  onDragEnd,
}: {
  leads: Lead[];
  opportunities: CrmSnapshot["opportunities"];
  onEditOpportunity: (opportunity: Opportunity) => void;
  onDeleteOpportunity: (opportunityId: string) => Promise<void>;
  onOpenModal: (modal: ModalType) => void;
  onDragEnd: (event: any) => void;
}) {
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [opportunityToDelete, setOpportunityToDelete] = useState<Opportunity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [outcomeLoading, setOutcomeLoading] = useState<"Ganho" | "Perdido" | null>(null);
  const queryClient = useQueryClient();

  // Marca a oportunidade como Ganho/Perdido (ação rápida do painel). Atualiza a UI
  // de forma otimista (mesmo padrão do drag) e persiste; em erro, recarrega os dados.
  const handleSetOutcome = async (opportunity: Opportunity, outcome: "Ganho" | "Perdido") => {
    if (outcomeLoading) return;
    setOutcomeLoading(outcome);
    queryClient.setQueriesData({ queryKey: ["crmSnapshot"] }, (prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        opportunities: prev.opportunities.map((opp: any) =>
          opp.id === opportunity.id ? { ...opp, etapa: outcome } : opp,
        ),
      };
    });
    try {
      await updateOpportunityStage(opportunity.id, outcome);
      toast.success(outcome === "Ganho" ? "Oportunidade marcada como Ganho 🎉" : "Oportunidade marcada como Perdido");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar a oportunidade");
      queryClient.invalidateQueries({ queryKey: ["crmSnapshot"] });
    } finally {
      setOutcomeLoading(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!opportunityToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteOpportunity(opportunityToDelete.id);
      setOpportunityToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const grouped = useMemo(
    () =>
      stages.map((stage) => ({
        stage,
        items: opportunities.filter((item) => item.etapa === stage),
        onEdit: onEditOpportunity,
        onDelete: (opportunity: Opportunity) => setOpportunityToDelete(opportunity),
      })),
    [onEditOpportunity, opportunities],
  );
  
  const openOpportunities = opportunities.filter(isOpenOpportunity);
  const weakActionCount = openOpportunities.filter(isWeakNextAction).length;
  const noValueCount = openOpportunities.filter(
    (opportunity) => effectiveValue(opportunity.valor, opportunity.produto) <= 0,
  ).length;
  const closingCount = openOpportunities.filter(isClosingStage).length;
  const openValue = openOpportunities.reduce(
    (sum, opportunity) => sum + effectiveValue(opportunity.valor, opportunity.produto),
    0,
  );

  // Receita separada em único (imediato) e recorrente (MRR). O único usa o valor
  // efetivo (1º pagamento) — em serviços só-mensais equivale à mensalidade.
  const sumRevenue = (opps: Opportunity[]) =>
    opps.reduce(
      (acc, o) => {
        acc.unico += effectiveValue(o.valor, o.produto);
        acc.mensal += monthlyForProduct(o.produto);
        return acc;
      },
      { unico: 0, mensal: 0 },
    );
  const wonOpportunities = opportunities.filter((o) => o.etapa === "Ganho");
  const ganho = sumRevenue(wonOpportunities);        // já fechado
  const projecao = sumRevenue(openOpportunities);    // pipeline em aberto
  const formatMoneyExact = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const selectedOpp = opportunities.find(o => o.id === selectedOppId);

  // Keyboard escape to close drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedOppId(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const renderProfileDrawer = () => {
    if (!selectedOpp) return null;
    
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-40"
          onClick={() => setSelectedOppId(null)}
        />
        
        {/* The Drawer */}
        <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[450px] bg-card border-l border-foreground/5 shadow-2xl flex flex-col shrink-0 transition-transform animate-in slide-in-from-right">
          
          <div className="h-16 shrink-0 border-b border-foreground/5 flex items-center justify-between px-6 bg-card/50">
            <h3 className="font-bold text-sm tracking-widest uppercase text-muted-foreground flex items-center gap-2">
              <TrendingUp size={16} /> Oportunidade
            </h3>
            <button 
              onClick={() => setSelectedOppId(null)} 
              className="p-3 -mr-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-muted-foreground hover:bg-foreground/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-card p-6 flex flex-col gap-8">
            
            {/* Header */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md mb-2 inline-block">
                Etapa: {selectedOpp.etapa}
              </span>
              <h2 className="text-2xl font-bold tracking-tight mb-2 leading-tight">{selectedOpp.titulo}</h2>
              <strong className="text-3xl font-black text-foreground mb-4 block">{formatMoney(Number(selectedOpp.valor))}</strong>
            </div>

            {/* Quick Actions (Win/Loss) */}
            {isOpenOpportunity(selectedOpp) ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleSetOutcome(selectedOpp, "Ganho")}
                  disabled={outcomeLoading !== null}
                  className="flex-1 py-3 px-4 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {outcomeLoading === "Ganho" ? <RotateCcw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Ganho
                </button>
                <button
                  type="button"
                  onClick={() => handleSetOutcome(selectedOpp, "Perdido")}
                  disabled={outcomeLoading !== null}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {outcomeLoading === "Perdido" ? <RotateCcw size={16} className="animate-spin" /> : <X size={16} />} Perdido
                </button>
              </div>
            ) : (
              <div className={`p-4 rounded-xl border ${selectedOpp.etapa === 'Ganho' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'} text-center font-bold`}>
                Oportunidade finalizada como {selectedOpp.etapa}
              </div>
            )}
            
            {/* Details Grid */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Contexto Comercial</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-foreground/5 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">Responsável</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] ${getAvatarColor(selectedOpp.responsavel)}`}>
                      {getInitials(selectedOpp.responsavel)}
                    </div>
                    <span className="text-sm font-semibold truncate">{selectedOpp.responsavel}</span>
                  </div>
                </div>
                <div className="p-4 bg-foreground/5 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">Origem</span>
                  <span className="text-sm font-semibold mt-1 truncate">
                    {leads.find((l) => l.id === selectedOpp.lead_id)?.origem || "Não informada"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => { onEditOpportunity(selectedOpp); setSelectedOppId(null); }}
                  className="p-4 bg-foreground/5 hover:bg-foreground/10 rounded-2xl flex flex-col gap-1 col-span-2 border border-foreground/5 text-left transition-colors group"
                >
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                    <Target size={12}/> Próxima Ação
                    <Pencil size={10} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  {isWeakNextAction(selectedOpp) ? (
                    <span className="text-sm italic text-muted-foreground leading-snug mt-1">
                      Defina a próxima ação comercial deste negócio…
                    </span>
                  ) : (
                    <span className="text-sm font-semibold leading-snug mt-1">{selectedOpp.proxima_acao}</span>
                  )}
                </button>
              </div>
            </div>
            
            <button
              className="w-full py-3 px-4 rounded-xl border border-foreground/10 hover:bg-foreground/5 text-foreground font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-auto"
              onClick={() => { onEditOpportunity(selectedOpp); setSelectedOppId(null); }}
            >
              <Pencil size={16} /> Editar Oportunidade
            </button>
            
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100dvh-5rem)] md:h-[calc(100vh-6rem)] -mb-12">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Funil de Vendas</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o fluxo de negociações e receita. Arraste para mover.
          </p>
        </div>
        
        <button 
          onClick={() => onOpenModal(leads.length ? "opportunity" : "lead")}
          className="primary-button hidden sm:flex"
        >
          <Plus size={16} /> Nova Oportunidade
        </button>
        
        {/* Mobile FAB */}
        <button 
          onClick={() => onOpenModal(leads.length ? "opportunity" : "lead")}
          className="fixed bottom-[80px] right-4 z-[35] w-14 h-14 bg-primary text-primary-foreground rounded-full flex sm:hidden items-center justify-center shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0" aria-label="Saude do funil">
        <PipelineSignalCard
          icon={TrendingUp}
          label="Pipeline Aberto"
          value={formatMoney(openValue)}
          hint={`${openOpportunities.length} op(s) em andamento`}
          tone="success"
        />
        <PipelineSignalCard
          icon={Target}
          label="Etapas Finais"
          value={String(closingCount)}
          hint="Proposta ou negociação"
        />
        <PipelineSignalCard
          icon={Clock3}
          label="Sem Ação"
          value={String(weakActionCount)}
          hint="Precisam de compromisso claro"
          tone={weakActionCount ? "warning" : "neutral"}
        />
        <PipelineSignalCard
          icon={CircleDollarSign}
          label="Sem Valor"
          value={String(noValueCount)}
          hint="Afetam previsão comercial"
          tone={noValueCount ? "warning" : "neutral"}
        />
      </section>

      {/* Receita: já fechado (Ganho) vs projeção (pipeline aberto) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0" aria-label="Receita fechada e projetada">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 md:p-5 flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-500">
            <CheckCircle2 size={14} /> Fechado (Ganho)
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <strong className="text-2xl sm:text-3xl font-black tracking-tighter text-foreground">{formatMoney(ganho.unico)}</strong>
            <span className="text-xs font-bold text-muted-foreground">único</span>
          </div>
          {ganho.mensal > 0 && (
            <span className="text-sm font-bold text-emerald-500">+ {formatMoneyExact(ganho.mensal)}/mês recorrente</span>
          )}
          <span className="text-[11px] text-muted-foreground mt-auto">{wonOpportunities.length} negócio(s) ganho(s)</span>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 md:p-5 flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary">
            <TrendingUp size={14} /> Projeção (pipeline aberto)
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <strong className="text-2xl sm:text-3xl font-black tracking-tighter text-foreground">{formatMoney(projecao.unico)}</strong>
            <span className="text-xs font-bold text-muted-foreground">único</span>
          </div>
          {projecao.mensal > 0 && (
            <span className="text-sm font-bold text-primary">+ {formatMoneyExact(projecao.mensal)}/mês recorrente</span>
          )}
          <span className="text-[11px] text-muted-foreground mt-auto">{openOpportunities.length} em aberto no funil</span>
        </div>
      </section>

      <div className="flex-1 overflow-hidden relative">
        <DndContext onDragEnd={onDragEnd}>
          {/* Scrollable Container just for the Board */}
          <section className="absolute inset-0 flex gap-4 overflow-x-auto pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-4 custom-scrollbar" aria-label="Funil de vendas">
            {grouped.map((column) => (
              <PipelineColumn key={column.stage} column={column} onCardClick={(o) => setSelectedOppId(o.id)} />
            ))}
          </section>
        </DndContext>
      </div>

      {renderProfileDrawer()}

      <ConfirmDialog
        open={Boolean(opportunityToDelete)}
        title="Excluir oportunidade?"
        message={`Tem certeza de que deseja excluir a oportunidade "${opportunityToDelete?.titulo ?? ""}"? Esta ação remove o card do funil e não pode ser desfeita. O lead e as conversas vinculados são preservados.`}
        isProcessing={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setOpportunityToDelete(null)}
      />
    </div>
  );
}
