-- Roteiro Editorial: fila sequencial de próximos posts (rotação de pilares 4.2).
-- Puro Postgres + RLS; sem Edge Function. Aplicar colando no SQL Editor.

create table if not exists public.editorial_queue (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  pilar text not null check (pilar in ('dor','bastidores','metodo','prova')),
  tema text not null default '',
  status text not null default 'a_fazer'
    check (status in ('a_fazer','gerado','publicado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists editorial_queue_owner_created_idx
  on public.editorial_queue (owner_id, created_at);

-- Reusa set_updated_at() (criada na migração de canais do WhatsApp).
drop trigger if exists editorial_queue_set_updated_at on public.editorial_queue;
create trigger editorial_queue_set_updated_at
  before update on public.editorial_queue
  for each row execute function public.set_updated_at();

alter table public.editorial_queue enable row level security;

-- Cada dono só vê/escreve a própria fila. owner_id vem sempre da sessão no front.
drop policy if exists "editorial_queue_crud_own" on public.editorial_queue;
create policy "editorial_queue_crud_own"
  on public.editorial_queue for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
