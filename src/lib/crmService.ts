import type { User } from "@supabase/supabase-js";
import { requireSupabase } from "./supabase";
import type {
  Contact,
  CrmSnapshot,
  InboxMessage,
  IntegrationChannel,
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
  produto?: string | null;
};

type MessagePayload = {
  contact_id?: string | null;
  lead_id?: string | null;
  canal?: string;
  provider?: string;
  provider_message_id?: string | null;
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

type IntegrationChannelPayload = {
  provider: string;
  nome: string;
  numero: string;
  phone_number_id?: string;
  instance_name?: string;
  instance_token?: string;
  status?: IntegrationChannel["status"];
};

const normalizePhone = (value: string | null | undefined) => {
  const p = value?.replace(/\D/g, "") ?? "";
  if (!p) return "";
  let unified = p;
  while (unified.startsWith("0")) unified = unified.substring(1);
  if (unified.length === 10 || unified.length === 11) {
    unified = "55" + unified;
  }
  if (unified.startsWith("55") && unified.length === 13 && unified[4] === "9") {
    return unified.slice(0, 4) + unified.slice(5);
  }
  return unified;
};

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
    channelsResult,
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
    supabase
      .from("integration_channels")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const errors = [
    profileResult.error,
    contactsResult.error,
    leadsResult.error,
    opportunitiesResult.error,
    messagesResult.error,
    channelsResult.error,
  ].filter(Boolean);

  if (errors[0]) throw errors[0];

  return {
    profile: (profileResult.data as Profile | null) ?? null,
    contacts: (contactsResult.data as Contact[]) ?? [],
    leads: (leadsResult.data as Lead[]) ?? [],
    opportunities: (opportunitiesResult.data as Opportunity[]) ?? [],
    messages: (messagesResult.data as InboxMessage[]) ?? [],
    channels: (channelsResult.data as IntegrationChannel[]) ?? [],
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
      produto: payload.produto?.trim() || null,
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
      produto: payload.produto?.trim() || null,
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
      provider: payload.provider ?? "manual",
      provider_message_id: payload.provider_message_id ?? null,
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

const functionAllowsLocalReplyFallback = (error: unknown) => {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as {
    context?: { status?: number };
    message?: string;
  };
  const status = maybeError.context?.status;
  const message = maybeError.message?.toLowerCase() ?? "";

  return (
    status === 404 ||
    status === 501 ||
    (message.includes("function") && message.includes("not found"))
  );
};

async function registerLocalInboxReply(
  ownerId: string,
  message: InboxMessage,
  reply: string,
  senderName: string,
) {
  await createInboxMessage(ownerId, {
    contact_id: message.contact_id,
    lead_id: message.lead_id,
    canal: message.canal,
    provider: "manual",
    remetente_nome: senderName,
    telefone: message.telefone,
    mensagem: reply,
    status: "Resposta registrada",
    unread_count: 0,
    direction: "outbound",
  });
  await updateInboxMessageStatus(message.id, {
    status: "Respondido",
    unread_count: 0,
  });

  return { mode: "local" as const };
}

export async function sendInboxReply(
  ownerId: string,
  message: InboxMessage,
  reply: string,
  senderName: string,
) {
  const supabase = requireSupabase();
  const trimmedReply = reply.trim();

  const { data, error } = await supabase.functions.invoke("whatsapp-send", {
    body: {
      phone: message.telefone,
      message: trimmedReply,
      source_message_id: message.id,
      contact_id: message.contact_id,
      lead_id: message.lead_id,
    },
  });

  if (!error && data?.sent) {
    return { mode: "whatsapp" as const };
  }

  if (!error && data?.fallback_allowed) {
    return registerLocalInboxReply(ownerId, message, trimmedReply, senderName);
  }

  if (functionAllowsLocalReplyFallback(error)) {
    return registerLocalInboxReply(ownerId, message, trimmedReply, senderName);
  }

  throw error ?? new Error(data?.error ?? "Nao foi possivel enviar a resposta.");
}

// --- Deletions -------------------------------------------------------------
// Hard delete, scoped to the owner by RLS. The schema uses ON DELETE SET NULL on
// every FK (leads.contact_id, opportunities.lead_id, inbox_messages.contact_id/
// lead_id), so deleting a contact/lead only UNLINKS related records — the Inbox
// history and related leads/opportunities are preserved, never cascaded away.

export async function deleteContact(contactId: string) {
  const supabase = requireSupabase();
  const { error } = await supabase.from("contacts").delete().eq("id", contactId);
  if (error) throw error;
}

export async function deleteLead(leadId: string) {
  const supabase = requireSupabase();
  const { error } = await supabase.from("leads").delete().eq("id", leadId);
  if (error) throw error;
}

export async function deleteOpportunity(opportunityId: string) {
  const supabase = requireSupabase();
  const { error } = await supabase.from("opportunities").delete().eq("id", opportunityId);
  if (error) throw error;
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

export async function createIntegrationChannel(
  ownerId: string,
  payload: IntegrationChannelPayload,
) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("integration_channels")
    .insert({
      owner_id: ownerId,
      provider: payload.provider.trim().toLowerCase() || "whatsapp",
      nome: payload.nome.trim(),
      numero: normalizePhone(payload.numero),
      status: payload.status ?? "ativo",
      metadata: {
        ...(payload.phone_number_id && {
          phone_number_id: normalizePhone(payload.phone_number_id),
        }),
        ...(payload.instance_name && {
          instance_name: payload.instance_name.trim(),
        }),
        ...(payload.instance_token && {
          instance_token: payload.instance_token.trim(),
        }),
      },
    })
    .select()
    .single();

  if (error) throw error;
  return data as IntegrationChannel;
}

// Lista os canais de integração do usuário logado (RLS já restringe ao owner).
export async function getIntegrationChannels() {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("integration_channels")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as IntegrationChannel[]) ?? [];
}

export async function updateIntegrationChannelStatus(
  channelId: string,
  status: IntegrationChannel["status"],
) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("integration_channels")
    .update({ status })
    .eq("id", channelId)
    .select()
    .single();

  if (error) throw error;
  return data as IntegrationChannel;
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

export async function updateProfile(userId: string, payload: Partial<Profile>) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  
  if (payload.nome || payload.telefone || payload.avatar_url) {
    await supabase.auth.updateUser({
      data: {
        ...(payload.nome ? { nome: payload.nome } : {}),
        ...(payload.telefone ? { telefone: payload.telefone } : {}),
        ...(payload.avatar_url ? { avatar_url: payload.avatar_url } : {})
      }
    });
  }
  
  return data as Profile;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const supabase = requireSupabase();
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
}

export async function updateUserSecurity(payload: { email?: string; password?: string }) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.updateUser(payload);
  if (error) throw error;
  return data;
}

