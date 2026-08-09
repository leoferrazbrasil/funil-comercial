import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function callOpenAI(systemPrompt: string, userPrompt: string, key: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    }),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || `OpenAI returned status ${response.status}`);
  }

  const content = data.choices[0].message.content;
  return JSON.parse(content);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    // 1. Check if Instagram is connected
    const { data: integration } = await supabaseClient
      .from('social_integrations')
      .select('*')
      .eq('owner_id', user.id)
      .eq('provider', 'instagram')
      .eq('status', 'connected')
      .single()

    const openAiKey = Deno.env.get('OPENAI_API_KEY')

    let lastPostData = null;

    if (!integration || !integration.access_token) {
      // Fallback de Mock local (quando não tem IG conectado)
      lastPostData = {
        caption: "Erro 404: CRM não é bagunça! Entenda como organizar seus leads hoje mesmo. #vendas",
        media_type: "IMAGE",
        timestamp: new Date().toISOString()
      }
    } else {
      // Fetch from Meta Graph API
      const metaResponse = await fetch(`https://graph.facebook.com/v19.0/${integration.page_id}/media?fields=id,caption,media_type,media_url,timestamp&limit=1&access_token=${integration.access_token}`);
      const metaData = await metaResponse.json();
      
      if (metaData.data && metaData.data.length > 0) {
        lastPostData = metaData.data[0];
      } else {
        lastPostData = { caption: "Nenhum post encontrado no perfil.", media_type: "UNKNOWN" };
      }
    }

    if (!openAiKey) {
      // Retorna Mock direto se não houver OpenAI
      return new Response(JSON.stringify({
        last_post: {
          preview: lastPostData.caption ? lastPostData.caption.slice(0, 60) + "..." : "Sem legenda",
          time_ago: "Recentemente"
        },
        recommendation: {
          objective: "Vender",
          format: "Feed 4:5",
          pilar: "CRM",
          reason: "[MOCK IA] Como seu último post foi educativo, agora é hora de fazer uma oferta direta usando o fundo escuro para destacar a chamada de vendas.",
          theme: "Oferta de implantação de CRM B2B"
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 2. Inteligência Estratégica
    const systemPrompt = `
      Você é um Estrategista de Social Media nível Diretor do "Funil Comercial".
      Seu objetivo é analisar o ÚLTIMO post publicado no Instagram da marca e definir qual deve ser o PRÓXIMO post, garantindo CONTINUIDADE EDITORIAL e equilíbrio visual (grid).
      
      Regras de Negócio B2B:
      - Se o último post foi 'Educação', sugira 'Venda' ou 'Posicionamento'.
      - Se o último post foi 'Venda', sugira 'Educação'.
      - Mantenha variação de temas (CRM, WhatsApp, Gestão, Inteligência Artificial, Funil de Vendas).
      
      Você DEVE retornar um JSON estrito no seguinte formato:
      {
        "last_post_analysis": "breve resumo da sua leitura do último post (1 frase)",
        "recommendation": {
          "objective": "Educar" | "Vender" | "Posicionamento",
          "format": "Feed 4:5" | "Reels" | "Carrossel",
          "pilar": "CRM" | "WhatsApp" | "Gestão Comercial" | "Funil de Vendas" | "Inteligência Artificial",
          "theme": "um tema específico, ex: Como a IA aumenta vendas no WhatsApp",
          "reason": "Justificativa de alto nível para o usuário (ex: Como você educou a audiência ontem, hoje é hora de posicionamento forte)"
        }
      }
    `;

    const userPrompt = `
      DADOS DO ÚLTIMO POST:
      Data: ${lastPostData.timestamp || 'Desconhecida'}
      Formato: ${lastPostData.media_type || 'Desconhecido'}
      Legenda (Caption): "${lastPostData.caption || 'Sem legenda'}"
      
      Gere a estratégia para o próximo post agora.
    `;

    const result = await callOpenAI(systemPrompt, userPrompt, openAiKey);

    return new Response(
      JSON.stringify({
        last_post: {
          preview: lastPostData.caption ? lastPostData.caption.slice(0, 60) + "..." : "Visualizando post recente...",
          time_ago: "Última postagem"
        },
        recommendation: result.recommendation
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
