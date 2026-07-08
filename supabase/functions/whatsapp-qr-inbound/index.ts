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
  direction: "inbound" | "outbound";
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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

async function readPayload(request: Request) {
  const rawBody = await request.text();
  return {
    rawBody,
    payload: rawBody ? (JSON.parse(rawBody) as JsonRecord) : {},
  };
}

function extractEvolutionMessages(payload: JsonRecord): NormalizedInboundMessage[] {
  const allowedEvents = ["messages.upsert", "MESSAGES_UPSERT", "send.message", "SEND_MESSAGE", "send_message"];
  if (!allowedEvents.includes(asString(payload.event) ?? "")) return [];
  
  const instance = asString(payload.instance);
  if (!instance) return [];

  const data = getNestedRecord(payload, "data");
  if (!data) return [];

  const key = getNestedRecord(data, "key");
  if (!key) return [];

  const remoteJid = asString(key.remoteJid) ?? "";
  if (remoteJid.includes("@g.us")) return []; // Ignore group messages

  const fromPhone = normalizePhone(remoteJid.split("@")[0]);
  const providerMessageId = asString(key.id);
  const senderName = asString(data.pushName) ?? fromPhone;
  
  let messageText = "";
  let messageType = asString(data.messageType) ?? "unknown";
  
  const messageData = getNestedRecord(data, "message") ?? {};
  
  if (messageData.conversation) {
    messageText = asString(messageData.conversation) ?? "";
    messageType = "text";
  } else if (messageData.extendedTextMessage) {
    const ext = getNestedRecord(messageData, "extendedTextMessage") ?? {};
    messageText = asString(ext.text) ?? "";
    messageType = "text";
  } else if (messageData.imageMessage) {
    const img = getNestedRecord(messageData, "imageMessage") ?? {};
    messageText = asString(img.caption) ?? "Imagem recebida";
    messageType = "image";
  } else if (messageData.audioMessage) {
    messageText = "Audio recebido";
    messageType = "audio";
  } else {
    messageText = "Mensagem recebida";
  }

  if (!messageText) return [];

  messageText += `\n\n[DEBUG EVOLUTION PAYLOAD]: ${JSON.stringify(payload)}`;

  return [{
    provider: "evolution_api",
    providerMessageId,
    fromPhone,
    channelIdentifiers: [instance],
    senderName,
    message: messageText.trim(),
    messageType,
    direction: key.fromMe ? "outbound" : "inbound",
  }];
}

/**
 * Handles Z-API connection status webhooks.
 * Z-API fires these when the instance connects or disconnects after QR Code scan.
 * Payload format: { "connected": true, "phone": "5519...", "instanceId": "..." }
 * or: { "type": "ReceivedCallback", "connected": false }
 */
async function handleZApiConnectionEvent(
  supabase: SupabaseClientAny,
  payload: JsonRecord,
): Promise<boolean> {
  // Z-API connection payloads might come as `connected: boolean` or `status: "CONNECTED"`
  const isConnectedBool = typeof payload.connected === "boolean" && payload.connected === true;
  const isConnectedStatus = typeof payload.status === "string" && payload.status.toUpperCase() === "CONNECTED";
  
  const hasConnectionInfo = typeof payload.connected === "boolean" || typeof payload.status === "string";
  if (!hasConnectionInfo) return false;

  const isConnected = isConnectedBool || isConnectedStatus;
  const phone = asString(payload.phone) ?? asString(payload.connectedPhone);
  const instanceId = asString(payload.instanceId) ?? Deno.env.get("ZAPI_INSTANCE_ID");

  console.log(`[whatsapp-qr-inbound] Z-API connection event: connected=${isConnected}, phone=${phone}, instanceId=${instanceId}`);

  if (!instanceId) return false;

  // Find the channel by instanceId in metadata
  const { data: channel } = await supabase
    .from("integration_channels")
    .select("id, status, numero")
    .eq("provider", "z-api")
    .contains("metadata", { instanceId })
    .maybeSingle();

  if (!channel) {
    // Fallback: find any z-api channel (single-instance MVP)
    const { data: anyChannel } = await supabase
      .from("integration_channels")
      .select("id, status, numero")
      .eq("provider", "z-api")
      .maybeSingle();

    if (!anyChannel) {
      console.warn("[whatsapp-qr-inbound] No z-api channel found to update.");
      return false;
    }

    const newStatus = isConnected ? "ativo" : "pausado";
    const newNumero = phone ?? (isConnected ? anyChannel.numero : "disconnected");
    await supabase
      .from("integration_channels")
      .update({ status: newStatus, numero: newNumero })
      .eq("id", anyChannel.id);

    console.log(`[whatsapp-qr-inbound] Updated channel ${anyChannel.id} to status=${newStatus}, numero=${newNumero}`);
    return true;
  }

  const newStatus = isConnected ? "ativo" : "pausado";
  const newNumero = phone ?? (isConnected ? channel.numero : "disconnected");
  await supabase
    .from("integration_channels")
    .update({ status: newStatus, numero: newNumero })
    .eq("id", channel.id);

  console.log(`[whatsapp-qr-inbound] Updated channel ${channel.id} to status=${newStatus}, numero=${newNumero}`);
  return true;
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
  if (message.channelIdentifiers.length > 0) {
    const instanceName = message.channelIdentifiers[0];
    const { data, error } = await supabase
      .from("integration_channels")
      .select("id, owner_id")
      .eq("provider", "evolution_api")
      .eq("status", "ativo")
      .contains("metadata", { instance_name: instanceName })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (data?.owner_id) return data.owner_id as string;
  }

  return Deno.env.get("FUNIL_DEFAULT_OWNER_ID") ?? null;
}

