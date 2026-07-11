# Handoff de Conversas (time leve) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que o admin crie vendedores ligados a ele e transfira conversas de WhatsApp para eles, que veem e respondem **apenas** as conversas atribuídas, enviando pelo canal do admin.

**Architecture:** Time "leve" sobre o admin — os dados seguem do admin (`owner_id`), sem entidade "organização". Adiciona vínculo (`profiles.admin_id`), atribuição por conversa (`conversation_assignments`) e autoria (`inbox_messages.sent_by`). RLS libera ao vendedor só as conversas atribuídas. Envio cross-account no `whatsapp-send`.

**Tech Stack:** React 19 + Vite + TypeScript (SPA); Supabase (Postgres/RLS + Edge Functions em Deno); WhatsApp Cloud API.

## Global Constraints

- **Verificação (sem framework de testes):** cada task termina com os gates reais do repo — front: `npx tsc --noEmit` + `npm run build`; Edge Functions: `deno check <arquivo>`; e verificação manual quando indicado. NÃO existe `pytest`/`vitest` aqui.
- **Projeto de produção:** `juvwfxnlusrnvcarkrmc` ("Funil Comercial Produção"). Migrações e deploys são **ação do usuário** (SQL Editor / `npx supabase … --use-api`); o agente prepara o código e o SQL.
- **WIP intocável:** `src/App.tsx` e `src/styles.css` carregam a WIP de prospecção não commitada; se um task tocar `App.tsx`, commitar via `git stash` (guardar WIP, reaplicar só o task na base limpa, commitar, `git stash pop`). Nunca commitar `prospeccao-*`, `ProspectingPreview.tsx`, `prospectingPreviews.ts`.
- **Ownership:** toda mensagem enviada grava **`owner_id = admin`** (dono da conversa) e **`sent_by = remetente`**. Nunca gravar `owner_id = vendedor`.
- **Autorização de envio do vendedor:** só é permitido se existir assignment `(owner_id=admin, telefone, assigned_to=vendedor)`.
- Segredos nunca são impressos/commitados.

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `supabase/migrations/20260712100000_team_handoff.sql` | Colunas + tabela + índices + RLS do time/handoff |
| `supabase/functions/team-create-member/index.ts` | Cria vendedor (service-role); só admin chama |
| `supabase/functions/whatsapp-send/index.ts` | Rework: resolve canal pelo dono da conversa + autoriza vendedor atribuído + grava `sent_by` |
| `supabase/config.toml` | Registrar `team-create-member` (mantém verify_jwt) |
| `scripts/deploy-supabase-functions.ps1` + `.github/workflows/deploy-supabase-functions.yml` | Incluir `team-create-member` no check/deploy |
| `src/lib/types.ts` | `TeamMember`, `ConversationAssignment`; `InboxMessage.sent_by` |
| `src/lib/crmService.ts` | `createTeamMember`, `getTeamMembers`, `assignConversation`, `getConversationAssignments` |
| `src/pages/Settings.tsx` | Seção "Equipe" (listar + criar vendedor) |
| `src/components/TeamSection.tsx` | Componente da seção Equipe (isola do Settings) |
| `src/pages/Inbox.tsx` | Botão "Transferir" + selo "Atendendo" + filtro "Atribuídas a mim" |

---

# FASE 1 — Fundação de time

## Task 1: Migração (dados + RLS)

**Files:**
- Create: `supabase/migrations/20260712100000_team_handoff.sql`

**Interfaces:**
- Produces (schema): `profiles.admin_id`, `inbox_messages.sent_by`, tabela `public.conversation_assignments(id, owner_id, telefone, assigned_to, assigned_by, created_at, updated_at)`; helper SQL `public.is_conversation_assignee(p_owner uuid, p_telefone text)`.

- [ ] **Step 1: Escrever a migração**

