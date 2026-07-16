# Inbox Conversation Archiving By Channel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add safe inbox cleanup by archiving conversations by WhatsApp channel/number without deleting message history.

**Architecture:** Store conversation visibility separately from message history. Add `channel_id` to new inbox messages, introduce `inbox_conversation_states` for archive state per owner, customer phone, and channel, then filter the Inbox list using that state. Legacy messages without `channel_id` remain visible under a "Legado / sem canal" bucket and can also be archived.

**Tech Stack:** Supabase/Postgres migrations and RLS, Supabase Edge Functions in Deno TypeScript, React + TypeScript, TanStack Query snapshot loading, Tailwind UI in `src/pages/Inbox.tsx`.

## Global Constraints

- Do not delete rows from `public.inbox_messages` for inbox cleanup.
- Preserve contact, lead, opportunity, delivery status, assignment, and message audit history.
- Only the owner/admin can bulk archive conversations; sellers may read assigned archived conversations but cannot perform bulk cleanup.
- A new inbound message must reopen the conversation by clearing archive state for that phone/channel.
- Legacy messages with `channel_id is null` must remain supported and must not break current grouping by normalized customer phone.
- The default Inbox view shows active, non-archived conversations.

---

## File Structure

- Create: `supabase/migrations/20260716180000_inbox_conversation_archiving.sql`
  - Adds `channel_id` to `inbox_messages`.
  - Creates `inbox_conversation_states`.
  - Adds RLS policies and indexes.
- Modify: `src/lib/types.ts`
  - Adds `channel_id` to `InboxMessage`.
  - Adds `InboxConversationState`.
  - Adds `conversationStates` to `CrmSnapshot`.
- Modify: `src/lib/crmService.ts`
  - Loads conversation states in `getCrmSnapshot`.
  - Adds `archiveInboxConversations`, `unarchiveInboxConversation`, and `reopenInboxConversation`.
  - Sends `channel_id` when creating local inbox messages.
- Modify: `supabase/functions/whatsapp-inbound/index.ts`
  - Returns both `ownerId` and `channelId` from channel resolution.
  - Inserts `channel_id`.
  - Reopens archived state on inbound messages.
- Modify: `supabase/functions/whatsapp-send/index.ts`
  - Inserts `channel_id` for outbound messages.
- Modify: `src/pages/Inbox.tsx`
  - Adds archive-aware conversation grouping.
  - Adds `Arquivadas` tab.
  - Adds channel filter.
  - Adds contextual cleanup modal/action for inactive or legacy channels.

---

### Task 1: Database Model For Archive State

**Files:**
- Create: `supabase/migrations/20260716180000_inbox_conversation_archiving.sql`

**Interfaces:**
- Produces: nullable `public.inbox_messages.channel_id`.
- Produces: `public.inbox_conversation_states` keyed by `(owner_id, telefone, channel_key)`.
- Later tasks rely on columns: `owner_id`, `telefone`, `channel_id`, `channel_key`, `archived_at`, `archived_by`, `archive_reason`, `created_at`, `updated_at`.

- [ ] **Step 1: Create the migration**

```sql
alter table public.inbox_messages
  add column if not exists channel_id uuid references public.integration_channels(id) on delete set null;

create index if not exists inbox_messages_owner_channel_phone_idx
  on public.inbox_messages (owner_id, channel_id, telefone);

create table if not exists public.inbox_conversation_states (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  telefone text not null,
  channel_id uuid references public.integration_channels(id) on delete set null,
  channel_key text generated always as (coalesce(channel_id::text, 'legacy')) stored,
  archived_at timestamptz,
  archived_by uuid references auth.users(id) on delete set null,
  archive_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists inbox_conversation_states_unique_idx
  on public.inbox_conversation_states (owner_id, telefone, channel_key);

create index if not exists inbox_conversation_states_owner_archived_idx
  on public.inbox_conversation_states (owner_id, archived_at);

drop trigger if exists inbox_conversation_states_set_updated_at on public.inbox_conversation_states;
create trigger inbox_conversation_states_set_updated_at
  before update on public.inbox_conversation_states
  for each row execute function public.set_updated_at();

alter table public.inbox_conversation_states enable row level security;

drop policy if exists "conversation_states_admin_all" on public.inbox_conversation_states;
create policy "conversation_states_admin_all"
  on public.inbox_conversation_states for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "conversation_states_assignee_read" on public.inbox_conversation_states;
create policy "conversation_states_assignee_read"
  on public.inbox_conversation_states for select
  using (public.is_conversation_assignee(owner_id, telefone));
```

