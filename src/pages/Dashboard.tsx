import { HeroPanel, PageIntro, MetricCard, Panel, ActionItem, TablePanel, EmptyState, Modal, ContactModal, LeadModal, OpportunityModal, MessageModal, ChannelModal, EntityForm, TextField, SelectField, LoadingScreen } from "../components/SharedUI";
import type { Session } from "@supabase/supabase-js";
import type { LucideIcon } from "lucide-react";
import { Calendar, Bell, CheckCircle2, CircleDollarSign, Clock3, LogOut, MessageCircle, MoveRight, Pencil, Plus, Send, Search, ShieldCheck, Sparkles, Target, TrendingUp, UsersRound, RotateCcw, Moon, Sun, X } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { Toaster, toast } from "react-hot-toast";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { IMaskInput } from "react-imask";
import { useEffect, useMemo, useState } from "react";
import {
  calculateDashboardRealMetrics,
  calculateGoalProjection,
  clampRate,
  pricingForGoalProduct,
  type GoalProjection,
  type RateMetric,
} from "../lib/dashboardMetrics";
import { effectiveValue, PRODUCTS, type Product } from "../lib/products";
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

const formatMoneyWithCents = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatNumber = (value: number | null | undefined) =>
  value === null || value === undefined || !Number.isFinite(value)
    ? "—"
    : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);

const formatPercent = (metric: RateMetric) =>
  metric.value === null
    ? "Sem dados"
    : new Intl.NumberFormat("pt-BR", {
        style: "percent",
        maximumFractionDigits: 1,
      }).format(metric.value);

const formatDecimalPercent = (value: number | null) =>
  value === null
    ? ""
    : new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 1,
      }).format(value * 100);

const parsePercentInput = (value: string) => {
  const normalized = value.replace(",", ".").trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;
  return clampRate(parsed / 100);
};

const normalizePercentInput = (value: string, fallback: number | null) => {
  const parsedRate = value.trim() ? parsePercentInput(value) : fallback;
  const rate =
    parsedRate === null ? null : Math.round(parsedRate * 1000) / 1000;
  return {
    input: formatDecimalPercent(rate),
    rate,
  };
};

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


// --- DASHBOARD UI COMPONENTS ---