```sql
-- Handoff de conversas (time leve sobre o admin).

-- 1) Vínculo vendedor -> admin
alter table public.profiles
  add column if not exists admin_id uuid references auth.users(id) on delete set null;
create index if not exists profiles_admin_id_idx on public.profiles (admin_id);

-- 2) Autoria real da mensagem enviada (distinta de owner_id = conta/admin)
alter table public.inbox_messages
  add column if not exists sent_by uuid references auth.users(id) on delete set null;

-- 3) Atribuição por conversa (1 por telefone dentro da conta do admin)
create table if not exists public.conversation_assignments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  telefone text not null,
  assigned_to uuid not null references auth.users(id) on delete cascade,
  assigned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, telefone)
);
create index if not exists conversation_assignments_owner_tel_idx
  on public.conversation_assignments (owner_id, telefone);
create index if not exists conversation_assignments_assigned_idx
  on public.conversation_assignments (assigned_to);

drop trigger if exists conversation_assignments_set_updated_at on public.conversation_assignments;
create trigger conversation_assignments_set_updated_at
  before update on public.conversation_assignments
  for each row execute function public.set_updated_at();

-- 4) Helper: a conversa (owner, telefone) está atribuída ao usuário atual?
create or replace function public.is_conversation_assignee(p_owner uuid, p_telefone text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversation_assignments ca
    where ca.owner_id = p_owner
      and ca.telefone = p_telefone
      and ca.assigned_to = auth.uid()
  );
$$;

-- 5) RLS de conversation_assignments
alter table public.conversation_assignments enable row level security;

drop policy if exists "assignments_admin_all" on public.conversation_assignments;
create policy "assignments_admin_all" on public.conversation_assignments
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "assignments_member_read" on public.conversation_assignments;
create policy "assignments_member_read" on public.conversation_assignments
  for select
  using (auth.uid() = assigned_to);

-- 6) RLS de inbox_messages: dono OU destinatário atribuído
--    (substitui a policy antiga que era só owner_id)
drop policy if exists "inbox_messages_crud_own" on public.inbox_messages;
drop policy if exists "inbox_read_own_or_assigned" on public.inbox_messages;
create policy "inbox_read_own_or_assigned" on public.inbox_messages
  for select
  using (
    auth.uid() = owner_id
    or public.is_conversation_assignee(owner_id, telefone)
  );

drop policy if exists "inbox_write_own_or_assigned" on public.inbox_messages;
create policy "inbox_write_own_or_assigned" on public.inbox_messages
  for update
  using (
    auth.uid() = owner_id
    or public.is_conversation_assignee(owner_id, telefone)
  )
  with check (
    auth.uid() = owner_id
    or public.is_conversation_assignee(owner_id, telefone)
  );

-- INSERT em inbox_messages continua só pelo dono (as mensagens de saída são
-- inseridas pela Edge Function com service-role, que bypassa RLS).
drop policy if exists "inbox_insert_own" on public.inbox_messages;
create policy "inbox_insert_own" on public.inbox_messages
  for insert
  with check (auth.uid() = owner_id);

-- 7) profiles: admin lê seus vendedores (além do próprio)
drop policy if exists "profiles_admin_reads_members" on public.profiles;
create policy "profiles_admin_reads_members" on public.profiles
  for select
  using (auth.uid() = id or admin_id = auth.uid());
```

> ⚠️ **Antes de aplicar:** confira o nome REAL da policy antiga de `inbox_messages` em `supabase/migrations/20260702162000_initial_crm_foundation.sql` e no `03 - Changelog`. Se não for `inbox_messages_crud_own`, ajuste o `drop policy if exists` (o `if exists` evita erro, mas a policy antiga precisa ser removida para a nova valer). Idem para a policy antiga de `profiles` (SELECT).

- [ ] **Step 2: Aplicar (usuário) e verificar**

Rodar o SQL no **SQL Editor** do projeto `juvwfxnlusrnvcarkrmc`. Verificar:
```sql
select column_name from information_schema.columns
 where table_name='profiles' and column_name='admin_id';
select to_regclass('public.conversation_assignments');
select column_name from information_schema.columns
 where table_name='inbox_messages' and column_name='sent_by';
```
Esperado: `admin_id`, `conversation_assignments`, `sent_by` presentes.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260712100000_team_handoff.sql
git commit -m "feat(handoff): migração — admin_id, conversation_assignments, sent_by + RLS por atribuição"
```

---

## Task 2: Tipos

**Files:**
- Modify: `src/lib/types.ts`

**Interfaces:**
- Produces: `TeamMember`, `ConversationAssignment`, `InboxMessage.sent_by`.

- [ ] **Step 1: Adicionar os tipos**

Em `src/lib/types.ts`, no tipo `InboxMessage`, adicionar (ao lado de `delivery_status`):
```typescript
  sent_by?: string | null
