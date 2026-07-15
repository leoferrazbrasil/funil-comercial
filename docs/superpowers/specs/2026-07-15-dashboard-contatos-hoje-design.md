# Design: Contatos Necessarios Hoje no Dashboard

## Objetivo

Exibir no dashboard a quantidade de contatos que precisam ser feitos hoje para bater a meta mensal de caixa, usando as metricas atuais do funil e descontando o que ja foi realizado no mes.

## Decisao Aprovada

Usar a abordagem "contatos necessarios hoje".

Formula:

```text
contatosParaHoje = ceil(max(0, contatosNecessariosNoMes - contatosRealizadosNoMes) / diasUteisRestantes)
```

Onde:

- `contatosNecessariosNoMes` vem da projecao da meta mensal.
- `contatosRealizadosNoMes` vem dos contatos criados no mes atual.
- `diasUteisRestantes` considera hoje ate o fim do mes, inclusive.
- Se a meta ja estiver coberta em contatos, o valor exibido deve ser `0`.
- Se as taxas estiverem ausentes, zeradas ou o ticket for invalido, o dashboard deve manter o estado explicativo existente, sem mostrar um numero falso.

## Experiencia no Dashboard

No bloco "Necessario para bater a meta", trocar a enfase de "Contatos por dia util" para "Contatos para hoje".

O card deve mostrar:

- Valor principal: contatos que precisam ser feitos hoje.
- Contexto curto: contatos restantes no mes e dias uteis restantes.

Exemplo:

```text
Contatos para hoje
6
71 restantes / 14 dias uteis
```

O total mensal de contatos necessarios continua visivel no simulador para manter a previsibilidade mensal.

## Comportamento Matematico

A projecao deve continuar calculando vendas, leads e contatos mensais com as taxas informadas ou herdadas do funil real.

A nova metrica diaria deve usar o saldo, nao o total bruto:

```text
contatosRestantesNoMes = max(0, contatosNecessariosNoMes - contatosRealizadosNoMes)
contatosParaHoje = ceil(contatosRestantesNoMes / diasUteisRestantes)
```

Se `diasUteisRestantes` for `0`, o valor diario deve ser `null` para evitar divisao invalida.

## Dados Necessarios

Adicionar `contactsRealized` ao input da projecao de meta, preenchido pelo dashboard com `realMetrics.currentMonth.contacts`.

Adicionar ao resultado da projecao:

- `contactsRemaining`
- `contactsNeededToday`

## Testes

Adicionar testes em `src/lib/dashboardMetrics.test.ts` para cobrir:

- desconta contatos ja realizados do total necessario;
- retorna `0` quando os contatos realizados ja cobrem o necessario;
- preserva estado sem valor quando a projecao nao tem taxas suficientes.

## Fora de Escopo

- Criar meta diaria editavel separada da meta mensal.
- Considerar sabados, domingos ou feriados customizados.
- Medir contatos feitos especificamente no dia atual.
- Criar notificacao ou alerta automatico.
