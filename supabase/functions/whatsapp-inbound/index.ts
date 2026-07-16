import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.0";

type JsonRecord = Record<string, unknown>;

type NormalizedInboundMessage = {
  provider: string;
  providerMessageId: string | null;
  fromPhone: string;
  channelIdentifiers: string[];
  senderName: string;
  message: string;
  messageType: string;
  direction?: "inbound" | "outbound";
  instanceId?: string;
  rawPhone?: string | null;
  chatLid?: string | null;
};

type ProcessedMessage = {
  ok: true;
  duplicate: boolean;
  contact_id: string | null;
  lead_id: string | null;
  inbox_message_id: string | null;
};

type SupabaseClientAny = ReturnType<typeof createClient<any, "public", any>>;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-funil-webhook-secret, x-hub-signature-256",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const textResponse = (body: string, status = 200) =>
  new Response(body, {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/plain",
    },
  });

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const asString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

// Supabase/Postgres errors are plain objects (NOT Error instances), so the old
// `error instanceof Error ? error.message : "Unexpected webhook error."` swallowed
// the real cause. This surfaces code/message/details/hint for real diagnosis.
const describeError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    const parts = [e.message, e.code, e.details, e.hint].filter(
      (v): v is string => typeof v === "string" && v.length > 0,
    );
    if (parts.length) return parts.join(" | ");
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  return String(error);
};

// IMPORTANTE: manter idêntico ao normalizePhone da outra função (whatsapp-send/whatsapp-inbound).
// O match de conversation_assignments.telefone e a RLS is_conversation_assignee dependem do MESMO formato.
const normalizePhone = (value: string | null | undefined) => {
  const p = value?.replace("whatsapp:", "").replace(/\D/g, "") ?? "";
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

const uniqueStrings = (values: Array<string | null | undefined>) =>
  Array.from(new Set(values.filter((value): value is string => Boolean(value))));

const payloadValue = (payload: JsonRecord, keys: string[]) => {
  for (const key of keys) {
    const value = asString(payload[key]);
    if (value) return value;
  }

  return null;
};

const getNestedRecord = (payload: JsonRecord, key: string) => {
  const value = payload[key];
  return isRecord(value) ? value : null;
};

const getNestedArray = (payload: JsonRecord, key: string) => {
  const value = payload[key];
  return Array.isArray(value) ? value : [];
};

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const timingSafeEqual = (first: string, second: string) => {
  if (first.length !== second.length) return false;

  let diff = 0;
  for (let index = 0; index < first.length; index += 1) {
    diff |= first.charCodeAt(index) ^ second.charCodeAt(index);
  }

  return diff === 0;
};

const hasMetaSignatureSecret = () =>
  Boolean(Deno.env.get("META_APP_SECRET") ?? Deno.env.get("WHATSAPP_APP_SECRET"));

async function verifyMetaSignature(rawBody: string, signatureHeader: string | null) {
  const appSecret = Deno.env.get("META_APP_SECRET") ?? Deno.env.get("WHATSAPP_APP_SECRET");
  if (!appSecret) return false;
  if (!signatureHeader?.startsWith("sha256=")) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(appSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(rawBody),
  );
  const expected = `sha256=${toHex(signature)}`;

  return timingSafeEqual(expected, signatureHeader.toLowerCase());
}

async function readPayload(request: Request) {
  const clonedRequest = request.clone();
  const rawBody = await request.text();
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return {
      rawBody,
      payload: rawBody ? (JSON.parse(rawBody) as JsonRecord) : {},
    };
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return {
      rawBody,
      payload: Object.fromEntries(new URLSearchParams(rawBody).entries()),
    };
  }

  if (contentType.includes("multipart/form-data")) {
    const formData = await clonedRequest.formData();
    return {
      rawBody,
      payload: Object.fromEntries(formData.entries()) as JsonRecord,
    };
  }

  return { rawBody, payload: { Body: rawBody } };
}

