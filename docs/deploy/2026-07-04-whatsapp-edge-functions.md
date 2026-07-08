# Deploy WhatsApp Edge Functions

Data: 2026-07-04

## Status do ambiente atual

Tentativa de deploy realizada para o projeto esperado:

```text
juvwfxnlusrnvcarkrmc
```

Resultado seguro:

- `SUPABASE_ACCESS_TOKEN`: presente no processo.
- Token atual lista outros projetos Supabase, mas nao lista
  `juvwfxnlusrnvcarkrmc`.
- `supabase functions deploy whatsapp-inbound --project-ref juvwfxnlusrnvcarkrmc`
  retornou `403`.
- Nenhum secret foi impresso.
- Nenhuma Edge Function foi publicada nesta tentativa.

Conclusao: o token Supabase disponivel neste ambiente nao tem privilegio para
publicar functions no projeto do Funil Comercial.

## Funcoes a publicar

```text
supabase/functions/whatsapp-inbound
supabase/functions/whatsapp-send
```

`whatsapp-inbound` precisa ser publicada sem verificacao JWT da plataforma,
porque a Meta nao envia token Supabase no webhook. A funcao possui validacao
propria por verify token, token interno e assinatura `X-Hub-Signature-256`.

`whatsapp-send` deve manter verificacao JWT, pois e chamada pelo app autenticado.

## Script seguro

Antes do deploy, rode os smoke tests locais:

```powershell
npm run functions:smoke
npm run routes:smoke
```

Esse teste sobe `whatsapp-inbound` e `whatsapp-send` localmente com secrets
dummy, valida o challenge da Meta, valida ignorar eventos sem mensagem e valida
que o envio outbound exige usuario autenticado. O smoke de rotas sobe o preview
do build e valida as rotas SPA principais antes da publicacao.

Use:

```powershell
.\scripts\deploy-supabase-functions.ps1
```

## Deploy via GitHub Actions

Workflow manual:

```text
Deploy Supabase Edge Functions
```

Configure o secret do repositorio:

```text
SUPABASE_ACCESS_TOKEN
```

O token precisa ter acesso ao projeto `juvwfxnlusrnvcarkrmc`. O workflow usa o
mesmo script seguro do repositorio, portanto tambem recusa qualquer project ref
diferente do esperado.

Inputs do workflow:

- `use_api`: usa empacotamento pela API do Supabase, evitando depender de Docker
  no runner.
- `run_smoke`: roda `npm run functions:smoke` antes do deploy.

Opcionalmente, quando o ambiente nao tiver Docker local:

```powershell
.\scripts\deploy-supabase-functions.ps1 -UseApi
```

O script:

- fixa o project ref esperado;
- recusa outro project ref;
- valida que `SUPABASE_ACCESS_TOKEN` existe;
- valida que o token tem acesso ao projeto;
- roda `deno check --no-lock`;
- publica `whatsapp-inbound` com `--no-verify-jwt`;
- publica `whatsapp-send` com JWT ativo.

## Secrets necessarios

Configurar no painel do Supabase ou via CLI autorizada:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
META_WEBHOOK_VERIFY_TOKEN
META_APP_SECRET
META_WHATSAPP_ACCESS_TOKEN
META_WHATSAPP_PHONE_NUMBER_ID
META_GRAPH_API_VERSION
FUNIL_WEBHOOK_SECRET
FUNIL_DEFAULT_OWNER_ID
```

Nao salvar esses valores no repositorio.

## Comandos equivalentes

```powershell
npx supabase functions deploy whatsapp-inbound `
  --project-ref juvwfxnlusrnvcarkrmc `
  --no-verify-jwt

npx supabase functions deploy whatsapp-send `
  --project-ref juvwfxnlusrnvcarkrmc
```

## Validacao apos deploy

1. Verificar challenge da Meta:

```text
GET /functions/v1/whatsapp-inbound?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
```

2. Enviar uma mensagem real para o numero oficial.
3. Conferir nova conversa em `/inbox`.
4. Responder pelo Inbox.
5. Conferir recebimento no WhatsApp.
6. Confirmar que duplicatas com mesmo `provider_message_id` nao geram novas
   linhas.

## Rollback

1. Pausar o canal no Inbox.
2. Desativar temporariamente o webhook `messages` no painel da Meta.
3. Reimplantar a versao anterior das functions ou remover a function nova.
4. Manter tabelas e historico; esta etapa nao adiciona migration destrutiva.
