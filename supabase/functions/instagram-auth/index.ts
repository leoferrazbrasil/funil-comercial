import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// "Instagram API com login pelo Instagram" (Business Login): o usuário loga direto
// no Instagram — sem Página do Facebook, sem me/accounts, sem Business Manager. A
// troca do código já devolve o user_id do IG. Requer os secrets INSTAGRAM_APP_ID e
// INSTAGRAM_APP_SECRET (do produto Instagram no painel do Meta).
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, redirectUri } = await req.json()
    const appId = Deno.env.get('INSTAGRAM_APP_ID')
    const appSecret = Deno.env.get('INSTAGRAM_APP_SECRET')
    if (!appId || !appSecret) {
      throw new Error('Credenciais do Instagram não configuradas (INSTAGRAM_APP_ID / INSTAGRAM_APP_SECRET).')
    }

    // 1) code -> token de curta duração (form-urlencoded). Retorna { access_token, user_id }.
    const form = new URLSearchParams()
    form.set('client_id', appId)
    form.set('client_secret', appSecret)
    form.set('grant_type', 'authorization_code')
    form.set('redirect_uri', redirectUri)
    form.set('code', code)

    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
    const tokenData = await tokenRes.json()
    if (!tokenData.access_token || tokenData.error_type || tokenData.error) {
      throw new Error(tokenData.error_message || tokenData.error?.message || 'Falha ao trocar o código por token.')
    }

    const shortToken = tokenData.access_token
    const igUserId = String(tokenData.user_id)

    // 2) token de longa duração (~60 dias)
    const longRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortToken}`,
    )
    const longData = await longRes.json()
    if (!longData.access_token || longData.error) {
      throw new Error(longData.error?.message || 'Falha ao obter o token de longa duração.')
    }

    const accessToken = longData.access_token
    const expiresIn = longData.expires_in ?? 5184000

    // 3) salva a integração
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    const { error: dbError } = await supabaseClient
      .from('social_integrations')
      .upsert(
        {
          platform: 'instagram',
          account_id: igUserId,
          access_token: accessToken,
          token_expires_at: expiresAt,
        },
        { onConflict: 'platform,account_id' },
      )
    if (dbError) throw dbError

    return new Response(
      JSON.stringify({ success: true, instagram_id: igUserId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
