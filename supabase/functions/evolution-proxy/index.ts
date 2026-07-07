import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.0";

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

async function readPayload(request: Request) {
  const rawBody = await request.text();
  return rawBody ? JSON.parse(rawBody) : {};
}

function getSupabaseClient(req: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const authHeader = req.headers.get("Authorization");

  if (!supabaseUrl || !anonKey) {
    throw new Error("Supabase secrets missing.");
  }

  return createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader ?? "" } },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Metodo nao permitido." }, 405);
  }

  try {
    const supabase = getSupabaseClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ error: "Nao autorizado" }, 401);
    }

    const payload = await readPayload(request);
    const { action } = payload;

    const evolutionUrl = Deno.env.get("EVOLUTION_API_URL");
    const evolutionKey = Deno.env.get("EVOLUTION_GLOBAL_API_KEY");
    const funilUrl = Deno.env.get("SUPABASE_URL")?.replace("https://", "https://"); // we need the functions URL
    const functionUrl = funilUrl ? `${funilUrl}/functions/v1/whatsapp-qr-inbound` : null;

    if (!evolutionUrl || !evolutionKey) {
      return jsonResponse({ 
        error: "Servidor Evolution API nao configurado.",
        details: "As variaveis EVOLUTION_API_URL e EVOLUTION_GLOBAL_API_KEY estao ausentes nos segredos da Edge Function."
      }, 500);
    }

    if (action === "create_instance") {
      const randomId = Math.random().toString(36).substring(2, 8);
      const instanceName = `fc_${user.id.substring(0, 8)}_${randomId}`;

      // 1. Create Instance
      const createRes = await fetch(`${evolutionUrl}/instance/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": evolutionKey
        },
        body: JSON.stringify({
          instanceName,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS"
        })
      });

      if (!createRes.ok) {
        const errData = await createRes.text();
        console.error("Evolution Create Error:", errData);
        return jsonResponse({ error: "Falha ao criar instancia na Evolution API." }, 500);
      }

      const createData = await createRes.json();
      
      // Some versions of Evolution API return base64 inside qrcode, others directly inside base64
      let base64 = createData.qrcode?.base64 || createData.base64;

      // 2. Set Webhook if we have a function URL
      if (functionUrl) {
        const webhookRes = await fetch(`${evolutionUrl}/webhook/set/${instanceName}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": evolutionKey
          },
          body: JSON.stringify({
            url: functionUrl,
            webhook_by_events: false,
            webhook_base64: false,
            events: ["MESSAGES_UPSERT", "messages.upsert", "messages-upsert", "SEND_MESSAGE", "send.message"] // Send common formats
          })
        });

        if (!webhookRes.ok) {
          console.warn("Evolution Webhook Error:", await webhookRes.text());
          // We don't fail the whole request, as the QR code was generated
        }
      }

      return jsonResponse({
        ok: true,
        instance_name: instanceName,
        qrcode_base64: base64
      });
    }

    return jsonResponse({ error: "Acao desconhecida." }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected webhook error.";
    console.error("Evolution Proxy Error:", message);
    return jsonResponse({ error: "Erro interno no servidor proxy." }, 500);
  }
});

