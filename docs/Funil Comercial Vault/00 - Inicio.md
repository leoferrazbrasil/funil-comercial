---
title: Início
aliases:
  - Home
  - Índice
  - MOC
tags:
  - funil-comercial/moc
cssclasses:
  - dashboard
---

# 🎯 Funil Comercial — Knowledge Base

Bem-vindo ao cofre do projeto **Funil Comercial** — o CRM de prospecção ativa e atendimento por WhatsApp.

> [!info] Como navegar
> Este cofre tem quatro notas principais. Comece pelo que procura:
> - 📋 [[01 - Requisitos]] — o que o produto **faz hoje** (funcionalidades por página).
> - 🏛️ [[02 - Arquitetura e Design]] — **como** está construído (stack, banco, Edge Functions, fluxos).
> - 🗒️ [[03 - Changelog]] — **o que mudou** e por quê, sprint a sprint.
> - 🗺️ [[04 - Roadmap]] — **o que vem** (por horizonte) e o que está adiado.

## 🗺️ Mapa do cofre

| Nota | Conteúdo | Quando consultar |
|---|---|---|
| [[01 - Requisitos]] | Funcionalidades implementadas | "O que a tela X faz?" |
| [[02 - Arquitetura e Design]] | Stack, banco, Edge Functions, fluxos | "Como isso funciona por baixo?" |
| [[03 - Changelog]] | Histórico de mudanças | "O que mudou e quando?" |
| [[04 - Roadmap]] | Planejamento por horizonte | "O que vem a seguir?" |

## ⚡ Fatos rápidos

> [!abstract] Snapshot do projeto
> - **Produto:** CRM comercial (prospecção ativa + WhatsApp).
> - **Stack:** React 19 + Vite 8 + TypeScript · Supabase (Postgres/RLS/Realtime/Edge Functions).
> - **Deploy:** Hostinger, automático via push na branch `main` do GitHub.
> - **Supabase:** projeto `juvwfxnlusrnvcarkrmc`.
> - **Domínio:** [funilcomercial.com](https://funilcomercial.com)

## 🔌 Integrações de WhatsApp

> [!tip] Dois canais, um ativo por vez
> O envio/recebimento usa **um** canal ativo, escolhido no seletor do `/perfil` (ver [[01 - Requisitos#2. Autenticação e Perfil]]):
> - **Z-API** — não-oficial, texto livre, conexão por QR Code.
> - **Meta Cloud API** — oficial, sujeita à [[01 - Requisitos#9. Regras de negócio principais|janela de 24h]] e a templates aprovados.

> [!warning] Ao editar este cofre
> Use o formato **Obsidian Flavored Markdown** (wikilinks `[[Nota]]`, callouts `> [!tipo]`, properties no frontmatter). A skill `obsidian-markdown` (em `.claude/skills/`) documenta a sintaxe.
