import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

async function callGemini(systemPrompt: string, userPrompt: string, key: string) {
  const combinedPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }],
      generationConfig: { 
        response_mime_type: "application/json",
        temperature: 0.7
      }
    }),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || `Gemini returned status ${response.status}`);
  }

  const content = data.candidates[0].content.parts[0].text;
  return JSON.parse(content);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { objective, pilar, format, idea } = await req.json();
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    const geminiKey = Deno.env.get('GEMINI_API_KEY');

    // Se não tiver nenhuma chave, enviamos um Mock (Fallback)
    if (!openAiKey && !geminiKey) {
      console.warn("No API Keys configured. Returning mock data.");
      return new Response(
        JSON.stringify({
          headline: `COMO ORGANIZAR\\nSEUS LEADS EM\\nUM SÓ LUGAR.`,
          subheadline: `[MOCK] O pilar é ${pilar} e o objetivo é ${objective}.`,
          highlight_word: `LEADS`,
          footer_tags: `${pilar.toUpperCase()} + INTELIGÊNCIA`,
          caption: `Atenção: Esta é uma copy de teste porque as API Keys (OpenAI e Gemini) não estão configuradas no backend. Para que a IA funcione de verdade, você precisa rodar:\n\nnpx supabase secrets set OPENAI_API_KEY=sua_chave\n\nMas a sua ideia era: ${idea}`,
          recommended_template_id: 't1'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const systemPrompt = `
      Você é um especialista em Social Media e Copywriting do "Funil Comercial", uma ferramenta B2B.
      O seu tom de voz é: direto, profissional, estratégico, didático e orientado a resultado.
      Nunca faça promessas irreais ou use jargões comerciais exagerados.
      
      Você vai receber os parâmetros de um post de Instagram.
      Retorne APENAS um JSON válido seguindo esta estrutura (sem formatação markdown como \`\`\`json):
      {
        "headline": "Título principal curto (use \\n para quebrar linha se tiver mais de 4 palavras)",
        "subheadline": "Frase de apoio ou subtítulo explicando a headline (1 a 2 linhas curtas)",
        "highlight_word": "A palavra mais importante da headline (exata) para destacarmos com a cor primária da marca",
        "footer_tags": "2 ou 3 palavras curtas separadas por +, ex: VENDAS + CRM + IA",
        "caption": "A legenda completa do post, contendo gancho, desenvolvimento, chamada pra ação (CTA) e hashtags (sempre incluindo #funilcomercial)",
        "recommended_template_id": "t1" // Escolha entre: "t1" (Posicionamento/Impacto), "t4" (Lista/Passo a Passo), "t12" (Prova Social / Frase aspas)
      }
    `;

    const userPrompt = `
      Objetivo do Post: ${objective}
      Pilar Editorial: ${pilar}
      Formato do Post: ${format}
      Ideia do Cliente: "${idea}"
      
      Escreva a copy perfeita seguindo nossa estrutura B2B e retorne APENAS o JSON.
    `;

    let jsonResult = null;
    let errors = [];

    // Tentativa 1: OpenAI (Se chave existir)
    if (openAiKey) {
      try {
        jsonResult = await callOpenAI(systemPrompt, userPrompt, openAiKey);
      } catch (err: any) {
        console.error("OpenAI Fallback Triggered:", err.message);
        errors.push(`OpenAI: ${err.message}`);
      }
    }

    // Tentativa 2: Gemini (Se OpenAI falhou ou chave não existe, e chave Gemini existe)
    if (!jsonResult && geminiKey) {
      try {
        jsonResult = await callGemini(systemPrompt, userPrompt, geminiKey);
      } catch (err: any) {
        console.error("Gemini Fallback Triggered:", err.message);
        errors.push(`Gemini: ${err.message}`);
      }
    }

    // Se ambas falharam
    if (!jsonResult) {
      throw new Error(`Ambas as IAs falharam. Log: ${errors.join(" | ")}`);
    }

    return new Response(
      JSON.stringify(jsonResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
