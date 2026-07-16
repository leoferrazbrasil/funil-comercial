import type { Session } from "@supabase/supabase-js";
import type { LucideIcon } from "lucide-react";
import { Bell, CheckCircle2, CircleDollarSign, Clock3, LogOut, MessageCircle, MoveRight, Pencil, Plus, Send, Search, ShieldCheck, Sparkles, Target, TrendingUp, UsersRound, RotateCcw, Moon, Sun, X, Eye, EyeOff, Database, ArrowLeft } from "lucide-react";
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
  Link,
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
import Logo from "../components/Logo";

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

export default function LoginScreen({
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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Fluxo "esqueci minha senha": alterna o card do login para pedir o e-mail e
  // dispara o envio do link de redefinição (Supabase). Volta ao login pelo "Voltar".
  const [view, setView] = useState<"login" | "forgot">("login");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

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

  const openForgot = () => {
    setView("forgot");
    setResetSent(false);
    setResetError(null);
  };

  const handleForgotSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    const email = getFormValue(new FormData(event.currentTarget), "reset-email");
    if (!email) return;
    setResetLoading(true);
    setResetError(null);
    // redirectTo usa a origem atual → em produção, https://funilcomercial.com.
    // (O domínio precisa estar nas "Redirect URLs" do Supabase, senão ele cai no
    //  Site URL — daí o link ir para localhost. Ver README/pendências.)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setResetLoading(false);
    if (error) {
      setResetError(error.message);
      return;
    }
    // Mensagem genérica (não revela se o e-mail existe).
    setResetSent(true);
  };

  return (
    <main className="min-h-[100dvh] bg-background flex flex-col md:flex-row">
      <section 
        className="hidden md:flex flex-1 bg-primary/5 flex-col justify-center p-12 border-r border-border relative overflow-hidden" 
        aria-label="Funil Comercial Benefícios"
      >
        <div className="max-w-lg mx-auto relative z-10">
          <Logo iconSize={48} className="mb-10" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            A estrutura de vendas do seu negócio local, em um só lugar.
          </h1>
          <p className="text-lg text-muted-foreground mb-12 max-w-md">
            Presença, aquisição, conversão e escala funcionando juntas — do Google ao WhatsApp, sem perder lead por falta de acompanhamento.
          </p>
          
          <div className="grid gap-6 max-w-md">
            <article className="flex gap-4 items-start p-6 rounded-2xl bg-card border border-white/5 shadow-sm">
              <div className="mt-1 bg-green-500/10 p-2 rounded-lg text-green-600 dark:text-green-400">
                <MessageCircle size={24} />
              </div>
              <div>
                <strong className="block text-foreground text-lg font-semibold mb-1">WhatsApp</strong>
                <span className="text-muted-foreground text-sm">Conversas centralizadas e integradas diretamente no card do lead.</span>
              </div>
            </article>

            <article className="flex gap-4 items-start p-6 rounded-2xl bg-card border border-white/5 shadow-sm">
              <div className="mt-1 bg-blue-500/10 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                <Database size={24} />
              </div>
              <div>
                <strong className="block text-foreground text-lg font-semibold mb-1">CRM Moderno</strong>
                <span className="text-muted-foreground text-sm">Contatos organizados com histórico completo de interações.</span>
              </div>
            </article>

            <article className="flex gap-4 items-start p-6 rounded-2xl bg-card border border-white/5 shadow-sm">
              <div className="mt-1 bg-amber-500/10 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <strong className="block text-foreground text-lg font-semibold mb-1">Pipeline Dinâmico</strong>
                <span className="text-muted-foreground text-sm">Oportunidades mapeadas e qualificadas do início ao fechamento.</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <div className="flex-1 flex flex-col items-center md:justify-center overflow-y-auto py-10 px-4 sm:px-6 md:p-12 relative">
        <div className="md:hidden w-full max-w-md mb-6 sm:mb-8 mt-4 flex justify-center">
          <Logo iconSize={40} />
        </div>

        {view === "forgot" && (
          <form
            className="w-full max-w-[420px] space-y-6 bg-card p-6 sm:p-8 md:p-10 rounded-3xl border border-border shadow-[0_18px_48px_rgba(4,29,87,0.1)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.32)]"
            aria-label="Redefinir senha"
            onSubmit={handleForgotSubmit}
          >
            <button
              type="button"
              onClick={() => setView("login")}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={16} /> Voltar ao login
            </button>

            <div>
              <p className="text-xs font-bold tracking-wider text-primary uppercase mb-3">Recuperar acesso</p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">Esqueceu a senha?</h2>
              <p className="text-sm text-muted-foreground">
                Informe seu e-mail e enviaremos um link para você criar uma nova senha.
              </p>
            </div>

            {resetSent ? (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex gap-3" role="status">
                <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Link enviado</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Se existir uma conta com esse e-mail, o link de redefinição chega em instantes. Confira também o spam.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {resetError && (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20" role="alert">
                    <p className="text-xs text-destructive/80">{resetError}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="reset-email" className="text-sm font-semibold text-foreground">E-mail da conta</label>
                  <input
                    id="reset-email"
                    name="reset-email"
                    type="email"
                    required
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    placeholder="voce@empresa.com.br"
                    className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!isSupabaseConfigured || resetLoading}
                  className="flex w-full items-center justify-center gap-2 h-12 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {resetLoading ? "Enviando..." : "Enviar link de redefinição"}
                  <MoveRight size={18} />
                </button>
              </>
            )}
          </form>
        )}

        {view === "login" && (
        <form
          className="w-full max-w-[420px] space-y-6 bg-card p-6 sm:p-8 md:p-10 rounded-3xl border border-border shadow-[0_18px_48px_rgba(4,29,87,0.1)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.32)]"
          aria-label="Entrar na plataforma"
          onSubmit={handleSubmit}
        >
          <div className="mb-6 sm:mb-8">
            <p className="text-xs font-bold tracking-wider text-primary uppercase mb-3">Login</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">Bem-vindo de volta</h2>
            <p className="text-sm text-muted-foreground">
              Acesse sua conta para continuar gerenciando suas vendas.
            </p>
          </div>

          {!isSupabaseConfigured && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20" role="alert">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Modo Local</p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
                Configure as chaves do Supabase para ativar dados reais.
              </p>
            </div>
          )}

          {authError && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20" role="alert" aria-live="assertive">
              <p className="text-sm font-medium text-destructive">Falha na autenticação</p>
              <p className="text-xs text-destructive/80 mt-1">{authError}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-foreground">
                E-mail corporativo
              </label>
              <input 
                id="email"
                className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                name="email"
                placeholder="gestor@empresa.com.br"
                required
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                aria-invalid={!!authError}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Senha
                </label>
                <button type="button" onClick={openForgot} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <input 
                  id="password"
                  className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 pr-12 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                  minLength={6}
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  aria-invalid={!!authError}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-2"
                  aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input 
                type="checkbox" 
                id="remember" 
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none flex-1 py-1">
                Lembrar de mim
              </label>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <button
              className="flex w-full items-center justify-center gap-2 h-12 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_24px_rgba(245,158,11,0.2)]"
              disabled={!isSupabaseConfigured || isSubmitting}
              type="submit"
              value="login"
            >
              {isSubmitting ? "Autenticando..." : "Acessar Plataforma"}
              <MoveRight size={18} />
            </button>
          </div>
          
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Ainda não possui conta?{" "}
              <Link to="/cadastro" className="font-semibold text-foreground hover:text-primary transition-colors">
                Crie agora
              </Link>
            </p>
          </div>
        </form>
        )}

        <p className="mt-8 mb-10 md:mb-0 text-xs text-muted-foreground/60">
          Conexão criptografada (TLS) e dados isolados por conta.
        </p>
      </div>
    </main>
  );
}
