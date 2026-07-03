# Paridade tecnica e visual com o Funil Imobiliario

Este documento registra a fundacao aplicada no Funil Comercial para herdar a metodologia do projeto `software` do Funil Imobiliario sem copiar o posicionamento imobiliario.

## Estruturas replicadas

- Skills locais em `.agents/skills`: `ui-ux-pro-max`, `frontend-design`, `design-system`, `ui-styling`, `copywriting`, `brand` e `funil-crm-intelligence`.
- Sistema de tokens em `src/styles/tokens.css`, com aliases semanticos para tema, superficie, texto, borda e destaque.
- Configuracao central de marca em `src/lib/branding.ts`.
- Navegacao centralizada em `src/lib/navigation.ts`.
- Controle inicial de acesso por perfil em `src/lib/accessControl.ts`.
- Motor deterministico de recomendacao comercial em `src/services/commercialIntelligence.ts`.
- Primeiro componente reutilizavel de estado em `src/components/ui/State.tsx`.

## Roadmap aplicado

1. Consolidar a base de design e engenharia.
2. Preparar componentes compartilhados para telas de CRM.
3. Substituir decisoes locais por configuracoes centrais.
4. Evoluir o Dashboard para recomendacoes comerciais derivadas dos dados reais.

## Proximas etapas recomendadas

- Extrair Dashboard, Inbox, Contatos, Leads e Funil para `src/pages`.
- Criar componentes `Button`, `Card`, `Dialog`, `Table`, `FormLayout` e `MobileRecordCard`.
- Ligar o motor `commercialIntelligence` tambem ao Inbox e ao Funil.
- Definir RBAC completo antes de adicionar novos modulos.
- Criar testes de smoke para login, criacao de lead e movimentacao no funil.
