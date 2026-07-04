import type { User } from "@supabase/supabase-js";
import { requireSupabase } from "./supabase";
import type {
  Contact,
  CrmSnapshot,
  InboxMessage,
  Lead,
  Opportunity,
  OpportunityStage,
  Profile,
} from "./types";

const defaultStages: OpportunityStage[] = [
  "Novo",
  "Em atendimento",
  "Qualificado",
  "Proposta",
  "Negociação",
  "Ganho",
  "Perdido",
];

type ContactPayload = {
  nome: string;
  telefone: string;
  email?: string;
  origem?: string;
  potencial?: string;
};

type LeadPayload = {
  contact_id?: string | null;
  nome: string;
  telefone: string;
  email?: string | null;
  interesse: string;
  status?: Lead["status"];
  valor_estimado?: number;
  proxima_acao?: string;
  origem?: string;
};

type OpportunityPayload = {
  lead_id?: string | null;
  titulo: string;
  etapa?: OpportunityStage;
  valor?: number;
  responsavel?: string;
  proxima_acao?: string;
};

type MessagePayload = {
  contact_id?: string | null;
  lead_id?: string | null;
  canal?: string;
  remetente_nome: string;
  telefone: string;
  mensagem: string;
  status?: string;
  unread_count?: number;
  direction?: InboxMessage["direction"];
};

type MessageStatusPayload = {
  status: string;
  unread_count: number;
};

type MessageLinkPayload = {
  contact_id?: string | null;
  lead_id?: string | null;
  status?: string;
  unread_count?: number;
};

const normalizePhone = (phone: string) => phone.replace(/\D/g, "");

export async function upsertProfile(user: User) {
  const supabase = requireSupabase();
  const profile: Omit<Profile, "created_at"> = {
    id: user.id,
    nome: user.user_metadata?.nome ?? user.email?.split("@")[0] ?? null,
    email: user.email ?? null,
    telefone: user.user_metadata?.telefone ?? null,
    role: "gestor",
  };

  const { error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" });
  if (error) throw error;
}

export async function ensureDefaultStages(ownerId: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("pipeline_stages")
    .select("id")
    .eq("owner_id", ownerId)
    .limit(1);
  if (error) throw error;
  if (data && data.length > 0) return;

  const { error: insertError } = await supabase.from("pipeline_stages").insert(
    defaultStages.map((nome, index) => ({
      owner_id: ownerId,
      nome,
      posicao: index + 1,
    })),
  );
  if (insertError) throw insertError;
}

export async function getCrmSnapshot(userId: string): Promise<CrmSnapshot> {
  const supabase = requireSupabase();

  const [
    profileResult,
    contactsResult,
    leadsResult,
    opportunitiesResult,
    messagesResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("opportunities")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("inbox_messages")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const errors = [
    profileResult.error,
    contactsResult.error,
    leadsResult.error,
    opportunitiesResult.error,
    messagesResult.error,
  ].filter(Boolean);

  if (errors[0]) throw errors[0];

  return {
    profile: (profileResult.data as Profile | null) ?? null,
    contacts: (contactsResult.data as Contact[]) ?? [],
    leads: (leadsResult.data as Lead[]) ?? [],
    opportunities: (opportunitiesResult.data as Opportunity[]) ?? [],
    messages: (messagesResult.data as InboxMessage[]) ?? [],
  };
}

export async function createContact(ownerId: string, payload: ContactPayload) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("contacts")
    .insert({
      owner_id: ownerId,
      nome: payload.nome.trim(),
      telefone: normalizePhone(payload.telefone),
      email: payload.email?.trim() || null,
      origem: payload.origem?.trim() || "Manual",
      potencial: payload.potencial?.trim() || "Novo",
    })
    .select()
    .single();

  if (error) throw error;
  return data as Contact;
}

export async function updateContact(contactId: string, payload: ContactPayload) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("contacts")
    .update({
      nome: payload.nome.trim(),
      telefone: normalizePhone(payload.telefone),
      email: payload.email?.trim() || null,
      origem: payload.origem?.trim() || "Manual",
      potencial: payload.potencial?.trim() || "Novo",
    })
    .eq("id", contactId)
    .select()
    .single();

  if (error) throw error;
  return data as Contact;
}

export async function createLead(ownerId: string, payload: LeadPayload) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      owner_id: ownerId,
      contact_id: payload.contact_id ?? null,
      nome: payload.nome.trim(),
      telefone: normalizePhone(payload.telefone),
      email: payload.email?.trim() || null,
      interesse: payload.interesse.trim(),
      status: payload.status ?? "novo",
      valor_estimado: payload.valor_estimado ?? 0,
      proxima_acao: payload.proxima_acao?.trim() || "Realizar primeiro contato",
      origem: payload.origem?.trim() || "Manual",
    })
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}

