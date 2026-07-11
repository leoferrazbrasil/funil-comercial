---
title: Changelog
aliases:
  - Histórico de mudanças
tags:
  - funil-comercial/changelog
---

# 🗒️ Changelog

> [!note] Navegação
> Histórico de mudanças, mais recente primeiro. Contexto do produto em [[01 - Requisitos]]; arquitetura em [[02 - Arquitetura e Design]]; índice em [[00 - Inicio]].

## [2026-07-10] - Página de Campanhas, templates da Meta (Inbox + massa), filtros e "não lida" literal

### Adicionado — Página de Campanhas (Fase 1)
- Novo menu/rota **`/campanhas`**: wizard de 3 etapas (**Configurar → Contatos → Confirmação**) com **preview de iPhone** (WhatsApp) ao vivo ao lado. Etapa 1: nome da campanha, canal Meta ativo (read-only), template aprovado, variáveis (nome por-destinatário ou fixo), *enviar agora* (agendar "em breve"). Etapa 2: contatos do **CRM** (checkbox + busca) ou **import CSV**. Etapa 3: disparo 1 a 1 com progresso e status por destinatário. **Front-end apenas** — reusa `whatsapp-templates` + `sendInboxTemplate`.
- Novos: `Campaigns.tsx`, `PhonePreview.tsx` (mockup iPhone), `csv.ts` (parser + extração de destinatários). Endurecido por **revisão adversarial** (19 agentes; 10 achados corrigidos): reset do estado de envio ("Nova campanha"), dedupe por telefone, fallback de nome, "Todos" aditivo, e CSV robusto (aspas RFC 4180, separador ignorando aspas, header independente, `\r`/BOM, preferência 10–13 dígitos).
- **Fases futuras:** agendamento (Fase 2) e múltiplas contas Meta/dispositivo (Fase 3). Spec: `docs/superpowers/specs/2026-07-10-campanhas-fase1-design.md`.

### Adicionado — Envio de templates aprovados da Meta pelo Inbox
- Botão **📄 Template** no compositor (só com **canal Meta ativo**) abre um seletor dos templates **APROVADOS** da Meta, com preview e um campo por variável; envia via Graph API (`type: "template"`). Serve para **iniciar** conversa / fora da janela de 24h.
- Nova Edge Function **`whatsapp-templates`** (GET, com paginação `paging.next`) lista os aprovados; **`whatsapp-send`** ganhou branch de template. Novo secret **`META_WABA_ID`**. Componente **`TemplatePicker`** + `getApprovedWhatsAppTemplates`/`sendInboxTemplate` no service.

> [!success] v1 endurecido por revisão adversarial (28 agentes, 7 achados corrigidos)
> Só oferece templates que o CRM **consegue** enviar (corpo com variáveis numéricas). Cabeçalho de mídia, header com variável, botão dinâmico, variáveis nomeadas (`{{nome}}`) e templates sem corpo aparecem **desabilitados com o motivo** — evita envios que a Meta recusaria (erro `132000`). Sem prefill presunçoso de `{{1}}` (botão "usar nome do contato" sob demanda); trim consistente entre o texto gravado e o enviado; paginação para não perder aprovados após a 1ª página. `whatsapp-templates` adicionada ao `deno check`, script e CI de deploy.

### Adicionado — Disparo de templates em massa (Ciclo 2, `/contatos`)
- Botão **📣 Disparar template** abre o **`BulkTemplateDialog`**: escolhe um template aprovado, configura cada variável como **Nome do contato** (por destinatário) ou **Valor fixo** (comum a todos), seleciona os destinatários por checkbox (omite quem não tem telefone) e **envia 1 a 1** com barra de progresso e status por contato — continuando mesmo se um falhar, com pausa entre envios (rate limit). Opera sobre os contatos **filtrados** (respeita a busca). Reusa o backend do Ciclo 1 — **sem função nova e sem tocar no `App.tsx`**. Endurecido por revisão adversarial (20 agentes; 1 ajuste: limpar a lista ao reabrir).

