-- Campanhas (Fase 2): persistência + agendamento de disparos de template.
-- O envio é feito server-side pela Edge Function campaign-runner (service-role).

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  template_name text not null,
  template_language text not null default 'pt_BR',
  body_text text not null default '',
  -- Configuração das variáveis: [{ "mode": "name"|"fixed", "value": "..." }]
  variables jsonb not null default '[]'::jsonb,
  scheduled_at timestamptz not null default now(),
  status text not null default 'scheduled'
    check (status in ('scheduled', 'sending', 'done', 'failed', 'canceled')),
  total integer not null default 0,
  sent integer not null default 0,
  failed integer not null default 0,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  nome text not null default 'Contato',
  telefone text not null,
  contact_id uuid references public.contacts(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'sending', 'sent', 'error')),
  error text,
  claimed_at timestamptz,
  -- id da mensagem na Meta: marca durável de "já enviado" (idempotência ao
  -- recuperar destinatários presos em 'sending').
  provider_message_id text,
  attempts integer not null default 0,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists campaigns_owner_created_idx
  on public.campaigns (owner_id, created_at desc);

create index if not exists campaigns_status_scheduled_idx
  on public.campaigns (status, scheduled_at);

create index if not exists campaign_recipients_campaign_status_idx
  on public.campaign_recipients (campaign_id, status);

-- Reusa a função set_updated_at() criada na migração de canais.
drop trigger if exists campaigns_set_updated_at on public.campaigns;
create trigger campaigns_set_updated_at
  before update on public.campaigns
  for each row
  execute function public.set_updated_at();

alter table public.campaigns enable row level security;
alter table public.campaign_recipients enable row level security;

drop policy if exists "campaigns_crud_own" on public.campaigns;
create policy "campaigns_crud_own"
  on public.campaigns for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "campaign_recipients_crud_own" on public.campaign_recipients;
create policy "campaign_recipients_crud_own"
  on public.campaign_recipients for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Segurança: o owner de um destinatário é SEMPRE derivado da campanha, nunca do
-- que o cliente enviar. Com a RLS (with check auth.uid()=owner_id), isso impede
-- injetar destinatários na campanha de outro dono (o owner viraria o da vítima
-- e o with check reprovaria o insert do atacante).
create or replace function public.campaign_recipient_set_owner()
returns trigger
language plpgsql
as $$
begin
  new.owner_id := (select owner_id from public.campaigns where id = new.campaign_id);
  return new;
end;
$$;

drop trigger if exists campaign_recipients_set_owner on public.campaign_recipients;
create trigger campaign_recipients_set_owner
  before insert on public.campaign_recipients
  for each row
  execute function public.campaign_recipient_set_owner();