```
No tipo `Profile`, adicionar o vínculo com o admin:
```typescript
  admin_id?: string | null
```
E no fim do arquivo:
```typescript
export type TeamMember = {
  id: string
  nome: string | null
  email: string | null
  role: 'diretor' | 'gestor' | 'vendedor'
  admin_id: string | null
  avatar_url?: string | null
}

export type ConversationAssignment = {
  id: string
  owner_id: string
  telefone: string
  assigned_to: string
  assigned_by: string | null
  updated_at: string
}
```

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat(handoff): tipos TeamMember, ConversationAssignment e InboxMessage.sent_by"
```

---

## Task 3: Edge Function `team-create-member`

**Files:**
- Create: `supabase/functions/team-create-member/index.ts`
- Modify: `supabase/config.toml`
- Modify: `scripts/deploy-supabase-functions.ps1`, `.github/workflows/deploy-supabase-functions.yml`

**Interfaces:**
- Produces (HTTP): `POST /functions/v1/team-create-member` body `{ email, password, nome }` → `{ ok, member: { id, email, nome } }` ou `{ error }`. Autentica o admin pelo JWT; cria o vendedor via service-role com `role='vendedor'` e `admin_id = admin`.

- [ ] **Step 1: Escrever a função**

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function serviceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase secrets missing.");
  return createClient(url, key, { auth: { persistSession: false } });
}
function bearer(req: Request) {
  const a = req.headers.get("authorization") ?? "";
  return a.toLowerCase().startsWith("bearer ") ? a.slice(7).trim() : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);
  try {
    const supabase = serviceClient();
    const token = bearer(req);
    if (!token) return json({ error: "Não autenticado." }, 401);
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) return json({ error: "Sessão inválida." }, 401);
    const admin = userData.user;

    // Só um admin (não-vendedor) pode criar membros.
    const { data: adminProfile } = await supabase
      .from("profiles").select("role, admin_id").eq("id", admin.id).maybeSingle();
    if (adminProfile?.role === "vendedor" || adminProfile?.admin_id) {
      return json({ error: "Apenas o administrador da conta pode criar vendedores." }, 403);
    }

    const { email, password, nome } = (await req.json().catch(() => ({}))) as
      { email?: string; password?: string; nome?: string };
    const emailNorm = (email ?? "").trim().toLowerCase();
    if (!emailNorm || !password || password.length < 6) {
      return json({ error: "Informe email e uma senha (mín. 6 caracteres)." }, 400);
    }

    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: emailNorm,
      password,
      email_confirm: true,
      user_metadata: { nome: (nome ?? "").trim() || emailNorm },
    });
    if (createErr || !created.user) {
      const msg = createErr?.message ?? "Não foi possível criar o usuário.";
      const status = /already|exists|registered/i.test(msg) ? 409 : 400;
      return json({ error: status === 409 ? "Este e-mail já tem conta." : msg }, status);
    }

    // Perfil do vendedor: role + vínculo com o admin.
    const { error: upErr } = await supabase.from("profiles").upsert({
      id: created.user.id,
      email: emailNorm,
      nome: (nome ?? "").trim() || emailNorm,
      role: "vendedor",
      admin_id: admin.id,
    });
    if (upErr) return json({ error: `Usuário criado, mas o perfil falhou: ${upErr.message}` }, 500);

    return json({ ok: true, member: { id: created.user.id, email: emailNorm, nome: (nome ?? "").trim() || emailNorm } });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Erro desconhecido." }, 500);
  }
});
```

- [ ] **Step 2: Registrar no config.toml**

Em `supabase/config.toml`, adicionar (mantém verify_jwt=true — a função valida o admin pelo JWT):
```toml
[functions.team-create-member]
verify_jwt = true
```

- [ ] **Step 3: Incluir no pipeline de deploy**

Em `scripts/deploy-supabase-functions.ps1` e no workflow YAML, adicionar `team-create-member` à lista de `deno check` e de `functions deploy` (seguindo o padrão de `campaign-runner`/`whatsapp-templates`).

- [ ] **Step 4: Verificar**

Run: `deno check supabase/functions/team-create-member/index.ts`
Expected: `Check …` sem erros.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/team-create-member/index.ts supabase/config.toml scripts/deploy-supabase-functions.ps1 .github/workflows/deploy-supabase-functions.yml
git commit -m "feat(handoff): Edge Function team-create-member (admin cria vendedor)"
```

