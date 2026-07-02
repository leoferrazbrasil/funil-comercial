import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  BriefcaseBusiness,
  CircleDollarSign,
  Clock3,
  ContactRound,
  Filter,
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
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type Route = 'login' | 'dashboard' | 'inbox' | 'contatos' | 'leads' | 'funil'

type NavItem = {
  id: Route
  label: string
  icon: LucideIcon
}

type LeadStatus = 'novo' | 'em atendimento' | 'qualificado' | 'convertido'

type OpportunityStage = 'Novo' | 'Em atendimento' | 'Qualificado' | 'Proposta' | 'Negociação' | 'Ganho'

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'contatos', label: 'Contatos', icon: ContactRound },
  { id: 'leads', label: 'Leads', icon: UsersRound },
  { id: 'funil', label: 'Funil de vendas', icon: BriefcaseBusiness },
]

const contacts = [
  { name: 'Marina Costa', phone: '5511999214455', email: 'marina@exemplo.com', origin: 'WhatsApp', owner: 'Rafaela', score: 'Alto' },
  { name: 'Grupo Salute', phone: '5541998401212', email: 'comercial@salute.com', origin: 'Indicação', owner: 'Daniel', score: 'Médio' },
  { name: 'João Henrique', phone: '5531997883344', email: 'joao@exemplo.com', origin: 'Landing page', owner: 'Rafaela', score: 'Alto' },
  { name: 'Clínica Verona', phone: '5551993112255', email: 'contato@verona.com', origin: 'Meta Ads', owner: 'Paulo', score: 'Novo' },
]

const leads: Array<{ name: string; interest: string; status: LeadStatus; value: string; next: string; owner: string }> = [
  { name: 'Marina Costa', interest: 'Implantação de CRM', status: 'qualificado', value: 'R$ 8.500', next: 'Enviar proposta hoje', owner: 'Rafaela' },
  { name: 'Clínica Verona', interest: 'Atendimento WhatsApp', status: 'novo', value: 'R$ 4.200', next: 'Primeiro contato', owner: 'Paulo' },
  { name: 'Grupo Salute', interest: 'Organização comercial', status: 'em atendimento', value: 'R$ 12.000', next: 'Retorno às 16h', owner: 'Daniel' },
  { name: 'João Henrique', interest: 'Funil de vendas', status: 'convertido', value: 'R$ 6.800', next: 'Oportunidade criada', owner: 'Rafaela' },
]

const conversations = [
  { name: 'Clínica Verona', message: 'Tenho interesse em organizar o atendimento comercial da clínica.', time: '3 min', status: 'Novo lead', unread: 2 },
  { name: 'Marina Costa', message: 'Podemos marcar uma demonstração para amanhã?', time: '18 min', status: 'Qualificado', unread: 0 },
  { name: 'Grupo Salute', message: 'Preciso entender se funciona para equipe com 6 vendedores.', time: '42 min', status: 'Em atendimento', unread: 1 },
  { name: 'João Henrique', message: 'Me envie os próximos passos para avançarmos.', time: '1 h', status: 'Oportunidade', unread: 0 },
]

const stages: OpportunityStage[] = ['Novo', 'Em atendimento', 'Qualificado', 'Proposta', 'Negociação', 'Ganho']

const opportunities = [
  { title: 'Clínica Verona', stage: 'Novo', value: 4200, owner: 'Paulo', action: 'Responder WhatsApp' },
  { title: 'Grupo Salute', stage: 'Em atendimento', value: 12000, owner: 'Daniel', action: 'Confirmar diagnóstico' },
  { title: 'Marina Costa', stage: 'Qualificado', value: 8500, owner: 'Rafaela', action: 'Enviar proposta' },
  { title: 'Academia Flux', stage: 'Proposta', value: 6200, owner: 'Paulo', action: 'Follow-up amanhã' },
  { title: 'SolarPrime', stage: 'Negociação', value: 15400, owner: 'Daniel', action: 'Validar escopo' },
  { title: 'João Henrique', stage: 'Ganho', value: 6800, owner: 'Rafaela', action: 'Onboarding' },
] as const

const formatMoney = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)

const getRoute = (): Route => {
  const route = window.location.hash.replace('#/', '') as Route
  if (['dashboard', 'inbox', 'contatos', 'leads', 'funil'].includes(route)) return route
  return 'login'
}

