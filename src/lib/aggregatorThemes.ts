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
