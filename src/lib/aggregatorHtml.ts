// Gerador do agregador ESTÁTICO (/bio) — produz um index.html autocontido para
// instalar no diretório do site de cada cliente (ex.: clinicaaurora.com.br/bio).
// Sem dependência de runtime: CSS/ícones inline, dados e tema embutidos.
// O CSS (.agg-*) é a fonte única, compartilhado com a página React LinkAggregator.

import { getTheme } from "./aggregatorThemes";
import type { AggregatorLink, AggregatorLinkIcon } from "./aggregators";

export const AGG_CSS = `
.agg-stage {
  min-height: 100dvh; display: grid; place-items: center; padding: 40px 20px;
  background: var(--agg-bg); color: var(--agg-text);
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased; position: relative; overflow: hidden;
}
.agg-glow {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(60% 42% at 50% -8%, var(--agg-glow-a), transparent 70%),
    radial-gradient(48% 40% at 50% 108%, var(--agg-glow-b), transparent 70%);
}
.agg-card {
  position: relative; width: 100%; max-width: 420px; text-align: center;
  display: flex; flex-direction: column; align-items: center;
  animation: agg-rise 0.6s cubic-bezier(0.16,1,0.3,1) both;
}
.agg-mark {
  width: 76px; height: 76px; border-radius: 22px; display: grid; place-items: center;
  background: var(--agg-surface); border: 1px solid var(--agg-line-strong);
  box-shadow: 0 14px 40px -18px var(--agg-accent-shadow); margin-bottom: 22px; overflow: hidden;
}
.agg-mark svg { width: 38px; height: 38px; display: block; }
.agg-mark img { width: 100%; height: 100%; object-fit: cover; }
.agg-name { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; text-wrap: balance; }
.agg-tagline { margin: 8px 0 0; color: var(--agg-muted); font-size: 15px; line-height: 1.5; max-width: 30ch; }
.agg-status {
  display: inline-flex; align-items: center; gap: 8px; margin: 18px 0 26px;
  font-size: 12.5px; font-weight: 600; color: var(--agg-text);
  padding: 6px 12px; border: 1px solid var(--agg-line); border-radius: 999px; background: var(--agg-surface);
}
.agg-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--agg-status); animation: agg-pulse 2s ease-out infinite; }
.agg-links { width: 100%; display: flex; flex-direction: column; gap: 14px; }
.agg-btn {
  display: flex; align-items: center; gap: 14px; width: 100%; padding: 0 18px; height: 62px;
  border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 15px;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
  animation: agg-rise 0.6s cubic-bezier(0.16,1,0.3,1) both;
}
.agg-btn .agg-ic { width: 26px; height: 26px; flex: 0 0 26px; display: grid; place-items: center; }
.agg-btn .agg-ic svg { width: 24px; height: 24px; }
.agg-btn .agg-txt { flex: 1; text-align: left; display: flex; flex-direction: column; line-height: 1.2; }
.agg-btn .agg-txt small { font-weight: 500; font-size: 12px; opacity: 0.72; margin-top: 3px; }
.agg-btn .agg-arrow { flex: 0 0 auto; opacity: 0.55; transition: transform .18s ease, opacity .18s ease; }
.agg-btn:hover .agg-arrow { transform: translateX(3px); opacity: 0.9; }
.agg-btn-primary {
  background: linear-gradient(135deg, var(--agg-accent-2), var(--agg-accent)); color: var(--agg-accent-text);
  box-shadow: 0 16px 34px -14px var(--agg-accent-shadow); animation-delay: .08s;
}
.agg-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 22px 44px -14px var(--agg-accent-shadow); }
.agg-btn-secondary {
  background: var(--agg-surface); border: 1px solid var(--agg-line-strong); color: var(--agg-text); animation-delay: .16s;
}
.agg-btn-secondary:hover { transform: translateY(-2px); border-color: var(--agg-muted); }
.agg-method {
  margin-top: 30px; font-size: 10.5px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--agg-method); font-weight: 600; animation: agg-rise 0.6s cubic-bezier(0.16,1,0.3,1) .24s both;
}
.agg-method b { color: var(--agg-method-hi); font-weight: 700; }
.agg-btn:focus-visible { outline: 2px solid var(--agg-focus); outline-offset: 3px; }
.agg-nf { color: var(--agg-muted); font-size: 15px; }
.agg-nf a { color: var(--agg-accent); font-weight: 700; }
.agg-spinner {
  width: 26px; height: 26px; border-radius: 50%;
  border: 3px solid var(--agg-line-strong); border-top-color: var(--agg-accent);
  animation: agg-spin .8s linear infinite;
}
@keyframes agg-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes agg-spin { to { transform: rotate(360deg); } }
@keyframes agg-pulse {
  0% { box-shadow: 0 0 0 0 var(--agg-status-soft); }
  70% { box-shadow: 0 0 0 7px rgba(0,0,0,0); }
  100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
}
@media (prefers-reduced-motion: reduce) {
  .agg-card, .agg-btn, .agg-method, .agg-dot, .agg-spinner { animation: none; }
}`;

