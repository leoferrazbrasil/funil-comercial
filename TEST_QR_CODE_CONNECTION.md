# 🧪 Guia de Testes: Conexão WhatsApp por QR Code

## Antes de Começar

1. **Ter um número de WhatsApp real** (não será alterado, apenas vinculado)
2. **Celular com WhatsApp instalado** (Android ou iOS)
3. **Conexão de Internet** estável em ambos os dispositivos
4. **DevTools aberto** (F12 ou Cmd+Shift+I) para ver logs

---

## ✅ Teste 1: Geração do QR Code

**Objetivo:** Verificar se o QR Code é gerado corretamente

### Passos:
1. Abrir navegador: `http://localhost:5173/perfil`
2. Rolar para seção "Conexão WhatsApp"
3. Clique em botão **"Conectar Número"**

### Verificações:
- [ ] Botão muda para "Gerando QR Code..." com loading
- [ ] QR Code aparece em grande tamanho (branco fundo preto)
- [ ] Mensagem: "Escaneie o QR Code com seu WhatsApp"
- [ ] Estado muda para: "Aguardando leitura do QR Code..."
- [ ] Dica de uso: "Escaneie com a câmera do seu celular"

### Verificar Console (DevTools → Console):
```
[WhatsAppIntegration] Status check: {connected: false}
```

### Se FALHAR:
- ❌ Aparecer erro de timeout
  - **Ação:** Verifique se ZAPI_INSTANCE_ID e ZAPI_INSTANCE_TOKEN estão configurados
  - **Ação:** Verifique logs do Supabase Edge Functions
- ❌ QR Code não aparecer
  - **Ação:** Recarregue a página (Ctrl+R)
  - **Ação:** Verifique se a instância Z-API está ativa

---

## ✅ Teste 2: Escanear QR Code (Sucesso Esperado)

**Objetivo:** Verificar se a conexão funciona após escanear

### Pré-requisito:
- QR Code visível na tela (do Teste 1)

### Passos:
1. **Abrir WhatsApp no celular**
2. **Android:** Toque em Menu (3 pontos) → "Dispositivos Vinculados" → "Vincular um dispositivo"
   **iOS:** Configurações → Computadores Vinculados → "Vincular um Computador"
3. **Apontar câmera do celular para o QR Code** na tela
4. **Aguardar leitura** (deve piscar quando ler)

### Verificações (Imediatas):
- [ ] Estado na tela muda para: **"QR Code lido! Finalizando conexão..."**
- [ ] Loading spinner continua animado
- [ ] Estado muda para: **"Conectando seu WhatsApp..."**

### Verificações (Após 30-90 segundos):
- [ ] Estado muda para: **"Sincronizando mensagens..."**
- [ ] ✅ Aparece: **"WhatsApp Conectado"** com número
- [ ] Toast verde no topo: **"WhatsApp conectado com sucesso!"**
- [ ] Botão "Desconectar" aparece (antes tinha "Conectar Número")

### Verificar Console:
```
[WhatsAppIntegration] Status check: {connected: false}
[WhatsAppIntegration] Status check: {connected: false}
[WhatsAppIntegration] Status check: {connected: false}
...
[WhatsAppIntegration] ✅ Connection successful!
[WhatsAppIntegration] Status check: {connected: true, phone: "5519999999999"}
```

### Verificar Supabase Edge Function Logs:
```
[whatsapp-manager] Creating instance for user...
[whatsapp-manager] QR Code generated successfully for instanceId=...
[whatsapp-manager] Checking status for channel ...
[whatsapp-manager] Instance connected! Updating status to ativo
```

### Próximas Ações:
✅ **Recarregar a página** (`Ctrl+R` ou `Cmd+R`)
- Deve manter "WhatsApp Conectado" (confirma que salvou no BD)

✅ **Ir para /inbox**
- Instância deve aparecer como "Conectada" (ícone verde)

✅ **Enviar mensagem teste**
- Deve conseguir enviar/receber normalmente

### Se FALHAR:
- ❌ Após 300 segundos (5 minutos) aparece "QR Code expirou"
  - **Ação:** Z-API demorou demais. Gere novo código e tente novamente
  - **Análise:** Verifique logs do Supabase para erros na conexão
- ❌ Estado fica em "Conectando..." e não avança
  - **Ação:** Verifique conexão de internet
  - **Ação:** Tente novo QR Code
  - **Análise:** Logs do Supabase podem indicar erro na Z-API

---

## ✅ Teste 3: Timeout e Expiração (300 segundos)

**Objetivo:** Verificar tratamento de QR Code expirado

### Passos:
1. Clicar "Conectar Número"
2. QR Code aparece
3. **NÃO ESCANEAR** - apenas aguardar
4. Deixar passar **5 minutos (300 segundos)**

### Verificações (Após ~300s):
- [ ] QR Code desaparece
- [ ] Volta para: "Nenhum número conectado no momento"
- [ ] Aparece caixa amarela com: **"QR Code expirou após 5 minutos"**
- [ ] Mensagem: "Gere um novo código e tente novamente"
- [ ] Botão agora diz: **"Gerar Novo QR Code"** (ícone de refresh)
- [ ] Toast no topo: **"QR Code expirado após 5 minutos"**

### Verificar Console:
```
[WhatsAppIntegration] Status check: {connected: false}
... (repetido a cada 3 segundos)
[Timeout após 300 segundos - QR expira]
```

### Próximo Passo:
- [ ] Clicar "Gerar Novo QR Code"
- [ ] Novo QR Code deve aparecer
- [ ] Escanear o novo código
- [ ] Deve conectar normalmente (volta ao Teste 2)

