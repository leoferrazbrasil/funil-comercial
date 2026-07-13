---
title: Requisitos
aliases:
  - Funcionalidades
  - O que o Funil faz
tags:
  - funil-comercial/requisitos
date: 2026-07-09
---

# 📋 Requisitos

> [!abstract] Sobre esta nota
> Documentação do que o **Funil Comercial** faz hoje (atualizado em 2026-07-09). Foca no estado **implementado** (não em planos futuros). Para o "como" técnico, ver [[02 - Arquitetura e Design]]. Índice em [[00 - Inicio]].

## 1. Visão geral

Plataforma da **Funil Comercial** (empresa de estrutura de vendas). Seu **núcleo é o CRM** — o software da camada de Conversão — focado em **prospecção ativa** e atendimento por **WhatsApp**, cobrindo o ciclo: encontrar/receber contatos → qualificar em leads → negociar no funil → fechar (Ganho/Perdido), com métricas de operação e receita (única e recorrente/MRR). Além do CRM, a plataforma inclui site institucional, Brandbook, Criativos, Roteiro e Campanhas.

- **Multiusuário / multi-tenant:** cada usuário (dono) enxerga apenas seus próprios dados (RLS por `owner_id`).
- **Papéis:** `diretor`, `gestor`, `vendedor` (controle de rotas por papel em `accessControl`).

## 2. Autenticação e Perfil