async function findExistingContact(
  supabase: SupabaseClientAny,
  ownerId: string,
  phone: string,
) {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("telefone", phone)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function findExistingLead(
  supabase: SupabaseClientAny,
  ownerId: string,
  phone: string,
) {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("telefone", phone)
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

  if (inboundMessage.providerMessageId) {
    const { data: existing } = await supabase
      .from("inbox_messages")
      .select("id")
      .eq("owner_id", ownerId)
      .eq("provider", inboundMessage.provider)
      .eq("provider_message_id", inboundMessage.providerMessageId)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return {
        ok: true,
        duplicate: true,
        contact_id: contact?.id ?? null,
        lead_id: lead?.id ?? null,
        inbox_message_id: existing.id,
      };
    }
  }

  const { data: inboxMessage, error: insertError } = await supabase
    .from("inbox_messages")
    .insert({
      owner_id: ownerId,
      provider: inboundMessage.provider,
      provider_message_id: inboundMessage.providerMessageId,
      remetente_nome: contact?.nome ?? inboundMessage.senderName,
      telefone: inboundMessage.fromPhone,
      mensagem: inboundMessage.message,
      direction: inboundMessage.direction,
      status: "nova",
      metadata: {
        message_type: inboundMessage.messageType,
        from_last4: inboundMessage.fromPhone.slice(-4),
        linked_contact: Boolean(contact),
        linked_lead: Boolean(lead),
        has_provider_message_id: Boolean(inboundMessage.providerMessageId),
      },
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return {
    ok: true,
    duplicate: false,
    contact_id: contact?.id ?? null,
    lead_id: lead?.id ?? null,
    inbox_message_id: inboxMessage.id,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Metodo nao permitido." }, 405);
  }

  try {
    const { payload } = await readPayload(request);
    const supabase = getSupabaseClient();

    // 1. Try to handle Z-API connection/disconnection event first
    const wasZApiEvent = await handleZApiConnectionEvent(supabase, payload);
    if (wasZApiEvent) {
      return jsonResponse({ ok: true, handled: "z-api-connection" });
    }

    // 2. Try to extract and process Evolution API inbound messages
    const inboundMessages = extractEvolutionMessages(payload);
    if (inboundMessages.length === 0) {
      return jsonResponse({ ok: true, ignored: true, reason: "no_inbound_messages" });
    }

    const results: ProcessedMessage[] = [];
    for (const inboundMessage of inboundMessages) {
      results.push(await processInboundMessage(supabase, inboundMessage));
    }

    return jsonResponse({ ok: true, processed: results.length, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected webhook error.";
    console.error(
      JSON.stringify({
        event: "whatsapp_qr_inbound_error",
        message,
      }),
    );

    return jsonResponse({ error: "Erro ao processar webhook." }, 500);
  }
});

