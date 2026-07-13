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
    const { imageBase64, caption, instagramAccountId } = await req.json()

    if (!imageBase64 || !instagramAccountId) {
      throw new Error('Missing image or account ID.')
    }

    console.log("Publishing for Instagram Account ID:", instagramAccountId);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch valid access token from DB
    const { data: authData, error: authError } = await supabaseClient
      .from('social_integrations')
      .select('access_token')
      .eq('platform', 'instagram')
      .eq('account_id', instagramAccountId)
      .single()

    if (authError || !authData?.access_token) {
      throw new Error('No valid Instagram integration found.')
    }

    const accessToken = authData.access_token

    // 2. Upload image to Supabase Storage temporarily
    // Convert base64 to Blob
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
    const fileName = `post_${Date.now()}.jpg`

    const { error: uploadError } = await supabaseClient
      .storage
      .from('social_media_temp')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
      })

    if (uploadError) {
      throw new Error('Failed to upload image to temporary storage.')
    }

    // Get public URL
    const { data: publicUrlData } = supabaseClient
      .storage
      .from('social_media_temp')
      .getPublicUrl(fileName)

    const imageUrl = publicUrlData.publicUrl

    // 3. Create Container — Instagram Graph API (login pelo Instagram usa graph.instagram.com)
    const createContainerUrl = `https://graph.instagram.com/v21.0/${instagramAccountId}/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${accessToken}`

    const containerRes = await fetch(createContainerUrl, { method: 'POST' })
    const containerData = await containerRes.json()

    if (containerData.error) {
      throw new Error(`Graph API Container Error: ${containerData.error.message}`)
    }

    const creationId = containerData.id

    // 4. Publish Container
    const publishUrl = `https://graph.instagram.com/v21.0/${instagramAccountId}/media_publish?creation_id=${creationId}&access_token=${accessToken}`
    
    const publishRes = await fetch(publishUrl, { method: 'POST' })
    const publishData = await publishRes.json()

    if (publishData.error) {
      throw new Error(`Graph API Publish Error: ${publishData.error.message}`)
    }

    // 5. Cleanup: Delete temporary image
    await supabaseClient.storage.from('social_media_temp').remove([fileName])

    return new Response(
      JSON.stringify({ success: true, post_id: publishData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error: any) {
    console.error("META PUBLISH ERROR:", error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