function extractMessageText(message: JsonRecord, messageType: string) {
  if (messageType === "text") {
    const text = getNestedRecord(message, "text");
    return payloadValue(text ?? {}, ["body"]) ?? "";
  }

  if (messageType === "button") {
    const button = getNestedRecord(message, "button");
    return payloadValue(button ?? {}, ["text", "payload"]) ?? "Botao recebido.";
  }

  if (messageType === "interactive") {
    const interactive = getNestedRecord(message, "interactive");
    const buttonReply = getNestedRecord(interactive ?? {}, "button_reply");
    const listReply = getNestedRecord(interactive ?? {}, "list_reply");
    return (
      payloadValue(buttonReply ?? {}, ["title", "id"]) ??
      payloadValue(listReply ?? {}, ["title", "id"]) ??
      "Resposta interativa recebida."
    );
  }

  const media = getNestedRecord(message, messageType);
  const caption = payloadValue(media ?? {}, ["caption"]);
  return caption ?? `Mensagem ${messageType} recebida.`;
}

function contactNameByPhone(contacts: unknown[], phone: string) {
  for (const contact of contacts) {
    if (!isRecord(contact)) continue;
    const waId = normalizePhone(asString(contact.wa_id));
    if (waId && waId !== phone) continue;

    const profile = getNestedRecord(contact, "profile");
    return payloadValue(profile ?? {}, ["name"]) ?? phone;
  }

  return phone;
}

function extractWhatsAppCloudMessages(payload: JsonRecord): NormalizedInboundMessage[] {
  const entries = getNestedArray(payload, "entry");
  if (payload.object !== "whatsapp_business_account" || entries.length === 0) {
    return [];
  }

  const inboundMessages: NormalizedInboundMessage[] = [];

  for (const entry of entries) {
    if (!isRecord(entry)) continue;

    for (const change of getNestedArray(entry, "changes")) {
      if (!isRecord(change)) continue;

      const value = getNestedRecord(change, "value");
      if (!value) continue;

      const metadata = getNestedRecord(value, "metadata") ?? {};
      const displayPhone = normalizePhone(payloadValue(metadata, ["display_phone_number"]));
      const phoneNumberId = normalizePhone(payloadValue(metadata, ["phone_number_id"]));
      const contacts = getNestedArray(value, "contacts");

      for (const rawMessage of getNestedArray(value, "messages")) {
        if (!isRecord(rawMessage)) continue;

        const fromPhone = normalizePhone(asString(rawMessage.from));
        const messageType = payloadValue(rawMessage, ["type"]) ?? "unknown";
        const message = extractMessageText(rawMessage, messageType).trim();

        inboundMessages.push({
          provider: "whatsapp",
          providerMessageId: payloadValue(rawMessage, ["id"]),
          fromPhone,
          channelIdentifiers: uniqueStrings([displayPhone, phoneNumberId]),
          senderName: contactNameByPhone(contacts, fromPhone),
          message,
          messageType,
        });
      }
    }
  }

  return inboundMessages;
}

// --- Status de entrega (Meta Cloud API) -----------------------------------
// A Meta envia, no mesmo webhook, eventos `statuses` com o ciclo de vida da
// mensagem enviada: sent -> delivered -> read, ou failed (com código de erro).
// Casamos pela wamid (== provider_message_id gravado no envio).
type DeliveryStatusEvent = {
  providerMessageId: string;
  status: string; // sent | delivered | read | failed
  recipientPhone: string | null;
  errorCode: number | null;
  errorTitle: string | null;
  errorMessage: string | null;
};

