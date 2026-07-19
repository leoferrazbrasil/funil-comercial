import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.0";
import {
  buildMessagingEvent,
  type MessagingEventName,
  sendMessagingEvent,
} from "./capi.ts";

// Devolve à Meta o desfecho de um lead que nasceu de um anúncio Click-to-WhatsApp.
//
// Chamada pelo CRM quando o lead muda de estágio (ex.: qualificado, agendado,
// fechado). A Meta passa a otimizar para o EVENTO DE NEGÓCIO, não para
// "conversa iniciada" — que é o que ela otimiza hoje e é um proxy ruim.
//
// POST { lead_id: uuid, event_name?: MessagingEventName, value?: number }
// Auth: JWT do usuário (a RLS por owner_id garante que só o dono reporta o lead).
// Deploy: `supabase functions deploy meta-capi-messaging`

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const asString = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : "");

const VALID_EVENTS: MessagingEventName[] = [
  "Lead",
  "Contact",
  "Schedule",
  "SubmitApplication",
  "Purchase",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  let payload: Record<string, unknown> = {};
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "JSON inválido." }, 400);
  }

  const leadId = asString(payload["lead_id"]);
  if (!leadId) return json({ error: "lead_id obrigatório." }, 422);

  const requested = asString(payload["event_name"]) as MessagingEventName;
  const eventName: MessagingEventName = VALID_EVENTS.includes(requested)
    ? requested
    : "SubmitApplication"; // padrão = lead qualificado

  const rawValue = payload["value"];
  const value = typeof rawValue === "number" && Number.isFinite(rawValue) ? rawValue : null;

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const accessToken = Deno.env.get("META_CAPI_ACCESS_TOKEN") ?? "";
  const datasetId =
    Deno.env.get("META_MESSAGING_DATASET_ID") ?? Deno.env.get("META_PIXEL_ID") ?? "";
  const apiVersion = Deno.env.get("META_GRAPH_API_VERSION") ?? "v25.0";
  const wabaId = Deno.env.get("META_WABA_ID") ?? "";
  const testEventCode = Deno.env.get("META_CAPI_TEST_EVENT_CODE") ?? "";

  if (!url || !serviceKey) return json({ error: "Configuração ausente." }, 500);
  if (!accessToken || !datasetId) {
    return json({ error: "META_CAPI_ACCESS_TOKEN ou dataset não configurado." }, 500);
  }

  // Autoriza pelo JWT do chamador: a RLS impede ler lead de outro owner.
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return json({ error: "Não autorizado." }, 401);

  const asUser = createClient(url, Deno.env.get("SUPABASE_ANON_KEY") ?? serviceKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });

  const { data: lead, error: leadError } = await asUser
    .from("leads")
    .select("id, nome, telefone, ctwa_clid, ctwa_clid_at, ctwa_reported_at")
    .eq("id", leadId)
    .maybeSingle();

  if (leadError) {
    console.error("[meta-capi-messaging] leitura falhou", leadError);
    return json({ error: "Não foi possível ler o lead." }, 500);
  }
  if (!lead) return json({ error: "Lead não encontrado." }, 404);

  // Já reportado: não reenvia. O event_id deduplicaria na Meta, mas evitar a
  // chamada é mais barato e deixa o estado explícito.
  if (lead.ctwa_reported_at) {
    return json({ ok: true, skipped: "already_reported" });
  }

  const ctwaClid = asString(lead.ctwa_clid);

  // Janela de atribuição: a Meta descarta eventos muito antigos. Sinalizamos
  // em vez de falhar silenciosamente.
  const clidAt = lead.ctwa_clid_at ? new Date(lead.ctwa_clid_at as string) : null;
  const ageDays = clidAt ? (Date.now() - clidAt.getTime()) / 86_400_000 : null;

  const [firstName = "", ...rest] = asString(lead.nome).split(/\s+/);

  const event = await buildMessagingEvent({
    ctwaClid,
    whatsappBusinessAccountId: wabaId,
    eventName,
    // Dedupe estável por lead+evento.
    eventId: `${leadId}:${eventName}`,
    eventTime: Math.floor(Date.now() / 1000),
    phone: asString(lead.telefone),
    firstName,
    lastName: rest.join(" "),
    value,
    currency: "BRL",
  });

  try {
    const result = await sendMessagingEvent({
      accessToken,
      apiVersion,
      datasetId,
      events: [event],
      testEventCode: testEventCode || undefined,
    });

    // Marca como reportado com service-role (a coluna é de telemetria, não do usuário).
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    await admin
      .from("leads")
      .update({ ctwa_reported_at: new Date().toISOString() })
      .eq("id", leadId);

    console.log(JSON.stringify({
      event: "meta_capi_messaging_sent",
      event_name: eventName,
      has_ctwa_clid: Boolean(ctwaClid),
      attribution: ctwaClid ? "clid" : "phone_match",
      age_days: ageDays === null ? null : Math.round(ageDays),
      events_received: result.events_received ?? null,
    }));

    return json({
      ok: true,
      event_name: eventName,
      attribution: ctwaClid ? "clid" : "phone_match",
      events_received: result.events_received ?? null,
    });
  } catch (error) {
    console.error("[meta-capi-messaging] envio falhou", error);
    return json({ error: "Falha ao enviar evento para a Meta." }, 502);
  }
});