- [ ] **Step 2: Validate migration syntax locally**

Run: `Get-Content supabase\migrations\20260716180000_inbox_conversation_archiving.sql`

Expected: the file prints with the table, indexes, trigger, and RLS policies above.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260716180000_inbox_conversation_archiving.sql
git commit -m "feat(inbox): add conversation archive state"
```

---

### Task 2: Type And Service Layer

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/crmService.ts`

**Interfaces:**
- Consumes: database columns from Task 1.
- Produces: `InboxConversationState` type.
- Produces: `archiveInboxConversations(items, reason)`.
- Produces: `unarchiveInboxConversation(item)`.
- Produces: `reopenInboxConversation(ownerId, telefone, channelId)`.

- [ ] **Step 1: Update frontend types**

Add to `src/lib/types.ts`:

```ts
export type InboxMessage = {
  id: string
  owner_id: string
  contact_id: string | null
  lead_id: string | null
  channel_id?: string | null
  canal: string
  provider: string
  provider_message_id: string | null
  remetente_nome: string
  telefone: string
  mensagem: string
  status: string
  unread_count: number
  direction: 'inbound' | 'outbound'
  delivery_status?: 'sent' | 'delivered' | 'read' | 'failed' | null
  delivery_error?: string | null
  sent_by?: string | null
  created_at: string
}

export type InboxConversationState = {
  id: string
  owner_id: string
  telefone: string
  channel_id: string | null
  channel_key: string
  archived_at: string | null
  archived_by: string | null
  archive_reason: string | null
  created_at: string
  updated_at: string
}

export type CrmSnapshot = {
  profile: Profile | null
  contacts: Contact[]
  leads: Lead[]
  opportunities: Opportunity[]
  messages: InboxMessage[]
  channels: IntegrationChannel[]
  conversationStates: InboxConversationState[]
}
```

- [ ] **Step 2: Update `emptySnapshot` usage**

In `src/pages/Inbox.tsx`, make sure the snapshot fallback includes:

```ts
conversationStates: [],
```

- [ ] **Step 3: Load states in `getCrmSnapshot`**

In `src/lib/crmService.ts`, add a Supabase query:

```ts
const statesResult = await supabase
  .from("inbox_conversation_states")
  .select("*")
  .order("updated_at", { ascending: false });
```

Include `statesResult.error` in the error list and return:

```ts
conversationStates: (statesResult.data as InboxConversationState[]) ?? [],
```

- [ ] **Step 4: Add archive service functions**

Add to `src/lib/crmService.ts`:

```ts
type ConversationArchiveTarget = {
  owner_id: string;
  telefone: string;
  channel_id?: string | null;
};

export async function archiveInboxConversations(
  targets: ConversationArchiveTarget[],
  reason: string,
) {
  if (targets.length === 0) return [];
  const supabase = requireSupabase();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const archivedBy = userData.user?.id ?? null;
  const archivedAt = new Date().toISOString();

  const rows = targets.map((target) => ({
    owner_id: target.owner_id,
    telefone: normalizePhone(target.telefone),
    channel_id: target.channel_id ?? null,
    archived_at: archivedAt,
    archived_by: archivedBy,
    archive_reason: reason.trim() || "Arquivado para organizar a Inbox",
  }));

  const { data, error } = await supabase
    .from("inbox_conversation_states")
    .upsert(rows, { onConflict: "owner_id,telefone,channel_key" })
    .select();

  if (error) throw error;
  return (data as InboxConversationState[]) ?? [];
}

export async function unarchiveInboxConversation(target: ConversationArchiveTarget) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("inbox_conversation_states")
    .update({ archived_at: null, archived_by: null, archive_reason: null })
    .eq("owner_id", target.owner_id)
    .eq("telefone", normalizePhone(target.telefone))
    .eq("channel_key", target.channel_id ?? "legacy")
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as InboxConversationState | null;
}
```

