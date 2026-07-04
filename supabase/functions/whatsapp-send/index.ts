import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.0";

type JsonRecord = Record<string, unknown>;
type SupabaseClientAny = ReturnType<typeof createClient<any, "public", any>>;

type SendPayload = {
  phone?: string;
  message?: string;
  source_message_id?: string | null;
  contact_id?: string | null;
  lead_id?: string | null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const normalizePhone = (value: string | null | undefined) =>
  value?.replace("whatsapp:", "").replace(/\D/g, "") ?? "";

const asString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const metadataString = (metadata: unknown, keys: string[]) => {
  if (!isRecord(metadata)) return null;

  for (const key of keys) {
    const value = asString(metadata[key]);
    if (value) return value;
  }

  return null;
};

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

function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.toLowerCase().startsWith("bearer ")) return null;
  return authorization.slice("bearer ".length).trim();
}

async function getAuthenticatedUser(supabase: SupabaseClientAny, request: Request) {
  const token = bearerToken(request);
  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error) throw error;
  return data.user;
}

async function getActiveWhatsAppChannel(supabase: SupabaseClientAny, ownerId: string) {
  const { data, error } = await supabase
    .from("integration_channels")
    .select("*")
    .eq("owner_id", ownerId)
    .in("provider", ["whatsapp", "whatsapp_cloud"])
    .eq("status", "ativo")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getSourceMessage(
  supabase: SupabaseClientAny,
  ownerId: string,
  messageId: string | null | undefined,
) {
  if (!messageId) return null;

  const { data, error } = await supabase
    .from("inbox_messages")
    .select("*")
    .eq("id", messageId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function sendMetaTextMessage(phoneNumberId: string, toPhone: string, message: string) {
  const accessToken =
    Deno.env.get("META_WHATSAPP_ACCESS_TOKEN") ?? Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  const graphVersion = Deno.env.get("META_GRAPH_API_VERSION") ?? "v21.0";

  if (!accessToken || !phoneNumberId) {
    return {
      configured: false,
      response: null as JsonRecord | null,
    };
  }

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toPhone,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      }),
    },
  );

  const responseBody = (await response.json().catch(() => ({}))) as JsonRecord;
  if (!response.ok) {
    console.error(
      JSON.stringify({
        event: "whatsapp_send_meta_error",
        status: response.status,
        to_last4: toPhone.slice(-4),
        error_code: isRecord(responseBody.error) ? responseBody.error.code : null,
      }),
    );

    throw new Error("Meta WhatsApp API rejected the message.");
  }

  return {
    configured: true,
    response: responseBody,
  };
}

function providerMessageId(metaResponse: JsonRecord | null) {
  const messages = Array.isArray(metaResponse?.messages) ? metaResponse.messages : [];
  const firstMessage = messages.find(isRecord);
  return asString(firstMessage?.id);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Metodo nao permitido." }, 405);
  }

  try {
    const payload = (await request.json().catch(() => ({}))) as SendPayload;
    const phone = normalizePhone(payload.phone);
    const message = payload.message?.trim() ?? "";

    if (!phone || !message) {
      return jsonResponse({ error: "Informe telefone e mensagem." }, 400);
    }

    const supabase = getSupabaseClient();
    const user = await getAuthenticatedUser(supabase, request);
    if (!user) {
      return jsonResponse({ error: "Usuario nao autenticado." }, 401);
    }

    const channel = await getActiveWhatsAppChannel(supabase, user.id);
    if (!channel) {
      return jsonResponse({
        ok: true,
        sent: false,
        fallback_allowed: true,
        reason: "no_active_channel",
      });
    }

    const phoneNumberId =
      metadataString(channel.metadata, ["phone_number_id", "phoneNumberId"]) ??
      Deno.env.get("META_WHATSAPP_PHONE_NUMBER_ID") ??
      Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") ??
      null;

    const metaResult = await sendMetaTextMessage(phoneNumberId ?? "", phone, message);
    if (!metaResult.configured) {
      return jsonResponse({
        ok: true,
        sent: false,
        fallback_allowed: true,
        reason: "meta_send_not_configured",
      });
    }

    const sourceMessage = await getSourceMessage(
      supabase,
      user.id,
      payload.source_message_id,
    );
    const sourcePhone = normalizePhone(sourceMessage?.telefone);
    if (sourceMessage && sourcePhone && sourcePhone !== phone) {
      return jsonResponse({ error: "Mensagem de origem nao pertence ao telefone informado." }, 403);
    }

    const messageId = providerMessageId(metaResult.response);
    const { data: inboxMessage, error: insertError } = await supabase
      .from("inbox_messages")
      .insert({
        owner_id: user.id,
        contact_id: payload.contact_id ?? sourceMessage?.contact_id ?? null,
        lead_id: payload.lead_id ?? sourceMessage?.lead_id ?? null,
        canal: "WhatsApp",
        provider: "whatsapp",
        provider_message_id: messageId,
        remetente_nome:
          asString(user.user_metadata?.nome) ??
          asString(user.email) ??
          "Equipe comercial",
        telefone: phone,
        mensagem: message,
        status: "Resposta enviada",
        unread_count: 0,
        direction: "outbound",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    if (sourceMessage?.id) {
      const { error: updateError } = await supabase
        .from("inbox_messages")
        .update({
          status: "Respondido",
          unread_count: 0,
        })
        .eq("id", sourceMessage.id)
        .eq("owner_id", user.id);

      if (updateError) throw updateError;
    }

    console.log(
      JSON.stringify({
        event: "whatsapp_send_inserted",
        to_last4: phone.slice(-4),
        has_provider_message_id: Boolean(messageId),
      }),
    );

    return jsonResponse({
      ok: true,
      sent: true,
      inbox_message_id: inboxMessage.id,
      provider_message_id: messageId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected send error.";
    console.error(
      JSON.stringify({
        event: "whatsapp_send_error",
        message,
      }),
    );

    return jsonResponse({ error: "Erro ao enviar WhatsApp." }, 500);
  }
});
