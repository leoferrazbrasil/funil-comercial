# Design — Página de Campanhas (Fase 1 / MVP)

> Spec de design. Data: 2026-07-10. Status: design aprovado pelo usuário; pronto para implementação.

## Contexto

O CRM já envia templates aprovados da Meta: 1 a 1 no Inbox (Ciclo 1) e em massa a partir de `/contatos` (Ciclo 2, `BulkTemplateDialog`), reusando `getApprovedWhatsAppTemplates` + `sendInboxTemplate`. O usuário quer um **módulo de Campanhas** dedicado: uma página com um **wizard de 3 etapas** e um **preview de iPhone** ao lado.

A visão completa inclui **agendamento** e **escolha entre múltiplas contas/dispositivos Meta** — ambos custosos (backend novo e arquitetura multi-instância). Por decisão do usuário, esta **Fase 1 (MVP)** entrega a experiência do wizard **sem** essas duas partes, que ficam para as Fases 2 e 3.

## Decisões (brainstorming)

- **Escopo Fase 1:** página + menu + wizard 3 etapas + preview iPhone, usando a **conta/número Meta já ativo** (read-only), **enviar agora**, contatos do **CRM** + **importação CSV**.
- **Número de origem:** somente leitura (sem chooser de múltiplas contas — Fase 3).
- **Agendar:** opção visível porém **desabilitada** ("em breve" — Fase 2).
- **CSV:** destinatários **efêmeros** (não viram contatos no CRM no MVP).
- **Sem backend novo, sem persistência de campanha** (send-now; o rastro fica na Inbox). Histórico + agendamento = Fase 2.

## Escopo

**Dentro:** rota/menu `/campanhas`; wizard 3 etapas; seleção de template (só suportados) + variáveis (nome por-destinatário ou valor fixo); destinatários via CRM (checkbox) ou CSV (import + validação); confirmação + envio 1 a 1 com progresso; preview iPhone ao vivo.

**Fora (fases futuras):** agendamento (tabela `campaigns` + agendador cron); múltiplas contas Meta / escolha de dispositivo (multi-instância); persistência/histórico de campanhas; auto-criar contatos a partir do CSV.

## Arquitetura

- **Front-end apenas.** Nenhuma Edge Function nova. Reusa `whatsapp-templates` (listagem) e `sendInboxTemplate` (envio por destinatário) do Ciclo 1/2.
- Cada envio já grava a mensagem em `inbox_messages` (rastro na Inbox).

### Componentes / arquivos

- `src/pages/Campaigns.tsx` — página: stepper, conteúdo por etapa, layout dividido (form à esquerda, preview à direita), motor de envio (loop sequencial com progresso, reusando `sendInboxTemplate`).
- `src/components/PhonePreview.tsx` — mockup de iPhone (presentational) que renderiza uma bolha de WhatsApp com o texto dado.
- `src/lib/csv.ts` — parser simples de CSV (campos com aspas) + detecção das colunas nome/telefone.
- `src/lib/navigation.ts` — novo item "Campanhas".
- `src/lib/accessControl.ts` — libera a rota `campanhas` por papel.
- `src/lib/types.ts` — adiciona `campanhas` ao tipo `Route`.
- `src/App.tsx` — rota `/campanhas` → `CampaignsPage` (recebe `contacts` e `channels`).

## Layout

- **Desktop:** duas colunas. Esquerda = wizard (stepper no topo + campos da etapa + navegação Voltar/Avançar). Direita = `PhonePreview` fixo, mostrando a mensagem ao vivo.
- **Mobile:** empilha; o preview vira um card colapsável acima do wizard.

## Fluxo do wizard

### Etapa 1 — Configure a sua campanha
- **Nome da campanha** (texto, obrigatório).
- **Enviando de:** exibe o canal Meta ativo (número/Phone Number ID) — read-only. Se não houver Meta ativa, um aviso orienta a ativá-la no `/perfil`.
- **Template:** seletor dos aprovados (só `supported`); ao escolher, monta os campos de variável.
- **Variáveis:** por variável, modo *Nome do contato* (por destinatário) ou *Valor fixo*.
- **Envio:** *Enviar agora* (selecionado); *Agendar* desabilitado ("em breve").

### Etapa 2 — Escolha dos contatos
- Abas **Do CRM** e **Importar CSV**.
- **Do CRM:** lista com checkbox + busca; omite quem não tem telefone discável.
- **CSV:** upload `.csv` → parse → detecta colunas nome/telefone → valida telefones → lista de destinatários efêmeros. Mostra total válido e descartados.
- Fonte ativa define os destinatários da campanha.

### Etapa 3 — Confirmação
- Resumo: nome, template, nº de destinatários, número de origem, "enviar agora".
- **Disparar** → envia 1 a 1 (pausa entre envios p/ rate limit), barra de progresso, status por destinatário, e resultado final (X enviados / Y falhas). Continua mesmo se um falhar.

## Preview iPhone

- Renderiza o **corpo do template** com as variáveis resolvidas para um **destinatário de exemplo** (1º selecionado do CRM / 1ª linha do CSV / placeholder "Maria"), dentro de uma moldura de celular com cabeçalho de conversa e bolha de WhatsApp. Atualiza ao vivo conforme a configuração.

## Regras / validações

- Só avança da Etapa 1 com nome preenchido, template selecionado e todas as variáveis de *valor fixo* preenchidas.
- Só avança da Etapa 2 com ≥ 1 destinatário válido.
- Envio só com Meta ativa; sem Meta, o `sendInboxTemplate` retornaria erro (mostrado por destinatário) — por isso a Etapa 1 sinaliza a ausência de Meta antes.
- Telefone válido = ≥ 10 dígitos (o backend normaliza).

## Critérios de sucesso

1. Menu "Campanhas" abre `/campanhas` com o wizard e o preview iPhone.
2. Etapa 1: nomear, escolher template (só suportados), configurar variáveis; preview atualiza ao vivo.
3. Etapa 2: selecionar contatos do CRM **ou** importar um CSV válido; total de destinatários correto.
4. Etapa 3: disparar → progresso + status por destinatário → resumo final; mensagens aparecem na Inbox.

## Riscos e mitigações

- **CSV malformado** → parser tolerante + validação de telefone + feedback de descartados.
- **Envio longo (muitos destinatários)** → sequencial com progresso; aviso acima de N; continua em falhas.
- **Meta inativa / `META_WABA_ID` ausente** → Etapa 1 sinaliza; envio falha por destinatário sem quebrar a página.
- **Duplicação do motor de envio** (existe no `BulkTemplateDialog`) → aceitável no MVP; um refactor para hook compartilhado pode vir depois.