- Cadastro (`/cadastro`) com nome, e-mail e senha (força de senha + confirmação em tempo real).
- Login (`/login`) via Supabase Auth.
- Perfil (`/perfil`): editar nome, telefone, avatar (upload), e-mail e senha.
- **Integração WhatsApp** no perfil: **seletor entre Z-API (QR Code) e Meta Cloud API (Oficial)** como canal ativo (ver [[02 - Arquitetura e Design#Front-end — módulos-chave|IntegrationSection]]). Z-API: gerar QR, status, conectar/desconectar. Meta: card de status (número + Phone Number ID). Trocar de canal ativa um e desativa o outro (envio sem ambiguidade).

## 3. Dashboard (`/dashboard`)

- **KPIs:** Atenção Necessária (Inbox pendente), Leads Ativos, Pipeline Aberto (R$), **Taxa de Conversão** (baseada em VALOR: Σ valor efetivo dos Ganhos ÷ Σ valor efetivo de todas as oportunidades).
- **Filtro temporal:** Hoje, 7 dias, Mês, Tudo (controle segmentado).
- **Rotina de Hoje:** contatos criados hoje, quantos viraram lead, taxa contato→lead.
- Recomendações comerciais, gráfico de funil e oportunidades recentes.

## 4. Inbox (`/inbox`)

- Lista de conversas de WhatsApp agrupadas por telefone (sem duplicidade).
- **Abas:** Abertas (não resolvidas), Não Lidas (some ao **abrir** a conversa), Todas + busca.
- **Filtros:** **Data** (Tudo/Hoje/7d/30d, pela última mensagem) e **Tipo** por estágio do funil — **Contato** (cadastrado no CRM), **Lead** (sem oportunidade), **Oportunidade** — combinando com abas e busca.
- **Tempo real:** novas mensagens aparecem sem recarregar (realtime em `inbox_messages`).
- **Responder** pela instância conectada; histórico preservado mesmo desconectado.
- **Templates da Meta:** com canal Meta ativo, botão 📄 para enviar um **template aprovado** (preview + variáveis) — para **iniciar** conversa / fora da janela de 24h.
- **Bloqueio de envio** quando não há instância ativa (painel "WhatsApp Desconectado" + atalho para reconectar).
- **Contexto CRM** na conversa: criar/vincular Contato, Lead e Oportunidade a partir da mensagem.
- **Grupos:** mensagens atribuídas ao participante real (rótulo "Pessoa · Grupo"). **Newsletters/comunidades** (broadcast) são ignoradas.

> [!bug] Envio pode "parecer" entregue sem ter sido
> O envio pela Inbox tem um *fallback*: se o envio real ao WhatsApp falha, a resposta é salva localmente e a bolha aparece na conversa **mesmo sem entrega**. Ver o fluxo em [[02 - Arquitetura e Design#Fluxos importantes]] e a [[#9. Regras de negócio principais|janela de 24h da Meta]].

## 5. Contatos (`/contatos`)

- Lista + Perfil 360º (drawer lateral). Criar, editar e **excluir** (com confirmação).
- Campos: nome, telefone, e-mail, **Origem** (Meta Ads, Google Ads, Site, WhatsApp, Indicação, Prospecção Ativa) e **Potencial** (Frio, Morno, Quente) — via listas suspensas.
- Botão **WhatsApp**: abre a conversa **dentro do painel** (`/inbox`) com aquele contato (existente ou rascunho).
- **Disparar template em massa:** enviar um template aprovado da Meta para vários contatos de uma vez (`{{1}}` = nome de cada contato ou valor fixo; seleção por checkbox; envio sequencial com progresso). Prospecção ativa dentro das regras da Meta.

## 6. Leads (`/leads`)

- Fila de qualificação com **Score Ring** (saúde do preenchimento). Criar, editar e **excluir** (com confirmação).
- Converter **Contato → Lead**; criar **Oportunidade** a partir do lead.
- Status: novo, em atendimento, qualificado, convertido, perdido.

> [!note] Próxima Ação acionável
> O drawer do **Lead** tem a **Próxima Ação acionável** (botão que abre a edição quando a ação está vaga) — mesmo tratamento do drawer da oportunidade no [[#7. Funil de Vendas (`/funil`)|Funil]].

## 7. Funil de Vendas (`/funil`)

- **Kanban** com drag & drop entre etapas (Novo, Em atendimento, Qualificado, Proposta, Negociação, Ganho, Perdido).
- Oportunidade com **Produto/Serviço**, valor (pagamento único) e mensalidade (recorrente). Criar, editar e **excluir** (no card).
- **Produto auto-detectado** ao criar pelo Inbox (varre a conversa) e **preço pré-definido** preenche o valor (Site R$497 + R$37,90/mês; Google Meu Negócio R$800; Tráfego Pago R$1.497/mês — serviço só-mensal: 1º pagamento no ato conta como único **e** recorrente).
- **Métricas:** Pipeline Aberto, Etapas Finais, Sem Ação, Sem Valor, e comparativo **Fechado (Ganho) × Projeção (pipeline aberto)** separando único (setup) de recorrente (MRR). Mover para "Ganho" soma no Fechado automaticamente.
- **Drawer da oportunidade:** exibe a **Origem real** (do lead vinculado) e **Próxima Ação acionável** (botão que abre a edição). Ações rápidas de Ganho/Perdido.

## 7.1. Páginas legais públicas

> [!info] Exigidas pela Meta + LGPD
> `/privacidade`, `/termos` e `/exclusao-de-dados` — **públicas (sem login)**, para aprovação da integração na Meta e conformidade com a LGPD (coleta/uso/compartilhamento/exclusão de dados). Acessíveis pelo rodapé da Landing. Detalhe técnico em [[02 - Arquitetura e Design#Front-end — módulos-chave]].

## 7.2. Campanhas (`/campanhas`)

- Wizard de 3 etapas — **Configurar** (nome, canal Meta ativo, template aprovado, variáveis por *nome do contato* ou *valor fixo*, enviar agora), **Contatos** (do CRM por checkbox + busca **ou** importação de **CSV**), **Confirmação** (disparo 1 a 1 com progresso e status por destinatário; dedupe por telefone).
- **Preview de iPhone** ao vivo, mostrando a mensagem do WhatsApp conforme a configuração.
- **Enviar agora** ou **Agendar** (data/hora): o envio é **server-side** (persiste a campanha; um agendador dispara no horário). **Histórico** com status (agendada/enviando/concluída) e **cancelar** agendadas. Múltiplas contas Meta é a Fase 3 — ver [[04 - Roadmap]].

## 8. Criativos (`/criativos`)

- **Wizard guiado (Progressive Disclosure):** *O Caminho* (Estrategista IA em destaque **ou** criar manualmente) → fluxo **manual** (escolher o **pilar editorial**, que já traz objetivo/etapa/CTA — 1:1 do Brandbook 4.1 — depois **escolher um tema pronto** do pilar: os *temas recorrentes* da Linha Editorial, sem "página em branco"; o campo de texto vira opcional) → **Estúdio** de edição + canvas.
- Geração de post com IA (`ai-generate-post`, fallback OpenAI/Gemini) e **Estrategista IA** (`ai-recommend-post`) conectado ao Instagram (Meta Graph) para continuidade editorial. *(Prompts da IA no posicionamento novo = **Fase B**, pendente de deploy — ver [[04 - Roadmap]].)*
- Copy com limite de caracteres, gestão de hashtags (até 5) e **checklist "Antes de publicar"** — tudo alinhado à **Linha Editorial** (Brandbook 04). Pilares em `src/lib/editorialPillars.ts` (compartilhados com o Roteiro).

## 8.1. Roteiro Editorial (`/roteiro`)

- **Fila sequencial** de próximos posts seguindo a rotação de pilares da Matriz 5W2H (Brandbook 04 → 4.2): **"próximo sugerido"** (calculado a partir do último item), campo de **tema** e **status** em 3 estados (A fazer → Gerado → Publicado).
- **Deep-link** para o estúdio: "Gerar →" abre `/criativos` com o pilar e o tema pré-preenchidos.
- Persistência por dono (tabela `editorial_queue`, RLS `auth.uid() = owner_id`). Acesso: **diretor/gestor**. Sem datas/calendário na v1 (evolução para calendário mensal no [[04 - Roadmap]]).

## 8.2. Agregadores de Links (público `/l/:slug` + admin `/agregadores`)

- Página **pública** estilo "linktree" (premium): marca, tagline, selo de status e até **5 botões** (CTA + secundários), com **tema por cliente** (4 presets). O **Funil Comercial** é `/l/bio` (bio do Instagram: `funilcomercial.com/l/bio`).
- **Produto multi-tenant:** admin **`/agregadores`** (diretor/gestor) cria/edita agregadores — cada cliente = **um registro** (tabela `aggregators`, RLS dono + leitura pública dos publicados). A página pública lê do banco com **fallback estático** (`aggregators.ts`) para a bio do FC. Rascunho × no ar.
- **Entrega ao cliente = `/bio` estático:** o admin gera (**"Gerar /bio"**) um `index.html` autocontido para instalar no diretório do **site do próprio cliente** (`cliente.com.br/bio`); o `/l/:slug` da FC serve de **pré-visualização**. Ver [[03 - Changelog]].

## 9. Regras de negócio principais

- **Vínculos:** lead→contato, oportunidade→lead, mensagens→contato/lead (por `contact_id`/`lead_id`).
- **Exclusão preserva histórico:** FKs `ON DELETE SET NULL` — excluir contato/lead só desvincula; a Inbox e os relacionados permanecem (ver [[02 - Arquitetura e Design#Banco de dados (tabelas principais)]]).
- **Normalização de telefone:** DDI 55 e unificação (12 dígitos) para evitar chats duplicados e vincular ao CRM.
- **Receita:** valor único (setup) + recorrente (MRR) por produto; **Taxa de Conversão baseada em valor** (valor dos Ganhos ÷ valor de todas as oportunidades).

> [!warning] Janela de 24h (Meta Cloud API)
> Com a integração oficial, **texto livre** só é permitido dentro de **24h** da última mensagem do cliente. O **1º contato frio exige template aprovado**. O Z-API **não** tem essa restrição — é o principal trade-off entre os dois canais.

## 10. Integrações

- **Z-API** (WhatsApp não-oficial): QR/conexão, recebimento (webhook), envio de texto livre.
- **Meta Cloud API** (WhatsApp Business **oficial**): recebimento (webhook verificado + assinado) e envio via Graph API; escolhida no seletor do `/perfil`. Business verificada, app publicado, template de 1º contato. Detalhes em [[02 - Arquitetura e Design#Edge Functions (Deno)]].
- **Meta Graph API**: Instagram (criativos).
- **OpenAI / Gemini**: geração e recomendação de conteúdo.

## 11. Requisitos não-funcionais

- **Segurança:** Supabase Auth + RLS por dono; webhooks públicos autenticam internamente (secret/instanceId).
- **Tempo real:** Supabase Realtime (inbox_messages, contacts, leads, opportunities, integration_channels).
- **Deploy:** front automático via push no GitHub (Hostinger); migrações aplicadas no Supabase; Edge Functions via `supabase functions deploy` (webhooks com JWT off). Ver [[02 - Arquitetura e Design#Deploy — pontos de atenção]].
- **Responsividade:** desktop, tablet e mobile (layouts Master-Detail, Kanban mobile).
- **Identidade visual:** paleta e componentes padronizados (`SharedUI`), dropdowns customizados na paleta.
