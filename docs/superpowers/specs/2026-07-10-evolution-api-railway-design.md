# Design — Evolution API na Railway (Sub-projeto 1)

> Spec de design. Data: 2026-07-10. **Status: ADIADO para o futuro** (decisão de 2026-07-10). Design aprovado; execução pausada. Ver o horizonte no Roadmap: `docs/Funil Comercial Vault/04 - Roadmap.md`.

## Contexto

O **Funil Comercial** é um SPA estático (React 19 + Vite 8) cujo backend é o **Supabase** (Postgres, Auth, Realtime, Edge Functions em Deno). O WhatsApp é integrado por três provedores:

- **Z-API** (SaaS externo, não-oficial) — já funcional.
- **Meta Cloud API** (SaaS externo, oficial) — já integrada; sujeita à janela de 24h e templates.
- **Evolution API** (self-hosted, Docker) — o código já tem o provider `evolution_api` no `whatsapp-send`, a Edge Function `evolution-proxy` e as envs `EVOLUTION_API_URL` / `EVOLUTION_GLOBAL_API_KEY`, **mas não há um servidor Evolution rodando**.

### Objetivo do usuário

Conectar **dezenas (6–50) de números de WhatsApp** simultaneamente via **Evolution API rodando em Docker**. A Railway é o alvo por rodar containers Docker + Postgres + Redis gerenciados.

## Decisões tomadas (brainstorming)

- **Escopo na Railway:** hospedar **site + Evolution API**. **Supabase permanece** como backend (banco, Auth, Realtime, Edge Functions).
- **Meta e Z-API permanecem externos** (SaaS) — não há o que hospedar; o Funil apenas os consome.
- **Escala:** dezenas (6–50) de instâncias no horizonte próximo.
- **Este spec cobre apenas o Sub-projeto 1** (infra da Evolution API na Railway).

### Decomposição (contexto — não faz parte deste spec)

| # | Sub-projeto | Situação |
|---|---|---|
| **1** | **Infra Railway: Evolution API** | **← este spec** |
| 2 | Integração Funil ↔ Evolution (secrets, webhooks, ajustes nas Edge Functions, seletor no `/perfil`) | próximo ciclo |
| 3 | Multi-instância no produto (vários números ativos, roteamento inbound/outbound por instância, UI de gestão) | futuro (alto risco — hoje o modelo é 1 canal ativo por dono) |
| 4 | Mover o site estático para a Railway (serve + cutover de DNS) | futuro/opcional |

## Escopo deste spec

**Dentro:** provisionar a Evolution API (Docker) + Postgres + Redis na Railway, com API key, HTTPS, persistência e critérios de validação.

**Fora (deferido):** qualquer alteração no código do Funil, secrets no Supabase, apontamento de webhooks Evolution → Edge Functions, seletor de integração no `/perfil`, e o modelo multi-instância — tudo isso é dos sub-projetos 2 e 3.

## Abordagem escolhida

**A — Imagem oficial + Postgres/Redis como serviços Railway.** Usar a imagem oficial `atendai/evolution-api:v2.x` (tag fixada, sem manter Dockerfile próprio), com os plugins Postgres e Redis da Railway, tudo parametrizado por variáveis de ambiente. Equilíbrio entre controle, simplicidade e reprodutibilidade.

Alternativas descartadas: (B) template 1-click — menos controle/entendimento; (C) Dockerfile/compose próprio versionado — manutenção desnecessária dado que a imagem oficial atende.

## Arquitetura

Um único **projeto Railway** com **3 serviços** comunicando-se pela **rede privada** interna:

- **Evolution API** — único serviço exposto à internet (HTTPS). Uma "instância" por número de WhatsApp.
- **Postgres** (plugin Railway) — persiste instâncias/sessões/mensagens; sobrevive a redeploys.
- **Redis** (plugin Railway) — cache/estado das instâncias.
- Postgres e Redis **acessíveis apenas internamente** (private networking); somente a Evolution API é pública.

```
Internet/HTTPS ──(evo.funilcomercial.com)──▶ Evolution API ──priv.──▶ Postgres
                                                    │
                                                    └────priv.──▶ Redis
Evolution API ──(webhooks, no Sub-projeto 2)──▶ Supabase Edge Functions
Funil (Edge Functions) ──(REST + API key)──▶ Evolution API
```

