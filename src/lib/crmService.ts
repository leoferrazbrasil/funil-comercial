import type { User } from "@supabase/supabase-js";
import { requireSupabase } from "./supabase";
import type {
  Aggregator,
  Campaign,
  CampaignVariable,
  ConversationAssignment,
  Contact,
  CrmSnapshot,
  EditorialQueueItem,
  EditorialQueueStatus,
  InboxConversationState,
  InboxMessage,
  IntegrationChannel,
  Lead,
  Opportunity,
  OpportunityStage,
  Profile,
  TeamMember,
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
  site?: string;
  instagram?: string;
  linkedin?: string;
};

// Campos sociais opcionais (site/instagram/linkedin). Gravados só se as colunas
// existirem — a migração `contacts_social_fields` pode ainda não ter sido
// aplicada; nesse caso o contato é salvo sem eles (ver isMissingColumnError).
const contactSocialFields = (payload: ContactPayload) => ({
  site: payload.site?.trim() || null,
  instagram: payload.instagram?.trim() || null,
  linkedin: payload.linkedin?.trim() || null,
});

const isMissingColumnError = (error: { code?: string; message?: string } | null) =>
  !!error &&
  (error.code === "42703" ||
    error.code === "PGRST204" ||
    /column .* does not exist|could not find the .* column/i.test(error.message ?? ""));

const isMissingRelationError = (error: { code?: string; message?: string } | null) =>
  !!error &&
  (error.code === "42P01" ||
    error.code === "PGRST205" ||
    /relation .* does not exist|could not find the table|schema cache/i.test(error.message ?? ""));

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
  channel_id?: string | null;
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

// Guarda o número REAL (com DDI 55 e o 9º dígito). NÃO removemos o 9 aqui — isso só
// serve para AGRUPAMENTO/comparação (ver phoneMatchKey no App e unifyPhone no Inbox).
// Remover o 9 do valor gravado quebrava o envio pela Meta e exibia o número errado.
const normalizePhone = (value: string | null | undefined) => {
  const p = value?.replace(/\D/g, "") ?? "";
  if (!p) return "";
  let unified = p;
  while (unified.startsWith("0")) unified = unified.substring(1);
  if (unified.length === 10 || unified.length === 11) {
    unified = "55" + unified;
  }
  return unified;
};

// Archive-state keys must match Inbox conversation grouping, not dialable storage.
export const conversationStatePhoneKey = (value: string | null | undefined) => {
  let phone = value?.replace(/\D/g, "") ?? "";
  while (phone.startsWith("0")) phone = phone.substring(1);
  while (phone.startsWith("550")) phone = "55" + phone.substring(3);
  if (phone.length === 10 || phone.length === 11) phone = "55" + phone;
  if (phone.startsWith("55") && phone.length === 13 && phone[4] === "9") {
    return phone.slice(0, 4) + phone.slice(5);
  }
  return phone;
};

export async function upsertProfile(user: User) {
  const supabase = requireSupabase();
  const profile: Omit<Profile, "created_at" | "role"> = {
    id: user.id,
    nome: user.user_metadata?.nome ?? user.email?.split("@")[0] ?? null,
    email: user.email ?? null,
    telefone: user.user_metadata?.telefone ?? null,
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
    statesResult,
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
    supabase
      .from("inbox_conversation_states")
      .select("*")
      .order("updated_at", { ascending: false }),
  ]);

  const errors = [
    profileResult.error,
    contactsResult.error,
    leadsResult.error,
    opportunitiesResult.error,
    messagesResult.error,
    channelsResult.error,
    isMissingRelationError(statesResult.error) ? null : statesResult.error,
  ].filter(Boolean);

  if (errors[0]) throw errors[0];

  return {
    profile: (profileResult.data as Profile | null) ?? null,
    contacts: (contactsResult.data as Contact[]) ?? [],
    leads: (leadsResult.data as Lead[]) ?? [],
    opportunities: (opportunitiesResult.data as Opportunity[]) ?? [],
    messages: (messagesResult.data as InboxMessage[]) ?? [],
    channels: (channelsResult.data as IntegrationChannel[]) ?? [],
    conversationStates: (statesResult.data as InboxConversationState[]) ?? [],
  };
}

