import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const date = '2026-07-23';
const root = process.cwd();
const outDir = path.join(root, `prospeccao-ativa-${date}`);
const printDir = path.join(outDir, 'prints');

const columns = [
  'data',
  'rank',
  'nicho',
  'região',
  'nome',
  'nota',
  'avaliações',
  'contato',
  'WhatsApp/telefone normalizado',
  'site atual',
  'link Maps',
  'motivo da abordagem',
  'diagnóstico do site atual',
  'conteúdo real extraído',
  'serviços reais identificados',
  'prova social real',
  'identidade visual observada',
  'imagens/logo aproveitáveis',
  'slug sugerido',
  'status redesign',
  'URL curta gerada',
  'print Maps',
  'print site atual desktop',
  'print site atual mobile',
  'link wa.me preliminar',
  'status',
  'observações',
  'Bloco 1 (Link)',
  'Bloco 2 (Proposta)',
  'Toque 1 (2 dias)',
  'Toque 2 (5 dias)',
  'Toque 3 (10 dias)',
];

const touch1 = (name) =>
  `Oi, ${firstName(name)}! Passando pra saber se você chegou a ver o site novo que te mandei.\n\nSe tiver algo que você mudaria, uma cor, um texto, uma foto, eu ajusto pra ficar do seu jeito.`;
const touch2 = (name) =>
  `Oi, ${firstName(name)}! Só pra deixar claro, esse é o trabalho que eu faço: ajudo profissionais como você a terem um site que traz mais pacientes, clientes ou consultas e passa mais autoridade.\n\nFiz o seu como demonstração, sem compromisso.\n\nSe fizer sentido, te explico como deixar ele no ar. Quer que eu te mande os detalhes?`;
const touch3 = (name) =>
  `Oi, ${firstName(name)}! Imagino que a correria da agenda tenha falado mais alto, sem problema.\n\nVou deixar o link no ar por mais 24 horas.\n\nSe um dia quiser colocar no ar, é só me chamar que retomo na hora.\n\nSucesso!`;

