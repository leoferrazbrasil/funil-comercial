# Design — Handoff de conversas (time leve sobre o admin)

Data: 2026-07-11
Status: aprovado (design) — aguardando review do spec

## Problema

O CRM é **single-tenant por usuário**: toda tabela tem `owner_id` e RLS
`auth.uid() = owner_id`; o `whatsapp-send` envia pelo canal do usuário logado.
Não há organização/time. Logo, não é possível **transferir uma conversa em
atendimento para outro usuário** (vendedor) para que ele dê sequência pela
própria conta — objetivo desta feature.

## Objetivo

Permitir que o **admin** (dono da conta/canal de WhatsApp) crie **vendedores**
ligados a ele e **transfira conversas** para esses vendedores, que passam a ver
e responder **apenas** as conversas atribuídas a eles, enviando pelo canal do
admin em nome do time.

## Decisões (travadas com o usuário)

- **Arquitetura:** **time leve sobre o admin** — os dados continuam do admin
  (`owner_id`), sem criar entidade "organização" nem migrar ownership das demais
  tabelas. Handoff é uma **camada** por cima.
- **Criação de vendedores:** **o admin cria a conta** (email + senha provisória)
  numa tela de "Equipe".
- **Privacidade:** o vendedor **só lê as conversas atribuídas a ele**. Nunca vê
  conversas de outros vendedores nem o restante do CRM do admin.

## Fronteiras do v1 (explícitas)

- **Quem transfere:** apenas o **admin** roteia/atribui conversas (modelo
  "gerente distribui"). Vendedor→vendedor (passar adiante) fica para v2.
- **Registros do CRM:** o vendedor vê/responde a **conversa** (chat), mas **não**
  os contatos/leads/oportunidades do admin (seguem privados por `owner_id`). O
  painel "Contexto de CRM" fica limitado para o vendedor. Compartilhar registros
  do CRM entre o time é um passo maior, fora do v1.

## Arquitetura & modelo de dados

### Novos campos/tabelas
- **`profiles.admin_id uuid references auth.users(id)`** — nulo para admins;
  para vendedores, aponta o admin dono do time. Define o vínculo.
- **`conversation_assignments`** — 1 linha por conversa atribuída:
  - `id uuid pk`, `owner_id uuid` (= admin, dono da conversa),
    `telefone text`, `assigned_to uuid` (= vendedor), `assigned_by uuid`,
    `created_at`, `updated_at`. **Único** por `(owner_id, telefone)`.
- **`inbox_messages.sent_by uuid`** — quem **de fato** enviou (vendedor),
  distinto de `owner_id` (a conta/admin). Para atribuição na UI.

### RLS
- **`profiles`**: admin lê/edita os próprios; admin lê os profiles cujo
  `admin_id = auth.uid()` (seus vendedores); vendedor lê o próprio.
- **`conversation_assignments`**:
  - Admin (dono): CRUD onde `owner_id = auth.uid()`.
  - Vendedor: SELECT onde `assigned_to = auth.uid()` (para saber o que é dele).
  - Escrita (INSERT/UPDATE/DELETE) apenas pelo admin dono: RLS
    `owner_id = auth.uid()`. A UI de transferência chama `assignConversation`
    (upsert por `(owner_id, telefone)`) no `crmService`, com o admin logado.
- **`inbox_messages`** (mudança-chave): SELECT/UPDATE permitido se
  `auth.uid() = owner_id` **ou** existe assignment casando
  `(owner_id, telefone)` com `assigned_to = auth.uid()`:
  ```sql
  using (
    auth.uid() = owner_id
    or exists (
      select 1 from conversation_assignments ca
      where ca.owner_id = inbox_messages.owner_id
        and ca.telefone = inbox_messages.telefone
        and ca.assigned_to = auth.uid()
    )
  )
  ```

## Componentes

### 1) Criar vendedores — Edge Function `team-create-member`
Service-role (criar usuário exige admin API). Fluxo: autentica o admin (JWT) →
valida que é admin (não é vendedor) → `auth.admin.createUser({ email, password,
email_confirm: true })` → cria/atualiza `profiles` do novo usuário com
`role='vendedor'` e `admin_id = admin`. Retorna o membro criado. Erros tratados
(email já existe, etc.).