function extractDeliveryStatuses(payload: JsonRecord): DeliveryStatusEvent[] {
  const entries = getNestedArray(payload, "entry");
  if (payload.object !== "whatsapp_business_account" || entries.length === 0) {
    return [];
  }

  const statuses: DeliveryStatusEvent[] = [];

  for (const entry of entries) {
    if (!isRecord(entry)) continue;

    for (const change of getNestedArray(entry, "changes")) {
      if (!isRecord(change)) continue;

      const value = getNestedRecord(change, "value");
      if (!value) continue;

      for (const rawStatus of getNestedArray(value, "statuses")) {
        if (!isRecord(rawStatus)) continue;

        const id = asString(rawStatus.id);
        const status = asString(rawStatus.status);
        if (!id || !status) continue;

        const firstError = getNestedArray(rawStatus, "errors").find(isRecord);
        const errorData = firstError ? getNestedRecord(firstError, "error_data") : null;

        statuses.push({
          providerMessageId: id,
          status,
          recipientPhone: normalizePhone(asString(rawStatus.recipient_id)),
          errorCode:
            firstError && typeof firstError.code === "number" ? firstError.code : null,
          errorTitle: firstError ? asString(firstError.title) : null,
          errorMessage: firstError
            ? asString(firstError.message) ?? asString(errorData?.details)
            : null,
        });
      }
    }
  }

  return statuses;
}

// Ranking dos estados: read/failed são finais. Só avançamos — nunca rebaixamos
// (eventos podem chegar fora de ordem).
async function applyDeliveryStatus(
  supabase: SupabaseClientAny,
  ev: DeliveryStatusEvent,
) {
  const errorText =
    ev.status === "failed"
      ? [ev.errorCode ? `[${ev.errorCode}]` : null, ev.errorTitle, ev.errorMessage]
          .filter(Boolean)
          .join(" ") || "Falha na entrega (sem detalhe da Meta)."
      : null;

  let query = supabase
    .from("inbox_messages")
    .update({ delivery_status: ev.status, delivery_error: errorText })
    .eq("provider_message_id", ev.providerMessageId);

  if (ev.status === "sent") {
    query = query.is("delivery_status", null);
  } else if (ev.status === "delivered") {
    // Atualiza se ainda não há estado final. Inclui o caso NULL explicitamente
    // (em SQL, `NULL NOT IN (...)` é NULL, o que excluiria a linha).
    query = query.or("delivery_status.is.null,delivery_status.not.in.(read,failed)");
  }
  // read / failed: sobrescrevem sempre (estados finais).

  const { error } = await query;
  if (error) throw error;
}

// Z-API callback types that are NOT chat messages (delivery/read receipts,
// presence, connection). They carry no body and must be ignored gracefully —
// NOT treated as "missing body" errors (which caused 500s + webhook retries).
const ZAPI_NON_MESSAGE_TYPES = new Set([
  "DeliveryCallback",
  "ReadCallback",
  "MessageStatusCallback",
  "PresenceChatCallback",
  "ChatPresence",
  "ConnectedCallback",
  "DisconnectedCallback",
]);

