import { PipelineSignalCard } from "./Pipeline";
import { HeroPanel, PageIntro, MetricCard, Panel, ActionItem, TablePanel, EmptyState, Modal, ContactModal, LeadModal, OpportunityModal, MessageModal, ChannelModal, EntityForm, TextField, SelectField, LoadingScreen } from "../components/SharedUI";
import { ConfirmDialog } from "../components/ConfirmDialog";
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


// Circular Progress Component for Lead Scoring
const ScoreRing = ({ score }: { score: number }) => {
  const radius = 16;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  
  let color = "text-green-500";
  if (score < 50) color = "text-red-500";
  else if (score < 80) color = "text-amber-500";
  
  return (
    <div className="relative flex items-center justify-center w-10 h-10">
      <svg className="transform -rotate-90 w-10 h-10">
        <circle
          className="text-foreground/10"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="20"
          cy="20"
        />
        <circle
          className={`${color} transition-all duration-1000 ease-in-out`}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="20"
          cy="20"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-foreground">{score}</span>
    </div>
  );
};

export default function LeadsPage({
  leads,
  opportunities,
  query,
  isSaving,
  onCreateOpportunity,
  onDeleteLead,
  onEditLead,
  onOpenModal,
}: {
  leads: Lead[];
  opportunities: Opportunity[];
  query: string;
  isSaving: boolean;
  onCreateOpportunity: (lead: Lead) => Promise<void>;
  onDeleteLead: (leadId: string) => Promise<void>;
  onEditLead: (lead: Lead) => void;
  onOpenModal: (modal: ModalType) => void;
}) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteLead(leadToDelete.id);
      setLeadToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

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
  
  // Custom sorting: Unconverted Leads with HIGH scores first.
  const sortedQualifications = [...leadQualifications].sort((a, b) => {
    const aHasOpp = opportunityByLeadId.has(a.lead.id);
    const bHasOpp = opportunityByLeadId.has(b.lead.id);
    
    if (aHasOpp && !bHasOpp) return 1;
    if (!aHasOpp && bHasOpp) return -1;
    
    // Both converted or both unconverted, sort by score descending
    return b.score - a.score;
  });

  const qualifiedLeads = leadQualifications.filter(
    (q) => q.score >= 80 && !opportunityByLeadId.has(q.lead.id),
  );
  const incompleteQualifications = leadQualifications.filter(
    (q) => q.missingFields.length > 0 && !opportunityByLeadId.has(q.lead.id)
  );
  const leadsWithOpportunity = filteredLeads.filter((lead) =>
    opportunityByLeadId.has(lead.id),
  );

  const selectedQ = sortedQualifications.find((q) => q.lead.id === selectedLeadId);

  // Keyboard escape to close drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedLeadId(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const renderDataGrid = () => {
    return (
      <div className="flex-1 overflow-auto bg-card rounded-2xl border border-foreground/5 shadow-2xl relative min-h-0 md:min-h-[500px]">
        {sortedQualifications.length === 0 ? (
          <EmptyState
            action="Cadastrar Lead"
            description="Nenhum lead encontrado para esta conta. Importe ou crie um lead manualmente."
            onAction={() => onOpenModal("lead")}
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <table className="w-full text-left hidden md:table border-collapse">
              <thead className="bg-foreground/[0.02] border-b border-foreground/5 text-xs uppercase tracking-wider text-muted-foreground sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="p-4 font-semibold text-center w-20">Score</th>
                  <th className="p-4 font-semibold">Lead</th>
                  <th className="p-4 font-semibold">Contato</th>
                  <th className="p-4 font-semibold">Interesse & Valor</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedQualifications.map((q) => {
                  const lead = q.lead;
                  const hasOpp = opportunityByLeadId.has(lead.id);
                  const isSelected = selectedLeadId === lead.id;
                  
                  return (
                    <tr 
                      key={lead.id} 
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={`group border-b border-foreground/5 transition-colors cursor-pointer ${isSelected ? 'bg-primary/5' : 'hover:bg-foreground/[0.02]'}`}
                    >
                      <td className="p-4">
                        <div className="flex justify-center">
                          {hasOpp ? (
                            <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center" title="No Funil">
                              <CheckCircle2 size={20} />
                            </div>
                          ) : (
                            <ScoreRing score={q.score} />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <strong className="block text-sm font-semibold text-foreground">{lead.nome}</strong>
                        <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5 inline-block">
                          {lead.origem || "Desconhecido"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-xs">
                          {lead.telefone ? (
                            <span className="text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1.5"><MessageCircle size={12} /> {lead.telefone}</span>
                          ) : <span className="text-muted-foreground opacity-50">Sem Telefone</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <strong className="block text-sm text-foreground">{formatMoney(Number(lead.valor_estimado))}</strong>
                        <span className="text-xs text-muted-foreground truncate max-w-[150px] inline-block" title={lead.interesse}>{lead.interesse || "-"}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full ${hasOpp ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-foreground/5 text-muted-foreground'}`}>
                          {hasOpp ? "No Funil" : lead.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1.5 text-muted-foreground hover:text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors"
                            onClick={(e) => { e.stopPropagation(); onEditLead(lead); }}
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="p-1.5 text-muted-foreground hover:text-red-500 bg-foreground/5 hover:bg-red-500/10 rounded-lg transition-colors"
                            onClick={(e) => { e.stopPropagation(); setLeadToDelete(lead); }}
                            title="Excluir"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Mobile Cards View */}
            <div className="flex flex-col md:hidden p-4 pb-28 gap-3">
              {sortedQualifications.map((q) => {
                const lead = q.lead;
                const hasOpp = opportunityByLeadId.has(lead.id);
                return (
                  <div 
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="bg-foreground/5 border border-foreground/5 rounded-2xl p-4 flex flex-col gap-3 active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {hasOpp ? (
                          <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                            <CheckCircle2 size={20} />
                          </div>
                        ) : (
                          <ScoreRing score={q.score} />
                        )}
                        <div>
                          <strong className="block text-sm font-semibold text-foreground">{lead.nome}</strong>
                          <span className="text-xs text-muted-foreground mt-0.5 inline-block">{lead.telefone || "Sem telefone"}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full ${hasOpp ? 'bg-green-500/10 text-green-500' : 'bg-foreground/10 text-muted-foreground'}`}>
                        {hasOpp ? "Funil" : lead.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderProfileDrawer = () => {
    if (!selectedQ) return null;
    const lead = selectedQ.lead;
    const hasOpp = opportunityByLeadId.has(lead.id);
    const opp = opportunityByLeadId.get(lead.id);
    
    return (
      <>
        {/* Backdrop for Mobile */}
        <div 
          className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSelectedLeadId(null)}
        />
        
        {/* The Drawer */}
        <div className="fixed lg:relative inset-y-0 right-0 z-50 w-full md:w-[450px] lg:w-[400px] xl:w-[450px] bg-card lg:bg-transparent lg:border-l border-foreground/5 shadow-2xl lg:shadow-none flex flex-col shrink-0 transition-transform animate-in slide-in-from-right lg:animate-none">
          
          <div className="h-16 shrink-0 border-b border-foreground/5 flex items-center justify-between px-6 bg-card/50">
            <h3 className="font-bold text-sm tracking-widest uppercase text-muted-foreground flex items-center gap-2">
              <Target size={16} /> Qualificação
            </h3>
            <button 
              onClick={() => setSelectedLeadId(null)} 
              className="p-3 -mr-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-muted-foreground hover:bg-foreground/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-card p-6 flex flex-col gap-8">
            
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">{lead.nome}</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground bg-foreground/5 px-2 py-1 rounded-md uppercase tracking-wider">{lead.status.replace("_", " ")}</span>
                <span className="text-xs font-semibold text-muted-foreground bg-foreground/5 px-2 py-1 rounded-md uppercase tracking-wider">{lead.origem || "Manual"}</span>
              </div>
            </div>
            
            {/* AI Action Box */}
            {!hasOpp ? (
              <div className={`p-5 rounded-3xl border ${selectedQ.score >= 80 ? 'bg-primary/5 border-primary/30 shadow-[0_0_30px_rgba(35,196,131,0.1)]' : 'bg-amber-500/5 border-amber-500/20'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <ScoreRing score={selectedQ.score} />
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Score: {selectedQ.score}%</h4>
                    <p className="text-xs text-muted-foreground font-medium">{selectedQ.score >= 80 ? "Pronto para conversão!" : "Qualificação incompleta"}</p>
                  </div>
                </div>
                
                <p className="text-sm font-semibold mb-4 leading-snug">{selectedQ.nextAction}</p>
                
                {selectedQ.score >= 80 ? (
                  <button
                    className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl transition-all flex items-center justify-center gap-2 group"
                    disabled={isSaving}
                    onClick={() => onCreateOpportunity(lead)}
                  >
                    <CircleDollarSign size={18} className="group-hover:scale-110 transition-transform" /> 
                    Criar Oportunidade
                  </button>
                ) : (
                  <button
                    className="w-full py-2 px-4 rounded-xl bg-foreground/10 hover:bg-foreground/20 text-foreground font-semibold text-sm transition-all flex items-center justify-center gap-2"
                    onClick={() => onEditLead(lead)}
                  >
                    <Pencil size={16} /> Completar Cadastro
                  </button>
                )}
              </div>
            ) : (
              <div className="p-5 rounded-3xl border border-green-500/20 bg-green-500/5 text-center flex flex-col gap-3">
                <CheckCircle2 size={32} className="mx-auto text-green-500" />
                <div>
                  <h4 className="font-bold text-green-500 mb-1">Convertido em Oportunidade</h4>
                  <p className="text-xs text-muted-foreground font-medium">Este lead já está no Funil de Vendas na etapa <strong>"{opp?.etapa}"</strong>.</p>
                </div>
              </div>
            )}
            
            {/* Details */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Dados Base</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-foreground/5 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">Valor Estimado</span>
                  <span className="text-sm font-semibold">{formatMoney(Number(lead.valor_estimado))}</span>
                </div>
                <div className="p-4 bg-foreground/5 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">Telefone</span>
                  <span className="text-sm font-semibold">{lead.telefone || "-"}</span>
                </div>
                <div className="p-4 bg-foreground/5 rounded-2xl flex flex-col gap-1 col-span-2">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">Interesse</span>
                  <span className="text-sm font-semibold leading-snug">{lead.interesse || "-"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onEditLead(lead)}
                  className="p-4 bg-foreground/5 hover:bg-foreground/10 rounded-2xl flex flex-col gap-1 col-span-2 text-left transition-colors group"
                >
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                    <Target size={12} /> Próxima Ação Manual
                    <Pencil size={10} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  {leadHasClearNextAction(lead) ? (
                    <span className="text-sm font-semibold leading-snug mt-1">{lead.proxima_acao}</span>
                  ) : (
                    <span className="text-sm italic text-muted-foreground leading-snug mt-1">
                      Defina a próxima ação comercial deste lead…
                    </span>
                  )}
                </button>
              </div>
            </div>
            
            <button
              className="w-full py-3 px-4 rounded-xl border border-foreground/10 hover:bg-foreground/5 text-foreground font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-auto"
              onClick={() => onEditLead(lead)}
            >
              <Pencil size={16} /> Editar Dados
            </button>

            <button
              className="w-full py-3 px-4 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 font-semibold text-sm transition-all flex items-center justify-center gap-2"
              onClick={() => setLeadToDelete(lead)}
            >
              <Trash2 size={16} /> Excluir Lead
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
          <h1 className="text-3xl font-bold tracking-tight mb-1">Qualificação de Leads</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe interessados e classifique potenciais negócios.
          </p>
        </div>
        
        <button 
          onClick={() => onOpenModal("lead")}
          className="primary-button hidden sm:flex"
        >
          <Plus size={16} /> Novo Lead
        </button>
        
        {/* Mobile FAB */}
        <button 
          onClick={() => onOpenModal("lead")}
          className="fixed bottom-[80px] right-4 z-[35] w-14 h-14 bg-primary text-primary-foreground rounded-full flex sm:hidden items-center justify-center shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Top Metrics (KPIs) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-card border border-foreground/5 rounded-2xl p-4 md:p-5 flex flex-col gap-3 relative overflow-hidden group">
          <div className="flex items-center justify-between z-10 relative">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><UsersRound size={14}/> Ativos</span>
          </div>
          <strong className="text-3xl sm:text-4xl font-black text-foreground z-10 relative tracking-tighter">{activeLeads.length}</strong>
        </div>
        
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 md:p-5 flex flex-col gap-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
            <Target size={64} />
          </div>
          <div className="flex items-center justify-between z-10 relative">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5"><Target size={14}/> Prontos</span>
          </div>
          <strong className="text-3xl sm:text-4xl font-black text-foreground z-10 relative tracking-tighter">{qualifiedLeads.length}</strong>
        </div>
        
        <div className="bg-card border border-foreground/5 rounded-2xl p-4 md:p-5 flex flex-col gap-3 relative overflow-hidden group">
          <div className="flex items-center justify-between z-10 relative">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Clock3 size={14}/> Pendentes</span>
          </div>
          <strong className="text-3xl sm:text-4xl font-black text-foreground z-10 relative tracking-tighter">{incompleteQualifications.length}</strong>
        </div>
        
        <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4 md:p-5 flex flex-col gap-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
            <CircleDollarSign size={64} />
          </div>
          <div className="flex items-center justify-between z-10 relative">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-green-500 flex items-center gap-1.5"><CircleDollarSign size={14}/> No Funil</span>
          </div>
          <strong className="text-3xl sm:text-4xl font-black text-foreground z-10 relative tracking-tighter">{leadsWithOpportunity.length}</strong>
        </div>
      </section>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden gap-6 pb-6 mt-2">
        {renderDataGrid()}
        {renderProfileDrawer()}
      </div>

      <ConfirmDialog
        open={Boolean(leadToDelete)}
        title="Excluir lead?"
        message={`Tem certeza de que deseja excluir o lead ${leadToDelete?.nome ?? ""}? Esta ação pode afetar dados vinculados (oportunidades e conversas ficam preservadas, apenas desvinculadas).`}
        isProcessing={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setLeadToDelete(null)}
      />
    </div>
  );
}