## Configuração da Evolution (variáveis de ambiente)

Imagem fixada em uma tag `v2.x` (não `latest`). Variáveis principais:

| Variável | Valor | Papel |
|---|---|---|
| `SERVER_URL` | subdomínio Railway no início (ver seção de domínio) | URL pública usada em QRs/links |
| `AUTHENTICATION_API_KEY` | chave forte secreta | Autentica toda a API |
| `DATABASE_ENABLED` | `true` | Ativa persistência |
| `DATABASE_PROVIDER` | `postgresql` | Provedor de banco |
| `DATABASE_CONNECTION_URI` | referência privada ao Postgres da Railway | Conexão ao banco |
| `CACHE_REDIS_ENABLED` | `true` | Ativa cache Redis |
| `CACHE_REDIS_URI` | referência privada ao Redis da Railway | Conexão ao cache |
| `CACHE_LOCAL_ENABLED` | `false` | Usa Redis, não memória local |

> Os nomes/flags exatos serão confirmados contra a documentação da versão `v2.x` escolhida na fase de implementação (writing-plans). Webhooks (`WEBHOOK_GLOBAL_*` etc.) **não** são configurados aqui — ficam para o Sub-projeto 2. O `SERVER_URL` já é definido corretamente para quando os webhooks forem ligados.

## Persistência, escala e backup (6–50 instâncias)

- **Memória:** cada número (Baileys) consome ~50–150 MB. Dimensionar o serviço Evolution para **~2 GB no início, escalando até ~6–8 GB** conforme conecta números. A Railway permite aumentar recursos sem recriar o serviço.
- **Postgres:** guarda instâncias/sessões — é o que faz os números **reconectarem sozinhos** após redeploy. **Ativar backups** (snapshot da Railway ou `pg_dump` agendado).
- **Redis:** cache; pode ser efêmero (sem backup).
- **Custo:** a Railway cobra por uso (CPU/RAM/rede). Dezenas de instâncias = custo real e crescente — monitorar consumo.

## Rede, domínio, HTTPS e segurança

- **Domínio (decisão):** **começar com o subdomínio automático da Railway** (HTTPS imediato, zero configuração de DNS) — é o `SERVER_URL` inicial. O **domínio custom** `evo.funilcomercial.com` (CNAME) é um passo **opcional e posterior**; ao adotá-lo, atualizar o `SERVER_URL`. Isso destrava a validação do #1 sem depender de propagação de DNS.
- **Segurança:**
  - `AUTHENTICATION_API_KEY` forte, guardada como secret (nunca no código/repo).
  - Postgres/Redis sem exposição pública (rede privada da Railway).
  - Apenas a Evolution API exposta, sempre via HTTPS.
  - No Sub-projeto 2, a chave vira secret no Supabase (`EVOLUTION_GLOBAL_API_KEY`).

## Critérios de sucesso

O Sub-projeto 1 está pronto quando:

1. A Evolution API responde na URL pública (ex.: endpoint de health) autenticando com a API key.
2. É possível **criar uma instância** e **ler o QR Code**, conectando **1 número** de teste.
3. Após um **redeploy**, a instância **reconecta sozinha** (prova de persistência no Postgres).
4. Postgres e Redis **não** estão acessíveis pela internet.

## Riscos e mitigações

- **Consumo de memória subestimado** com muitos números → começar com 1 número, medir o consumo real por instância, escalar recursos com base em dados antes de conectar dezenas.
- **Perda de sessões em redeploy** → validado explicitamente no critério de sucesso #3 (persistência no Postgres).
- **Versão da imagem quebrando config** → tag fixada `v2.x` + conferência dos nomes de env contra a doc da versão na fase de plano.
- **Custo crescente** → monitorar uso na Railway; dimensionar sob demanda.

## Fora de escopo (explícito)

- Alterações no código do Funil, secrets no Supabase, webhooks Evolution → Edge Functions, seletor no `/perfil`, modelo multi-instância e mover o site para a Railway. Todos serão tratados nos sub-projetos 2, 3 e 4.