export async function updateLead(leadId: string, payload: LeadPayload) {
  const supabase = requireSupabase();
  const updatePayload = {
    nome: payload.nome.trim(),
    telefone: normalizePhone(payload.telefone),
    email: payload.email?.trim() || null,
    interesse: payload.interesse.trim(),
    status: payload.status ?? "novo",
    valor_estimado: payload.valor_estimado ?? 0,
    proxima_acao: payload.proxima_acao?.trim() || "Realizar primeiro contato",
    origem: payload.origem?.trim() || "Manual",
    ...(payload.contact_id !== undefined
      ? { contact_id: payload.contact_id }
      : {}),
  };

  const { data, error } = await supabase
    .from("leads")
    .update(updatePayload)
    .eq("id", leadId)
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}

export async function createOpportunity(
  ownerId: string,
  payload: OpportunityPayload,
) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("opportunities")
    .insert({
      owner_id: ownerId,
      lead_id: payload.lead_id ?? null,
      titulo: payload.titulo.trim(),
      etapa: payload.etapa ?? "Novo",
      valor: payload.valor ?? 0,
      responsavel: payload.responsavel?.trim() || "Equipe comercial",
      proxima_acao: payload.proxima_acao?.trim() || "Definir próximo passo",
    })
    .select()
    .single();

  if (error) throw error;
  return data as Opportunity;
}

export async function updateOpportunity(
  opportunityId: string,
  payload: OpportunityPayload,
) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("opportunities")
    .update({
      lead_id: payload.lead_id ?? null,
      titulo: payload.titulo.trim(),
      etapa: payload.etapa ?? "Novo",
      valor: payload.valor ?? 0,
      responsavel: payload.responsavel?.trim() || "Equipe comercial",
      proxima_acao: payload.proxima_acao?.trim() || "Definir prÃ³ximo passo",
    })
    .eq("id", opportunityId)
    .select()
    .single();

  if (error) throw error;
  return data as Opportunity;
}

export async function createInboxMessage(
  ownerId: string,
  payload: MessagePayload,
) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("inbox_messages")
    .insert({
      owner_id: ownerId,
      contact_id: payload.contact_id ?? null,
      lead_id: payload.lead_id ?? null,
      canal: payload.canal ?? "WhatsApp",
      remetente_nome: payload.remetente_nome.trim(),
      telefone: normalizePhone(payload.telefone),
      mensagem: payload.mensagem.trim(),
      status: payload.status ?? "Novo lead",
      unread_count: payload.unread_count ?? 1,
      direction: payload.direction ?? "inbound",
    })
    .select()
    .single();

  if (error) throw error;
  return data as InboxMessage;
}

export async function updateInboxMessageStatus(
  messageId: string,
  payload: MessageStatusPayload,
) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("inbox_messages")
    .update({
      status: payload.status.trim(),
      unread_count: payload.unread_count,
    })
    .eq("id", messageId)
    .select()
    .single();

  if (error) throw error;
  return data as InboxMessage;
}

export async function updateInboxConversationLinks(
  ownerId: string,
  phone: string,
  payload: MessageLinkPayload,
) {
  const supabase = requireSupabase();
  const updatePayload = {
    ...(payload.contact_id !== undefined
      ? { contact_id: payload.contact_id }
      : {}),
    ...(payload.lead_id !== undefined ? { lead_id: payload.lead_id } : {}),
    ...(payload.status !== undefined ? { status: payload.status.trim() } : {}),
    ...(payload.unread_count !== undefined
      ? { unread_count: payload.unread_count }
      : {}),
  };

  const { data, error } = await supabase
    .from("inbox_messages")
    .update(updatePayload)
    .eq("owner_id", ownerId)
    .eq("telefone", normalizePhone(phone))
    .select();

  if (error) throw error;
  return data as InboxMessage[];
}

export async function convertContactToLead(ownerId: string, contact: Contact) {
  return createLead(ownerId, {
    contact_id: contact.id,
    nome: contact.nome,
    telefone: contact.telefone,
    email: contact.email,
    interesse: "Qualificar necessidade comercial",
    origem: contact.origem,
    proxima_acao: "Iniciar qualificação",
  });
}

export async function updateOpportunityStage(
  opportunityId: string,
  novaEtapa: OpportunityStage,
) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("opportunities")
    .update({ etapa: novaEtapa })
    .eq("id", opportunityId)
    .select()
    .single();

  if (error) throw error;
  return data as Opportunity;
}
