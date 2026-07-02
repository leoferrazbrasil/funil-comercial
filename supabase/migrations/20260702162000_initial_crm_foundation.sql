create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  email text,
  telefone text,
  role text not null default 'gestor' check (role in ('diretor', 'gestor', 'vendedor')),
  created_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  telefone text not null,
  email text,
  origem text not null default 'Manual',
  potencial text not null default 'Novo',
  created_at timestamptz not null default now(),
  unique (owner_id, telefone)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  nome text not null,
  telefone text not null,
  email text,
  interesse text not null,
  status text not null default 'novo' check (status in ('novo', 'em_atendimento', 'qualificado', 'convertido', 'perdido')),
  valor_estimado numeric(14, 2) not null default 0,
  proxima_acao text not null default 'Realizar primeiro contato',
  origem text not null default 'Manual',
  created_at timestamptz not null default now()
);

create table if not exists public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  posicao integer not null,
  created_at timestamptz not null default now(),
  unique (owner_id, nome)
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  titulo text not null,
  etapa text not null default 'Novo',
  valor numeric(14, 2) not null default 0,
  responsavel text not null default 'Equipe comercial',
  proxima_acao text not null default 'Definir próximo passo',
  created_at timestamptz not null default now()
);

create table if not exists public.inbox_messages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  canal text not null default 'WhatsApp',
  remetente_nome text not null,
  telefone text not null,
  mensagem text not null,
  status text not null default 'Novo lead',
  unread_count integer not null default 1,
  direction text not null default 'inbound' check (direction in ('inbound', 'outbound')),
  created_at timestamptz not null default now()
);

create index if not exists contacts_owner_created_at_idx on public.contacts (owner_id, created_at desc);
create index if not exists leads_owner_status_idx on public.leads (owner_id, status);
create index if not exists leads_owner_created_at_idx on public.leads (owner_id, created_at desc);
create index if not exists opportunities_owner_stage_idx on public.opportunities (owner_id, etapa);
create index if not exists inbox_messages_owner_created_at_idx on public.inbox_messages (owner_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.leads enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.opportunities enable row level security;
alter table public.inbox_messages enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "contacts_crud_own" on public.contacts;
drop policy if exists "leads_crud_own" on public.leads;
drop policy if exists "pipeline_stages_crud_own" on public.pipeline_stages;
drop policy if exists "opportunities_crud_own" on public.opportunities;
drop policy if exists "inbox_messages_crud_own" on public.inbox_messages;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "contacts_crud_own"
  on public.contacts for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "leads_crud_own"
  on public.leads for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "pipeline_stages_crud_own"
  on public.pipeline_stages for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "opportunities_crud_own"
  on public.opportunities for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "inbox_messages_crud_own"
  on public.inbox_messages for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