### Adicionado — Filtros na lista de conversas + correção das abas
- Filtros de **Data** (Tudo/Hoje/7d/30d, pela última mensagem) e **Tipo** por estágio exclusivo do funil: **Contato** (cadastrado no CRM), **Lead** (sem oportunidade), **Oportunidade**. Combinam com as abas e a busca.
- **Correção das abas** Abertas/Não Lidas/Todas (que não funcionavam — dependiam de `unread_count` nunca resetado e de `Resolvido` quase nunca na última msg): passaram a usar sinais confiáveis — Abertas = não resolvida.

### Adicionado — "Marcar como lida ao abrir"
- Abrir uma conversa (clique) zera o `unread_count` das suas mensagens no banco (`markInboxConversationRead` + handler silencioso). "Não Lidas" e o ponto vermelho voltam à semântica **literal** de não-lida (some ao abrir, reaparece com mensagem nova). Só no clique explícito — a auto-seleção da 1ª conversa no desktop não marca.

## [2026-07-09] - Sprint: Integração Meta Cloud API oficial, Drawers acionáveis, Dashboard temporal e Páginas legais

### Adicionado — WhatsApp oficial (Meta Cloud API) + seletor de integração
- Backend já suportava a Cloud API; o fluxo oficial foi ativado/documentado:
  - `whatsapp-inbound`: verificação do webhook (GET com `hub.challenge` + `META_WEBHOOK_VERIFY_TOKEN`), assinatura (`META_APP_SECRET`) e parsing do payload Cloud API (`entry→changes→value→messages`). Resolve o dono pelo `numero` do canal = `phone_number_id`/`display_phone_number`.
  - `whatsapp-send`: envio via Graph API (`graph.facebook.com/{v}/{phone_number_id}/messages`) com `META_WHATSAPP_ACCESS_TOKEN` + `META_WHATSAPP_PHONE_NUMBER_ID`. Canal `whatsapp_cloud` (metadata `phone_number_id`).
  - Secrets no Supabase: `META_WHATSAPP_ACCESS_TOKEN`, `META_WHATSAPP_PHONE_NUMBER_ID`, `META_APP_SECRET`, `META_WEBHOOK_VERIFY_TOKEN`.
- **Seletor de integração no `/perfil`** (`IntegrationSection`): escolher entre **Z-API (QR Code)** e **Meta Cloud API (Oficial)** como canal ativo. Ativa o provider escolhido e **desativa o outro** — o envio (`whatsapp-send` usa o canal `ativo` mais recente) fica sem ambiguidade. Renderiza o QR (Z-API) ou o card de status (Meta). Novo `getIntegrationChannels` no `crmService`.
- **Regra da Meta (janela de 24h):** texto livre só é permitido dentro de 24h após a última mensagem do cliente **pela API oficial**; 1º contato frio exige **template aprovado** (`primeiro_contato`). Diferença registrada vs. Z-API (texto livre). Meta Business verificada + app publicado.

