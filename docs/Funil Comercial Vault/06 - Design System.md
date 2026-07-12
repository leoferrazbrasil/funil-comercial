---
title: Design System
aliases:
  - Design System
  - Tema
  - Paleta
  - Tokens
tags:
  - funil-comercial/arquitetura
  - funil-comercial/design
date: 2026-07-11
---

# 🎨 Design System

> [!abstract] Sobre esta nota
> Como o tema, as cores e os componentes visuais funcionam no código. Para a **marca** (voz, uso do logo, cores institucionais), ver o site em [funilcomercial.com/brandbook](https://funilcomercial.com/brandbook) e as notas de [[Linha_Editorial_Funil_Comercial|Linha Editorial]] / [[Diretrizes_Publicacao_5W2H|5W2H]]. Índice em [[00 - Inicio]].

## Arquitetura híbrida (duas camadas)

O visual do app vive em **duas camadas** de estilo, ambas **theme-aware** por `data-theme` (`light`/`dark`) no `<html>` (alternado em `App.tsx`, persistido no `localStorage`):

| Camada | Onde | Cobre |
|---|---|---|
| **Tailwind** | `src/index.css` (tokens HSL shadcn, light + dark) + `tailwind.config.js` | Páginas e componentes React (a maior parte novo) |
| **CSS legado** | `src/styles.css` consumindo `src/styles/tokens.css` | Shell (`.shell`/`.sidebar`/`.topbar`/`.workspace`), login, modais e cards clássicos (`.metric-card`, `.opportunity-card`…) |

> [!tip] Duas paletas claras — manter em sincronia
> A paleta clara existe em **dois lugares**: os tokens semânticos de `tokens.css` (`--fc-*`, com aliases `--bg`/`--surface`/…) e os tokens HSL de `index.css`. Ao mexer no tema claro, ajustar **os dois** (mesmos hex, um em HSL). Foram calibrados para leitura suave (nada de branco puro; texto "ink" azulado dessaturado `#2a3a55`; WCAG AA).

## Idioma theme-aware (regra de ouro no Tailwind)

Para uma classe **inverter** com o tema, usar tokens semânticos em vez de cores fixas do idioma dark:

- `bg-white/N` (overlay dark) → **`bg-foreground/N`** (inverte)
- `border-white/N` → **`border-border`**
- `bg-black/N` → `bg-foreground/N` (reduzido)
- `text-white` (chrome) → **`text-foreground`**

> [!warning] Débito: "classes dark hardcoded"
> Muito código legado usava `white/N`, `bg-black/…`, `text-white` fixos — bom no dark, agressivo no light. Um passe já converteu ~12 arquivos (Inbox, Contacts, Leads, Dashboard, Pipeline, Campaigns, etc.), mas **pode haver resíduo** em telas menos tocadas. Ao editar uma tela, aproveitar para converter o que sobrou.

## Animações

`src/index.css` define **`fc-fade-in`** e **`fc-reveal`** (fade + slide-down suave, respeitando `prefers-reduced-motion`). Usadas no wizard do `/criativos` e no `/roteiro`.

> [!danger] `tailwindcss-animate` NÃO está instalado
> Classes `animate-in`, `slide-in-from-*`, `fade-in` (do plugin) aparecem espalhadas no código mas **não geram CSS** — são no-ops decorativos. Para animação real, usar as classes `fc-*` (ou adicionar o plugin, se um dia for desejado). `animate-spin`/`animate-pulse` são built-in do Tailwind e funcionam.

## Exceção: o canvas do `/criativos`

A arte gerada no estúdio (`Creatives.tsx`, templates `Template1/4/12`) tem **tema próprio** com **hex literais** (`#09090B` dark, `#FAF9F6` light, `#121214`). É o "tema da peça", independente do tema do app — **não** aplicar o idioma theme-aware ali (passes de light-mode devem proteger essa região).

## Cores da marca (institucional)

Preto `#000000` (base/autoridade) · Ouro/Amarelo `#FFD700` (destaque/CTA) · Grafite `#111111` (fundos técnicos) · Branco (respiro). No app, o **primary** é o âmbar (`43 96% 56%`) e o **accent** é o **verde-esmeralda** (`--fc-color-emerald-*`, ~`#059669`/`#34d399`) — crescimento/confiança/resultado. O accent **era teal-ciano** (herança do posicionamento SaaS) e foi trocado ao realinhar a marca ao público de negócios locais (autoridade do preto + prosperidade do ouro + crescimento do verde). Detalhe da doutrina de cor no Brandbook.

## Onde ficam os tokens

- `src/styles/tokens.css` — primitivos (`--fc-color-*`, radius, space) + semânticos light/dark + aliases de compatibilidade para o `styles.css`.
- `src/index.css` — `@tailwind` + tokens HSL (`--background`, `--foreground`, `--primary`…) light/dark + animações `fc-*`.
- `tailwind.config.js` — mapeia as cores para as CSS vars; fonte **Inter**.
