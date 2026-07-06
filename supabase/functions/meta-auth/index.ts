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

    // For simplicity, we assume this is the main IG account for this tenant
    // First, fetch the user's connected IG account ID using the token
    const meUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
    const meRes = await fetch(meUrl)
    const meData = await meRes.json()
    
    if (meData.error) {
       throw new Error(meData.error.message)
    }

    // Usually you have to traverse pages -> instagram_business_account
    // We are mocking this logic for brevity, you'll need the exact Graph API flow
    // To find the connected Instagram Account ID.
    const pageId = meData.data?.[0]?.id; 
    let instagramId = 'unknown';
    
    if (pageId) {
       const igUrl = `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`
       const igRes = await fetch(igUrl)
       const igData = await igRes.json()
       if (igData.instagram_business_account) {
         instagramId = igData.instagram_business_account.id
       }
    }

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
      status: 400,
    })
  }
})
