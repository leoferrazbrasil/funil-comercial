// Processa campanhas de WhatsApp (envio server-side de templates da Meta).
// Acionada por: (a) Supabase Cron via x-campaign-secret (todos os donos) ou
// (b) o front, com o JWT do usuário (só as campanhas dele — "enviar agora").
//
// Resumível e idempotente: cada destinatário é "reivindicado" (pending→sending)
// atomicamente antes do envio; destinatários presos em 'sending' há muito tempo
// são recuperados. verify_jwt=false (config.toml); autentica internamente.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.0";

type JsonRecord = Record<string, unknown>;
type SupabaseClientAny = ReturnType<typeof createClient<any, "public", any>>;

const TIME_BUDGET_MS = 110_000; // para antes do limite (~150s) da função
const SEND_DELAY_MS = 300; // pausa entre envios (rate limit)
const STALE_CLAIM_MS = 10 * 60 * 1000; // reclaim de 'sending' preso > 10 min
const MAX_ATTEMPTS = 3; // tentativas por destinatário em erro transitório

const isRecord = (v: unknown): v is JsonRecord =>
  Boolean(v) && typeof v === "object" && !Array.isArray(v);
const asString = (v: unknown) =>
  typeof v === "string" && v.trim() ? v.trim() : null;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-campaign-secret",
      "Content-Type": "application/json",
    },
  });

const normalizePhone = (value: string | null | undefined) => {
  const p = value?.replace("whatsapp:", "").replace(/\D/g, "") ?? "";
  if (!p) return "";
  let unified = p;
  while (unified.startsWith("0")) unified = unified.substring(1);
  if (unified.length === 10 || unified.length === 11) unified = "55" + unified;
  if (unified.startsWith("55") && unified.length === 13 && unified[4] === "9") {
    return unified.slice(0, 4) + unified.slice(5);
  }
  return unified;
};

const metadataString = (metadata: unknown, keys: string[]) => {
  if (!isRecord(metadata)) return null;
  for (const key of keys) {
    const v = asString(metadata[key]);
    if (v) return v;
  }
  return null;
};

function getServiceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase secrets missing.");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getAuthUserId(supabase: SupabaseClientAny, request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  if (!auth.toLowerCase().startsWith("bearer ")) return null;
  const token = auth.slice("bearer ".length).trim();
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;
  return data.user?.id ?? null;
}

// Substitui {{n}} pelo valor da variável n (1-based).
function renderBody(bodyText: string, variables: string[]) {
  return (bodyText ?? "").replace(/\{\{\s*(\d+)\s*\}\}/g, (_m, idx: string) => {
    const v = variables[Number(idx) - 1];
    return v && v.trim() ? v : `{{${idx}}}`;
  });
}

async function sendMetaTemplateMessage(
  phoneNumberId: string,
  toPhone: string,
  templateName: string,
  languageCode: string,
  variables: string[],
) {
  const accessToken =
    Deno.env.get("META_WHATSAPP_ACCESS_TOKEN") ?? Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  const graphVersion = Deno.env.get("META_GRAPH_API_VERSION") ?? "v21.0";
  if (!accessToken || !phoneNumberId) {
    throw new Error("Meta Cloud API não configurada (token/phone_number_id ausentes).");
  }

  const components = variables.length
    ? [{ type: "body", parameters: variables.map((text) => ({ type: "text", text })) }]
    : [];

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toPhone,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          ...(components.length ? { components } : {}),
        },
      }),
    },
  );

  const responseBody = (await response.json().catch(() => ({}))) as JsonRecord;
  if (!response.ok) {
    const code = isRecord(responseBody.error) ? responseBody.error.code : "unknown";
    const message = isRecord(responseBody.error) ? responseBody.error.message : "Desconhecido";
    // 429/5xx são transitórios → o destinatário volta para a fila (retry).
    const retryable = response.status === 429 || response.status >= 500;
    throw Object.assign(new Error(`Meta API Error [${code}]: ${message}`), { retryable });
  }
  const messages = Array.isArray(responseBody.messages) ? responseBody.messages : [];
  const first = messages.find(isRecord);
  return asString(first?.id);
}

