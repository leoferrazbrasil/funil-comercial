---
title: Roadmap
aliases:
  - Planejamento
  - Próximos passos
tags:
  - funil-comercial/roadmap
date: 2026-07-10
---

# 🗺️ Roadmap

> [!abstract] Sobre esta nota
> Planejamento por horizonte (mais recente primeiro). O que já foi entregue vive no [[03 - Changelog]]; o que o produto faz hoje, em [[01 - Requisitos]]; a arquitetura, em [[02 - Arquitetura e Design]]. Índice em [[00 - Inicio]].

> [!info] Como ler os status
> ✅ Concluído · 🔜 Próximo · 🧭 Futuro (planejado, sem data) · 🏗️ Em andamento · ⏸️ Adiado

---

## ✅ Entregue recentemente

- **Estúdio de Criativos — Fase A (taxonomia editorial)** — `/criativos` deixou de gerar conteúdo do posicionamento antigo (B2B/SaaS/CRM). Pilares, objetivos, defaults, CTAs por pilar e um checklist "Antes de publicar" foram realinhados à **[[Linha_Editorial_Funil_Comercial|Linha Editorial]]** e ao Brandbook 04. Canvas da arte preservado. Só front-end (sem deploy). Ver [[03 - Changelog]].
- **Brandbook 04 — Diretrizes de Conteúdo & Ativação** — pilares editoriais + matriz 5W2H + checklist publicados em `/brandbook` (`ContentGuidelinesSection`). Fonte de verdade da doutrina de conteúdo. Ver [[03 - Changelog]].
- **Handoff de conversas (time)** — admin cria vendedores e transfere conversas; o vendedor vê/responde só as atribuídas, pelo canal do admin. Código pronto (7 tasks, endurecido por review). **Ativação pendente:** aplicar migração + deployar `team-create-member`/`whatsapp-send`. Ver [[03 - Changelog]].
- **Observabilidade de entrega (WhatsApp)** — `whatsapp-inbound` processa os `statuses` da Meta; selinho por mensagem no Inbox (enviada/entregue/lida/falhou) + erro inline. Ver [[03 - Changelog]].
- **Página Configurações** — hub de integrações (`/configuracoes` + engrenagem no header); integração de WhatsApp saiu do Perfil. Ver [[03 - Changelog]].
- **Inteligência Comercial** — não sugere mais responder à própria saída; prioriza por não-lida/antiguidade/valor. Local, sem IA. Ver [[03 - Changelog]].
- **Tela de carregamento** com a identidade da marca + páginas públicas sem loader. Ver [[03 - Changelog]].
- **Reposicionamento do site** — home = empresa de estrutura de vendas (Método Estrutura de Vendas, 4 camadas, tom negócio local); CRM movido para `/crm`. Ver [[03 - Changelog]].
- **Campanhas Fase 2 — Agendamento** — envio **server-side** (tabelas `campaigns`/`campaign_recipients` + `campaign-runner` + Supabase Cron); agendar data/hora, histórico com status e cancelar. Ver [[03 - Changelog]].
- **Página de Campanhas (Fase 1)** — menu `/campanhas` com wizard de 3 etapas (Configurar → Contatos → Confirmação) + preview iPhone; dispara templates para contatos do CRM ou lista **CSV**, enviando agora. Ver [[03 - Changelog]].
- **Disparo de templates em massa (Ciclo 2)** — em `/contatos`, enviar um template aprovado para vários contatos de uma vez (`BulkTemplateDialog`), com variável por-destinatário (nome) ou fixa, seleção por checkbox e progresso. Ver [[03 - Changelog]].
- **Templates da Meta no Inbox (Ciclo 1)** — enviar template aprovado 1 a 1 (`whatsapp-templates` + `TemplatePicker`); v1 seguro (só templates suportados; endurecido por revisão adversarial de 28 agentes). Ver [[03 - Changelog]].
- **"Marcar como lida ao abrir"** no Inbox (não-lida literal, persistida no banco).
- **Filtros da Inbox** — Data (Tudo/Hoje/7d/30d) + Tipo por estágio do funil (Contato **cadastrado no CRM** / Lead / Oportunidade), e correção das abas Abertas/Não Lidas/Todas. Ver [[03 - Changelog]].
- **Seletor Z-API × Meta Cloud API** no `/perfil`.
- **Integração oficial Meta Cloud API** (webhook, envio, secrets) — **envio validado ponta a ponta (2026-07-09)** — + **páginas legais** públicas.
- **Drawers acionáveis** (Origem real + Próxima Ação) em Oportunidade e Lead.
- **Dashboard**: filtro temporal + Taxa de Conversão por valor.

---

## 🚧 Bloqueios ativos (ação do dono)

> [!danger] Entrega de templates (Marketing) travada por pagamento
> A Meta recusa os templates com **`[131042] Business eligibility payment issue`** — **pendência de pagamento** da conta WhatsApp Business. Sem resolver o método de pagamento da WABA, a **prospecção por template não entrega** (texto livre dentro da janela de 24h entrega normalmente). Verificação da empresa já está aprovada. Ver [[03 - Changelog]].

> [!warning] Rotacionar segredos expostos
> `secrets.txt` esteve no histórico do GitHub. **Rotacionar/revogar:** token permanente da Meta e **PAT do Supabase**. Atualizar o secret `META_WHATSAPP_ACCESS_TOKEN` com o novo token.

> [!info] Campanhas — infra
> Deploys de `campaign-runner`/`whatsapp-inbound`/`whatsapp-send` **concluídos**; migração do `delivery_status` aplicada. Confirmar se as **tabelas `campaigns`/`campaign_recipients`** foram criadas (SQL no [[03 - Changelog]]) para o "Disparar agora" funcionar.

