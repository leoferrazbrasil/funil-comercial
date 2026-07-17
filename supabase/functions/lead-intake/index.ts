import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.0";

// Intake público de leads do formulário web. Grava um lead com o GA4 client_id
// capturado no navegador (para atribuição de conversões offline no GA4). Usa
// service-role + FUNIL_DEFAULT_OWNER_ID (a RLS por owner impede insert anônimo direto).
// Deploy com JWT off: `functions deploy lead-intake --no-verify-jwt`.

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

// Telefone BR: só dígitos, garante DDI 55.
function normalizePhone(raw: string): string {
  let p = raw.replace(/\D/g, "");
  if (!p) return "";
  while (p.startsWith("0")) p = p.slice(1);
  if (p.length === 10 || p.length === 11) p = "55" + p;
  return p;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  let payload: Record<string, unknown> = {};
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "JSON inválido." }, 400);
  }

  // Honeypot: campo oculto preenchido = bot. Finge sucesso e não grava nada.
  if (asString(payload["website"]) || asString(payload["_hp"])) {
    return json({ ok: true });
  }

  const nome = asString(payload["nome"]);
  const telefone = normalizePhone(asString(payload["telefone"]));
  const gaClientId = asString(payload["ga_client_id"]);

  if (!nome || telefone.length < 12) {
    return json({ error: "Informe nome e um WhatsApp válido." }, 422);
  }

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const ownerId = Deno.env.get("FUNIL_DEFAULT_OWNER_ID");
  if (!url || !serviceKey || !ownerId) {
    console.error("[lead-intake] secrets ausentes");
    return json({ error: "Configuração ausente." }, 500);
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const base = {
    owner_id: ownerId,
    nome,
    telefone,
    status: "novo",
    origem: "Site",
    interesse: "Solicitou análise pelo site",
  };

  // Grava com ga_client_id se a coluna existir; senão degrada e grava sem (a migração
  // leads_ga_client_id pode não ter sido aplicada ainda).
  let insert = await supabase
    .from("leads")
    .insert({ ...base, ga_client_id: gaClientId || null })
    .select("id")
    .single();

  const missingColumn =
    insert.error &&
    (insert.error.code === "42703" ||
      insert.error.code === "PGRST204" ||
      /ga_client_id|column .* does not exist|could not find the .* column/i.test(
        insert.error.message ?? "",
      ));

  if (missingColumn) {
    insert = await supabase.from("leads").insert(base).select("id").single();
  }

  if (insert.error) {
    console.error("[lead-intake] insert falhou", insert.error);
    return json({ error: "Não foi possível registrar. Tente novamente." }, 500);
  }

  return json({ ok: true, id: insert.data?.id ?? null });
});