- [ ] **Step 6: Deploy (usuário)**

```powershell
$env:SUPABASE_ACCESS_TOKEN = "<PAT>"
npx supabase functions deploy team-create-member --use-api --project-ref juvwfxnlusrnvcarkrmc
```

---

## Task 4: crmService — time e atribuição

**Files:**
- Modify: `src/lib/crmService.ts`

**Interfaces:**
- Consumes: `requireSupabase()`, `supabase.functions.invoke`, `extractFunctionError` (já existem no arquivo).
- Produces:
  - `createTeamMember(payload: { email: string; password: string; nome: string }): Promise<TeamMember>`
  - `getTeamMembers(): Promise<TeamMember[]>`
  - `assignConversation(ownerId: string, telefone: string, assignedTo: string): Promise<void>`
  - `getConversationAssignments(): Promise<ConversationAssignment[]>`
  - `getMyProfile(): Promise<Profile | null>` — perfil do usuário logado (para decidir admin × vendedor sem tocar `App.tsx`)

- [ ] **Step 1: Implementar as funções**

Adicionar em `src/lib/crmService.ts` (importar os tipos no topo):
```typescript
export async function createTeamMember(payload: {
  email: string; password: string; nome: string;
}): Promise<TeamMember> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.functions.invoke("team-create-member", { body: payload });
  if (error || data?.error || !data?.ok) throw new Error(await extractFunctionError(error, data));
  const m = data.member;
  return { id: m.id, email: m.email, nome: m.nome, role: "vendedor", admin_id: null };
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = requireSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const adminId = userData.user?.id;
  if (!adminId) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nome, email, role, admin_id, avatar_url")
    .eq("admin_id", adminId)
    .order("nome", { ascending: true });
  if (error) throw error;
  return (data ?? []) as TeamMember[];
}

export async function getConversationAssignments(): Promise<ConversationAssignment[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("conversation_assignments")
    .select("id, owner_id, telefone, assigned_to, assigned_by, updated_at");
  if (error) throw error;
  return (data ?? []) as ConversationAssignment[];
}

export async function assignConversation(
  ownerId: string, telefone: string, assignedTo: string,
): Promise<void> {
  const supabase = requireSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("conversation_assignments")
    .upsert(
      { owner_id: ownerId, telefone, assigned_to: assignedTo, assigned_by: userData.user?.id ?? null },
      { onConflict: "owner_id,telefone" },
    );
  if (error) throw error;
}

export async function getMyProfile(): Promise<Profile | null> {
  const supabase = requireSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const id = userData.user?.id;
  if (!id) return null;
  const { data, error } = await supabase
    .from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Profile) ?? null;
}
```

> `Profile` já é exportado em `src/lib/types.ts` e deve ganhar o campo `admin_id?: string | null` (adicionar no Task 2, junto dos demais tipos).

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit` e `npm run build`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/lib/crmService.ts
git commit -m "feat(handoff): crmService — createTeamMember/getTeamMembers/assignConversation"
```

---

## Task 5: Seção "Equipe" em Configurações

**Files:**
- Create: `src/components/TeamSection.tsx`
- Modify: `src/pages/Settings.tsx`

**Interfaces:**
- Consumes: `createTeamMember`, `getTeamMembers` (Task 4); `Profile` do usuário logado (para saber se é admin).
- Produces: componente `<TeamSection currentRole={role} />`.

- [ ] **Step 1: Criar o componente**

