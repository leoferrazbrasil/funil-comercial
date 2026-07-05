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

export function HeroPanel({
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
    <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 rounded-xl bg-card border border-white/5">
      <div>
        <p className="text-xs font-bold tracking-wider text-primary uppercase mb-2">{eyebrow}</p>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>
      </div>
      <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-transparent text-primary border border-primary font-medium rounded-full hover:bg-primary/10 transition-colors" onClick={onAction}>
        <Sparkles size={17} />
        {action}
      </button>
    </section>
  );
}

export function PageIntro({
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
    <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
      <div>
        <p className="text-xs font-bold tracking-wider text-primary uppercase mb-2">{eyebrow}</p>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>
      </div>
      <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors" onClick={onAction}>
        <Plus size={17} />
        {action}
      </button>
    </section>
  );
}

export function MetricCard({
  iconClassName = "text-[#00E5A0]",
  icon: Icon,
  label,
  value,
  hint,
  tone = "neutral",
}: {
  icon: LucideIcon;
  iconClassName?: string;
  label: string;
  value: string;
  hint: string;
  tone?: "neutral" | "warning" | "success";
}) {
  return (
    <article className={`flex flex-row items-center justify-between p-6 rounded-xl bg-card border border-white/5 ${tone === "warning" ? "border-l-4 border-l-yellow-500" : tone === "success" ? "border-l-4 border-l-green-500" : ""}`}>
      <div>
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">{label}</span>
        <strong className="text-2xl font-bold text-foreground mt-1 mb-1 block">{value}</strong>
        <small className="text-xs text-muted-foreground">{hint}</small>
      </div>
      <Icon size={22} className={iconClassName} />
    </article>
  );
}

export function Panel({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/5 bg-card overflow-hidden">
      <header className="p-6 border-b border-white/5"><p className="text-xs font-bold tracking-wider text-primary uppercase mb-1">{eyebrow}</p><h2 className="text-lg font-semibold text-foreground">{title}</h2></header>
      {children}
    </section>
  );
}

export function ActionItem({
  title,
  description,
  priority,
}: {
  title: string;
  description: string;
  priority: string;
}) {
  return (
    <article className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-white/5 rounded-lg bg-background">
      <div className="mt-1 sm:mt-0 text-muted-foreground"><Target size={18} /></div>
      <div className="flex-1"><strong className="text-sm font-medium text-foreground block">{title}</strong><p className="text-xs text-muted-foreground mt-1 max-w-2xl">{description}</p></div>
      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground mt-2 sm:mt-0">{priority}</span>
    </article>
  );
}

export function TablePanel({
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
    <section className="rounded-xl border border-white/5 bg-card overflow-hidden">
      {isEmpty ? (
        <EmptyState
          action={emptyLabel}
          description="Nenhum registro encontrado. Comece criando o primeiro item."
          onAction={emptyAction}
        />
      ) : (
        <div className="overflow-x-auto w-full">{children}</div>
      )}
    </section>
  );
}

export function EmptyState({
  action,
  description,
  onAction,
}: {
  action: string;
  description: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center border-2 border-dashed border-white/10 rounded-xl bg-background/50">
      <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>
      <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-secondary/80 transition-colors" onClick={onAction}>
        <Plus size={16} />
        {action}
      </button>
    </div>
  );
}

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" role="presentation">
      <section aria-modal="true" className="bg-card border border-white/10 shadow-lg rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col" role="dialog">
        <header className="flex justify-between items-center p-6 border-b border-white/5"><h2 className="text-lg font-semibold text-foreground">{title}</h2><button aria-label="Fechar" className="p-2 rounded-md hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground" onClick={onClose}><X size={18} /></button></header>
        {children}
      </section>
    </div>
  );
}

export function ContactModal({
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

export function LeadModal({
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

export function OpportunityModal({
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

export function MessageModal({
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
        <label className="flex flex-col gap-2 mb-4 text-sm font-medium">
          Mensagem
          <textarea className="flex min-h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" name="mensagem"
            placeholder="Tenho interesse em conhecer a solução."
            required
          />
        </label>
      </EntityForm>
    </Modal>
  );
}


export function ChannelModal({
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
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-secondary/80 transition-colors" 
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
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors" 
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

export function EntityForm({
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
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-secondary/80 transition-colors" onClick={onClose} type="button">
          Cancelar
        </button>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors" disabled={isSaving} type="submit">
          {isSaving ? "Salvando..." : submitLabel}
        </button>
      </footer>
    </form>
  );
}

export function TextField({
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
        <IMaskInput className="flex min-h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" defaultValue={defaultText}
          name={name}
          mask="(00) 00000-0000"
          placeholder={placeholder || "(11) 99999-9999"}
          required={required}
        />
      ) : isMoney ? (
        <IMaskInput className="flex min-h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" defaultValue={defaultText}
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
        <input className="flex min-h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" defaultValue={defaultText}
          name={name}
          placeholder={placeholder}
          required={required}
          type={type}
        />
      )}
    </label>
  );
}

export function SelectField({
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
      <select className="flex min-h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" name={name} defaultValue={defaultValue ?? ""} onChange={onChange}>
        {children}
      </select>
    </label>
  );
}

export function LoadingScreen({ label }: { label: string }) {
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
