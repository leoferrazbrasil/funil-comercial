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
  dentistas: {
    title: "Site para Dentistas",
    heroSubtitle: "Pacientes na sua região pesquisam no Google por tratamentos odontológicos todos os dias. Tenha uma página que passa confiança e enche sua agenda via WhatsApp.",
    painPointTitle: "Por que ter um site otimizado para o seu consultório?",
    painPointDescription: "A concorrência na odontologia é alta. Quando alguém sente dor de dente ou busca por implantes na sua cidade, quem aparece primeiro no Google leva o paciente. Seu consultório precisa estar no topo e pronto para converter visitas em agendamentos reais.",
    benefits: [
      "Integração direta com o WhatsApp da recepção",
      "Layout focado em passar credibilidade e higiene",
      "Design otimizado para celulares (onde a maioria pesquisa)"
    ],
    faqs: [
      { question: "Como um site pode atrair mais pacientes para minha clínica?", answer: "Um site otimizado (SEO local) garante que quando pacientes pesquisarem por tratamentos específicos (ex: implantes, clareamento) no Google, sua clínica apareça nas primeiras posições com um botão direto para agendamento." },
      { question: "O site segue as normas éticas do CRO?", answer: "Sim. Toda a estrutura visual e de chamadas para ação é desenhada respeitando as normas éticas da odontologia, focando em informação de valor, prova social (quando permitido) e contato direto." },
      { question: "Demora muito para colocar o site odontológico no ar?", answer: "Nossa metodologia de Funil Comercial permite desenhar e colocar a sua estrutura de alta conversão no ar de forma rápida, já integrada ao seu WhatsApp." }
    ]
  },
  advogados: {
    title: "Site para Advogados",
    heroSubtitle: "Transforme consultas jurídicas em contratos. Um site elegante que transmite autoridade e atrai clientes que buscam soluções na sua cidade.",
    painPointTitle: "Por que seu escritório de advocacia precisa de um site focado em conversão?",
    painPointDescription: "Na advocacia, autoridade é tudo. Clientes pesquisam online quando estão com problemas legais urgentes na sua região. Um site genérico afasta o cliente; um site com estrutura de vendas passa segurança e traz os melhores casos para sua mesa.",
    benefits: [
      "Design sóbrio que transmite confiança e ética",
      "Chamadas para ação claras para consultas urgentes",
      "Estruturado para ranquear em buscas locais do Google"
    ],
    faqs: [
      { question: "O site é focado em qual área do direito?", answer: "O site é moldado para a sua especialidade (Trabalhista, Previdenciário, Família, etc). Destacamos as áreas onde você quer captar os melhores honorários." },
      { question: "As páginas seguem as diretrizes de publicidade da OAB?", answer: "Sim. Construímos a estrutura focada em marketing de conteúdo e captação passiva (Inbound), respeitando integralmente o Provimento da OAB sobre publicidade." },
      { question: "Como o Google ajuda advogados a captar clientes?", answer: "Quando o cliente precisa de um advogado, ele não procura no Instagram, ele pesquisa no Google (ex: 'advogado trabalhista urgente'). Seu site precisa estar lá no topo para receber esse contato." }
    ]
  },
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
  arquitetos: {
    title: "Site para Arquitetos",
    heroSubtitle: "Mostre seus projetos para o cliente certo. Transformamos seu portfólio em uma máquina de fechar contratos de arquitetura e interiores.",
    painPointTitle: "O seu portfólio atual está trazendo novos clientes?",
    painPointDescription: "Na arquitetura, o visual atrai, mas a estrutura vende. Quem procura por projetos na sua cidade quer ver o seu trabalho e entender o seu método de forma rápida. Criamos páginas elegantes que evidenciam o seu valor e aceleram orçamentos.",
    benefits: [
      "Layout clean que destaca as fotos dos seus projetos",
      "Foco em captar clientes de alto padrão na região",
      "Formulários otimizados para pré-qualificar orçamentos"
    ],
    faqs: [
      { question: "O design do site reflete a estética da minha arquitetura?", answer: "Totalmente. O site funcionará como uma extensão do seu escritório: elegante, moderno, com foco absoluto na valorização das fotografias dos seus projetos." },
      { question: "Como o site filtra orçamentos ruins?", answer: "Podemos incluir formulários de pré-qualificação onde o cliente já indica o tamanho do imóvel e a expectativa de investimento antes de chegar ao seu WhatsApp." },
      { question: "Funciona bem para celular?", answer: "Sim. A navegação no celular é fluida, permitindo que o cliente veja a galeria de obras com perfeição e toque em um botão para iniciar a conversa." }
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
  medicos: {
    title: "Site para Médicos",
    heroSubtitle: "Posicionamento digital ético e focado em pacientes particulares. Aumente o volume de agendamentos no seu consultório local.",
    painPointTitle: "A importância de uma presença digital forte na medicina local",
    painPointDescription: "A jornada do paciente moderno começa no Google. Quando alguém pesquisa por sua especialidade na cidade, encontrar um site robusto que detalha seus procedimentos e formação é o fator decisivo entre agendar com você ou com a clínica concorrente.",
    benefits: [
      "Design alinhado com as regras do CFM (ética médica)",
      "Foco em procedimentos de alto valor e pacientes particulares",
      "Conexão direta com a sua central de marcação"
    ],
    faqs: [
      { question: "Como promover procedimentos sem ferir as regras do CFM?", answer: "Focamos em conteúdo educacional de altíssima qualidade, explicando sintomas, tratamentos e equipamentos, o que gera autoridade ética e converte sem exageros promocionais." },
      { question: "O site ajuda a diminuir dependência de planos de saúde?", answer: "Sim. Ao focar em tratamentos avançados e construir uma imagem premium, o site atrai o paciente que valoriza a consulta particular e não apenas o convênio." },
      { question: "Facilita o trabalho da secretária?", answer: "Sim. O site pode tirar 80% das dúvidas comuns do paciente antes dele clicar no WhatsApp, fazendo o lead chegar muito mais quente para a recepção agendar." }
    ]
  },
  esteticistas: {
    title: "Site para Clínicas de Estética",
    heroSubtitle: "Lote a agenda da sua clínica. Atraia o público certo para botox, harmonização e tratamentos corporais avançados na sua região.",
    painPointTitle: "Por que o Instagram não é o suficiente para a sua clínica?",
    painPointDescription: "O Instagram gera desejo, mas quem pesquisa no Google já está pronto para comprar. Uma clínica de estética em sua cidade precisa estar no topo das buscas quando o cliente procurar pelo procedimento. O site profissional converte essa busca em cliente pagante.",
    benefits: [
      "Foco visual em beleza, sofisticação e resultados",
      "Apresentação clara dos principais procedimentos",
      "Botão de WhatsApp projetado para picos de agendamento"
    ],
    faqs: [
      { question: "Podemos listar todos os procedimentos da clínica?", answer: "Sim, criamos uma estrutura onde botox, harmonização, laser e outros tratamentos têm destaque e explicações que geram desejo imediato." },
      { question: "O site passa uma imagem de clínica de luxo?", answer: "Absolutamente. Usamos paletas de cores sofisticadas, tipografia elegante e imagens premium para elevar a percepção de valor dos seus tratamentos." },
      { question: "Posso usar o site em campanhas de Tráfego Pago?", answer: "O site é perfeito para receber anúncios do Google Ads e Meta Ads, pois tem carregamento instantâneo e ganchos de persuasão que maximizam o retorno (ROI) da campanha." }
    ]
  },
  corretores: {
    title: "Site para Corretores de Imóveis",
    heroSubtitle: "Capte leads imobiliários quentes. Venda mais imóveis na sua cidade com páginas otimizadas para alto padrão e lançamentos.",
    painPointTitle: "O funil essencial do corretor de sucesso",
    painPointDescription: "A busca por imóveis é intensamente territorial. Se você não tem uma landing page agressiva captando clientes na sua cidade para os melhores lançamentos, você está perdendo comissões. Criamos páginas imobiliárias feitas para captar contatos rápidos.",
    benefits: [
      "Layout focado em destacar alto padrão e exclusividade",
      "Captação de leads 24h por dia para sua esteira de vendas",
      "Integração facilitada com seu CRM imobiliário"
    ],
    faqs: [
      { question: "O site serve para lançamentos ou imóveis prontos?", answer: "Ambos. A estrutura pode ser adaptada como uma vitrine de alto padrão ou como Landing Pages super agressivas focadas na captura de leads para lançamentos específicos." },
      { question: "Como o site capta os leads?", answer: "Estrategicamente posicionamos botões de WhatsApp e formulários curtos em áreas quentes da página, focando em gerar o contato antes que o cliente vá para a concorrência." },
      { question: "Ajuda na autoridade do corretor?", answer: "Sim. O site terá uma área focada na sua história, seus prêmios e seu conhecimento da região, mostrando que você não é só mais um corretor, e sim o especialista local." }
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
    title: "Site para Engenheiros e Construtoras",
    heroSubtitle: "Feche contratos de reformas e construções. Exiba obras e orçamentos com a precisão que seu cliente espera na sua região.",
    painPointTitle: "A solidez do seu site reflete a das suas obras?",
    painPointDescription: "Contratar engenharia exige extrema confiança. Clientes da sua cidade precisam visualizar seu histórico de obras e ter facilidade para solicitar orçamentos. Construímos páginas com a engenharia perfeita para gerar credibilidade instantânea.",
    benefits: [
      "Estrutura otimizada para captar orçamentos detalhados",
      "Destaque para o portfólio de obras concluídas e laudos",
      "Design corporativo focado em B2B e grandes clientes residenciais"
    ],
    faqs: [
      { question: "Consigo exibir fotos de antes e depois das obras?", answer: "Sim, o site conta com áreas dedicadas ao portfólio visual, o que é fundamental para gerar confiança em reformas e construções de alto padrão." },
      { question: "Atrai clientes residenciais e empresariais?", answer: "O site é moldado de acordo com seu foco. Podemos ter seções para laudos/projetos B2B e outras seções para reformas residenciais de luxo." },
      { question: "O cliente pode solicitar orçamentos formais?", answer: "Integramos formulários onde o cliente já envia os dados iniciais do terreno ou da planta, poupando o tempo da sua equipe de atendimento." }
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
      "Estrutura focada em gerar orçamentos todos os dias"
    ],
    faqs: [
      { question: "Como funciona a criação do site?", answer: `Montamos o projeto focado especificamente na área de ${nicho}, visando a máxima conversão de leads em ${cidade}.` },
      { question: "Vou aparecer no Google?", answer: `Nossa estrutura já contempla todas as boas práticas de SEO local, desenhadas para você dominar as buscas orgânicas em ${cidade}.` },
      { question: "O suporte é contínuo?", answer: "Sim. Trabalhamos com uma infraestrutura robusta garantindo que o seu funil de captação fique online 24h por dia, sem travamentos." }
    ]
  };
};