### 2) Tela "Equipe" (dentro de Configurações)
Nova seção na página `/configuracoes`: lista os vendedores do admin
(`profiles` com `admin_id = eu`), formulário para adicionar (email + senha
provisória) chamando `team-create-member`, e ação de ativar/desativar
(`profiles.role`/flag). Só visível para admin.

### 3) Envio cross-account — `whatsapp-send` (rework)
Hoje resolve o canal por `getActiveWhatsAppChannel(user.id)`. Passa a:
- Descobrir o **dono da conversa (admin)**: se o remetente é admin, é ele; se é
  vendedor, é o `admin_id` dele.
- **Autorizar**: admin envia em qualquer conversa própria; vendedor só se houver
  assignment `(owner=admin, telefone, assigned_to=vendedor)`.
- Resolver o canal pelo **admin** e enviar; gravar a mensagem com
  `owner_id = admin` e **`sent_by = remetente`**.

### 4) Handoff no Inbox
- Cabeçalho da conversa (visível ao admin): botão **"Transferir"** → escolhe um
  vendedor do time → grava `conversation_assignments` (upsert por telefone).
- **Mensagem de sistema** ("Conversa transferida para X") no histórico.
- Selo **"Atendendo: X"** na conversa; filtro **"Atribuídas a mim" / "Todas"**.
- Vendedor: Inbox mostra só o que a RLS liberar (atribuídas a ele).

## Implementação faseada (um spec, entrega em ordem)

- **Fase 1 — Fundação de time:** migração (`profiles.admin_id`,
  `conversation_assignments`, `inbox_messages.sent_by`, RLS), Edge Function
  `team-create-member`, seção **Equipe** em Configurações. Entrega: admin monta
  o time.
- **Fase 2 — Handoff:** rework do `whatsapp-send` (cross-account + `sent_by`),
  UI de transferência + selo + filtro no Inbox, RLS de leitura por atribuição
  ativa de ponta a ponta. Entrega: transferir e o vendedor dar sequência.

## Arquivos (previsão)

| Arquivo | Mudança |
|---|---|
| `supabase/migrations/…_team_handoff.sql` | `profiles.admin_id`, `conversation_assignments`, `inbox_messages.sent_by`, RLS |
| `supabase/functions/team-create-member/index.ts` | **nova** — cria vendedor (service-role) |
| `supabase/functions/whatsapp-send/index.ts` | resolve canal pelo dono da conversa + autoriza vendedor atribuído + `sent_by` |
| `src/pages/Settings.tsx` | seção **Equipe** (lista + criar membro) |
| `src/lib/crmService.ts` | `createTeamMember`, `getTeamMembers`, `assignConversation`, ajustes de leitura |
| `src/lib/types.ts` | `TeamMember`, `ConversationAssignment`; `InboxMessage.sent_by` |
| `src/pages/Inbox.tsx` | botão Transferir + selo "Atendendo" + filtro atribuídas |
| `supabase/config.toml` | `verify_jwt` de `team-create-member` (mantém JWT — autentica admin) |

## Riscos / cuidados

- **Segurança da criação de usuário:** só admin pode chamar `team-create-member`;
  validar o papel do chamador na função (service-role).
- **RLS com subconsulta** em `inbox_messages` — testar performance (índice em
  `conversation_assignments (owner_id, telefone)` e `(assigned_to)`).
- **`whatsapp-send`**: garantir que o vendedor não envie fora de conversa
  atribuída; a mensagem sempre grava `owner_id = admin`.
- **`App.tsx`** carrega a WIP de prospecção — se tocado, commitar via `git stash`.
- Deploys de Edge Functions dependem do fluxo de CLI já destravado
  (`--use-api`, projeto `juvwfxnlusrnvcarkrmc`).
- Validar `tsc` + `build` + `deno check`.

## Critérios de aceite

1. Admin cria um vendedor na tela Equipe; o vendedor loga e vê um Inbox **vazio**
   (nada atribuído ainda).
2. Admin transfere uma conversa para o vendedor; aparece a mensagem de sistema e
   o selo "Atendendo".
3. O vendedor passa a ver **apenas** essa conversa e **responde** — a mensagem
   sai pelo **canal do admin**, com `sent_by` = vendedor.
4. O vendedor **não** vê nenhuma outra conversa nem os registros de CRM do admin.
5. `tsc`/`build`/`deno check` limpos; WIP de prospecção intacta.
