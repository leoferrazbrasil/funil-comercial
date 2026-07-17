---
title: Importação de Dados Offline no GA4
date: 2026-07-17
tags:
  - seo
  - ga4
  - analytics
  - crm
aliases:
  - GA4 Offline Data Import
status: concluded
---

# Importação de Dados Offline no GA4

Esta nota documenta o processo e as configurações para importar dados offline (como leads qualificados e vendas fechadas no CRM) de volta para o Google Analytics 4 (GA4).

> [!info] Objetivo Estratégico
> Integrar eventos de fundo de funil (CRM) ao GA4 para melhorar a qualidade da atribuição de campanhas de tráfego pago (via Smart Bidding) e comprovar o ROI real das estratégias de SEO. O foco é otimizar para conversões qualificadas, e não apenas para volume de leads.

## 1. Configuração da Fonte de Dados no GA4

A configuração foi realizada no painel de Administração do GA4, em "Importação de dados".

- **Nome da fonte de dados:** `CRM Leads Qualificados MQL`
- **Tipo de dados:** `Eventos: Web`
- **Método:** Upload manual de CSV (para a Prova de Conceito).

## 2. Estrutura do Arquivo CSV

Para que o GA4 processe corretamente os eventos web offline, o CSV precisa seguir uma estrutura rigorosa. 

> [!warning] Atenção aos Cabeçalhos
> O arquivo deve conter os nomes de coluna exatos em inglês, caso contrário a importação será rejeitada no status "Processando...".

Colunas essenciais configuradas:
1. `client_id` **(Obrigatório)**: ID do cookie do Google Analytics, que deve ser capturado e salvo no CRM no momento em que o lead preenche o formulário no site.
2. `event_name` **(Obrigatório)**: O nome do evento que será registrado no GA4 (ex: `lead_qualificado`, `offline_sale`).
3. `timestamp_micros`: Timestamp exato de quando o evento ocorreu no CRM, convertido para o formato Unix (microssegundos).
4. `value` e `currency` (Recomendado): Para atribuir valor financeiro à conversão no GA4 e potencializar a otimização de ROAS em campanhas de Ads.

## 3. Próximos Passos Estratégicos

Após a primeira importação manual ter sido processada com sucesso com o status de Concluído (em 17 de Julho de 2026), o plano de ação foi definido:

- [ ] **Verificação de Relatórios**: Confirmar a exibição dos novos eventos em `Relatórios > Engajamento > Eventos` (após a janela de processamento de 24h).
- [ ] **Configuração de Evento Principal**: Marcar o novo evento importado como **Evento principal** (Key Event) na seção de Exibição de dados do GA4.
- [ ] **Automação do Fluxo**: Substituir o processo de upload manual por uma integração automatizada entre o CRM e o GA4, seja por conector nativo, middleware (Zapier/Make) ou Measurement Protocol.
