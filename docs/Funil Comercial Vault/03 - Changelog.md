# Changelog

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