- [ ] **Step 5: Run typecheck**

Run: `npm run typecheck`

Expected: TypeScript errors identify all remaining call sites that need the new `conversationStates` prop.

- [ ] **Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/crmService.ts src/pages/Inbox.tsx
git commit -m "feat(inbox): load conversation archive states"
```

---

### Task 3: Persist Channel On New Messages

**Files:**
- Modify: `supabase/functions/whatsapp-inbound/index.ts`
- Modify: `supabase/functions/whatsapp-send/index.ts`
- Modify: `src/lib/crmService.ts`

**Interfaces:**
- Consumes: `inbox_messages.channel_id` from Task 1.
- Produces: all new inbound and outbound WhatsApp messages include `channel_id`.
- Produces: inbound message reopens archived conversations for the same `(owner_id, telefone, channel_id)`.

- [ ] **Step 1: Change inbound channel resolution return shape**

In `supabase/functions/whatsapp-inbound/index.ts`, change `resolveOwnerId` to `resolveOwnerChannel`:

```ts
async function resolveOwnerChannel(
  supabase: SupabaseClientAny,
  message: NormalizedInboundMessage,
) {
  if (message.instanceId) {
    const { data, error } = await supabase
      .from("integration_channels")
      .select("id, owner_id")
      .eq("provider", "z-api")
      .eq("status", "ativo")
      .contains("metadata", { instanceId: message.instanceId })
      .limit(1)
      .maybeSingle();

    if (!error && data?.owner_id) {
      return { ownerId: data.owner_id as string, channelId: data.id as string };
    }
  }

  if (message.channelIdentifiers.length > 0) {
    const providers = uniqueStrings([message.provider, "whatsapp", "whatsapp_cloud"]);
    const { data, error } = await supabase
      .from("integration_channels")
      .select("id, owner_id")
      .in("numero", message.channelIdentifiers)
      .in("provider", providers)
      .eq("status", "ativo")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (data?.owner_id) {
      return { ownerId: data.owner_id as string, channelId: data.id as string };
    }
  }

  const defaultOwnerId = Deno.env.get("FUNIL_DEFAULT_OWNER_ID") ?? null;
  return { ownerId: defaultOwnerId, channelId: null };
}
```

- [ ] **Step 2: Insert inbound `channel_id` and reopen archive**

In `processInboundMessage`, replace owner lookup:

```ts
const { ownerId, channelId } = await resolveOwnerChannel(supabase, inboundMessage);
if (!ownerId) {
  throw new Error("No active integration channel found for inbound message.");
}
```

Include `channel_id: channelId` in the insert payload.

After successful insert, add:

```ts
await supabase
  .from("inbox_conversation_states")
  .update({ archived_at: null, archived_by: null, archive_reason: null })
  .eq("owner_id", ownerId)
  .eq("telefone", finalPhone)
  .eq("channel_key", channelId ?? "legacy");
