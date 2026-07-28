# Agregador de Links (`/l/:slug`) — Design

**Data:** 2026-07-12
**Status:** aprovado (brainstorming + mockup visual)

## Objetivo

Uma página de **agregador de links** (estilo "linktree") moderna e premium para a bio do Instagram do Funil Comercial — 2 destinos: **Diagnóstico no WhatsApp** (primário) e **Site — funilcomercial.com** (secundário) — com o objetivo de **aquisição/conversão** do cliente-ideal. A mesma estrutura é **config-driven** para virar um **produto** oferecido a clientes (cada cliente = uma config; um novo objeto, sem código novo).

## Decisões (do brainstorming)

1. **Escopo:** config-driven + slug (`/l/:slug`). FC é a primeira config (`/l/funilcomercial`). Multi-tenant com DB/admin fica para o futuro.
2. **Hero:** marca limpa e premium (logo + nome + tagline + 2 botões; ouro só no CTA).
3. **Tema:** **dark premium committed** (a página força seu próprio dark, independente do `data-theme` do app). Per-cliente/tema no futuro via config.
4. **Marca:** marca-funil em ouro (padrão); `avatarUrl` opcional por config (foto do cliente).

## Arquitetura

Puro front-end (sem banco, sem Edge Function). Rota pública nova.

### Config — `src/lib/aggregators.ts`
```ts
type AggregatorLink = { label; sublabel?; href; variant: "primary"|"secondary"; icon?: "whatsapp"|"globe"|"link" };
type AggregatorConfig = { slug; name; tagline?; avatarUrl?; status?; footer?; footerHighlight?; links: AggregatorLink[] };
export const AGGREGATORS: Record<string, AggregatorConfig>;  // FC = "funilcomercial"
export const getAggregator(slug?): AggregatorConfig | undefined;
```
FC: WhatsApp `wa.me/5551992568861` (com mensagem pronta) + `funilcomercial.com`; status "Disponível para diagnóstico"; footer "Presença · Aquisição · Conversão · Escala" (Conversão em ouro).

### Página — `src/pages/LinkAggregator.tsx`
- `useParams()` → slug → `getAggregator`. Sem config → "não encontrado" minimalista (link p/ funilcomercial.com).
- Renderiza: marca (funil ouro em anel, ou `avatarUrl`), nome, tagline, selo de status (ponto esmeralda pulsante), botões (primário ouro / secundário contorno, com ícone + sub-rótulo + seta), rodapé-sussurro. Estilos **escopados** (`.agg-*`, `<style>` no componente) com cores dark hardcoded — não herda o tema do app. Animações `rise`/`pulse` + `prefers-reduced-motion` + `focus-visible`.

### Rota + gate — `src/App.tsx` (WIP-isolado com `git stash`)
- Import `LinkAggregatorPage`; `<Route path="/l/:slug" element={<LinkAggregatorPage />} />` no bloco público.
- `isPublicPath` ganha `pathname.startsWith("/l/")` para a página ser acessível **sem login** (gate de render + guard de auth).

## Arquivos
- **Criar:** `src/lib/aggregators.ts`, `src/pages/LinkAggregator.tsx`
- **Modificar:** `src/App.tsx` (rota + gate; isolar da WIP)

## Fora do escopo (v1)
Multi-tenant com DB/admin no CRM, temas por cliente além do dark, mais de 2 links, analytics de clique.
