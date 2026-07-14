# Resolução automática de @lid por contato — Design

**Goal:** Fazer o CRM exibir **nome + número reais** em conversas do WhatsApp (Z-API) que chegam mascaradas por `@lid`, resolvendo o `@lid` de cada contato cadastrado a partir do número real.

**Data:** 2026-07-13

## Contexto e limite honesto

- `@lid` → número real é **impossível** (privacidade do WhatsApp; confirmado pela [doc da Z-API](https://developer.z-api.io/en/tips/lid): *"It is not possible to convert an `@lid` to a phone number"*).
- O **inverso é possível**: número → `@lid`, via endpoint *"Is on WhatsApp?"*, cuja resposta inclui o `lid` (`{ "exists": true, "phone": "...", "lid": "...@lid" }`).
- Logo, a solução **só funciona para contatos cadastrados no CRM** (número real conhecido). Conversas com desconhecidos continuam mostrando o `@lid` — o número real não existe em lugar nenhum.

**Arquitetura escolhida:** Model A — **cadastro antecipado + resolução**. O envio pode sair do celular; o casamento da conversa é feito pelo `@lid`.

## Componentes

### 1. Banco — migração `contacts.wa_lid`
- Coluna `wa_lid text` em `contacts`, nullable.
- Índice em `(owner_id, wa_lid)` para o match no webhook.
- Formato guardado: **só dígitos** (sem o sufixo `@lid`). Ex.: `247738646179856`.

### 2. Edge Function `wa-lid-resolve` (nova)
- Input: `{ contact_id }` (um contato) ou `{ batch: true }` (todos do owner ainda sem `wa_lid`).
- Fluxo:
  1. Acha o **canal Z-API ativo** do owner: `integration_channels` com `provider = 'z-api'`, `status = 'ativo'` → `metadata.instance_id`/`instanceId` + `token`.
  2. Chama `GET https://api.z-api.io/instances/{instance}/token/{token}/phone-exists/{telefone}` com header `Client-Token: {ZAPI_CLIENT_TOKEN}` (mesmo padrão do `sendZApiTextMessage`).
  3. Extrai `lid` da resposta → grava os **dígitos** em `contacts.wa_lid`.
- Auth: chamada autenticada (JWT do usuário / RLS); resolve **apenas contatos do próprio owner**.
- Resposta: `{ resolved: n, skipped: n }`.

### 3. Gatilho no CRM (`crmService`)
- Após `createContact`/`updateContact` **com telefone**, chamar `wa-lid-resolve({ contact_id })` em **fire-and-forget** (não bloqueia a UI; falha não quebra o cadastro).
- Botão **"Resolver @lids pendentes"** (topo de Contatos ou Configurações) → `wa-lid-resolve({ batch: true })` para resolver a base atual.

### 4. Casamento no `whatsapp-inbound`
- Em `processInboundMessage`, quando há `chatLid` (`isLid`): buscar `contacts` por `wa_lid = digits(chatLid)`.
  - **Achou:** `finalPhone = contact.telefone` (número real); `contact_id = contact.id`; `remetente_nome = contact.nome`.
  - **Não achou:** comportamento atual (mantém o `@lid`).
- **Bug do `fromMe`:** não usar `senderName` (= o dono) como `remetente_nome`. Usar o contato casado; se não houver, nome neutro (não o nome do dono).

### 5. Validação PRIMEIRO (de-risco) — Task 1
- Resolver o número real da Jessica via `phone-exists` e confirmar que o `lid` == `247738646179856` (o `chatLid` visto no webhook real).
- **Se bater:** seguir com o build. **Se não bater:** parar e replanejar (o `@lid` do Is-on-WhatsApp não seria o mesmo do webhook → a arquitetura precisa mudar). Também confirma o **caminho exato do endpoint** (`phone-exists` vs outro).

## Fluxo de dados

```
Cadastro do contato (número real)
        │
        ▼
wa-lid-resolve → phone-exists → contacts.wa_lid  (só dígitos)
        │
        ▼   (depois, a qualquer momento)
Mensagem espelhada chega com chatLid (só @lid)
        │
        ▼
whatsapp-inbound casa por wa_lid → Inbox mostra NOME + NÚMERO reais
```

## Tratamento de erros / degradação
- Sem canal Z-API ativo, número inexistente no WhatsApp, ou resposta sem `lid` → `wa_lid` fica `null`; contato segue normal.
- `phone-exists` falha (rede/quota) → log + segue; não quebra o cadastro (fire-and-forget).
- Coluna `wa_lid` ausente (migração não aplicada ainda) → degradar com elegância via `isMissingColumnError`, como já é feito com os campos sociais.

## Ações do dono (deploy/migração)
- Aplicar migração `contacts.wa_lid` (colar SQL).
- Deploy de `wa-lid-resolve` (nova) + `whatsapp-inbound` (match).

## Fora de escopo (YAGNI)
- Resolver `@lid` de conversas de desconhecidos (impossível por design do WhatsApp).
- Import automático da lista estática de prospecção — hoje o cadastro normal de contato já dispara a resolução; import em lote pode ser passo futuro.
- Rótulo amigável para `@lid` não resolvido (decisão de display adiada; o dono já sinalizou que prefere ver o identificador a escondê-lo).