```

- [ ] **Step 3: Insert outbound `channel_id`**

In `supabase/functions/whatsapp-send/index.ts`, include:

```ts
channel_id: channel.id,
```

inside the `inbox_messages` insert payload.

- [ ] **Step 4: Local fallback messages remain legacy-safe**

In `src/lib/crmService.ts`, keep `createInboxMessage` compatible by adding:

```ts
channel_id: payload.channel_id ?? null,
```

and add `channel_id?: string | null` to `MessagePayload`.

- [ ] **Step 5: Verify functions compile structurally**

Run: `npm run typecheck`

Expected: frontend TypeScript passes. Edge Functions are not part of `tsc`; inspect modified Deno files for syntax consistency.

- [ ] **Step 6: Commit**

```bash
git add supabase/functions/whatsapp-inbound/index.ts supabase/functions/whatsapp-send/index.ts src/lib/crmService.ts
git commit -m "feat(inbox): persist whatsapp channel on messages"
```

---

### Task 4: Inbox UI Filtering And Archive Actions

**Files:**
- Modify: `src/pages/Inbox.tsx`

**Interfaces:**
- Consumes: `messages`, `channels`, and `conversationStates`.
- Consumes service functions from Task 2.
- Produces: visible conversation object with `channelId`, `channelLabel`, `isArchived`, and `archiveState`.

- [ ] **Step 1: Add archive tab and channel filter types**

Change filter tab type:

```ts
const [filterTab, setFilterTab] = useState<"abertas" | "nao_lidas" | "arquivadas" | "todas">("abertas");
const [channelFilter, setChannelFilter] = useState<string>("ativos");
```

Use filter values:

```ts
type ChannelFilter = "ativos" | "legado" | "todos" | string;
```

- [ ] **Step 2: Build state lookup**

Add:

```ts
const archiveStateByConversation = useMemo(() => {
  const map = new Map<string, InboxConversationState>();
  for (const state of conversationStates) {
    const channelKey = state.channel_id ?? "legacy";
    map.set(`${unifyPhone(state.telefone)}:${channelKey}`, state);
  }
  return map;
}, [conversationStates]);
```

- [ ] **Step 3: Add channel metadata to grouped conversations**

Inside conversation mapping:

```ts
const channelId = latest.channel_id ?? null;
const channel = channelId ? channels.find((item) => item.id === channelId) : null;
const channelKey = channelId ?? "legacy";
const archiveState = archiveStateByConversation.get(`${key}:${channelKey}`) ?? null;
const isArchived = Boolean(archiveState?.archived_at);
const channelLabel = channel
  ? `${formatProviderName(channel.provider)} ${displayPhone(channel.numero)}`
  : "Legado / sem canal";
```

Return these properties in the conversation object.

- [ ] **Step 4: Filter by archived state**

In `displayedConversations`:

```ts
if (filterTab === "arquivadas" && !conv.isArchived) return false;
if (filterTab !== "arquivadas" && filterTab !== "todas" && conv.isArchived) return false;
if (filterTab === "abertas" && conv.isResolved) return false;
if (filterTab === "nao_lidas" && conv.unreadCount === 0) return false;
```

- [ ] **Step 5: Filter by channel**

Add after status filters:

```ts
if (channelFilter === "ativos") {
  const isActiveChannel = conv.channelId
    ? activeChannels.some((channel) => channel.id === conv.channelId)
    : false;
  if (!isActiveChannel) return false;
}
if (channelFilter === "legado" && conv.channelId !== null) return false;
if (!["ativos", "legado", "todos"].includes(channelFilter) && conv.channelId !== channelFilter) return false;
```

- [ ] **Step 6: Add UI controls**

Add a fourth segmented tab:

```tsx
<button onClick={() => setFilterTab("arquivadas")}>Arquivadas</button>
```

Add a compact channel row:

```tsx
<span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground w-9 shrink-0">Canal</span>
<select
  value={channelFilter}
  onChange={(event) => setChannelFilter(event.target.value)}
  className="flex-1 bg-foreground/5 border border-foreground/10 rounded-lg px-2 py-1 text-[11px] text-foreground"
>
  <option value="ativos">Numero atual</option>
  <option value="legado">Legado</option>
  <option value="todos">Todos</option>
  {channels.map((channel) => (
    <option key={channel.id} value={channel.id}>
      {formatProviderName(channel.provider)} {displayPhone(channel.numero)}
    </option>
  ))}
</select>
```

- [ ] **Step 7: Add archive and unarchive actions**

For active conversations, add:

```tsx
<button type="button" onClick={() => handleArchiveConversation(conv)}>
  Arquivar
