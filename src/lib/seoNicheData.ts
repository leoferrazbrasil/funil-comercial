export interface FAQItem {
  question: string;
  answer: string;
}

export interface NicheData {
  title: string;
  heroSubtitle: string;
  painPointTitle: string;
  painPointDescription: string;
  benefits: string[];
  faqs?: FAQItem[];
}

export const seoNicheData: Record<string, NicheData> = {
  psicologas: {
    title: "Site para Psicólogas",
    heroSubtitle: "Atraia pacientes particulares que buscam terapia na sua cidade. Um ambiente virtual acolhedor que facilita o primeiro contato e o agendamento.",
    painPointTitle: "Por que uma presença digital humanizada é vital na psicologia?",
    painPointDescription: "Buscar terapia é um momento de vulnerabilidade. Quando alguém procura por um profissional na sua cidade, o primeiro contato com seu site precisa transmitir empatia e profissionalismo. Estruturamos sua página para acolher e converter sem parecer agressivo.",
    benefits: [
      "Comunicação empática e layout acolhedor",
      "Facilidade de agendamento online via WhatsApp",
      "Posicionamento focado em pacientes particulares"
    ],
    faqs: [
      { question: "O site ajuda a captar pacientes particulares?", answer: "Sim. Focamos a linguagem e o design no valor da transformação terapêutica, atraindo pacientes dispostos a investir em saúde mental fora dos planos de saúde." },
      { question: "Posso oferecer terapia online pelo site?", answer: "Com certeza. Podemos destacar tanto o seu atendimento presencial na cidade quanto a flexibilidade dos seus atendimentos online, ampliando sua agenda." },
      { question: "O site passa segurança e sigilo?", answer: "Utilizamos as melhores práticas de design para transmitir acolhimento, ética e total confidencialidade logo nos primeiros segundos de navegação." }
    ]
  },
  nutricionistas: {
    title: "Site para Nutricionistas",
    heroSubtitle: "Conquiste pacientes engajados com a própria saúde. Seu site profissional é o primeiro passo para encher sua agenda na sua região.",
    painPointTitle: "Como se destacar no mercado de nutrição da sua cidade?",
    painPointDescription: "As pessoas procuram por emagrecimento, hipertrofia e qualidade de vida o tempo todo. Se o seu site não explica claramente a sua abordagem e os seus resultados, o paciente escolhe outro profissional da sua cidade. Nós resolvemos isso.",
    benefits: [
      "Destaque para sua especialidade (esportiva, clínica, etc)",
      "Espaço para depoimentos e resultados (provas sociais)",
      "Botão de agendamento direto e sem fricção"
    ],
    faqs: [
      { question: "Como destacar minha abordagem nutricional no site?", answer: "O site terá seções específicas explicando o seu método (ex: sem terrorismo nutricional, foco em hipertrofia), conectando-se exatamente com o público que você deseja." },
      { question: "O site ajuda a vender pacotes e não apenas consultas avulsas?", answer: "Sim. Estruturamos a página para demonstrar o valor do acompanhamento de longo prazo, facilitando a venda de pacotes e planos trimestrais/semestrais." },
      { question: "Como atrair clientes da minha região específica?", answer: "Aplicamos técnicas avançadas de SEO local nas meta tags e no conteúdo, fazendo seu site ranquear quando pesquisarem por 'nutricionista em [Sua Cidade]'." }
    ]
  },
  contadores: {
    title: "Site para Escritórios de Contabilidade",
    heroSubtitle: "Atraia empresas e empresários locais que precisam de gestão contábil de confiança. Mais contratos mensais com menos esforço de vendas.",
    painPointTitle: "Como atrair empresas sólidas para a sua contabilidade?",
    painPointDescription: "Empresários locais procuram por soluções para impostos e gestão financeira no Google. Se o seu site de contabilidade for apenas institucional, ele não vende. Nossa estrutura foca em passar solidez e facilitar o pedido de proposta.",
    benefits: [
      "Visual corporativo que transmite segurança financeira",
      "Destaque para troca de contabilidade e abertura de empresas",
      "Captação direta de leads empresariais (B2B) da cidade"
    ],
    faqs: [
      { question: "O site capta clientes B2B (empresas)?", answer: "Sim, toda a arquitetura de conversão é pensada no modelo B2B, atacando as dores do empresário como: alta carga tributária, lentidão da contabilidade atual e burocracia." },
      { question: "Podemos destacar a migração de contabilidade?", answer: "Com certeza. Teremos seções evidenciando como é fácil, seguro e sem dor de cabeça transferir a empresa para o seu escritório." },
      { question: "O site vai gerar contatos qualificados?", answer: "Utilizando CTAs diretos e copywriting persuasivo, garantimos que o empresário sinta confiança para solicitar uma proposta formal imediatamente." }
    ]
  },
  fisioterapeutas: {
    title: "Site para Fisioterapeutas",
    heroSubtitle: "Reabilitação e prevenção com agenda cheia. Atraia pacientes da sua região que buscam alívio para dores e tratamentos especializados.",
    painPointTitle: "Como ser a principal referência em fisioterapia local?",
    painPointDescription: "Quando o paciente está com dor na sua cidade, ele quer uma solução rápida e confiável. Seu site precisa mostrar autoridade no tratamento e facilitar absurdamente o primeiro contato. Nós desenhamos a estrutura para o paciente confiar em você.",
    benefits: [
      "Exposição clara das especialidades (traumato, pélvica, etc)",
      "Linguagem focada em resolução de dores e bem-estar",
      "Redução da barreira de contato via agendamento simplificado"
    ],
    faqs: [
      { question: "O site comunica bem a minha especialização?", answer: "Sim. Se você é focado em esportiva, traumato ou RPG, nós calibramos o texto (copywriting) e as imagens para atrair exatamente esse perfil de paciente." },
      { question: "Ajuda a vender pacotes preventivos e Pilates?", answer: "Certamente. Mostramos o valor da fisioterapia não apenas na dor aguda, mas na prevenção e performance, facilitando a conversão para planos mensais." },
      { question: "A pessoa com dor consegue agendar rápido pelo celular?", answer: "O design mobile-first garante que o botão de agendamento esteja sempre visível e no alcance do polegar do paciente, sem cliques desnecessários." }
    ]
  },
  engenheiros: {
    title: "Site para Engenheiros e Profissionais Autônomos",
    heroSubtitle: "Feche contratos de projetos e consultoria. Exiba autoridade e precisão que seu cliente espera na sua região.",
    painPointTitle: "A solidez do seu site reflete a qualidade dos seus serviços?",
    painPointDescription: "Contratar serviços técnicos exige extrema confiança. Clientes da sua cidade precisam visualizar seu histórico e ter facilidade para solicitar propostas. Construímos páginas com a estrutura perfeita para gerar credibilidade instantânea.",
    benefits: [
      "Estrutura otimizada para captar orçamentos detalhados",
      "Destaque para o portfólio de laudos, ARTs e projetos",
      "Design corporativo focado em prestação de serviço de alto valor"
    ],
    faqs: [
      { question: "Consigo exibir fotos de projetos ou estudos de caso?", answer: "Sim, o site conta com áreas dedicadas ao portfólio visual, o que é fundamental para gerar confiança." },
      { question: "Atrai clientes residenciais e empresariais?", answer: "O site é moldado de acordo com seu foco. Podemos ter seções para B2B e outras para consumidores finais." },
      { question: "O cliente pode solicitar propostas formais?", answer: "Integramos formulários onde o cliente já envia os dados iniciais do escopo, poupando o tempo do seu atendimento." }
    ]
  },
  'personal-trainers': {
    title: "Site para Personal Trainers",
    heroSubtitle: "Venda consultorias presenciais e online. Destaque-se no mercado fitness da sua cidade atraindo alunos que querem resultados de verdade.",
    painPointTitle: "Sua autoridade fitness vai além das redes sociais",
    painPointDescription: "Alunos dispostos a pagar o preço justo pelo seu acompanhamento na cidade fazem pesquisas além das redes sociais. Um site próprio mostra que você não é apenas um entusiasta, mas um profissional certificado que entrega transformação real.",
    benefits: [
      "Apresentação forte de metodologias e provas sociais (antes/depois)",
      "Captação de alunos para presencial na cidade ou online",
      "Destaque claro para os planos e valores de acompanhamento"
    ],
    faqs: [
      { question: "O site vende consultoria online?", answer: "Sim. Além de focar na sua região para treinos presenciais, estruturamos uma área completa para captação de clientes de consultoria online de qualquer lugar do mundo." },
      { question: "Posso colocar as fotos dos meus alunos (antes/depois)?", answer: "Provas sociais são o coração de um site fitness. Teremos blocos poderosos dedicados a mostrar as transformações que o seu método gera." },
      { question: "O botão de WhatsApp envia mensagem padronizada?", answer: "Sim. O aluno clica e já cai no seu celular com uma mensagem prévia tipo 'Olá, quero saber mais sobre a consultoria', acelerando o fechamento." }
    ]
  },
  terapeutas: {
    title: "Site para Terapeutas",
    heroSubtitle: "Acolhimento desde o primeiro clique. Atraia clientes para terapias holísticas, integrativas ou convencionais na sua região.",
    painPointTitle: "Seu espaço terapêutico precisa de uma recepção digital",
    painPointDescription: "Muitos que buscam terapias holísticas ou complementares ainda têm dúvidas sobre como funciona. O seu site será a ponte que educa, acolhe e gera o desejo de agendar a primeira sessão com segurança.",
    benefits: [
      "Ambiente visual leve e relaxante",
      "Explicação clara sobre a abordagem terapêutica",
      "Agendamento via WhatsApp sem burocracia"
    ],
    faqs: [
      { question: "Posso oferecer diferentes tipos de terapia no site?", answer: "Sim. Se você aplica Reiki, ThetaHealing, Terapia Floral ou outras modalidades, criamos seções explicando os benefícios de cada uma." },
      { question: "Funciona bem para quem atende online?", answer: "Perfeitamente. O site posiciona tanto o seu atendimento local quanto a facilidade da terapia à distância." },
      { question: "Ajuda a construir autoridade?", answer: "Ter um site com domínio próprio e textos que explicam suas formações transmite muito mais seriedade do que atuar apenas pelo Instagram." }
    ]
  },
  massoterapeutas: {
    title: "Site para Massoterapeutas",
    heroSubtitle: "Agenda lotada para relaxamento e bem-estar. Atraia clientes da sua cidade que buscam alívio de tensão e autocuidado.",
    painPointTitle: "Como transformar a busca por relaxamento em agendamentos?",
    painPointDescription: "Quando alguém procura por massagem relaxante ou terapêutica no Google, a decisão é tomada rápido. Se o seu site não transmitir calma, higiene e profissionalismo, o cliente marca com outro. Garantimos que sua primeira impressão digital seja impecável.",
    benefits: [
      "Destaque visual para o ambiente de atendimento e técnicas",
      "Pacotes e mensalidades claros para fidelizar clientes",
      "Botão flutuante para marcação rápida de horários"
    ],
    faqs: [
      { question: "O site ajuda a vender pacotes recorrentes?", answer: "Sim! Podemos criar uma área explicando as vantagens de pacotes semanais ou mensais para o alívio contínuo do estresse." },
      { question: "Consigo explicar a diferença das minhas massagens?", answer: "Com certeza. Explicamos detalhadamente as diferenças entre massagem relaxante, desportiva, drenagem, etc., para o cliente saber o que comprar." },
      { question: "Posso captar vouchers para presentes?", answer: "Podemos incluir CTAs focados em 'Dê Bem-Estar de Presente', incentivando a compra de vouchers terapêuticos." }
    ]
  }
};

