# Funil Comercial

Prototipo navegavel do Funil Comercial para validacao inicial do MVP em outro dominio e repositorio.

## Telas incluidas

- Login
- Dashboard
- Inbox com contexto de WhatsApp
- Contatos
- Leads
- Funil de vendas

## Execucao local

```bash
npm install
npm run dev
```

## Supabase

Projeto configurado para a fundacao P0:

```text
https://dtdtewojmyhiegwmgmte.supabase.co
```

Crie um arquivo `.env.local` a partir de `.env.example`:

```bash
VITE_SUPABASE_URL=https://dtdtewojmyhiegwmgmte.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_public
```

Execute a migration abaixo no SQL Editor do Supabase ou aplique via connection string oficial do projeto:

```bash
npm run db:apply
```

O comando `db:apply` so executa se `SUPABASE_DB_URL` pertencer ao project ref `dtdtewojmyhiegwmgmte`, evitando aplicacao acidental em outro banco.

## Build

```bash
npm run build
```

O projeto esta configurado com `base: "/"` para ser publicado no diretorio raiz:

```text
https://leonardobrasil.com.br/
```

## Deploy

Configuracao recomendada na hospedagem:

- Framework: Vite
- Comando de build: `npm run build`
- Diretorio de saida: `dist`
- Diretorio raiz: `./`
- Variaveis de ambiente:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- O arquivo `public/.htaccess` precisa ser publicado junto com o build para que rotas internas do React Router sejam servidas por `index.html`.

## Navegacao

O prototipo usa React Router com URLs limpas e fallback de SPA na hospedagem:

```text
/dashboard
/inbox
/contatos
/leads
/funil
```

## WhatsApp / Inbox

A captura automatica de mensagens esta preparada em:

```text
supabase/functions/whatsapp-inbound
supabase/functions/whatsapp-send
```

Ela recebe webhooks da WhatsApp Business Platform Cloud API da Meta e webhooks
HTTP compativeis, resolve o canal ativo em `integration_channels`, vincula
contato/lead existentes por telefone e registra a conversa no Inbox sem criar
duplicidades. As respostas do Inbox podem ser enviadas pela Cloud API quando
`whatsapp-send` estiver publicada e configurada.

Antes de usar em producao, aplique as migrations e configure os secrets da Edge Function no Supabase:

```bash
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

Para mapear um numero oficial ao CRM, cadastre um registro em `integration_channels` com `provider`, `numero`, `owner_id` e `status = ativo`.

Guia tecnico completo:

```text
docs/whatsapp-cloud-api-integration.md
```

Runbook de publicacao das Edge Functions:

```bash
npm run functions:smoke
```

```powershell
.\scripts\deploy-supabase-functions.ps1
```

## Status

Esta versao ja possui autenticacao Supabase, sessao persistente, RLS por usuario, CRUD inicial para Inbox, Contatos, Leads e Funil de vendas, e uma Edge Function preparada para captura automatica de mensagens WhatsApp por webhook. A conexao com provedor real exige configurar o canal em `integration_channels` e apontar o webhook do provedor para a funcao publicada.
