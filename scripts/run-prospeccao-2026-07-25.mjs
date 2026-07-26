import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const date = '2026-07-25';
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
  'observacoes',
  'Bloco 1 (Link)',
  'Bloco 2 (Proposta)',
  'Toque 1 (2 dias)',
  'Toque 2 (5 dias)',
  'Toque 3 (10 dias)',
];

const leads = [
  {
    nicho: 'Psicologa',
    regiao: 'Rio de Janeiro - RJ',
    nome: 'Carmen De Jesus Martins',
    phone: '+5521988555917',
    contato: 'WhatsApp publico no site: 55 (21) 98855-5917; carmendejesusmartins@gmail.com',
    site: 'https://carmendejesusmarti.wixsite.com/psicologa',
    mapsQuery: 'Carmen De Jesus Martins psicologa Rio de Janeiro',
    motivo: 'Psicologa com CRP, WhatsApp e conteudo real, mas site Wix com banner do construtor e repeticao de blocos.',
    diagnostico: 'Site Wix longo, com chamadas de WhatsApp repetidas, pouca hierarquia e layout simples; redesign pode destacar CRP, experiencia, servicos e agendamento.',
    conteudo: 'Site informa Carmen De Jesus Martins, psicologa Rio de Janeiro, CRP 05/15.858, atua no municipio de Mangaratiba desde 2005, experiencia em clinicas e consultorios particulares, psicologia analitica/junguiana, perita psicologa no TJRJ, e-mail e WhatsApp.',
    servicos: 'Psicoterapia individual adulto; psicoterapia de grupo ou casal; orientacao a pais; terapia familiar; acompanhamento terapeutico conforme site/Doctoralia.',
    prova: 'Doctoralia exibe 7 opinioes e media 5 estrelas; site exibe CRP e experiencia publica.',
    identidade: 'Wix antigo, galeria simples, textos longos e imagens pessoais.',
    imagens: 'Fotos da galeria e identidade atual podem orientar o redesign.',
  },
  {
    nicho: 'Psicologa',
    regiao: 'Curitiba - PR',
    nome: 'Beatriz Muller Rauta',
    phone: '+5541992051194',
    contato: 'WhatsApp publico no site: (41) 99205-1194; Instagram @psi.beatrizrauta',
    site: 'https://beatrizmrauta.wixsite.com/psicologa',
    mapsQuery: 'Beatriz Muller Rauta psicologa Curitiba',
    motivo: 'Psicologa clinica com CRP e WhatsApp, mas site Wix simples e com estrutura visual basica.',
    diagnostico: 'Pagina curta, dominio Wix, CTA pouco destacado e baixa prova visual de autoridade; redesign pode reforcar abordagem junguiana, publico e agendamento.',
    conteudo: 'Site informa Beatriz Muller Rauta, psicologa clinica CRP 08/35506, orientacao junguiana, formada pela PUCPR, atendimento de adultos e idosos online e presencial em Curitiba.',
    servicos: 'Psicoterapia para adultos; psicoterapia para idosos; atendimento online e presencial.',
    prova: 'CRP 08/35506 e formacao PUCPR publicados no site.',
    identidade: 'Wix simples, visual limpo e poucos elementos de marca.',
    imagens: 'Fotos/imagens do site podem orientar a versao futura.',
  },
  {
    nicho: 'Psicologa',
    regiao: 'Florianopolis / Sao Jose - SC',
    nome: 'Bruna L. Kluge',
    phone: '+5548998452612',
    contato: 'Telefone/WhatsApp publico no site: +55 (48) 9 9845-2612; psibrunakluge@gmail.com',
    site: 'https://psibrunakluge.wixsite.com/website',
    mapsQuery: 'Bruna L Kluge psicologa Sao Jose SC',
    motivo: 'Psicologa clinica com CRP e WhatsApp, mas a pagina Wix ainda mostra banner do construtor e estrutura de template.',
    diagnostico: 'Site Wix com textos longos e CTA pouco refinado; redesign pode enfatizar atendimento para mulheres, Gestalt e prova social.',
    conteudo: 'Site informa Bruna L. Kluge, psicologa clinica CRP 12/20491, Gestalt Terapia, mais de 5 anos de experiencia, atendimento individual para adultos presencial e online, clinica em Sao Jose/SC.',
    servicos: 'Psicoterapia individual para adultos; atendimento presencial e remoto; Gestalt Terapia.',
    prova: 'Site proprio novo menciona opinioes de pacientes; pagina Wix publica CRP e contato direto.',
    identidade: 'Wix com fotos pessoais, tons claros e linguagem acolhedora.',
    imagens: 'Fotos da profissional e imagens do site podem ser reaproveitadas.',
  },
  {
    nicho: 'Psicologa',
    regiao: 'Rio de Janeiro - RJ',
    nome: 'Luana Paula Cavalcanti Paris de Carvalho',
    phone: '+5521992279007',
    contato: 'WhatsApp publico no site: (21) 99227-9007; luanacavalcantipsi@gmail.com',
    site: 'https://luanapaulacavalcan.wixsite.com/psicologa',
    mapsQuery: 'Luana Paula Cavalcanti psicologa Rio de Janeiro',
    motivo: 'Psicologa com CRP, WhatsApp e servicos claros, mas site Wix antigo com CTA simples.',
    diagnostico: 'Layout datado, texto generico e pouco foco em conversao; redesign pode organizar publico, locais e WhatsApp.',
    conteudo: 'Site informa Luana Paula Cavalcanti Paris de Carvalho, CRP 05/55438, psicoterapia individual, atendimento a todas as faixas etarias, domiciliar, Bonsucesso e Centro/RJ, WhatsApp e e-mail.',
    servicos: 'Psicoterapia individual; atendimento a todas as faixas etarias; atendimento domiciliar.',
    prova: 'CRP 05/55438 e canais publicos de contato no site.',
    identidade: 'Wix antigo, imagens genericas e estrutura simples.',
    imagens: 'Imagens do site e foto profissional podem orientar a identidade.',
  },
  {
    nicho: 'Psicologa',
    regiao: 'Rio de Janeiro - RJ',
    nome: 'Simone Santos',
    phone: '+552132862358',
    contato: 'WhatsApp publico no site: (21) 3286-2358; fesspsicologia@gmail.com',
    site: 'https://fesspsicologia.wixsite.com/psisimonesantos',
    mapsQuery: 'Simone Santos psicologa Tijuca Rio de Janeiro',
    motivo: 'Psicologa com 30 anos de experiencia, CRP e WhatsApp, mas site Wix de 2020 com visual simples.',
    diagnostico: 'Pagina curta, dominio Wix, CTA pouco destacado e repeticao de informacoes; redesign pode destacar Gestalt, servicos e experiencia.',
    conteudo: 'Site informa Psicologa Simone Santos CRP 05/21435, formada em 1992, Gestalt Terapia, consultas individual, casal e familia, atendimento presencial e online, Tijuca/RJ.',
    servicos: 'Terapia individual; terapia de casal; terapia familiar; terapia em grupo.',
    prova: 'Site menciona 30 anos de experiencia profissional e CRP 05/21435.',
    identidade: 'Wix simples, imagem pessoal e texto institucional.',
    imagens: 'Foto da profissional e elementos do site podem ser aproveitados.',
  },
  {
    nicho: 'Psicologa',
    regiao: 'Rio de Janeiro - RJ',
    nome: 'Leticia Liborio Paulo',
    phone: '+5521992092061',
    contato: 'Telefone/WhatsApp publico no site: (21) 99209-2061; leticialiborio4@gmail.com',
    site: 'https://leticialiborio4.wixsite.com/leticialppsi',
    mapsQuery: 'Leticia Liborio Paulo psicologa Rio de Janeiro',
    motivo: 'Psicologa TCC com CRP e WhatsApp, mas site Wix com banner do construtor e layout de template.',
    diagnostico: 'Pagina simples com boa historia pessoal, mas CTA e especialidades ficam dispersos; redesign pode destacar TCC, publico e agendamento.',
    conteudo: 'Site informa Leticia Liborio Paulo, psicologa TCC CRP 05/69771, formada desde 2020, atende adolescentes e adultos online, presencial na Tijuca e Copacabana, pos-graduanda em Neuropsicologia.',
    servicos: 'Psicoterapia para adolescentes e adultos; TCC; atendimento online e presencial.',
    prova: 'CRP 05/69771 e formacao em TCC publicados no site.',
    identidade: 'Wix com fotos pessoais, navegacao simples e identidade leve.',
    imagens: 'Fotos do site podem orientar a pagina futura.',
  },
  {
    nicho: 'Psicologa',
    regiao: 'Sao Paulo - SP',
    nome: 'Flavia Bancher',
    phone: '+5511993535868',
    contato: 'Tel/WhatsApp publico no site: (11) 99353-5868; flavban@gmail.com',
    site: 'https://flavban.wixsite.com/psicologia',
    mapsQuery: 'Flavia Bancher psicologa Sao Paulo',
    motivo: 'Psicologa com CRP e WhatsApp, mas site Wix de 2018 com estrutura visual datada.',
    diagnostico: 'Site com dominio Wix, CTA simples e baixa hierarquia; redesign pode mostrar atendimento online/presencial e agendamento de forma mais clara.',
    conteudo: 'Site informa Flavia Bancher, CRP 06/137783, atendimento online e presencial proximo ao Metro Sumare e Jardim Sao Paulo, contato por WhatsApp e e-mail.',
    servicos: 'Psicoterapia; consulta psicologica online e presencial.',
    prova: 'CRP 06/137783 e canais publicos de contato publicados no site.',
    identidade: 'Wix antigo, design simples e pouca identidade visual.',
    imagens: 'Elementos do site podem ser usados como base.',
  },
  {
    nicho: 'Psicologa',
    regiao: 'Rio de Janeiro - RJ',
    nome: 'Mariana Ferrari',
    phone: '+5521965570099',
    contato: 'Celular/WhatsApp publico no site: (21) 96557-0099; psicologaferrari@gmail.com',
    site: 'https://psicologaferrari.wixsite.com/marianaferrari',
    mapsQuery: 'Mariana Ferrari psicologa Rio de Janeiro',
    motivo: 'Psicologa clinica com CRP, WhatsApp e conteudo de especialidades, mas site Wix antigo.',
    diagnostico: 'Layout datado, menus repetidos e texto longo; redesign pode destacar transtornos alimentares, bariatrica, TCC e WhatsApp.',
    conteudo: 'Site informa Mariana Ferrari, CRP 05/29679, psicologa clinica, formacao em TCC, Terapia do Esquema, TCC para criancas e adolescentes, dependencia quimica, transtornos alimentares e avaliacao psicologica.',
    servicos: 'Psicoterapia; transtornos alimentares; gastroplastia e avaliacao psicologica; TCC; terapia de casal e familia.',
    prova: 'CRP 05/29679 e formacoes/especialidades publicadas no site.',
    identidade: 'Wix antigo, fotos pessoais, menus longos e visual simples.',
    imagens: 'Fotos de perfil e imagens originais podem orientar o redesign.',
  },
  {
    nicho: 'Psicologa / Psicanalista',
    regiao: 'Sao Paulo - SP',
    nome: 'Manuela Pereira da Silva',
    phone: '+5511981236263',
    contato: 'WhatsApp publico no site: (11) 98123-6263',
    site: 'https://psicanaliseeprosa.wixsite.com/psicologamanuela',
    mapsQuery: 'Manuela Pereira da Silva psicologa psicanalise Sao Paulo',
    motivo: 'Psicologa e praticante da psicanalise com WhatsApp, mas site Wix com URL improvisada.',
    diagnostico: 'Pagina Wix simples e de baixa sofisticacao; redesign pode reforcar consultorio, CRP e demandas atendidas.',
    conteudo: 'Site informa Manuela Pereira da Silva, psicologa e praticante da Psicanalise, atua em Sao Paulo desde 2012, CRP 06/107131, atende presencialmente e online demandas como depressao, traumas, luto, psicossomatica e doencas cronicas.',
    servicos: 'Psicologia e psicanalise; atendimento online e presencial; demandas de depressao, traumas, luto e psicossomatica.',
    prova: 'CRP 06/107131 e historico desde 2012 publicados no site.',
    identidade: 'Wix com visual simples e linguagem de consultorio.',
    imagens: 'Imagem/identidade do site pode ser aproveitada.',
  },
  {
    nicho: 'Psicologa / Psicanalista',
    regiao: 'Sao Paulo - SP',
    nome: 'Ingrid Pol / Thayna Balieiro',
    phone: '+5511999189357',
    contato: 'Celular/WhatsApp publico no site: (11) 99918-9357',
    site: 'https://ingridpolpsi.wixsite.com/psicanalista',
    mapsQuery: 'Ingrid Pol psicologa psicanalista Tatuape Sao Paulo',
    motivo: 'Pagina de psicologia e psicanalise com WhatsApp, mas Wix e visual/texto de blog pouco profissional.',
    diagnostico: 'Conteudo conceitual longo, CTA pouco forte e rodape de template; redesign pode separar oferta, endereco Tatuape e contato.',
    conteudo: 'Site informa psicologa e psicanalista em Sao Paulo, atendimento online ou presencial, Rua Catigua 159 sala 511, Tatuape, telefone celular e WhatsApp.',
    servicos: 'Psicologia; psicanalise; atendimento online e presencial.',
    prova: 'Endereco e WhatsApp publicados no site; presenca feminina no conteudo/assinatura do site.',
    identidade: 'Wix com blog, linguagem explicativa e imagens simples.',
    imagens: 'Imagens do site podem orientar uma pagina mais clara.',
  },
  {
    nicho: 'Psicologa',
    regiao: 'Sao Paulo - SP',
    nome: 'Luiza Harger',
    phone: '+5511984692813',
    contato: 'Telefone/WhatsApp publico no site: (11) 98469-2813',
    site: 'https://luizaharger.wixsite.com/website',
    mapsQuery: 'Luiza Harger psicologa Sao Paulo',
    motivo: 'Psicologa de orientacao psicanalitica com WhatsApp, mas site Wix curto e basico.',
    diagnostico: 'Pagina minimalista com pouca prova visual, CTA simples e baixa autoridade no primeiro scroll; redesign pode organizar formacao, publico e abordagem.',
    conteudo: 'Site informa Luiza Harger, psicologa de orientacao psicanalitica, graduada pela UFSC, especialista em Saude pela PUC Campinas, mestranda pela USP, atendimento para adolescentes, jovens e adultos, online e presencial em Sao Paulo.',
    servicos: 'Psicoterapia de orientacao psicanalitica; atendimento online e presencial; adolescentes, jovens e adultos.',
    prova: 'Formacao UFSC, PUC Campinas e USP informada no site.',
    identidade: 'Wix simples, texto autoral e pouca identidade visual.',
    imagens: 'Elementos do site podem orientar o redesign.',
  },
  {
    nicho: 'Psicanalista',
    regiao: 'Sao Paulo / Campinas - SP',
    nome: 'Gloria Gomes',
    phone: '+5511987034354',
    contato: 'WhatsApp publico no site: (11) 98703-4354; TSL: (11) 94043-7730',
    site: 'https://gloriagomespsic.wixsite.com/meusite',
    mapsQuery: 'Gloria Gomes psicanalista Sao Paulo Campinas',
    motivo: 'Psicanalista com central de WhatsApp, mas site Wix com rodape de autoria e estrutura de template.',
    diagnostico: 'Pagina com imagens e texto simples, CTA repetido e baixa clareza de servicos; redesign pode destacar atendimento, regiao e formacao.',
    conteudo: 'Site informa Gloria Gomes Psicanalista, clinica de psicanalise, agendamento por WhatsApp para regiao de Campinas e SP, TSL Treinamentos Profissionais.',
    servicos: 'Psicanalise clinica; atendimento por agendamento; treinamentos profissionais.',
    prova: 'Telefone central e especialidade publicados no site.',
    identidade: 'Wix simples, imagens pessoais e visual institucional basico.',
    imagens: 'Fotos do site podem ser reaproveitadas.',
  },
  {
    nicho: 'Psicologa / Psicanalista',
    regiao: 'Curitiba - PR',
    nome: 'Simone Marchesini',
    phone: '+5541991325999',
    contato: 'Telefone publico no site: (41) 99132-5999; simonedallmarc@yahoo.com',
    site: 'https://simonemarchesini.wixsite.com/simonemarchesini/quem-sou-simone-marchesii',
    mapsQuery: 'Simone Marchesini psicologa Curitiba',
    motivo: 'Psicologa mestre com contato direto, mas site Wix antigo e URL de pagina interna pouco profissional.',
    diagnostico: 'URL longa, visual datado e texto em pagina interna; redesign pode destacar especialidade, endereco e WhatsApp.',
    conteudo: 'Site informa Simone Marchesini, CRP 08/04760, psicologa mestre em Psicologia, atendimento em Curitiba, Rua Bruno Filgueira 369 sala 1103, telefone e e-mail.',
    servicos: 'Psicologia clinica; atendimento psicologico; conteudo sobre comer meditativo e bariatrica.',
    prova: 'CRP 08/04760 e mestre em Psicologia informados no site.',
    identidade: 'Wix antigo com imagens de fundo e hierarquia fraca.',
    imagens: 'Imagens do site podem orientar o redesign.',
  },
  {
    nicho: 'Psicologa',
    regiao: 'Sorocaba / Votorantim - SP',
    nome: 'Janaina Cardozo de Souza',
    phone: '+5515997874527',
    contato: 'Celular publico no site: (15) 99787-4527; janaina.cardozo@outlook.com',
    site: 'https://janasouza94.wixsite.com/janainacardozo',
    mapsQuery: 'Janaina Cardozo de Souza psicologa Sorocaba Votorantim',
    motivo: 'Psicologa com CRP e contato direto, mas site Wix simples com imagens de WhatsApp e layout basico.',
    diagnostico: 'Conteudo bom sobre psicanalise e plantao psicologico, mas CTA e visual sao simples; redesign pode organizar servicos e contato.',
    conteudo: 'Site informa Janaina Cardozo de Souza, psicologa CRP 06/166185, referencial psicanalitico, atendimento infantil, jovem e adulto, graduada em Psicologia Clinica pela Universidade Paulista de Sorocaba, pos-graduanda em Psicologia Breve Operacionalizada.',
    servicos: 'Psicoterapia; plantao psicologico; atendimento em Votorantim e Sorocaba.',
    prova: 'CRP 06/166185 e formacao publicadas no site.',
    identidade: 'Wix antigo, texto institucional e poucos elementos visuais.',
    imagens: 'Imagem de contato e elementos do site podem ser aproveitados.',
  },
  {
    nicho: 'Psicologa',
    regiao: 'Sao Jose dos Campos - SP',
    nome: 'Rayane Melo de Brito',
    phone: '+5511964860629',
    contato: 'Telefone/WhatsApp publico no site: (11) 96486-0629; rayane.melo05@icloud.com',
    site: 'https://rayanemelo05.wixsite.com/psicologa',
    mapsQuery: 'Rayane Melo de Brito psicologa Sao Jose dos Campos',
    motivo: 'Psicologa clinica com CRP e WhatsApp, mas site Wix de estrutura simples.',
    diagnostico: 'Pagina tem boa mensagem, mas pouca prova social e CTA simples; redesign pode destacar ansiedade, adolescentes/adultos e endereco.',
    conteudo: 'Site informa Rayane Melo de Brito, psicologa clinica CRP 06/187620, atendimento online e presencial para adolescentes e adultos, endereco Av. Dr. Nelson d Avila, 1837, Sao Jose dos Campos.',
    servicos: 'Psicoterapia online e presencial; atendimento para adolescentes e adultos.',
    prova: 'CRP 06/187620, endereco e telefone publicados no site.',
    identidade: 'Wix limpo, com textos curtos e imagem simples.',
    imagens: 'Imagens e estrutura do site podem orientar o redesign.',
  },
  {
    nicho: 'Psicologa',
    regiao: 'Sao Jose dos Campos - SP',
    nome: 'Vanessa L. Herman',
    phone: '+5512978133170',
    contato: 'Celular/WhatsApp publico no site: (12) 97813-3170; contato.vanessapsicologa@gmail.com',
    site: 'https://contatovanessapsic.wixsite.com/psicologa',
    mapsQuery: 'Vanessa L Herman psicologa Sao Jose dos Campos',
    motivo: 'Psicologa com CRP e WhatsApp, mas site Wix com texto longo e SEO repetitivo.',
    diagnostico: 'Pagina muito textual, com repeticoes de termos e CTA diluido; redesign pode trazer clareza e confianca para TCC em SJC.',
    conteudo: 'Site informa Vanessa L. Herman, psicologa clinica CRP 06/208306, pos-graduanda em TCC, especializacoes em Educacao Especial e atuacao com criancas no espectro autista, atendimento presencial no Jardim Aquarius e online.',
    servicos: 'Psicoterapia TCC; atendimento online e presencial; adultos, adolescentes e criancas; suporte a demandas emocionais.',
    prova: 'CRP 06/208306 e endereco profissional publicados no site.',
    identidade: 'Wix com tons verdes, fotos e textos longos.',
    imagens: 'Imagem de fundo e identidade atual podem ser reaproveitadas.',
  },
  {
    nicho: 'Psicologa',
    regiao: 'Belo Horizonte - MG',
    nome: 'Angelica Silva Moreira',
    phone: '+5537998250821',
    contato: 'Telefone publico no site: (37) 99825-0821; Instagram/WhatsApp no rodape',
    site: 'https://psiangelsmoreira.wixsite.com/psicologaonline',
    mapsQuery: 'Angelica Silva Moreira psicologa Minas Gerais',
    motivo: 'Psicologa com CRP e telefone, mas site Wix com rodape padrao e pagina curta.',
    diagnostico: 'Site simples, pouco conteudo e CTA basico; redesign pode destacar atendimento online, depoimentos e canais.',
    conteudo: 'Site informa Angelica Silva Moreira, psicologa clinica CRP 07/74077, Itauna/MG, telefone, WhatsApp e Instagram.',
    servicos: 'Psicologia clinica; terapia online; atendimento psicologico.',
    prova: 'CRP 07/74077 e depoimentos citados no site.',
    identidade: 'Wix simples, rodape padrao e identidade leve.',
    imagens: 'Imagens do site podem orientar a pagina futura.',
  },
  {
    nicho: 'Nutricionista',
    regiao: 'Sao Paulo - SP',
    nome: 'Thainara Santos',
    phone: '+5511920083125',
    contato: 'Telefone publico no site: (11) 92008-3125; nutrithainarasantos@gmail.com nao exibido, site traz contato',
    site: 'https://nutrithainarasantos.wixsite.com/site',
    mapsQuery: 'Thainara Santos nutricionista Sao Paulo Pinheiros',
    motivo: 'Nutricionista com CRN e contato, mas site Wix com visual de blog simples e CTA pouco direto.',
    diagnostico: 'Site Wix com textos de blog e estrutura antiga; redesign pode destacar nutricao gentil, transtornos alimentares e agendamento.',
    conteudo: 'Site informa Thainara Santos, nutricionista CRN-3 61948, formada pela USP, aprimorada em Transtornos Alimentares pelo AMBULIM, pos-graduacao em nutricao pediatrica, endereco Rua Amalia de Noronha, 151, Pinheiros, Sao Paulo.',
    servicos: 'Atendimento nutricional; nutricao gentil e humanizada; transtornos alimentares; nutricao pediatrica em formacao.',
    prova: 'CRN-3 61948, USP e AMBULIM publicados no site.',
    identidade: 'Wix com logo simples, imagens de alimentacao e textos de blog.',
    imagens: 'Logo e fotos do site podem ser reaproveitados.',
  },
  {
    nicho: 'Nutricionista',
    regiao: 'Sao Paulo - SP',
    nome: 'Solange de Paula Torres',
    phone: '+5511978782691',
    contato: 'WhatsApp/telefone publico no site: (11) 97878-2691; soltorresnutri@gmail.com',
    site: 'https://soltorresnutri.wixsite.com/oqueeissonutri',
    mapsQuery: 'Solange de Paula Torres nutricionista Sao Paulo',
    motivo: 'Nutricionista com CRN e WhatsApp, mas site Wix/blog com dominio improvisado.',
    diagnostico: 'Pagina parece blog antigo, CTA de WhatsApp fica no rodape e nao ha primeira dobra comercial clara; redesign pode organizar especialidades e contato.',
    conteudo: 'Site informa SOLANGE DE PAULA TORRES, nutricionista CRN 59143, Sao Paulo/SP, e-mail e WhatsApp; blog com temas de diabetes, low FODMAPs e queda de cabelo.',
    servicos: 'Consulta nutricional; conteudo sobre diabetes, estrategia low FODMAPs e orientacao nutricional.',
    prova: 'CRN 59143 e contato publicados no site.',
    identidade: 'Wix/blog, imagens simples e identidade pouco premium.',
    imagens: 'Logo/imagens do blog podem orientar o redesign.',
  },
  {
    nicho: 'Nutricionista',
    regiao: 'Sao Paulo - SP',
    nome: 'Miriam Loiola',
    phone: '+5511986424904',
    contato: 'WhatsApp publico no site: (11) 98642-4904',
    site: 'https://miriamloiola.wixsite.com/nutricionista',
    mapsQuery: 'Miriam Loiola nutricionista Sao Paulo Pinheiros',
    motivo: 'Nutricionista integrativa com CRN e WhatsApp, mas site Wix com conteudo extenso e CTA diluido.',
    diagnostico: 'Site longo, muitos termos tecnicos e visual simples; redesign pode destacar nutricao funcional, Ayurveda e agendamento.',
    conteudo: 'Site informa Miriam Loiola, CRN 24558, nutricionista funcional integrativa e Ayurveda, atende na Amplitude Saude Integrada, Avenida Reboucas 3797, Pinheiros, Sao Paulo, WhatsApp em horario comercial.',
    servicos: 'Nutricao funcional; Ayurveda; esportiva; programas Shamana e Panchakarma; consulta individualizada.',
    prova: 'CRN 24558, endereco e WhatsApp publicados no site.',
    identidade: 'Wix com tons naturais, fotos e conteudo integrativo.',
    imagens: 'Logo e fotos do site podem ser reaproveitados.',
  },
  {
    nicho: 'Nutricionista',
    regiao: 'Curitiba - PR',
    nome: 'Thaisa Stavitzki',
    phone: '+5541991540324',
    contato: 'WhatsApp publico em perfil Instagram: (41) 99154-0324; site traz WhatsApp/Instagram/Facebook/Google Places',
    site: 'https://nutrilavie.wixsite.com/nutrilavie',
    mapsQuery: 'Thaisa Stavitzki Nutrilavie Curitiba',
    motivo: 'Nutricionista com CRN e prova social, mas site Wix antigo e pouco otimizado.',
    diagnostico: 'Site Wix com conteudo visual simples e CTA pouco claro; redesign pode destacar Nutrilavie, nutricao funcional e avaliacoes.',
    conteudo: 'Site informa Thaisa Stavitzki, nutricionista fundadora da Nutrilavie Nutricao Funcional. Doctoralia informa CRN PR 8/3845, endereco Rua Santa Catarina 65 sala 514B, Agua Verde, Curitiba.',
    servicos: 'Consulta nutricionista; teleconsulta; tratamento terapeutico de emagrecimento; nutricao funcional.',
    prova: 'Doctoralia informa 12 opinioes e CRN PR 8/3845; Instagram publica WhatsApp.',
    identidade: 'Wix antigo, imagens de alimentos e identidade Nutrilavie.',
    imagens: 'Imagens do site e identidade Nutrilavie podem orientar o redesign.',
  },
  {
    nicho: 'Fisioterapeuta',
    regiao: 'Sao Paulo / Grande ABC - SP',
    nome: 'Tuane de Sousa',
    phone: '+5511959363262',
    contato: 'Telefone/WhatsApp publico no site: (11) 95936-3262; fisiotuane@hotmail.com',
    site: 'https://fisiotuane.wixsite.com/tuanedesousa',
    mapsQuery: 'Dra Tuane de Sousa fisioterapeuta Santo Andre Sao Paulo',
    motivo: 'Fisioterapeuta com CREFITO e WhatsApp, mas site Wix com muitos menus e visual de template.',
    diagnostico: 'Pagina tem servicos variados, mas navegacao extensa e CTA disperso; redesign pode focar fisioterapia, acupuntura e pilates.',
    conteudo: 'Site informa Dra. Tuane de Sousa, fisioterapeuta CREFITO 3:198493-F, atendimento domiciliar Sao Paulo e Grande ABC, consultorio na Rua Alzira 56, Vila Alzira, Santo Andre, servicos de fisioterapia, acupuntura, pilates, massagem relaxante e aromaterapia.',
    servicos: 'Fisioterapia; acupuntura; acupuntura estetica; pilates; massagem relaxante; aromaterapia.',
    prova: 'CREFITO 3:198493-F e telefone publicados no site.',
    identidade: 'Wix com menus longos, imagens genericas e tom clinico simples.',
    imagens: 'Fotos/imagens do site podem orientar a pagina futura.',
  },
  {
    nicho: 'Fisioterapeuta',
    regiao: 'Sao Paulo - SP',
    nome: 'Andrea Borges',
    phone: '+5511965745290',
    contato: 'Telefones publicos no site: (11) 96574-5290 e (11) 93730-3074; andreaborges162@gmail.com',
    site: 'https://fisio35.wixsite.com/fisioterapia',
    mapsQuery: 'Andrea Borges fisioterapeuta Sao Paulo Freguesia do O',
    motivo: 'Fisioterapeuta com telefone e servicos, mas site Wix datado com excesso de artigos/imagens.',
    diagnostico: 'Pagina longa, visual antigo e CTA de contato no fim; redesign pode destacar fisioterapia, terapias e local.',
    conteudo: 'Site informa Andrea Borges, atendimento em Sao Paulo, Avenida Joao Paulo I 1726, Freguesia do O, e-mail e telefones. Conteudo inclui ventosas terapeuticas, microagulhamento e artigos.',
    servicos: 'Fisioterapia; ventosas terapeuticas; microagulhamento; atendimentos corporais/terapeuticos.',
    prova: 'Endereco, e-mail e telefones publicados no site.',
    identidade: 'Wix antigo, muitas imagens de WhatsApp/artigos e baixa hierarquia.',
    imagens: 'Imagens de artigos e marca do site podem ser reaproveitadas com criterio.',
  },
  {
    nicho: 'Fisioterapeuta',
    regiao: 'Petropolis / Rio de Janeiro - RJ',
    nome: 'Ester Filgueiras',
    phone: '+5524988053035',
    contato: 'Telefone/WhatsApp publico no site: (24) 98805-3035; esterfilgueirasfisioterapia@gmail.com',
    site: 'https://esterfilgueirasfis.wixsite.com/esterfilgueirasfisio',
    mapsQuery: 'Ester Filgueiras fisioterapeuta Petropolis RJ',
    motivo: 'Fisioterapeuta osteopata com CREFITO e WhatsApp, mas site Wix com URL longa e visual antigo.',
    diagnostico: 'Site tem conteudo real, mas visual simples e CTA pouco sofisticado; redesign pode destacar osteopatia, RPG e contato.',
    conteudo: 'Site informa Ester Filgueiras, fisioterapeuta osteopata CREFITO 147914-F, formada desde 2011 pela Universidade Catolica de Petropolis, especialista em Osteopatia pelo COFFITO, Osteopatia Pediatrica, RPG Souchard e Palmilhas Posturais, Av. D. Pedro I 73, Centro, Petropolis.',
    servicos: 'Osteopatia; fisioterapia; RPG Souchard; palmilhas posturais; osteopatia pediatrica.',
    prova: 'CREFITO 147914-F, formacao e endereco publicados no site.',
    identidade: 'Wix antigo, fotos pessoais e visual de consultorio.',
    imagens: 'Fotos e imagens do site podem ser aproveitadas.',
  },
  {
    nicho: 'Fisioterapeuta',
    regiao: 'Vinhedo / Campinas - SP',
    nome: 'Denise Alignani',
    phone: '+5519996445165',
    contato: 'Fone/WhatsApp publico no site: (19) 99644-5165; defisiopilates@gmail.com',
    site: 'https://defisiopilates.wixsite.com/fisio',
    mapsQuery: 'Denise Alignani DeFisio Vinhedo Campinas',
    motivo: 'Fisioterapeuta responsavel com CREFITO e WhatsApp, mas site Wix antigo e pouco premium.',
    diagnostico: 'Pagina com dominio Wix, textos longos e CTA simples; redesign pode destacar USP, RPG, Pilates e atendimento individual.',
    conteudo: 'Site informa DeFisio, responsavel Denise Alignani CREFITO-3 / 52.191-F, graduacao USP, especializacoes em Neurologia, Hospitalar, RPG, MAT Pilates, Pilates Aparelhos e Eletroterapia, Vinhedo Premium Office & Mall.',
    servicos: 'RPG; Pilates solo e aparelhos; cinesioterapia; eletroterapia; fisioterapia individual.',
    prova: 'CREFITO, formacao USP e especializacoes publicados no site.',
    identidade: 'Wix simples, visual de consultorio e textos institucionais.',
    imagens: 'Logo/imagens do site podem orientar o redesign.',
  },
  {
    nicho: 'Fisioterapeuta',
    regiao: 'Curitiba - PR',
    nome: 'Fernanda Amabile Borges',
    phone: '+5541988401120',
    contato: 'Telefone publico no site: (41) 98840-1120; fer.amabile@hotmail.com',
    site: 'https://zielinskisuzana.wixsite.com/equipedesaude',
    mapsQuery: 'Fernanda Amabile Borges fisioterapeuta Curitiba',
    motivo: 'Fisioterapeuta em equipe pequena com CREFITO e telefone, mas site Wix antigo e de baixa autoridade individual.',
    diagnostico: 'Pagina de equipe com conteudo curto, erro de e-mail e visual de template; redesign individual pode destacar formacao, atendimento e contato.',
    conteudo: 'Site informa equipe de saude em Curitiba, especialidades terapia ocupacional, psicologia e fisioterapia; Dra. Fernanda Amabile Borges, CREFITO 8-270840-F, fisioterapeuta, e-mail e telefone.',
    servicos: 'Fisioterapia; atendimento em equipe de saude; especialidades integradas.',
    prova: 'CREFITO 8-270840-F e telefone publicados no site.',
    identidade: 'Wix antigo, fotos pequenas e estrutura de equipe.',
    imagens: 'Foto da profissional e estrutura do site podem ser aproveitadas.',
  },
  {
    nicho: 'Fisioterapeuta',
    regiao: 'Curitiba - PR',
    nome: 'Flavia Zonatto / Espaco Correa',
    phone: '+5541999615269',
    contato: 'WhatsApp publico no site: 041-99961-5269; telefone 041-3085-5266',
    site: 'https://flavianamc.wixsite.com/espaco-correa/sobre',
    mapsQuery: 'Flavia Zonatto Espaco Correa fisioterapia Curitiba',
    motivo: 'Espaco de fisioterapia liderado por profissionais mulheres, mas site Wix antigo e confuso.',
    diagnostico: 'Pagina com historico longo, CREFITOs e enderecos, mas pouca clareza comercial e visual datado; redesign pode organizar Pilates/fisioterapia e WhatsApp.',
    conteudo: 'Site informa Espaco Correa, Curitiba, Flavia Zonatto fisioterapeuta, Luana Andrade fisioterapeuta, cursos de Pilates, auriculoterapia e CREFITOs, matriz na AV Parana 30559, Boa Vista, WhatsApp e telefones.',
    servicos: 'Fisioterapia; Pilates; auriculoterapia; atendimentos em Curitiba.',
    prova: 'CREFITOs e contatos publicados no site.',
    identidade: 'Wix antigo, layout de texto e informacoes de enderecos misturadas.',
    imagens: 'Imagens e dados do site podem orientar a pagina futura.',
  },
  {
    nicho: 'Contadora',
    regiao: 'Sao Paulo - SP',
    nome: 'Fernanda Soares Moreira',
    phone: '+5511982544962',
    contato: 'Telefone/WhatsApp publico no site: (11) 98254-4962; fernanda@fsmcontabil.com.br',
    site: 'https://bacanhim.wixsite.com/fsm-contabil',
    mapsQuery: 'Fernanda Soares Moreira FSM Contabil Sao Paulo',
    motivo: 'Contadora/perita com CRC e WhatsApp, mas site Wix simples com identidade pouco refinada.',
    diagnostico: 'Pagina curta, dominio Wix, CTA generico e poucas secoes; redesign pode destacar pericia, servicos contabeis e contato.',
    conteudo: 'Site informa Fernanda Soares Moreira, Contadora e Perita, CRC 1SP 291.134, FSM Contabil, enderecos em Sao Paulo e Carmo do Rio Claro, e-mail e WhatsApp.',
    servicos: 'Pericia; servicos contabeis; contato por formulario e WhatsApp.',
    prova: 'CRC 1SP 291.134, nome e WhatsApp publicados no site.',
    identidade: 'Wix com logo simples, layout corporativo basico.',
    imagens: 'Logo FSM e imagens do site podem ser reaproveitados.',
  },
  {
    nicho: 'Contadora',
    regiao: 'Curitiba / Almirante Tamandare - PR',
    nome: 'Fabiane Drula',
    phone: '+5541998518264',
    contato: 'WhatsApp publico em dados empresariais: https://wa.me/5541998518264; site tem icones de WhatsApp/redes',
    site: 'https://fabianedrula.wixsite.com/contrate',
    mapsQuery: 'Fabiane Drula contadora Curitiba Almirante Tamandare',
    motivo: 'Contadora especialista em MEI e microempresas com site Wix e prova de CNPJ, mas telefone nao fica claro no site.',
    diagnostico: 'Pagina Wix tem conteudo comercial bom, mas botao de WhatsApp sem numero visivel, texto com erros e visual simples; redesign pode aumentar confianca e conversao.',
    conteudo: 'Site informa Fabiane Drula, contadora pelo CRC PR-078505/O, especialista em MEIs e microempresas, mais de 9 anos no mercado, mais de 60 negocios atendidos, clientes em mais de 5 estados, servicos de abertura de CNPJ, acompanhamento mensal, regularizacao, desenquadramento MEI, consultoria MEI e IR.',
    servicos: 'Abertura de CNPJ; acompanhamento mensal; regularizacao CNPJ/CPF; desenquadramento MEI; consultoria MEI; declaracao de IR.',
    prova: 'CRC PR-078505/O no site; Econodata exibe CNPJ ativo e WhatsApp wa.me.',
    identidade: 'Wix com fotos pessoais, foco em MEI/microempresa e CTAs em secoes.',
    imagens: 'Foto FABIANE150 e identidade do site podem ser reaproveitadas.',
  },
  {
    nicho: 'Massoterapeuta',
    regiao: 'Ourinhos - SP',
    nome: 'Fernanda Crivari',
    phone: '+5514998975208',
    contato: 'Telefone comercial publico: (14) 99897-5208; espacofernandacrivari@gmail.com',
    site: 'https://espacofernandacriv.wixsite.com/espaco-fernanda-criv',
    mapsQuery: 'Fernanda Crivari massoterapeuta Ourinhos',
    motivo: 'Massoterapeuta com site Wix antigo, publico feminino claro e WhatsApp encontrado, mas presenca digital fragmentada.',
    diagnostico: 'O Wix antigo e o site novo coexistem; redesign pode consolidar servicos, prova social e agendamento em uma pagina unica.',
    conteudo: 'Site informa Fernanda Crivari massoterapeuta, trabalha com massagens para publico feminino, servicos de massagem relaxante, escalda pes, reflexologia podal, esfoliacao corporal, drenagem e massagem facial, limpeza de pele, hidrataface e massagem modeladora. Site novo informa endereco Rua Parana 830, Ourinhos, telefone e 64 avaliacoes.',
    servicos: 'Massagem relaxante; escalda pes; reflexologia podal; drenagem; massagem facial; limpeza de pele; cursos de massagem.',
    prova: 'Site novo mostra excelente com base em 64 avaliacoes e depoimentos reais.',
    identidade: 'Wix antigo, imagens de WhatsApp e linguagem acolhedora para mulheres.',
    imagens: 'Fotos e depoimentos do site novo/Wix podem orientar o redesign.',
  },
];

