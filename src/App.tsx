import type { Session } from "@supabase/supabase-js";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BriefcaseBusiness,
  CircleDollarSign,
  Clock3,
  ContactRound,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  MoveRight,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UsersRound,
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
  convertContactToLead,
  createContact,
  createInboxMessage,
  createLead,
  createOpportunity,
  updateOpportunityStage,
  ensureDefaultStages,
  getCrmSnapshot,
  upsertProfile,
} from "./lib/crmService";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import type {
  Contact,
  CrmSnapshot,
  InboxMessage,
  Lead,
  OpportunityStage,
  Route,
} from "./lib/types";

type NavItem = {
  id: Route;
  label: string;
  icon: LucideIcon;
};

type ModalType = "contact" | "lead" | "opportunity" | "message";

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "contatos", label: "Contatos", icon: ContactRound },
  { id: "leads", label: "Leads", icon: UsersRound },
  { id: "funil", label: "Funil de vendas", icon: BriefcaseBusiness },
];

const stages: OpportunityStage[] = [
  "Novo",
  "Em atendimento",
  "Qualificado",
  "Proposta",
  "Negociação",
  "Ganho",
  "Perdido",
];

const emptySnapshot: CrmSnapshot = {
  profile: null,
  contacts: [],
  leads: [],
  opportunities: [],
  messages: [],
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

const getRoute = (): Route => {
  const route = window.location.hash.replace("#/", "") as Route;
  if (["dashboard", "inbox", "contatos", "leads", "funil"].includes(route))
    return route;
  return "login";
};

const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

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

function App() {
  const [route, setRoute] = useState<Route>(getRoute);
  const [session, setSession] = useState<Session | null>(null);
  const [snapshot, setSnapshot] = useState<CrmSnapshot>(emptySnapshot);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<ModalType | null>(null);
  const [isBooting, setIsBooting] = useState(true);

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
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [crmError, setCrmError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const navigate = (nextRoute: Route) => {
    if (nextRoute === "login") {
      window.location.hash = "";
      setRoute("login");
      return;
    }

    window.location.hash = `/${nextRoute}`;
    setRoute(nextRoute);
  };

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

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
        if (data.session && getRoute() === "login") navigate("dashboard");
      })
      .finally(() => {
        if (mounted) setIsBooting(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setSnapshot(emptySnapshot);
        navigate("login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setSnapshot(emptySnapshot);
      return;
    }

    let cancelled = false;
    const currentUser = session.user;

    async function loadData() {
      setIsLoadingData(true);
      setCrmError(null);

      try {
        await upsertProfile(currentUser);
        await ensureDefaultStages(currentUser.id);
        const nextSnapshot = await getCrmSnapshot(currentUser.id);
        if (!cancelled) setSnapshot(nextSnapshot);
      } catch (error) {
        if (!cancelled) setCrmError(getErrorMessage(error));
      } finally {
        if (!cancelled) setIsLoadingData(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [session?.user, refreshKey]);

  const reloadData = () => setRefreshKey((current) => current + 1);

  const handleAuth = async (
    email: string,
    password: string,
    mode: "login" | "signup",
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
              data: { nome: email.split("@")[0] },
            },
          });

    const { data, error } = await request;
    if (error) {
      setAuthError(getErrorMessage(error));
      return;
    }

    if (data.session) {
      setSession(data.session);
      navigate("dashboard");
      return;
    }

    setAuthError(
      "Conta criada. Confirme o e-mail, se a confirmação estiver ativada no Supabase, e faça login.",
    );
  };

  const handleSignOut = async () => {
    await supabase?.auth.signOut();
    setSession(null);
    navigate("login");
  };

  const runMutation = async (
    mutation: () => Promise<unknown>,
    successMsg = "Operação concluída!",
  ) => {
    setIsSaving(true);
    setCrmError(null);

    try {
      await mutation();
      setModal(null);
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

  const ownerId = session?.user.id;

  const createContactFromForm = async (formData: FormData) => {
    if (!ownerId) return;
    await runMutation(
      () =>
        createContact(ownerId, {
          nome: getFormValue(formData, "nome"),
          telefone: getFormValue(formData, "telefone"),
          email: getFormValue(formData, "email"),
          origem: getFormValue(formData, "origem"),
          potencial: getFormValue(formData, "potencial"),
        }),
      "Contato cadastrado com sucesso!",
    );
  };

  const createLeadFromForm = async (formData: FormData) => {
    if (!ownerId) return;
    await runMutation(
      () =>
        createLead(ownerId, {
          nome: getFormValue(formData, "nome"),
          telefone: getFormValue(formData, "telefone"),
          email: getFormValue(formData, "email"),
          interesse: getFormValue(formData, "interesse"),
          origem: getFormValue(formData, "origem"),
          valor_estimado: Number(getFormValue(formData, "valor_estimado") || 0),
        }),
      "Lead cadastrado com sucesso!",
    );
  };

  const createOpportunityFromForm = async (formData: FormData) => {
    if (!ownerId) return;
    await runMutation(
      () =>
        createOpportunity(ownerId, {
          lead_id: getFormValue(formData, "lead_id") || null,
          titulo: getFormValue(formData, "titulo"),
          etapa: (getFormValue(formData, "etapa") ||
            "Novo") as OpportunityStage,
          valor: Number(getFormValue(formData, "valor") || 0),
          responsavel: getFormValue(formData, "responsavel"),
          proxima_acao: getFormValue(formData, "proxima_acao"),
        }),
      "Oportunidade criada com sucesso!",
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

  const handleConvertContact = async (contact: Contact) => {
    if (!ownerId) return;
    await runMutation(
      () => convertContactToLead(ownerId, contact),
      "Contato convertido em lead!",
    );
  };

  const handleCreateOpportunityFromLead = async (lead: Lead) => {
    if (!ownerId) return;
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

    setSnapshot((prev: any) => {
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

  if (isBooting) {
    return <LoadingScreen label="Conectando ao Supabase..." />;
  }

  if (!session || route === "login") {
    return <LoginScreen authError={authError} onAuth={handleAuth} />;
  }

  return (
    <div className="shell">
      <Toaster position="bottom-right" />
      <Sidebar
        activeRoute={route}
        onNavigate={navigate}
        onSignOut={handleSignOut}
      />
      <main className="workspace">
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          profileName={
            snapshot.profile?.nome ?? session.user.email ?? "Usuário"
          }
          query={query}
          route={route}
          onQueryChange={setQuery}
          onSignOut={handleSignOut}
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
          {route === "dashboard" && (
            <Dashboard snapshot={snapshot} onOpenModal={setModal} />
          )}
          {route === "inbox" && (
            <InboxPage
              messages={snapshot.messages}
              query={query}
              onOpenModal={setModal}
            />
          )}
          {route === "contatos" && (
            <ContactsPage
              contacts={snapshot.contacts}
              query={query}
              isSaving={isSaving}
              onConvertContact={handleConvertContact}
              onOpenModal={setModal}
            />
          )}
          {route === "leads" && (
            <LeadsPage
              isSaving={isSaving}
              leads={snapshot.leads}
              query={query}
              onCreateOpportunity={handleCreateOpportunityFromLead}
              onOpenModal={setModal}
            />
          )}
          {route === "funil" && (
            <PipelinePage
              leads={snapshot.leads}
              opportunities={snapshot.opportunities}
              onOpenModal={setModal}
              onDragEnd={handleDragEnd}
            />
          )}
        </section>
      </main>

      {modal === "contact" && (
        <ContactModal
          isSaving={isSaving}
          onClose={() => setModal(null)}
          onSubmit={createContactFromForm}
        />
      )}
      {modal === "lead" && (
        <LeadModal
          isSaving={isSaving}
          onClose={() => setModal(null)}
          onSubmit={createLeadFromForm}
        />
      )}
      {modal === "opportunity" && (
        <OpportunityModal
          isSaving={isSaving}
          leads={snapshot.leads}
          onClose={() => setModal(null)}
          onSubmit={createOpportunityFromForm}
        />
      )}
      {modal === "message" && (
        <MessageModal
          isSaving={isSaving}
          onClose={() => setModal(null)}
          onSubmit={createMessageFromForm}
        />
      )}
    </div>
  );
}

function LoginScreen({
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

  return (
    <main className="login-page">
      <section className="login-visual" aria-label="Funil Comercial">
        <img
          src="/logo.png"
          alt="Logo"
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "24px",
            marginBottom: "32px",
          }}
        />
        <p className="eyebrow">Funil Comercial</p>
        <h1>
          Organize conversas, leads e oportunidades em um só fluxo comercial.
        </h1>
        <p>
          Uma fundação simples para operar WhatsApp, contatos, leads, funil e
          métricas comerciais com Supabase.
        </p>
        <div className="flow-line" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
      </section>

      <form
        className="login-card"
        aria-label="Entrar na plataforma"
        onSubmit={handleSubmit}
      >
        <div>
          <p className="eyebrow">Acesso ao MVP</p>
          <h2>Entrar na plataforma</h2>
          <p className="muted">
            Use uma conta cadastrada no Supabase para acessar o CRM.
          </p>
        </div>

        {!isSupabaseConfigured && (
          <p className="config-warning">
            Configure `VITE_SUPABASE_ANON_KEY` para ativar login, cadastro e
            dados reais.
          </p>
        )}

        {authError && (
          <p className="alert error" role="alert">
            {authError}
          </p>
        )}

        <label>
          E-mail corporativo
          <input
            name="email"
            placeholder="gestor@empresa.com.br"
            required
            type="email"
          />
        </label>
        <label>
          Senha
          <input
            minLength={6}
            name="password"
            placeholder="Mínimo 6 caracteres"
            required
            type="password"
          />
        </label>

        <button
          className="primary-button"
          disabled={!isSupabaseConfigured || isSubmitting}
          type="submit"
          value="login"
        >
          {isSubmitting ? "Entrando..." : "Entrar na plataforma"}{" "}
          <MoveRight size={18} />
        </button>

        <button
          className="secondary-button"
          disabled={!isSupabaseConfigured || isSubmitting}
          type="submit"
          value="signup"
        >
          Criar conta de teste
        </button>
      </form>
    </main>
  );
}

function Sidebar({
  activeRoute,
  onNavigate,
  onSignOut,
}: {
  activeRoute: Route;
  onNavigate: (route: Route) => void;
  onSignOut: () => void;
}) {
  return (
    <aside className="sidebar">
      <button className="logo-button" onClick={() => onNavigate("dashboard")}>
        <img
          src="/logo.png"
          alt="Logo"
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "14px",
            flex: "0 0 auto",
          }}
        />
        <span>
          <strong>Funil Comercial</strong>
          <small>Operação comercial</small>
        </span>
      </button>

      <nav aria-label="Menu principal">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={activeRoute === item.id ? "active" : ""}
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
  query,
  route,
  theme,
  onQueryChange,
  onSignOut,
  toggleTheme,
}: {
  profileName: string;
  query: string;
  route: Route;
  theme?: "light" | "dark";
  onQueryChange: (q: string) => void;
  onSignOut: () => void;
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
        <p className="eyebrow">Funil Comercial</p>
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
          <button className="icon-button" aria-label="Alternar Tema" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        <button className="icon-button" aria-label="Notificações">
          <Bell size={18} />
        </button>
        <span className="user-chip" title={profileName}>
          {initials || "FC"}
        </span>
        <button className="icon-button" aria-label="Sair" onClick={onSignOut}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

function Dashboard({
  snapshot,
  onOpenModal,
}: {
  snapshot: CrmSnapshot;
  onOpenModal: (modal: ModalType) => void;
}) {
  const activeLeads = snapshot.leads.filter(
    (lead) => !["convertido", "perdido"].includes(lead.status),
  );
  const openPipeline = snapshot.opportunities
    .filter((item) => !["Ganho", "Perdido"].includes(item.etapa))
    .reduce((sum, item) => sum + Number(item.valor), 0);
  const conversionRate = snapshot.leads.length
    ? Math.round((snapshot.opportunities.length / snapshot.leads.length) * 100)
    : 0;
  const pendingMessages = snapshot.messages.filter(
    (message) => message.unread_count > 0 || message.status !== "Resolvido",
  );

  return (
    <div className="page-stack">
      <HeroPanel
        action="Novo lead"
        description="Visão rápida para priorizar conversas, leads e oportunidades sem depender de planilhas."
        eyebrow="Centro de comando"
        title="O que precisa de atenção comercial agora?"
        onAction={() => onOpenModal("lead")}
      />

      <section className="metrics-grid">
        <MetricCard
          icon={UsersRound}
          label="Leads ativos"
          value={String(activeLeads.length)}
          hint="Leads não convertidos"
        />
        <MetricCard
          icon={MessageCircle}
          label="Conversas pendentes"
          value={String(pendingMessages.length)}
          hint="Inbox com ação necessária"
          tone={pendingMessages.length ? "warning" : "neutral"}
        />
        <MetricCard
          icon={CircleDollarSign}
          label="Pipeline aberto"
          value={formatMoney(openPipeline)}
          hint="Oportunidades em andamento"
        />
        <MetricCard
          icon={TrendingUp}
          label="Conversão base"
          value={`${conversionRate}%`}
          hint="Oportunidades sobre leads"
          tone="success"
        />
      </section>

      <section className="split-grid">
        <Panel title="Prioridades do dia" eyebrow="Ação comercial">
          <div className="action-list">
            {pendingMessages.slice(0, 2).map((message) => (
              <ActionItem
                key={message.id}
                description={message.mensagem}
                priority="Alta"
                title={`Responder ${message.remetente_nome}`}
              />
            ))}
            {activeLeads.slice(0, 2).map((lead) => (
              <ActionItem
                key={lead.id}
                description={lead.proxima_acao}
                priority="Média"
                title={`Avançar ${lead.nome}`}
              />
            ))}
            {pendingMessages.length === 0 && activeLeads.length === 0 && (
              <EmptyState
                action="Criar primeiro contato"
                description="Cadastre um contato ou lead para iniciar a operação."
                onAction={() => onOpenModal("contact")}
              />
            )}
          </div>
        </Panel>

        <Panel title="Funil resumido" eyebrow="Oportunidades">
          <div className="funnel-mini">
            {stages.slice(0, 6).map((stage) => {
              const count = snapshot.opportunities.filter(
                (item) => item.etapa === stage,
              ).length;
              return (
                <div key={stage}>
                  <span>{stage}</span>
                  <strong>{count}</strong>
                </div>
              );
            })}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function InboxPage({
  messages,
  query,
  onOpenModal,
}: {
  messages: InboxMessage[];
  query: string;
  onOpenModal: (modal: ModalType) => void;
}) {
  const filteredMessages = messages.filter((message) =>
    matchesQuery(query, [
      message.remetente_nome,
      message.telefone,
      message.mensagem,
      message.status,
    ]),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected =
    filteredMessages.find((message) => message.id === selectedId) ??
    filteredMessages[0];

  return (
    <div className="page-stack">
      <HeroPanel
        action="Simular entrada"
        description="O inbox centraliza conversas vindas do WhatsApp e prepara o lead para o funil."
        eyebrow="WhatsApp comercial"
        title="Converse, qualifique e transforme mensagens em oportunidades."
        onAction={() => onOpenModal("message")}
      />

      {filteredMessages.length === 0 ? (
        <EmptyState
          action="Criar mensagem de teste"
          description="Nenhuma conversa encontrada para esta conta."
          onAction={() => onOpenModal("message")}
        />
      ) : (
        <section className="inbox-layout">
          <Panel title="Conversas" eyebrow="Entrada">
            <div className="conversation-list">
              {filteredMessages.map((conversation) => (
                <button
                  key={conversation.id}
                  className={
                    selected?.id === conversation.id
                      ? "selected conversation-item"
                      : "conversation-item"
                  }
                  onClick={() => setSelectedId(conversation.id)}
                >
                  <span>
                    <strong>{conversation.remetente_nome}</strong>
                    <small>{conversation.mensagem}</small>
                  </span>
                  <em>
                    {conversation.unread_count
                      ? `${conversation.unread_count} nova`
                      : conversation.canal}
                  </em>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title={selected.remetente_nome} eyebrow={selected.status}>
            <div className="chat-window">
              <p className="message inbound">{selected.mensagem}</p>
              <p className="message outbound">
                Recebido. Vou qualificar seu interesse e indicar o próximo passo
                comercial.
              </p>
            </div>
            <div className="composer">
              <input placeholder="Escreva uma resposta..." />
              <button className="primary-button">Enviar</button>
            </div>
          </Panel>
        </section>
      )}
    </div>
  );
}

function ContactsPage({
  contacts,
  query,
  isSaving,
  onConvertContact,
  onOpenModal,
}: {
  contacts: Contact[];
  query: string;
  isSaving: boolean;
  onConvertContact: (contact: Contact) => Promise<void>;
  onOpenModal: (modal: ModalType) => void;
}) {
  const filteredContacts = contacts.filter((contact) =>
    matchesQuery(query, [
      contact.nome,
      contact.telefone,
      contact.email,
      contact.origem,
      contact.potencial,
    ]),
  );

  return (
    <div className="page-stack">
      <PageIntro
        action="Novo contato"
        description="Cadastre, organize e encontre rapidamente pessoas e empresas que podem virar leads."
        eyebrow="Base comercial"
        title="Contatos"
        onAction={() => onOpenModal("contact")}
      />
      <TablePanel
        emptyAction={() => onOpenModal("contact")}
        emptyLabel="Cadastrar contato"
        isEmpty={filteredContacts.length === 0}
      >
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Origem</th>
              <th>Potencial</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.nome}</td>
                <td>{contact.telefone}</td>
                <td>{contact.origem}</td>
                <td>{contact.potencial}</td>
                <td>
                  <button
                    className="table-action"
                    disabled={isSaving}
                    onClick={() => onConvertContact(contact)}
                  >
                    Converter em lead
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TablePanel>
    </div>
  );
}

function LeadsPage({
  leads,
  query,
  isSaving,
  onCreateOpportunity,
  onOpenModal,
}: {
  leads: Lead[];
  query: string;
  isSaving: boolean;
  onCreateOpportunity: (lead: Lead) => Promise<void>;
  onOpenModal: (modal: ModalType) => void;
}) {
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

  return (
    <div className="page-stack">
      <PageIntro
        action="Novo lead"
        description="Acompanhe interessados, próximos passos e conversões para oportunidade."
        eyebrow="Qualificação"
        title="Leads"
        onAction={() => onOpenModal("lead")}
      />
      {filteredLeads.length === 0 ? (
        <EmptyState
          action="Cadastrar lead"
          description="Nenhum lead encontrado para esta conta."
          onAction={() => onOpenModal("lead")}
        />
      ) : (
        <div className="lead-grid">
          {filteredLeads.map((lead) => (
            <article className="lead-card" key={lead.id}>
              <span className={`status-badge ${lead.status}`}>
                {lead.status.replace("_", " ")}
              </span>
              <h3>{lead.nome}</h3>
              <p>{lead.interesse}</p>
              <div>
                <strong>{formatMoney(Number(lead.valor_estimado))}</strong>
                <small>{lead.origem}</small>
              </div>
              <footer>
                <Clock3 size={16} />
                {lead.proxima_acao}
              </footer>
              <button
                className="secondary-button"
                disabled={isSaving}
                onClick={() => onCreateOpportunity(lead)}
              >
                Criar oportunidade
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function PipelineCard({ item }: { item: any }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: { item },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      }
    : undefined;

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="opportunity-card"
    >
      <h3>{item.titulo}</h3>
      <strong>{formatMoney(Number(item.valor))}</strong>
      <p>{item.proxima_acao}</p>
      <small>{item.responsavel}</small>
    </article>
  );
}

function PipelineColumn({ column }: { column: any }) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.stage,
  });

  return (
    <div
      ref={setNodeRef}
      className={`pipeline-column ${isOver ? "column-over" : ""}`}
      style={{ backgroundColor: isOver ? "var(--color-muted)" : undefined }}
    >
      <header>
        <span>{column.stage}</span>
        <strong>{column.items.length}</strong>
      </header>
      <div className="pipeline-items">
        {column.items.map((item: any) => (
          <PipelineCard key={item.id} item={item} />
        ))}
        {column.items.length === 0 && (
          <p className="empty-column">Solte aqui.</p>
        )}
      </div>
    </div>
  );
}

function PipelinePage({
  leads,
  opportunities,
  onOpenModal,
  onDragEnd,
}: {
  leads: Lead[];
  opportunities: CrmSnapshot["opportunities"];
  onOpenModal: (modal: ModalType) => void;
  onDragEnd: (event: any) => void;
}) {
  const grouped = useMemo(
    () =>
      stages.map((stage) => ({
        stage,
        items: opportunities.filter((item) => item.etapa === stage),
      })),
    [opportunities],
  );

  return (
    <div className="page-stack">
      <PageIntro
        action="Nova oportunidade"
        description="Visualize oportunidades por etapa e mantenha sempre uma próxima ação definida. Arraste os cards para mover."
        eyebrow="Pipeline"
        title="Funil de vendas"
        onAction={() => onOpenModal(leads.length ? "opportunity" : "lead")}
      />

      <DndContext onDragEnd={onDragEnd}>
        <section className="pipeline-board" aria-label="Funil de vendas">
          {grouped.map((column) => (
            <PipelineColumn key={column.stage} column={column} />
          ))}
        </section>
      </DndContext>
    </div>
  );
}

function HeroPanel({
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
    <section className="hero-panel">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <button className="secondary-button" onClick={onAction}>
        <Sparkles size={17} />
        {action}
      </button>
    </section>
  );
}

function PageIntro({
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
    <section className="page-intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <button className="primary-button" onClick={onAction}>
        <Plus size={17} />
        {action}
      </button>
    </section>
  );
}

function MetricCard({
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
  return (
    <article className={`metric-card ${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
      <Icon size={22} />
    </article>
  );
}

function Panel({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <section className="panel">
      <header>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </header>
      {children}
    </section>
  );
}

function ActionItem({
  title,
  description,
  priority,
}: {
  title: string;
  description: string;
  priority: string;
}) {
  return (
    <article className="action-item">
      <Target size={18} />
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <span>{priority}</span>
    </article>
  );
}

function TablePanel({
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
    <section className="table-panel">
      {isEmpty ? (
        <EmptyState
          action={emptyLabel}
          description="Nenhum registro encontrado. Comece criando o primeiro item."
          onAction={emptyAction}
        />
      ) : (
        <div className="table-scroll">{children}</div>
      )}
    </section>
  );
}

function EmptyState({
  action,
  description,
  onAction,
}: {
  action: string;
  description: string;
  onAction: () => void;
}) {
  return (
    <div className="empty-state">
      <p>{description}</p>
      <button className="secondary-button" onClick={onAction}>
        <Plus size={16} />
        {action}
      </button>
    </div>
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

function ContactModal({
  isSaving,
  onClose,
  onSubmit,
}: {
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  return (
    <Modal title="Novo contato" onClose={onClose}>
      <EntityForm
        isSaving={isSaving}
        submitLabel="Salvar contato"
        onClose={onClose}
        onSubmit={onSubmit}
      >
        <TextField label="Nome" name="nome" required />
        <TextField
          label="Telefone"
          name="telefone"
          placeholder="5511999999999"
          required
        />
        <TextField label="E-mail" name="email" type="email" />
        <TextField
          label="Origem"
          name="origem"
          placeholder="WhatsApp, indicação, landing page..."
        />
        <TextField
          label="Potencial"
          name="potencial"
          placeholder="Novo, alto, médio..."
        />
      </EntityForm>
    </Modal>
  );
}

function LeadModal({
  isSaving,
  onClose,
  onSubmit,
}: {
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  return (
    <Modal title="Novo lead" onClose={onClose}>
      <EntityForm
        isSaving={isSaving}
        submitLabel="Salvar lead"
        onClose={onClose}
        onSubmit={onSubmit}
      >
        <TextField label="Nome" name="nome" required />
        <TextField
          label="Telefone"
          name="telefone"
          placeholder="5511999999999"
          required
        />
        <TextField label="E-mail" name="email" type="email" />
        <TextField
          label="Interesse"
          name="interesse"
          placeholder="Produto, serviço ou necessidade"
          required
        />
        <TextField
          label="Origem"
          name="origem"
          placeholder="WhatsApp, Meta Ads, indicação..."
        />
        <TextField label="Valor estimado" name="valor_estimado" type="number" />
      </EntityForm>
    </Modal>
  );
}

function OpportunityModal({
  isSaving,
  leads,
  onClose,
  onSubmit,
}: {
  isSaving: boolean;
  leads: Lead[];
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  return (
    <Modal title="Nova oportunidade" onClose={onClose}>
      <EntityForm
        isSaving={isSaving}
        submitLabel="Salvar oportunidade"
        onClose={onClose}
        onSubmit={onSubmit}
      >
        <SelectField label="Lead vinculado" name="lead_id">
          <option value="">Sem vínculo</option>
          {leads.map((lead) => (
            <option key={lead.id} value={lead.id}>
              {lead.nome}
            </option>
          ))}
        </SelectField>
        <TextField label="Título" name="titulo" required />
        <SelectField label="Etapa" name="etapa">
          {stages.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </SelectField>
        <TextField label="Valor" name="valor" type="number" />
        <TextField label="Responsável" name="responsavel" />
        <TextField label="Próxima ação" name="proxima_acao" />
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
          placeholder="5511999999999"
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
  label,
  name,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  const isPhone = name === "telefone";
  const isMoney = name === "valor_estimado" || name === "valor";

  return (
    <label>
      {label}
      {isPhone ? (
        <IMaskInput
          name={name}
          mask="(00) 00000-0000"
          placeholder={placeholder || "(11) 99999-9999"}
          required={required}
        />
      ) : isMoney ? (
        <IMaskInput
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
  label,
  name,
}: {
  children: ReactNode;
  label: string;
  name: string;
}) {
  return (
    <label>
      {label}
      <select name={name}>{children}</select>
    </label>
  );
}

function LoadingScreen({ label }: { label: string }) {
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

export default App;
