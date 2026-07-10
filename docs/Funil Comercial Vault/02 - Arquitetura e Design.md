---
title: Arquitetura e Design
aliases:
  - Arquitetura
  - Como funciona
tags:
  - funil-comercial/arquitetura
date: 2026-07-09
---

# 🏛️ Arquitetura e Design

> [!abstract] Sobre esta nota
> Estado atual da arquitetura (atualizado em 2026-07-09). Para o "o que faz" por página, ver [[01 - Requisitos]]. Índice em [[00 - Inicio]].

## Stack

- **Front-end:** React 19 + TypeScript + Vite 8 (rolldown). Roteamento com React Router (URLs limpas, SPA fallback via `public/.htaccess`).
- **Back-end:** Supabase — Postgres + RLS, Auth, Realtime e Edge Functions (Deno).
- **Integrações:** Z-API (WhatsApp não-oficial) **e Meta Cloud API (WhatsApp oficial)** — selecionáveis no `/perfil`; Meta Graph API (Instagram), OpenAI/Gemini (IA de criativos).
- **Hospedagem:** Hostinger (Apache/LiteSpeed), **deploy automático a partir de push no GitHub (branch `main`)**. Build: `npm run build` → `dist/`.
- **Projeto Supabase atual:** `juvwfxnlusrnvcarkrmc`.

## Banco de dados (tabelas principais)

- `contacts` (owner_id, nome, telefone, email, origem, potencial). `unique(owner_id, telefone)`.
- `leads` (owner_id, contact_id→contacts, nome, telefone, interesse, status, valor_estimado, origem).
- `opportunities` (owner_id, lead_id→leads, titulo, etapa, valor, responsavel, proxima_acao, **produto**).
- `pipeline_stages`, `inbox_messages` (owner_id, contact_id, lead_id, canal, provider, provider_message_id, telefone, mensagem, status, unread_count, direction, **metadata**), `integration_channels` (owner_id, provider, nome, numero, status, metadata).

> [!success] Exclusão segura por design
> **FKs com `ON DELETE SET NULL`** em `leads.contact_id`, `opportunities.lead_id`, `inbox_messages.contact_id/lead_id` → excluir contato/lead só **desvincula** (preserva o histórico). Reflete a regra em [[01 - Requisitos#9. Regras de negócio principais]].

- **RLS `for all` (auth.uid()=owner_id)** em todas as tabelas de CRM.
- **Realtime (`supabase_realtime`):** inbox_messages, contacts, leads, opportunities e **integration_channels**.

## Edge Functions (Deno)

- `whatsapp-manager` — cria instância/QR, consulta status (Z-API `/status` + `/device`), desconecta. Grava `status='ativo'` separado do `numero`.
- `whatsapp-inbound` — webhook de mensagens recebidas (Z-API/Meta Cloud API). Z-API: resolve o dono por `instanceId`. Meta: verificação GET (`hub.challenge` + `META_WEBHOOK_VERIFY_TOKEN`), assinatura (`META_APP_SECRET`), parsing `entry→changes→value→messages`, resolve o dono pelo `numero` do canal = `phone_number_id`/`display_phone_number`. Normaliza, ignora newsletters, atribui grupos ao participante, grava em `inbox_messages`. **`verify_jwt=false`**.
- `whatsapp-qr-inbound` — webhook de conexão/desconexão (`ConnectedCallback`) e Evolution. **`verify_jwt=false`**.
- `whatsapp-send` — envio pela Z-API/Evolution/**Meta Cloud API** (Graph API `.../{phone_number_id}/messages`). Usa o canal `ativo` mais recente (`getActiveWhatsAppChannel`).
- `meta-auth`, `meta-publish`, `ai-generate-post`, `ai-recommend-post`, `evolution-proxy`.
- Config em `supabase/config.toml` (JWT off só nos webhooks).

> [!info] Secrets da Meta (Supabase → Edge Functions → Secrets)
> `META_WHATSAPP_ACCESS_TOKEN`, `META_WHATSAPP_PHONE_NUMBER_ID`, `META_APP_SECRET`, `META_WEBHOOK_VERIFY_TOKEN`.

## Front-end — módulos-chave

- `src/App.tsx` — shell, rotas, react-query (`crmSnapshot`), assinaturas realtime (inbox_messages + integration_channels), modais locais (Contact/Lead/Opportunity/Message/Channel). **`PUBLIC_PATHS`** (rotas sem login) usado no gate de render e no guard de auth.
- **Rotas públicas (sem sessão):** `/`, `/brandbook`, `/privacidade`, `/termos`, `/exclusao-de-dados` (ver [[01 - Requisitos#7.1. Páginas legais públicas]]).
- `src/pages/` — Dashboard, Inbox, Contacts, Leads, Pipeline, Profile, Creatives, **LegalPages** (Privacidade/Termos/Exclusão de Dados), etc.
- `src/components/SharedUI.tsx` — TextField, **SelectField (dropdown customizado, realce na paleta)**, EntityForm, modais base.
- `src/components/ConfirmDialog.tsx` — confirmação de exclusão reutilizável.
- `src/components/IntegrationSection.tsx` — **seletor Z-API × Meta Cloud API** no `/perfil` (ativa um provider, desativa o outro); renderiza o QR (`WhatsAppIntegration.tsx`) ou o card de status da Meta.
- `src/lib/products.ts` — catálogo de produtos, preço (setup/mensalidade), auto-detecção por palavra-chave, **`effectiveValue`** (valor imediato = valor gravado ou preço do produto).
- `src/lib/crmService.ts` — CRUD (create/update/delete de contato, lead, oportunidade; sendInboxReply; snapshot; **`getIntegrationChannels`**, `updateIntegrationChannelStatus`).

## Fluxos importantes

- **Conexão WhatsApp:** `/perfil` → create (QR) → usuário escaneia → Z-API conecta → (a) webhook `ConnectedCallback` → `whatsapp-qr-inbound` grava `ativo` → realtime → UI; e/ou (b) polling do `status` (live OR db `ativo`). Requer webhooks configurados no painel Z-API.
- **Mensagem recebida:** Z-API **ou Meta Cloud API** → `whatsapp-inbound` → resolve dono (instanceId / phone_number_id) → insere em `inbox_messages` → realtime → Inbox atualiza sozinho.
- **Contato → Lead → Oportunidade:** vínculo por `contact_id`/`lead_id`; oportunidade guarda `produto` (com preço) e alimenta os cards de receita do Funil (único vs MRR, Fechado vs Projeção).

> [!danger] Envio + janela de 24h (Meta)
> `whatsapp-send` usa o canal `ativo` mais recente. Na **Meta**, texto livre só é aceito dentro de **24h** da última mensagem do cliente; 1º contato exige **template**. Se o envio real falha, o front tem *fallback* que salva a resposta localmente → **a bolha aparece sem entrega**. Erro típico da Meta fora da janela: `131047`.

## Deploy — pontos de atenção

> [!warning] Front-end
> Mudança de front só aparece após o build do host (automático via push). Cache resolvido no `.htaccess` (`index.html` no-cache; assets imutáveis).

> [!warning] Banco de dados
> Mudança de banco exige aplicar a migração (SQL no Supabase / `db push`).

> [!warning] Edge Functions
> Mudança em Edge Function exige deploy (`supabase functions deploy`), com `--no-verify-jwt` nos webhooks (ou via `config.toml`).
