-- =============================================================================
-- Fix: WhatsApp connection status never reaches the front-end in real time.
--
-- Root cause: the front-end (WhatsAppIntegration.tsx) subscribes to Postgres
-- realtime UPDATE events on `integration_channels`, but this table was never
-- added to the `supabase_realtime` publication (see 20260707105014_enable_realtime.sql,
-- which only added inbox_messages, contacts, leads, opportunities).
--
-- Because the table was not published, Postgres never emitted change events for
-- it, so the realtime listener that flips the UI to "WhatsApp Conectado" (and
-- the toast) NEVER fired. The UI was left stranded on "Conectando seu WhatsApp...".
--
-- This migration adds `integration_channels` to the realtime publication so that
-- when the Z-API on-connect webhook (whatsapp-qr-inbound) — or the status poll —
-- updates the row to status='ativo', the change is pushed to the authenticated
-- owner in real time. RLS (auth.uid() = owner_id) already scopes the broadcast
-- to the owning user, so no cross-tenant leakage occurs.
--
-- Idempotent: guarded so re-running does not error if the table is already in
-- the publication.
-- =============================================================================

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'integration_channels'
  ) then
    alter publication supabase_realtime add table public.integration_channels;
  end if;
end
$$;

-- REPLICA IDENTITY FULL ensures the realtime payload (payload.new) carries all
-- columns (numero, status, metadata) on UPDATE, which the front-end handler reads.
alter table public.integration_channels replica identity full;