const leads = [
  {
    nicho: 'Psicóloga',
    regiao: 'São Paulo - SP',
    nome: 'Tatiana H. Abdo',
    phone: '+5511999749694',
    contato: 'WhatsApp/Telegram público no site: (11) 99974-9694; tatiana.abdo@hotmail.com.br',
    site: 'https://tatianaabdo.wixsite.com/psicologia',
    mapsQuery: 'Tatiana H Abdo Psicóloga São Paulo Bela Vista',
    motivo: 'Psicóloga clínica com CRP e contato direto, mas site Wix antigo com navegação simples e aparência de template.',
    diagnostico: 'Site Wix datado, muito fragmentado por menus e blog, CTA pouco destacado e baixa hierarquia para agendamento via WhatsApp.',
    conteudo: 'Site informa Psicóloga Clínica Tatiana H. Abdo, CRP 06/87427, formação em Psicologia pela PUC-SP e Música pela EMESP, especialização em Psicodrama pela PUC-SP/COGEAE, endereço Rua Itapeva, 378, Bela Vista, São Paulo, telefone WhatsApp/Telegram e e-mail.',
    servicos: 'Psicoterapia individual; psicoterapia em grupo; psicodrama; interface psicologia e música; blog Arte em SΨ.',
    prova: 'CRP 06/87427, formação PUC-SP e filiação à Sociedade de Psicodrama de São Paulo informadas no site.',
    identidade: 'Wix antigo, visual institucional simples, tons claros e imagens pequenas de apoio.',
    imagens: 'Imagens e elementos do Wix podem orientar a primeira versão, mas a identidade precisa de hierarquia mais profissional.',
  },
  {
    nicho: 'Psicóloga',
    regiao: 'Curitiba - PR',
    nome: 'Ester Nascimento',
    phone: '+5541998300186',
    contato: 'Telefone/WhatsApp público no site: (41) 99830-0186; ester.nascimentur@gmail.com',
    site: 'https://esternascimentur.wixsite.com/psicuritiba',
    mapsQuery: 'Ester Nascimento Psicóloga Curitiba',
    motivo: 'Psicóloga clínica com CRP e WhatsApp direto, mas site Wix com rodapé/template pouco profissional.',
    diagnostico: 'Página Wix curta, com pouco posicionamento visual, pouca prova de autoridade na primeira dobra e CTA de contato sem destaque.',
    conteudo: 'Site informa Ester Nascimento, psicóloga clínica CRP 08/35130, atendimento online e em Curitiba, contato por ligação, WhatsApp e e-mail.',
    servicos: 'Psicoterapia online; atendimento psicológico em Curitiba; contato por WhatsApp, telefone e e-mail.',
    prova: 'CRP 08/35130 e identificação como psicóloga clínica no site.',
    identidade: 'Wix simples, poucos elementos de marca e aparência de página básica.',
    imagens: 'Imagens do site podem ser reaproveitadas como referência leve; precisa de identidade mais clara.',
  },
  {
    nicho: 'Psicóloga',
    regiao: 'Curitiba - PR',
    nome: 'Bruna Calgaro',
    phone: '+5541996693777',
    contato: 'Telefone e e-mail públicos no site: (41) 99669-3777; brunacalgaro.psi@gmail.com',
    site: 'https://brunacalgaro.wixsite.com/psicologabruna',
    mapsQuery: 'Bruna Calgaro Psicóloga Curitiba Bigorrilho',
    motivo: 'Psicóloga individual com CRP e contato direto, mas site Wix de estrutura simples e baixa sofisticação visual.',
    diagnostico: 'Site Wix com conteúdo mínimo, CTA repetido por telefone e pouca organização de abordagem, público atendido e diferenciais.',
    conteudo: 'Site informa Bruna Calgaro, Psicologia CRP 08/36260, Bigorrilho Curitiba, telefone, e-mail e Instagram @brunacalgaro.psi.',
    servicos: 'Psicologia clínica; atendimento por sessão; contato para agendamento.',
    prova: 'CRP 08/36260 e canais públicos de contato no site.',
    identidade: 'Visual Wix simples, com foto/imagens e poucos blocos comerciais.',
    imagens: 'Foto/imagens do site podem orientar o redesign.',
  },
  {
    nicho: 'Psicóloga',
    regiao: 'Campinas - SP',
    nome: 'Betsabe Oliveira',
    phone: '+5519997017828',
    contato: 'Telefone também pelo WhatsApp no site: 997.017.828',
    site: 'https://betsabeam.wixsite.com/psicologa',
    mapsQuery: 'Betsabe Oliveira Psicóloga Campinas Guanabara',
    motivo: 'Psicóloga clínica em Campinas com CRP e WhatsApp, porém site Wix antigo com navegação pesada.',
    diagnostico: 'Página com banner Wix, textos antigos, imagens pequenas e CTA de agendamento pouco valorizado; redesign pode concentrar abordagem, endereço e WhatsApp.',
    conteudo: 'Site informa Dra. Betsabe Oliveira, CRP 06/70.491, psicóloga clínica em Campinas, há 15 anos atuando com dificuldades emocionais, crises, dores e angústias, Abordagem Centrada na Pessoa, Rua Frei Manoel da Ressurreição 974, Guanabara, Campinas.',
    servicos: 'Psicoterapia; psicoterapia de casal, individual e adolescente; Abordagem Centrada na Pessoa.',
    prova: 'CRP 06/70.491 e menção a 15 anos de dedicação clínica no site.',
    identidade: 'Wix antigo, galeria simples e estrutura de página de 2018.',
    imagens: 'Imagens de Psicóloga Campinas e elementos do site podem ser usados como referência.',
  },
  {
    nicho: 'Psicóloga',
    regiao: 'São Paulo - SP',
    nome: 'Gabriela Pacheco Lopes',
    phone: '+5511973172098',
    contato: 'WhatsApp público no site: (11) 97317-2098; gabriela_plopes@hotmail.com',
    site: 'https://gabrielapsicologia.wixsite.com/psicologia/c%C3%B3pia-home-1',
    mapsQuery: 'Gabriela Pacheco Lopes Psicóloga São Paulo Anália Franco',
    motivo: 'Psicóloga com oferta clara de neuropsicologia, mas site Wix com URL de cópia e estrutura visual datada.',
    diagnostico: 'URL/caminho de cópia, blocos longos sobre neuropsicologia e CTA visual fraco reduzem confiança; redesign pode destacar avaliação neuropsicológica e WhatsApp.',
    conteudo: 'Site informa Psicóloga Gabriela Pacheco Lopes, CRP 06/119965, atendimento psicológico online, avaliação psicológica para cirurgia bariátrica, avaliação e reabilitação neuropsicológica, consultórios na Av. Sapopemba e Rua Emília Marengo, Anália Franco, São Paulo.',
    servicos: 'Atendimento psicológico online; avaliação psicológica bariátrica; avaliação neuropsicológica; reabilitação neuropsicológica.',
    prova: 'CRP 06/119965 e especialidades técnicas explicitadas no site.',
    identidade: 'Wix com cartão/imagens, texto longo e navegação fragmentada.',
    imagens: 'Cartão de visita e imagens do site podem orientar a identidade.',
  },
  {
    nicho: 'Psicóloga',
    regiao: 'Rio de Janeiro - RJ',
    nome: 'Márcia Verônica',
    phone: '+5521987523481',
    contato: 'Telefone ou WhatsApp público: 21 98752-3481; marciaveronica.psicologia@gmail.com',
    site: 'https://marciaveronicapsi.wixsite.com/meusite',
    mapsQuery: 'Márcia Verônica Psicologia Rio de Janeiro',
    motivo: 'Psicóloga com WhatsApp e serviços reais, mas site Wix simples e formulário genérico.',
    diagnostico: 'Página Wix com pouco posicionamento, CTA textual e formulário básico; redesign pode organizar psicoterapia, coaching, treinamentos e contato.',
    conteudo: 'Site informa serviços especializados em Psicoterapia, Programas de Coaching e Treinamentos, telefone/WhatsApp e e-mail para contato.',
    servicos: 'Psicoterapia; coaching; treinamentos.',
    prova: 'Serviços e contato públicos no site; presença profissional individual feminina.',
    identidade: 'Wix antigo, visual simples e pouco diferenciado.',
    imagens: 'Ícones/redes e imagens do site podem ser reaproveitados como referência.',
  },
  {
    nicho: 'Psicóloga',
    regiao: 'Rio de Janeiro - RJ',
    nome: 'Carolina Bittencourt',
    phone: '+5521993240851',
    contato: 'WhatsApp público no site: 21 993240851',
    site: 'https://carolinabittencourt.wixsite.com/psicologacarolinab',
    mapsQuery: 'Carolina Bittencourt Psicóloga Barra da Tijuca Rio de Janeiro',
    motivo: 'Psicóloga infantil/adolescentes com WhatsApp e site Wix, mas página antiga e com baixa força de conversão.',
    diagnostico: 'Site Wix de 2021, conteúdo curto, CTA simples e pouca estrutura para explicar especialidade infantil/adolescente.',
    conteudo: 'Site informa Carolina Bittencourt, psicóloga formada pela PUC Rio, atendimento online para todo o Brasil, Barra da Tijuca/RJ e WhatsApp para dúvidas e primeira entrevista.',
    servicos: 'Psicoterapia infantil e de adolescentes; atendimento online; primeira entrevista pelo WhatsApp.',
    prova: 'CRP 05/64826 aparece no resultado público e site identifica formação PUC Rio.',
    identidade: 'Wix simples, imagem pessoal e blog curto.',
    imagens: 'Foto da profissional e elementos do site podem orientar a página.',
  },
  {
    nicho: 'Psicóloga',
    regiao: 'São Paulo - SP',
    nome: 'Érica Romero',
    phone: '+5511972351727',
    contato: 'Contato público no site: +55 (11) 9 7235-1727; erica_romeropsi@hotmail.com',
    site: 'https://ericaromeropsi.wixsite.com/inicio',
    mapsQuery: 'Érica Romero Psicóloga Perdizes São Paulo',
    motivo: 'Psicóloga em São Paulo com CRP e contato direto, mas Google/Wix site simples e pouco persuasivo.',
    diagnostico: 'Página com conteúdo básico, pouca prova social e CTA de agendamento sem hierarquia; redesign pode ordenar serviços, localização e WhatsApp.',
    conteudo: 'Site informa Érica Romero, formada em Psicologia pela PUC-SP, CRP 06/116476, atendimento em Perdizes, São Paulo, contato por telefone e e-mail.',
    servicos: 'Atendimento psicológico para crianças e adultos; agendamento de sessão.',
    prova: 'CRP 06/116476 e formação PUC-SP informadas no site.',
    identidade: 'Visual simples, poucas seções e baixa diferenciação visual.',
    imagens: 'Imagens e foto do site podem ser aproveitadas.',
  },
  {
    nicho: 'Psicóloga',
    regiao: 'Curitiba - PR',
    nome: 'Nicole Hempel',
    phone: '+5541995168483',
    contato: 'WhatsApp público: 41 9 9516-8483; psi.nicolehempel@gmail.com',
    site: 'https://psinicolehempel.wixsite.com/website',
    mapsQuery: 'Nicole Hempel Psicóloga Curitiba',
    motivo: 'Psicóloga clínica em Curitiba com CRP e WhatsApp, mas site Wix simples e pouco comercial.',
    diagnostico: 'Página Wix com conteúdo institucional curto, CTA pouco destacado e estrutura básica; redesign pode evidenciar TCC, avaliação psicológica e WhatsApp.',
    conteudo: 'Site informa Nicole Hempel dos Santos, psicóloga CRP 08/30115, formada pela Faculdades Pequeno Príncipe, pós em Terapia Cognitiva Comportamental, Avaliação Psicológica/Psicodiagnóstico e Terapia do Esquema, Curitiba/PR.',
    servicos: 'Psicóloga online; psicoterapia; avaliação psicológica/psicodiagnóstico; TCC e Terapia do Esquema.',
    prova: 'CRP 08/30115 e formações publicadas no site.',
    identidade: 'Wix com visual simples, fotos e textos de apresentação.',
    imagens: 'Foto e imagens do site podem orientar o redesign.',
  },
  {
    nicho: 'Psicóloga',
    regiao: 'São Paulo - SP',
    nome: 'Norma Miguel',
    phone: '+5511993829514',
    contato: 'WhatsApp público no site: (11) 99382-9514',
    site: 'https://normamiguel.wixsite.com/psicologa',
    mapsQuery: 'Norma Miguel Psicóloga Jaguaré São Paulo',
    motivo: 'Psicóloga com CRP e WhatsApp em São Paulo, mas página Wix antiga e visualmente pobre.',
    diagnostico: 'Site tem informação de contato e horário, mas quase não organiza abordagem, público atendido ou benefícios; redesign pode dar autoridade e facilitar agendamento.',
    conteudo: 'Site informa Psicóloga em São Paulo no Jaguaré, CRP 06/31899, endereço Rua Dr. Agenor Fernandes Barbosa, 130, horário de funcionamento e contato WhatsApp.',
    servicos: 'Atendimento psicológico presencial/online; agendamento por WhatsApp.',
    prova: 'CRP 06/31899, endereço e WhatsApp publicados no site.',
    identidade: 'Wix antigo, conteúdo enxuto e pouca identidade visual.',
    imagens: 'Poucos elementos aproveitáveis; precisa de construção visual nova preservando dados.',
  },
  {
    nicho: 'Psicóloga / Psicanalista',
    regiao: 'São Paulo - SP',
    nome: 'Christiane Aguiar',
    phone: '+5511985259616',
    contato: 'Telefone público no Google Sites: (11) 98525-9616; chrisaguiarpsicologia@gmail.com',
    site: 'https://sites.google.com/site/christianeaguiarpsicologa',
    mapsQuery: 'Christiane Aguiar Psicóloga São Paulo Santana',
    motivo: 'Psicóloga com CRP e contato direto em Google Sites antigo, forte oportunidade de modernização.',
    diagnostico: 'Google Sites clássico com aparência datada, pouca hierarquia e praticamente sem jornada de agendamento; redesign pode reforçar clínica, gravidez e psicanálise.',
    conteudo: 'Site informa Christiane Aguiar, CRP 06/103011, Psicologia Clínica, Psicologia Hospitalar, Psicóloga da Gravidez, membro filiado à Sociedade Brasileira de Psicanálise, endereço Rua Voluntários da Pátria 3744, Santana, São Paulo.',
    servicos: 'Psicologia clínica; psicologia hospitalar; psicologia da gravidez; psicanálise.',
    prova: 'CRP 06/103011 e filiação à Sociedade Brasileira de Psicanálise informadas no site.',
    identidade: 'Google Sites muito básico, sem identidade visual forte.',
    imagens: 'Poucos ativos; conteúdo e dados profissionais são o principal insumo.',
  },
  {
    nicho: 'Psicóloga',
    regiao: 'São Paulo - SP',
    nome: 'Natasha Takuno Hespanhol',
    phone: '+5511964289472',
    contato: 'WhatsApp público no Google Sites: (11) 96428-9472; natasha.takuno@gmail.com',
    site: 'https://sites.google.com/view/psicologa-natasha-takuno',
    mapsQuery: 'Natasha Takuno Hespanhol Psicóloga São Paulo',
    motivo: 'Psicóloga com CRP e WhatsApp em Google Sites, mas apresentação visual muito simples.',
    diagnostico: 'Site Google Sites básico, CTA de primeira consulta pouco sofisticado e pouca organização visual de perguntas frequentes; redesign pode melhorar autoridade e conversão.',
    conteudo: 'Site informa Natasha Takuno Hespanhol, psicóloga CRP 06/157080, WhatsApp, e-mail, cursos em prevenção ao suicídio, psicoterapia daseinsanalítica e transtornos mentais graves.',
    servicos: 'Psicoterapia; primeira consulta; perguntas frequentes; atendimento psicológico.',
    prova: 'CRP 06/157080 e cursos listados no site.',
    identidade: 'Google Sites simples, texto e imagens básicos.',
    imagens: 'Imagens do site podem ser usadas como referência secundária.',
  },
  {
    nicho: 'Psicóloga / Psicanalista',
    regiao: 'São Paulo - SP',
    nome: 'Célia Chamorro',
    phone: '+5511947605521',
    contato: 'Tel/WhatsApp público no site: (11) 94760-5521; celiachamorro@hotmail.com',
    site: 'https://sites.google.com/view/psicologacelia',
    mapsQuery: 'Célia Chamorro Psicóloga São Paulo Tatuapé',
    motivo: 'Psicóloga e psicanalista com CRP e WhatsApp, mas Google Sites visualmente datado.',
    diagnostico: 'Página simples com formação e contato, sem CTA forte, prova social ou blocos escaneáveis para decisão de agendamento.',
    conteudo: 'Site informa formação em Psicologia pela Universidade São Marcos, CRP 06/94405, experiência em psicologia clínica, formação em Psicanálise pela CLIPP, extensão em TCC, atendimento online e presencial na Vila Regente Feijó, São Paulo.',
    servicos: 'Psicologia clínica; psicanálise; terapia online e presencial.',
    prova: 'CRP 06/94405, formações e experiência clínica indicadas no site.',
    identidade: 'Google Sites antigo, texto institucional e imagens básicas.',
    imagens: 'Imagens simples do site podem orientar, mas requer refinamento visual.',
  },
  {
    nicho: 'Psicóloga',
    regiao: 'São Paulo - SP',
    nome: 'Tatiane Campos',
    phone: '+5511967590499',
    contato: 'Celular/WhatsApp público no site: (11) 96759-0499; psicologia.dcampos@gmail.com',
    site: 'https://sites.google.com/view/psicologadcampos',
    mapsQuery: 'Tatiane Campos Psicóloga São Mateus São Paulo',
    motivo: 'Psicóloga com CRP, WhatsApp e domínio próprio apontado, mas Google Sites básico.',
    diagnostico: 'Site atual tem contato e localização, porém pouca estrutura de serviços, prova social e diferenciais; redesign pode profissionalizar a presença.',
    conteudo: 'Site informa Psicóloga Tatiane Campos, CRP 06/131050, atendimento presencial na região de São Mateus, Zona Leste, atendimento online pelo WhatsApp, celular, e-mail e site psicologadcampos.com.br.',
    servicos: 'Atendimento psicológico presencial; atendimento online; agendamento por WhatsApp.',
    prova: 'CRP 06/131050 e contato público no site.',
    identidade: 'Google Sites simples, sem identidade visual robusta.',
    imagens: 'Poucos ativos visuais; usar dados reais e contato como base.',
  },
  {
    nicho: 'Psicóloga',
    regiao: 'Rio de Janeiro - RJ',
    nome: 'Edna Guedes',
    phone: '+5521997210154',
    contato: 'WhatsApp público no site: +55 21 99721-0154; PsicologaEdnaGuedes@gmail.com',
    site: 'https://sites.google.com/view/psicologaednaguedes/',
    mapsQuery: 'Psicóloga Edna Guedes Barra da Tijuca Rio de Janeiro',
    motivo: 'Psicóloga para adolescentes com WhatsApp e muitas avaliações, mas Google Sites longo e pouco elegante.',
    diagnostico: 'Página extensa em Google Sites, com depoimentos longos e excesso de texto; redesign pode transformar prova social em seções curtas e CTA forte.',
    conteudo: 'Site informa Psicóloga Edna Guedes Teixeira da Silva, CRP 05/55636, psicologia para adolescente na Barra da Tijuca, Blue Center Mall, Av. das Américas 12300, telefone, e-mail e chamada para agendamento por WhatsApp.',
    servicos: 'Psicologia para adolescentes; atendimento com família; consulta presencial na Barra da Tijuca.',
    prova: 'CRP 05/55636 e várias avaliações Google 5 estrelas citadas no site.',
    identidade: 'Google Sites com muitos blocos, depoimentos extensos e imagens do local.',
    imagens: 'Fotos do Blue Center Mall e avaliações podem orientar o redesign.',
  },
  {
    nicho: 'Psicóloga',
    regiao: 'Curitiba - PR',
    nome: 'Maria Cristina Delattre',
    phone: '+5541996798182',
    contato: 'WhatsApp público no site: (41) 99679-8182',
    site: 'https://sites.google.com/site/psicologamariacristinadelattre',
    mapsQuery: 'Maria Cristina Delattre Psicóloga Curitiba Cabral',
    motivo: 'Psicóloga com CRP e formação forte, mas Google Sites clássico datado.',
    diagnostico: 'Página muito antiga visualmente, com texto técnico longo e pouco CTA; redesign pode organizar TCC, formação e contato em primeira dobra.',
    conteudo: 'Site informa Psicóloga Maria Cristina Delattre, CRP 08/04151, formação pela UFPR, especialista em Psicoterapia Cognitiva Comportamental, membro da ABPC e IACP, atendimento presencial e online em Curitiba, R. Dr Manoel Pedro, 365, Cabral.',
    servicos: 'Psicoterapia cognitivo-comportamental; atendimento presencial e online.',
    prova: 'CRP 08/04151, formação UFPR e associações ABPC/IACP publicadas.',
    identidade: 'Google Sites antigo, quase sem branding moderno.',
    imagens: 'Conteúdo técnico e dados de formação são o principal insumo.',
  },
  {
    nicho: 'Psicóloga / Psicanalista',
    regiao: 'Rio de Janeiro - RJ',
    nome: 'Wania T. Costa',
    phone: '+5521982565999',
    contato: 'Telefone público no Google Sites: (21) 98256-5999; waniacosta.psi@outlook.com',
    site: 'https://sites.google.com/view/waniacostapsicologa',
    mapsQuery: 'Wania Costa Psicóloga Barra da Tijuca Rio de Janeiro',
    motivo: 'Psicóloga e psicanalista com telefone direto, mas site Google Sites extremamente simples.',
    diagnostico: 'Site tem pouquíssimos blocos, quase nenhum CTA persuasivo e baixa percepção de autoridade visual; redesign pode ampliar apresentação sem inventar dados.',
    conteudo: 'Site informa Wania T. Costa, psicóloga com título de especialista em Psicologia Clínica, psicanalista, atendimento online, consultório na Barra da Tijuca, Rio de Janeiro, telefone e e-mail.',
    servicos: 'Psicologia clínica; psicanálise; atendimento online.',
    prova: 'Título de especialista em Psicologia Clínica e atuação como psicanalista informados no site.',
    identidade: 'Google Sites simples, textual e sem marca visual forte.',
    imagens: 'Poucos ativos; usar identidade mínima e dados publicados.',
  },
  {
    nicho: 'Psicóloga / Neuropsicóloga',
    regiao: 'Curitiba - PR',
    nome: 'Karime Longen',
    phone: '+5541999057339',
    contato: 'Telefone público no título/site: 99905-7339; atendimento via WhatsApp',
    site: 'https://sites.google.com/view/psicologa-karime-longen',
    mapsQuery: 'Karime Longen Psicóloga Curitiba',
    motivo: 'Psicóloga clínica/neuropsicóloga com WhatsApp, mas Google Sites simples e título com telefone improvisado.',
    diagnostico: 'Título “Ligue já” e estrutura básica passam pouca autoridade; redesign pode organizar neuropsicologia, atendimento individual/casal e agendamento.',
    conteudo: 'Site informa Karime Longen, psicóloga clínica e neuropsicóloga em Curitiba, atendimento a adolescentes e adultos presencial e online, atendimento individual e casal, prática clínica norteada pela psicanálise freudiana.',
    servicos: 'Atendimento individual; atendimento de casal; psicoterapia online e presencial; neuropsicologia.',
    prova: 'Identificação como psicóloga clínica e neuropsicóloga, com descrição de atuação e públicos atendidos.',
    identidade: 'Google Sites básico, com imagens simples e chamada telefônica no título.',
    imagens: 'Imagens do site podem orientar a paleta, mas precisam de refinamento.',
  },
  {
    nicho: 'Psicóloga',
    regiao: 'Belo Horizonte - MG',
    nome: 'Karine Araújo',
    phone: '+5531993330322',
    contato: 'Telefone público no site: (31) 99333-0322',
    site: 'https://projetosentir3.wixsite.com/website',
    mapsQuery: 'Karine Araújo Psicóloga Belo Horizonte',
    motivo: 'Psicóloga mineira com CRP e site Wix, porém apresentação antiga e pouco focada em conversão.',
    diagnostico: 'Site Wix com visual de template, conteúdo biográfico longo e CTA pouco destacado; redesign pode transformar formação e abordagem em página clara.',
    conteudo: 'Site informa Karine Luiza Rezende Silva Araújo, psicóloga clínica CRP 04/31799, nascida em Belo Horizonte, graduação em Psicologia e mestrado em Ciências da Religião pela PUC Minas, especializações em Gestão de Pessoas e Psicologia Humanista/Existencial/Fenomenológica.',
    servicos: 'Psicologia clínica; abordagem humanista, existencial e fenomenológica; contato para atendimento.',
    prova: 'CRP 04/31799, graduação, mestrado e especializações publicadas no site.',
    identidade: 'Wix antigo, imagem pessoal e texto biográfico extenso.',
    imagens: 'Imagem e identidade atual podem ser preservadas em layout mais claro.',
  },
  {
    nicho: 'Psicóloga',
    regiao: 'Belo Horizonte - MG',
    nome: 'Carla Lopes',
    phone: '+5531985296245',
    contato: 'Celular público no site: (31) 98529-6245; carlalopes.psicologa@gmail.com',
    site: 'https://carlalopespsi.wixsite.com/carlalopes',
    mapsQuery: 'Carla Lopes Psicóloga Belo Horizonte',
    motivo: 'Psicóloga com atendimento online e presencial, mas site Wix básico e pouco focado em agendamento.',
    diagnostico: 'Site tem endereço, contato e e-mail, porém pouca estrutura comercial e visual; redesign pode destacar atendimento online, BH/Viçosa e WhatsApp.',
    conteudo: 'Site informa Carla Lopes, psicóloga clínica, atendimentos online, endereço Rua Espírito Santo 1204, Centro, Belo Horizonte, atendimento também em Viçosa, celular e e-mail.',
    servicos: 'Psicologia clínica; atendimento online; atendimento presencial em Belo Horizonte e Viçosa.',
    prova: 'Endereços, contato e identidade profissional publicados no site.',
    identidade: 'Wix simples, ícones básicos e visual institucional.',
    imagens: 'Ícones/imagens do site podem orientar o redesign.',
  },
  {
    nicho: 'Psicóloga',
    regiao: 'Ribeirão Preto / Monte Alto - SP',
    nome: 'Júlia C. Lapola Ferreira',
    phone: '+5516996255885',
    contato: 'Telefone público no site: (16) 99625-5885',
    site: 'https://psijulialapola.wixsite.com/my-site',
    mapsQuery: 'Júlia C Lapola Ferreira Psicóloga Ribeirão Preto Monte Alto',
    motivo: 'Psicóloga com CRP, telefone e site Wix, mas página simples e com pouca autoridade visual.',
    diagnostico: 'Site Wix básico, sem CTA forte e sem prova social; redesign pode destacar TCC, públicos atendidos e contato direto.',
    conteudo: 'Site informa Júlia C. Lapola Ferreira, psicóloga clínica CRP 06/160309, formada pelo Centro Universitário Barão de Mauá em Ribeirão Preto/SP, pós-graduada em TCC, atendimento presencial, online e para crianças, adolescentes e adultos, Viver Clin em Monte Alto.',
    servicos: 'Atendimento presencial; atendimento online; atendimento para crianças, adolescentes e adultos; TCC.',
    prova: 'CRP 06/160309, formação e pós-graduação publicadas no site.',
    identidade: 'Wix com imagem pessoal e layout simples.',
    imagens: 'Foto e imagens do site podem ser aproveitadas.',
  },
  {
    nicho: 'Psicóloga',
    regiao: 'Ribeirão Preto - SP',
    nome: 'Natália Feitosa',
    phone: '+5516991399899',
    contato: 'Telefone/WhatsApp público: 16 99139-9899; oliveiranataliapsi@gmail.com',
    site: 'https://nataliafeitosa.wixsite.com/psicologia/a-psicologa',
    mapsQuery: 'Natália Feitosa Psicóloga Ribeirão Preto',
    motivo: 'Psicóloga em Ribeirão Preto com WhatsApp, mas site Wix antigo de 2017.',
    diagnostico: 'Página antiga, pouca hierarquia de serviços e CTA simples; redesign pode modernizar apresentação, endereço e agendamento.',
    conteudo: 'Site informa Natália Feitosa de Oliveira, endereço Rua Floriano Peixoto 891, Centro, Ribeirão Preto, e-mail, telefone também WhatsApp.',
    servicos: 'Psicologia clínica; atendimento presencial; contato por WhatsApp.',
    prova: 'Endereço, e-mail e WhatsApp publicados no site profissional.',
    identidade: 'Wix de 2017, visual datado e seções simples.',
    imagens: 'Imagens antigas do site podem guiar a atualização visual.',
  },
  {
    nicho: 'Psicóloga',
    regiao: 'Belo Horizonte - MG',
    nome: 'Bárbara Lima',
    phone: '+5531984703799',
    contato: 'WhatsApp público no site: (31) 98470-3799; barbaralimatpsicologa@gmail.com',
    site: 'https://barbaralimatpsicol.wixsite.com/rbara-lima-psi',
    mapsQuery: 'Bárbara Lima Psicóloga Belo Horizonte',
    motivo: 'Psicóloga com WhatsApp e oferta clara, mas site Wix com domínio improvisado e conteúdo de template moderno ainda pouco refinado.',
    diagnostico: 'Apesar de recente, a URL Wix e alguns textos genéricos reduzem percepção profissional; redesign individual pode dar domínio próprio, foco e CTA mais confiável.',
    conteudo: 'Site informa Bárbara Lima, psicóloga CRP 04/182428, terapia TCC e ACT, atendimento online e presencial para crianças, adolescentes e adultos, especialização em andamento em Neuropsicologia, e-books gratuitos e WhatsApp.',
    servicos: 'Psicoterapia para adultos; psicoterapia infantil e adolescente; TCC; ACT; neuropsicologia em formação.',
    prova: 'CRP 04/182428, e-books e formação/abordagens publicadas no site.',
    identidade: 'Wix mais recente, porém com domínio improvisado e identidade genérica.',
    imagens: 'Elementos do site e e-books podem orientar identidade visual.',
  },
  {
    nicho: 'Psicóloga',
    regiao: 'Belo Horizonte - MG',
    nome: 'Aline Rocha Marques',
    phone: '+5531993737104',
    contato: 'Telefone público em conteúdo do site: (31) 99373-7104',
    site: 'https://alinermarquespsi.wixsite.com/psicologa',
    mapsQuery: 'Aline Rocha Marques Psicóloga Belo Horizonte',
    motivo: 'Psicóloga com CRP e telefone em site Wix, mas página mistura muitas reflexões e baixa clareza de oferta.',
    diagnostico: 'Site com excesso de posts/reflexões, CTA diluído e pouco foco em serviço; redesign pode transformar o conteúdo em autoridade e agendamento claro.',
    conteudo: 'Site informa Aline Rocha Marques, psicóloga CRP 04/58408, sessões por videochamada via WhatsApp ou Google Meet, conteúdos de saúde mental e reflexões, telefone (31) 99373-7104.',
    servicos: 'Psicologia online; sessões por videochamada; suporte emocional; TCC indicada em conteúdos.',
    prova: 'CRP 04/58408 e telefone publicados nos textos do site.',
    identidade: 'Wix com muitos posts/imagens e baixa estrutura de landing.',
    imagens: 'Posts/imagens podem virar prova de conteúdo em layout mais organizado.',
  },
  {
    nicho: 'Fisioterapeuta',
    regiao: 'Campinas - SP',
    nome: 'Larah Segin',
    phone: '+5519999467757',
    contato: 'WhatsApp público no site: 19999467757; lssfisioterapia@gmail.com',
    site: 'https://lssfisioterapia.wixsite.com/larah-segin-fisioter',
    mapsQuery: 'Larah Segin Fisioterapia Campinas',
    motivo: 'Fisioterapeuta pélvica/obstétrica com CREFITO e WhatsApp, mas site Wix com domínio improvisado.',
    diagnostico: 'Site atual é simples, com erros de digitação e CTA básico; redesign pode destacar saúde íntima da mulher, CREFITO e agendamento.',
    conteudo: 'Site informa Larah Segin, fisioterapeuta especialista em saúde da mulher, CREFITO 255846F, fisioterapia pélvica e obstétrica, formada pela Anhembi Morumbi, especialização pela UFSCar, atendimento em Jardim Chapadão, Campinas.',
    servicos: 'Fisioterapia pélvica; fisioterapia obstétrica; saúde íntima da mulher; atendimento com hora marcada.',
    prova: 'CREFITO 255846F, formação e especialização publicadas no site.',
    identidade: 'Wix simples, foco feminino, imagens de respiração/pose e linguagem acolhedora.',
    imagens: 'Imagens do site podem orientar uma página feminina e clínica.',
  },
  {
    nicho: 'Fisioterapeuta',
    regiao: 'Campinas - SP',
    nome: 'Kemle Merhy',
    phone: '+5519992263799',
    contato: 'WhatsApp público no site: +55 (19) 99226-3799; Instagram @drakemlemerhy',
    site: 'https://drakemlemerhy.wixsite.com/drakemlemerhy',
    mapsQuery: 'Dra Kemle Merhy Fisioterapia Campinas Paulínia',
    motivo: 'Fisioterapeuta neurofuncional/geriátrica com CREFITO e WhatsApp, mas site Wix com URL improvisada.',
    diagnostico: 'Site tem boa oferta, mas domínio Wix e blocos longos reduzem autoridade; redesign pode sintetizar domiciliar, neurofuncional, geriatria e CTA.',
    conteudo: 'Site informa Dra. Kemle Merhy, CREFITO 3/321573-F, fisioterapia neurofuncional geriátrica em Campinas e Paulínia, atendimento domiciliar individualizado, formação PUC-Campinas, especializações pelo Albert Einstein e PUC-Campinas, mestrado em Neurociências pela Unicamp.',
    servicos: 'Fisioterapia neurofuncional; fisioterapia geriátrica; atendimento domiciliar; prevenção de quedas; reabilitação para Parkinson, AVC e demências.',
    prova: 'CREFITO 3/321573-F, especializações e mestrado publicados no site.',
    identidade: 'Wix moderno, mas ainda dependente de domínio improvisado e textos longos.',
    imagens: 'Imagens do site e identidade clínica podem ser aproveitadas.',
  },
  {
    nicho: 'Nutricionista',
    regiao: 'Curitiba - PR',
    nome: 'Adriana Sbragia',
    phone: '+5541988244886',
    contato: 'Telefone/WhatsApp público no site: (41) 3274-1517 / (41) 98824-4886; drisbragia@hotmail.com',
    site: 'https://drisbragia.wixsite.com/nutricionista',
    mapsQuery: 'Adriana Sbragia Nutricionista Curitiba',
    motivo: 'Nutricionista com CRN, WhatsApp e serviços reais, mas site Wix com texto de template ainda visível.',
    diagnostico: 'Página exibe banner Wix, depoimento placeholder e texto “ESCREVE ALGO LEGAL AI”, o que cria oportunidade clara de redesign.',
    conteudo: 'Site informa Adriana Sbragia nutricionista, formada em nutrição pela FAPAR, CRN Paraná 15571, pós em Metabolismo e Emagrecimento em andamento, atendimentos clínicos, possível atendimento infantil em escolas e creches, endereço Av. Nossa Senhora Aparecida 1383, Seminário, Curitiba.',
    servicos: 'Perda de peso; nutrição esportiva; prevenção de doenças; atendimento clínico; nutrição infantil em escolas e creches.',
    prova: 'CRN 15571, formação e depoimentos/placeholder visíveis no site.',
    identidade: 'Wix antigo, imagens pessoais e textos de template não removidos.',
    imagens: 'Fotos do site e identidade atual podem orientar uma versão corrigida.',
  },
  {
    nicho: 'Nutricionista',
    regiao: 'Niterói / São Gonçalo - RJ',
    nome: 'Ana Carla Lopes',
    phone: '+5521985854733',
    contato: 'WhatsApp público no site: (21) 9 8585-4733; anacarlalopesnutri@gmail.com',
    site: 'https://anacarlalopesnutri.wixsite.com/website',
    mapsQuery: 'Ana Carla Lopes Nutricionista Niterói São Gonçalo',
    motivo: 'Nutricionista com WhatsApp e conteúdo real de consulta, mas site Wix antigo e CTA pouco refinado.',
    diagnostico: 'Site Wix com texto longo sobre consulta, perguntas e CTA final; redesign pode reduzir rolagem e destacar bioimpedância, plano e WhatsApp.',
    conteudo: 'Site informa Ana Carla Lopes Nutricionista, consumo alimentar equilibrado, organização da rotina, primeira consulta de 1h com avaliação antropométrica por bioimpedância, fita métrica e adipômetro, plano alimentar em até 3 dias, suporte por WhatsApp, endereços em Icaraí e São Gonçalo.',
    servicos: 'Consulta nutricional; avaliação antropométrica; bioimpedância; plano alimentar; suporte por WhatsApp; acompanhamento.',
    prova: 'Descrição detalhada de método de atendimento e contato público no site.',
    identidade: 'Wix antigo, texto extenso e imagens simples.',
    imagens: 'Ícones/imagens do site podem ser aproveitados.',
  },
  {
    nicho: 'Terapeuta integrativa / Massoterapeuta',
    regiao: 'São Paulo - SP',
    nome: 'Lígia Castro',
    phone: '+5511940616214',
    contato: 'WhatsApp público no site: (11) 94061-6214; mlcastro.ligia@gmail.com',
    site: 'https://mlcastroligia.wixsite.com/ligiacastro',
    mapsQuery: 'Lígia Castro terapeuta integrativa São Paulo São Mateus',
    motivo: 'Terapeuta integrativa corporal com WhatsApp e serviços claros, mas site Wix com domínio improvisado.',
    diagnostico: 'Site simples, com oferta boa porém pouco premium; redesign pode organizar terapias, formação, endereço e WhatsApp em experiência mais confiável.',
    conteudo: 'Site informa Lígia Castro, terapeuta integrativa corporal com mais de 5 anos de experiência, atendimento em São Paulo com acupuntura, shiatsu, massagem terapêutica, ventosas e florais de Bach, formação em Terapias Integrativas e Complementares, especializações em psicoterapia corporal e pós-graduação em Acupuntura pela EBRAMEC.',
    servicos: 'Acupuntura; shiatsu; massagem terapêutica; ventosas; florais de Bach; terapias integrativas.',
    prova: 'Mais de 5 anos de experiência e formações publicadas no site.',
    identidade: 'Wix simples, acolhedor, com imagens de WhatsApp/Instagram.',
    imagens: 'Imagens do site podem orientar uma estética terapêutica mais profissional.',
  },
  {
    nicho: 'Massoterapeuta',
    regiao: 'São Paulo - SP',
    nome: 'Fátima Olivieri',
    phone: '+5511972562459',
    contato: 'Telefone/WhatsApp público no site: (11) 97256-2459',
    site: 'https://fatimaolivieri.wixsite.com/massoterapeuta',
    mapsQuery: 'Fátima Olivieri Massoterapeuta São Paulo Higienópolis',
    motivo: 'Massoterapeuta individual com WhatsApp e serviço claro, mas site Wix simples com pouca diferenciação.',
    diagnostico: 'Página tem oferta e endereço, mas visual pouco premium e baixa hierarquia de benefícios; redesign pode vender experiência de 120 minutos e WhatsApp.',
    conteudo: 'Site informa Massoterapeuta Fátima Olivieri, sessão de 120 minutos personalizada no corpo inteiro incluindo rosto, alívio de dores musculares, tensões, inchaço, relaxamento, alongamento e mobilidade, endereço Rua Itacolomi 333, Higienópolis, São Paulo, telefone WhatsApp.',
    servicos: 'Massagem personalizada; alívio de dores musculares; relaxamento; alongamento; mobilidade; atendimento em Higienópolis.',
    prova: 'Serviço detalhado, endereço e WhatsApp publicados no site.',
    identidade: 'Wix simples, foco em massoterapia e bem-estar.',
    imagens: 'Imagens do site podem ser usadas como referência para uma página mais premium.',
  },
];

