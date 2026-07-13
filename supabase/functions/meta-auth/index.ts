import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, redirectUri } = await req.json()
    const appId = Deno.env.get('META_APP_ID')
    const appSecret = Deno.env.get('META_APP_SECRET')

    if (!appId || !appSecret) {
      throw new Error('Meta credentials not configured.')
    }

    // 1. Exchange the code for a short-lived token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`
    
    const tokenRes = await fetch(tokenUrl)
    const tokenData = await tokenRes.json()
    
    if (tokenData.error) {
      throw new Error(tokenData.error.message)
    }

    const shortToken = tokenData.access_token

    // 2. Exchange for long-lived token
    const longTokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`
    
    const longTokenRes = await fetch(longTokenUrl)
    const longTokenData = await longTokenRes.json()

    if (longTokenData.error) {
      throw new Error(longTokenData.error.message)
    }

    const accessToken = longTokenData.access_token
    const expiresIn = longTokenData.expires_in // usually 60 days

    // 3. Save to database using service_role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // --- Resolve o Instagram Business Account (robusto) --------------------------
    // Assets geridos por Business Manager costumam NÃO aparecer em me/accounts no
    // token do usuário. Estratégia em camadas:
    //  (1) me/accounts (campo simples — expansão aninhada na edge é instável);
    //  (2) fallback por página (node direto com o token da própria página);
    //  (3) fallback via Business Manager (owned_pages + client_pages).
    const graph = async (path: string, token: string, fields?: string) => {
      const params = new URLSearchParams();
      if (fields) params.set("fields", fields);
      params.set("limit", "100");
      params.set("access_token", token);
      const res = await fetch(`https://graph.facebook.com/v19.0/${path}?${params.toString()}`);
      return await res.json();
    };

    // Acha o IG dentro de uma lista de páginas: 1º pela expansão, senão consultando
    // cada página diretamente (com o token da página, mais confiável).
    const igFromPages = async (pages: any[]): Promise<string | null> => {
      for (const p of pages) {
        if (p?.instagram_business_account?.id) return p.instagram_business_account.id;
      }
      for (const p of pages) {
        if (!p?.id) continue;
        const d = await graph(String(p.id), p.access_token || accessToken, "instagram_business_account");
        if (d?.instagram_business_account?.id) return d.instagram_business_account.id;
      }
      return null;
    };

    let instagramId: string | null = null;
    const diag: string[] = [];

    // (1) + (2): páginas do próprio usuário
    const acc = await graph("me/accounts", accessToken, "id,name,access_token,instagram_business_account");
    const userPages = Array.isArray(acc?.data) ? acc.data : [];
    diag.push(`me/accounts=${userPages.length}`);
    instagramId = await igFromPages(userPages);

    // (3): páginas via Business Manager (owned + client). Só funciona se o app tiver
    // a permissão business_management habilitada; sem ela, me/businesses vem vazio
    // (inofensivo — apenas não ajuda no fallback).
    if (!instagramId) {
      const biz = await graph("me/businesses", accessToken, "id,name");
      const businesses = Array.isArray(biz?.data) ? biz.data : [];
      diag.push(`businesses=${businesses.length}`);
      for (const b of businesses) {
        for (const edge of ["owned_pages", "client_pages"]) {
          const bp = await graph(`${b.id}/${edge}`, accessToken, "id,name,access_token,instagram_business_account");
          const bpages = Array.isArray(bp?.data) ? bp.data : [];
          diag.push(`${b.id}:${edge}=${bpages.length}`);
          instagramId = await igFromPages(bpages);
          if (instagramId) break;
        }
        if (instagramId) break;
      }
    }

    console.log("meta-auth IG resolution:", diag.join(" "), "->", instagramId);

    if (!instagramId) {
      throw new Error(
        `Não encontrei um Instagram Comercial vinculado às Páginas concedidas (${diag.join(", ")}). Confira: 1) o Instagram é Profissional (Comercial/Criador); 2) está vinculado à Página no Gerenciador de Contas do Instagram; 3) no login, você concedeu ESSA Página (a que tem o IG vinculado).`
      );
    }
    console.log("Resolved Instagram Business Account ID:", instagramId);

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    const { error: dbError } = await supabaseClient
      .from('social_integrations')
      .upsert({ 
        platform: 'instagram', 
        account_id: instagramId, 
        access_token: accessToken,
        token_expires_at: expiresAt
      }, { onConflict: 'platform,account_id' })

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({ success: true, instagram_id: instagramId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