> [!bug] Diagnóstico conhecido — envio "aparenta" entregar
> O envio pela Inbox tem um *fallback* (`crmService.ts`) que salva a resposta localmente quando o envio real falha → a bolha aparece **mesmo sem entregar**. Se a Meta estiver ativa e a **janela de 24h** fechada, o texto é recusado (erro `131047`). Ver [[02 - Arquitetura e Design#Fluxos importantes]].

### Adicionado — Páginas legais públicas (exigência Meta / LGPD)
- `/privacidade`, `/termos`, `/exclusao-de-dados` (`src/pages/LegalPages.tsx`) — **públicas, sem login** — para aprovar a integração na Meta e atender à LGPD (coleta/uso/compartilhamento/exclusão de dados; menção explícita à WhatsApp Business Platform e Supabase). Links reais no rodapé da Landing.
- **Corrigido:** o guard de auth (`onAuthStateChange` em `App.tsx`) redirecionava para `/login` qualquer rota fora da lista → páginas públicas caíam no login. Centralizado em `PUBLIC_PATHS` (usado no gate de render e no guard).

### Melhorado — Drawers com "Próxima Ação" acionável (Oportunidade e Lead)
- **Oportunidade:** a seção "FONTE" (estática, "Lead Qualificado") virou **Origem real** (do lead vinculado); "PRÓXIMA AÇÃO" virou **botão acionável** que abre a edição (detecta ação fraca/genérica).
- **Lead:** mesmo tratamento — "Próxima Ação Manual" vira botão que abre a edição quando a ação está vaga.

### Melhorado — Dashboard
- Removidos os botões "Novo Lead" e "Nova Oportunidade" do cabeçalho (ação já centralizada nos módulos).
- **Filtro temporal funcional** (Hoje, 7 dias, Mês, Tudo) com controle segmentado (substitui a pílula desabilitada).
- Card "Win Rate" renomeado para **"Taxa de Conversão"** e agora **baseado em VALOR**: Σ `effectiveValue` dos Ganhos ÷ Σ `effectiveValue` de todas as oportunidades.

### Corrigido — Precificação de serviço só-mensal (Tráfego Pago)
- O 1º pagamento (no ato da contratação) é a própria mensalidade → `setup = monthly = 1497` em `products.ts`. `effectiveValue(valor, produto)` cai no preço do produto quando `valor=0` — o valor imediato passa a refletir em "Fechado (Ganho)" e na Taxa de Conversão (antes zerava).

## [2026-07-09] - Sprint: Conexão WhatsApp ponta a ponta, Exclusões, Produtos/Receita e Padronização de UI

### Corrigido — Conexão WhatsApp (Z-API) travada em "Conectando..."
- **Causa raiz (multi-fator), diagnosticada com evidência:** a Z-API conectava, mas o Funil nunca detectava. Quatro falhas somadas:
  1. `integration_channels` **não estava na publicação `supabase_realtime`** → o listener de realtime que vira a UI para "Conectado" nunca disparava. Corrigido pela migração `20260708120000_realtime_integration_channels.sql` (ADD TABLE + `REPLICA IDENTITY FULL`).
  2. **Sem `supabase/config.toml`** → `verify_jwt=true` (padrão) rejeitava o webhook `ConnectedCallback` da Z-API com 401 antes do handler. Criado `config.toml` com `verify_jwt=false` para `whatsapp-qr-inbound` e `whatsapp-inbound`.
  3. `getInstanceStatus` podia "engolir" o `connected:true` na busca do telefone (`/device`) e a action `status` gravava `numero='connected'` colidindo com `unique(provider,numero)` → 500. Reescrito: `connected` vem só do `/status`, busca de telefone isolada, log da resposta bruta; a action passou a gravar `status='ativo'` **separado** do `numero`, com placeholders por dono, sem 500.
  4. Front-end: `catch` do polling só sinalizava erro em "loading" → timeout ficava silencioso. Corrigido + botão "Já escaneei — Verificar conexão".
- Arquivos: `whatsapp-manager/index.ts`, `providers/ZApiProvider.ts`, `whatsapp-qr-inbound/index.ts`, `WhatsAppIntegration.tsx`, `App.tsx` (realtime de `integration_channels`).

### Corrigido — Recebimento de mensagens no Inbox
- **Coluna `metadata` inexistente em `inbox_messages`** fazia todo insert de mensagem recebida falhar (`PGRST204`). Migração `20260708210000_inbox_messages_metadata.sql` (add `metadata jsonb` + índice `chat_lid`).
- `whatsapp-inbound`: instrumentação (`describeError` expõe código/detalhe do Postgres, log do payload cru); parsing robusto (ignora callbacks que não são mensagem, amplia tipos, fallback); `findExistingContact` com `.limit(1)` (contatos duplicados quebravam o `maybeSingle`); processa cada mensagem isolada (fim do retry-storm/500).
- **Grupos/Comunidades:** newsletters/comunidades (broadcast) são ignoradas; mensagens de grupo passam a ser atribuídas ao **participante real** com rótulo "Pessoa · Grupo".

### Adicionado — Botão WhatsApp nos Contatos → conversa no painel
- No Perfil do Contato, o botão "WhatsApp" abre a conversa **dentro do Funil** (`/inbox?to=...`), selecionando a conversa existente ou criando um rascunho para contatos sem histórico. Corrigida corrida de efeitos que abria a conversa do topo em vez da do contato.

### Adicionado — Exclusões seguras (Contatos, Leads, Funil)
- Exclusão definitiva **com confirmação** (`ConfirmDialog` reutilizável). Segura porque todos os FKs usam `ON DELETE SET NULL` (só desvincula; preserva histórico da Inbox e relacionados). `crmService`: `deleteContact/deleteLead/deleteOpportunity` (RLS por dono). Botões nas 3 páginas (linha da tabela e card do Kanban, com guardas de drag).

### Adicionado — Funil: Produto/Serviço, preços e receita recorrente (MRR)
- Nova coluna `opportunities.produto` (migração `20260709120000`). Catálogo em `src/lib/products.ts` (setup + mensalidade): Site R$497 + R$37,90/mês, Google Meu Negócio R$800, Tráfego Pago R$1.497/mês.
- Ao criar oportunidade pelo Inbox, o **produto é auto-detectado** (varre a conversa inteira do telefone) e o **valor** já nasce com o preço. No modal, escolher o produto **auto-preenche o Valor**. Tag do produto e mensalidade no card.
- Novo card no topo do Funil: **"Fechado (Ganho)"** vs **"Projeção (pipeline aberto)"**, separando único (setup) de recorrente (MRR). Mover para "Ganho" passa a somar no Fechado automaticamente.

### Adicionado / Corrigido — Dashboard
- Nova seção **"Rotina de Hoje"**: contatos criados hoje, quantos viraram lead e a taxa contato→lead.
- Card "Taxa de Conversão" (fórmula quebrada `oportunidades/leads`, podia passar de 100%) substituído por **Win Rate** = Ganhos ÷ (Ganhos+Perdidos), com cor dinâmica e estado honesto quando não há negócios fechados.

### Padronização de UI (listas suspensas)
- ContactModal: **Origem** (Meta Ads, Google Ads, Site, WhatsApp, Indicação, Prospecção Ativa) e **Potencial** (Frio, Morno, Quente) viraram selects, preservando valores antigos ao editar.
- `SelectField` reescrito como **dropdown customizado** (não-nativo): realce da opção na paleta do projeto (`primary`), fim do azul nativo do SO. Mantém a API (`<option>` + `name` via input oculto + `onChange`), padronizando **todos** os selects sem quebrar formulários.

### Infra / Deploy
- Referências do Supabase migradas do projeto antigo (`dtdtewojmyhiegwmgmte`) para o atual (`juvwfxnlusrnvcarkrmc`) em 13 arquivos; **senha do banco removida** do `.codex/environments/environment.toml` (usa `${SUPABASE_DB_PASSWORD}`) — **rotacionada** pelo usuário.
- `public/.htaccess`: política de cache — `index.html` sempre revalidado (deploy aparece na hora) + assets com hash imutáveis. Fim do "mudança não aparece sem hard refresh".
- `.nvmrc` (22) + `engines.node >=20.19` para estabilizar o build no host (Hostinger, deploy automático via GitHub).
- `scripts/apply-supabase-sql.mjs`: ref atualizado + tolerância a erros benignos.

## [2026-07-08] - Correção: Reconexão de WhatsApp (QR Code)

### Corrigido
- **Geração de QR Code após desconexão**:
  - A Z-API levava alguns segundos para processar a desconexão internamente, e ao clicar em "Conectar Número" logo em seguida, a instância ainda estava no estado "connected", impedindo a geração de um novo QR Code.
  - `ZApiProvider.ts`: Refatorado para garantir um estado limpo antes de solicitar o QR Code — agora verifica o status, força `/disconnect` se necessário, reinicia a sessão com `/restore-session`, e tenta gerar o QR Code até 3 vezes com intervalo entre tentativas.
  - `whatsapp-manager/index.ts`: A action `create` agora busca e atualiza o registro existente no banco ao invés de tentar `upsert` com conflito de constraint. A action `disconnect` agora limpa o campo `numero` do registro.
  - `WhatsAppIntegration.tsx`: Mensagens de erro genéricas substituídas por mensagens amigáveis e orientadoras (ex: "Estamos preparando uma nova conexão. Aguarde alguns segundos e tente novamente.").

## [2026-07-08] - Melhorias de UX: Loading Inicial e Bloqueio de Inbox

### Modificado
- **Experiência de Carregamento Inicial (Boot)**:
  - Substituída a mensagem técnica "Conectando ao Supabase..." por uma comunicação institucional mais amigável ("Preparando sua experiência...").
  - Adicionado efeito de fade-in, pulso na logomarca e um spinner minimalista (`lucide-react`) para transmitir mais confiança e profissionalismo ao usuário.
- **Segurança Operacional no Inbox (`/inbox`)**:
  - Implementada a "Alternativa 4": O Inbox agora preserva todo o histórico de mensagens mesmo quando o WhatsApp está desconectado.
  - Bloqueio do Composer (campo de texto e botão de envio) caso não haja nenhuma instância ativa.
  - Exibição de um painel claro de alerta ("WhatsApp Desconectado") no local do Composer, com um botão rápido ("Reconectar WhatsApp") direcionando o usuário para o painel de configurações.

## [2026-07-07] - Correção Definitiva de Duplicidade de Chats (Z-API WhatsApp LID)

### Corrigido
- **Mapeamento de Identificadores Ocultos da Z-API**:
  - Descobrimos que mensagens enviadas diretamente pelo aplicativo físico do WhatsApp estavam gerando um chat duplicado porque as políticas de privacidade da Meta ocultam o número de telefone de destino nesses eventos, enviando apenas um `@lid` (WhatsApp Private Identifier) de 15 dígitos na propriedade `phone` do webhook.
  - `whatsapp-inbound` (Edge Function): O webhook foi refatorado para identificar quando o payload da Z-API contém um `@lid`. Quando detectado, o sistema agora faz uma query retrospectiva no banco de dados (`inbox_messages -> metadata -> chat_lid`) para encontrar e associar o número de telefone real correspondente àquele `@lid`.
  - Essa correção encerra o problema onde o "mesmo contato" ficava fragmentado em duas conversas no painel (uma com o número real e outra com o LID de 15 dígitos).
## [2026-07-07] - Correção de Duplicidade de Chats no Inbox

### Modificado
- **Lógica de Normalização de Telefones**:
  - `unifyPhone` (Front-end): Atualizado para adicionar o DDI `55` em números brasileiros que chegam com 10 ou 11 dígitos, garantindo o agrupamento correto na interface de usuário.
  - `whatsapp-inbound` e `whatsapp-send` (Edge Functions): A normalização de telefones foi atualizada para aplicar a mesma regra, registrando todas as interações no banco de dados (`inbox_messages`) com o formato unificado de 12 dígitos, eliminando a criação de chats duplicados e garantindo a vinculação correta ao CRM.
  - `crmService.ts`: Atualizado para aplicar a normalização consistente na criação e atualização de contatos e leads.

## [2026-07-06] - Correções Z-API, Abas do Inbox e Tempo Real

### Adicionado
- **Filtros Funcionais no Inbox (`/inbox`)**:
  - Lógica real de abas para "Abertas", "Não Lidas" e "Todas".
- **Sistema Realtime no Inbox**:
  - Assinatura no Supabase (`App.tsx`) para atualizar a listagem e leitura de conversas instantaneamente (sem recarregar página) sempre que um webhook inserir mensagens novas em `inbox_messages`.

### Modificado
- **Integração Z-API (Webhook de Recebimento)**:
  - `whatsapp-inbound` (Edge Function): Agora consulta o banco de dados via `instanceId` presente no payload, ao invés do `connectedPhone` (que a Z-API omite em alguns casos).
  - Assinatura Meta (JWT/HMAC): Adicionada uma regra de *bypass* (salto) para ignorar assinaturas criptografadas caso o payload seja legitimamente da Z-API, corrigindo o erro 401 de acesso negado.
- **Conexão Z-API (Polling de Status)**:
  - `whatsapp-manager/ZApiProvider.ts`: Correção do endpoint da Z-API de `/phones` para `/device` na hora de buscar qual número escaneou o QR Code. Isso permite que a conexão de fato mude o status do banco de dados para "Ativo".

## [2026-07-06] - Integração Evolution API e AI Strategist

### Adicionado
- **Integração WhatsApp via Evolution API**:
  - Nova aba WhatsApp (`/whatsapp`) com painel completo de conversas em tempo real.
  - Edge Function `whatsapp-send` para envio das mensagens.
- **Central de Inteligência de Criativos (`/criativos`)**:
  - Refatoração para um Wizard guiado de 4 etapas (Estratégia, Ideia, IA, Estúdio).
  - Edge Function `ai-generate-post` com fallbacks OpenAI e Gemini.
  - **Estrategista IA**: Função `ai-recommend-post` conectada na API oficial do Instagram (Meta Graph API) para ler o histórico e garantir Continuidade Editorial.
  - **Painel de Copy Estratégica**: Nova interface para controle rígido de limites de caracteres (máx 350) da legenda.
  - **Gestão Isolada de Hashtags**: Novo fluxo com tags editáveis, limitadas a 5 opções voltadas a vendas/B2B.
  - **Regeneração de IA de Copy**: Botão dedicado para reescrever legendas e hashtags sem impactar a arte gerada.

### Modificado
- `App.tsx` e `Whatsapp.tsx`: Correção de importações do `SharedUI` para sanar erros de compilação.
- `useWhatsApp.ts`: Ajuste de escopo de ID de mensagem temporária para evitar erros no Typescript.

## [2026-07-04] - Redesign UX/UI Pro Max (Sprint de Conversão)

### Adicionado
- **Sistema de Design e Componentização**:
  - Novo componente `<Logo />` em SVG nativo (com variante `icon-only` e tamanhos parametrizáveis), substituindo imagens antigas do logo em toda a aplicação (`Landing.tsx`, `Brandbook.tsx`, etc.).

- **Criação da Página de Cadastro (`/cadastro`)**:
  - Nova tela de criação de conta construída com base no design Master-Detail.
  - Implementação de feedback visual para Força de Senha e Validação de confirmação de senha em tempo real.
  - Otimização do fluxo separando as responsabilidades de Login e Cadastro.
  - Integração aprimorada com a função `signUp` do Supabase para inserir o nome do usuário desde o início.

- **Arquitetura Master-Detail**:
  - Introdução do "Drawer de Perfil 360º" (Slide-over panel) em várias telas para evitar context-switching (não é mais necessário abrir modais centralizadas ou navegar para outras páginas para ver detalhes).

- **Redesign da Página de Contatos (`/contatos`)**:
  - Nova visualização Master-Detail com gaveta lateral.
  - Avatares dinâmicos com iniciais coloridas.
  - Layout otimizado (Kanban mobile/cards) e lista avançada no desktop.

- **Redesign da Página de Leads (`/leads`)**:
  - Nova estrutura "Fila de Qualificação".
  - Componente de Indicador de Score Circular (ScoreRing) demonstrando a saúde do preenchimento dos dados do lead.
  - Adoção da arquitetura Master-Detail com Drawer lateral.

- **Redesign do Funil de Vendas (`/funil`)**:
  - Refatoração completa do Kanban com foco na experiência tátil de Drag and Drop.
  - Transformação da antiga seção estática de "Higiene do Funil" em "Risk Ribbons" (faixas de alerta amararelas) integradas diretamente nos cards de oportunidade (quando faltam valores ou ações).
  - Cards de oportunidades enriquecidos com valores vibrantes, tags de origem e avatar do responsável.
  - Inclusão do Drawer lateral (Profile Drawer) para visualizar detalhes e registrar Vitória/Perda rapidamente.

- **Redesign do Dashboard (`/dashboard`)**:
  - Dashboard modernizado, foco em métricas claras, prioridades de operação e performance.

- **Aprimoramento da Landing Page (`/`)**:
  - Logo antiga e esquisita do rodapé substituída pelo novo componente SVG `<Logo />`, mantendo o efeito "grayscale" até o hover.

### Modificado
- `Pipeline.tsx`: Substituição massiva da estrutura HTML antiga pelo novo Kanban fluido. Correção de tipagens (`origem`, `setSelectedOppId`).
- `Contacts.tsx` e `Leads.tsx`: Totalmente reescritas via scripts `.cjs` para adotar a skill ui-ux-pro-max.
- `Brandbook.tsx`: Adequações de logo no Header Mobile e na Sidebar.
- Diversos pacotes no `package.json` atualizados em execuções de linting/build.

### Removido
- Imagens PNG antigas e inconsistentes do logo ("símbolo esquisito") sendo totalmente depreciadas no front-end atualizado.
## [2026-07-08] - Correção Conexão QR Code WhatsApp

- Backend: Corrigido bug no `whatsapp-manager` que impedia atualização do status por atraso na resposta do campo `phone` da Z-API.
- Backend: Adicionado tratamento de webhook de conexão Z-API no `whatsapp-qr-inbound`.
- Frontend: Polling acelerado para 3s durante exibição do QR Code.
- Frontend: Implementada expiração do QR Code em 60s.
- Frontend: Novos feedbacks de interface ("QR Code lido", etc).
