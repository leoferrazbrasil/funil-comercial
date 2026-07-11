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
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_admin_reads_members" on public.profiles;
create policy "profiles_admin_reads_members" on public.profiles
  for select
  using (auth.uid() = id or admin_id = auth.uid());

-- 8) Trava a identidade da conversa: owner_id e telefone são imutáveis em
--    qualquer UPDATE de inbox_messages (nenhuma operação legítima os altera).
--    Impede que um vendedor atribuído reescreva esses campos e sequestre
--    a mensagem/conversa para outra conta ou outro telefone.
create or replace function public.inbox_messages_lock_identity()
returns trigger language plpgsql as $$
begin
  if new.owner_id <> old.owner_id or new.telefone is distinct from old.telefone then
    raise exception 'owner_id e telefone da mensagem sao imutaveis';
  end if;
  return new;
end;
$$;
drop trigger if exists inbox_messages_lock_identity on public.inbox_messages;
create trigger inbox_messages_lock_identity
  before update on public.inbox_messages
  for each row execute function public.inbox_messages_lock_identity();

-- 9) Restaura o DELETE do dono (a policy antiga "inbox_messages_crud_own"
--    era "for all" e cobria DELETE; a nova cobre apenas SELECT/UPDATE/INSERT).
drop policy if exists "inbox_delete_own" on public.inbox_messages;
create policy "inbox_delete_own" on public.inbox_messages
  for delete using (auth.uid() = owner_id);

-- 10) Defesa em profundidade: valida que assigned_to é de fato um vendedor
--     do admin dono da conversa (ou o próprio admin), mesmo que a policy de
--     "assignments_admin_all" já restrinja owner_id ao auth.uid() atual.
create or replace function public.conversation_assignment_validate()
returns trigger language plpgsql
security definer set search_path = public as $$
begin
  if new.assigned_to <> new.owner_id and not exists (
    select 1 from public.profiles p
    where p.id = new.assigned_to and p.admin_id = new.owner_id
  ) then
    raise exception 'assigned_to deve ser um vendedor do admin dono da conversa';
  end if;
  return new;
end;
$$;
drop trigger if exists conversation_assignment_validate on public.conversation_assignments;
create trigger conversation_assignment_validate
  before insert or update on public.conversation_assignments
  for each row execute function public.conversation_assignment_validate();
