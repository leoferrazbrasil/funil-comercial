---
tipo: incidente
status: corrigido
data: 2026-07-25
projeto: Funil Comercial
dominio: funilcomercial.com
---

# Incidente - Vulnerabilidades Hostinger 2026-07-25

## Resumo

A Hostinger alertou 3 vulnerabilidades altas no projeto do dominio `funilcomercial.com`, publicadas em 2026-07-24 e detectadas na verificacao de 2026-07-25.

Pacotes envolvidos:

- `brace-expansion <=5.0.7`
- `react-router >=7.12.0 <8.3.0`
- `postcss <=8.5.17`

## Correcao aplicada

- Atualizado `postcss` para `8.5.23`.
- Atualizado `brace-expansion` transitive para `5.0.8` via `package-lock.json`.
- Migrado de `react-router-dom@7.18.1` para `react-router@8.3.0`.
- Atualizados os imports de `react-router-dom` para `react-router`.
- Alinhado runtime Node para `>=22.22.0` em `package.json` e `.nvmrc`, porque `react-router@8.3.0` exige essa versao minima.

## Validacao

Comandos executados em 2026-07-25:

- `npm audit`: 0 vulnerabilidades.
- `npm run typecheck`: passou.
- `npm test`: 5 arquivos e 38 testes passaram.
- `npm run build`: passou e gerou build de producao.

## Observacao operacional

O ambiente local usado na correcao estava em Node `v22.14.0`, abaixo do requisito declarado por `react-router@8.3.0`. Mesmo assim, typecheck, testes e build passaram. Para instalacao limpa e deploy, usar Node `22.22.0` ou superior.