function StatCard({ title, value, icon: Icon, tone = "neutral", actionLabel, onAction, emptyState }: any) {
  const tones: Record<string, string> = {
    neutral: "text-foreground",
    success: "text-green-500",
    warning: "text-amber-500",
    danger: "text-red-500",
  };
  const bgTones: Record<string, string> = {
    neutral: "bg-foreground/5",
    success: "bg-green-500/10",
    warning: "bg-amber-500/10",
    danger: "bg-red-500/10",
  };

  return (
    <div className="flex flex-col rounded-3xl border border-foreground/5 bg-card p-6 shadow-sm relative overflow-hidden group transition-all hover:border-foreground/10 hover:bg-foreground/[0.02]">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${bgTones[tone]}`}>
          <Icon size={24} className={tones[tone]} strokeWidth={1.5} />
        </div>
        {actionLabel && (
          <button onClick={onAction} className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline">
            {actionLabel}
          </button>
        )}
      </div>
      <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
      <div className="text-3xl font-bold tracking-tight mb-2">{value}</div>
      <div className="text-xs text-muted-foreground/50 border-t border-foreground/5 pt-3 mt-auto">
        {emptyState}
      </div>
    </div>
  );
}

function PriorityTaskCard({ task, onAction }: { task: any, onAction: () => void }) {
  const isHigh = task.priority === "Alta";
  return (
    <div className={`flex items-start gap-4 p-5 rounded-2xl border ${isHigh ? 'border-amber-500/30 bg-amber-500/5' : 'border-foreground/5 bg-foreground/[0.02]'} transition-colors hover:border-primary/50`}>
      <div className={`mt-0.5 flex-shrink-0 w-2.5 h-2.5 rounded-full ${isHigh ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-primary'}`} />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground mb-1 truncate">{task.title}</h4>
        <p className="text-xs text-muted-foreground line-clamp-2">{task.summary || task.description}</p>
      </div>
      <button 
        onClick={onAction}
        className="flex-shrink-0 p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
        title="Agir agora"
      >
        <MoveRight size={16} />
      </button>
    </div>
  );
}

function FunnelChart({ opportunities, stages }: { opportunities: Opportunity[], stages: OpportunityStage[] }) {
  const stageData = stages.slice(0, 6).map(stage => {
    const opps = opportunities.filter(o => o.etapa === stage);
    const count = opps.length;
    const value = opps.reduce((sum, o) => sum + Number(o.valor), 0);
    return { stage, count, value };
  });

  const maxCount = Math.max(...stageData.map(d => d.count), 1);

  return (
    <div className="flex flex-col gap-4">
      {stageData.map((data, idx) => {
        const percentage = Math.max((data.count / maxCount) * 100, 2); // Min 2% to show the bar
        const isFirst = idx === 0;
        const isLast = idx === stageData.length - 1;
        
        return (
          <div key={data.stage} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-end text-xs">
              <span className="font-medium text-muted-foreground">{data.stage}</span>
              <span className="text-foreground font-semibold">{data.count} <span className="opacity-50 text-[10px] ml-1">({formatMoney(data.value)})</span></span>
            </div>
            <div className="w-full bg-foreground/10 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${isFirst ? 'bg-foreground/20' : isLast ? 'bg-green-500' : 'bg-primary'}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProjectionResult({
  projection,
}: {
  projection: GoalProjection;
}) {
  if (projection.status === "invalid_ticket") {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
        Informe um ticket/setup maior que zero para calcular a meta.
      </div>
    );
  }

  if (projection.status === "needs_rates") {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-muted-foreground">
        Informe as taxas de conversão para calcular contatos e leads necessários.
      </div>
    );
  }

  if (projection.status === "unreachable") {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-muted-foreground">
        Com taxa zero em uma etapa, a meta não é alcançável. Ajuste a conversão esperada.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <MiniMetric label="Vendas necessárias" value={formatNumber(projection.salesNeeded)} />
      <MiniMetric label="Leads necessários" value={formatNumber(projection.leadsNeeded)} />
      <MiniMetric label="Contatos necessários" value={formatNumber(projection.contactsNeeded)} />
      <MiniMetric
        label="Contatos por dia útil"
        value={formatNumber(projection.contactsPerBusinessDayRemaining)}
      />
      <MiniMetric label="Caixa projetado" value={formatMoney(projection.cashProjected)} />
      <MiniMetric label="MRR novo projetado" value={formatMoneyWithCents(projection.newMrrProjected)} />
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-foreground/5 bg-foreground/[0.02] p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <strong className="mt-1 block text-lg font-bold text-foreground">{value}</strong>
    </div>
  );
}

export default function Dashboard({
  snapshot,
  onOpenModal,
}: {
  snapshot: CrmSnapshot;
  onOpenModal: (modal: ModalType) => void;
}) {
  // Filtro temporal: escopa os KPIs por `created_at` no período selecionado.
  const [period, setPeriod] = useState<"hoje" | "7d" | "mes" | "tudo">("mes");
  const periodStart = useMemo(() => {
    const now = new Date();
    if (period === "hoje") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (period === "7d") {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    if (period === "mes") return new Date(now.getFullYear(), now.getMonth(), 1);
    return null; // tudo
  }, [period]);
  const inPeriod = (dateStr: string) => !periodStart || new Date(dateStr) >= periodStart;

  const realMetrics = useMemo(
    () => calculateDashboardRealMetrics(snapshot, new Date()),
    [snapshot],
  );
  const defaultProduct: Product = "Site / Landing Page";
  const defaultPricing = pricingForGoalProduct(defaultProduct);
  const [goalProduct, setGoalProduct] = useState<Product>(defaultProduct);
  const [monthlyCashGoal, setMonthlyCashGoal] = useState(5000);
  const [setupTicket, setSetupTicket] = useState(defaultPricing.setupTicket);
  const [mrrPerSale, setMrrPerSale] = useState(defaultPricing.mrrPerSale);
  const [mrrPerSaleInput, setMrrPerSaleInput] = useState(String(defaultPricing.mrrPerSale));
  const [manualContactToLeadRate, setManualContactToLeadRate] = useState<number | null>(null);
  const [manualLeadToSaleRate, setManualLeadToSaleRate] = useState<number | null>(null);
  const [contactToLeadRateInput, setContactToLeadRateInput] = useState(() =>
    formatDecimalPercent(realMetrics.rates.contactToLead.value),
  );
  const [leadToSaleRateInput, setLeadToSaleRateInput] = useState(() =>
    formatDecimalPercent(realMetrics.rates.leadToSale.value),
  );

  const handleProductChange = (nextProduct: Product) => {
    setGoalProduct(nextProduct);
    const pricing = pricingForGoalProduct(nextProduct);
    setSetupTicket(pricing.setupTicket);
    setMrrPerSale(pricing.mrrPerSale);
    setMrrPerSaleInput(String(pricing.mrrPerSale));
  };

  const shownContactToLeadRate =
    manualContactToLeadRate ?? realMetrics.rates.contactToLead.value;
  const shownLeadToSaleRate =
    manualLeadToSaleRate ?? realMetrics.rates.leadToSale.value;

  useEffect(() => {
    if (manualContactToLeadRate === null) {
      setContactToLeadRateInput(formatDecimalPercent(realMetrics.rates.contactToLead.value));
    }
  }, [realMetrics.rates.contactToLead.value]);

  useEffect(() => {
    if (manualLeadToSaleRate === null) {
      setLeadToSaleRateInput(formatDecimalPercent(realMetrics.rates.leadToSale.value));
    }
  }, [realMetrics.rates.leadToSale.value]);

  const contactToLeadRate =
    manualContactToLeadRate ?? realMetrics.rates.contactToLead.value;
  const leadToSaleRate =
    manualLeadToSaleRate ?? realMetrics.rates.leadToSale.value;
  const projection = calculateGoalProjection({
    monthlyCashGoal,
    setupTicket,
    mrrPerSale,
    contactToLeadRate,
    leadToSaleRate,
    now: new Date(),
  });

  const periodLeads = snapshot.leads.filter((l) => inPeriod(l.created_at));
  const periodOpps = snapshot.opportunities.filter((o) => inPeriod(o.created_at));
  const periodMessages = snapshot.messages.filter((m) => inPeriod(m.created_at));

  const activeLeads = periodLeads.filter(
    (lead) => !["convertido", "perdido"].includes(lead.status),
  );
  const openPipeline = periodOpps
    .filter((item) => !["Ganho", "Perdido"].includes(item.etapa))
    .reduce((sum, item) => sum + effectiveValue(item.valor, item.produto), 0);

  // Taxa de Conversão (por VALOR): quanto do valor total das oportunidades do
  // período já foi convertido em venda (etapa "Ganho"). Sobe conforme os ganhos.
  // Usa o valor efetivo (1º pagamento) — inclui serviços só-mensais (ex.: Tráfego).
  const totalValue = periodOpps.reduce((sum, o) => sum + effectiveValue(o.valor, o.produto), 0);
  const wonValue = periodOpps
    .filter((o) => o.etapa === "Ganho")
    .reduce((sum, o) => sum + effectiveValue(o.valor, o.produto), 0);
  const conversionRate = totalValue ? Math.round((wonValue / totalValue) * 100) : 0;

  // Urgent Messages (Inbox) — no período selecionado.
  const pendingMessages = periodMessages.filter(
    (message) => message.unread_count > 0 || message.status !== "Resolvido",
  );

  const PERIODS: Array<{ key: typeof period; label: string }> = [
    { key: "hoje", label: "Hoje" },
    { key: "7d", label: "7 dias" },
    { key: "mes", label: "Mês" },
    { key: "tudo", label: "Tudo" },
  ];

  const recommendations = buildCommercialRecommendations(snapshot);
  
  // Sort recent opportunities
  const recentOpportunities = [...snapshot.opportunities]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto pb-12">
      
      <header className="flex flex-col gap-6 border-b border-foreground/5 pb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Meta comercial do mês</h1>
            <p className="text-muted-foreground">
              Acompanhe caixa realizado, MRR novo e a capacidade necessária para bater a meta.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-card border border-foreground/5 rounded-2xl p-1">
            <Calendar size={16} className="text-muted-foreground ml-2 mr-1 shrink-0" />
            {PERIODS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setPeriod(option.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  period === option.key
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Meta de caixa"
            value={formatMoney(monthlyCashGoal)}
            icon={Target}
            tone="neutral"
            emptyState="Conta apenas pagamento único/setup."
          />
          <StatCard
            title="Caixa realizado"
            value={formatMoney(realMetrics.currentMonth.cashRealized)}
            icon={CircleDollarSign}
            tone={realMetrics.currentMonth.cashRealized >= monthlyCashGoal ? "success" : "warning"}
            emptyState={`${formatNumber(realMetrics.currentMonth.wonSales)} venda(s) ganhas no mês.`}
          />
          <StatCard
            title="Falta para a meta"
            value={formatMoney(Math.max(0, monthlyCashGoal - realMetrics.currentMonth.cashRealized))}
            icon={TrendingUp}
            tone={realMetrics.currentMonth.cashRealized >= monthlyCashGoal ? "success" : "warning"}
            emptyState="Diferença entre meta e caixa realizado."
          />
          <StatCard
            title="MRR novo contratado"
            value={formatMoneyWithCents(realMetrics.currentMonth.newMrr)}
            icon={RotateCcw}
            tone="success"
            emptyState="Recorrência nova separada do caixa do mês."
          />
        </section>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-foreground/5 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Contatos</p>
            <UsersRound size={18} className="text-primary" />
          </div>
          <strong className="mt-3 block text-3xl font-bold">{formatNumber(realMetrics.currentMonth.contacts)}</strong>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatPercent(realMetrics.rates.contactToLead)} viram lead no mês.
          </p>
        </div>

        <div className="rounded-2xl border border-foreground/5 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Leads</p>
            <Target size={18} className="text-primary" />
          </div>
          <strong className="mt-3 block text-3xl font-bold">{formatNumber(realMetrics.currentMonth.leads)}</strong>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatPercent(realMetrics.rates.leadToSale)} viram venda no mês.
          </p>
        </div>

        <div className="rounded-2xl border border-foreground/5 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Vendas</p>
            <CheckCircle2 size={18} className="text-green-500" />
          </div>
          <strong className="mt-3 block text-3xl font-bold">{formatNumber(realMetrics.currentMonth.wonSales)}</strong>
          <p className="mt-2 text-xs text-muted-foreground">
            {realMetrics.rates.contactsPerSale.value === null
              ? "Sem base suficiente para contatos por venda."
              : `${formatNumber(realMetrics.rates.contactsPerSale.value)} contatos por venda.`}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-6">
        <div className="rounded-3xl border border-foreground/5 bg-card p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Simulador de meta</h2>
              <p className="text-sm text-muted-foreground">Ajuste a meta e as taxas para prever a capacidade necessária.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Meta mensal de caixa
              <input
                className="min-h-10 rounded-md border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm"
                type="number"
                min={0}
                value={monthlyCashGoal}
                onChange={(event) => setMonthlyCashGoal(Math.max(0, Number(event.target.value) || 0))}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              Produto
              <select
                className="min-h-10 rounded-md border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm"
                value={goalProduct}
                onChange={(event) => handleProductChange(event.target.value as Product)}
              >
                {PRODUCTS.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              Setup por venda
              <input
                className="min-h-10 rounded-md border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm"
                type="number"
                min={0}
                value={setupTicket}
                onChange={(event) => setSetupTicket(Math.max(0, Number(event.target.value) || 0))}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              MRR por venda
              <input
                className="min-h-10 rounded-md border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm"
                type="text"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={mrrPerSaleInput}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setMrrPerSaleInput(nextValue);
                  const normalized = nextValue.replace(",", ".").trim();
                  const parsed = Number(normalized);
                  if (normalized && Number.isFinite(parsed) && parsed >= 0) setMrrPerSale(parsed);
                }}
                onBlur={() => {
                  const normalized = mrrPerSaleInput.replace(",", ".").trim();
                  const parsed = Number(normalized);
                  if (!normalized || !Number.isFinite(parsed) || parsed < 0) {
                    setMrrPerSaleInput(String(mrrPerSale));
                  }
                }}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              Conversão contato → lead (%)
              <input
                className="min-h-10 rounded-md border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm"
                type="text"
                inputMode="decimal"
                min={0}
                max={100}
                step="0.1"
                placeholder={realMetrics.rates.contactToLead.value === null ? "Informe uma taxa" : undefined}
                value={contactToLeadRateInput}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setContactToLeadRateInput(nextValue);
                  if (!nextValue.trim()) {
                    setManualContactToLeadRate(null);
                    return;
                  }
                  const parsed = parsePercentInput(nextValue);
                  if (parsed !== null) setManualContactToLeadRate(parsed);
                }}
                onBlur={() => {
                  const normalized = normalizePercentInput(
                    contactToLeadRateInput,
                    shownContactToLeadRate,
                  );
                  setContactToLeadRateInput(normalized.input);
                  setManualContactToLeadRate(normalized.rate);
                }}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              Conversão lead → venda (%)
              <input
                className="min-h-10 rounded-md border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm"
                type="text"
                inputMode="decimal"
                min={0}
                max={100}
                step="0.1"
                placeholder={realMetrics.rates.leadToSale.value === null ? "Informe uma taxa" : undefined}
                value={leadToSaleRateInput}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setLeadToSaleRateInput(nextValue);
                  if (!nextValue.trim()) {
                    setManualLeadToSaleRate(null);
                    return;
                  }
                  const parsed = parsePercentInput(nextValue);
                  if (parsed !== null) setManualLeadToSaleRate(parsed);
                }}
                onBlur={() => {
                  const normalized = normalizePercentInput(
                    leadToSaleRateInput,
                    shownLeadToSaleRate,
                  );
                  setLeadToSaleRateInput(normalized.input);
                  setManualLeadToSaleRate(normalized.rate);
                }}
              />
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-foreground/5 bg-card p-6 shadow-lg">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl font-bold">Necessário para bater a meta</h2>
              <p className="text-sm text-muted-foreground">
                Baseado em {projection.businessDaysRemaining} dia(s) útil(eis) restantes.
              </p>
            </div>
          </div>
          <ProjectionResult projection={projection} />
        </div>
      </section>

      {/* 3. EXECUÇÃO E ANÁLISE (GRID 2/3 + 1/3) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLUNA PRINCIPAL (65%) */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          
          {/* Prioridades do Dia */}
          <div className="flex flex-col rounded-3xl border border-foreground/5 bg-card overflow-hidden shadow-lg">
            <div className="p-6 border-b border-foreground/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Sparkles size={20} />
                </div>
                <h2 className="text-xl font-bold">Inteligência Comercial</h2>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-foreground/5 text-muted-foreground">Prioridades do dia</span>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              {recommendations.length > 0 ? (
                recommendations.slice(0, 5).map((rec) => (
                  <PriorityTaskCard 
                    key={rec.id} 
                    task={rec} 
                    onAction={() => onOpenModal("message")} 
                  />
                ))
              ) : (
                <EmptyState
                  action="Cadastrar Lead"
                  description="Você está sem tarefas pendentes. Cadastre um novo lead para gerar ações."
                  onAction={() => onOpenModal("lead")}
                />
              )}
            </div>
          </div>

          {/* Saúde do Funil */}
          <div className="flex flex-col rounded-3xl border border-foreground/5 bg-card overflow-hidden shadow-lg">
            <div className="p-6 border-b border-foreground/5">
              <h2 className="text-xl font-bold mb-1">Saúde do Funil</h2>
              <p className="text-sm text-muted-foreground">Distribuição atual de volume e receita esperada.</p>
            </div>
            <div className="p-8">
               <FunnelChart opportunities={snapshot.opportunities} stages={stages} />
            </div>
          </div>

        </div>

        {/* COLUNA SECUNDÁRIA (35%) */}
        <div className="flex flex-col gap-8">
          
          {/* Oportunidades Recentes */}
          <div className="flex flex-col rounded-3xl border border-foreground/5 bg-card overflow-hidden shadow-lg">
            <div className="p-6 border-b border-foreground/5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Oportunidades Recentes</h2>
              <button onClick={() => onOpenModal("opportunity")} className="p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors">
                <Plus size={16} />
              </button>
            </div>
            <div className="p-0">
              {recentOpportunities.length > 0 ? (
                <div className="flex flex-col divide-y divide-foreground/5">
                  {recentOpportunities.map(opp => (
                    <div key={opp.id} className="p-5 hover:bg-foreground/[0.02] transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-foreground/5 flex items-center justify-center text-muted-foreground border border-foreground/10 group-hover:border-primary/50 transition-colors">
                          <CircleDollarSign size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm line-clamp-1">{opp.titulo}</p>
                          <p className="text-xs text-muted-foreground">{opp.etapa}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-green-500">{formatMoney(Number(opp.valor))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8">
                  <EmptyState action="Criar Oportunidade" description="Nenhuma oportunidade criada recentemente." onAction={() => onOpenModal("opportunity")} />
                </div>
              )}
            </div>
            <div className="p-4 border-t border-foreground/5 bg-foreground/5 text-center">
              <button className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">Ver todo o funil</button>
            </div>
          </div>

        </div>

      </div>

    </div>
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