---

## ✅ Teste 4: Desconectar e Reconectar

**Objetivo:** Verificar fluxo completo de desconexão/reconexão

### Pré-requisito:
- Estar com WhatsApp Conectado (do Teste 2)

### Passos - DESCONECTAR:
1. Na seção "Conexão WhatsApp"
2. Clicar botão **"Desconectar"**

### Verificações:
- [ ] Estado muda para: "Nenhum número conectado no momento"
- [ ] Botão volta a "Conectar Número"
- [ ] Toast: "Instância desconectada com sucesso"

### Verificar Console:
```
[WhatsAppIntegration] Desconectando instância...
[whatsapp-manager] Disconnecting instance...
```

### Passos - RECONECTAR:
1. Clicar "Conectar Número"
2. Novo QR Code aparece
3. Escanear com celular
4. Aguardar conexão (~30-90 segundos)

### Verificações:
- [ ] Deve conectar normalmente
- [ ] "WhatsApp Conectado" com número

---

## ✅ Teste 5: Enviar e Receber Mensagens

**Objetivo:** Verificar se instância conectada funciona para mensagens

### Pré-requisito:
- Estar com WhatsApp Conectado

### Passos:
1. Ir para página `/inbox`
2. Procurar pela instância do WhatsApp (deve ter ícone verde = conectado)
3. Enviar uma mensagem teste **DA TELA** para um número
4. **DO CELULAR:** Enviar mensagem para o número vinculado

### Verificações - ENVIAR:
- [ ] Mensagem sai com sucesso
- [ ] Aparece no Inbox com status "enviado"
- [ ] Chega no WhatsApp do celular

### Verificações - RECEBER:
- [ ] Mensagem aparece no Inbox em tempo real
- [ ] Status: "Nova conversa" ou "Contato vinculado"
- [ ] Pode responder direto da tela

---

## ✅ Teste 6: Verificar Persistência (Reload da Página)

**Objetivo:** Confirmar que conexão persiste após reload

### Passos:
1. Estar com WhatsApp Conectado
2. Página `/perfil` aberta
3. Pressionar **F5** ou **Ctrl+R** (reload completo)
4. Aguardar página carregar

### Verificações:
- [ ] Ao carregar, exibe "Verificando status..."
- [ ] Após alguns segundos, muda para: "WhatsApp Conectado" com número
- [ ] Nunca pede para conectar novamente
- [ ] Número permance igual ao anterior

### Ir para `/inbox`:
- [ ] Instância mantém-se conectada (ícone verde)

---

## ✅ Teste 7: Verificar Logs Detalhados

**Objetivo:** Confirmar que logging está funcionando para debug

### DevTools Console (Browser):
Procurar por linhas contendo:
```
✅ [WhatsAppIntegration] Status check
✅ [WhatsAppIntegration] ✅ Connection successful!
```

### Supabase Edge Function Logs:
Via Supabase Dashboard → Edge Functions → whatsapp-manager:
```
✅ [whatsapp-manager] Creating instance for user
✅ [whatsapp-manager] QR Code generated successfully
✅ [whatsapp-manager] Checking status for channel
✅ [whatsapp-manager] Instance connected!
```

### Supabase Edge Function Logs:
Via Supabase Dashboard → Edge Functions → whatsapp-qr-inbound:
```
✅ [whatsapp-qr-inbound] ✅ Z-API connection event received
✅ [whatsapp-qr-inbound] ✅ Updated channel to status=ativo
```

---

## 📊 Checklist de Aceite Final

- [ ] Teste 1: QR Code gerado com sucesso
- [ ] Teste 2: Escanear e conectar funciona
- [ ] Teste 3: Timeout de 300s funciona corretamente
- [ ] Teste 4: Desconectar e reconectar funciona
- [ ] Teste 5: Enviar e receber mensagens funciona
- [ ] Teste 6: Persistência após reload funciona
- [ ] Teste 7: Logs detalhados aparecem corretamente
- [ ] Sem erros no console do browser
- [ ] Sem erros nas Edge Functions
- [ ] Taxa de sucesso >= 95%

---

## 🆘 Troubleshooting

### Problema: QR Code não aparece
**Soluções:**
1. Recarregar página (Ctrl+R)
2. Abrir DevTools → Console
3. Procurar por erros vermelhos
4. Se houver erro 500, verificar logs do Supabase

### Problema: QR Code aparece mas não conecta
**Soluções:**
1. Verificar se celular tem WhatsApp instalado
2. Verificar conexão de internet (ambos dispositivos)
3. Aguardar 300 segundos completos (Z-API pode ser lento)
4. Se após 300s não conectar, gerar novo código

### Problema: Conexão falha com timeout
**Análise:**
1. Abrir Supabase Dashboard
2. Ir para Edge Functions → whatsapp-manager
3. Clicar em aba "Logs"
4. Procurar por erros e mensagens de debug
5. Se erro de Z-API, entre em contato com suporte Z-API

### Problema: Mensagens não chegam/enviam
**Soluções:**
1. Confirmar instância está conectada (ícone verde no Inbox)
2. Recarregar página (`Ctrl+R`)
3. Tentar desconectar e reconectar
4. Verificar se número do WhatsApp está correto

---

## 📞 Contatos e Recursos

- **Z-API Docs:** https://docs.z-api.io/
- **Supabase Dashboard:** https://app.supabase.com/
- **Logs do Backend:** Supabase → Edge Functions → whatsapp-manager

---

**Status Esperado Após Fixes:** ✅ Todos os testes PASSAM
**Taxa de Sucesso Esperada:** 95%+
