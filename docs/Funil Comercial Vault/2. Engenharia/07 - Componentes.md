---
title: Componentes
aliases:
  - Componentes
  - Componentes React
tags:
  - funil-comercial/arquitetura
  - funil-comercial/frontend
date: 2026-07-11
---

# 🧩 Componentes

> [!abstract] Sobre esta nota
> Catálogo dos componentes reutilizáveis (`src/components/`) e das páginas (`src/pages/`). O "o que a tela faz" está em [[01 - Requisitos]]; o tema/estilo em [[06 - Design System]]. Índice em [[00 - Inicio]].

## Componentes reutilizáveis (`src/components/`)

**Formulários & base**
- `SharedUI.tsx` — `TextField`, `SelectField` (dropdown customizado com realce na paleta), `EntityForm`, modais base.
- `ConfirmDialog.tsx` — confirmação de exclusão reutilizável.
- `Logo.tsx` — logo (variantes `icon-only`/`stacked`, temas `default`/`monochrome-black`).

**Integrações & WhatsApp**
- `IntegrationSection.tsx` — seletor **Z-API × Meta Cloud API** (ativa um provider, desativa o outro); renderiza QR ou card de status da Meta.
- `WhatsAppIntegration.tsx` — fluxo de QR Code (Evolution/Z-API).
- `TemplatePicker.tsx` — seletor de **templates aprovados da Meta** no Inbox (preview + campos por variável; desabilita os não suportados com motivo).
- `BulkTemplateDialog.tsx` — disparo de template em massa a partir de `/contatos` (variável por-destinatário, seleção por checkbox, progresso).
- `TeamSection.tsx` — gestão de time/handoff (admin cria vendedores; ver [[04 - Roadmap]]).

**Conteúdo & Brandbook** (seções renderizadas na página `/brandbook`)
- `ContentGuidelinesSection.tsx` — "04. Diretrizes de Conteúdo & Ativação" (pilares 4.1 + matriz 5W2H 4.2 + checklist).
- `AvatarGuidelinesSection.tsx`, `SocialMediaSection.tsx`, `SocialTemplatesGallery.tsx` — demais seções do Brandbook.

**Prévias & publicação**
- `PhonePreview.tsx` — mockup de iPhone/WhatsApp (prévia ao vivo em Campanhas).
- `WhatsAppChat.tsx` — render de conversa estilo WhatsApp.
- `PublishModal.tsx` — modal de publicação do criativo (imagem + legenda).

**`src/components/ui/`** — primitivos no estilo shadcn (base para o resto).

## Páginas (`src/pages/`)

**App (privadas):** `Dashboard`, `Inbox`, `Contacts`, `Leads`, `Pipeline` (funil), `Campaigns`, `Creatives` (estúdio `/criativos`), `EditorialPlanner` (`/roteiro`), `Profile`, `Settings` (`/configuracoes`), `Whatsapp`, `MetaOAuthCallback`.

**Públicas:** `Landing` (`/`), `CrmLanding` (`/crm`), `Brandbook`, `LegalPages` (Privacidade/Termos/Exclusão), `Login`, `SignUp`, `ProspectingPreview` (previews de prospecção — **frente WIP**, ver memória/[[04 - Roadmap]]).

## Padrões

- Páginas de conteúdo/estúdio são **autossuficientes**: obtêm a sessão via `supabase.auth` e usam **React Query** (ex.: `Creatives`, `EditorialPlanner`, `Settings`). O `App.tsx` só registra a rota.
- Estado global do CRM: `App.tsx` mantém o `crmSnapshot` (React Query) e injeta via props nas páginas de CRM (Dashboard/Inbox/Contacts/Leads/Pipeline).
- Modais de CRM (Contact/Lead/Opportunity/Message/Channel) são locais ao `App.tsx`.
- Pilares editoriais: registro único em `src/lib/editorialPillars.ts` (compartilhado por `Creatives` e `EditorialPlanner`).