function extractZApiMessages(payload: JsonRecord): NormalizedInboundMessage[] {
  // Standard Z-API "on-message-received" (and "notify sent by me") webhook.
  if (!payload.instanceId || !payload.phone) return [];

  const callbackType = asString(payload.type) ?? "";
  if (ZAPI_NON_MESSAGE_TYPES.has(callbackType)) return [];

  const rawPhoneStr = asString(payload.phone) ?? "";
  const isNewsletter = payload.isNewsletter === true || rawPhoneStr.includes("@newsletter");
  const isGroup = payload.isGroup === true || rawPhoneStr.includes("@g.us");

  // Newsletters/communities are one-way broadcast channels (ex.: comunicados de
  // marketing) — não são conversas de atendimento. Ignorados para não poluir o Inbox.
  if (isNewsletter) return [];

  const providerMessageId = payloadValue(payload, ["messageId", "id"]);
  const toPhone = normalizePhone(asString(payload.connectedPhone));
  const channelIdentifiers = toPhone ? [toPhone] : [];

  // Attribute the message to the REAL sender. In a group, `phone` is the group id;
  // the actual person is the participant. This groups conversations by pessoa, não
  // pelo id do grupo, e rotula com o nome do grupo para dar contexto.
  let fromPhone: string;
  let senderName: string;
  if (isGroup) {
    const participant =
      asString(payload.participantPhone) ??
      asString(payload.participantLid) ??
      asString(payload.participant);
    fromPhone = normalizePhone(participant) || normalizePhone(rawPhoneStr);
    const groupName = payloadValue(payload, ["chatName", "groupName"]) ?? "Grupo";
    const person = payloadValue(payload, ["senderName", "participantName", "pushName"]) ?? fromPhone;
    senderName = `${person} · ${groupName}`;
  } else {
    fromPhone = normalizePhone(rawPhoneStr);
    senderName = payloadValue(payload, ["senderName", "chatName", "contactName"]) ?? fromPhone;
  }
  if (!fromPhone) return [];

  let message = "";
  let messageType = "text";

  if (isRecord(payload.text)) {
    message = asString(payload.text.message) || "";
  } else if (isRecord(payload.image)) {
    messageType = "image";
    message = asString(payload.image.caption) || "📷 Imagem recebida.";
  } else if (isRecord(payload.audio)) {
    messageType = "audio";
    message = "🎤 Áudio recebido.";
  } else if (isRecord(payload.video)) {
    messageType = "video";
    message = asString(payload.video.caption) || "🎬 Vídeo recebido.";
  } else if (isRecord(payload.document)) {
    messageType = "document";
    message = asString(payload.document.fileName) || asString(payload.document.caption) || "📄 Documento recebido.";
  } else if (isRecord(payload.sticker)) {
    messageType = "sticker";
    message = "Figurinha recebida.";
  } else if (isRecord(payload.location)) {
    messageType = "location";
    message = "📍 Localização recebida.";
  } else if (isRecord(payload.contact) || isRecord(payload.contacts)) {
    messageType = "contact";
    message = "👤 Contato recebido.";
  } else if (isRecord(payload.reaction)) {
    messageType = "reaction";
    message = asString(payload.reaction.value) || "Reação recebida.";
  } else if (isRecord(payload.buttonsResponseMessage)) {
    message = asString(payload.buttonsResponseMessage.message) || "Resposta recebida.";
  } else if (isRecord(payload.listResponseMessage)) {
    const list = payload.listResponseMessage as JsonRecord;
    message = asString(list.message) || asString(list.title) || "Resposta recebida.";
  } else if (isRecord(payload.poll)) {
    messageType = "poll";
    message = asString((payload.poll as JsonRecord).name) || "Enquete recebida.";
  }

  // A real message whose specific type we don't parse — keep it visible.
  if (!message && providerMessageId) {
    message = "Mensagem recebida.";
  }

  // No body and no message id → not a chat message; ignore instead of erroring.
  if (!message) return [];

  return [{
    provider: "z-api",
    providerMessageId,
    fromPhone,
    channelIdentifiers,
    senderName,
    message,
    messageType,
    direction: payload.fromMe ? "outbound" : "inbound",
    instanceId: asString(payload.instanceId) || undefined,
    rawPhone: asString(payload.phone),
    chatLid: asString(payload.chatLid),
  }];
}

function normalizeLegacyPayload(payload: JsonRecord): NormalizedInboundMessage {
  const provider =
    payloadValue(payload, ["provider", "Provider"]) ??
    (payloadValue(payload, ["MessageSid", "SmsMessageSid"]) ? "twilio" : "whatsapp");
  const fromPhone = normalizePhone(payloadValue(payload, ["From", "from", "phone", "telefone"]));
  const toPhone = normalizePhone(payloadValue(payload, ["To", "to", "recipient", "destinatario"]));
  const message =
    payloadValue(payload, ["Body", "body", "message", "text", "mensagem"]) ?? "";
  const senderName =
    payloadValue(payload, ["ProfileName", "profileName", "name", "nome"]) ??
    fromPhone;

  return {
    provider,
    providerMessageId: payloadValue(payload, ["MessageSid", "SmsMessageSid", "id", "messageId"]),
    fromPhone,
    channelIdentifiers: uniqueStrings([toPhone]),
    senderName,
    message,
    messageType: "text",
  };
}

