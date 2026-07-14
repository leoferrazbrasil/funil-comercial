export interface NicheData {
  title: string;
  heroSubtitle: string;
  painPointTitle: string;
  painPointDescription: string;
  benefits: string[];
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
    ]
  };
};
