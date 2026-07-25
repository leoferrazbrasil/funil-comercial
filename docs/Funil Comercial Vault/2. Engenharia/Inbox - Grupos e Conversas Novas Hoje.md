---
title: Inbox - Grupos e Conversas Novas Hoje
aliases:
  - Conversas novas hoje
  - Grupos no Inbox
tags:
  - funil-comercial/inbox
  - funil-comercial/dashboard
  - funil-comercial/whatsapp
date: 2026-07-25
---

# Inbox - Grupos e Conversas Novas Hoje

> [!summary]
> Decisao tecnica: a Inbox operacional deve mostrar apenas conversas um-a-um com potencial comercial. Grupos, comunidades e newsletters nao entram na lista diaria nem nas metricas de aquisicao.

## Regra de produto

- **Grupos de WhatsApp:** nao aparecem na lista de conversas da `/inbox`.
- **Novas conversas hoje:** conta telefones unicos cujo primeiro inbound historico aconteceu no dia atual.
- **Numero novo:** so conta quando a conversa nasceu sem `contact_id` e sem `lead_id`.
- **Pareamento existente:** se ja existia contato ou lead para o telefone antes da primeira mensagem, nao conta como conversa nova.
- **Retorno:** se o telefone ja tinha inbound em dia anterior, nao conta novamente.
- **Outbound:** mensagem enviada pela empresa nao abre uma "conversa nova hoje" para a metrica.

## Implementacao

- `src/lib/inboxConversationRules.ts`
  - `normalizeConversationPhone`: cria chave comparavel de telefone com tolerancia ao nono digito.
  - `isWhatsAppGroupMessage`: detecta grupo por `metadata.is_group`, identificadores `@g.us` e legado `Pessoa · Grupo`.
- `src/pages/Inbox.tsx`
  - filtra grupos antes de agrupar conversas.
- `src/lib/dashboardMetrics.ts`
  - adiciona `currentDay.newUnpairedConversations`.
  - calcula o primeiro inbound por telefone no historico.
- `src/pages/Dashboard.tsx`
  - adiciona o card **Conversas novas hoje**.
- `supabase/functions/whatsapp-inbound/index.ts`
  - Z-API passa a ignorar `isGroup` no webhook, evitando gravar grupos novos.

## Validacao

- Testes unitarios cobrem:
  - normalizacao de telefone com e sem nono digito;
  - deteccao de grupos atuais e legados;
  - contagem unica por telefone;
  - exclusao de retorno, outbound, contato/lead vinculado e grupo.

## Relacoes

- [[02 - Arquitetura e Design]]
- [[05 - API e Edge Functions]]
- [[03 - Changelog]]
