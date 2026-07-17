-- Captura do GA4 client_id no lead (para stitching de conversões offline no GA4).
-- Preenchido pelo formulário web (Edge Function lead-intake). Nullable: a maioria
-- dos leads (WhatsApp/prospecção) não tem client_id, e tudo bem.
alter table public.leads
  add column if not exists ga_client_id text;
