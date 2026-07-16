alter table public.inbox_messages
  add column if not exists channel_id uuid references public.integration_channels(id) on delete restrict;

create index if not exists inbox_messages_owner_channel_phone_idx
  on public.inbox_messages (owner_id, channel_id, telefone);

create table if not exists public.inbox_conversation_states (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  telefone text not null,
  channel_id uuid references public.integration_channels(id) on delete restrict,
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

create or replace function public.conversation_state_phone_key(p_value text)
returns text
language plpgsql
immutable
strict
parallel safe
as $$
declare
  phone text := regexp_replace(p_value, '[^0-9]', '', 'g');
begin
  while left(phone, 1) = '0' loop
    phone := substring(phone from 2);
  end loop;

  while left(phone, 3) = '550' loop
    phone := '55' || substring(phone from 4);
  end loop;

  if length(phone) in (10, 11) then
    phone := '55' || phone;
  end if;

  if length(phone) = 13
    and left(phone, 2) = '55'
    and substring(phone from 5 for 1) = '9'
  then
    phone := substring(phone from 1 for 4) || substring(phone from 6);
  end if;

  return phone;
end;
$$;

drop policy if exists "conversation_states_admin_all" on public.inbox_conversation_states;
create policy "conversation_states_admin_all"
  on public.inbox_conversation_states for all
  using (auth.uid() = owner_id)
  with check (
    auth.uid() = owner_id
    and (archived_by is null or archived_by = auth.uid())
  );

drop policy if exists "conversation_states_assignee_read" on public.inbox_conversation_states;
-- Handoff authorization is phone-level by design; channel_id scopes state identity, not assignment.
create policy "conversation_states_assignee_read"
  on public.inbox_conversation_states for select
  using (
    exists (
      select 1
      from public.conversation_assignments ca
      where ca.owner_id = inbox_conversation_states.owner_id
        and ca.assigned_to = auth.uid()
        and public.conversation_state_phone_key(ca.telefone) =
          public.conversation_state_phone_key(inbox_conversation_states.telefone)
    )
  );

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'inbox_conversation_states'
  ) then
    alter publication supabase_realtime add table public.inbox_conversation_states;
  end if;
end
$$;

alter table public.inbox_conversation_states replica identity full;