`src/components/TeamSection.tsx` — lista os vendedores e um form (nome, email, senha provisória) que chama `createTeamMember` e recarrega. Mostrar só se o usuário for admin (role !== 'vendedor' e sem admin_id). Estrutura (Tailwind, padrão do projeto):
```tsx
import { useCallback, useEffect, useState } from "react";
import { Users, Plus, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { createTeamMember, getTeamMembers } from "../lib/crmService";
import type { TeamMember } from "../lib/types";

export function TeamSection() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nome, setNome] = useState(""); const [email, setEmail] = useState(""); const [senha, setSenha] = useState("");

  const reload = useCallback(async () => {
    try { setMembers(await getTeamMembers()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || senha.length < 6) { toast.error("Informe email e senha (mín. 6)."); return; }
    setSaving(true);
    try {
      await createTeamMember({ email, password: senha, nome });
      toast.success("Vendedor criado.");
      setNome(""); setEmail(""); setSenha("");
      await reload();
    } catch (err: any) { toast.error(err?.message ?? "Erro ao criar vendedor."); }
    finally { setSaving(false); }
  };

  return (
    <div className="w-full max-w-md space-y-5">
      <div>
        <h3 className="flex items-center gap-2 font-bold text-lg text-foreground">
          <Users className="w-5 h-5 text-primary" /> Equipe
        </h3>
        <p className="text-sm text-muted-foreground mt-1">Crie vendedores para receber transferências de conversas.</p>
      </div>
      {loading ? (
        <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="space-y-2">
            {members.length === 0 && <p className="text-sm text-muted-foreground">Nenhum vendedor ainda.</p>}
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-card px-4 py-3">
                <div><p className="font-semibold text-sm">{m.nome || m.email}</p><p className="text-xs text-muted-foreground">{m.email}</p></div>
                <span className="text-[11px] font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">Vendedor</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleAdd} className="space-y-3 border-t border-white/5 pt-4">
            <input className="w-full" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <input className="w-full" type="email" placeholder="E-mail do vendedor" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="w-full" type="text" placeholder="Senha provisória (mín. 6)" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="new-password" />
            <button type="submit" disabled={saving} className="primary-button w-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus size={16} /> Adicionar vendedor</>}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Inserir no Settings, só para admin (sem tocar App.tsx)**

Em `src/pages/Settings.tsx`, buscar o perfil com `getMyProfile()` (Task 4) num `useEffect` e renderizar `<TeamSection />` num painel **apenas** quando `profile && profile.role !== 'vendedor' && !profile.admin_id`. Enquanto carrega, não renderiza a seção. Assim **não** é preciso mexer no `App.tsx` (evita a WIP). Ex.:
```tsx
const [profile, setProfile] = useState<Profile | null>(null);
useEffect(() => { getMyProfile().then(setProfile).catch(() => {}); }, []);
const isAdmin = !!profile && profile.role !== "vendedor" && !profile.admin_id;
// ... {isAdmin && (<div className="panel p-6"><TeamSection /></div>)}
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit` e `npm run build`
Expected: sem erros.

- [ ] **Step 4: Commit** (se App.tsx foi tocado, usar o fluxo `git stash`)

```bash
git add src/components/TeamSection.tsx src/pages/Settings.tsx
git commit -m "feat(handoff): seção Equipe em Configurações (admin cria vendedor)"
```

---

# FASE 2 — Handoff (transferência + envio cross-account)

## Task 6: `whatsapp-send` — envio cross-account

**Files:**
- Modify: `supabase/functions/whatsapp-send/index.ts`

**Interfaces:**
- Consumes: `getSupabaseClient()`, `getAuthenticatedUser()`, `getActiveWhatsAppChannel(supabase, ownerId)` (já existem).
- Produces: comportamento — o canal e o `owner_id` da mensagem passam a ser do **dono da conversa (admin)**; grava `sent_by = remetente`.

- [ ] **Step 1: Descobrir o dono da conversa e autorizar**

No handler, após obter `user` (o remetente) e `phone`, substituir a resolução do canal por:
```typescript
// Dono da conversa: se o remetente é vendedor, é o admin dele; senão, ele mesmo.
const { data: senderProfile } = await supabase
  .from("profiles").select("admin_id").eq("id", user.id).maybeSingle();
const conversationOwnerId = senderProfile?.admin_id ?? user.id;