const touch1 = (name) =>
  `Oi, ${firstName(name)}! Passando pra saber se voce chegou a ver o site novo que te mandei.\n\nSe tiver algo que voce mudaria, uma cor, um texto, uma foto, eu ajusto pra ficar do seu jeito.`;
const touch2 = (name) =>
  `Oi, ${firstName(name)}! So pra deixar claro, esse e o trabalho que eu faco: ajudo profissionais como voce a terem um site que traz mais pacientes, clientes ou consultas e passa mais autoridade.\n\nFiz o seu como demonstracao, sem compromisso.\n\nSe fizer sentido, te explico como deixar ele no ar. Quer que eu te mande os detalhes?`;
const touch3 = (name) =>
  `Oi, ${firstName(name)}! Imagino que a correria da agenda tenha falado mais alto, sem problema.\n\nVou deixar o link no ar por mais 24 horas.\n\nSe um dia quiser colocar no ar, e so me chamar que retomo na hora.\n\nSucesso!`;

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
    região: lead.regiao,
    nome: lead.nome,
    nota: 'nao verificado',
    avaliações: 'nao verificado',
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
    observacoes:
      'Sem envio automatico. Evidencia feminina publica por nome/identificacao do site. Nota do Maps ficou como nao verificado quando nao havia leitura confiavel.',
    'Bloco 1 (Link)': `Ola! Tudo bem?\n\nAqui e o Leonardo Brasil. Encontrei o seu site e preparei, sem compromisso, uma nova versao com visual mais moderno e pronta para celular.\n\nQuer que eu te envie o link para ver como ficou?\n\nMe envie uma mensagem no WhatsApp 51 99256-8861 que eu te mando o link:\nhttps://wa.me/5551992568861\n\nRascunho operacional para ${firstName(lead.nome)}: quando houver redesign individual, usar [INSERIR_LINK_DO_REDESIGN_APOS_CRIACAO].`,
    'Bloco 2 (Proposta)': `${firstName(lead.nome)}, resumindo: eu transformaria o site atual em uma pagina mais moderna, clara e focada em agendamentos pelo WhatsApp, preservando os dados reais ja publicados.\n\nValor unico: R$497 pelo redesign.\nHospedagem/manutencao: R$37,90 por mes.`,
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
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 22000 });
    await new Promise((resolve) => setTimeout(resolve, 900));
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
  if (leads.length !== 30) {
    throw new Error(`Expected 30 leads, got ${leads.length}`);
  }
  await fs.mkdir(printDir, { recursive: true });
  const rows = leads.map(rowFor);
  const cleanRows = rows.map(({ __screens, ...row }) => row);
  const csv = [columns.join(';'), ...cleanRows.map((row) => columns.map((col) => csvEscape(row[col])).join(';'))].join('\n');
  await fs.writeFile(path.join(outDir, `leads-qualificados-${date}.csv`), csv, 'utf8');
  await fs.writeFile(
    path.join(outDir, 'qualification-capture.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), columns, rows: cleanRows }, null, 2),
    'utf8',
  );

  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: null });
  const failures = [];
  for (const row of rows) {
    const okDesktop = await screenshot(browser, row.__screens.site, row.__screens.desktop, {
      width: 1366,
      height: 900,
      deviceScaleFactor: 1,
    });
    const okMobile = await screenshot(browser, row.__screens.site, row.__screens.mobile, {
      width: 390,
      height: 844,
      isMobile: true,
      deviceScaleFactor: 2,
    });
    const okMaps = await screenshot(browser, row.__screens.mapEvidenceUrl, row.__screens.maps, {
      width: 1366,
      height: 900,
      deviceScaleFactor: 1,
    });
    if (!okDesktop || !okMobile || !okMaps) {
      failures.push({ slug: row.__screens.slug, okDesktop, okMobile, okMaps });
    }
    console.log(`${row.rank}/30 ${row.nome}: desktop=${okDesktop} mobile=${okMobile} maps=${okMaps}`);
  }
  await browser.close();
  await fs.writeFile(path.join(outDir, 'screenshot-failures.json'), JSON.stringify(failures, null, 2), 'utf8');
  console.log(
    JSON.stringify(
      {
        outDir,
        csv: path.join(outDir, `leads-qualificados-${date}.csv`),
        json: path.join(outDir, 'qualification-capture.json'),
        failures,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