function App() {
  const [route, setRoute] = useState<Route>(getRoute)
  const [isAuthed, setIsAuthed] = useState(() => window.location.hash !== '' && getRoute() !== 'login')
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = (nextRoute: Route) => {
    if (nextRoute === 'login') {
      setIsAuthed(false)
      window.location.hash = ''
      setRoute('login')
      return
    }

    setIsAuthed(true)
    window.location.hash = `/${nextRoute}`
    setRoute(nextRoute)
  }

  if (!isAuthed || route === 'login') {
    return <LoginScreen onEnter={() => navigate('dashboard')} />
  }

  return (
    <div className="shell">
      <Sidebar activeRoute={route} onNavigate={navigate} />
      <main className="workspace">
        <Header route={route} query={query} onQueryChange={setQuery} />
        <section className="content">
          {route === 'dashboard' && <Dashboard />}
          {route === 'inbox' && <InboxPage />}
          {route === 'contatos' && <ContactsPage />}
          {route === 'leads' && <LeadsPage />}
          {route === 'funil' && <PipelinePage />}
        </section>
      </main>
    </div>
  )
}

function LoginScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <main className="login-page">
      <section className="login-visual" aria-label="Funil Comercial">
        <div className="brand-mark">
          <span />
          <strong>FC</strong>
        </div>
        <p className="eyebrow">Funil Comercial</p>
        <h1>Organize conversas, leads e oportunidades em um só fluxo comercial.</h1>
        <p>
          Um protótipo navegável para validar uma operação simples: WhatsApp, contatos, leads, funil e métricas.
        </p>
        <div className="flow-line" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
      </section>

      <section className="login-card" aria-label="Entrar na plataforma">
        <div>
          <p className="eyebrow">Acesso ao MVP</p>
          <h2>Entrar na plataforma</h2>
          <p className="muted">Use o acesso de demonstração para navegar pelo protótipo.</p>
        </div>

        <label>
          E-mail corporativo
          <input defaultValue="gestor@funilcomercial.com.br" type="email" />
        </label>
        <label>
          Senha
          <input defaultValue="prototipo" type="password" />
        </label>

        <button className="primary-button" onClick={onEnter}>
          Acessar protótipo <MoveRight size={18} />
        </button>
      </section>
    </main>
  )
}

function Sidebar({ activeRoute, onNavigate }: { activeRoute: Route; onNavigate: (route: Route) => void }) {
  return (
    <aside className="sidebar">
      <button className="logo-button" onClick={() => onNavigate('dashboard')}>
        <span className="mini-mark">FC</span>
        <span>
          <strong>Funil Comercial</strong>
          <small>Operação comercial</small>
        </span>
      </button>

      <nav aria-label="Menu principal">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={activeRoute === item.id ? 'active' : ''}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={18} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="health-pill">
          <ShieldCheck size={16} />
          MVP navegável
        </div>
        <button onClick={() => onNavigate('login')}>
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  )
}

function Header({
  route,
  query,
  onQueryChange,
}: {
  route: Route
  query: string
  onQueryChange: (value: string) => void
}) {
  const title = navItems.find((item) => item.id === route)?.label ?? 'Dashboard'

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Funil Comercial</p>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <label className="search-box">
          <Search size={18} />
          <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Buscar..." />
        </label>
        <button className="icon-button" aria-label="Notificações">
          <Bell size={18} />
        </button>
        <span className="user-chip">GC</span>
      </div>
    </header>
  )
}

function Dashboard() {
  const totalPipeline = opportunities
    .filter((item) => item.stage !== 'Ganho')
    .reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="page-stack">
      <HeroPanel
        eyebrow="Centro de comando"
        title="O que precisa de atenção comercial agora?"
        description="Visão rápida para priorizar conversas, leads e oportunidades sem depender de planilhas."
        action="Revisar pendências"
      />

      <section className="metrics-grid">
        <MetricCard icon={UsersRound} label="Leads ativos" value="18" hint="+4 nas últimas 24h" />
        <MetricCard icon={MessageCircle} label="Conversas pendentes" value="3" hint="SLA crítico em 1 conversa" tone="warning" />
        <MetricCard icon={CircleDollarSign} label="Pipeline aberto" value={formatMoney(totalPipeline)} hint="5 oportunidades em andamento" />
        <MetricCard icon={TrendingUp} label="Conversão base" value="24%" hint="Lead para oportunidade" tone="success" />
      </section>

      <section className="split-grid">
        <Panel title="Prioridades do dia" eyebrow="Ação comercial">
          <div className="action-list">
            <ActionItem title="Responder Clínica Verona" description="Lead novo chegou pelo WhatsApp há 3 minutos." priority="Alta" />
            <ActionItem title="Enviar proposta para Marina" description="Lead qualificado já pediu demonstração." priority="Alta" />
            <ActionItem title="Confirmar retorno Grupo Salute" description="Retorno combinado para hoje às 16h." priority="Média" />
          </div>
        </Panel>

        <Panel title="Funil resumido" eyebrow="Oportunidades">
          <div className="funnel-mini">
            {stages.slice(0, 5).map((stage) => {
              const count = opportunities.filter((item) => item.stage === stage).length
              return (
                <div key={stage}>
                  <span>{stage}</span>
                  <strong>{count}</strong>
                </div>
              )
            })}
          </div>
        </Panel>
      </section>
    </div>
  )
}

