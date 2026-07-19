---
title: API e Edge Functions
aliases:
  - API
  - Edge Functions
  - Backend
tags:
  - funil-comercial/arquitetura
  - funil-comercial/api
date: 2026-07-11
---

# 🔌 API e Edge Functions

> [!abstract] Sobre esta nota
> Referência do backend: Edge Functions (Deno), a camada de dados no front (`crmService`) e os secrets. Visão geral da arquitetura em [[02 - Arquitetura e Design]]. Índice em [[00 - Inicio]].

O "backend" do Funil Comercial é **Supabase**: Postgres+RLS (dados) e **Edge Functions** (Deno) para o que precisa rodar server-side (webhooks, envio, IA). Não há API REST própria — o front fala direto com o Postgres (via `supabase-js`, protegido por RLS) e invoca funções pontuais.

## Edge Functions

> [!warning] Deploy é manual e hoje bloqueado no ambiente do agente
> Alterar uma função exige `supabase functions deploy` (com `--no-verify-jwt` nos webhooks, ou via `config.toml`). O ambiente do agente **não deploya** (403); quem faz é o dono, no projeto `juvwfxnlusrnvcarkrmc`.

| Função | Papel | `verify_jwt` |
|---|---|---|
| `whatsapp-inbound` | Webhook de mensagens recebidas (Z-API/Meta). Meta: verificação GET (`hub.challenge`), assinatura (`META_APP_SECRET`), parsing `entry→changes→value→messages`; resolve o dono pelo `phone_number_id`. Também processa `statuses[]` (entrega/leitura/falha → selinho no Inbox). Captura o **`ctwa_clid`** do `referral` (anúncio Click-to-WhatsApp) e persiste em `leads`/`contacts` — ver [[CTWA - Atribuicao e Conversions API]]. | **false** |
| `whatsapp-qr-inbound` | Webhook de conexão/desconexão (Z-API `ConnectedCallback`, Evolution). | **false** |
| `whatsapp-send` | Envia **texto** e **template** (Z-API/Evolution/**Meta** Graph `.../{phone_number_id}/messages`). Usa o canal `ativo` mais recente. Cross-account no handoff. | default |
| `whatsapp-templates` | Lista templates **aprovados** da Meta (`GET /{WABA_ID}/message_templates`, paginado). Marca não suportados (mídia, header com variável, botão dinâmico, variáveis nomeadas). | default |
| `whatsapp-manager` | Cria instância/QR, status (Z-API `/status`+`/device`), desconecta. | default |
| `campaign-runner` | Envia campanhas de template **server-side**, resumível e idempotente (claim + `provider_message_id`). Acionado por **Supabase Cron** (`CAMPAIGN_RUNNER_SECRET`) ou pelo front. | **false** |
| `team-create-member` | Cria vendedor sob o admin (handoff de time). Deny-by-default + limpeza de órfão. | **true** |
| `meta-auth` / `meta-publish` | OAuth da Meta (Instagram) e publicação de post. | default |
| `ai-generate-post` / `ai-recommend-post` | IA de criativos (OpenAI/Gemini). **Presos ao posicionamento antigo** (B2B/SaaS) → Fase B reescreve os prompts. Hoje bloqueadas em prod → o front cai em fallback/mock. | default |
| `evolution-proxy` | Proxy para a Evolution API (QR multi-instância — adiado). | default |
| `lead-intake` | **Intake público de leads do formulário web** (`Landing.tsx`). Grava o lead com o **GA4 `client_id`** (`leads.ga_client_id`) via service-role + `FUNIL_DEFAULT_OWNER_ID`; honeypot + validação de telefone; degrada se a coluna não existir. Base da atribuição de conversões offline — ver [[GA4 - Conversões Offline]]. | **false** |
| `meta-capi-messaging` | Devolve à Meta o **desfecho** de lead vindo de anúncio CTWA via Conversions API (`action_source: business_messaging` + `messaging_channel: whatsapp`), usando o `ctwa_clid` capturado no webhook. Dedupe por `lead_id:event_name` + `ctwa_reported_at`. Vai para o **dataset da WABA**, não para o pixel do site — ver [[CTWA - Atribuicao e Conversions API]]. | default |

Config de `verify_jwt` em `supabase/config.toml` (off só nos webhooks e no runner).

> [!info] Secrets da Meta (Supabase → Edge Functions → Secrets)
> `META_WHATSAPP_ACCESS_TOKEN`, `META_WHATSAPP_PHONE_NUMBER_ID`, `META_APP_SECRET`, `META_WEBHOOK_VERIFY_TOKEN`, `META_WABA_ID` (templates), `CAMPAIGN_RUNNER_SECRET` (cron). Segredos colados no chat devem ser **rotacionados** (ver [[04 - Roadmap]]).

## Camada de dados no front — `src/lib/crmService.ts`

Todo acesso ao Supabase passa por aqui (cada função chama `requireSupabase()`). Grupos:

- **CRM:** `getCrmSnapshot`, create/update/delete de `contact`/`lead`/`opportunity`, `convertContactToLead`, `ensureDefaultStages`, `upsertProfile` (não grava `role`).
- **Inbox:** `sendInboxReply`, `sendInboxTemplate`, `markInboxConversationRead`, `updateInboxMessageStatus`, `updateInboxConversationLinks`, `getApprovedWhatsAppTemplates`.
- **Canais:** `getIntegrationChannels`, `createIntegrationChannel`, `updateIntegrationChannelStatus`.
- **Campanhas:** create/list de `campaigns` + `campaign_recipients`.
- **Time (handoff):** `createTeamMember`, `getTeamMembers`, `assignConversation`, `getConversationAssignments`, `getMyProfile`.
- **Roteiro:** `getEditorialQueue`, `addEditorialQueueItem`, `updateEditorialQueueItemStatus`, `deleteEditorialQueueItem`.

`owner_id` sempre vem da sessão (`session.user.id`), nunca do payload do cliente — a RLS (`with check auth.uid() = owner_id`) barra escrita em conta alheia.

## Realtime

Canal `supabase_realtime` em: `inbox_messages`, `contacts`, `leads`, `opportunities`, `integration_channels`. O `App.tsx` assina `inbox_messages` e `integration_channels` (filtro por `owner_id`) e invalida o `crmSnapshot` do React Query.

## Regras de envio (Meta)

> [!danger] Janela de 24h + pagamento
> Texto livre só é aceito **até 24h** da última mensagem do cliente; 1º contato exige **template**. Se o envio real falha, o front tinha um *fallback* que salvava localmente (bolha sem entrega) — corrigido para não mascarar falha. Templates não entregam hoje por **pagamento da WABA** (`131042`), pendência do dono. Ver [[03 - Changelog]].
