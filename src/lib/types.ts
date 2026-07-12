import type { PillarId } from "./editorialPillars"

export type Route = 'login' | 'cadastro' | 'dashboard' | 'inbox' | 'contatos' | 'leads' | 'funil' | 'campanhas' | 'perfil' | 'configuracoes' | 'criativos' | 'roteiro' | 'brandbook'

export type LeadStatus = 'novo' | 'em_atendimento' | 'qualificado' | 'convertido' | 'perdido'

export type EditorialQueueStatus = 'a_fazer' | 'gerado' | 'publicado'

export type EditorialQueueItem = {
  id: string
  owner_id: string
  pilar: PillarId
  tema: string
  status: EditorialQueueStatus
  created_at: string
  updated_at: string
}

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
  admin_id?: string | null
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
  produto: string | null
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
  // Status de entrega (mensagens de saída via Meta), atualizado pelo webhook.
  delivery_status?: 'sent' | 'delivered' | 'read' | 'failed' | null
  delivery_error?: string | null
  sent_by?: string | null
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

export type CampaignStatus =
  | 'scheduled'
  | 'sending'
  | 'done'
  | 'failed'
  | 'canceled'

export type CampaignVariable = { mode: 'name' | 'fixed'; value: string }

export type Campaign = {
  id: string
  owner_id: string
  nome: string
  template_name: string
  template_language: string
  body_text: string
  variables: CampaignVariable[]
  scheduled_at: string
  status: CampaignStatus
  total: number
  sent: number
  failed: number
  started_at: string | null
  finished_at: string | null
  created_at: string
  updated_at: string
}

export type TeamMember = {
  id: string
  nome: string | null
  email: string | null
  role: 'diretor' | 'gestor' | 'vendedor'
  admin_id: string | null
  avatar_url?: string | null
}

export type ConversationAssignment = {
  id: string
  owner_id: string
  telefone: string
  assigned_to: string
  assigned_by: string | null
  updated_at: string
}
