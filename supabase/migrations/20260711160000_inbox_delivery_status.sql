-- Observabilidade de entrega por mensagem.
-- A Meta envia eventos `statuses` (sent/delivered/read/failed) no mesmo webhook
-- do inbound. Até agora eram ignorados — a função whatsapp-inbound passa a casar
-- cada status pela wamid (provider_message_id) e gravar aqui, para o Inbox
-- mostrar por que uma mensagem não chegou (código de erro da Meta, ex.: 131049).

alter table public.inbox_messages
  add column if not exists delivery_status text
    check (delivery_status is null
           or delivery_status in ('sent', 'delivered', 'read', 'failed')),
  add column if not exists delivery_error text;

-- O UPDATE de status casa pela wamid; índice acelera esse lookup.
create index if not exists inbox_messages_provider_message_id_idx
  on public.inbox_messages (provider_message_id);