function getInboundMessages(payload: JsonRecord) {
  const zApiMessages = extractZApiMessages(payload);
  if (zApiMessages.length > 0) return zApiMessages;

  const cloudMessages = extractWhatsAppCloudMessages(payload);
  if (cloudMessages.length > 0) return cloudMessages;
  if (payload.object === "whatsapp_business_account") return [];
  return [normalizeLegacyPayload(payload)];
}

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase secrets missing.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

async function resolveOwnerChannel(
  supabase: SupabaseClientAny,
  message: NormalizedInboundMessage,
) {
  if (message.instanceId) {
    const { data, error } = await supabase
      .from("integration_channels")
      .select("id, owner_id")
      .eq("provider", "z-api")
      .eq("status", "ativo")
      .contains("metadata", { instanceId: message.instanceId })
      .limit(1)
      .maybeSingle();

    if (!error && data?.owner_id) {
      return { ownerId: data.owner_id as string, channelId: data.id as string };
    }
  }

  if (message.channelIdentifiers.length > 0) {
    const providers = uniqueStrings([message.provider, "whatsapp", "whatsapp_cloud"]);
    const { data, error } = await supabase
      .from("integration_channels")
      .select("id, owner_id")
      .in("numero", message.channelIdentifiers)
      .in("provider", providers)
      .eq("status", "ativo")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (data?.owner_id) {
      return { ownerId: data.owner_id as string, channelId: data.id as string };
    }
  }

  return {
    ownerId: Deno.env.get("FUNIL_DEFAULT_OWNER_ID") ?? null,
    channelId: null,
  };
}

function conversationStatePhoneKey(value: string) {
  let phone = value.replace(/\D/g, "");
  while (phone.startsWith("0")) phone = phone.substring(1);
  while (phone.startsWith("550")) phone = "55" + phone.substring(3);
  if (phone.length === 10 || phone.length === 11) phone = "55" + phone;
  if (phone.startsWith("55") && phone.length === 13 && phone[4] === "9") {
    return phone.slice(0, 4) + phone.slice(5);
  }
  return phone;
}

// Helper to generate phone variations for robust searching
function getPhoneVariations(phone: string) {
  if (!phone) return [];
  const variations = new Set<string>();
  variations.add(phone);
  
  if (phone.startsWith("55")) {
    if (phone.length === 13 && phone[4] === "9") {
      // Create 12-digit version
      variations.add(phone.slice(0, 4) + phone.slice(5));
    } else if (phone.length === 12) {
      // Create 13-digit version
      variations.add(phone.slice(0, 4) + "9" + phone.slice(4));
    }
  }
  
  return Array.from(variations);
}