export async function createContact(ownerId: string, payload: ContactPayload) {
  const supabase = requireSupabase();
  const base = {
    owner_id: ownerId,
    nome: payload.nome.trim(),
    telefone: normalizePhone(payload.telefone),
    email: payload.email?.trim() || null,
    origem: payload.origem?.trim() || "Manual",
    potencial: payload.potencial?.trim() || "Novo",
  };

  let { data, error } = await supabase
    .from("contacts")
    .insert({ ...base, ...contactSocialFields(payload) })
    .select()
    .single();

  // Degrada com elegância se a migração dos campos sociais ainda não foi aplicada.
  if (isMissingColumnError(error)) {
    ({ data, error } = await supabase.from("contacts").insert(base).select().single());
  }

  if (error) throw error;
  return data as Contact;
}

export async function updateContact(contactId: string, payload: ContactPayload) {
  const supabase = requireSupabase();
  const base = {
    nome: payload.nome.trim(),
    telefone: normalizePhone(payload.telefone),
    email: payload.email?.trim() || null,
    origem: payload.origem?.trim() || "Manual",
    potencial: payload.potencial?.trim() || "Novo",
  };

  let { data, error } = await supabase
    .from("contacts")
    .update({ ...base, ...contactSocialFields(payload) })
    .eq("id", contactId)
    .select()
    .single();

  // Degrada com elegância se a migração dos campos sociais ainda não foi aplicada.
  if (isMissingColumnError(error)) {
    ({ data, error } = await supabase.from("contacts").update(base).eq("id", contactId).select().single());
  }

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
      channel_id: payload.channel_id ?? null,
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
    channel_id: message.channel_id ?? null,
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

  // Canal ativo mas o envio real falhou (ex.: Meta sem token): propaga a mensagem
  // de erro da função para o usuário, em vez de registrar localmente como "enviado".
  throw new Error(await extractFunctionError(error, data));
}

export type WhatsAppTemplate = {
  name: string;
  language: string;
  category: string;
  status: string;
  bodyText: string;
  variableCount: number;
  // v1 só envia templates de corpo com variáveis numéricas. Os demais (cabeçalho
  // de mídia, variável no header, botão dinâmico, variáveis nomeadas, sem corpo)
  // vêm como supported=false + motivo, e o picker os exibe desabilitados.
  supported: boolean;
  unsupportedReason: string;
};

// supabase-js coloca a Response no `error.context` quando a function responde
// não-2xx; extrai a mensagem de erro de lá (ou do corpo já parseado).
async function extractFunctionError(error: unknown, data: any): Promise<string> {
  if (data?.error) return String(data.error);
  const ctx = (error as any)?.context;
  if (ctx && typeof ctx.json === "function") {
    try {
      const body = await ctx.json();
      if (body?.error) return String(body.error);
    } catch {
      /* corpo não-JSON — ignora */
    }
  }
  return error instanceof Error ? error.message : "Operação de WhatsApp falhou.";
}

// Lista os templates APROVADOS da Meta (via Edge Function whatsapp-templates).
export async function getApprovedWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.functions.invoke("whatsapp-templates", {
    method: "GET",
  });
  if (error) throw new Error(await extractFunctionError(error, data));
  return (data?.templates as WhatsAppTemplate[]) ?? [];
}

// Envia um template aprovado (Meta Cloud API). Diferente do texto livre, NÃO tem
// fallback local: se a Meta recusar, propaga o erro (o template precisa entregar).
export async function sendInboxTemplate(payload: {
  phone: string;
  contactId?: string | null;
  leadId?: string | null;
  renderedText: string;
  template: { name: string; language: string; variables: string[] };
}) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.functions.invoke("whatsapp-send", {
    body: {
      phone: payload.phone,
      message: payload.renderedText,
      contact_id: payload.contactId ?? null,
      lead_id: payload.leadId ?? null,
      template: payload.template,
    },
  });
  if (error || data?.error || !data?.sent) {
    throw new Error(await extractFunctionError(error, data));
  }
  return { mode: "template" as const };
}

// --- Campanhas (Fase 2) ----------------------------------------------------

