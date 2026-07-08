# WhatsApp send function

Edge Function autenticada para enviar respostas de texto pela WhatsApp Business
Platform Cloud API e registrar o outbound no Inbox.

## URL

```text
https://juvwfxnlusrnvcarkrmc.supabase.co/functions/v1/whatsapp-send
```

## Autenticacao

A funcao exige `Authorization: Bearer <supabase_user_jwt>`.

O usuario autenticado precisa ser o owner do canal ativo em
`integration_channels`.

## Secrets

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
META_WHATSAPP_ACCESS_TOKEN=...
META_WHATSAPP_PHONE_NUMBER_ID=...
META_GRAPH_API_VERSION=...
```

Alternativas aceitas:

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`

`META_WHATSAPP_PHONE_NUMBER_ID` pode ser substituido pelo campo opcional
`ID do numero na Meta` no cadastro do canal, salvo como
`metadata.phone_number_id` em `integration_channels`.

## Payload

```json
{
  "phone": "5511999999999",
  "message": "Ola, tudo bem?",
  "source_message_id": "uuid-opcional",
  "contact_id": "uuid-opcional",
  "lead_id": "uuid-opcional"
}
```

## Comportamento

1. valida usuario autenticado;
2. localiza canal WhatsApp ativo do owner;
3. envia texto pela Cloud API;
4. registra mensagem outbound em `inbox_messages`;
5. marca a mensagem de origem como `Respondido`, quando enviada pelo Inbox.

Se nao houver canal ativo ou secrets de envio configurados, a funcao retorna
`fallback_allowed: true`. O front-end registra a resposta localmente no Inbox,
mantendo o atendimento funcional ate a configuracao completa do numero.

## Logs

Logs registram apenas:

- evento de envio;
- ultimos 4 digitos do destinatario;
- existencia de `provider_message_id`;
- status/erro tecnico sem corpo da mensagem.

Conteudo da resposta e access tokens nao sao logados.
