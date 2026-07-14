# Resolução automática de @lid por contato — Plano de Implementação

> **Execução:** inline (eu implemento nesta sessão). NÃO subagent-driven — por causa das dependências de deploy do dono e da sensibilidade da WIP de prospecção. Ref. do design: [2026-07-13-wa-lid-resolution-design.md](../specs/2026-07-13-wa-lid-resolution-design.md).

**Goal:** Exibir **nome + número reais** em conversas Z-API que chegam mascaradas por `@lid`, resolvendo o `@lid` dos contatos cadastrados (número → `@lid` via `phone-exists`).

**Arquitetura:** Model A — cadastro antecipado + resolução.

## Global Constraints
- **Deploy de Edge Function e migração = ação do DONO** (403 pra mim). Cada task de função/migração termina com o comando/SQL pro dono.
- **NÃO commitar WIP:** `src/App.tsx`, `src/styles.css`, `prospeccao-*`, `src/pages/ProspectingPreview.tsx`, `src/lib/prospectingPreviews.ts`. Este trabalho é **camada de contatos** e não toca esses arquivos. Ao commitar, adicionar **só** os arquivos desta feature, explicitamente.
- `@lid` guardado **só com dígitos** (sem `@lid`).
- Endpoint Z-API: `GET https://api.z-api.io/instances/{instance}/token/{token}/phone-exists/{phone}`, header `Client-Token: {ZAPI_CLIENT_TOKEN}` (mesmo padrão de `sendZApiTextMessage`).
- Verificação: front → `npx tsc --noEmit`; Edge Functions → **teste manual pós-deploy** (não há runner local de Deno neste repo).
- Projeto Supabase: `juvwfxnlusrnvcarkrmc`. UI em pt-BR.

---

### Task 1 (GATE): `wa-lid-resolve` em modo validação + confirmar com a Jessica

**Files:** Create `supabase/functions/wa-lid-resolve/index.ts`

**Objetivo:** provar que `phone-exists(número real)` devolve o **mesmo** `@lid` do webhook (`247738646179856`), e cravar o caminho exato do endpoint — **antes** de construir o resto.

- [ ] **Passo 1:** Escrever a função (modo validação): `POST { phone }` → cliente Supabase com o **JWT do usuário** → acha canal `z-api`/`ativo` do owner (`metadata.instance_id`/`instanceId` + `token`) → `GET .../phone-exists/{phone}` com `Client-Token` → retorna `{ exists, inputPhone, lid, digits }` (sem gravar nada no banco).
- [ ] **Passo 2:** → **Dono deploya:** `npx supabase@latest functions deploy wa-lid-resolve --project-ref juvwfxnlusrnvcarkrmc`.
- [ ] **Passo 3:** → **Teste:** chamar a função com o **número real da Jessica**. Conferir `digits(lid) === "247738646179856"`.
- [ ] **GATE:** se **bater** → seguir para a Task 2. Se **NÃO bater** (lid diferente, ou endpoint não é `phone-exists`) → **PARAR e replanejar** (a suposição central caiu). Ajustar o caminho do endpoint aqui se necessário.

---

### Task 2: Migração `contacts.wa_lid`

**Files:** Create `supabase/migrations/20260713xxxxxx_contacts_wa_lid.sql`

- [ ] **Passo 1:** SQL: `alter table contacts add column if not exists wa_lid text;` + `create index if not exists idx_contacts_owner_wa_lid on contacts (owner_id, wa_lid);`
- [ ] **Passo 2:** → **Dono aplica** colando o **conteúdo** do SQL no editor do Supabase (não o caminho).

---

### Task 3: `wa-lid-resolve` completo (grava `wa_lid`, unitário + lote)

**Files:** Modify `supabase/functions/wa-lid-resolve/index.ts`

- [ ] **Passo 1:** Aceitar `{ contact_id }` (um) **ou** `{ batch: true }` (todos os contatos do owner com telefone e `wa_lid is null`). Para cada: resolver via `phone-exists` → `update contacts set wa_lid = digits(lid) where id = ...` (RLS via JWT do owner). Retornar `{ resolved, skipped }`.
- [ ] **Passo 2:** Erros por contato não abortam o lote (try/catch por item, log + segue). Sem canal ativo → 200 com `{ resolved:0, reason:"no_active_zapi_channel" }`.
- [ ] **Passo 3:** → **Dono re-deploya** `wa-lid-resolve`.

---

### Task 4: Gatilho no `crmService` + botão "Resolver @lids pendentes"

**Files:** Modify `src/lib/crmService.ts` (após `createContact`/`updateContact`, ~L219-269); Modify a página de Contatos (botão de lote).

- [ ] **Passo 1:** Função helper `resolveContactLid(contactId)` no `crmService` que invoca `wa-lid-resolve` (`supabase.functions.invoke`) em **fire-and-forget** (`.catch(() => {})` — nunca lança).
- [ ] **Passo 2:** Chamar `resolveContactLid(data.id)` ao fim de `createContact` e `updateContact` **quando há telefone**. Não `await` bloqueante da UI.
- [ ] **Passo 3:** Função `resolvePendingLids()` (`invoke wa-lid-resolve { batch:true }`) + botão **"Resolver @lids pendentes"** no topo da página Contatos (com estado de carregando + toast do resultado).
- [ ] **Passo 4:** Verificar: `npx tsc --noEmit` → exit 0.

---

### Task 5: Casamento no `whatsapp-inbound` + correção do `fromMe`

**Files:** Modify `supabase/functions/whatsapp-inbound/index.ts` (`processInboundMessage`, ~L616-705)

- [ ] **Passo 1:** Antes do `findExistingContact`, se `isLid` e houver `chatLid`: buscar `contacts` por `wa_lid = chatLid(dígitos)` no owner. Se achar → `finalPhone = contact.telefone`; usar esse contato (número/nome reais) em vez do `@lid`.
- [ ] **Passo 2:** Correção `fromMe`: quando `direction === "outbound"`, **não** usar `senderName` (= o dono) como `remetente_nome`. Se casou por `wa_lid`, usa `contact.nome`; senão, nome neutro (ex.: o próprio telefone/lid), nunca o nome do dono.
- [ ] **Passo 3:** Manter o backfill atual por `chat_lid` (não regredir).
- [ ] **Passo 4:** → **Dono re-deploya** `whatsapp-inbound`.

---

### Task 6: Teste ponta-a-ponta

- [ ] **Passo 1:** Cadastrar a Jessica como contato (nome + número real) → confirmar que `wa_lid` foi preenchido (`247738646179856`).
- [ ] **Passo 2:** Mandar uma mensagem **do celular** pra ela.
- [ ] **Passo 3:** No Inbox, confirmar que a conversa aparece com **nome + número reais** (não mais o `@lid`), e vinculada ao contato.
- [ ] **Passo 4:** Rodar **"Resolver @lids pendentes"** e confirmar que contatos antigos ganham `wa_lid`.

---

## Ordem de dependência
Task 1 (gate) → Task 2 (coluna) → Task 3 (grava) → Task 4 (gatilho/UI) → Task 5 (match) → Task 6 (E2E).
Deploys do dono necessários após: Task 1, Task 3, Task 5. Migração após Task 2.
