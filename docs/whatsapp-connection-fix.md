# Correção — WhatsApp fica em “Conectando...” apesar da Z-API mostrar “Conectado”

## Sintoma
No painel da Z-API a instância aparece **Conectado** após ler o QR Code, mas o
Funil (/perfil → Conexão WhatsApp) fica preso em **“Conectando seu WhatsApp...”**
e nunca conclui.

## Diagnóstico (verificado por revisão adversarial multi-agente + contrato da Z-API)

O problema **não era timeout** (a Z-API conecta). São várias falhas na
**sincronização Z-API → back-end → banco → front-end**:

1. **Realtime desligado para `integration_channels`** *(causa principal do push instantâneo)*
   A migração `20260707105014_enable_realtime.sql` publica `inbox_messages`,
   `contacts`, `leads`, `opportunities` — **mas nunca `integration_channels`**.
   O front-end escuta `postgres_changes` UPDATE dessa tabela; como ela não está na
   publicação `supabase_realtime`, o Postgres **nunca emite o evento** e o listener
   que vira a UI para “Conectado” jamais dispara.

2. **Webhook de conexão da Z-API rejeitado no nível da plataforma**
   Não existia `supabase/config.toml`. O padrão é `verify_jwt = true`, então o POST
   do webhook `ConnectedCallback` da Z-API (que não envia JWT do Supabase) era
   **rejeitado com 401 antes do nosso handler rodar** — o evento de conexão nunca
   chegava ao banco.

3. **A verificação de status podia derrubar “conectado” para “falso”**
   - `getInstanceStatus` fazia a busca do telefone (`/device`) dentro do mesmo
     `try/catch` do estado de conexão: um timeout/erro do `/device` era engolido e
     retornava `{connected:false}` mesmo já sabendo que estava conectado.
   - A action `status` gravava o literal `numero='connected'`, que colide com a
     constraint global `unique(provider, numero)` e podia **lançar erro → 500**, e o
     front-end tratava o 500 como “não conectado”.

4. **Front-end escondia falhas de rede durante o polling**
   O `catch` do `checkStatus` só sinalizava erro quando `status === "loading"`.
   Durante o polling `status` é `"disconnected"`, então um status-check que
   estourasse o timeout era **silenciosamente engolido** e o spinner ficava eterno.

## O que foi alterado (código)

| Arquivo | Mudança |
|---|---|
| `supabase/migrations/20260708120000_realtime_integration_channels.sql` | **NOVO** — adiciona `integration_channels` à publicação `supabase_realtime` + `REPLICA IDENTITY FULL`. |
| `supabase/config.toml` | **NOVO** — `verify_jwt = false` só para `whatsapp-qr-inbound` e `whatsapp-inbound` (webhooks públicos). Demais funções seguem protegidas. |
| `supabase/functions/whatsapp-manager/providers/ZApiProvider.ts` | `getInstanceStatus` reescrito: `connected` vem só do `/status`; busca de telefone (`/device`) isolada e **não pode mais** virar `connected` para false; **loga a resposta bruta** do `/status` (diagnóstico definitivo no próximo teste). |
| `supabase/functions/whatsapp-manager/index.ts` | Action `status` retorna `connected` se **Z-API ao vivo OU banco já `ativo`** (pega o resultado do webhook mesmo se o `/status` oscilar); UPDATE do banco em `try/catch` — **nunca mais 500 esconde o `connected`**; placeholders de `numero` com escopo por dono (`pending-<id>`) eliminam a colisão de unicidade; logs detalhados. |
| `supabase/functions/whatsapp-qr-inbound/index.ts` | Handler do webhook grava só telefone real em `numero` (nunca literais que colidem); preserva identidade no disconnect; logs e checagem de erro do UPDATE. |
| `src/components/WhatsAppIntegration.tsx` | `catch` do polling não engole mais falhas (mostra aviso + escape); botão **“Já escaneei — Verificar conexão”** sempre disponível (usuário nunca fica preso); só exibe telefone real; listener de realtime endurecido (sem flicker no reconnect, sem toast duplicado); ao expirar faz uma última verificação e cai num **estado de falha tratada** (sem spinner infinito). |

## ⚠️ Passos de configuração OBRIGATÓRIOS (sem eles a correção não fica completa)

1. **Aplicar a migração** no projeto Supabase (`juvwfxnlusrnvcarkrmc`):
   `supabase db push` (ou aplicar o SQL de `20260708120000_realtime_integration_channels.sql`).

2. **Fazer deploy das functions com JWT desligado** nos webhooks:
   ```
   supabase functions deploy whatsapp-qr-inbound --no-verify-jwt
   supabase functions deploy whatsapp-inbound   --no-verify-jwt
   supabase functions deploy whatsapp-manager
   ```
   (o `config.toml` já fixa isso para deploys via CLI).

3. **Configurar o webhook de conexão na Z-API** (painel → *Webhooks e configurações gerais*):
   - **Ao conectar** e **Ao desconectar** →
     `https://juvwfxnlusrnvcarkrmc.supabase.co/functions/v1/whatsapp-qr-inbound`
   - **Ao receber** (se ainda não estiver) →
     `https://juvwfxnlusrnvcarkrmc.supabase.co/functions/v1/whatsapp-inbound`

4. Conferir os secrets no Supabase: `ZAPI_INSTANCE_ID`, `ZAPI_INSTANCE_TOKEN`,
   `ZAPI_CLIENT_TOKEN` devem apontar para a **mesma** instância mostrada no painel
   (`3F5BB61CB12C01FFC98A02DFFFEFDAC7`).

## Como validar (agora com diagnóstico embutido)
Após escanear, olhe os logs da function `whatsapp-manager` (Supabase → Edge Functions → Logs):
- `[ZApiProvider] RAW /status response: {...}` mostra **exatamente** o que a Z-API devolve.
  - Se vier `connected:true` → a UI conecta pelo polling.
  - Se vier `connected:false` com o painel “Conectado” → é divergência de
    instância/credenciais (passo 4) e o webhook (`ConnectedCallback`) passa a ser o
    caminho de confirmação.

## Limitações conhecidas da Z-API
- O `/status` pode reportar `connected:false` por alguns segundos logo após o scan
  enquanto sincroniza; por isso passamos a confiar também no webhook + banco `ativo`.
- Se o webhook “Ao desconectar” não disparar, uma desconexão feita no celular pode
  demorar a refletir — use o botão **Desconectar** para forçar.
