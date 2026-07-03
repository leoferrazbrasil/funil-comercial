create table if not exists public.integration_channels (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'whatsapp',
  nome text not null,
  numero text not null,
  status text not null default 'ativo' check (status in ('ativo', 'pausado', 'inativo')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, numero)
);

alter table public.inbox_messages
  add column if not exists provider text not null default 'manual',
  add column if not exists provider_message_id text;

create index if not exists integration_channels_owner_status_idx
  on public.integration_channels (owner_id, status);

create index if not exists integration_channels_provider_numero_idx
  on public.integration_channels (provider, numero);

create index if not exists leads_owner_telefone_idx
  on public.leads (owner_id, telefone);

create unique index if not exists inbox_messages_provider_message_unique_idx
  on public.inbox_messages (owner_id, provider, provider_message_id)
  where provider_message_id is not null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists integration_channels_set_updated_at on public.integration_channels;
create trigger integration_channels_set_updated_at
  before update on public.integration_channels
  for each row
  execute function public.set_updated_at();

alter table public.integration_channels enable row level security;

drop policy if exists "integration_channels_crud_own" on public.integration_channels;

create policy "integration_channels_crud_own"
  on public.integration_channels for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