// Se o remetente é vendedor (tem admin_id), exige assignment desta conversa.
if (senderProfile?.admin_id) {
  const { data: assigned } = await supabase
    .from("conversation_assignments")
    .select("id")
    .eq("owner_id", conversationOwnerId)
    .eq("telefone", phone)
    .eq("assigned_to", user.id)
    .maybeSingle();
  if (!assigned) {
    return jsonResponse({ error: "Você não está atribuído a esta conversa." }, 403);
  }
}

const channel = await getActiveWhatsAppChannel(supabase, conversationOwnerId);
```
(Remover a linha antiga `const channel = await getActiveWhatsAppChannel(supabase, user.id);`.)

- [ ] **Step 2: Gravar owner=admin, sent_by=remetente**

No `insert` de `inbox_messages`, trocar `owner_id: user.id` por `owner_id: conversationOwnerId` e adicionar `sent_by: user.id`. Idem no `getSourceMessage`/update de status: usar `conversationOwnerId` como `owner_id` nas queries de origem.

- [ ] **Step 3: Verificar**

Run: `deno check supabase/functions/whatsapp-send/index.ts`
Expected: sem erros.

- [ ] **Step 4: Commit + deploy (usuário)**

```bash
git add supabase/functions/whatsapp-send/index.ts
git commit -m "feat(handoff): whatsapp-send envia pelo canal do admin dono da conversa (+sent_by)"
```
```powershell
npx supabase functions deploy whatsapp-send --use-api --project-ref juvwfxnlusrnvcarkrmc
```

---

## Task 7: Inbox — transferir, selo e filtro

**Files:**
- Modify: `src/pages/Inbox.tsx`

**Interfaces:**
- Consumes: `getTeamMembers`, `getConversationAssignments`, `assignConversation` (Task 4); `TeamMember`, `ConversationAssignment` (Task 2).
- Produces: UI de transferência + filtro "Atribuídas a mim".

- [ ] **Step 1: Carregar membros e atribuições**

No componente do Inbox, com `useQuery`/`useEffect`, carregar `getTeamMembers()` e `getConversationAssignments()` (mapa `telefone -> assigned_to`). Só o admin vê a lista de membros (se vazia, o botão Transferir não aparece).

- [ ] **Step 2: Botão "Transferir" no cabeçalho da conversa**

No header da conversa selecionada, adicionar um botão/menu "Transferir" (ícone `UserPlus`) que lista os membros e, ao escolher, chama:
```typescript
await assignConversation(selectedConversation.ownerId, selectedConversation.telefone, memberId);
```
Depois recarrega as atribuições e mostra toast "Conversa transferida para {nome}". (Usar o `owner_id` da própria mensagem da conversa como `ownerId`.)

- [ ] **Step 3: Selo "Atendendo: X" + filtro**

Exibir o nome do responsável na conversa (join com members pelo `assigned_to`). Adicionar um filtro/aba **"Atribuídas a mim"** que, para o admin, filtra as conversas cujo `assigned_to === meuId`; para o vendedor, a RLS já entrega só as atribuídas (o filtro fica opcional).

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit` e `npm run build`
Expected: sem erros.

- [ ] **Step 5: Verificação manual (ponta a ponta)**

1. Admin cria vendedor (Configurações → Equipe).
2. Admin transfere uma conversa para o vendedor.
3. Login como vendedor → vê só aquela conversa → responde → mensagem chega pelo número do admin (checar selinho de entrega) e aparece com `sent_by` = vendedor.
4. Vendedor NÃO vê outras conversas nem contatos/leads do admin.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Inbox.tsx
git commit -m "feat(handoff): Inbox — transferir conversa, selo de responsável e filtro"
```

---

## Verificação final & entrega

- [ ] `npx tsc --noEmit` + `npm run build` limpos; `deno check` nas funções alteradas.
- [ ] Migração aplicada + funções deployadas em `juvwfxnlusrnvcarkrmc`.
- [ ] Fluxo ponta a ponta do Task 7 Step 5 validado.
- [ ] Atualizar o cofre ([[03 - Changelog]] + [[04 - Roadmap]]).
- [ ] WIP de prospecção intacta (`git status`).
