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

Esta versão é um protótipo front-end, com dados simulados e sem integração real com banco de dados, WhatsApp ou autenticação.
