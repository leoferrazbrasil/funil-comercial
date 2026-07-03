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

## Status

Esta versao ja possui autenticacao Supabase, sessao persistente, RLS por usuario e CRUD inicial para Inbox, Contatos, Leads e Funil de vendas. A integracao com provedor real de WhatsApp fica para a proxima fase.
