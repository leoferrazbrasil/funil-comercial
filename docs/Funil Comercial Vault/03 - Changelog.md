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

## [2026-07-15] - Conteúdo Topo de Funil: O Glossário (Dicionário de Vendas)

### Adicionado — Estrutura de Dicionário
- Criada a base de dados leve e escalável `glossarioData.ts` contendo as definições dos termos.
- Implementada a rota raiz `/glossario` (`GlossarioIndex.tsx`) para listagem A-Z de termos, ranqueável para buscas genéricas.
- Implementada a página do termo `/glossario/:slug` (`GlossarioTermo.tsx`) gerando nativamente o Schema `FAQPage` para abocanhar Snippets do Google.
- Motor de Sitemap atualizado: O arquivo `generate-sitemap.mjs` agora intercepta as rotas do glossário, gerando o arquivo secundário `sitemap-glossario.xml` atrelado ao index.

### Modificado — Taxonomia e Conversão
- Rotas adicionadas aos caminhos públicos em `App.tsx` para permitir leitura sem necessidade de login.
- Injetada a arquitetura de conversão na landing page dos termos: o visitante chega por uma dúvida acadêmica (Topo do Funil), mas é fisgado no fim da página por um Call-To-Action focado em gerar receita com a equipe comercial da Funil Comercial.

## [2026-07-15] - Arquitetura de Conteúdo: Topic Clusters (Pilares e Satélites)

### Adicionado — Rede Semântica no Blog
- A estrutura de dados do blog (`blogData.ts`) foi expandida para suportar Artigos Pilar (`clusterType: 'pillar'`) e Artigos Satélites (`clusterType: 'satellite'`).
- Criado o artigo pilar inaugural: *"O Guia Definitivo de Vendas para Negócios Locais"*.

### Modificado — Renderização Dinâmica de Contexto (`BlogPost.tsx` e `BlogIndex.tsx`)
- O componente de postagem de blog agora mapeia links internos automaticamente:
  - Artigos Satélites ganham um *badge* visível e clicável no topo, apontando para o Pilar principal.
  - Artigos Pilares renderizam um "Índice de Capítulos" ao final do post, listando e criando links diretos para todos os seus satélites.
- A página inicial do blog (`BlogIndex.tsx`) agora destaca visualmente os artigos que são "Conteúdo Pilar", orientando os leads para guias aprofundados.

## [2026-07-15] - Expansão do Motor de SEO Programático: Intenção Comercial

### Adicionado — Landings de Intenção de Fundo de Funil
- Criação de uma nova estrutura dinâmica de página (`ProgrammaticIntentLanding.tsx`) que altera sua Copy (H1, Meta Titles e descrições) com base em 3 novas intenções de busca altamente qualificadas: "Agência de Marketing", "Empresa de Captação" e "Melhor CRM".
- Integração dessas novas rotas no `App.tsx` para garantir acesso público livre do gate de autenticação.
- Com isso, o rastreador gera de forma automática Landing Pages super focadas, cruzando nicho, cidade e o *serviço exato* buscado pelo cliente.

### Modificado — Explosão de Cobertura no Sitemap Local
- O gerador de mapas do site (`generate-sitemap.mjs`) foi alterado para mapear também essas 3 variações comerciais para cada local e nicho já suportado.
- O impacto foi o salto de 1.356 para **5.424 URLs** na categoria local, englobando buscas comerciais massivas (ex: "Melhor crm para nutricionistas em Campinas").

### Adicionado — Componente de Internal Linking Dinâmico
- Novo componente `<RelatedContent />` que gera dinamicamente links para outras especialidades na mesma cidade e para a mesma especialidade em cidades vizinhas.
- Injetado nativamente nas milhares de páginas de SEO Programático (`LocalCityLanding.tsx` e `ProgrammaticBlogPost.tsx`), retendo o rastreamento do Googlebot e distribuindo autoridade (PageRank) em formato de teia.

### Modificado — Fragmentação e expansão do Sitemap (Sitemap Index)
- O script `generate-sitemap.mjs` foi reescrito para gerar um **Sitemap Index** apontando para sub-sitemaps menores (`sitemap-core.xml`, `sitemap-local.xml` e `sitemap-blog.xml`), facilitando o diagnóstico de indexação no Google Search Console.
- **Correção Crítica:** O gerador de sitemap antigo ignorava os guias programáticos do blog. O novo script agora inclui e indexa 1.356 novas rotas de blog focadas em intenção de compra.
- Rotas privadas da plataforma receberam tag `noindex` centralizada (`App.tsx`) e `index.html` agora faz *preload* das fontes críticas.
## [2026-07-14] - Posicionamento e Estratégia de SEO: Foco em Profissionais e Regiões

> [!abstract] Resumo da Atualização
> Toda a estratégia de SEO e conteúdo da plataforma foi pivotada para focar estritamente em profissionais liberais e autônomos, abandonando o foco em clínicas e escritórios estruturados de nichos não prioritários.

### Modificado — transição completa de nichos alvo (SEO local e Conteúdo)
- **Nichos focados:** A estratégia agora mira em Psicólogos, Terapeutas, Nutricionistas, Fisioterapeutas, Massoterapeutas, Contadores e Engenheiros Autônomos.
- **Limpeza de referências:** Todas as menções em Landing Pages, matriz de SEO (`seoNicheData.ts`) e textos-base institucionais foram atualizadas para esse novo foco.

> [!success] Remoção de Públicos
> Dentistas, Clínicas Médicas, Advogados, Corretores, Arquitetos, Estéticas, E-commerce, Agências e Lojas de Móveis/Roupas foram **removidos**. A página e a rota `/site-para-dentistas` foram totalmente excluídas (`DentistWebsiteLanding.tsx`).

