// Lista os templates de mensagem APROVADOS da conta WhatsApp Business (WABA) via
// Graph API da Meta. Chamada pelo navegador (com JWT do usuário logado) para
// popular o seletor de templates no Inbox.
//
// Requer secrets: META_WHATSAPP_ACCESS_TOKEN e META_WABA_ID (ID da conta
// WhatsApp Business). Mantém verify_jwt=true (padrão) — só usuários autenticados.

import { createClient } from "npm:@supabase/supabase-js@2.110.0";

type JsonRecord = Record<string, unknown>;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const asString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.toLowerCase().startsWith("bearer ")) return null;
  return authorization.slice("bearer ".length).trim();
}

async function getAuthenticatedUser(request: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return null;

  const token = bearerToken(request);
  if (!token) return null;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;
  return data.user;
}

const hasPlaceholder = (text: string) => /\{\{.+?\}\}/.test(text);

// Resume um template e decide se o ENVIO do v1 (só corpo, variáveis numéricas
// posicionais) consegue mandá-lo. Templates que exigem cabeçalho de mídia,
// variável no cabeçalho, botão dinâmico, variáveis nomeadas ({{nome}}) ou sem
// corpo são marcados como NÃO suportados (o picker os mostra desabilitados, com
// motivo) — evita oferecer o que a Meta recusaria no envio.
function summarizeTemplate(template: JsonRecord) {
  const components = Array.isArray(template.components) ? template.components : [];
  const getComp = (type: string) =>
    components.find((c) => isRecord(c) && String(c.type).toUpperCase() === type) as
      | JsonRecord
      | undefined;

  const body = getComp("BODY");
  const header = getComp("HEADER");
  const buttonsComp = getComp("BUTTONS");

  const bodyText = asString(body?.text) ?? "";

  // Placeholders do corpo: numéricos ({{1}}) vs nomeados ({{nome}}).
  const numeric = bodyText.match(/\{\{\s*\d+\s*\}\}/g) ?? [];
  const named = bodyText.match(/\{\{\s*[A-Za-z_][A-Za-z0-9_]*\s*\}\}/g) ?? [];
  const numericIndices = numeric.map((m) => Number(m.replace(/\D/g, "")));
  const variableCount = numericIndices.length ? Math.max(...numericIndices) : 0;

  let unsupportedReason = "";
  if (!bodyText.trim()) {
    unsupportedReason = "Template sem corpo de texto (mídia/autenticação).";
  } else if (named.length > 0) {
    unsupportedReason = "Usa variáveis nomeadas ({{nome}}) — ainda não suportado.";
  } else if (header) {
    const format = String(header.format ?? "TEXT").toUpperCase();
    if (format !== "TEXT") {
      unsupportedReason = `Cabeçalho de ${format.toLowerCase()} — ainda não suportado.`;
    } else if (hasPlaceholder(asString(header.text) ?? "")) {
      unsupportedReason = "Cabeçalho com variável — ainda não suportado.";
    }
  }
  if (!unsupportedReason && buttonsComp) {
    const btns = Array.isArray(buttonsComp.buttons) ? buttonsComp.buttons : [];
    const hasDynamic = btns.some((b) => {
      if (!isRecord(b)) return false;
      const type = String(b.type ?? "").toUpperCase();
      if (["COPY_CODE", "FLOW", "OTP", "CATALOG", "MPM"].includes(type)) return true;
      if (type === "URL" && hasPlaceholder(asString(b.url) ?? "")) return true;
      return false;
    });
    if (hasDynamic) unsupportedReason = "Botão dinâmico — ainda não suportado.";
  }

  return {
    name: asString(template.name) ?? "",
    language: asString(template.language) ?? "pt_BR",
    category: asString(template.category) ?? "",
    status: asString(template.status) ?? "",
    bodyText,
    variableCount,
    supported: !unsupportedReason,
    unsupportedReason,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "GET") {
    return jsonResponse({ error: "Metodo nao permitido." }, 405);
  }

  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return jsonResponse({ error: "Usuario nao autenticado." }, 401);
    }

    const accessToken =
      Deno.env.get("META_WHATSAPP_ACCESS_TOKEN") ?? Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const wabaId = Deno.env.get("META_WABA_ID");
    const graphVersion = Deno.env.get("META_GRAPH_API_VERSION") ?? "v21.0";

    if (!accessToken || !wabaId) {
      return jsonResponse({
        configured: false,
        templates: [],
        reason: "meta_templates_not_configured",
      });
    }

    // Pagina os templates seguindo paging.next (WABAs podem ter centenas de
    // templates; sem paginar, aprovados após a 1ª página sumiriam do seletor).
    let nextUrl: string | null =
      `https://graph.facebook.com/${graphVersion}/${wabaId}/message_templates` +
      `?fields=name,status,category,language,components&limit=200`;
    const rawTemplates: JsonRecord[] = [];
    let pages = 0;

    while (nextUrl && pages < 10) {
      const response = await fetch(nextUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const responseBody = (await response.json().catch(() => ({}))) as JsonRecord;

      if (!response.ok) {
        const errorMessage = isRecord(responseBody.error)
          ? String(responseBody.error.message)
          : "Falha ao consultar templates.";
        console.error(
          JSON.stringify({
            event: "whatsapp_templates_error",
            status: response.status,
            error_message: errorMessage,
          }),
        );
        return jsonResponse({ error: errorMessage }, 502);
      }

      const data = Array.isArray(responseBody.data) ? responseBody.data : [];
      for (const t of data) if (isRecord(t)) rawTemplates.push(t);

      const paging = isRecord(responseBody.paging) ? responseBody.paging : null;
      nextUrl = paging ? asString(paging.next) : null;
      pages += 1;
    }

    const templates = rawTemplates
      .map(summarizeTemplate)
      .filter((t) => t.name && t.status.toUpperCase() === "APPROVED");

    return jsonResponse({ configured: true, templates });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao listar templates.";
    console.error(
      JSON.stringify({ event: "whatsapp_templates_exception", error: String(error) }),
    );
    return jsonResponse({ error: errorMessage }, 500);
  }
});
