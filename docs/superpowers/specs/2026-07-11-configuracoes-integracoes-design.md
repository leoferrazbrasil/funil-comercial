# Design — Página "Configurações" (hub de integrações)

Data: 2026-07-11
Status: aprovado (design) — aguardando review do spec

## Problema

O módulo "Integração de WhatsApp" (`IntegrationSection`, seletor Z-API × Meta
Cloud API) vive dentro do form da página de **Perfil do Usuário** (`/perfil`).
Isso mistura dados pessoais/segurança com configuração de integrações e não
escala quando surgirem novas integrações/APIs.

## Objetivo

Criar uma página **"Configurações"** que reúna as integrações disponíveis,
**desvinculando** o módulo de integração do Perfil. Escopo de hoje: apenas a
integração de WhatsApp. A página deve acomodar futuras seções sem reescrita.

## Decisões (travadas com o usuário)

- **Nome/escopo:** página **"Configurações"** (hub), cuja primeira seção é
  **"Integrações"**. Não construir infra de abas agora (YAGNI) — apenas uma
  seção titulada, com espaço para novas seções abaixo.
- **Acesso:** **ícone de engrenagem no header**, ao lado do avatar/perfil
  (mesmo padrão do Perfil, que já é acessado pelo header — não pelo sidebar).
- Perfil passa a conter **apenas** Informações Pessoais + Segurança.

## Arquitetura

Rota nova `/configuracoes` → `SettingsPage` (`src/pages/Settings.tsx`).
A página renderiza um cabeçalho ("Configurações") + a seção "Integrações" que
envolve o componente existente `IntegrationSection` (movido, não reescrito).

### Mudanças por arquivo

| Arquivo | Mudança |
|---|---|
| `src/pages/Settings.tsx` | **novo** — página Configurações; seção "Integrações" com `<IntegrationSection />` |
| `src/pages/Profile.tsx` | remover o painel `<IntegrationSection/>` + o import |
| `src/App.tsx` | rota `/configuracoes` (render `SettingsPage`); botão de engrenagem no header → `onNavigate("configuracoes")` |
| `src/lib/types.ts` | `Route` += `'configuracoes'` |
| `src/lib/accessControl.ts` | incluir `'configuracoes'` nas rotas permitidas, espelhando `'perfil'` |

## Componentes / responsabilidades

- **`SettingsPage`**: layout da página (título + seções). Depende de
  `IntegrationSection`. Sem lógica de negócio própria.
- **`IntegrationSection`**: inalterado — continua sendo a única fonte da UI de
  integração (Z-API × Meta). Move de local, não muda comportamento.
- **Header (App.tsx)**: ganha um gatilho de navegação para `/configuracoes`.

## Fora de escopo (YAGNI)

- Abas/roteamento interno de seções.
- Migrar Perfil/Segurança para dentro de Configurações.
- Novas integrações além do WhatsApp (a estrutura só precisa acomodá-las).

## Riscos / cuidados

- `App.tsx` carrega a WIP de prospecção não commitada → commitar apenas as
  mudanças desta feature via `git stash` (técnica já usada nesta sessão).
- Garantir que `/configuracoes` não caia no gate de acesso (espelhar `'perfil'`
  no `accessControl`).
- Validar com `tsc` + `build`.

## Critérios de aceite

1. `/configuracoes` abre a página Configurações com a integração de WhatsApp
   funcionando igual a antes.
2. Perfil não mostra mais o módulo de integração.
3. Engrenagem no header leva à nova página.
4. `tsc` e `build` limpos; WIP de prospecção intacta.
