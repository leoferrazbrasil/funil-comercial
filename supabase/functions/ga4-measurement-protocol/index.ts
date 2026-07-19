import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const GA4_MEASUREMENT_ID = Deno.env.get("GA4_MEASUREMENT_ID") || "G-NSMD6MKLMK";
const GA4_API_SECRET = Deno.env.get("GA4_API_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Trata requisição OPTIONS para CORS (preflight)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!GA4_API_SECRET) {
      throw new Error("GA4_API_SECRET environment variable is missing.");
    }

    const { client_id, event_name, value, currency, timestamp_micros } = await req.json();

    if (!client_id || !event_name) {
      throw new Error("Missing required fields: client_id and event_name are mandatory.");
    }

    const eventParams: Record<string, any> = {};
    
    if (value !== undefined) {
      eventParams.value = Number(value);
    }
    if (currency !== undefined) {
      eventParams.currency = currency;
    }

    const payload: Record<string, any> = {
      client_id: client_id,
      events: [
        {
          name: event_name,
          params: eventParams,
        },
      ],
    };

    if (timestamp_micros) {
        payload.timestamp_micros = timestamp_micros;
    }

    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;

    const gaRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // GA4 measurement protocol always returns 2xx even if payload is invalid, 
    // unless there is a severe server issue. But we check it anyway.
    if (!gaRes.ok) {
      const text = await gaRes.text();
      console.error("GA4 Error:", text);
      throw new Error(`GA4 API error: ${gaRes.status} ${text}`);
    }

    return new Response(JSON.stringify({ success: true, event: event_name }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
