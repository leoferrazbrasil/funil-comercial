import { HeroPanel, PageIntro, MetricCard, Panel, ActionItem, TablePanel, EmptyState, Modal, ContactModal, LeadModal, OpportunityModal, MessageModal, ChannelModal, EntityForm, TextField, SelectField, LoadingScreen } from "../components/SharedUI";
import type { Session } from "@supabase/supabase-js";
import type { LucideIcon } from "lucide-react";
import { Calendar, Bell, CheckCircle2, CircleDollarSign, Clock3, LogOut, MessageCircle, MoveRight, Pencil, Plus, Send, Search, ShieldCheck, Sparkles, Target, TrendingUp, UsersRound, RotateCcw, Moon, Sun, X } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { Toaster, toast } from "react-hot-toast";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { IMaskInput } from "react-imask";
import { useEffect, useMemo, useState } from "react";
import { effectiveValue } from "../lib/products";
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
    neutral: "bg-white/5",
    success: "bg-green-500/10",
    warning: "bg-amber-500/10",
    danger: "bg-red-500/10",
  };

  return (
    <div className="flex flex-col rounded-3xl border border-white/5 bg-card p-6 shadow-sm relative overflow-hidden group transition-all hover:border-white/10 hover:bg-white/[0.02]">
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
      <div className="text-xs text-muted-foreground/50 border-t border-white/5 pt-3 mt-auto">
        {emptyState}
      </div>
    </div>
  );
}

function PriorityTaskCard({ task, onAction }: { task: any, onAction: () => void }) {
  const isHigh = task.priority === "Alta";
  return (
    <div className={`flex items-start gap-4 p-5 rounded-2xl border ${isHigh ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5 bg-white/[0.02]'} transition-colors hover:border-primary/50`}>
      <div className={`mt-0.5 flex-shrink-0 w-2.5 h-2.5 rounded-full ${isHigh ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-primary'}`} />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground mb-1 truncate">{task.title}</h4>
        <p className="text-xs text-muted-foreground line-clamp-2">{task.summary || task.description}</p>
      </div>
      <button 
        onClick={onAction}
        className="flex-shrink-0 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
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
            <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${isFirst ? 'bg-white/20' : isLast ? 'bg-green-500' : 'bg-primary'}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
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

  // Rotina comercial do DIA (sempre hoje, independente do filtro).
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };
  const contactsToday = snapshot.contacts.filter((c) => isToday(c.created_at));
  const leadContactIds = new Set(
    snapshot.leads.map((l) => l.contact_id).filter(Boolean),
  );
  const contactsTodayConverted = contactsToday.filter((c) => leadContactIds.has(c.id));
  const contactToLeadRateToday = contactsToday.length
    ? Math.round((contactsTodayConverted.length / contactsToday.length) * 100)
    : 0;

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
      
      {/* 1. HEADER & Z-PATTERN TOP */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Visão Geral</h1>
          <p className="text-muted-foreground">Aqui está o resumo da sua operação neste momento.</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-white/5 rounded-2xl p-1">
          <Calendar size={16} className="text-muted-foreground ml-2 mr-1 shrink-0" />
          {PERIODS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setPeriod(option.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                period === option.key
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      {/* 2. KPIs (PULSO DA OPERAÇÃO) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Atenção Necessária" 
          value={String(pendingMessages.length)} 
          icon={Bell} 
          tone={pendingMessages.length > 0 ? "warning" : "success"}
          actionLabel="Ver Inbox"
          onAction={() => onOpenModal("message")}
          emptyState="Conversas pendentes no inbox."
        />
        <StatCard 
          title="Leads Ativos" 
          value={String(activeLeads.length)} 
          icon={UsersRound} 
          tone="neutral"
          emptyState="Histórico de tendência indisponível."
        />
        <StatCard 
          title="Pipeline Aberto" 
          value={formatMoney(openPipeline)} 
          icon={CircleDollarSign} 
          tone="neutral"
          emptyState="Oportunidades ativas no funil."
        />
        <StatCard
          title="Taxa de Conversão"
          value={totalValue ? `${conversionRate}%` : "—"}
          icon={Target}
          tone={totalValue === 0 ? "neutral" : conversionRate >= 50 ? "success" : "warning"}
          emptyState={
            totalValue
              ? `${formatMoney(wonValue)} ganho de ${formatMoney(totalValue)} no funil`
              : "Sem oportunidades no período."
          }
        />
      </section>

      {/* 2b. ROTINA DO DIA — Contatos criados hoje e conversão em lead */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Rotina de Hoje</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            title="Contatos criados hoje"
            value={String(contactsToday.length)}
            icon={UsersRound}
            tone="neutral"
            emptyState="Novos contatos cadastrados no dia."
          />
          <StatCard
            title="Viraram lead hoje"
            value={String(contactsTodayConverted.length)}
            icon={Target}
            tone={contactsTodayConverted.length > 0 ? "success" : "neutral"}
            emptyState="Contatos de hoje que já viraram lead."
          />
          <StatCard
            title="Conversão contato → lead"
            value={`${contactToLeadRateToday}%`}
            icon={TrendingUp}
            tone="neutral"
            emptyState={`${contactsTodayConverted.length} de ${contactsToday.length} contatos de hoje`}
          />
        </div>
      </section>

      {/* 3. EXECUÇÃO E ANÁLISE (GRID 2/3 + 1/3) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLUNA PRINCIPAL (65%) */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          
          {/* Prioridades do Dia */}
          <div className="flex flex-col rounded-3xl border border-white/5 bg-card overflow-hidden shadow-lg">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Sparkles size={20} />
                </div>
                <h2 className="text-xl font-bold">Inteligência Comercial</h2>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 text-muted-foreground">Prioridades do dia</span>
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
          <div className="flex flex-col rounded-3xl border border-white/5 bg-card overflow-hidden shadow-lg">
            <div className="p-6 border-b border-white/5">
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
          <div className="flex flex-col rounded-3xl border border-white/5 bg-card overflow-hidden shadow-lg">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Oportunidades Recentes</h2>
              <button onClick={() => onOpenModal("opportunity")} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <Plus size={16} />
              </button>
            </div>
            <div className="p-0">
              {recentOpportunities.length > 0 ? (
                <div className="flex flex-col divide-y divide-white/5">
                  {recentOpportunities.map(opp => (
                    <div key={opp.id} className="p-5 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground border border-white/10 group-hover:border-primary/50 transition-colors">
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
            <div className="p-4 border-t border-white/5 bg-black/20 text-center">
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
