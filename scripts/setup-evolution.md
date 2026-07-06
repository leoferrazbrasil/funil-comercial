# Setup da Evolution API (Node.js + MySQL + PM2)

Este guia destina-se à configuração da Evolution API v2 em ambientes de hospedagem compartilhada que suportam Node.js (sem Docker).

## 1. Clonar o Repositório Oficial
Acesse sua hospedagem via SSH e execute os comandos:

```bash
# Clone a versão mais recente da Evolution API
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api

# Mude para a branch principal (v2)
git checkout main
```

## 2. Instalação de Dependências e Build
Certifique-se de que o Node.js v20+ está instalado (`node -v`).

```bash
# Instale as dependências usando NPM
npm install

# Gere o build da aplicação TypeScript
npm run build
```

## 3. Configuração do Ambiente (.env)
Copie o arquivo de exemplo gerado no nosso CRM (`.env.evolution.example`) para dentro da pasta `evolution-api` com o nome `.env`.

```bash
# Puxar o .env de exemplo (ajuste o caminho se necessário)
cp ../funil-comercial/.env.evolution.example .env
```
Abra o `.env` (`nano .env`) e preencha as credenciais do seu banco de dados MySQL (`DATABASE_CONNECTION_URI`).

## 4. Inicialização e Persistência com PM2
O PM2 manterá a API rodando no background e a reiniciará caso o servidor reinicie.

Na raiz da pasta `evolution-api`, crie o arquivo `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: "evolution-api",
      script: "./dist/src/main.js", // Ponto de entrada após o build
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      }
    }
  ]
}
```

Inicie a aplicação:
```bash
# Se não tiver o PM2 instalado globalmente na hospedagem:
npm install -g pm2

# Iniciar o processo
pm2 start ecosystem.config.js

# Salvar a lista de processos para inicialização automática
pm2 save
```

## 5. Testando o Serviço
A API deve estar rodando na porta definida no `.env` (ex: 8080).
Você pode testar localmente na própria hospedagem:
```bash
curl -X GET http://localhost:8080/
```
Se retornar uma mensagem de boas vindas da Evolution API, a instalação foi um sucesso!