function InboxPage() {
  const [selected, setSelected] = useState(conversations[0])

  return (
    <div className="page-stack">
      <HeroPanel
        eyebrow="WhatsApp comercial"
        title="Converse, qualifique e transforme mensagens em oportunidades."
        description="O inbox do MVP centraliza conversas e orienta o próximo passo da equipe."
        action="Conectar provedor"
      />

      <section className="inbox-layout">
        <Panel title="Conversas" eyebrow="Entrada">
          <div className="conversation-list">
            {conversations.map((conversation) => (
              <button
                key={conversation.name}
                className={selected.name === conversation.name ? 'selected conversation-item' : 'conversation-item'}
                onClick={() => setSelected(conversation)}
              >
                <span>
                  <strong>{conversation.name}</strong>
                  <small>{conversation.message}</small>
                </span>
                <em>{conversation.time}</em>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title={selected.name} eyebrow={selected.status}>
          <div className="chat-window">
            <p className="message inbound">{selected.message}</p>
            <p className="message outbound">Perfeito. Vou entender seu momento comercial e te mostrar o próximo passo.</p>
          </div>
          <div className="composer">
            <input placeholder="Escreva uma resposta..." />
            <button className="primary-button">Enviar</button>
          </div>
        </Panel>
      </section>
    </div>
  )
}

function ContactsPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Base comercial"
        title="Contatos"
        description="Cadastre, organize e encontre rapidamente pessoas e empresas que podem virar leads."
        action="Novo contato"
      />
      <DataTable
        columns={['Nome', 'Telefone', 'Origem', 'Responsável', 'Potencial']}
        rows={contacts.map((contact) => [contact.name, contact.phone, contact.origin, contact.owner, contact.score])}
      />
    </div>
  )
}

function LeadsPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Qualificação"
        title="Leads"
        description="Acompanhe interessados, próximos passos e conversões para oportunidade."
        action="Novo lead"
      />
      <div className="lead-grid">
        {leads.map((lead) => (
          <article className="lead-card" key={lead.name}>
            <span className={`status-badge ${lead.status.replace(' ', '-')}`}>{lead.status}</span>
            <h3>{lead.name}</h3>
            <p>{lead.interest}</p>
            <div>
              <strong>{lead.value}</strong>
              <small>{lead.owner}</small>
            </div>
            <footer>
              <Clock3 size={16} />
              {lead.next}
            </footer>
          </article>
        ))}
      </div>
    </div>
  )
}

function PipelinePage() {
  const grouped = useMemo(
    () =>
      stages.map((stage) => ({
        stage,
        items: opportunities.filter((item) => item.stage === stage),
      })),
    [],
  )

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Pipeline"
        title="Funil de vendas"
        description="Visualize oportunidades por etapa e mantenha sempre uma próxima ação definida."
        action="Nova oportunidade"
      />

      <section className="pipeline-board" aria-label="Funil de vendas">
        {grouped.map((column) => (
          <div className="pipeline-column" key={column.stage}>
            <header>
              <span>{column.stage}</span>
              <strong>{column.items.length}</strong>
            </header>
            <div className="pipeline-items">
              {column.items.map((item) => (
                <article className="opportunity-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <strong>{formatMoney(item.value)}</strong>
                  <p>{item.action}</p>
                  <small>{item.owner}</small>
                </article>
              ))}
              {column.items.length === 0 && <p className="empty-column">Sem oportunidades nesta etapa.</p>}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

function HeroPanel({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action: string
}) {
  return (
    <section className="hero-panel">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <button className="secondary-button">
        <Sparkles size={17} />
        {action}
      </button>
    </section>
  )
}

function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action: string
}) {
  return (
    <section className="page-intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <button className="primary-button">
        <Plus size={17} />
        {action}
      </button>
    </section>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  icon: LucideIcon
  label: string
  value: string
  hint: string
  tone?: 'neutral' | 'warning' | 'success'
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
  )
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <header>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </header>
      {children}
    </section>
  )
}

function ActionItem({ title, description, priority }: { title: string; description: string; priority: string }) {
  return (
    <article className="action-item">
      <Target size={18} />
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <span>{priority}</span>
    </article>
  )
}

function DataTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <section className="table-panel">
      <div className="table-toolbar">
        <label className="search-box">
          <Search size={18} />
          <input placeholder="Buscar registros..." />
        </label>
        <button className="secondary-button">
          <Filter size={17} />
          Filtros
        </button>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.join('-')}>
                {row.map((cell) => (
                  <td key={cell}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default App