export const getDefaultNicheData = (nicho: string, cidade: string): NicheData => {
  return {
    title: `Site Profissional para ${nicho.charAt(0).toUpperCase() + nicho.slice(1)}`,
    heroSubtitle: `Clientes em ${cidade} pesquisam no Google por seus serviços todos os dias. Tenha uma página que passa confiança e transforma visitas em conversas no WhatsApp.`,
    painPointTitle: `Por que ter um site otimizado para sua cidade?`,
    painPointDescription: `Concorrentes em ${cidade} já estão aparecendo no topo. Um site estruturado garante que quem procure por ${nicho} na região encontre seu negócio preparado para atender.`,
    benefits: [
      "Integração total com WhatsApp e redes sociais",
      "Página super rápida para não perder clientes no celular",
      "Estrutura focada em gerar agendamentos todos os dias"
    ],
    faqs: [
      { question: "Como funciona a criação do site?", answer: `Montamos o projeto focado especificamente na área de ${nicho}, visando a máxima conversão de leads em ${cidade}.` },
      { question: "Vou aparecer no Google?", answer: `Nossa estrutura já contempla todas as boas práticas de SEO local, desenhadas para você dominar as buscas orgânicas em ${cidade}.` },
      { question: "O suporte é contínuo?", answer: "Sim. Trabalhamos com uma infraestrutura robusta garantindo que o seu funil de captação fique online 24h por dia, sem travamentos." }
    ]
  };
};
