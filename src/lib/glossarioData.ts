export interface GlossarioTerm {
  slug: string;
  title: string;
  description: string;
  content: string;
  relatedTermSlugs?: string[];
}

export const glossarioTerms: GlossarioTerm[] = [
  {
    slug: "funil-de-vendas",
    title: "O que é Funil de Vendas?",
    description: "Descubra o que é um Funil de Vendas e como mapear a jornada do seu cliente desde o primeiro contato até o fechamento.",
    content: `
O **Funil de Vendas** é a representação visual da jornada que um cliente percorre desde o momento em que descobre a sua empresa até o momento da compra (e pós-compra). Ele é chamado de "funil" porque, naturalmente, muitas pessoas entram no topo (descobrem sua marca), mas apenas uma parte chega ao fundo (compra de fato).

### As Etapas do Funil
Geralmente, ele é dividido em três fases:
1. **Topo de Funil (Consciência):** A pessoa tem um problema, mas talvez nem saiba como resolvê-lo. Ela pesquisa no Google por sintomas ou dúvidas. É aqui que o seu Marketing atua, atraindo tráfego.
2. **Meio de Funil (Consideração):** O potencial cliente já sabe o que precisa e está considerando as opções no mercado. Ele visita o seu site, manda um WhatsApp ou preenche um formulário. Nesse momento, ele vira um **Lead**.
3. **Fundo de Funil (Decisão):** O lead está pronto para comprar. Ele está avaliando orçamentos, propostas e o atendimento. É aqui que o seu **CRM** e a habilidade de negociação fazem toda a diferença para o fechamento.

### Por que negócios locais precisam de um Funil de Vendas?
Sem um funil estruturado, a clínica médica ou escritório de advocacia não sabe onde os clientes estão "escapando". Se muita gente chama no WhatsApp (Top/Meio) e poucos agendam consulta (Fundo), o problema não é o Marketing (falta de leads), e sim o processo comercial (falta de fechamento ou lead desqualificado). Mapear o funil permite otimizar o investimento e aumentar a conversão.
    `,
    relatedTermSlugs: ["lead", "cac", "crm"]
  },
  {
    slug: "cac",
    title: "O que é CAC (Custo de Aquisição de Cliente)?",
    description: "Entenda o conceito de Custo de Aquisição de Cliente e como calcular esse indicador fundamental para a saúde financeira da sua empresa.",
    content: `
O **CAC (Custo de Aquisição de Cliente)** é uma das métricas mais vitais para qualquer empresa. Ele representa, em valores monetários, quanto o seu negócio gasta em média para transformar um desconhecido em um cliente pagante.

Se você gasta muito para trazer um cliente que gasta pouco, sua empresa está fadada ao prejuízo.

### Como calcular o CAC?
A fórmula é simples: 
Você soma todos os seus investimentos diretos em aquisição de clientes (marketing e vendas) em um determinado período e divide pelo número de novos clientes conquistados nesse mesmo período.

**Fórmula:**
*(Investimentos em Marketing + Investimentos em Vendas) / Novos Clientes = CAC*

**Exemplo prático:**
Se uma clínica odontológica investe R$ 3.000 em Google Ads e R$ 2.000 no salário da equipe comercial no mês, o custo total foi de R$ 5.000. Se no mesmo mês eles fecharam contrato com 10 novos pacientes, o CAC dessa clínica é de R$ 500. Ou seja, ela paga R$ 500 para adquirir cada paciente.

### O que é um CAC bom?
Um CAC só é "bom" ou "ruim" quando comparado ao **LTV (Lifetime Value)**, que é o valor total que o cliente deixa na empresa ao longo do tempo. Se o seu CAC for R$ 500, mas o cliente compra um tratamento de R$ 10.000, o seu CAC está excelente. Se ele compra apenas uma limpeza de R$ 150 e nunca mais volta, a clínica está operando no vermelho.

### Como a Funil Comercial reduz o seu CAC?
A principal forma de reduzir o custo de aquisição é **aumentar a taxa de conversão** da sua equipe de atendimento e focar seus anúncios apenas em pessoas com alta intenção de compra. Nós estruturamos CRM, Landing Pages velozes e roteiros consultivos para que você feche mais clientes gastando o mesmo valor em anúncios.
    `,
    relatedTermSlugs: ["ltv", "lead", "funil-de-vendas"]
  },
  {
    slug: "ltv",
    title: "O que é LTV (Lifetime Value)?",
    description: "Saiba o que é Lifetime Value (Valor do Tempo de Vida do Cliente) e por que reter clientes é mais barato do que buscar novos.",
    content: `
O **LTV (Lifetime Value)**, ou "Valor do Tempo de Vida do Cliente", é a estimativa do lucro líquido que um cliente vai gerar para a sua empresa durante todo o tempo em que continuar comprando de você.

### Como o LTV afeta o seu negócio?
Imagine um escritório de contabilidade. Se ele cobra uma mensalidade de R$ 1.000 e, em média, o cliente permanece no escritório por 36 meses, o LTV desse cliente é de R$ 36.000.

Saber esse número é libertador: ele permite que o empresário entenda o quão agressivo ele pode ser no marketing. Se você sabe que um cliente vale R$ 36.000 a longo prazo, não há problema em investir R$ 2.000 de CAC (Custo de Aquisição de Cliente) para conquistá-lo.

### O grande erro dos negócios locais
A maioria das clínicas, academias, corretoras e escritórios se foca excessivamente em adquirir clientes novos o tempo todo, mas não possui um sistema de retenção (Pós-Venda ou Sucesso do Cliente) estruturado. O segredo para um alto LTV é a recorrência e o up-sell (vender produtos mais caros para o mesmo cliente).

### LTV e CRM andam juntos
É quase impossível aumentar o LTV se você não tem um histórico das interações com os clientes. Na Funil Comercial, implementamos estruturas de CRM (Gestão de Relacionamento) que avisam a sua equipe comercial qual é o momento exato de oferecer um novo serviço para um cliente antigo, maximizando o seu LTV.
    `,
    relatedTermSlugs: ["cac", "crm"]
  },
  {
    slug: "lead",
    title: "O que é Lead no Marketing Digital?",
    description: "Definição de Lead, Lead Qualificado (MQL/SQL) e como transformar contatos frios em compradores para a sua empresa.",
    content: `
Um **Lead** é, fundamentalmente, uma pessoa (ou empresa) que demonstrou interesse no seu produto ou serviço e deixou alguma forma de contato em troca de uma oferta. No Brasil, o principal canal de chegada de leads para serviços locais é o WhatsApp ou formulários de site.

### O ciclo de vida do Lead

É importante entender que nem todo lead está pronto para comprar agora:
1. **Curioso (Lead Frio):** Deixou o contato apenas para saber o preço ou baixar um material gratuito. Exige muita qualificação.
2. **MQL (Marketing Qualified Lead):** O lead que já interage com a sua marca, sabe que tem um problema, mas ainda está avaliando as opções do mercado.
3. **SQL (Sales Qualified Lead):** O "Lead Quente". Ele já foi filtrado, atende aos requisitos (como orçamento mínimo ou estar na área de atendimento) e tem intenção de compra imediata.

### Quantidade x Qualidade
Muitas agências de marketing adoram apresentar relatórios com *"Geramos 500 leads nesse mês!"*. Porém, se os 500 contatos foram atraídos por uma promoção falsa e nenhum comprou, você perdeu tempo e dinheiro. 

O foco do **Funil Comercial** não é entupir o seu WhatsApp de curiosos. É gerar leads altamente qualificados através de campanhas no Google Ads baseadas em intenção de busca. Se a sua empresa só precisa de 10 bons clientes por mês, nós não precisamos gerar 1.000 leads; precisamos gerar 50 leads certos.
    `,
    relatedTermSlugs: ["funil-de-vendas", "cac"]
  },
  {
    slug: "funil-de-vendas",
    title: "O que é Funil de Vendas?",
    description: "Compreenda como o Funil de Vendas estrutura a jornada de compra do seu cliente, desde o primeiro contato até o fechamento do contrato.",
    content: `
O **Funil de Vendas** é uma representação visual e estratégica de todas as etapas pelas quais uma pessoa passa, desde o momento em que descobre a existência da sua empresa até o momento em que assina o contrato e se torna um cliente pagante.

A analogia do funil existe porque o processo é afunilado por natureza: você atrai 1.000 visitantes para o site (Topo), 100 viram leads no WhatsApp (Meio), e 10 compram (Fundo).

### As Camadas Clássicas do Funil

1. **Topo de Funil (ToFu - Aprendizado e Descoberta):** O público alvo tem um problema, mas muitas vezes ainda não sabe como resolver. O objetivo aqui é gerar tráfego orgânico ou pago, chamando a atenção.
2. **Meio de Funil (MoFu - Reconhecimento e Consideração):** O visitante já se tornou um lead. Ele está avaliando a sua proposta contra a dos concorrentes. É a hora do seu time comercial atuar com atendimento ágil, scripts e provas sociais.
3. **Fundo de Funil (BoFu - Decisão e Compra):** O lead está pronto para comprar. A etapa envolve tirar dúvidas contratuais, alinhar garantias, negociar valores e fechar.

### A Estrutura de Vendas Local
Muitas empresas falham porque tentam vender seus produtos caros para pessoas que ainda estão no Topo do Funil. No método da Funil Comercial, construímos uma estrutura que ataca diretamente o Fundo do Funil através do Google, e organiza o Meio do Funil através de sistemas de CRM (Gestão de Relacionamento) para que nenhum contato seja perdido no vácuo do WhatsApp.
    `,
    relatedTermSlugs: ["lead", "cac"]
  },
  {
    slug: "seo-local",
    title: "O que é SEO Local?",
    description: "Descubra o que é SEO Local e por que estar no topo do Google Maps é a estratégia orgânica mais poderosa para médicos, dentistas e negócios físicos.",
    content: `
**SEO Local (Search Engine Optimization focado em Localidade)** é a prática de otimizar a presença digital da sua empresa para que ela apareça nos primeiros resultados de pesquisa do Google quando clientes da sua própria cidade ou bairro buscarem por serviços específicos.

### A Força do Termo "Perto de Mim"
Nos últimos 5 anos, as buscas no Google com a adição do termo "perto de mim" ou o nome do bairro explodiram. Quando uma pessoa pesquisa *"Clínica de Estética no Tatuapé"*, a intenção de visita ao estabelecimento físico é gigantesca.

### Pilares do SEO Local
1. **Google Meu Negócio (Perfil da Empresa):** A ficha gratuita do Google é a espinha dorsal. Preencher todas as informações, horários, ter avaliações genuínas de clientes (5 estrelas) e fotos do local garantem o seu espaço no chamado *Local Pack* (os 3 primeiros resultados do mapa).
2. **Páginas Otimizadas no Site:** Se o seu negócio atende diferentes cidades, ter uma Landing Page específica para cada uma aumenta exponencialmente suas chances de ranqueamento.
3. **Citações (NAP - Name, Address, Phone):** O Google ganha confiança na sua empresa quando encontra o seu nome, endereço e telefone idênticos em diversos diretórios (Yelp, Guia Mais, JusBrasil).

A **Funil Comercial** possui uma tecnologia proprietária de SEO Programático capaz de criar milhares de páginas indexáveis focadas em dezenas de cidades, transformando o site da sua empresa em uma verdadeira âncora de captação orgânica a custo zero.
    `,
    relatedTermSlugs: ["cac"]
  }
];
