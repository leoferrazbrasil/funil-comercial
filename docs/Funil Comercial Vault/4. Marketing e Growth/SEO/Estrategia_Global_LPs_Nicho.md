---
title: Estratégia de SEO e Copy - Landing Pages de Nicho
date: 2026-07-17
tags:
  - seo
  - growth
  - landing-pages
  - copy
  - documentacao
aliases:
  - Base de Conhecimento LP Nichos
---

# Estratégia de SEO e Copy: Landing Pages de Nicho

Este documento serve como a base de conhecimento oficial sobre a estratégia de expansão horizontal focada em busca orgânica (Google) para nichos específicos de prestação de serviço/B2B.

## 1. O Framework Estratégico

O modelo de "Landing Pages de Nicho" foi desenvolvido para fugir do "Oceano Vermelho" de palavras-chave genéricas como *agência de marketing* ou *fazer site*. 

Em vez disso, focamos em **"Estrutura de Vendas"** e **"Captação"** atacando a dor exata da profissão.

### Pilares da Copy:
- **Diagnóstico Específico:** O H1 e a agitação da dor nunca são genéricos. Eles refletem a rotina do profissional (ex: o CRP para psicólogas, a cadeira vazia para dentistas).
- **Semântica Anti-Atrito:** Para nichos da área da saúde ou esoterismo, evitamos o gatilho de "Vendas Agressivas". Em psicólogas e terapeutas, o termo *Vendas* foi trocado por *Captação*, *Atração* e *Acolhimento*.
- **Posicionamento de Autoridade:** A solução (Google + LP + CRM) é sempre apresentada como a cura para o "amadorismo digital" e a "guerra de preços do WhatsApp".

---

## 2. Inventário de Páginas Implementadas

Abaixo o registro de cada página criada, sua URL e o foco narrativo para facilitar consultas futuras, expansão ou campanhas de tráfego pago (Google Ads).

### Nutricionistas
- **URL SEO:** `/estrutura-de-vendas-para-nutricionistas`
- **Foco da Copy:** Pare de depender de indicações. Foco no "amadorismo" de não ter um sistema de atração e perder os leads num WhatsApp desorganizado.

### Psicólogas
- **URL SEO:** `/estrutura-de-vendas-para-psicologas`
- **Foco da Copy:** O Conselho de Ética (CRP). Como ter uma captação previsível sem infringir regras éticas ou fazer "dancinhas no Instagram". Foco na palavra *Acolhimento*.

### Dentistas
- **URL SEO:** `/estrutura-de-vendas-para-dentistas`
- **Foco da Copy:** A "guerra de preços" do WhatsApp. Como usar a estrutura comercial para fechar **tratamentos de alto ticket** (HOF, Implantes, Lentes) e parar de lotar a clínica apenas com limpezas baratas.

### Terapeutas (Holísticos, Integrativos, Consteladores)
- **URL SEO:** `/estrutura-de-vendas-para-terapeutas`
- **Foco da Copy:** Fugir da imagem de amadorismo ("Linktree confuso"). Como transmitir o valor intangível (energia/autoconhecimento) e parar de dar consultoria gratuita por mensagem de voz para quem não quer pagar.

### Massoterapeutas (e Clínicas de Massagem)
- **URL SEO:** `/estrutura-de-vendas-para-massoterapeutas`
- **Foco da Copy:** A dor do "paciente de uma sessão só". A página promete estruturar um CRM de follow-up que converte clientes avulsos em **pacotes de tratamento**, acabando com o espaço ocioso da maca.

---

## 3. Arquitetura Técnica e Indexação (React + SEO)

Para garantir que o Googlebot (e outros indexadores) leiam as páginas perfeitamente, o seguinte padrão técnico foi adotado:

1. **Roteamento Público (`PUBLIC_PATHS`):**
   - As páginas foram codificadas em `src/App.tsx` como exceções de autenticação. Isso impede que o sistema de rotas redirecione os robôs de busca para a tela de `/login`.
2. **`SeoHead` Component:**
   - Foi utilizado nosso componente centralizador de `react-helmet-async` em cada página.
   - **Crucial:** O atributo usado para canonicalização é `canonicalUrl` (exemplo: `canonicalUrl="https://funilcomercial.com/estrutura-de-vendas-para-dentistas"`), o que evita bugs de compilação do TypeScript.
3. **Sitemap Automático:**
   - As novas rotas estão configuradas para serem captadas pelo script `scripts/generate-sitemap.mjs` que é engatilhado no processo de build, subindo tudo para o arquivo `public/sitemap.xml`.

## 4. Próximos Passos (Evolução)
- Criar backlinks internos (Interlinking) em postagens de Blog direcionando para essas páginas focais (Topic Clusters).
- Monitorar a taxa de conversão do botão principal (Link direto para o WhatsApp).
- Continuar expansão para nichos complementares (ex: Advogados, Arquitetos, Contabilidade, Estética).