---

## 🔜 Próximo (curto prazo)

### Campanhas — Fase 3 (múltiplas contas Meta / dispositivo)
Escolher entre várias contas Meta/números no disparo (hoje usa a conta ativa) — ligada à **multi-instância**.

_Menores:_ disparo em massa também a partir de `/leads`; suporte a templates com mídia/botões (hoje desabilitados); mover o secret do cron para o **Vault**.

### Estúdio de Criativos — Fase B (prompts da IA)
Reescrever os **system prompts** das Edge Functions `ai-generate-post` e `ai-recommend-post`, hoje presos ao posicionamento antigo ("ferramenta B2B", "gestão comercial/CRM/automação"), para a voz da [[Linha_Editorial_Funil_Comercial|Linha Editorial]] (estrutura de vendas, negócio local, 4 camadas, CTA de diagnóstico no WhatsApp). **Requer deploy** (`ai-generate-post` + `ai-recommend-post`) — bloqueado neste ambiente (403 da CLI), então executa quando o dono puder deployar. Enquanto não for feito, a Fase A já garante que o esqueleto (pilares/defaults/CTA/checklist) esteja on-brand; a IA continua gerando texto na voz antiga enquanto as funções estiverem realmente ativas em prod.

_Fase C (opcional):_ templates de arte por pilar editorial.

> [!info] Deploy dos templates (Ciclos 1 e 2)
> As Edge Functions `whatsapp-send` (atualizada) e `whatsapp-templates` (nova) já foram publicadas; o secret `META_WABA_ID` é obrigatório para a listagem funcionar. O **Ciclo 2 é 100% front-end** (sem deploy de função — já foi ao ar no push).

---

## 🏗️ Em andamento (outra frente)

- **Prospecção assistida** — páginas de preview de prospecção (`ProspectingPreview`, `prospectingPreviews.ts`, rotas públicas de preview). Frente ativa fora do escopo desta sessão; detalhar quando estabilizar.

---

## 🧭 Futuro (planejado, sem data)

### Planner / Calendário Editorial
**Objetivo:** um módulo de planejamento que distribui os pilares editoriais **no tempo**, conforme a **4.2 Matriz 5W2H → "When"** — resolvendo a orquestração da sequência estratégica que o `/criativos` (peça isolada) não faz.

**Por quê:** o estúdio de criativos gera **um post de cada vez**, sem noção de ordem. A 4.2 prescreve uma **cadência semanal** de pilares (progressão atrair → conectar → educar → provar → converter); hoje nada guia o usuário nessa rotação. (Ver [[Diretrizes_Publicacao_5W2H]].)

**Semente de spec (da 4.2):**
- Cadência semanal: Seg **Diagnóstico da Dor** → Ter **Bastidores & Autoridade** → Qua **Método das 4 Camadas** → Qui **Prova Social** → Sex **Conversão / CTA direto**.
- Frequência: Feed **3–4×/semana**, Stories diários; **fechar o calendário do mês seguinte até o dia 20**.
- Cada dia do calendário **abre o estúdio já com o pilar** pré-selecionado (reaproveita o wizard atual).
- Integra com o **Estrategista IA** (recomendador de continuidade) quando a **Fase B** sair — o planner define a rota; a IA sugere o próximo item dela.

**Escopo:** feature nova, pede **brainstorming → spec → plano próprios** (não é ajuste no `/criativos`). Relaciona-se com **Criativos Fase B** (prompts da IA de continuidade).

### Multi-instância de WhatsApp
Conectar **vários números ao mesmo tempo** e rotear inbound/outbound por instância. **Muda o modelo atual** (hoje é **1 canal ativo por dono**) — alto impacto de produto. Depende da infra de Evolution abaixo.

---

## ⏸️ Adiado — Railway + Evolution API

> [!note] Decisão (2026-07-10)
> O brainstorming foi concluído e o **design está escrito**, mas a execução foi **adiada para o futuro** a pedido do usuário. Retomar a partir do spec quando for prioridade.
>
> 📄 Spec de design: [`docs/superpowers/specs/2026-07-10-evolution-api-railway-design.md`](../superpowers/specs/2026-07-10-evolution-api-railway-design.md)

**Objetivo:** rodar a **Evolution API (Docker)** para conectar **dezenas (6–50) de números** de WhatsApp, mantendo o **Supabase** como backend. Decomposto em:

| # | Sub-projeto | Descrição | Status |
|---|---|---|---|
| 1 | **Infra Railway: Evolution API** | Evolution API (imagem oficial) + Postgres + Redis, API key, HTTPS, persistência/backup | ⏸️ spec pronto |
| 2 | **Integração Funil ↔ Evolution** | Secrets no Supabase, webhooks Evolution → `whatsapp-inbound`/`qr-inbound`, ajustes nas Edge Functions, Evolution no seletor do `/perfil` | 🧭 depende de #1 |
| 3 | **Multi-instância (produto)** | Vários números ativos, roteamento por instância, UI de gestão | 🧭 depende de #2 |
| 4 | **Mover o site p/ Railway** | Servir o SPA estático na Railway + cutover de DNS (opcional) | 🧭 independente |

**Ordem sugerida:** 1 → 2 → 3 (cada um com seu ciclo spec → plano → implementação). O #4 é independente e opcional.

---

## 💡 Ideias / backlog (não priorizado)

- Consistência do "não lida" com badges/contadores de mensagens.
- Métricas de uso/custo da Evolution quando estiver no ar.
- Templates de 1º contato adicionais para prospecção (Meta).
- Suporte a templates com **cabeçalho de mídia / botões dinâmicos / variáveis nomeadas** (hoje ficam desabilitados no seletor).
