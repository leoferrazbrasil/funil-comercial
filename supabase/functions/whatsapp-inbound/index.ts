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

function extractZApiMessages(payload: JsonRecord): NormalizedInboundMessage[] {
  // Z-API usually sends individual messages or arrays depending on the webhook configuration.
  // For standard "on-message-received" webhook:
  if (!payload.instanceId || !payload.phone) return [];

  const fromPhone = normalizePhone(asString(payload.phone));
  const senderName = payloadValue(payload, ["senderName", "contactName"]) ?? fromPhone;
  const providerMessageId = payloadValue(payload, ["messageId"]);
  
  // Actually ZAPI sends connected phone in "connectedPhone" or similar?
  // Since we don't know the exact toPhone from the webhook payload easily unless it's in connectedPhone
  // we will try to extract it if available, otherwise just use fromPhone for now and the routing query will match by owner_id and provider anyway?
  // Wait, the routing matches by channelIdentifiers. ZAPI sends `connectedPhone` in some webhooks.
  const toPhone = normalizePhone(asString(payload.connectedPhone));
  const channelIdentifiers = toPhone ? [toPhone] : [];

  let message = "";
  let messageType = "text";

  if (isRecord(payload.text)) {
    message = asString(payload.text.message) || "";
  } else if (isRecord(payload.audio)) {
    messageType = "audio";
    message = "Áudio recebido.";
  } else if (isRecord(payload.image)) {
    messageType = "image";
    message = asString(payload.image.caption) || "Imagem recebida.";
  } else if (isRecord(payload.document)) {
    messageType = "document";
    message = asString(payload.document.fileName) || "Documento recebido.";
  }

  if (payload.fromMe) {
    message += `\n\n[DEBUG PAYLOAD]: ${JSON.stringify(payload)}`;
  }

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

async function resolveOwnerId(
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

    if (!error && data?.owner_id) return data.owner_id as string;
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
    if (data?.owner_id) return data.owner_id as string;
  }

  return Deno.env.get("FUNIL_DEFAULT_OWNER_ID") ?? null;
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

  const ownerId = await resolveOwnerId(supabase, inboundMessage);
  if (!ownerId) {
    throw new Error("No active integration channel found for inbound message.");
  }

  const contact = await findExistingContact(supabase, ownerId, inboundMessage.fromPhone);
  const lead = await findExistingLead(supabase, ownerId, inboundMessage.fromPhone);
  const status = lead ? "Lead vinculado" : contact ? "Contato vinculado" : "Nova conversa";

  const { data: inboxMessage, error: messageError } = await supabase
    .from("inbox_messages")
    .insert({
      owner_id: ownerId,
      contact_id: contact?.id ?? null,
      lead_id: lead?.id ?? null,
      canal: "WhatsApp",
      provider: inboundMessage.provider,
      provider_message_id: inboundMessage.providerMessageId,
      remetente_nome: inboundMessage.senderName,
      telefone: inboundMessage.fromPhone,
      mensagem: inboundMessage.message,
      status: inboundMessage.direction === "outbound" ? "nova" : status,
      unread_count: inboundMessage.direction === "outbound" ? 0 : 1,
      direction: inboundMessage.direction ?? "inbound",
    })
    .select()
    .single();

  if (messageError) {
    if (messageError.code === "23505") {
      console.log(
        JSON.stringify({
          event: "whatsapp_inbound_duplicate",
          provider: inboundMessage.provider,
          from_last4: inboundMessage.fromPhone.slice(-4),
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

    const inboundMessages = getInboundMessages(payload);
    if (inboundMessages.length === 0) {
      return jsonResponse({ ok: true, ignored: true, reason: "no_inbound_messages" });
    }

    const supabase = getSupabaseClient();
    const results: ProcessedMessage[] = [];
    for (const inboundMessage of inboundMessages) {
      results.push(await processInboundMessage(supabase, inboundMessage));
    }

    return jsonResponse({ ok: true, processed: results.length, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected webhook error.";
    console.error(
      JSON.stringify({
        event: "whatsapp_inbound_error",
        message,
      }),
    );

    return jsonResponse({ error: "Erro ao processar webhook." }, 500);
  }
});
