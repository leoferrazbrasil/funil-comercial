import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function serviceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase secrets missing.");
  return createClient(url, key, { auth: { persistSession: false } });
}
function bearer(req: Request) {
  const a = req.headers.get("authorization") ?? "";
  return a.toLowerCase().startsWith("bearer ") ? a.slice(7).trim() : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);
  try {
    const supabase = serviceClient();
    const token = bearer(req);
    if (!token) return json({ error: "Não autenticado." }, 401);
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) return json({ error: "Sessão inválida." }, 401);
    const admin = userData.user;

    // Só um admin (não-vendedor) pode criar membros.
    const { data: adminProfile, error: profErr } = await supabase
      .from("profiles").select("role, admin_id").eq("id", admin.id).maybeSingle();
    if (profErr) return json({ error: "Não foi possível validar suas permissões." }, 500);
    if (!adminProfile || adminProfile.role === "vendedor" || adminProfile.admin_id) {
      return json({ error: "Apenas o administrador da conta pode criar vendedores." }, 403);
    }

    const { email, password, nome } = (await req.json().catch(() => ({}))) as
      { email?: string; password?: string; nome?: string };
    const emailNorm = (email ?? "").trim().toLowerCase();
    if (!emailNorm || !password || password.length < 6) {
      return json({ error: "Informe email e uma senha (mín. 6 caracteres)." }, 400);
    }

    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: emailNorm,
      password,
      email_confirm: true,
      user_metadata: { nome: (nome ?? "").trim() || emailNorm },
    });
    if (createErr || !created.user) {
      const msg = createErr?.message ?? "Não foi possível criar o usuário.";
      const status = /already|exists|registered/i.test(msg) ? 409 : 400;
      return json({ error: status === 409 ? "Este e-mail já tem conta." : msg }, status);
    }

    // Perfil do vendedor: role + vínculo com o admin.
    const { error: upErr } = await supabase.from("profiles").upsert({
      id: created.user.id,
      email: emailNorm,
      nome: (nome ?? "").trim() || emailNorm,
      role: "vendedor",
      admin_id: admin.id,
    });
    if (upErr) {
      await supabase.auth.admin.deleteUser(created.user.id).catch(() => {});
      return json({ error: `Não foi possível criar o perfil do vendedor: ${upErr.message}` }, 500);
    }

    return json({ ok: true, member: { id: created.user.id, email: emailNorm, nome: (nome ?? "").trim() || emailNorm } });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Erro desconhecido." }, 500);
  }
});
