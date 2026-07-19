-- Atribuição Click-to-WhatsApp (CTWA)
--
-- Guarda o `ctwa_clid` (click id do anúncio) no lead e no contato para que, dias
-- depois, ao qualificar o lead, seja possível devolver o evento para a Meta via
-- Conversions API (action_source=business_messaging) com atribuição precisa.
--
-- O clid vem apenas do webhook da Meta Cloud API. Z-API não o repassa.
-- Aplicar colando o CONTEÚDO deste arquivo no SQL Editor do Supabase.

alter table public.leads
  add column if not exists ctwa_clid text,
  add column if not exists ctwa_source_id text,
  add column if not exists ctwa_clid_at timestamptz,
  add column if not exists ctwa_reported_at timestamptz;

alter table public.contacts
  add column if not exists ctwa_clid text,
  add column if not exists ctwa_source_id text,
  add column if not exists ctwa_clid_at timestamptz;

comment on column public.leads.ctwa_clid is
  'Click ID do anúncio Click-to-WhatsApp que originou a conversa. Obrigatório na CAPI de Business Messaging.';
comment on column public.leads.ctwa_reported_at is
  'Quando o evento de lead qualificado foi devolvido à Meta. NULL = ainda não reportado (evita duplicidade).';

-- Busca por clid e varredura de pendentes de envio.
create index if not exists leads_ctwa_clid_idx
  on public.leads (ctwa_clid)
  where ctwa_clid is not null;

create index if not exists leads_ctwa_pending_idx
  on public.leads (owner_id, ctwa_clid_at)
  where ctwa_clid is not null and ctwa_reported_at is null;

create index if not exists contacts_ctwa_clid_idx
  on public.contacts (ctwa_clid)
  where ctwa_clid is not null;
