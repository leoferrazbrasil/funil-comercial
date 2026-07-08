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

// A "real" phone number: only digits, 10-15 long. Placeholder markers
// (pending-*, disconnected-*, "connected") are never real phones.
function isRealPhone(value: unknown): value is string {
  return typeof value === "string" && /^\d{10,15}$/.test(value.trim());
}

// Owner-scoped placeholders so the global unique(provider, numero) constraint
// can NEVER collide across users (two users can both be "pending" simultaneously).
const pendingNumero = (ownerId: string) => `pending-${ownerId}`;
const disconnectedNumero = (ownerId: string) => `disconnected-${ownerId}`;

// Fetch the single z-api channel for an owner. Tolerant of the (rare) case of
// duplicate rows — returns the most recently updated instead of throwing.
async function getOwnerZApiChannel(supabase: any, ownerId: string) {
  const { data, error } = await supabase
    .from("integration_channels")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("provider", "z-api")
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("[whatsapp-manager] Error loading channel:", error.message);
    return null;
  }
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
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
      console.log(`[whatsapp-manager] Creating instance for user ${user.id}...`);
      const { instanceId, qrCode, token } = await provider.createInstance(user.id);
      console.log(`[whatsapp-manager] QR Code generated successfully for instanceId=${instanceId}`);

      // Find existing channel for this user/provider (tolerant of duplicates)
      const existing = await getOwnerZApiChannel(supabase, user.id);

      if (existing) {
        // Update the existing record. Preserve a previously connected real phone
        // in numero (so a reconnect of the same line keeps its identity); only
        // reset to the owner-scoped placeholder when there is no real phone yet.
        const nextNumero = isRealPhone(existing.numero) ? existing.numero : pendingNumero(user.id);
        console.log(`[whatsapp-manager] Updating existing channel ${existing.id}`);
        const { error: updErr } = await supabase
          .from('integration_channels')
          .update({
            metadata: { instanceId, token },
            status: 'inativo',
            numero: nextNumero,
          })
          .eq('id', existing.id);
        if (updErr) console.error(`[whatsapp-manager] create/update error:`, updErr.message);
      } else {
        // Create a new record with an owner-scoped placeholder numero.
        console.log(`[whatsapp-manager] Creating new channel for user ${user.id}`);
        const { error: insErr } = await supabase
          .from('integration_channels')
          .insert({
            owner_id: user.id,
            provider: 'z-api',
            nome: 'WhatsApp (Z-API)',
            numero: pendingNumero(user.id),
            status: 'inativo',
            metadata: { instanceId, token },
          });
        if (insErr) console.error(`[whatsapp-manager] create/insert error:`, insErr.message);
      }

      console.log(`[whatsapp-manager] Channel created/updated. Waiting for QR Code scan...`);
      return jsonResponse({ ok: true, qrCode, instanceId });
    }

    if (action === "status") {
      const channel = await getOwnerZApiChannel(supabase, user.id);

      if (!channel || !channel.metadata?.instanceId) {
        console.log(`[whatsapp-manager] No z-api channel found for user ${user.id}`);
        return jsonResponse({ connected: false });
      }

      const { instanceId, token } = channel.metadata;
      const dbAtivo = channel.status === 'ativo';
      console.log(`[whatsapp-manager] Checking status for channel ${channel.id} (instanceId=${instanceId}, dbStatus=${channel.status})`);

      // Live check against Z-API. getInstanceStatus never throws (returns
      // { connected:false } on any failure).
      const live = await provider.getInstanceStatus(instanceId, token);

      // A connection is confirmed if EITHER the live check says so OR the DB was
      // already marked 'ativo' — which only happens via a prior successful live
      // poll or the explicit Z-API "ConnectedCallback" webhook. This makes the
      // detection resilient to transient live /status false-negatives right after
      // the scan (the exact window where the UI was getting stranded).
      const connected = live.connected || dbAtivo;

      // Prefer a freshly discovered real phone, else any real phone already stored.
      const realPhone = isRealPhone(live.phone)
        ? live.phone
        : (isRealPhone(channel.numero) ? channel.numero : undefined);

      console.log(`[whatsapp-manager] Resolved: connected=${connected} (live=${live.connected}, dbAtivo=${dbAtivo}), phone=${realPhone ?? "(pending)"}`);

      // Persist connection, but NEVER let a DB write failure hide the connected
      // signal from the client. Only write a real phone into numero; otherwise
      // leave the existing placeholder untouched (avoids the unique(provider,numero)
      // collision that previously 500'd this endpoint and stranded the UI).
      if (live.connected) {
        try {
          const patch: Record<string, unknown> = { status: 'ativo' };
          if (realPhone && channel.numero !== realPhone) patch.numero = realPhone;
          const { error: updErr } = await supabase
            .from('integration_channels')
            .update(patch)
            .eq('id', channel.id);
          if (updErr) {
            console.error(`[whatsapp-manager] status DB update failed (non-fatal): ${updErr.message}`);
          }
        } catch (dbError) {
          console.error(`[whatsapp-manager] status DB update threw (non-fatal):`, dbError instanceof Error ? dbError.message : dbError);
        }
      }

      return jsonResponse({ connected, phone: realPhone });
    }

    if (action === "disconnect") {
      const channel = await getOwnerZApiChannel(supabase, user.id);

      if (channel && channel.metadata?.instanceId) {
        console.log(`[whatsapp-manager] Disconnecting channel ${channel.id}`);
        await provider.disconnectInstance(channel.metadata.instanceId, channel.metadata.token);
        const { error: updErr } = await supabase
          .from('integration_channels')
          .update({ status: 'inativo', numero: disconnectedNumero(user.id) })
          .eq('id', channel.id);
        if (updErr) console.error(`[whatsapp-manager] disconnect DB update error:`, updErr.message);
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