async function resolveMetaPhoneNumberId(supabase: SupabaseClientAny, ownerId: string) {
  const { data } = await supabase
    .from("integration_channels")
    .select("metadata")
    .eq("owner_id", ownerId)
    .in("provider", ["whatsapp", "whatsapp_cloud"])
    .eq("status", "ativo")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (
    metadataString(data?.metadata, ["phone_number_id", "phoneNumberId"]) ??
    Deno.env.get("META_WHATSAPP_PHONE_NUMBER_ID") ??
    Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") ??
    null
  );
}

async function countByStatus(
  supabase: SupabaseClientAny,
  campaignId: string,
  ownerId: string,
  status: string,
) {
  const { count } = await supabase
    .from("campaign_recipients")
    .select("*", { count: "exact", head: true })
    .eq("campaign_id", campaignId)
    .eq("owner_id", ownerId)
    .eq("status", status);
  return count ?? 0;
}

// Conta por agregação no servidor (head/count) — não materializa linhas, então
// contadores ficam corretos mesmo com milhares de destinatários (evita o teto
// de ~1000 linhas do PostgREST).
async function countRecipients(supabase: SupabaseClientAny, campaignId: string, ownerId: string) {
  const [pending, sending, sent, error] = await Promise.all([
    countByStatus(supabase, campaignId, ownerId, "pending"),
    countByStatus(supabase, campaignId, ownerId, "sending"),
    countByStatus(supabase, campaignId, ownerId, "sent"),
    countByStatus(supabase, campaignId, ownerId, "error"),
  ]);
  return { pending, sending, sent, error, total: pending + sending + sent + error };
}

async function runCampaign(
  supabase: SupabaseClientAny,
  campaign: JsonRecord,
  startTime: number,
) {
  const id = String(campaign.id);
  const ownerId = String(campaign.owner_id);
  const phoneNumberId = await resolveMetaPhoneNumberId(supabase, ownerId);
  const variablesCfg = Array.isArray(campaign.variables) ? campaign.variables : [];
  const bodyText = String(campaign.body_text ?? "");
  const templateName = String(campaign.template_name);
  const templateLanguage = String(campaign.template_language ?? "pt_BR");

  // Sem canal Meta configurado: aborta a campanha (em vez de queimar os
  // destinatários um a um com erro + sleep).
  if (!phoneNumberId) {
    const counts = await countRecipients(supabase, id, ownerId);
    await supabase
      .from("campaigns")
      .update({
        status: "failed",
        total: counts.total,
        sent: counts.sent,
        failed: counts.error,
        finished_at: new Date().toISOString(),
      })
      .eq("id", id);
    return { id, status: "failed", reason: "meta_not_configured" };
  }

  // Recupera destinatários presos em 'sending' (runner anterior morreu):
  const staleIso = new Date(Date.now() - STALE_CLAIM_MS).toISOString();
  // (a) com provider_message_id (o POST à Meta foi entregue) → 'sent' (idempotência).
  await supabase
    .from("campaign_recipients")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("campaign_id", id)
    .eq("status", "sending")
    .not("provider_message_id", "is", null)
    .lt("claimed_at", staleIso);
  // (b) sem provider_message_id → volta para a fila.
  await supabase
    .from("campaign_recipients")
    .update({ status: "pending", claimed_at: null })
    .eq("campaign_id", id)
    .eq("status", "sending")
    .is("provider_message_id", null)
    .lt("claimed_at", staleIso);

  let budgetHit = false;
  while (!budgetHit) {
    if (Date.now() - startTime > TIME_BUDGET_MS) break;
    const { data: pending } = await supabase
      .from("campaign_recipients")
      .select("*")
      .eq("campaign_id", id)
      .eq("owner_id", ownerId)
      .eq("status", "pending")
      .limit(50);
    if (!pending || pending.length === 0) break;

    for (const r of pending as JsonRecord[]) {
      if (Date.now() - startTime > TIME_BUDGET_MS) {
        budgetHit = true;
        break;
      }
      // Claim atômico: só um runner vence a transição pending→sending.
      const { data: claimed } = await supabase
        .from("campaign_recipients")
        .update({ status: "sending", claimed_at: new Date().toISOString() })
        .eq("id", r.id)
        .eq("status", "pending")
        .select("id");
      if (!claimed || claimed.length === 0) continue;

      const variables = variablesCfg.map((v: JsonRecord) =>
        v?.mode === "name"
          ? (asString(r.nome) ?? "Contato")
          : String((v?.value as string) ?? "").trim(),
      );
      const phone = normalizePhone(String(r.telefone ?? ""));
      const rendered = renderBody(bodyText, variables);
      const attempts = Number(r.attempts ?? 0);

      try {
        const messageId = await sendMetaTemplateMessage(
          phoneNumberId,
          phone,
          templateName,
          templateLanguage,
          variables,
        );
        await supabase
          .from("campaign_recipients")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            provider_message_id: messageId,
            error: null,
          })
          .eq("id", r.id);

        // Rastro na Inbox (best-effort).
        try {
          await supabase.from("inbox_messages").insert({
            owner_id: ownerId,
            contact_id: r.contact_id ?? null,
            canal: "WhatsApp",
            provider: "whatsapp_cloud",
            provider_message_id: messageId,
            remetente_nome: "Campanha",
            telefone: phone,
            mensagem: rendered,
            status: "Resposta enviada",
            unread_count: 0,
            direction: "outbound",
          });
        } catch (_) {
          /* rastro é opcional */
        }
      } catch (error) {
        const retryable = Boolean((error as { retryable?: boolean })?.retryable);
        const msg = (error instanceof Error ? error.message : String(error)).slice(0, 500);
        if (retryable && attempts + 1 < MAX_ATTEMPTS) {
          // Transitório (429/5xx/rede): devolve à fila para nova tentativa.
          await supabase
            .from("campaign_recipients")
            .update({ status: "pending", claimed_at: null, attempts: attempts + 1, error: msg })
            .eq("id", r.id);
        } else {
          await supabase
            .from("campaign_recipients")
            .update({ status: "error", attempts: attempts + 1, error: msg })
            .eq("id", r.id);
        }
      }

      await sleep(SEND_DELAY_MS);
    }
  }

  // Recalcula contadores (agregação) e finaliza (ou deixa 'sending' p/ o próximo tick).
  const counts = await countRecipients(supabase, id, ownerId);
  const done = counts.pending === 0 && counts.sending === 0;
  const status = !done ? "sending" : counts.sent > 0 ? "done" : "failed";
  await supabase
    .from("campaigns")
    .update({
      sent: counts.sent,
      failed: counts.error,
      total: counts.total,
      status,
      ...(done ? { finished_at: new Date().toISOString() } : {}),
    })
    .eq("id", id);

  return { id, ...counts, status };
}

