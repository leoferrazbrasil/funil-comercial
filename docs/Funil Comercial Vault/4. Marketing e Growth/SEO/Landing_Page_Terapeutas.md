---
title: Estrutura da Landing Page - Terapeutas
date: 2026-07-17
tags:
  - seo
  - landing-page
  - terapeutas
  - terapias-integrativas
  - copy
aliases:
  - LP Terapeutas
status: draft
---

# Estrutura de Landing Page: Terapeutas e Terapias Integrativas

Este documento detalha a arquitetura técnica de SEO e o wireframe de conteúdo (copywriting) focado em Terapeutas (Holísticos, Integrativos, Consteladores, Massoterapeutas, etc). O objetivo aqui é resolver a dor principal da categoria: a percepção de amadorismo por parte dos clientes, a dificuldade de tangibilizar o valor da terapia e atrair pacientes que valorizem o atendimento.

## 1. Arquitetura Técnica (SEO On-Page)

> [!info] Estratégia de URL e Intenção
> O terapeuta integrativo muitas vezes sofre com o estigma de ter uma presença digital "mística demais" ou "amadora". A intenção dessa página é trazer **profissionalismo** e **previsibilidade comercial**, sem perder o acolhimento.

- **URL Slug:** `https://funilcomercial.com/estrutura-de-vendas-para-terapeutas`
- **Meta Title:** Captação de Pacientes para Terapeutas | Mais Profissionalismo
- **Meta Description:** Você transforma vidas, mas o seu perfil parece amador e a agenda está vazia? Montamos a estrutura digital que transmite a verdadeira autoridade do seu método terapêutico.
- **Palavra-chave principal:** `captação de pacientes para terapeutas`, `estrutura de vendas para terapia`
- **Palavras-chave secundárias:** `marketing para terapeutas holísticos`, `como atrair clientes terapia`, `site para terapeuta integrativo`.

---

## 2. Wireframe de Conteúdo (Sessão por Sessão)

A estrutura adota o framework PAS, batendo na tecla do "Profissionalismo" e "Previsibilidade". Muitos terapeutas têm bloqueio com a palavra "vendas", então usaremos "Captação", "Atração" e "Acolhimento".

### Sessão 1: Hero (Acima da Dobra)
- **[Tag]** Especial para Terapeutas Integrativos e Holísticos
- **[H1]** Você transforma vidas. <span className="text-primary">A sua presença digital transmite isso?</span>
- **[Subtítulo]** O seu problema não é o seu método ou a sua energia. É a falta de um posicionamento profissional e de um processo de atração. Nós transformamos o seu dom em um consultório com fluxo previsível de pacientes.
- **[CTA Primário]** Quero profissionalizar minha captação
- **[Imagem/Mockup]** Um celular mostrando um site limpo, minimalista e acolhedor (elementos da natureza/energia sutis, mas profissionais), ao lado de um WhatsApp estruturado para atendimento.

### Sessão 2: Agitação das Dores (O Diagnóstico)
- **[H2]** Por que a sua agenda vive de altos e baixos?
- **[Bloco 1] O "Linktree" Amador:** Os pacientes chegam até você e caem em uma página de links confusa. Sem uma Landing Page própria, o paciente não entende a profundidade e a seriedade do seu trabalho.
- **[Bloco 2] O Paciente que "Soma" no WhatsApp:** Ele pergunta "como funciona" ou "qual o valor", você gasta energia explicando todo o método, e ele desaparece com um "vou pensar". Falta qualificação antes da conversa.
- **[Bloco 3] A Exaustão de Produzir Conteúdo:** Você se desgasta fazendo posts de conscientização no Instagram para pessoas que ainda não estão prontas para a terapia, enquanto ignora quem já está buscando ajuda no Google.

### Sessão 3: A Solução (O que nós entregamos)
- **[H2]** Nós montamos a sua Estrutura Profissional de Captação
- **[H3] 1. Busca Ativa no Google (Conexão Direta)**
  - *Texto:* Posicionamos o seu nome para pessoas que estão buscando ativamente por alívio emocional, autoconhecimento ou pelo seu método terapêutico específico na sua região ou online.
- **[H3] 2. Landing Page de Autoridade e Acolhimento**
  - *Texto:* Substituímos o amadorismo por um site que acolhe e educa. O paciente já entende o valor do seu trabalho, como funciona o processo e a sua formação antes de te mandar a primeira mensagem.
- **[H3] 3. O Primeiro Atendimento Estruturado (CRM)**
  - *Texto:* O acolhimento no WhatsApp define se o paciente agenda ou foge. Implementamos um fluxo organizado para você responder com clareza, gerenciar retornos e organizar sua fila de espera de forma leve.

### Sessão 4: Prova e Autoridade
- **[H2]** Terapia é conexão. Mas o consultório é um negócio.
- **[Conteúdo]** Ter um negócio próspero não anula o seu propósito espiritual ou curativo. Uma estrutura bem feita tira de você a ansiedade financeira para que você foque 100% na evolução do seu paciente.

### Sessão 5: Call to Action Final (Baixa Fricção)
- **[H2]** Pronta para valorizar o seu espaço terapêutico?
- **[Texto]** Me chame no WhatsApp. Vou entender qual é a sua terapia e te mostrar como estruturar a sua captação sem perder a essência e o acolhimento do seu método.
- **[CTA Final]** Falar com Especialista no WhatsApp

---

## 3. Próximos Passos
- Criar a rota no `App.tsx` para `/estrutura-de-vendas-para-terapeutas`.
- Desenvolver o componente `LpTerapeutas.tsx` com ícones relevantes (como `Sparkles`, `Leaf`, `HeartHandshake`) usando um design focado em acolhimento e energia (tons leves integrados no dark mode).
