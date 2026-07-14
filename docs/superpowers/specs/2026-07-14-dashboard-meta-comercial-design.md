# Dashboard de Meta Comercial e Previsibilidade

Data: 2026-07-14
Status: aprovado para planejamento

## Objetivo

Reformular a página `/dashboard` para acompanhar diariamente a máquina comercial da Funil Comercial e projetar a capacidade necessária para bater uma meta mensal de caixa.

O dashboard deve deixar claro:

- quantos contatos foram gerados;
- quantos contatos viraram leads;
- quantas vendas foram fechadas;
- quanto caixa do mês foi realizado;
- quanto MRR novo foi contratado;
- quantos contatos, leads e vendas ainda são necessários para bater uma meta mensal.

## Abordagem aprovada

Usar o caminho híbrido:

1. Métricas reais do CRM no período atual, principalmente no mês corrente.
2. Simulador de meta mensal, preenchido inicialmente pelas taxas reais, mas ajustável pelo usuário.

Essa abordagem evita um dashboard puramente retrospectivo e também evita um simulador desconectado da operação real.

## Regra financeira

A meta mensal de faturamento deve considerar apenas caixa do mês, ou seja, pagamento único/setup.

Para o produto `Site / Landing Page`, a regra atual do catálogo é:

- setup: R$ 497,00;
- MRR: R$ 37,90.

Para uma meta de caixa, uma venda de site conta como R$ 497,00.

O MRR não entra na meta de caixa, mas deve aparecer separado como `MRR novo contratado`, porque representa receita recorrente futura.

## Métricas reais

O dashboard deve calcular, para o mês corrente:

- contatos criados;
- leads criados;
- vendas fechadas, usando oportunidades com etapa `Ganho`;
- caixa realizado, somando o valor efetivo único das oportunidades ganhas;
- MRR novo contratado, somando a mensalidade dos produtos das oportunidades ganhas;
- taxa contato -> lead;
- taxa lead -> venda;
- taxa contato -> venda;
- contatos por venda.

Onde possível, o vínculo deve usar os relacionamentos existentes:

- `Lead.contact_id` identifica contatos que viraram lead;
- `Opportunity.lead_id` identifica leads que viraram oportunidade/venda;
- `Opportunity.etapa === "Ganho"` identifica venda fechada.

Quando o vínculo direto não existir, a métrica deve continuar funcionando com os registros disponíveis, mas a UI deve indicar o dado como estimado ou incompleto quando isso afetar a leitura.

## Fórmulas principais

Para o simulador:

```text
vendas_necessarias = ceil(meta_caixa / ticket_setup)
leads_necessarios = ceil(vendas_necessarias / taxa_lead_para_venda)
contatos_necessarios = ceil(leads_necessarios / taxa_contato_para_lead)
contatos_por_venda = contatos_necessarios / vendas_necessarias
mrr_novo_projetado = vendas_necessarias * mrr_por_venda
```

Para o cenário real atual:

```text
taxa_contato_para_lead = leads_do_mes_com_contato / contatos_do_mes
taxa_lead_para_venda = vendas_ganhas_do_mes / leads_do_mes
taxa_contato_para_venda = vendas_ganhas_do_mes / contatos_do_mes
contatos_por_venda = contatos_do_mes / vendas_ganhas_do_mes
```

Divisões por zero devem mostrar estado honesto, como `Sem dados suficientes`, sem inventar taxa.

## Exemplo de referência

Se o mês tem 17 contatos e 1 venda:

```text
contatos_por_venda = 17
```

Para uma meta de R$ 5.000,00 vendendo `Site / Landing Page`:

```text
vendas_necessarias = ceil(5000 / 497) = 11
mrr_novo_projetado = 11 * 37,90 = R$ 416,90/mês
```

Se a taxa observada continuar em 17 contatos por venda:

```text
contatos_necessarios = 11 * 17 = 187
```

## Estrutura de interface

