export type Route = 'login' | 'cadastro' | 'dashboard' | 'inbox' | 'contatos' | 'leads' | 'funil' | 'perfil' | 'criativos' | 'brandbook'

export type LeadStatus = 'novo' | 'em_atendimento' | 'qualificado' | 'convertido' | 'perdido'

export type OpportunityStage =
  | 'Novo'
  | 'Em atendimento'
  | 'Qualificado'
  | 'Proposta'
  | 'Negociação'
  | 'Ganho'
  | 'Perdido'

export type Profile = {
  id: string
  nome: string | null
  email: string | null
  telefone: string | null
  role: 'diretor' | 'gestor' | 'vendedor'
  avatar_url?: string | null
  created_at: string
}

export type Contact = {
  id: string
  owner_id: string
  nome: string
  telefone: string
  email: string | null
  origem: string
  potencial: string
  created_at: string
}

export type Lead = {
  id: string
  owner_id: string
  contact_id: string | null
  nome: string
  telefone: string
  email: string | null
  interesse: string
  status: LeadStatus
  valor_estimado: number
  proxima_acao: string
  origem: string
  created_at: string
}

export type Opportunity = {
  id: string
  owner_id: string
  lead_id: string | null
  titulo: string
  etapa: OpportunityStage
  valor: number
  responsavel: string
  proxima_acao: string
  created_at: string
}

export type InboxMessage = {
  id: string
  owner_id: string
  contact_id: string | null
  lead_id: string | null
  canal: string
  provider: string
  provider_message_id: string | null
  remetente_nome: string
  telefone: string
  mensagem: string
  status: string
  unread_count: number
  direction: 'inbound' | 'outbound'
  created_at: string
}

export type IntegrationChannel = {
  id: string
  owner_id: string
  provider: string
  nome: string
  numero: string
  status: 'ativo' | 'pausado' | 'inativo'
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type CrmSnapshot = {
  profile: Profile | null
  contacts: Contact[]
  leads: Lead[]
  opportunities: Opportunity[]
  messages: InboxMessage[]
  channels: IntegrationChannel[]
}