### Modificado — Blog e Roteiro Editorial realinhados ao novo ICP
- Artigos e posts de blog reescritos para atacar as dores dos novos nichos alvo (ex: foco migrado de advogados para contadores, e de odontologia para fisioterapia).
- Os temas em `editorialPillars.ts` foram atualizados para gerar sugestões e contextos condizentes com nutricionistas e engenheiros, interligando com o [[01 - Requisitos#8.1. Roteiro Editorial (`/roteiro`)|Roteiro Editorial]].

### Adicionado — Bloco estratégico de Cidades Prioritárias
- Em vez de alterar a navegação geral da página de Cidades, foi inserido um bloco fixo "Principais Regiões Atendidas" no rodapé da página inicial (`Landing.tsx`). 
- Isso injeta relevância local de SEO para 25 cidades chave (Balneário Camboriú, São Paulo, Campinas, etc.) a partir da home, preservando a autoridade da página mãe.

## [2026-07-14] - Infraestrutura de IA: Novas Skills e Sincronização Claude

### Adicionado — instalação de skills externas e sincronização
- Foram baixadas e instaladas novas habilidades (Skills) no diretório de inteligência do projeto (`.agents/skills`), incluindo ferramentas completas de manipulação do Obsidian (via repositório oficial `obsidian-skills`) e o utilitário `graphify`.
- Foi executado com sucesso o script de espelhamento (`npm run sync-skills`), garantindo que a inteligência de código (Claude) tenha acesso imediato e sincronizado ao acervo completo de 27 skills através da pasta espelho `.claude/skills`.

## [2026-07-14] - Consultoria: Landing Page e Banner Global

### Adicionado — nova vertical de aquisição focada em consultoria B2B
- Criação de uma Landing Page focada exclusivamente em captação de leads para "Consultoria Comercial Estratégica" (`/consultoria`).
- O botão de ação é direcionado direto ao WhatsApp de pré-vendas com uma mensagem pré-configurada sobre diagnóstico comercial.
- Inserido um Banner Global (`AnnouncementBar`) fixado no topo de todas as páginas públicas (Home, Cidades, Serviços e Blog) promovendo o novo canal de captação. O Header público de Consultoria agora usa `sticky top-0` para evitar "buracos" de scroll ao rolar a página abaixo do banner.

## [2026-07-14] - SEO Avançado: Blog Posting Schema e Tailwind Typography

### Modificado — páginas do blog agora renderizam HTML corretamente e injetam Microdados SEO
- **Bug Fix de Estilização:** O texto dos artigos no `/blog/:slug` não assumia as formatações corretas. O plugin `@tailwindcss/typography` foi integrado, aplicando a classe `prose prose-invert` na renderização do `react-markdown` na `BlogPost.tsx`, resgatando listas, bolds, citações e headings automaticamente do MD.
- **Estrutura Semântica (SEO):** A tag principal `<article>` da página `BlogPost.tsx` agora recebe os atributos de microdados `itemScope` e `itemType="http://schema.org/BlogPosting"`. Metadados ocultos (Headline, DatePublished, Author) foram marcados via `itemProp` para facilitar a indexação rica pelo Google.

## [2026-07-14] - Deploy: Isolar Puppeteer (Prerender) do pipeline de build normal

### Corrigido — o build quebrava no servidor compartilhado da Hostinger
- O script automatizado de pré-renderização estática de SEO (`prerender-core.mjs`), que exige a execução de um navegador Chromium invisível (Puppeteer), estava causando falhas de compilação em ambientes de hospedagem compartilhada (Hostinger) por falta de bibliotecas de sistema gráfico (`libatk-bridge`, etc).
- **Ação:** O comando de Prerender foi desacoplado do hook padrão de `build` no `package.json`. O build natural do Vite foi restaurado e processa o deploy da Hostinger sem bloqueios. O pré-render segue vivo, mas agora é acionado opcionalmente localmente (`npm run prerender`).

## [2026-07-12] - meta-auth: resolver o Instagram em todas as Páginas (fim do 'unknown')

### Corrigido — conexão salvava account_id 'unknown' e quebrava só ao publicar
- **Bug:** `meta-auth` olhava só a **primeira Página** (`me/accounts[0]`) e, sem IG vinculado nela, salvava `account_id: 'unknown'` **silenciosamente** → o publish falhava depois com *"Graph API Container Error: Object with ID 'unknown' does not exist"*.
- **Correção:** pede `instagram_business_account{id,username}` já na lista de Páginas (1 request) e **varre todas**; usa a primeira com IG vinculado. Se **nenhuma** tiver, **falha na conexão** com mensagem clara (nunca salva `'unknown'`). **Requer deploy da `meta-auth`** (ação do dono) + o IG ser **Profissional e vinculado a uma Página**, concedida no login. Ver pendências.

## [2026-07-12] - Publicar Arte: mostrar o erro real da meta-publish

### Corrigido — "Edge Function returned a non-2xx status code" escondia a causa
- A `meta-publish` devolve **400 com o motivo real no corpo** (`{ error }`), mas o `supabase-js` só expõe a mensagem genérica *"non-2xx status code"* e o frontend descartava o corpo. Agora `handlePublish` lê `error.context` (o `Response`) e **exibe a mensagem de verdade** (ex.: "Failed to upload image to temporary storage.", "Graph API Container Error: …"). Só front-end (`PublishModal.tsx`), sem deploy.
- **Provável causa da falha de publicação:** o bucket de Storage **`social_media_temp`** (migração `20260706195257_create_storage_bucket.sql`, público) pode **não ter sido aplicado** — a `meta-publish` sobe a arte nele e envia a **URL pública** ao IG (que não aceita base64). Ver pendências do dono.

## [2026-07-12] - Publicar Arte: desconectar a conta do Instagram

### Adicionado — botão "Desconectar" no modal de publicação
- No modal **Publicar Arte** (`/criativos`), a "Conta Conectada" só tinha **Reconectar**; agora tem **Desconectar** — remove a integração do Instagram (`social_integrations`, RLS por dono) e volta ao estado "conectar", permitindo vincular **outra conta**. Estado de loading/`disabled` durante a operação. Só front-end (`PublishModal.tsx`).

## [2026-07-13] - Telefone: preservar o 9º dígito (envio Meta + exibição)

### Corrigido — número salvo/enviado sem o 9 → template não entregava
- **Causa raiz:** `normalizePhone` (crmService **e** edge functions) **removia o 9º dígito** de números BR de 13 díg (formato "legado"). O contato era salvo sem o 9, exibido errado, e o **envio pela Meta ia sem o 9** → a Cloud API não entregava no 1º contato.
- **`whatsapp-send`:** o campo `to` da Meta passa a ser **reconstruído COM o 9** (`withNinthDigit`) — o telefone gravado e o agrupamento seguem normalizados. **Requer deploy da função.**
- **`crmService.normalizePhone`:** **não remove mais o 9** — o contato guarda o número REAL (com DDI + 9). A remoção do 9 vira só chave de **comparação** (`phoneMatchKey` no App / `unifyPhone` no Inbox), então o match contato↔conversa continua tolerante a com/sem 9 (sem duplicar). Front auto-deploy. Arquivos: `whatsapp-send`, `crmService.ts`, `App.tsx`.

## [2026-07-13] - Estúdio de Peças (`/pecas`): gerador de peças de marca

### Adicionado — hub de peças para presença social
- Nova página **`/pecas`** (área **marketing** → só admin): um **hub** com **7 peças** de marca (Facebook Capa 820×360, Foto de perfil 1:1 1080×1080, LinkedIn Capa 1584×396, WhatsApp Business 640×640, YouTube Banner 2560×1440, X/Twitter 1500×500, Story Destaque 1080×1920) — cada uma abre um **gerador**.
- **Gerador:** canvas em **px exato** (escalado só para caber) · **guias** de área segura (ouro) e zona da foto de perfil (vermelho) que **só aparecem na tela, nunca no PNG** (ficam fora do `canvasRef`) · botões **Baixar PNG exato (1×)**, **Baixar 2×** e **Ocultar guias** · observações por peça. Export via `html-to-image` (mesmo padrão do `/criativos`).
- **Marca:** funil de 3 barras (ouro) + "Funil Comercial" + tagline "Estrutura de vendas para negócios locais", fundo grafite; foto de perfil = ícone centralizado, seguro p/ recorte circular. Registro único em `socialPieces.ts`; página `PieceStudio.tsx`. Revisado por workflow adversarial (0 defeitos confirmados). Arquivos: `socialPieces.ts`, `PieceStudio.tsx`, `navigation.ts`, `accessControl.ts`, `types.ts`, `App.tsx`.

## [2026-07-13] - Publicar no IG: migração para login DIRETO pelo Instagram

### Mudado — abandona o login via Facebook (Página/Business) → Instagram Login
- Diagnóstico final: as Páginas/IG são geridas por Business Manager → `me/accounts=0` no token do usuário, e `business_management` dá "Invalid Scopes" (não habilitado no app). Decisão: migrar para a **"Instagram API com login pelo Instagram"** (Business Login) — sem Página do Facebook, sem `me/accounts`, sem Business Manager.
- **Fluxo novo:** `PublishModal` abre `instagram.com/oauth/authorize` (Instagram App ID + escopos `instagram_business_basic,instagram_business_content_publish`) → callback **`/oauth/instagram`** (`InstagramOAuthCallback`) → Edge Function **`instagram-auth`** troca o code por token (já recebe o `user_id` do IG) → long-lived → `social_integrations`. `meta-publish` passou a usar **`graph.instagram.com/v21.0`**.
- **Ativação (dono):** no painel Meta, adicionar o produto **Instagram → API com login pelo Instagram**, pegar **Instagram App ID + Secret**, configurar o redirect `https://funilcomercial.com/oauth/instagram`; secrets Supabase `INSTAGRAM_APP_ID`/`INSTAGRAM_APP_SECRET`; env do front `VITE_INSTAGRAM_APP_ID`; deploy `instagram-auth` + `meta-publish`. IG precisa ser Profissional (Comercial/Criador). Arquivos: `instagram-auth/index.ts`, `InstagramOAuthCallback.tsx`, `PublishModal.tsx`, `meta-publish/index.ts`, `App.tsx`.

## [2026-07-13] - meta-auth: resolver IG via Business Manager (fim do "nenhuma Página")

### Corrigido — assets geridos por Business não apareciam em me/accounts
- **Bug:** com Páginas/IG sob um **Business Manager** ("Funil Comercial Social Media"), o `me/accounts` no token do usuário vinha **vazio** → conexão falhava com "Nenhuma Página concedida", mesmo o usuário selecionando Página + IG.
- **Correção:** `meta-auth` resolve o IG em **camadas**: (1) `me/accounts` (campo simples, sem expansão aninhada instável); (2) fallback por página (node direto com o **token da página**); (3) **fallback via Business Manager** (`me/businesses` → `owned_pages` + `client_pages`). Erro final agora traz **diagnóstico** (contagem por etapa). O escopo do login ganhou **`business_management`** (para o `me/businesses`). **Requer deploy da `meta-auth`** + **reconectar** (nova permissão no consentimento). Arquivos: `meta-auth/index.ts`, `PublishModal.tsx`.

## [2026-07-13] - Contatos: telefone sem o DDI 55 no form (DDD correto)

### Corrigido — máscara lia o 55 (país) como DDD e truncava o número
- **Bug:** a máscara `(00) 00000-0000` (11 dígitos) estourava com números salvos com o DDI `55` (13 díg.), lendo o 55 como DDD (ex.: `555181491193` → `(55) 51814-9119`) e **truncando** o resto ao salvar. **Correção:** o `TextField` remove o `55` de números internacionais (12–13 díg.) antes de alimentar a máscara — mostra o **DDD real** e não corrompe ao salvar. O 55 é re-adicionado ao discar/enviar WhatsApp (`normalizeContactPhone`). Vale para contatos e leads.
- **Placeholder:** os campos de **telefone** (contato/lead/criação via Inbox) deixaram de sugerir `5511999999999`; agora usam o padrão local `(11) 99999-9999`. O campo **"Número de entrada"** do canal WhatsApp mantém o formato internacional (é o número oficial do canal). Arquivos: `SharedUI.tsx`, `App.tsx`.

## [2026-07-13] - Funil: motivo da perda ao marcar Perdido

### Adicionado — modal de motivo (obrigatório) em Perdido
- Ao marcar uma oportunidade como **Perdido** — pelo **botão** do painel **ou** ao **arrastar** o card para a coluna Perdido — abre um **modal** que exige escolher o **motivo**: *Não tem interesse · Não respondeu · Bloqueou o contato · Preço/orçamento · Escolheu concorrente · Fora do perfil (ICP) · Outro* (texto livre). Confirmar sem motivo fica bloqueado.
- O motivo é gravado em `opportunities.motivo_perda` e exibido no painel ("Motivo: …") quando a oportunidade está Perdida. A interceptação do drag fica toda no `Pipeline.tsx` (envolve o `onDragEnd`) — **sem tocar no `App.tsx`**.
- `updateOpportunityStage` grava o motivo com **degradação elegante** (se a coluna ainda não existe, grava só a etapa). **Ativação:** aplicar a migração `20260713160000_opportunities_motivo_perda.sql`. Arquivos: `types.ts`, `crmService.ts`, `Pipeline.tsx`.

## [2026-07-13] - Confirmação de auth: feedback no navegador + admin por 2 e-mails

### Adicionado — tela de feedback para redirects de auth do Supabase
- Ao confirmar troca de e-mail, o Supabase redireciona para `/#message=...` (ou `#error=...`), mas a home não tem `Toaster` — o usuário ficava sem retorno. Agora o `App.tsx` lê esse hash **antes do gate público** e mostra uma **tela de confirmação** (com tradução pt-BR das mensagens conhecidas, ex.: "confirme também o link enviado ao outro e-mail") + botão "Continuar" que limpa o hash. Não é bug de código: a **troca segura de e-mail** do Supabase exige confirmar **os dois** endereços (novo e antigo).
- **Migração de papéis** ajustada: a promoção a `admin` agora casa **ambos os e-mails** do Leonardo (`leonardoferrazbrasil@gmail.com` e `leonardo@funilcomercial.com`), para sobreviver à troca de e-mail em andamento.

## [2026-07-13] - Reset de senha funcional (ponta a ponta)

### Adicionado — "Esqueci minha senha" + página de redefinição
- O link morto virou fluxo real: no **Login**, "Esqueci minha senha" abre um modo inline que pede o e-mail e dispara `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/redefinir-senha' })` (mensagem genérica, não revela se o e-mail existe).
- Nova página pública **`/redefinir-senha`** (`ResetPassword.tsx`): o Supabase cria a sessão de recuperação ao abrir o link; a página valida nova senha + confirmação → `updateUser({ password })` → encerra a sessão e volta ao `/login`. Trata link expirado/inválido com mensagem clara. Rota adicionada a `PUBLIC_PATHS` e ao bloco público (renderiza antes do gate de sessão).
- **Config do dono (obrigatória p/ o link não cair em localhost):** no Supabase → Authentication → URL Configuration, **Site URL** = `https://funilcomercial.com` e adicionar `https://funilcomercial.com/redefinir-senha` em **Redirect URLs**. Sem isso, o Supabase ignora o `redirectTo`. Arquivos: `Login.tsx`, `ResetPassword.tsx`, `App.tsx`.

## [2026-07-13] - Permissões por área (comercial × marketing) + papel admin

### Mudado — reestrutura do modelo de papéis
- **Conceito:** permissão por **área**, não por papel solto. `AREA_ROUTES` em `accessControl.ts`: **comercial** = dashboard/inbox/contatos/leads/funil; **marketing** = campanhas/criativos/roteiro/agregadores. `roleAreas`: **admin** = comercial+marketing; **gestor**/**vendedor** = só comercial. Adicionar um futuro perfil (ex.: `social_media` → só marketing) é trivial.
- **Papel `diretor` eliminado → `admin`** (o operador técnico da plataforma; "diretor de vendas" não faz sentido numa estrutura de tech). Time comercial = gestor + vendedor.
- **Enforcement em 2 camadas:** o menu já escondia (via `visibleNavItems`); agora `guardRoute` no `App.tsx` **bloqueia o acesso direto por URL** (ex.: vendedor em `/criativos` → redireciona `/dashboard`). A lógica de "dono do time" (Inbox/Settings: `role !== 'vendedor' && sem admin_id`) segue dando ao gestor os poderes gerenciais.
- **Ativação:** aplicar a migração `20260713150000_roles_admin_restructure.sql` — troca o `check` do `role` para `('admin','gestor','vendedor')`, renomeia `diretor`→`admin`, **promove a conta `leonardoferrazbrasil@gmail.com` (1º usuário) a `admin`** por e-mail (os demais mantêm gestor/vendedor), e restringe as policies de `social_integrations` (publicar IG) a `admin`. Arquivos: `types.ts`, `accessControl.ts`, `App.tsx`.

## [2026-07-13] - Contatos: campos Site, Instagram e LinkedIn

### Adicionado — 3 campos sociais no cadastro/edição de contato
- O `ContactModal` (Novo **e** Editar contato) ganhou **Site**, **Instagram** e **LinkedIn** (opcionais, abaixo do E-mail); no Editar vêm pré-preenchidos. Persistidos na tabela `contacts` (`site`/`instagram`/`linkedin`, `text` nulos).
- **Degradação elegante:** `createContact`/`updateContact` gravam os campos sociais só se as colunas existirem — se a **migração ainda não foi aplicada**, o contato é salvo sem eles (nunca quebra). **Ativação:** aplicar a migração `20260713140000_contacts_social_fields.sql` (colar o SQL). Arquivos: `types.ts`, `crmService.ts`, `App.tsx`.

## [2026-07-13] - Inbox: busca de conversas por nome e número

### Corrigido — o filtro de busca não encontrava conversas
- **Bug:** a busca do Inbox procurava em campos diferentes dos exibidos: `remetente_nome` (nome de perfil do WhatsApp, não o do contato), `mensagem` e `key` (telefone unificado, sem o 9º dígito). Resultado: buscar pelo **nome do contato** ou pelo **número como aparece** não filtrava nada.
- **Correção:** passa a buscar em `displayName` (nome do contato), `remetente_nome`, `telefone` (exibido), `mensagem` e `key` + **fallback por dígitos** (casa o número mesmo digitado com `+`, espaços, `()` ou `-`). Só front-end (`Inbox.tsx`).

## [2026-07-12] - Funil: botões Ganho/Perdido do painel de oportunidade

### Corrigido — ação rápida Ganho/Perdido não funcionava
- **Bug:** no painel **Oportunidade** (`/funil`), os botões **Ganho** e **Perdido** não tinham `onClick` — nada acontecia ao clicar.
- **Correção:** `handleSetOutcome` marca a etapa (`updateOpportunityStage`) com **update otimista** (mesmo padrão do drag, via `queryClient.setQueriesData(["crmSnapshot"])`) + `toast` + estado de loading/`disabled`; em erro, `invalidateQueries` recarrega. O painel reflete na hora ("Oportunidade finalizada como …"). Só front-end (`Pipeline.tsx`), sem tocar no `App.tsx`.

## [2026-07-12] - Estúdio de Criativos: área segura por formato no canvas

### Adicionado — faixa central segura (crop-safe) por formato
- O canvas ganhou `SAFE_AREA` (por formato) + componente `<SafeFrame>`: **texto, logo e CTA** ficam numa **faixa central**, afastados das bordas; só **decorativos** (pontos, brilho) sangram até a borda. Evita que a UI do Instagram **corte/cubra** elementos críticos.
  - Margens de conteúdo **excedem o mínimo crop-safe da Meta** (34px laterais / 60px topo-base no 4:5), com o essencial bem dentro da zona segura **1012×1230**.
  - **4:5:** 64px laterais / 72px topo-base.
  - **9:16 (1080×1920):** **200px** de topo livres (nome do perfil) + **~250px** de base reservados à legenda/áudio/ações (*valor-base — a instrução do dono para a margem inferior veio cortada; ajustável em `SAFE_AREA`*) · laterais 64px.
  - **1:1 (1080×1080):** 64px simétrico (não especificado).
- Os 3 templates (`t1`/`t4`/`t12`) foram reestruturados para posicionar o conteúdo **dentro do `SafeFrame`**. Só front-end (`Creatives.tsx`).

### Corrigido — headline cruzava a margem de segurança na prévia/publicação
- **Bug:** com o fallback usando o **tema inteiro** como headline (110px fixos), palavras longas (ex.: "OPORTUNIDADES") ocupavam quase a largura total do 1080px e **encostavam/cruzavam** as margens seguras na "Prévia do Post".
- **Correção:** `fitHeadline` **auto-ajusta o tamanho da headline** (máx 110px no `t1` / 96px no `t4`, mín 52/44px) para caber na largura segura com respiro — funciona no snapshot do `html-to-image`, para qualquer conteúdo. Margens do 4:5 elevadas de 34/60 para **64/72** (mais respiro, ainda acima do mínimo Meta).

## [2026-07-12] - Estúdio de Criativos: temas prontos no Passo 2 (fim da "página em branco")

### Corrigido — o tema escolhido chega ao estúdio mesmo com a IA offline
- **Bug:** o "Gerar Criativo" dependia 100% da Edge Function `ai-generate-post`; com a IA offline (Fase B) o `invoke` falhava, caía no `catch` e abria o estúdio com os **defaults hardcoded** (`SEU CONCORRENTE NÃO É MELHOR…`) — **descartando o tema escolhido** no Passo 2.
- **Correção:** a peça agora é composta **localmente a partir do tema + pilar** (headline = tema, subheadline/legenda = tema + CTA do pilar, template `t1`), de forma **determinística e sem inventar dado**; o estúdio **sempre reflete a escolha**. A IA, quando online, apenas **refina por cima** (ignorando o mock de "sem API Keys"). Mesmo tratamento no "Regenerar IA". Só front-end (`Creatives.tsx`).

### Mudado — Passo 2 apresenta o conteúdo, em vez de pedir
- O gargalo universal de "o que postar" foi atacado: o **Passo 2** do estúdio deixou de pedir um resumo/assunto e passou a **apresentar os "temas recorrentes" do pilar** (Brandbook 04 · Linha Editorial 4.1) como **conteúdo pronto para escolher** — seguindo a sequência estratégica da 4.2 via o pilar do Passo 1. Clicar num tema preenche a base; o campo de texto virou **opcional** (ajustar/escrever). `editorialPillars.ts` ganhou `temas` por pilar (fonte única, também disponível ao Roteiro). Só front-end.

### Corrigido — subheadline repetida entre os temas do mesmo pilar
- **Bug:** todos os temas de um pilar geravam a **mesma subheadline** (o CTA do pilar, único). **Correção:** cada tema virou `{ titulo, apoio }` (`EditorialTheme`) — o **`titulo`** é o gancho (headline) e o **`apoio`** é um texto de apoio **próprio de cada tema** (subheadline distinta). O card do Passo 2 agora mostra título + apoio; o caption compõe título + apoio + CTA (sem duplicar). Só front-end.

## [2026-07-12] - Agregador de links (`/l/:slug`) — bio do Instagram / produto

### Adicionado — Página de agregador estilo "linktree"
- Nova rota **pública `/l/:slug`** (agregador de links) — o **Funil Comercial** é a primeira config (`/l/bio` → `funilcomercial.com/l/bio`), usada na **bio do Instagram**: **Diagnóstico no WhatsApp** (CTA ouro, `wa.me/5551996737359` com mensagem pronta) + **Site**. Visual **dark premium** aprovado por mockup: marca-funil em ouro, selo "Disponível para diagnóstico" com ponto esmeralda pulsante, rodapé das 4 camadas.
- **Config-driven:** `src/lib/aggregators.ts` (tipos + configs por slug) + `src/pages/LinkAggregator.tsx`. `App.tsx` ganhou a rota + `/l/` no gate público (`isPublicPath`). Spec: `docs/superpowers/specs/2026-07-12-agregador-links-design.md`.

### Adicionado — Agregador virou produto multi-tenant (admin + temas)
- Nova tabela **`aggregators`** (RLS: **dono CRUD do seu + leitura pública dos `published`** — é o que deixa o visitante anônimo abrir `/l/:slug`; rascunhos não vazam). Sem Edge Function.
- **Admin `/agregadores`** (menu próprio, diretor/gestor): lista + editor (slug com checagem de disponibilidade, tagline, avatar, status, **tema**, até **5 links** reordenáveis, **rascunho × no ar**) + "importar modelo Funil Comercial". Cada cliente = **um registro no banco** pela tela (sem código).
- **Temas por cliente:** 4 presets curados em `src/lib/aggregatorThemes.ts` (CSS vars `--agg-*`). A página pública passou a **ler do banco** por slug, com **fallback estático** (a bio do FC nunca quebra) e a copy do FC editável (registro `funilcomercial` no banco tem precedência). **Ativação:** aplicar a migração `aggregators`. Spec: `docs/superpowers/specs/2026-07-12-agregadores-multitenant-design.md`.

### Mudado — Entrega ao cliente vira `/bio` estático (gerador)
- Definido o modelo real: o agregador do cliente é um **`/bio` estático autocontido** instalado no **diretório do site do próprio cliente** (domínio dele: `cliente.com.br/bio`) — os sites são **builds avulsos**, então **não** faz sentido servir por `funilcomercial.com/l/slug`. O admin `/agregadores` ganhou **"Gerar /bio"**: baixa um `index.html` com CSS/ícones/tema/dados **inline** (`src/lib/aggregatorHtml.ts`, que também virou a fonte única do CSS `.agg-*`). O `/l/:slug` fica como **pré-visualização** + bio da própria FC.

### Adicionado — Gerar o `/bio` a partir do site do cliente (extração de identidade)
- No admin, cole o **link do site pronto do cliente** → auto-preenche **nome, cores e logo** (zero digitação). Como o navegador não lê sites de terceiros (CORS), a extração roda na **Edge Function `bio-extract`** (Deno): `theme-color`/cor dominante do CSS → accent · `<title>`/`og:site_name` → nome · `apple-touch-icon`/`og:image`/favicon → logo (+ detecta link de WhatsApp). **Best-effort** (campos editáveis).
- **Tema personalizado:** `buildCustomTheme({accent,bg?,text?})` deriva toda a paleta `--agg-*`; coluna `aggregators.theme_custom` (migração) + `resolveAggregatorTheme` no gerador e no preview. **Ativação:** aplicar a migração `theme_custom` + **deployar `bio-extract`** (deploy é do dono).

## [2026-07-12] - Conteúdo editorial, Roteiro, base de conhecimento, marca & paleta

### Adicionado — Roteiro Editorial (`/roteiro`)
- Nova página que orquestra a **sequência** de posts (que o `/criativos`, peça isolada, não faz): uma **fila persistida** seguindo a rotação de pilares da 4.2 ("próximo sugerido", tema, status A fazer/Gerado/Publicado) + **deep-link** para o estúdio (`/criativos?pilar=&tema=` cai no passo da ideia). Puro Postgres + front-end (tabela `editorial_queue`, RLS por dono) — sem Edge Function. Registro único de pilares em `src/lib/editorialPillars.ts` (compartilhado com o estúdio). Acesso: diretor/gestor. **Ativação:** aplicar a migração `editorial_queue`. Spec/plano em `docs/superpowers/`. Ver [[01 - Requisitos#8.1. Roteiro Editorial (`/roteiro`)]].

### Mudado — Estúdio de Criativos alinhado ao Brandbook 04 (Fase A) + wizard reescrito
- **Taxonomia editorial (Fase A):** o `/criativos` deixou de gerar do posicionamento antigo (B2B/SaaS/CRM). Pilares, objetivos, defaults, CTAs e um checklist "Antes de publicar" realinhados à [[Linha_Editorial_Funil_Comercial|Linha Editorial]] / Brandbook 04.
- **Objetivo × Pilar fundidos (1:1):** como a 4.1 amarra objetivo e pilar, o wizard passou a escolher **o pilar** (que já traz objetivo, etapa e CTA), eliminando combinações fora da doutrina e completando o objetivo "Atrair" que faltava.
- **Wizard (Progressive Disclosure):** a tela deixou de mostrar tudo de uma vez. Fluxo guiado — **O Caminho** (Estrategista IA em destaque + "OU" + criar manual) → **manual** (pilar → ideia, revelando etapa a etapa, com barras-resumo editáveis) → **estúdio**. Animações reais (`fc-fade-in`/`fc-reveal`; o projeto não tem `tailwindcss-animate`, então os `animate-in` eram no-ops).
- **Microcópia honesta:** removidas promessas que não procedem (a IA está offline/Fase B e a arte é template) — "a IA escreve/monta a arte" virou cópia verdadeira agora **e** depois da Fase B.

### Adicionado — Brandbook: 04. Diretrizes de Conteúdo & Ativação
- Publicados no `/brandbook` os **pilares editoriais (4.1)**, a **Matriz 5W2H (4.2)** e o **checklist** (`ContentGuidelinesSection`). Fonte de verdade da doutrina de conteúdo. Fontes: [[Linha_Editorial_Funil_Comercial]] e [[Diretrizes_Publicacao_5W2H]].

### Mudado — Posicionamento: Funil Comercial é a EMPRESA, o CRM é o SOFTWARE
- Firmada a distinção **marca-mãe × produto**: "Funil Comercial" = **empresa** de estrutura de vendas (4 camadas); o **CRM** = um **produto/software** dela (camada de Conversão). No Brandbook, a **Visão Geral** ganhou o bloco "Marca-mãe × Produto" e a **Atuação de Mercado** saiu do "SaaS/CRM B2B" para estrutura de vendas (clientes/segmentos → público local: médicos, advogados, contadores, comércio local…). A base de conhecimento (CLAUDE.md, README, cofre) passou a chamar o projeto de **"plataforma"**, não "um CRM".
- **Área logada** passou a se identificar como **"Funil Comercial CRM"** (`brandConfig.appName` na topbar); a marca-mãe segue "Funil Comercial" nos contextos institucionais (Brandbook, home, `/crm`, rodapés, legais).

### Mudado — Paleta: accent teal-ciano → verde-esmeralda (psicologia do novo público)
- Reavaliada para o novo ICP (negócios locais/liberais): mantém **preto/grafite** (autoridade) e **ouro/âmbar** (CTA/prosperidade) e troca o **accent teal** (frio/SaaS, resíduo do posicionamento antigo) por **verde-esmeralda** (crescimento/confiança/resultado). `tokens.css` (primitivas + `--fc-accent`/`--fc-focus-ring`, light+dark) — o shell legado herda via token, sem editar `styles.css`.
- O verde foi levado às **páginas públicas** só nos **elementos semânticos de sucesso** (✓ das 4 camadas/diferenciais na home; "Clientes Atendidos" e "Como devemos falar" no Brandbook), com o **CTA mantido em ouro**. Classe **`fc-success`** theme-aware (emerald-600 no claro, emerald-400 no escuro).
- Contexto anterior (mesma frente): o **tema claro** foi suavizado (paleta menos agressiva, `tokens.css` e `index.css` sincronizados) e ~12 arquivos migraram do idioma dark hardcoded (`white/N`) para tokens theme-aware (`foreground/N`, `border-border`).

### Adicionado — Base de conhecimento para agentes
- **`CLAUDE.md`** (raiz, auto-carregado): mapa conciso (stack, rotas, dados, edge functions, design system, gotchas de deploy/WIP). O cofre ganhou **[[05 - API e Edge Functions]]**, **[[06 - Design System]]** e **[[07 - Componentes]]**, fechando as lacunas de API/design-system/componentes. O `README.md` aponta para o `CLAUDE.md` (deixou de se descrever como "protótipo"). Graphify documentado como opcional (o `.gitignore` ignora seus artefatos). *(Memória persistente do agente — usuário, preferências, posicionamento — vive fora do repo.)*

## [2026-07-11] - Handoff de conversas entre usuários (time leve sobre o admin)

### Adicionado — Transferência de conversas para vendedores
- O CRM deixou de ser só single-user: o **admin** (dono do número/canal) cria **vendedores** ligados a ele e **transfere conversas** do Inbox. O vendedor vê e responde **apenas** as conversas atribuídas a ele, enviando pelo **canal do admin** em nome do time. Registros de CRM (contatos/leads) **não** são compartilhados (v1).
- **Modelo leve** (dados seguem do admin, sem entidade "organização"): `profiles.admin_id`, tabela `conversation_assignments` (1 por conversa), `inbox_messages.sent_by`. RLS libera ao vendedor só a conversa atribuída (`is_conversation_assignee`).
- **Nova Edge Function `team-create-member`** (service-role): admin cria o vendedor (email + senha provisória). Seção **Equipe** em Configurações. `whatsapp-send` passou a enviar pelo canal do **admin dono da conversa** (autoriza o vendedor atribuído, grava `sent_by`). Inbox ganhou **botão Transferir + selo "Atendendo" + filtro "Atribuídas a mim"**.

> [!info] Construído por desenvolvimento orientado por subagentes (7 tasks)
> Spec → plano → execução com um subagente implementador + revisor por task, e review final da branch inteira. Os reviews pegaram e corrigiram achados **reais de segurança** antes do merge: RLS de UPDATE deixava o vendedor "sequestrar" a mensagem reescrevendo `owner_id`/`telefone` (trigger de identidade imutável); `team-create-member` era **fail-open** sem profile (agora nega por padrão + evita usuário órfão); `upsertProfile` **resetava `role`** a cada login (removido do payload); vendedor podia injetar `contact_id`/`lead_id` na conta do admin (bloqueado); e a policy `profiles_update_own` deixava o vendedor **auto-escrever `role`/`admin_id`** via API (trigger `profiles_protect_role`).

> [!warning] Ativação (ação do dono) — a feature entra em produção após:
> 1. Aplicar a migração `supabase/migrations/20260712100000_team_handoff.sql` (SQL Editor). 2. Deployar `team-create-member` e `whatsapp-send` (e `whatsapp-inbound`, que ganhou o comentário do normalizePhone). Enquanto não aplicar, o Inbox degrada de forma silenciosa (sem UI de handoff) — nada quebra. Spec: `docs/superpowers/specs/2026-07-11-handoff-conversas-time-design.md`; plano: `docs/superpowers/plans/2026-07-11-handoff-conversas-time.md`.

## [2026-07-11] - Entrega de WhatsApp (diagnóstico + observabilidade), Configurações e UX

### Adicionado — Observabilidade de entrega (status da Meta + selinho no Inbox)
- O webhook **`whatsapp-inbound`** passou a processar os eventos **`statuses`** da Meta (antes descartados), casando pela **wamid** (`provider_message_id`). Migração adiciona **`delivery_status`** (sent/delivered/read/failed) e **`delivery_error`** em `inbox_messages`; `whatsapp-send` grava baseline `'sent'`. O **Inbox** mostra um **selinho por mensagem** (✓ enviada · ✓✓ entregue · ✓✓ azul lida · ⚠ falhou) com o **erro da Meta inline**. Antes, a não-entrega era caixa-preta.

> [!success] A observabilidade revelou a causa real da não-entrega de templates
> Erro **`[131042] Business eligibility payment issue`** — **pendência de PAGAMENTO** da conta WhatsApp Business, **não** limite de marketing nem bug de código. Padrão que fecha: **texto livre** (grátis, dentro da janela de 24h) entrega; **template** (cobrado, iniciado pela empresa) trava até o pagamento ser resolvido. Verificação da empresa está **aprovada** — o gargalo é o método de pagamento da WABA.

### Corrigido — Envio de WhatsApp não mascara mais falha como "enviada"
- Quando o canal ativo (Meta/Z-API/Evolution) estava **sem credencial de envio**, a `whatsapp-send` respondia 200 com fallback e o `crmService` gravava **localmente** → o painel dizia "enviada" sem nada sair. Agora retorna **erro 409** com mensagem clara e o Inbox mostra o erro real. **Causa no ambiente:** o secret **`META_WHATSAPP_ACCESS_TOKEN`** estava ausente (o webhook de recebimento não usa esse token — por isso o inbound seguia ok). Resolvido setando o token permanente (System User).

### Adicionado — Página **Configurações** (hub de integrações)
- Nova rota **`/configuracoes`** (`Settings.tsx`), acessada por um **ícone de engrenagem no header**. O módulo **Integração de WhatsApp** (`IntegrationSection`, Z-API × Meta) saiu do **Perfil** e virou a seção "Integrações" dessa página. Perfil ficou só com dados pessoais + segurança. Estrutura pronta para novas seções. Spec: `docs/superpowers/specs/2026-07-11-configuracoes-integracoes-design.md`.

### Corrigido — Inteligência Comercial (Dashboard) mais confiável
- O painel sugeria "Responder X" mostrando **mensagens que nós mesmos enviamos** (não filtrava direção). Agora `messageNeedsAction` exige **`direction === "inbound"`** e status não respondido. Priorização deixou de pegar "o primeiro da lista": **não-lidas primeiro**, depois a que **aguarda há mais tempo**; lead/oportunidade priorizam **maior valor**. **100% local (regras), sem IA e sem custo** — confirmado que a funcionalidade não usa API de IA.

### Corrigido — Tela de carregamento com a identidade da marca-mãe
- A `LoadingScreen` usava um selo legado "FC" (teal/verde) fora da paleta. Reescrita com o componente **`<Logo>`** + spinner na cor primary. Além disso, **rotas públicas renderizam antes do boot de autenticação** — o visitante que chega na home/`/crm` não vê mais a tela de carregamento. CSS órfão (`.brand-mark`/`.loading-state`) removido.

> [!danger] Segurança — pendência de rotação
> O `secrets.txt` estava **versionado no GitHub** (a entrada no `.gitignore` estava corrompida com bytes NULL). Foi **removido do versionamento** e o `.gitignore` corrigido, mas os segredos **já expostos no histórico** precisam ser **ROTACIONADOS**: token permanente da Meta e o **PAT do Supabase** (que apareceu em prints durante o deploy). Rotacionar + revogar os antigos.

> [!info] Infra aplicada nesta sessão
> O **403 da CLI do Supabase** era token de conta sem privilégio — resolvido com um PAT novo da conta dona. Deploys concluídos em produção (`juvwfxnlusrnvcarkrmc`): **`campaign-runner`**, **`whatsapp-inbound`** e **`whatsapp-send`**. Confirmado que há **dois projetos** — usar sempre `juvwfxnlusrnvcarkrmc` ("Funil Comercial Produção").

## [2026-07-11] - Reposicionamento do site: empresa de estrutura de vendas

### Mudado — funilcomercial.com vira a home da EMPRESA (CRM → `/crm`)
- **Posicionamento:** "Não somos mais uma agência. Montamos a sua estrutura de vendas." Público: **negócio local** (liberais, autônomos, prestadores). Método nomeado: **Método Estrutura de Vendas** — 4 camadas (01 Presença: Site+GMN · 02 Aquisição: tráfego · 03 Conversão: CRM+WhatsApp · 04 Escala: IA+rotina); o cliente entra pela camada que precisa.
- **Home nova** (`Landing.tsx`): hero, visual das camadas, dores locais, método, esteira de serviços (CTA de WhatsApp **por serviço**, número oficial Meta `5551996737359`), segmentos, 3 passos, fundador, FAQ. **Preços não publicados** — valores fechados no diagnóstico (decisão do dono). A antiga landing do CRM virou **`/crm`** (`CrmLanding.tsx`, rota pública). SEO/OG atualizados.
- **Correções da revisão adversarial (parcial — limite de sessão):** removido claim falso "criptografia de ponta a ponta" (FAQ do `/crm` e Login → TLS + repouso + isolamento por conta); corrigido **mojibake `NegociaÃ§Ã£o`** em `isClosingStage` (5 arquivos — o estágio Negociação nunca casava); tráfego explicita "verba à parte".

## [2026-07-11] - Campanhas Fase 2: persistência + agendamento (envio server-side)

### Adicionado — Agendamento e histórico de campanhas
- O disparo saiu do navegador e virou **server-side**: novas tabelas `campaigns` + `campaign_recipients` e a Edge Function **`campaign-runner`** que envia os templates pela Graph API. **Supabase Cron** (`pg_cron`+`pg_net`, secret `CAMPAIGN_RUNNER_SECRET`) aciona o runner a cada minuto nas campanhas vencidas.
- Front (`/campanhas`): opção **Agendar** (data/hora) além de *enviar agora*; **Histórico** com status (agendada/enviando/concluída) + **cancelar** agendadas; "enviar agora" cria a campanha, aciona o runner e acompanha por **polling**. Sem tocar no `App.tsx` (owner vem da sessão).

> [!success] Runner endurecido por revisão adversarial (25 agentes / 12 achados)
> Claim atômico por destinatário + `provider_message_id` (idempotência — evita reenvio duplicado ao retomar); contadores por **agregação** (corretos com milhares); **retry** de erros transitórios (429/5xx) com limite; **abort** se a Meta não estiver configurada. **Segurança:** trigger força o owner do destinatário = owner da campanha (bloqueia injeção cross-tenant) + runner escopa por owner. Front: rollback de campanha órfã, feedback correto de cancelamento, polling com teto, "Voltar" travado após o envio.

> [!warning] Passos de infra (manuais) para o agendamento funcionar
> Aplicar a migração; criar o secret `CAMPAIGN_RUNNER_SECRET`; deployar `campaign-runner`; rodar `supabase/sql/campaign-cron.sql` (habilita `pg_cron`/`pg_net` + agenda o job). Spec: `docs/superpowers/specs/2026-07-11-campanhas-fase2-agendamento-design.md`.

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