function firstName(name) {
  return name.split(' ')[0].replace(/[^\p{L}]/gu, '');
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function mapsUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function localSearchUrl(query) {
  return `https://www.google.com/search?tbm=lcl&q=${encodeURIComponent(query)}`;
}

function csvEscape(value) {
  const text = value == null ? '' : String(value);
  return /[",\n\r;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function rowFor(lead, index) {
  const slug = slugify(`${lead.nome}-${lead.nicho}-${lead.regiao}`);
  const desktop = path.join(printDir, `${slug}-desktop.png`);
  const mobile = path.join(printDir, `${slug}-mobile.png`);
  const maps = path.join(printDir, `${slug}-maps.png`);
  return {
    data: date,
    rank: String(index + 1),
    nicho: lead.nicho,
    'região': lead.regiao,
    nome: lead.nome,
    nota: 'não verificado',
    avaliações: 'não verificado',
    contato: lead.contato,
    'WhatsApp/telefone normalizado': lead.phone,
    'site atual': lead.site,
    'link Maps': mapsUrl(lead.mapsQuery),
    'motivo da abordagem': lead.motivo,
    'diagnóstico do site atual': lead.diagnostico,
    'conteúdo real extraído': lead.conteudo,
    'serviços reais identificados': lead.servicos,
    'prova social real': lead.prova,
    'identidade visual observada': lead.identidade,
    'imagens/logo aproveitáveis': lead.imagens,
    'slug sugerido': slug,
    'status redesign': 'Aguardando redesign individual',
    'URL curta gerada': '',
    'print Maps': maps,
    'print site atual desktop': desktop,
    'print site atual mobile': mobile,
    'link wa.me preliminar': `https://wa.me/${lead.phone.replace(/\D/g, '')}`,
    status: 'LEAD_QUALIFICADO_AGUARDANDO_REDESIGN_INDIVIDUAL',
    observacoes: 'Sem envio automático. Evidência feminina por nome/identificação pública no site; nota/avaliações só entram após verificação individual no Maps.',
    'Bloco 1 (Link)': `Olá! Tudo bem?\n\nAqui é o Leonardo Brasil. Encontrei o seu site e preparei, sem compromisso, uma nova versão com visual mais moderno e pronta para celular.\n\nQuer que eu te envie o link para ver como ficou?\n\nMe envie uma mensagem no WhatsApp 51 99256-8861 que eu te mando o link:\nhttps://wa.me/5551992568861\n\nRascunho operacional para ${firstName(lead.nome)}: quando houver redesign individual, usar [INSERIR_LINK_DO_REDESIGN_APOS_CRIACAO].`,
    'Bloco 2 (Proposta)': `${firstName(lead.nome)}, resumindo: eu transformaria o site atual em uma página mais moderna, clara e focada em agendamentos pelo WhatsApp, preservando os dados reais já publicados.\n\nValor único: R$497 pelo redesign.\nHospedagem/manutenção: R$37,90 por mês.`,
    'Toque 1 (2 dias)': touch1(lead.nome),
    'Toque 2 (5 dias)': touch2(lead.nome),
    'Toque 3 (10 dias)': touch3(lead.nome),
    __screens: { desktop, mobile, maps, slug, site: lead.site, mapEvidenceUrl: localSearchUrl(lead.mapsQuery) },
  };
}

async function screenshot(browser, url, file, viewport) {
  const page = await browser.newPage();
  try {
    await page.setViewport(viewport);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await page.screenshot({ path: file, fullPage: false });
    return true;
  } catch (error) {
    await fs.writeFile(file.replace(/\.png$/, '.txt'), `${url}\n${error.stack || error.message}\n`, 'utf8');
    return false;
  } finally {
    await page.close().catch(() => {});
  }
}

async function main() {
  await fs.mkdir(printDir, { recursive: true });
  const rows = leads.map(rowFor);
  const cleanRows = rows.map(({ __screens, ...row }) => row);
  const csv = [columns.join(';'), ...cleanRows.map((row) => columns.map((col) => csvEscape(row[col])).join(';'))].join('\n');
  await fs.writeFile(path.join(outDir, 'leads-qualificados-2026-07-23.csv'), csv, 'utf8');
  await fs.writeFile(path.join(outDir, 'qualification-capture.json'), JSON.stringify({ generatedAt: new Date().toISOString(), columns, rows: cleanRows }, null, 2), 'utf8');

  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: null });
  const failures = [];
  for (const row of rows) {
    const okDesktop = await screenshot(browser, row.__screens.site, row.__screens.desktop, { width: 1366, height: 900, deviceScaleFactor: 1 });
    const okMobile = await screenshot(browser, row.__screens.site, row.__screens.mobile, { width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });
    const okMaps = await screenshot(browser, row.__screens.mapEvidenceUrl, row.__screens.maps, { width: 1366, height: 900, deviceScaleFactor: 1 });
    if (!okDesktop || !okMobile || !okMaps) {
      failures.push({ slug: row.__screens.slug, okDesktop, okMobile, okMaps });
    }
    console.log(`${row.rank}/30 ${row.nome}: desktop=${okDesktop} mobile=${okMobile} maps=${okMaps}`);
  }
  await browser.close();
  await fs.writeFile(path.join(outDir, 'screenshot-failures.json'), JSON.stringify(failures, null, 2), 'utf8');
  console.log(JSON.stringify({ outDir, csv: path.join(outDir, 'leads-qualificados-2026-07-23.csv'), json: path.join(outDir, 'qualification-capture.json'), failures }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