async function processDueCampaigns(supabase: SupabaseClientAny, ownerScope: string | null) {
  const startTime = Date.now();
  const nowIso = new Date().toISOString();

  // Trava as campanhas vencidas (scheduled→sending).
  let flip = supabase
    .from("campaigns")
    .update({ status: "sending", started_at: nowIso })
    .eq("status", "scheduled")
    .lte("scheduled_at", nowIso);
  if (ownerScope) flip = flip.eq("owner_id", ownerScope);
  await flip;

  // Processa as que estão 'sending' (inclui retomadas).
  let camQ = supabase
    .from("campaigns")
    .select("*")
    .eq("status", "sending")
    .order("scheduled_at", { ascending: true })
    .limit(20);
  if (ownerScope) camQ = camQ.eq("owner_id", ownerScope);
  const { data: campaigns, error } = await camQ;
  if (error) throw error;

  const results: unknown[] = [];
  for (const c of (campaigns ?? []) as JsonRecord[]) {
    if (Date.now() - startTime > TIME_BUDGET_MS) break;
    results.push(await runCampaign(supabase, c, startTime));
  }
  return { processed: results.length, results };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return jsonResponse({ ok: true });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Metodo nao permitido." }, 405);
  }

  try {
    const supabase = getServiceClient();

    const cronSecret = Deno.env.get("CAMPAIGN_RUNNER_SECRET");
    const headerSecret = request.headers.get("x-campaign-secret");
    const isCron = Boolean(cronSecret) && headerSecret === cronSecret;

    let ownerScope: string | null = null;
    if (!isCron) {
      // Sem o secret do cron, exige JWT válido e restringe ao dono.
      ownerScope = await getAuthUserId(supabase, request);
      if (!ownerScope) return jsonResponse({ error: "Nao autorizado." }, 401);
    }

    const result = await processDueCampaigns(supabase, ownerScope);
    return jsonResponse({ ok: true, scope: ownerScope ? "own" : "all", ...result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro no runner de campanhas.";
    console.error(JSON.stringify({ event: "campaign_runner_error", error: String(error) }));
    return jsonResponse({ error: msg }, 500);
  }
});