export async function createCampaign(payload: {
  nome: string;
  templateName: string;
  templateLanguage: string;
  bodyText: string;
  variables: CampaignVariable[];
  scheduledAt: string; // ISO
  recipients: Array<{ nome: string; telefone: string; contactId: string | null }>;
}): Promise<Campaign> {
  const supabase = requireSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const ownerId = userData.user?.id;
  if (!ownerId) throw new Error("Usuário não autenticado.");

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .insert({
      owner_id: ownerId,
      nome: payload.nome.trim(),
      template_name: payload.templateName,
      template_language: payload.templateLanguage,
      body_text: payload.bodyText,
      variables: payload.variables,
      scheduled_at: payload.scheduledAt,
      status: "scheduled",
      total: payload.recipients.length,
    })
    .select()
    .single();
  if (error) throw error;

  if (payload.recipients.length > 0) {
    const rows = payload.recipients.map((r) => ({
      campaign_id: (campaign as Campaign).id,
      owner_id: ownerId,
      nome: r.nome || "Contato",
      telefone: r.telefone,
      contact_id: r.contactId,
      status: "pending",
    }));
    const { error: recErr } = await supabase.from("campaign_recipients").insert(rows);
    if (recErr) {
      // Rollback: remove a campanha órfã (sem destinatários) para não virar um
      // registro fantasma "Falhou 0/0" no histórico.
      await supabase.from("campaigns").delete().eq("id", (campaign as Campaign).id);
      throw recErr;
    }
  }

  return campaign as Campaign;
}

export async function getCampaigns(): Promise<Campaign[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Campaign[]) ?? [];
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Campaign | null) ?? null;
}

// Retorna true se realmente cancelou (a campanha ainda estava agendada); false
// se o envio já havia começado (o cron flipou para 'sending') — não interrompe.
export async function cancelCampaign(id: string): Promise<boolean> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("campaigns")
    .update({ status: "canceled" })
    .eq("id", id)
    .eq("status", "scheduled")
    .select("id");
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

// Dispara o processamento das PRÓPRIAS campanhas due imediatamente (usado no
// "enviar agora", sem esperar o tick do cron). Usa o JWT do usuário logado.
export async function runOwnCampaigns(): Promise<void> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.functions.invoke("campaign-runner", {
    body: { scope: "own" },
  });
  if (error) throw new Error(await extractFunctionError(error, data));
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

// Marca como lidas as mensagens informadas (unread_count = 0). Usada ao ABRIR
// uma conversa no Inbox — semântica literal de "não lida". RLS restringe ao dono.
export async function markInboxConversationRead(messageIds: string[]) {
  if (messageIds.length === 0) return;
  const supabase = requireSupabase();
  const { error } = await supabase
    .from("inbox_messages")
    .update({ unread_count: 0 })
    .in("id", messageIds);

  if (error) throw error;
}

export type ConversationArchiveTarget = {
  owner_id: string;
  telefone: string;
  channel_id?: string | null;
};

const archiveTimestampMarker = "1970-01-01T00:00:00.000Z";

export async function archiveInboxConversations(
  targets: ConversationArchiveTarget[],
  reason: string,
) {
  if (targets.length === 0) return [];

  const supabase = requireSupabase();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const archivedBy = userData.user?.id ?? null;
  const rows = targets.map((target) => ({
    owner_id: target.owner_id,
    telefone: conversationStatePhoneKey(target.telefone),
    channel_id: target.channel_id ?? null,
    // The database trigger replaces this marker with Postgres clock_timestamp().
    archived_at: archiveTimestampMarker,
    archived_by: archivedBy,
    archive_reason: reason.trim() || "Arquivado para organizar a Inbox",
  }));

  const { data, error } = await supabase
    .from("inbox_conversation_states")
    .upsert(rows, { onConflict: "owner_id,telefone,channel_key" })
    .select();

  if (error) throw error;
  return (data as InboxConversationState[]) ?? [];
}

export async function unarchiveInboxConversation(
  target: ConversationArchiveTarget,
) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("inbox_conversation_states")
    .update({ archived_at: null, archived_by: null, archive_reason: null })
    .eq("owner_id", target.owner_id)
    .eq("telefone", conversationStatePhoneKey(target.telefone))
    .eq("channel_key", target.channel_id ?? "legacy")
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as InboxConversationState | null;
}

