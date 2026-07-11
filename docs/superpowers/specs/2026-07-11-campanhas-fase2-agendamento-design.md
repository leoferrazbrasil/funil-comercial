# Design — Campanhas Fase 2: Persistência + Agendamento

> Spec de design. Data: 2026-07-11. Status: aprovado; pronto para implementação. Escopo aprovado: 2a + 2b num ciclo. Agendador: Supabase Cron (pg_cron + pg_net).

## Contexto

A Fase 1 entregou a página `/campanhas` com um wizard de 3 etapas que dispara templates **no navegador** (loop no front). Agendar exige enviar quando o navegador está fechado → o envio precisa migrar para o **backend**, com **persistência** e um **agendador**.

## Decisões

- Escopo: **fundação (2a) + agendador (2b)** num ciclo.
- Agendador: **Supabase Cron** (`pg_cron` + `pg_net`), tick de 1 min.
- Envio **server-side unificado** (agora e agendado passam pelo `campaign-runner`).
- **1 conta Meta** (a ativa) — múltiplas contas é a Fase 3.
- Sem alterar `App.tsx`: `createCampaign` deriva `owner_id` da sessão; a rota `/campanhas` já existe.

## Banco (nova migração)

**`campaigns`**: `id uuid pk`, `owner_id → auth.users (cascade)`, `nome text`, `template_name text`, `template_language text`, `body_text text` (snapshot para renderizar), `variables jsonb` (`[{mode:'name'|'fixed', value:text}]`), `scheduled_at timestamptz`, `status text check in ('scheduled','sending','done','failed','canceled')`, `total int`, `sent int`, `failed int`, `started_at`, `finished_at`, `created_at`, `updated_at`.

**`campaign_recipients`**: `id uuid pk`, `campaign_id → campaigns (cascade)`, `owner_id → auth.users`, `nome text`, `telefone text`, `contact_id uuid null`, `status text check in ('pending','sent','error')`, `error text`, `sent_at timestamptz`, `created_at`.

- **RLS** `for all (auth.uid()=owner_id)` nas duas; o runner usa service-role (bypass).
- Índices: `campaigns(owner_id, created_at desc)`, `campaigns(status, scheduled_at)`, `campaign_recipients(campaign_id, status)`.
- Trigger `set_updated_at` em `campaigns`.

## Edge Function `campaign-runner`

- **verify_jwt=false** (`config.toml`). Auth dupla:
  - `x-campaign-secret == CAMPAIGN_RUNNER_SECRET` → processa campanhas de **todos** os donos (chamada do cron).
  - `Authorization: Bearer <JWT>` válido → processa só as campanhas **daquele dono** (chamada do front no "enviar agora").
  - Sem nenhum → 401.
- **Loop:**
  1. Seleciona campanhas due: `status='scheduled' AND scheduled_at<=now()` (escopadas ao dono, se via JWT). Trava cada uma em `status='sending'`, `started_at=now()` (update condicional, idempotente).
  2. Também retoma campanhas já em `sending` (retomada após timeout).
  3. Para cada campanha: envia os `campaign_recipients` com `status='pending'` via **Graph API da Meta** (reusa `sendMetaTemplateMessage`; `phone_number_id` do canal Meta ativo do dono, fallback secret). Renderiza o corpo por destinatário (`body_text` + `variables` + `nome`). Marca `sent`/`error`, incrementa contadores, grava a mensagem em `inbox_messages` (rastro).
  4. **Orçamento de tempo** (~120s) e/ou cap de N por invocação → para e deixa o resto `pending` (campanha segue `sending`); o próximo tick continua. Sem pending → `status='done'` (ou `failed` se todos deram erro), `finished_at=now()`.
- Pausa curta entre envios (rate limit). Erros por destinatário não abortam a campanha.

## Agendador (Supabase Cron)

SQL que o usuário roda **uma vez** (fornecido no repo em `supabase/sql/campaign-cron.sql`):
```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.schedule('campaign-runner', '* * * * *', $$
  select net.http_post(
    url := 'https://juvwfxnlusrnvcarkrmc.supabase.co/functions/v1/campaign-runner',
    headers := jsonb_build_object('Content-Type','application/json','x-campaign-secret','<SECRET>')
  );
$$);
```
+ secret `CAMPAIGN_RUNNER_SECRET` nas Edge Functions.

## Front (`/campanhas`)

- **Duas visões** (toggle no topo): **Nova campanha** (wizard) e **Histórico**.
- **Wizard Etapa 1:** a opção **Agendar** vira um input `datetime-local` (mín. = agora). *Enviar agora* mantém-se.
- **Etapa 3 (confirmação):** botão vira **Disparar** (agora) ou **Agendar** (data futura). Ao confirmar → `createCampaign` (insere `campaigns` + `campaign_recipients`). Se agora: invoca `campaign-runner` (com o JWT) e **acompanha o status** via **polling** de `getCampaign(id)` (sent/total/failed) até `done`. Se agendada: confirma e leva ao Histórico.
- **Histórico:** `getCampaigns()` — lista com nome, template, quando, status, `sent/total`. Campanhas `scheduled` podem ser **canceladas** (`cancelCampaign` → `status='canceled'`).
- `crmService`: `createCampaign`, `getCampaigns`, `getCampaign`, `cancelCampaign`, `runOwnCampaigns` (invoca o runner com o JWT).

## Deploy / infra

- `campaign-runner` adicionada ao `config.toml` (verify_jwt=false), ao `deno check`, ao script `deploy-supabase-functions.ps1` e ao CI (com `--no-verify-jwt`).
- Migração aplicada no Supabase (`db push` / SQL).
- Secret `CAMPAIGN_RUNNER_SECRET` + cron SQL (passo manual do usuário).

## Critérios de sucesso

1. Migração cria as tabelas com RLS; usuário só vê as próprias campanhas.
2. "Enviar agora" cria a campanha, dispara o runner e a UI mostra o progresso até concluir; mensagens aparecem na Inbox.
3. "Agendar para X" cria a campanha `scheduled`; o cron dispara o runner por volta de X e ela conclui sem o navegador aberto.
4. Histórico lista as campanhas com status correto; cancelar uma agendada impede o envio.
5. Runner é resumível (reprocessa `pending` após timeout) e idempotente (não reenvia `sent`).

## Riscos e mitigações

- **Timeout da função** com muitos destinatários → orçamento de tempo + retomada por `pending`.
- **Reentrância do cron** (dois ticks) → trava `scheduled→sending` condicional; envio só de `pending` marcados um a um.
- **pg_cron/pg_net não habilitados** → passo manual documentado; sem isso, agendadas não disparam (o "enviar agora" via front ainda funciona).
- **Janela de 24h / template** → mesma regra da Fase 1 (erro por destinatário, visível no status).
- **Segurança do runner** → verify_jwt=false + secret/JWT; nunca expor o secret no front (front usa o próprio JWT).
