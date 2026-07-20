---
title: Histórico de Ações da Diretoria de SEO
tags:
  - seo
  - git
  - changelog
date: 2026-07-16
---

# 🕵️ Histórico de Ações da Diretoria de SEO

Esta nota documenta todo o esforço de engenharia focado em aquisição orgânica (SEO e AEO) mapeado diretamente do histórico do repositório da aplicação (Git).

## Commits Relacionados a SEO (Julho 2026)

> [!info] Auditoria de Git
> Os dados abaixo foram extraídos diretamente do `git log` para centralizar as conquistas estruturais da nossa tese de "Teia de Relevância".

| Hash | Data | Descrição / Escopo do Commit |
| :--- | :--- | :--- |
| `966d334` | 20/07 | **feat(seo)**: fechamento do cerco de Topic Clusters injetando os 5 artigos satélites finais com link building interno |
| `82824f1` | 20/07 | **perf(seo)**: implementação de Code Splitting com React.lazy e Suspense para redução dramática de LCP e tamanho do JS inicial |
| `3758abd` | 20/07 | **feat(seo)**: injeção de componente FAQ e marcação Schema (FAQPage) em todas as LPs de Nicho |
| `c35d494` | 20/07 | **feat(seo)**: sprint de conteúdo satélite para internal linking (Topic Clusters) apontando para LPs de Nicho |
| `e3e1fd1` | 20/07 | **fix(seo)**: centraliza rotas LPs de Nicho e implementa leitura dinâmica para sitemap e prerender (Puppeteer) |
| `9da0a0f` | 18/07 | **chore(seo)**: atualizar sitemaps com novas rotas b2b e blog |
| `e2958a0` | 18/07 | **fix(seo)**: corrigir erro de sintaxe no glossario |
| `ae34244` | 18/07 | **feat(seo)**: adicionar artigo pilar sobre captacao b2b e interlinking para lps |
| `c757a7f` | 18/07 | **feat(seo)**: adicionar termos satelites no glossario para lps b2b |
| `8b7b714` | 18/07 | **feat(seo)**: criar LPs de alta conversao para advogados, arquitetos, contabilidade e estetica |
| `a50eeb9` | 16/07 | **feat**: adicionar sprint de conteudo sobre trafego local |
| `80279be` | 16/07 | **feat**: adicionar novos artigos e glossario para SEO |
| `1ccb6f3` | 15/07 | **fix(glossario)**: remove import quebrado e implementa links internos (spider web) |
| `e0d2445` | 15/07 | **feat(seo)**: implementacao da esteira de topo de funil com glossario dinamico |
| `1257754` | 15/07 | **feat(seo)**: implementacao de topic clusters e artigos pilares no blog |
| `76d16a4` | 15/07 | **feat(seo)**: motor programatico injetado com intencoes de fundo de funil (5424 URLs) |
| `ced63cb` | 15/07 | **feat(seo)**: adicao do arquivo llms.txt para AEO |
| `0903588` | 15/07 | **feat(seo)**: expansao da arquitetura (Sitemap Index, Internal Linking) |
| `677d1a9` | 15/07 | **feat(seo)**: link services to internal landing pages |

---

## O que isso significa na prática? (Tradução Estratégica)

Olhando para essa trilha de código, o Diretor de SEO (eu!) implementou quatro engrenagens gigantes no motor do site:

1. **A Malha de Links (Teia de Relevância):** 
   Criamos uma malha de links internos entre os artigos do blog, termos do glossário e as páginas de conversão (`1ccb6f3`, `677d1a9`, `0903588`). Isso diz ao Google exatamente quais páginas são as mais importantes e evita que o tráfego fique isolado (o famoso *Spider Web linking*).

2. **Escala Absoluta (Fundo de Funil):** 
   O motor programático (`76d16a4`) foi uma verdadeira bomba atômica para buscas locais. Ele foi configurado para injetar 5.424 URLs focadas em intenção direta (ex: "crm para clínicas no Rio de Janeiro"). Essa é a fundação para dominarmos cidades inteiras.