async function findExistingContact(
  supabase: SupabaseClientAny,
  ownerId: string,
  phone: string,
) {
  const variations = getPhoneVariations(phone);
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("owner_id", ownerId)
    .in("telefone", variations)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function findExistingLead(
  supabase: SupabaseClientAny,
  ownerId: string,
  phone: string,
) {
  const variations = getPhoneVariations(phone);
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("owner_id", ownerId)
    .in("telefone", variations)
    .in("status", ["novo", "em_atendimento", "qualificado"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function processInboundMessage(
  supabase: SupabaseClientAny,
  inboundMessage: NormalizedInboundMessage,
): Promise<ProcessedMessage> {
  if (!inboundMessage.fromPhone || !inboundMessage.message) {
    throw new Error("Inbound message missing phone or body.");
  }

  const { ownerId, channelId } = await resolveOwnerChannel(supabase, inboundMessage);
  if (!ownerId) {
    throw new Error("No active integration channel found for inbound message.");
  }

  let finalPhone = inboundMessage.fromPhone;
  const isLid = Boolean(inboundMessage.rawPhone?.includes("@lid") || (finalPhone.length > 13 && !finalPhone.startsWith("55")));
  const chatLid = inboundMessage.chatLid?.replace("@lid", "");

  if (isLid && chatLid) {
    const { data: existingMsg } = await supabase
      .from("inbox_messages")
      .select("telefone")
      .eq("owner_id", ownerId)
      .eq("metadata->>chat_lid", chatLid)
      .neq("telefone", finalPhone)
      .limit(1)
      .maybeSingle();

    if (existingMsg?.telefone) {
      finalPhone = existingMsg.telefone;
    }
  }

  const contact = await findExistingContact(supabase, ownerId, finalPhone);
  const lead = await findExistingLead(supabase, ownerId, finalPhone);
  const status = lead ? "Lead vinculado" : contact ? "Contato vinculado" : "Nova conversa";

  const { data: inboxMessage, error: messageError } = await supabase
    .from("inbox_messages")
    .insert({
      owner_id: ownerId,
      channel_id: channelId,
      contact_id: contact?.id ?? null,
      lead_id: lead?.id ?? null,
      canal: "WhatsApp",
      provider: inboundMessage.provider,
      provider_message_id: inboundMessage.providerMessageId,
      remetente_nome: inboundMessage.senderName,
      telefone: finalPhone,
      mensagem: inboundMessage.message,
      status: inboundMessage.direction === "outbound" ? "nova" : status,
      unread_count: inboundMessage.direction === "outbound" ? 0 : 1,
      direction: inboundMessage.direction ?? "inbound",
      metadata: {
        chat_lid: chatLid,
        is_lid: isLid
      }
    })
    .select()
    .single();

  if (messageError) {
    if (messageError.code === "23505") {
      console.log(
        JSON.stringify({
          event: "whatsapp_inbound_duplicate",
          provider: inboundMessage.provider,
          from_last4: finalPhone.slice(-4),
          has_provider_message_id: Boolean(inboundMessage.providerMessageId),
        }),
      );
      return {
        ok: true,
        duplicate: true,
        contact_id: contact?.id ?? null,
        lead_id: lead?.id ?? null,
        inbox_message_id: null,
      };
    }

    throw messageError;
  }

  const { error: reopenError } = await supabase
    .from("inbox_conversation_states")
    .update({ archived_at: null, archived_by: null, archive_reason: null })
    .eq("owner_id", ownerId)
    .eq("telefone", conversationStatePhoneKey(finalPhone))
    .eq("channel_key", channelId ?? "legacy");

  if (reopenError) throw reopenError;

  // Se agora temos o telefone real e existe o chatLid, atualizamos mensagens antigas que só tinham o LID
  if (!isLid && chatLid) {
    await supabase
      .from("inbox_messages")
      .update({ telefone: finalPhone })
      .eq("owner_id", ownerId)
      .eq("metadata->>chat_lid", chatLid)
      .neq("telefone", finalPhone);
  }

  console.log(
    JSON.stringify({
      event: "whatsapp_inbound_inserted",
      provider: inboundMessage.provider,
      type: inboundMessage.messageType,
      from_last4: inboundMessage.fromPhone.slice(-4),
      linked_contact: Boolean(contact),
      linked_lead: Boolean(lead),
      has_provider_message_id: Boolean(inboundMessage.providerMessageId),
    }),
  );

  return {
    ok: true,
    duplicate: false,
    contact_id: contact?.id ?? null,
    lead_id: lead?.id ?? null,
    inbox_message_id: inboxMessage.id,
  };
}

function verifyWebhookChallenge(request: Request) {
  const requestUrl = new URL(request.url);
  const mode = requestUrl.searchParams.get("hub.mode");
  const token = requestUrl.searchParams.get("hub.verify_token");
  const challenge = requestUrl.searchParams.get("hub.challenge");
  const expectedToken =
    Deno.env.get("META_WEBHOOK_VERIFY_TOKEN") ?? Deno.env.get("FUNIL_WEBHOOK_SECRET");

  if (mode === "subscribe" && challenge && expectedToken && token === expectedToken) {
    return textResponse(challenge);
  }

  return jsonResponse({ error: "Webhook verification failed." }, 403);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method === "GET") {
    return verifyWebhookChallenge(request);
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Metodo nao permitido." }, 405);
  }

  const configuredSecret = Deno.env.get("FUNIL_WEBHOOK_SECRET");
  const requestUrl = new URL(request.url);
  const receivedSecret =
    request.headers.get("x-funil-webhook-secret") ?? requestUrl.searchParams.get("token");
  const signatureHeader = request.headers.get("x-hub-signature-256");

  try {
    const { rawBody, payload } = await readPayload(request);
    const tokenOk = configuredSecret ? receivedSecret === configuredSecret : false;
    const signatureOk = await verifyMetaSignature(rawBody, signatureHeader);
    const metaSignatureRequired = hasMetaSignatureSecret();
    const isZApi = Boolean(payload.instanceId && payload.phone);

    if (signatureHeader && !signatureOk) {
      return jsonResponse({ error: "Webhook signature invalid." }, 401);
    }

    if (metaSignatureRequired && !signatureHeader && !tokenOk && !isZApi) {
      return jsonResponse({ error: "Webhook signature missing." }, 401);
    }

    if (configuredSecret && !tokenOk && !signatureOk && !isZApi) {
      return jsonResponse({ error: "Webhook nao autorizado." }, 401);
    }

    // Diagnostic: log the raw Z-API payload so the exact event shape is visible
    // in the function logs (keys + a truncated body — no secrets are involved).
    if (isZApi) {
      const rawPreview = rawBody.length > 2000 ? rawBody.slice(0, 2000) + "…(truncado)" : rawBody;
      console.log(JSON.stringify({
        event: "whatsapp_inbound_received",
        type: payload.type ?? null,
        fromMe: payload.fromMe ?? null,
        keys: Object.keys(payload),
        raw: rawPreview,
      }));
    }

    const supabase = getSupabaseClient();

    // Eventos de STATUS de entrega da Meta (sent/delivered/read/failed). Antes
    // eram descartados — agora casamos pela wamid e gravamos na mensagem, para o
    // Inbox mostrar por que uma mensagem não chegou (código de erro da Meta).
    const statusEvents = extractDeliveryStatuses(payload);
    let statusesApplied = 0;
    for (const ev of statusEvents) {
      try {
        await applyDeliveryStatus(supabase, ev);
        statusesApplied += 1;
        if (ev.status === "failed") {
          console.error(
            JSON.stringify({
              event: "whatsapp_delivery_failed",
              to_last4: ev.recipientPhone?.slice(-4) ?? null,
              wamid_tail: ev.providerMessageId.slice(-10),
              error_code: ev.errorCode,
              error_title: ev.errorTitle,
              error_message: ev.errorMessage,
            }),
          );
        }
      } catch (error) {
        console.error(
          JSON.stringify({
            event: "whatsapp_delivery_status_error",
            reason: describeError(error),
            wamid_tail: ev.providerMessageId.slice(-10),
          }),
        );
      }
    }

    const inboundMessages = getInboundMessages(payload);
    if (inboundMessages.length === 0) {
      return jsonResponse({
        ok: true,
        ignored: statusEvents.length === 0,
        statuses: statusesApplied,
        reason: statusEvents.length ? "status_only" : "no_inbound_messages",
      });
    }
    const results: ProcessedMessage[] = [];
    let failed = 0;
    // Process each message in isolation: one bad event must not fail the whole
    // batch nor trigger a 500 (which makes Z-API retry the same event forever).
    for (const inboundMessage of inboundMessages) {
      try {
        results.push(await processInboundMessage(supabase, inboundMessage));
      } catch (error) {
        failed += 1;
        console.error(JSON.stringify({
          event: "whatsapp_inbound_message_error",
          reason: describeError(error),
          from_last4: inboundMessage.fromPhone?.slice(-4) ?? null,
          type: inboundMessage.messageType,
        }));
      }
    }

    // Return 200 even on partial failures: the errors are logged for diagnosis,
    // and a 500 here only causes Z-API to re-deliver the same failing event.
    return jsonResponse({ ok: true, processed: results.length, failed });
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "whatsapp_inbound_error",
        message: describeError(error),
      }),
    );

    return jsonResponse({ error: "Erro ao processar webhook." }, 500);
  }
});
