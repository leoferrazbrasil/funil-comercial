// Presets de tema do agregador (produto). Cada preset é uma paleta testada
// (contraste/hover) exposta como CSS vars --agg-*, aplicadas no container da
// página /l/:slug. Para adicionar um tema: mais um objeto aqui.

export type AggregatorTheme = {
  id: string;
  name: string;
  /** Amostra p/ o swatch do admin (fundo + accent). */
  swatch: { bg: string; accent: string };
  /** CSS vars --agg-* setadas no .agg-stage (via style inline). */
  vars: Record<string, string>;
};

export const AGGREGATOR_THEMES: AggregatorTheme[] = [
  {
    id: "funil",
    name: "Funil · Preto & Ouro",
    swatch: { bg: "#060606", accent: "#f5b417" },
    vars: {
      "--agg-bg": "#060606",
      "--agg-text": "#f6f7f8",
      "--agg-muted": "#9aa1ad",
      "--agg-line": "rgba(255,255,255,0.10)",
      "--agg-line-strong": "rgba(255,255,255,0.16)",
      "--agg-surface": "rgba(255,255,255,0.035)",
      "--agg-accent": "#f5b417",
      "--agg-accent-2": "#ffd35a",
      "--agg-accent-text": "#17130a",
      "--agg-accent-shadow": "rgba(245,180,23,0.60)",
      "--agg-status": "#34d399",
      "--agg-status-soft": "rgba(52,211,153,0.50)",
      "--agg-funnel-1": "#ffd35a",
      "--agg-funnel-2": "#f5b417",
      "--agg-glow-a": "rgba(245,180,23,0.16)",
      "--agg-glow-b": "rgba(52,211,153,0.10)",
      "--agg-method": "#6a7078",
      "--agg-method-hi": "#f5b417",
      "--agg-focus": "#ffd35a",
    },
  },
  {
    id: "grafite-esmeralda",
    name: "Grafite & Esmeralda",
    swatch: { bg: "#0b0f0d", accent: "#10b981" },
    vars: {
      "--agg-bg": "#0b0f0d",
      "--agg-text": "#f4f7f5",
      "--agg-muted": "#9db0a6",
      "--agg-line": "rgba(255,255,255,0.10)",
      "--agg-line-strong": "rgba(255,255,255,0.16)",
      "--agg-surface": "rgba(255,255,255,0.04)",
      "--agg-accent": "#10b981",
      "--agg-accent-2": "#34d399",
      "--agg-accent-text": "#04241b",
      "--agg-accent-shadow": "rgba(16,185,129,0.55)",
      "--agg-status": "#fbbf24",
      "--agg-status-soft": "rgba(251,191,36,0.50)",
      "--agg-funnel-1": "#34d399",
      "--agg-funnel-2": "#10b981",
      "--agg-glow-a": "rgba(16,185,129,0.16)",
      "--agg-glow-b": "rgba(52,211,153,0.08)",
      "--agg-method": "#7c8a82",
      "--agg-method-hi": "#34d399",
      "--agg-focus": "#34d399",
    },
  },
  {
    id: "claro-premium",
    name: "Claro Premium",
    swatch: { bg: "#f4f5f3", accent: "#f5b417" },
    vars: {
      "--agg-bg": "#f4f5f3",
      "--agg-text": "#1a1f2b",
      "--agg-muted": "#5b6472",
      "--agg-line": "rgba(0,0,0,0.08)",
      "--agg-line-strong": "rgba(0,0,0,0.14)",
      "--agg-surface": "rgba(0,0,0,0.03)",
      "--agg-accent": "#f5b417",
      "--agg-accent-2": "#ffcf4d",
      "--agg-accent-text": "#1a1f2b",
      "--agg-accent-shadow": "rgba(245,180,23,0.40)",
      "--agg-status": "#059669",
      "--agg-status-soft": "rgba(5,150,105,0.45)",
      "--agg-funnel-1": "#ffcf4d",
      "--agg-funnel-2": "#f5b417",
      "--agg-glow-a": "rgba(245,180,23,0.14)",
      "--agg-glow-b": "rgba(5,150,105,0.08)",
      "--agg-method": "#8a93a0",
      "--agg-method-hi": "#b07d0a",
      "--agg-focus": "#d99a00",
    },
  },
  {
    id: "azul-confianca",
    name: "Azul Confiança",
    swatch: { bg: "#0a1220", accent: "#3b82f6" },
    vars: {
      "--agg-bg": "#0a1220",
      "--agg-text": "#eef2f8",
      "--agg-muted": "#93a0b5",
      "--agg-line": "rgba(255,255,255,0.10)",
      "--agg-line-strong": "rgba(255,255,255,0.16)",
      "--agg-surface": "rgba(255,255,255,0.04)",
      "--agg-accent": "#3b82f6",
      "--agg-accent-2": "#60a5fa",
      "--agg-accent-text": "#06122b",
      "--agg-accent-shadow": "rgba(59,130,246,0.50)",
      "--agg-status": "#34d399",
      "--agg-status-soft": "rgba(52,211,153,0.50)",
      "--agg-funnel-1": "#60a5fa",
      "--agg-funnel-2": "#3b82f6",
      "--agg-glow-a": "rgba(59,130,246,0.16)",
      "--agg-glow-b": "rgba(52,211,153,0.08)",
      "--agg-method": "#6b7a92",
      "--agg-method-hi": "#60a5fa",
      "--agg-focus": "#60a5fa",
    },
  },
];