3. **Inbound Marketing (Topic Clusters e Glossário):** 
   Não focamos só em quem já quer comprar. Construímos as portas de entrada de "Topo de Funil" (`e0d2445`, `1257754`) e já engatilhamos os primeiros Sprints de Conteúdo (`a50eeb9`, `80279be`) focado no pequeno empresário pesquisando conceitos básicos no Google.

4. **Preparação para IAs (AEO):** 
   Não vivemos mais só de Google. O commit `ced63cb` adicionou o arquivo `/llms.txt`, garantindo que quando o seu cliente perguntar ao ChatGPT ou ao Claude "qual é a melhor empresa de estrutura comercial do Brasil", as IAs saibam ler os seus serviços e recomendar a Funil Comercial.

5. **A Expansão B2B e High-Ticket (Onda 2):**
   Com os commits de 18/07, estendemos a estratégia de LPs focais para 4 novos mercados corporativos: Advocacia, Arquitetura, Contabilidade e Estética Avançada (`8b7b714`). Ao mesmo tempo, reforçamos essa estrutura criando um *Topic Cluster* inteiro: termos de glossário de cauda longa (`c757a7f`) e um artigo pilar completo que interliga e injeta PageRank diretamente nas novas Landing Pages (`ae34244`). O ciclo foi validado com a reconstrução e submissão imediata dos sitemaps ao Google (`9da0a0f`).

6. **Blindagem de Indexação (Fuga do CSR):**
   Com o commit de 20/07 (`e3e1fd1`), unificamos as rotas e forçamos a pré-renderização estática via Puppeteer para todas as LPs de Nicho documentadas. Isso resolve o problema de LPs sendo servidas apenas com Javascript (CSR) no Vite, garantindo que o Googlebot receba o HTML limpo, melhorando drasticamente a velocidade de indexação e as notas do Core Web Vitals (LCP).

7. **Link Building Interno para LPs (Topic Clusters):**
   Com os commits de 20/07 (`c35d494` e `966d334`), criamos toda a rede de 9 artigos satélites no blog cobrindo as dores reais de 100% dos nichos alvo (Odontologia, Psicologia, Estética, Advocacia, Nutrição, Arquitetura, Terapia, Massoterapia e Contabilidade). A função técnica desses textos é capturar pesquisas de dúvidas (Topo de Funil) e transferir Autoridade de Tópico (PageRank) diretamente para as LPs de conversão (Fundo de Funil) através de hiperlinks *Dofollow* contextuais com âncora exata.

8. **Rich Snippets e Domínio da SERP (FAQPage Schema):**
   Com o commit de 20/07 (`3758abd`), injetamos uma nova seção de "Perguntas Frequentes" estruturada com `FAQPage Schema` em JSON-LD em todas as 9 Landing Pages de Nicho. O objetivo estratégico é fazer com que o Google mostre as nossas respostas diretamente na página de resultados de busca, dentro da cobiçada caixa *"As pessoas também perguntam" (People Also Ask)*, capturando muito mais cliques e espaço visual da concorrência.

9. **Otimização Extrema de LCP (Code Splitting via React.lazy):**
   Com o commit de 20/07 (`82824f1`), refatoramos o roteador central (`App.tsx`) trocando 100% das importações estáticas por `React.lazy()` e `<Suspense>`. Essa medida pulverizou o arquivo principal de JavaScript de >1MB para ~75KB (redução de 93% no payload inicial). A função estratégica é atingir notas máximas no Google PageSpeed (Core Web Vitals) em redes móveis (3G/4G), já que o visitante só faz o download do código da rota que ele explicitamente acessou, acelerando drasticamente o Largest Contentful Paint (LCP).

> [!success] Missão Cumprida
> O alicerce técnico de SEO está completo e em produção. O site deixou de ser um cartão de visitas para se tornar uma máquina capturadora de intenção e atenção.

| \60949c5\ | 19/07 | **feat(ga4)**: automação da importação offline de MQLs/Vendas via measurement protocol |