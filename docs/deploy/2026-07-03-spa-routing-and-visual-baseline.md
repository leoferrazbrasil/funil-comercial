# Correcao de rotas SPA e contraste visual

Data: 2026-07-03

## Estado inicial

- Aplicacao Vite + React Router publicada na raiz de `https://leonardobrasil.com.br/`.
- Rotas internas, quando acessadas diretamente ou atualizadas pelo navegador, exibiam a pagina 404 da hospedagem.
- Login e dashboard tinham contraste insuficiente em textos, cards e cabecalho, misturando superficies escuras com texto azul escuro.

## Diagnostico

- A aplicacao usa roteamento no cliente com `BrowserRouter`.
- A hospedagem precisa entregar `index.html` para rotas internas validas da SPA.
- Sem fallback no servidor, URLs como `/dashboard`, `/inbox`, `/contatos`, `/leads` e `/funil` eram tratadas como arquivos/pastas inexistentes.
- A mensagem `This Page Does Not Exist` vem da hospedagem, nao da aplicacao React.
- Alguns redirecionamentos internos usavam caminhos relativos, o que podia gerar navegacao inconsistente.
- Tokens visuais globais estavam reaproveitados entre temas claro/escuro sem contraste adequado.

## Alteracoes aplicadas

- `public/.htaccess`: adiciona fallback para `index.html`, preservando arquivos estaticos, diretorios existentes e futuras rotas `/api`.
- `src/App.tsx`: ajusta redirecionamentos de login/logout para caminhos absolutos.
- `src/styles.css`: corrige tokens de tema, contraste, superficies, topbar, cards, formularios e responsividade inicial.
- `README.md`: documenta deploy na raiz da hospedagem e a necessidade do fallback SPA.

## Validacao esperada

- Acessar `/` deve carregar a tela de login.
- Acessar diretamente `/dashboard`, `/inbox`, `/contatos`, `/leads` e `/funil` deve carregar a aplicacao React, sem 404 da hospedagem.
- Atualizar o navegador em rotas internas deve manter a aplicacao acessivel.
- Login e dashboard devem manter leitura consistente nos modos claro e escuro.

## Rollback

1. Remover `public/.htaccess`.
2. Reverter `src/App.tsx`, `src/styles.css` e `README.md` para o commit anterior.
3. Executar `npm run check`.
4. Publicar novamente o build anterior.

## Observacao de hospedagem

Se a Hostinger nao publicar arquivos iniciados com ponto, a regra equivalente de rewrite deve ser cadastrada no painel da hospedagem. O arquivo `.htaccess` precisa estar presente na raiz publica junto com `index.html`.