</button>
```

For archived conversations, add:

```tsx
<button type="button" onClick={() => handleUnarchiveConversation(conv)}>
  Reabrir
</button>
```

Handlers:

```ts
const handleArchiveConversation = async (conv: ConversationViewModel) => {
  await archiveInboxConversations(
    [{ owner_id: conv.latest.owner_id, telefone: conv.key, channel_id: conv.channelId }],
    "Arquivado manualmente na Inbox",
  );
  await queryClient.invalidateQueries({ queryKey: ["crm-snapshot"] });
  toast.success("Conversa arquivada.");
};

const handleUnarchiveConversation = async (conv: ConversationViewModel) => {
  await unarchiveInboxConversation({
    owner_id: conv.latest.owner_id,
    telefone: conv.key,
    channel_id: conv.channelId,
  });
  await queryClient.invalidateQueries({ queryKey: ["crm-snapshot"] });
  toast.success("Conversa reaberta.");
};
```

- [ ] **Step 8: Add bulk cleanup for inactive/legacy conversations**

Compute:

```ts
const cleanupCandidates = conversations.filter((conv) => {
  if (conv.isArchived || conv.unreadCount > 0) return false;
  if (conv.channelId === null) return true;
  return !activeChannels.some((channel) => channel.id === conv.channelId);
});
```

Add a banner when candidates exist:

```tsx
<div className="p-4 m-4 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl">
  <strong>Conversas antigas encontradas</strong>
  <p className="mt-1">Arquive conversas de canais antigos para manter a Inbox limpa.</p>
  <button type="button" onClick={handleArchiveCleanupCandidates}>
    Arquivar conversas antigas
  </button>
</div>
```

Handler:

```ts
const handleArchiveCleanupCandidates = async () => {
  await archiveInboxConversations(
    cleanupCandidates.map((conv) => ({
      owner_id: conv.latest.owner_id,
      telefone: conv.key,
      channel_id: conv.channelId,
    })),
    "Arquivado por troca de numero/canal WhatsApp",
  );
  await queryClient.invalidateQueries({ queryKey: ["crm-snapshot"] });
  toast.success("Conversas antigas arquivadas.");
};
```

- [ ] **Step 9: Run typecheck**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add src/pages/Inbox.tsx
git commit -m "feat(inbox): archive conversations by channel"
```

---

### Task 5: Verification

**Files:**
- Verify: `supabase/migrations/20260716180000_inbox_conversation_archiving.sql`
- Verify: `src/pages/Inbox.tsx`
- Verify: `src/lib/crmService.ts`
- Verify: `supabase/functions/whatsapp-inbound/index.ts`
- Verify: `supabase/functions/whatsapp-send/index.ts`

**Interfaces:**
- Consumes all previous tasks.
- Produces verified behavior and a final commit-ready state.

- [ ] **Step 1: Static verification**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 2: Production build verification**

Run: `npm run build`

Expected: PASS and Vite build output.

- [ ] **Step 3: Manual browser verification**

Open `/inbox` and verify:

```text
1. Default tab shows non-archived active conversations.
2. "Arquivadas" shows archived conversations.
3. "Numero atual" hides legacy/inactive channel conversations.
4. "Legado" shows old messages without channel_id.
5. Manual "Arquivar" removes a conversation from "Abertas" and moves it to "Arquivadas".
6. "Reabrir" returns it to active views.
7. Bulk cleanup does not include unread conversations.
8. No messages are deleted from the chat when archiving.
```

- [ ] **Step 4: Final status**

Run: `git status --short`

Expected: only intentional files modified, or clean after commits.

---

## Self-Review

- Spec coverage: archive state, channel-aware filtering, legacy handling, no deletion, inbound reopen, seller/admin safety, and verification are all covered.
- Placeholder scan: no `TBD`, `TODO`, or incomplete task remains.
- Type consistency: the plan uses `channel_id`, `InboxConversationState`, `archiveInboxConversations`, and `unarchiveInboxConversation` consistently.
