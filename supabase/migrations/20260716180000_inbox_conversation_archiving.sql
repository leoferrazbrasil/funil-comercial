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
