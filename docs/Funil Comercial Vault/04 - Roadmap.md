---
title: Roadmap
aliases:
  - Planejamento
  - Próximos passos
tags:
  - funil-comercial/roadmap
date: 2026-07-10
---

# 🗺️ Roadmap

> [!abstract] Sobre esta nota
> Planejamento por horizonte (mais recente primeiro). O que já foi entregue vive no [[03 - Changelog]]; o que o produto faz hoje, em [[01 - Requisitos]]; a arquitetura, em [[02 - Arquitetura e Design]]. Índice em [[00 - Inicio]].

> [!info] Como ler os status
> ✅ Concluído · 🔜 Próximo · 🧭 Futuro (planejado, sem data) · 🏗️ Em andamento · ⏸️ Adiado

---

## ✅ Entregue recentemente

- **Filtros da Inbox** — Data (Tudo/Hoje/7d/30d) + Tipo por estágio do funil (Contato **cadastrado no CRM** / Lead / Oportunidade), e correção das abas Abertas/Não Lidas/Todas. Ver [[03 - Changelog]].
- **Seletor Z-API × Meta Cloud API** no `/perfil`.
- **Integração oficial Meta Cloud API** (webhook, envio, secrets) + **páginas legais** públicas.
- **Drawers acionáveis** (Origem real + Próxima Ação) em Oportunidade e Lead.
- **Dashboard**: filtro temporal + Taxa de Conversão por valor.

---

## 🔜 Próximo (curto prazo)

### 1. Fechar o envio pela Meta Cloud API
> [!warning] Pendência ativa
> Diagnosticar/validar o envio oficial: a **janela de 24h** bloqueia texto livre para quem não mandou mensagem nas últimas 24h → 1º contato exige **template aprovado**. Confirmar via log `whatsapp_send_meta_error` e o teste de recebimento (mandar msg para o número oficial e ver cair no `/inbox`).

### 2. (Opcional) "Marcar como lida ao abrir" no Inbox
Hoje "Não Lidas" = "cliente falou por último e não resolvida" (auto-mantido, sem tocar no banco). Se quisermos a semântica literal de *não lida*, marcar como lida ao **abrir** a conversa (reset de `unread_count` no banco) — exige mudança em `crmService` + `App.tsx` + escrita por abertura.

---

## 🏗️ Em andamento (outra frente)

- **Prospecção assistida** — páginas de preview de prospecção (`ProspectingPreview`, `prospectingPreviews.ts`, rotas públicas de preview). Frente ativa fora do escopo desta sessão; detalhar quando estabilizar.

---

## 🧭 Futuro (planejado, sem data)

### Multi-instância de WhatsApp
Conectar **vários números ao mesmo tempo** e rotear inbound/outbound por instância. **Muda o modelo atual** (hoje é **1 canal ativo por dono**) — alto impacto de produto. Depende da infra de Evolution abaixo.

---

## ⏸️ Adiado — Railway + Evolution API

> [!note] Decisão (2026-07-10)
> O brainstorming foi concluído e o **design está escrito**, mas a execução foi **adiada para o futuro** a pedido do usuário. Retomar a partir do spec quando for prioridade.
>
> 📄 Spec de design: [`docs/superpowers/specs/2026-07-10-evolution-api-railway-design.md`](../superpowers/specs/2026-07-10-evolution-api-railway-design.md)

**Objetivo:** rodar a **Evolution API (Docker)** para conectar **dezenas (6–50) de números** de WhatsApp, mantendo o **Supabase** como backend. Decomposto em:

| # | Sub-projeto | Descrição | Status |
|---|---|---|---|
| 1 | **Infra Railway: Evolution API** | Evolution API (imagem oficial) + Postgres + Redis, API key, HTTPS, persistência/backup | ⏸️ spec pronto |
| 2 | **Integração Funil ↔ Evolution** | Secrets no Supabase, webhooks Evolution → `whatsapp-inbound`/`qr-inbound`, ajustes nas Edge Functions, Evolution no seletor do `/perfil` | 🧭 depende de #1 |
| 3 | **Multi-instância (produto)** | Vários números ativos, roteamento por instância, UI de gestão | 🧭 depende de #2 |
| 4 | **Mover o site p/ Railway** | Servir o SPA estático na Railway + cutover de DNS (opcional) | 🧭 independente |

**Ordem sugerida:** 1 → 2 → 3 (cada um com seu ciclo spec → plano → implementação). O #4 é independente e opcional.

---

## 💡 Ideias / backlog (não priorizado)

- Consistência do "não lida" com badges/contadores de mensagens.
- Métricas de uso/custo da Evolution quando estiver no ar.
- Templates de 1º contato adicionais para prospecção (Meta).
