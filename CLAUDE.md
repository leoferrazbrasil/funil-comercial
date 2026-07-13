# CLAUDE.md — Mapa do Funil Comercial

Mapa conciso para agentes. Profundidade fica no **cofre** (`docs/Funil Comercial Vault/`, notas 00–07) — leia sob demanda, não copie para cá. O `README.md` da raiz está **desatualizado** (descreve um "protótipo"); ignore-o como fonte.

## O que é

**Funil Comercial** é a **empresa** de estrutura de vendas para negócios locais (não "agência de marketing") — entrega presença, aquisição, conversão e escala (4 camadas). Este repo é a **plataforma** da empresa: site institucional + Brandbook + o **CRM** (o software próprio, a camada de **Conversão**) + ferramentas (Criativos, Roteiro, Campanhas). Ou seja: **Funil Comercial = a empresa; o CRM = um produto/software dela** — não confundir. SPA React 19 + Supabase; deploy automático no push da `main` (Hostinger builda `dist/`).

## Stack

- **Front:** React 19 + TypeScript + Vite 8 (rolldown), React Router (SPA), Tailwind 3.
- **Back:** Supabase — Postgres + RLS, Auth, Realtime, Edge Functions (Deno).
- **Integrações:** Meta Cloud API (WhatsApp oficial) e Z-API (não-oficial), selecionáveis; Meta Graph (Instagram); OpenAI/Gemini (IA de criativos).
- **Projeto Supabase (prod):** `juvwfxnlusrnvcarkrmc`.

## Rotas (`src/App.tsx`)

- **Privadas:** `/dashboard` `/inbox` `/contatos` `/leads` `/funil` `/campanhas` `/criativos` `/roteiro` `/agregadores` `/perfil` `/configuracoes`. **Acesso por ÁREA** em `src/lib/accessControl.ts`: **comercial** (dashboard/inbox/contatos/leads/funil) vs **marketing** (campanhas/criativos/roteiro/agregadores). Papéis: **admin** = tudo (operador técnico, ex-`diretor`); **gestor**/**vendedor** = só comercial. Bloqueio em 2 camadas: menu (`visibleNavItems`) + `guardRoute` nas rotas (URL direta → `/dashboard`).
- **Públicas (sem sessão):** `/` `/crm` `/brandbook` `/privacidade` `/termos` `/exclusao-de-dados` + previews de prospecção. Lista em `PUBLIC_PATHS` (App.tsx) — usada no gate de render e no guard de auth; manter em sincronia.

## Dados (RLS `for all` com `auth.uid() = owner_id` em tudo)

`contacts` · `leads` (→contacts) · `opportunities` (→leads, tem `produto`) · `pipeline_stages` · `inbox_messages` · `integration_channels` · `campaigns`/`campaign_recipients` · `profiles` (`role`, `admin_id`) · `conversation_assignments` (handoff) · `editorial_queue` (roteiro). FKs de exclusão usam `ON DELETE SET NULL` (excluir só desvincula). Detalhe em `02 - Arquitetura e Design` e `05 - API e Edge Functions`.

## Edge Functions (Deno) — deploy manual, ver gotcha abaixo

`whatsapp-inbound` (webhook, jwt off) · `whatsapp-send` (texto+template, Meta/Z-API) · `whatsapp-templates` · `whatsapp-manager`/`whatsapp-qr-inbound` · `campaign-runner` (cron, jwt off) · `team-create-member` · `meta-auth`/`meta-publish` · `ai-generate-post`/`ai-recommend-post` (criativos) · `evolution-proxy`. Referência completa em `05 - API e Edge Functions`.

## Design system (híbrido — cuidado)

Duas camadas de tema, **theme-aware** por `data-theme` no `<html>`:
- **Tailwind** (páginas/componentes): tokens HSL em `src/index.css` (light + dark). Config em `tailwind.config.js` (cores vêm das CSS vars). Idioma theme-aware: use `foreground/N` (não `white/N`), `border-border`, `bg-foreground/N`.
- **CSS legado** (shell/login/modais/cards): `src/styles.css` consumindo tokens semânticos de `src/styles/tokens.css` (light + dark, aliases `--bg`/`--surface`/…).
- `src/index.css` também define as animações `fc-fade-in`/`fc-reveal` — **o plugin `tailwindcss-animate` NÃO está instalado**, então classes `animate-in slide-in-*` espalhadas pelo código **não geram CSS** (no-ops).
- O canvas do `/criativos` tem **tema próprio** (hex literais) — não aplicar o theme-aware nele.

Detalhe e o débito de "classes dark hardcoded" em `06 - Design System`.

## Gotchas (custam caro se ignorados)

- **Deploy de Edge Function bloqueado** neste ambiente (403). O dono deploya e **aplica migrações colando o SQL** (o conteúdo, não o caminho — colar o caminho dá `42601`).
- **WIP de prospecção não commitada** em `src/App.tsx` e `src/styles.css` (+ arquivos untracked `prospeccao-*`, `ProspectingPreview.tsx`, `prospectingPreviews.ts`). **Nunca commitar.** Ao editar App.tsx/styles.css, isolar com `git stash` (ver memória).
- **Envio Meta:** texto livre só na janela de **24h**; 1º contato exige **template**. Templates não entregam hoje por **pagamento da WABA** (`131042`) — pendência do dono, não é bug de código.
- **Segredos** colados no chat nunca devem ser reproduzidos; precisam ser rotacionados.
- Mudança de front só aparece após o build do host (push). Banco exige migração aplicada. Função exige deploy.

## Convenções

- Responder e comentar em **pt-BR** (acentuação correta), tom direto.
- CRUD e acesso ao Supabase centralizados em `src/lib/crmService.ts` (usa `requireSupabase()`).
- Pilares editoriais: registro único em `src/lib/editorialPillars.ts` (usado por `/criativos` e `/roteiro`).

## Base de conhecimento

`MEMORY.md` (fatos/prefs, auto) · este `CLAUDE.md` (mapa, auto) · **cofre** `docs/Funil Comercial Vault/` (00–07, sob demanda) · **Graphify** opcional: `/graphify .` para grafo do código (estrutura/chamadas) — complementa, não substitui o cofre.
