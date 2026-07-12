// bio-extract — extrai a identidade (nome, cor de marca, logo) do site do cliente,
// server-side (o navegador não lê sites de terceiros por CORS). Chamado pelo admin
// /agregadores para auto-preencher o agregador. Best-effort e defensivo: em falha,
// responde 200 com { error } para o front mostrar uma mensagem amigável.

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const abs = (base: string, href: string): string => {
  try { return new URL(href, base).toString(); } catch { return href; }
};

const pickMeta = (html: string, patterns: RegExp[]): string | null => {
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return m[1].trim();
  }
  return null;
};

// "Marca | tagline" / "Marca - tagline" -> "Marca"
const cleanName = (s: string): string => {
  const first = s.split(/\s+[|–—-]\s+/)[0].trim();
  return (first || s).slice(0, 60);
};

const hexToRgb = (h: string): [number, number, number] => {
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const sat = ([r, g, b]: [number, number, number]): number => {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return mx === 0 ? 0 : (mx - mn) / mx;
};

// Cor de marca por frequência: ignora quase-preto/branco/cinza (baixa saturação).
const dominantAccent = (html: string): string | null => {
  const counts = new Map<string, number>();
  const re = /#([0-9a-fA-F]{6})\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const hex = m[1].toLowerCase();
    const rgb = hexToRgb(hex);
    const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
    if (sat(rgb) < 0.35 || lum < 0.12 || lum > 0.9) continue;
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  let best: string | null = null, bestN = 0;
  for (const [hex, n] of counts) if (n > bestN) { bestN = n; best = hex; }
  return best ? "#" + best : null;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { url } = await req.json().catch(() => ({ url: "" }));
    if (!url || typeof url !== "string") return json({ error: "URL ausente" }, 400);

    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) target = "https://" + target;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);
    const res = await fetch(target, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FunilComercialBio/1.0)" },
    }).finally(() => clearTimeout(timer));

    if (!res.ok) return json({ error: `O site respondeu ${res.status}.` });

    const finalUrl = res.url || target;
    let html = await res.text();
    if (html.length > 800_000) html = html.slice(0, 800_000);

    const name = cleanName(
      pickMeta(html, [
        /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i,
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
        /<title[^>]*>([^<]+)<\/title>/i,
      ]) ?? "",
    );

    const themeColor = pickMeta(html, [
      /<meta[^>]+name=["']theme-color["'][^>]+content=["'](#[0-9a-fA-F]{3,6})["']/i,
      /<meta[^>]+content=["'](#[0-9a-fA-F]{3,6})["'][^>]+name=["']theme-color["']/i,
    ]);
    const accent = themeColor ?? dominantAccent(html);

    const logoRaw = pickMeta(html, [
      /<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/i,
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i,
    ]);
    const logoUrl = logoRaw ? abs(finalUrl, logoRaw) : null;

    const wa = html.match(/https?:\/\/(?:wa\.me|api\.whatsapp\.com)\/[^"'\s<>]+/i);

    return json({
      name: name || null,
      accent: accent || null,
      logoUrl,
      whatsapp: wa ? wa[0] : null,
    });
  } catch (e) {
    return json({ error: "Não foi possível acessar o site: " + (e instanceof Error ? e.message : String(e)) });
  }
});
