# Funil Comercial

Protótipo navegável do Funil Comercial para validação inicial do MVP em outro domínio e repositório.

## Telas incluídas

- Login
- Dashboard
- Inbox com contexto de WhatsApp
- Contatos
- Leads
- Funil de vendas

## Execução local

```bash
npm install
npm run dev
```

## Supabase

Projeto configurado para a fundação P0:

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

O comando `db:apply` só executa se `SUPABASE_DB_URL` pertencer ao project ref `dtdtewojmyhiegwmgmte`, evitando aplicação acidental em outro banco.

## Build

```bash
npm run build
```

O projeto está configurado com `base: "/"` para ser publicado no diretório raiz:

```text
https://leonardobrasil.com.br/
```

## Deploy

Configuração recomendada na hospedagem:

- Framework: Vite
- Comando de build: `npm run build`
- Diretório de saída: `dist`
- Diretório raiz: `./`
- Variáveis de ambiente:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Navegação

O protótipo usa rotas por hash para funcionar bem na raiz sem exigir rewrite no servidor:

```text
/#/dashboard
/#/inbox
/#/contatos
/#/leads
/#/funil
```

## Status

Esta versão já possui autenticação Supabase, sessão persistente, RLS por usuário e CRUD inicial para Inbox, Contatos, Leads e Funil de vendas. A integração com provedor real de WhatsApp fica para a próxima fase.