export const getTheme = (id?: string | null): AggregatorTheme =>
  AGGREGATOR_THEMES.find((t) => t.id === id) ?? AGGREGATOR_THEMES[0];

// --- Tema PERSONALIZADO derivado das cores da marca do cliente -------------
// Usado quando o /bio é gerado a partir da identidade extraída do site do
// cliente. A partir de {accent, bg?, text?} deriva toda a paleta --agg-*.

export type CustomThemeInput = { accent: string; bg?: string; text?: string };

type RGB = [number, number, number];
const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
const hexToRgb = (hex: string): RGB => {
  let h = (hex || "").replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return [245, 180, 23];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (r: number, g: number, b: number) =>
  "#" + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("");
const lum = ([r, g, b]: RGB) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const rgba = ([r, g, b]: RGB, a: number) => `rgba(${clamp(r)},${clamp(g)},${clamp(b)},${a})`;

export function buildCustomTheme(input: CustomThemeInput): AggregatorTheme {
  const WHITE: RGB = [255, 255, 255];
  const accent = /^#?[0-9a-fA-F]{3,6}$/.test(input.accent || "") ? input.accent : "#f5b417";
  const accentRgb = hexToRgb(accent);
  const bg = input.bg && /^#?[0-9a-fA-F]{3,6}$/.test(input.bg) ? input.bg : "#0a0b0d";
  const bgRgb = hexToRgb(bg);
  const dark = lum(bgRgb) < 0.5;
  const fg: RGB = dark ? WHITE : [12, 14, 20];
  const text = input.text && /^#?[0-9a-fA-F]{3,6}$/.test(input.text) ? input.text : toHex(...fg);
  const textRgb = hexToRgb(text);
  const accent2 = toHex(...mix(accentRgb, WHITE, 0.28));
  const accentText = lum(accentRgb) > 0.55 ? "#141210" : "#ffffff";

  return {
    id: "custom",
    name: "Personalizado",
    swatch: { bg, accent },
    vars: {
      "--agg-bg": bg,
      "--agg-text": text,
      "--agg-muted": toHex(...mix(textRgb, bgRgb, 0.42)),
      "--agg-line": rgba(fg, 0.1),
      "--agg-line-strong": rgba(fg, 0.16),
      "--agg-surface": rgba(fg, 0.04),
      "--agg-accent": accent,
      "--agg-accent-2": accent2,
      "--agg-accent-text": accentText,
      "--agg-accent-shadow": rgba(accentRgb, 0.55),
      "--agg-status": "#34d399",
      "--agg-status-soft": "rgba(52,211,153,0.50)",
      "--agg-funnel-1": accent2,
      "--agg-funnel-2": accent,
      "--agg-glow-a": rgba(accentRgb, 0.16),
      "--agg-glow-b": rgba(accentRgb, 0.07),
      "--agg-method": toHex(...mix(textRgb, bgRgb, 0.62)),
      "--agg-method-hi": accent,
      "--agg-focus": accent2,
    },
  };
}

// Resolve o tema a usar: preset por id, ou personalizado se theme === "custom".
export const resolveAggregatorTheme = (
  theme?: string | null,
  custom?: CustomThemeInput | null,
): AggregatorTheme => (theme === "custom" && custom ? buildCustomTheme(custom) : getTheme(theme));
