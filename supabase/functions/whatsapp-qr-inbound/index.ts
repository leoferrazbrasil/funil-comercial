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

const normalizePhone = (value: string | null) =>
  value?.replace("whatsapp:", "").replace(/\D/g, "") ?? "";

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
  if (payload.event !== "messages.upsert") return [];
  
  const instance = asString(payload.instance);
  if (!instance) return [];

  const data = getNestedRecord(payload, "data");
  if (!data) return [];

  const key = getNestedRecord(data, "key");
  if (!key || key.fromMe) return []; // Ignore outgoing messages

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

  return [{
    provider: "evolution_api",
    providerMessageId,
    fromPhone,
    channelIdentifiers: [instance],
    senderName,
    message: messageText.trim(),
    messageType,
  }];
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
      direction: "inbound",
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
    
    // Auth could be done via global apikey or instance api key headers, 
    // but typically the URL path includes a secret or we use Evolution API global key.
    // For now, we trust the inbound webhook if the instance name matches an active channel.
    
    const inboundMessages = extractEvolutionMessages(payload);
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
        event: "whatsapp_qr_inbound_error",
        message,
      }),
    );

    return jsonResponse({ error: "Erro ao processar webhook." }, 500);
  }
});