export async function reopenInboxConversation(
  ownerId: string,
  telefone: string,
  channelId: string | null | undefined,
) {
  return unarchiveInboxConversation({
    owner_id: ownerId,
    telefone,
    channel_id: channelId,
  });
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
  motivoPerda?: string | null,
) {
  const supabase = requireSupabase();
  // Ao marcar Perdido, grava o motivo; ao sair de Perdido, limpa. Nas demais
  // transições não mexe no motivo (undefined).
  const patch: { etapa: OpportunityStage; motivo_perda?: string | null } = { etapa: novaEtapa };
  if (novaEtapa === "Perdido") patch.motivo_perda = motivoPerda?.trim() || null;
  else if (motivoPerda === null) patch.motivo_perda = null;

  let { data, error } = await supabase
    .from("opportunities")
    .update(patch)
    .eq("id", opportunityId)
    .select()
    .single();

  // Degrada com elegância se a coluna motivo_perda ainda não foi criada (migração
  // pendente): grava só a etapa.
  if (isMissingColumnError(error)) {
    ({ data, error } = await supabase
      .from("opportunities")
      .update({ etapa: novaEtapa })
      .eq("id", opportunityId)
      .select()
      .single());
  }

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

// --- Handoff (time e atribuição) -------------------------------------------

export async function createTeamMember(payload: {
  email: string; password: string; nome: string;
}): Promise<TeamMember> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.functions.invoke("team-create-member", { body: payload });
  if (error || data?.error || !data?.ok) throw new Error(await extractFunctionError(error, data));
  const m = data.member;
  return { id: m.id, email: m.email, nome: m.nome, role: "vendedor", admin_id: null };
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = requireSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const adminId = userData.user?.id;
  if (!adminId) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nome, email, role, admin_id, avatar_url")
    .eq("admin_id", adminId)
    .order("nome", { ascending: true });
  if (error) throw error;
  return (data ?? []) as TeamMember[];
}

export async function getConversationAssignments(): Promise<ConversationAssignment[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("conversation_assignments")
    .select("id, owner_id, telefone, assigned_to, assigned_by, updated_at");
  if (error) throw error;
  return (data ?? []) as ConversationAssignment[];
}

export async function assignConversation(
  ownerId: string, telefone: string, assignedTo: string,
): Promise<void> {
  const supabase = requireSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("conversation_assignments")
    .upsert(
      { owner_id: ownerId, telefone, assigned_to: assignedTo, assigned_by: userData.user?.id ?? null },
      { onConflict: "owner_id,telefone" },
    );
  if (error) throw error;
}

export async function getMyProfile(): Promise<Profile | null> {
  const supabase = requireSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const id = userData.user?.id;
  if (!id) return null;
  const { data, error } = await supabase
    .from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Profile) ?? null;
}

// ---------------------------------------------------------------------------
// Roteiro Editorial (/roteiro): fila sequencial de próximos posts.
// owner_id vem sempre da sessão; a RLS (auth.uid() = owner_id) barra conta alheia.
// ---------------------------------------------------------------------------

export async function getEditorialQueue(ownerId: string): Promise<EditorialQueueItem[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("editorial_queue")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as EditorialQueueItem[];
}

export async function addEditorialQueueItem(
  ownerId: string,
  input: { pilar: string; tema: string },
): Promise<EditorialQueueItem> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("editorial_queue")
    .insert({ owner_id: ownerId, pilar: input.pilar, tema: input.tema })
    .select()
    .single();
  if (error) throw error;
  return data as EditorialQueueItem;
}

export async function updateEditorialQueueItemStatus(
  id: string,
  status: EditorialQueueStatus,
): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase
    .from("editorial_queue")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteEditorialQueueItem(id: string): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.from("editorial_queue").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Agregadores de links (produto multi-tenant). Leitura pública dos publicados
// pela página /l/:slug; o dono gere os seus. owner_id sempre da sessão.
// ---------------------------------------------------------------------------

export type AggregatorInput = Omit<Aggregator, "id" | "owner_id" | "created_at" | "updated_at">;

export async function getMyAggregators(ownerId: string): Promise<Aggregator[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("aggregators")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Aggregator[];
}

// Público: usado pela página /l/:slug. A RLS só devolve publicados.
export async function getAggregatorBySlug(slug: string): Promise<Aggregator | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("aggregators")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return (data as Aggregator) ?? null;
}

export async function createAggregator(ownerId: string, input: AggregatorInput): Promise<Aggregator> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("aggregators")
    .insert({ ...input, owner_id: ownerId })
    .select()
    .single();
  if (error) throw error;
  return data as Aggregator;
}

export async function updateAggregator(id: string, patch: Partial<AggregatorInput>): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.from("aggregators").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteAggregator(id: string): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.from("aggregators").delete().eq("id", id);
  if (error) throw error;
}

// Best-effort: a RLS só deixa ver os próprios + publicados; o UNIQUE do banco é o
// guarda real (o insert/update falha em conflito e a UI mostra a mensagem).
export async function isAggregatorSlugAvailable(slug: string, exceptId?: string): Promise<boolean> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from("aggregators").select("id").eq("slug", slug);
  if (error) throw error;
  const rows = (data ?? []) as { id: string }[];
  return rows.every((r) => r.id === exceptId);
}

