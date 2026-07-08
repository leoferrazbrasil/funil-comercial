# WhatsApp inbound webhook

Edge Function responsavel por receber mensagens da WhatsApp Business Platform
Cloud API da Meta e de webhooks HTTP compativeis, registrar a entrada no Inbox
e preservar o vinculo com contatos/leads existentes por telefone.

## URL

```text
https://juvwfxnlusrnvcarkrmc.supabase.co/functions/v1/whatsapp-inbound
```

Para provedores genericos ou testes sem assinatura da Meta, use o token
compartilhado por header ou query string:

```text
https://juvwfxnlusrnvcarkrmc.supabase.co/functions/v1/whatsapp-inbound?token=SEU_TOKEN
```

## Verificacao da Meta

Configure no painel da Meta:

- Callback URL: URL da Edge Function.
- Verify token: mesmo valor de `META_WEBHOOK_VERIFY_TOKEN`.
- Campos do webhook: `messages`.

A funcao responde ao desafio `GET` com `hub.challenge` quando:

- `hub.mode=subscribe`
- `hub.verify_token` bate com `META_WEBHOOK_VERIFY_TOKEN`

## Secrets da Edge Function

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
META_WEBHOOK_VERIFY_TOKEN=...
META_APP_SECRET=...
FUNIL_WEBHOOK_SECRET=...
FUNIL_DEFAULT_OWNER_ID=...
```

`META_APP_SECRET` habilita validacao de `X-Hub-Signature-256`.
`FUNIL_WEBHOOK_SECRET` serve para testes controlados e provedores que nao usam
assinatura da Meta.
`FUNIL_DEFAULT_OWNER_ID` e fallback temporario quando o numero de destino ainda
nao esta cadastrado em `integration_channels`.

## Mapeamento do canal

A funcao tenta localizar o dono do CRM pela tabela `integration_channels`:

- `provider`: `whatsapp`, `whatsapp_cloud`, `twilio` ou outro identificador.
- `numero`: numero oficial exibido pela Meta ou `phone_number_id`, normalizado
  somente com digitos.
- `status`: precisa estar como `ativo`.

Para a Cloud API, cadastre o canal no Inbox com provider `whatsapp` e o numero
oficial do WhatsApp com DDI, apenas digitos.

## Payload aceito

### Meta Cloud API

A funcao processa payloads `whatsapp_business_account` com:

- `entry[].changes[].value.metadata.display_phone_number`
- `entry[].changes[].value.metadata.phone_number_id`
- `entry[].changes[].value.contacts[].profile.name`
- `entry[].changes[].value.messages[]`

Tipos suportados:

- `text`
- `button`
- `interactive`
- midias com `caption` ou texto fallback

Eventos sem `messages`, como status de entrega, sao ignorados com `ok: true`.

### Generico/Twilio

Campos reconhecidos:

- Twilio: `From`, `To`, `Body`, `ProfileName`, `MessageSid`
- Generico: `from`, `to`, `message`, `name`, `id`

## Comportamento de CRM

Ao receber uma mensagem valida, a funcao:

1. resolve o owner pelo canal ativo;
2. procura contato existente pelo telefone do remetente;
3. procura lead ativo pelo telefone do remetente;
4. registra a mensagem em `inbox_messages`;
5. vincula `contact_id` e `lead_id` quando ja existem;
6. nao cria contato ou lead automaticamente.

A criacao ou vinculacao manual continua no Inbox, evitando duplicidades e
mantendo o usuario no controle do fluxo comercial.

## Deduplicacao

Mensagens com `provider_message_id` repetido para o mesmo owner/provider usam o
indice unico `inbox_messages_provider_message_unique_idx`. Duplicatas retornam:

```json
{ "ok": true, "duplicate": true }
```

## Logs

A funcao registra apenas logs sanitizados:

- evento processado ou duplicado;
- provider;
- tipo de mensagem;
- ultimos 4 digitos do remetente;
- flags de vinculo com contato/lead.

Conteudo da mensagem, tokens e connection strings nao sao logados.