export type BioData = {
  name: string;
  tagline?: string;
  avatarUrl?: string;
  status?: string;
  footer?: string;
  footerHighlight?: string;
  theme?: string;
  links: AggregatorLink[];
};

const esc = (s?: string): string =>
  (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

// href precisa manter & literais (query da mensagem do WhatsApp); só escapa aspas.
const escAttr = (s?: string): string => (s ?? "").replace(/"/g, "&quot;");

const iconSvg = (icon?: AggregatorLinkIcon): string => {
  if (icon === "whatsapp") {
    return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.13c-.24.68-1.42 1.32-1.95 1.36-.5.04-.95.23-3.2-.67-2.7-1.07-4.42-3.83-4.55-4.01-.13-.18-1.1-1.46-1.1-2.78 0-1.32.69-1.97.94-2.24.24-.27.53-.33.7-.33.18 0 .35 0 .5.01.16.01.38-.06.6.46.24.55.8 1.9.87 2.04.07.13.12.29.02.47-.09.18-.14.29-.27.45-.13.16-.28.35-.4.47-.13.13-.27.28-.12.54.16.27.7 1.15 1.5 1.86 1.03.92 1.9 1.2 2.17 1.34.27.13.42.11.58-.07.16-.18.67-.78.85-1.05.18-.27.35-.22.6-.13.24.09 1.55.73 1.82.86.27.13.44.2.5.31.07.11.07.63-.17 1.32Z"/></svg>`;
  }
  if (icon === "globe") {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>`;
};

const ARROW_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

const funnelSvg = (): string =>
  `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><defs><linearGradient id="aggFunnel" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse"><stop stop-color="var(--agg-funnel-1)"/><stop offset="1" stop-color="var(--agg-funnel-2)"/></linearGradient></defs><path d="M7 9.5 H41 L28.5 26 V37 L19.5 41.5 V26 Z" fill="url(#aggFunnel)"/></svg>`;

const linkHtml = (l: AggregatorLink): string => `
      <a class="agg-btn agg-btn-${l.variant === "primary" ? "primary" : "secondary"}" href="${escAttr(l.href)}" target="_blank" rel="noopener noreferrer">
        <span class="agg-ic">${iconSvg(l.icon)}</span>
        <span class="agg-txt">${esc(l.label)}${l.sublabel ? `<small>${esc(l.sublabel)}</small>` : ""}</span>
        <span class="agg-arrow">${ARROW_SVG}</span>
      </a>`;

const footerHtml = (footer: string, highlight?: string): string => {
  if (!highlight || !footer.includes(highlight)) return esc(footer);
  const [before, after] = footer.split(highlight);
  return `${esc(before)}<b>${esc(highlight)}</b>${esc(after)}`;
};

// Documento HTML completo e autocontido para instalar como /bio/index.html.
export function renderBioHtml(data: BioData): string {
  const theme = getTheme(data.theme);
  const styleVars = Object.entries(theme.vars).map(([k, v]) => `${k}:${v}`).join(";");
  const mark = data.avatarUrl ? `<img src="${escAttr(data.avatarUrl)}" alt="${esc(data.name)}">` : funnelSvg();
  const validLinks = data.links.filter((l) => l.href.trim() && l.label.trim());

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(data.name)}</title>
<style>html,body{margin:0;padding:0;background:${theme.vars["--agg-bg"]};}${AGG_CSS}</style>
</head>
<body>
<main class="agg-stage" style="${styleVars}">
  <div class="agg-glow"></div>
  <section class="agg-card">
    <div class="agg-mark">${mark}</div>
    <h1 class="agg-name">${esc(data.name)}</h1>
    ${data.tagline ? `<p class="agg-tagline">${esc(data.tagline)}</p>` : ""}
    ${data.status ? `<div class="agg-status"><span class="agg-dot"></span> ${esc(data.status)}</div>` : ""}
    <nav class="agg-links" aria-label="Links">${validLinks.map(linkHtml).join("")}
    </nav>
    ${data.footer ? `<p class="agg-method">${footerHtml(data.footer, data.footerHighlight)}</p>` : ""}
  </section>
</main>
</body>
</html>`;
}
