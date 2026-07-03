# WhatsApp inbound webhook

Edge Function responsavel por receber mensagens de provedores como Twilio Sandbox, Twilio WhatsApp Sender ou outros webhooks HTTP compativeis.

## URL

```text
https://dtdtewojmyhiegwmgmte.supabase.co/functions/v1/whatsapp-inbound?token=SEU_TOKEN
```

## Secrets da Edge Function

```bash
SUPABASE_SERVICE_ROLE_KEY=...
FUNIL_WEBHOOK_SECRET=...
FUNIL_DEFAULT_OWNER_ID=...
```

`FUNIL_DEFAULT_OWNER_ID` e usado apenas quando o numero de destino ainda nao esta cadastrado em `integration_channels`.

## Mapeamento

A funcao tenta localizar o dono do CRM pela tabela `integration_channels`, usando:

- `provider`: `twilio`, `whatsapp` ou outro identificador do provedor.
- `numero`: numero de destino normalizado, somente digitos.
- `status`: precisa estar como `ativo`.

## Payload aceito

Aceita JSON, `application/x-www-form-urlencoded` e `multipart/form-data`.

Campos reconhecidos:

- Twilio: `From`, `To`, `Body`, `ProfileName`, `MessageSid`
- Generico: `from`, `to`, `message`, `name`, `id`

Ao receber a mensagem, a funcao cria ou reutiliza:

1. contato
2. lead ativo
3. mensagem no inbox
