# Design: Busca na Pagina de Contatos

## Objetivo

Adicionar um campo de pesquisa visivel na pagina `/contatos` para facilitar a busca de contatos sem depender apenas da busca global do topo.

## Decisao Aprovada

Criar um campo de busca dentro da propria pagina de contatos, no topo da area de conteudo, antes da lista/tabela.

O campo deve:

- Usar icone de lupa.
- Ter placeholder: `Buscar por nome, telefone, e-mail, origem ou potencial...`
- Reaproveitar a busca existente por `nome`, `telefone`, `email`, `origem` e `potencial`.
- Sincronizar com a busca global ja existente no shell.
- Mostrar um botao `X` para limpar quando houver texto.
- Atualizar a contagem para indicar resultado filtrado, por exemplo: `8 de 23 contatos`.

## Experiencia

Na pagina de contatos, o usuario deve ver a busca no mesmo contexto da lista, junto das acoes de contato.

Comportamento esperado:

- Ao digitar, a lista filtra imediatamente.
- Ao limpar, todos os contatos voltam a aparecer.
- Se nao houver resultado, o estado vazio deve informar que nenhum contato foi encontrado para a busca atual.
- Em telas pequenas, o campo deve ocupar a largura disponivel e permanecer antes da lista.

## Arquitetura

`ContactsPage` ja recebe `query` e filtra contatos com `matchesQuery`. A mudanca deve preservar essa logica e adicionar uma prop `onQueryChange`.

`App.tsx` deve passar `setQuery` para `ContactsPage`, mantendo a busca da pagina e a busca global sincronizadas.

O filtro continua local no frontend sobre `snapshot.contacts`; nao ha mudanca em API, banco ou Supabase.

## Testes

Como a pagina ainda nao possui testes de componentes, a verificacao deve cobrir:

- `npm run typecheck`
- `npm test`
- `npm run build`

Tambem deve haver revisao manual do diff para confirmar que:

- a busca usa os mesmos campos ja filtrados;
- o botao limpar chama `onQueryChange("")`;
- a contagem diferencia total e filtrado quando houver busca ativa.

## Fora de Escopo

- Busca remota no banco.
- Debounce ou paginacao.
- Filtros avancados por origem/potencial.
- Persistir a busca na URL.
- Alterar a busca global em outras paginas.