### 1. Cabeçalho de meta mensal

Substituir o topo genérico por uma visão orientada a meta:

- Meta de caixa do mês;
- Caixa realizado;
- Falta para bater a meta;
- MRR novo contratado.

O período principal da visão deve ser o mês corrente. O seletor temporal existente pode continuar existindo para leitura operacional, mas a meta mensal deve ser visualmente dominante.

### 2. Máquina comercial

Exibir o funil por contagem:

```text
Contatos -> Leads -> Vendas
```

Cada etapa deve mostrar:

- realizado no mês;
- taxa de passagem para a próxima etapa;
- necessário para bater a meta;
- diferença entre necessário e realizado.

### 3. Simulador de meta

Adicionar um painel de simulação com controles para:

- meta mensal de caixa;
- produto ou ticket/setup manual;
- MRR por venda;
- taxa contato -> lead;
- taxa lead -> venda.

Os valores iniciais devem vir do CRM quando houver dados suficientes. Se uma taxa real não puder ser calculada, o campo correspondente deve iniciar sem valor automático e o resultado dependente dela deve pedir ajuste manual, em vez de usar uma taxa inventada. O usuário deve poder ajustar as taxas para testar cenários melhores ou piores.

O resultado deve mostrar:

- vendas necessárias;
- leads necessários;
- contatos necessários;
- contatos por dia útil restante no mês;
- caixa projetado;
- MRR novo projetado.

`Contatos por dia útil restante` deve considerar apenas dias de segunda a sexta entre a data atual e o último dia do mês, incluindo a data atual quando ela for dia útil.

### 4. Continuidade operacional

Manter uma área de prioridade comercial, mas abaixo das métricas de meta. O dashboard deve continuar respondendo "o que fazer agora", sem competir com a nova leitura principal de previsibilidade.

## Componentes e dados

Criar uma camada de cálculo testável, separada do JSX, para evitar fórmulas espalhadas dentro da página.

Unidade sugerida:

```text
src/lib/dashboardMetrics.ts
```

Responsabilidades:

- filtrar dados por período;
- calcular métricas reais;
- calcular projeções do simulador;
- formatar estados de dados insuficientes apenas como flags, não como texto de UI.

A página `src/pages/Dashboard.tsx` deve consumir esses cálculos e focar em apresentação.

## Estados vazios e limites

- Sem contatos no mês: mostrar que ainda não há base para taxa real.
- Sem vendas no mês: mostrar que ainda não há conversão observada; o simulador deve pedir uma taxa manual para calcular projeções dependentes de venda.
- Meta menor que ticket: ainda assim mostrar 1 venda necessária.
- Taxas manuais devem ser limitadas entre 0% e 100%.
- Taxa igual a 0% não deve causar divisão infinita; mostrar que a meta não é alcançável com a taxa atual.

## Testes

Adicionar testes para a camada de cálculo antes da implementação.

Casos mínimos:

- 17 contatos e 1 venda produzem 17 contatos por venda;
- meta de R$ 5.000 com ticket de R$ 497 exige 11 vendas;
- 11 vendas de site projetam R$ 416,90 de MRR novo;
- divisão por zero retorna estado insuficiente, não `Infinity` ou `NaN`;
- taxas ajustadas no simulador recalculam contatos e leads necessários.

O repositório ainda não possui framework de teste unitário configurado. A implementação deve decidir entre introduzir um teste unitário leve para essa camada ou validar com `tsc` e testes determinísticos em script, mantendo o escopo pequeno.

## Fora de escopo

- Alterar o modelo de dados no Supabase.
- Criar histórico persistente de metas mensais.
- Criar metas por vendedor.
- Criar previsão estatística avançada com sazonalidade.
- Automatizar recomendações de campanha.

Esses pontos podem ser evoluções futuras depois que o dashboard passar a responder corretamente à pergunta central: quantos contatos são necessários para gerar as vendas da meta mensal?
