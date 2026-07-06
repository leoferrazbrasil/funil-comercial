# Deployment: Evolution API & Funil Comercial

Este documento orienta como colocar a infraestrutura do WhatsApp em produção em uma hospedagem compartilhada Node.js.

## 1. Subindo a Evolution API (Node.js/PM2)

Siga os passos do script gerado em `scripts/setup-evolution.md`. Resumo:
1. Acesse o servidor via SSH.
2. Clone o repositório da Evolution API (`git clone https://github.com/EvolutionAPI/evolution-api.git`).
3. Instale as dependências (`npm install`) e compile (`npm run build`).
4. Configure o `.env` copiando o modelo `.env.evolution.example`.
5. Inicie com PM2: `pm2 start ecosystem.config.js`.

### Proxy Reverso (NGINX/Apache)
Se a sua hospedagem usa painel de controle (cPanel, CyberPanel, aaPanel), certifique-se de configurar um domínio ou subdomínio (ex: `whatsapp.funilcomercial.com`) para fazer um Proxy Reverso para a porta da Evolution API (ex: 8080).

## 2. Deploy do Backend do Funil Comercial

O novo código do backend (pasta `backend/`) precisa ser publicado para receber os webhooks e responder ao Frontend.
1. Transfira a pasta `backend/` para o servidor.
2. Rode `npm install`.
3. Adicione o banco de dados e rode as queries SQL contidas em `backend/src/models/WhatsAppMessage.ts`.
4. Inicie o backend também via PM2:
   ```bash
   pm2 start npm --name "funil-backend" -- run start
   ```

## 3. Checklist de Validação (Pré-Produção)

Antes de anunciar a feature para os usuários, verifique:
- [ ] **Evolution API Online:** Acesse a URL da Evolution no navegador e verifique se a tela de boas vindas aparece.
- [ ] **Instância Criada:** Usando ferramentas como Postman, chame a rota `/instance/create` da Evolution para gerar a instância do Funil Comercial.
- [ ] **QR Code:** Faça a leitura do QR Code retornado pela API usando o celular que será a central de atendimento.
- [ ] **Webhook:** Envie uma mensagem de teste para o número conectado e verifique se o seu backend (`/api/whatsapp/webhook`) a recebe e salva no MySQL.
- [ ] **Frontend:** Abra a aba `/whatsapp` no Funil Comercial, confira se o status aparece como "Conectado" e tente enviar uma mensagem por lá.
