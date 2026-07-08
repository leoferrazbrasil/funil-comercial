import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.0";
import { ZApiProvider } from "./providers/ZApiProvider.ts";
import { IWhatsAppProvider } from "./types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase secrets missing.");

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.toLowerCase().startsWith("bearer ")) return null;
  return authorization.slice("bearer ".length).trim();
}

async function getAuthenticatedUser(supabase: any, request: Request) {
  const token = bearerToken(request);
  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error) throw error;
  return data.user;
}

// Injeção de dependência simplificada para o MVP
const provider: IWhatsAppProvider = new ZApiProvider();

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient();
    const user = await getAuthenticatedUser(supabase, request);
    
    if (!user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const requestUrl = new URL(request.url);
    const action = requestUrl.searchParams.get("action");

    if (action === "create") {
      const { instanceId, qrCode, token } = await provider.createInstance(user.id);
      
      // Find existing channel for this user/provider
      const { data: existing } = await supabase
        .from('integration_channels')
        .select('id')
        .eq('owner_id', user.id)
        .eq('provider', 'z-api')
        .maybeSingle();

      if (existing) {
        // Update the existing record
        await supabase
          .from('integration_channels')
          .update({
            metadata: { instanceId, token },
            status: 'inativo',
            numero: 'pending',
          })
          .eq('id', existing.id);
      } else {
        // Create a new record
        await supabase
          .from('integration_channels')
          .insert({
            owner_id: user.id,
            provider: 'z-api',
            nome: 'WhatsApp (Z-API)',
            numero: 'pending',
            status: 'inativo',
            metadata: { instanceId, token },
          });
      }

      return jsonResponse({ ok: true, qrCode, instanceId });
    }

    if (action === "status") {
      // Find the channel
      const { data: channel, error } = await supabase
        .from('integration_channels')
        .select('*')
        .eq('owner_id', user.id)
        .eq('provider', 'z-api')
        .maybeSingle();

      if (!channel || !channel.metadata?.instanceId) {
        return jsonResponse({ connected: false });
      }

      const { instanceId, token } = channel.metadata;
      const status = await provider.getInstanceStatus(instanceId, token);

      if (status.connected && status.phone && channel.numero !== status.phone) {
        // Update number and status if connected
        await supabase
          .from('integration_channels')
          .update({
            numero: status.phone,
            status: 'ativo'
          })
          .eq('id', channel.id);
      } else if (!status.connected && channel.status === 'ativo') {
         await supabase
          .from('integration_channels')
          .update({
            status: 'pausado'
          })
          .eq('id', channel.id);
      }

      return jsonResponse(status);
    }

    if (action === "disconnect") {
      const { data: channel } = await supabase
        .from('integration_channels')
        .select('*')
        .eq('owner_id', user.id)
        .eq('provider', 'z-api')
        .maybeSingle();

      if (channel && channel.metadata?.instanceId) {
        await provider.disconnectInstance(channel.metadata.instanceId, channel.metadata.token);
        await supabase
          .from('integration_channels')
          .update({ status: 'inativo', numero: 'disconnected' })
          .eq('id', channel.id);
      }

      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: "Invalid action" }, 400);

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("WhatsApp Manager Error:", message);
    return jsonResponse({ error: message }, 500);
  }
});
