---
title: Inbox — Incidente "Legado / sem canal" (channel_id ausente)
tags:
  - engenharia
  - whatsapp
  - inbox
  - incidente
status: resolvido
data: 2026-07-20
---

# Inbox — Incidente "Legado / sem canal"

> [!abstract] O que aconteceu
> Mensagem nova de um lead (Z-API, `5551996737359`) chegou no WhatsApp mas não apareceu no filtro padrão do `/inbox` ("Número atual" / `ativos`) — só aparecia em "Todas". A investigação revelou **duas causas empilhadas**, corrigidas em sequência.

## Sintomas (ordem em que apareceram)
1. Mensagem some do filtro padrão, aparece em "Todas" com a etiqueta **"Legado / sem canal"**.
2. Depois do fix de código + deploy: a mensagem **para de chegar em qualquer filtro** — piorou em vez de melhorar.

## Causa raiz 1 — Formato do telefone no match do canal
`resolveOwnerChannel` (`supabase/functions/whatsapp-inbound/index.ts`) exigia que o número reportado pela Z-API batesse **exatamente**, caractere a caractere, com `integration_channels.numero`. Como o formato varia (com/sem o 9º dígito), o match falhava e a mensagem era gravada com `channel_id: null`.

O Inbox trata `channel_id: null` como conversa **legada** (pensado para conversas anteriores ao suporte multi-canal, não para falha de match) — por isso some do filtro padrão `ativos`, que exige `channel_id` não-nulo (`src/pages/Inbox.tsx`, função `conversationMatchesChannelFilter`).

**Fix:** `resolveOwnerChannel` passou a usar `getPhoneVariations` — a mesma função já usada e comprovada para casar contatos/leads — antes de comparar, tolerando as duas variações de formato. 3 testes novos em `index_test.ts` provam a mecânica exata do bug e da correção (`deno test`: 5/5 ok).

## Causa raiz 2 — Migração pendente (channel_id não existia no banco)
Depois do deploy do fix acima, o sintoma **piorou**: nenhuma mensagem chegava mais, em nenhum filtro. O log da Edge Function revelou a causa real:

```
{"event":"whatsapp_inbound_message_error","reason":"Could not find the 'channel_id' column of 'inbox_messages' in the schema cache | PGRST204", ...}
```

A migração `20260716180000_inbox_conversation_archiving.sql` — que cria a coluna `channel_id` em `inbox_messages` **e** a tabela `inbox_conversation_states` (usada para arquivar/reabrir conversas) — tinha sido **commitada mas nunca aplicada** no banco de produção. O código de uma feature anterior (`feat(inbox): persist whatsapp channel on messages`) já assumia a coluna existente; todo insert em `inbox_messages` passou a falhar com `PGRST204` assim que esse código foi efetivamente deployado pela primeira vez.

**Fix:** o dono aplicou a migração colando o SQL completo no SQL Editor da Supabase (todos os comandos são idempotentes — `if not exists` / `create or replace` — seguros de rodar novamente mesmo que parte já exista).

## ⚠️ Lição / padrão a vigiar
> [!warning] Deploy de função ≠ aplicação de migração
> São dois passos manuais e **independentes** neste projeto (deploy de Edge Function bloqueado neste ambiente — 403 —, o dono roda `supabase functions deploy`; migração o dono aplica colando o SQL). Código que referencia uma coluna nova pode ficar **commitado e até deployado** antes da migração correspondente ser aplicada — e o erro só aparece em produção, no momento do insert, não em tempo de build/type-check. Ao introduzir uma coluna nova consumida por uma Edge Function, checar explicitamente se a migração já foi aplicada antes (ou junto) do deploy do código que depende dela.

## Pendência residual
Conversas que chegaram durante a janela quebrada (ex.: "Débora Ruschel") ficaram gravadas com `channel_id: null` — o fix só vale para mensagens novas a partir de agora. Existe um backfill SQL (religa via `integration_channels`, comparando variações de formato do telefone) disponibilizado ao dono — não aplicado ainda, é opcional.

## Relacionados
[[05 - API e Edge Functions]] · [[CTWA - Atribuicao e Conversions API]] · [[03 - Changelog]]
