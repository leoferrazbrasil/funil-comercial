-- Agregadores de links multi-tenant (produto). Público lê os publicados; o dono
-- gere os seus pela tela /agregadores. Puro Postgres + RLS, sem Edge Function.

create table if not exists public.aggregators (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  tagline text not null default '',
  avatar_url text,
  status text,
  footer text,
  footer_highlight text,
  theme text not null default 'funil',
  links jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists aggregators_owner_idx
  on public.aggregators (owner_id, created_at desc);

-- Reusa set_updated_at() (migração de canais do WhatsApp).
drop trigger if exists aggregators_set_updated_at on public.aggregators;
create trigger aggregators_set_updated_at
  before update on public.aggregators
  for each row execute function public.set_updated_at();

alter table public.aggregators enable row level security;

-- Dono faz tudo no que é seu. owner_id vem sempre da sessão no front.
drop policy if exists "aggregators_owner_all" on public.aggregators;
create policy "aggregators_owner_all" on public.aggregators
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Qualquer um (inclusive anônimo, sem login) lê os PUBLICADOS — é o que permite
-- a página pública /l/:slug renderizar. Rascunhos (published=false) não vazam.
drop policy if exists "aggregators_public_read" on public.aggregators;
create policy "aggregators_public_read" on public.aggregators
  for select
  using (published = true);
