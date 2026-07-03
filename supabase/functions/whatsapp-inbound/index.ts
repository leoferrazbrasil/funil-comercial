import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.0";

type WebhookPayload = Record<string, unknown>;

type NormalizedInboundMessage = {
  provider: string;
  providerMessageId: string | null;
  fromPhone: string;
  toPhone: string | null;
  senderName: string;
  message: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-funil-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const normalizePhone = (value: string | null) =>
  value?.replace("whatsapp:", "").replace(/\D/g, "") ?? "";

const payloadValue = (payload: WebhookPayload, keys: string[]) => {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return null;
};

async function readPayload(request: Request): Promise<WebhookPayload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await request.json()) as WebhookPayload;
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }

  return { Body: await request.text() };
}

function normalizePayload(payload: WebhookPayload): NormalizedInboundMessage {
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
    toPhone: toPhone || null,
    senderName,
    message,
  };
}

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar configurados.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

async function resolveOwnerId(
  supabase: ReturnType<typeof createClient>,
  message: NormalizedInboundMessage,
) {
  if (message.toPhone) {
    const providers = Array.from(new Set([message.provider, "whatsapp"]));
    const { data, error } = await supabase
      .from("integration_channels")
      .select("owner_id")
      .eq("numero", message.toPhone)
      .in("provider", providers)
      .eq("status", "ativo")
      .maybeSingle();

    if (error) throw error;
    if (data?.owner_id) return data.owner_id as string;
  }

  return Deno.env.get("FUNIL_DEFAULT_OWNER_ID") ?? null;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Metodo nao permitido." }, 405);
  }

  const configuredSecret = Deno.env.get("FUNIL_WEBHOOK_SECRET");
  const requestUrl = new URL(request.url);
  const receivedSecret =
    request.headers.get("x-funil-webhook-secret") ?? requestUrl.searchParams.get("token");

  if (configuredSecret && receivedSecret !== configuredSecret) {
    return jsonResponse({ error: "Webhook nao autorizado." }, 401);
  }

  try {
    const payload = await readPayload(request);
    const inboundMessage = normalizePayload(payload);

    if (!inboundMessage.fromPhone || !inboundMessage.message) {
      return jsonResponse(
        { error: "Informe telefone de origem e mensagem para registrar o atendimento." },
        400,
      );
    }

    const supabase = getSupabaseClient();
    const ownerId = await resolveOwnerId(supabase, inboundMessage);

    if (!ownerId) {
      return jsonResponse(
        {
          error:
            "Nenhum canal ativo encontrado para este numero. Configure integration_channels ou FUNIL_DEFAULT_OWNER_ID.",
        },
        422,
      );
    }

    const { data: existingContact, error: contactLookupError } = await supabase
      .from("contacts")
      .select("*")
      .eq("owner_id", ownerId)
      .eq("telefone", inboundMessage.fromPhone)
      .maybeSingle();

    if (contactLookupError) throw contactLookupError;

    let contact = existingContact;
    if (!contact) {
      const { data, error } = await supabase
        .from("contacts")
        .insert({
          owner_id: ownerId,
          nome: inboundMessage.senderName,
          telefone: inboundMessage.fromPhone,
          origem: "WhatsApp",
          potencial: "Novo",
        })
        .select()
        .single();

      if (error) throw error;
      contact = data;
    }

    const { data: existingLead, error: leadLookupError } = await supabase
      .from("leads")
      .select("*")
      .eq("owner_id", ownerId)
      .eq("telefone", inboundMessage.fromPhone)
      .in("status", ["novo", "em_atendimento", "qualificado"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (leadLookupError) throw leadLookupError;

    let lead = existingLead;
    if (!lead) {
      const { data, error } = await supabase
        .from("leads")
        .insert({
          owner_id: ownerId,
          contact_id: contact.id,
          nome: contact.nome,
          telefone: inboundMessage.fromPhone,
          email: contact.email,
          interesse: "Qualificar demanda comercial",
          status: "novo",
          valor_estimado: 0,
          proxima_acao: "Responder WhatsApp e qualificar necessidade",
          origem: "WhatsApp",
        })
        .select()
        .single();

      if (error) throw error;
      lead = data;
    }

    const { data: inboxMessage, error: messageError } = await supabase
      .from("inbox_messages")
      .insert({
        owner_id: ownerId,
        contact_id: contact.id,
        lead_id: lead.id,
        canal: "WhatsApp",
        provider: inboundMessage.provider,
        provider_message_id: inboundMessage.providerMessageId,
        remetente_nome: inboundMessage.senderName,
        telefone: inboundMessage.fromPhone,
        mensagem: inboundMessage.message,
        status: "Novo lead",
        unread_count: 1,
        direction: "inbound",
      })
      .select()
      .single();

    if (messageError) {
      if (messageError.code === "23505") {
        return jsonResponse({ ok: true, duplicate: true });
      }

      throw messageError;
    }

    return jsonResponse({
      ok: true,
      contact_id: contact.id,
      lead_id: lead.id,
      inbox_message_id: inboxMessage.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    return jsonResponse({ error: message }, 500);
  }
});
