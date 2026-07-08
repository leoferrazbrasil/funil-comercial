-- =============================================================================
-- Fix: mensagens recebidas da Z-API falhavam ao inserir com
--   "Could not find the 'metadata' column of 'inbox_messages' ... (PGRST204)".
--
-- As Edge Functions whatsapp-inbound e whatsapp-qr-inbound gravam um campo
-- `metadata` (jsonb) em inbox_messages — usado para o mapeamento de chat_lid /
-- tipo de mensagem — mas a coluna nunca foi criada (a tabela original em
-- 20260702162000 não a tinha, e 20260703103000 só adicionou provider/
-- provider_message_id). Sem a coluna, TODO insert de mensagem recebida falha.
--
-- Additive e idempotente.
-- =============================================================================

alter table public.inbox_messages
  add column if not exists metadata jsonb not null default '{}'::jsonb;

-- Acelera o lookup de reconciliação por chat_lid usado no whatsapp-inbound
-- (metadata->>'chat_lid') para unificar mensagens ocultas por LID da Z-API.
create index if not exists inbox_messages_owner_chat_lid_idx
  on public.inbox_messages (owner_id, (metadata->>'chat_lid'));
