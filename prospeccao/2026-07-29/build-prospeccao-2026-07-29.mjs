import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const __filename = fileURLToPath(import.meta.url);
const outDir = path.dirname(__filename);
const root = path.resolve(outDir, "..", "..");
const date = "2026-07-29";
const printsDir = path.join(outDir, "prints");

const columns = [
  "data",
  "rank",
  "nicho",
  "regiao",
  "nome",
  "nota",
  "avaliacoes",
  "contato",
  "WhatsApp/telefone normalizado",
  "site atual",
  "link Maps",
  "motivo da abordagem",
  "diagnostico do site atual",
  "conteudo real extraido",
  "servicos reais identificados",
  "prova social real",
  "identidade visual observada",
  "imagens/logo aproveitaveis",
  "slug sugerido",
  "status redesign",
  "URL curta gerada",
  "print Maps",
  "print site atual desktop",
  "print site atual mobile",
  "link wa.me preliminar",
  "status",
  "observacoes",
  "Bloco 1 (Link)",
  "Bloco 2 (Proposta)",
  "Toque 1 (2 dias)",
  "Toque 2 (5 dias)",
  "Toque 3 (10 dias)",
];

const statusValues = [
  "LEAD_QUALIFICADO_AGUARDANDO_REDESIGN_INDIVIDUAL",
  "SEM_SITE_NAO_CONTA",
  "SITE_BOM_DESCARTADO",
  "NICHO_EXCLUIDO_NAO_CONTA",
  "CONTATO_INSUFICIENTE",
  "META_NAO_BATIDA",
];

const candidates = [
  {
    nicho: "Psicologa",
    regiao: "Balneario Camboriu - SC",
    nome: "Debora Bittencourt da Costa Landes",
    phone: "(47) 99959-2610",
    site: "https://psicologadeboralan.wixsite.com/meusite-1",
    contato: "Telefone publico no site: (47) 99959-2610; e-mail psicologadeboralandes@gmail.com.",
    motivo: "Psicologa em Balneario Camboriu, cidade inicial da rotina; site em subdominio Wix simples.",
    diagnostico: "Pagina Wix curta, com formulario basico, pouca hierarquia comercial, sem agenda destacada e identidade visual limitada.",
    conteudo: "Site informa atendimento em Rua Gaturamo, 100, Aririba, Balneario Camboriu; horario de segunda a sexta das 9h as 21h.",
    servicos: "Atendimento psicologico presencial; contato por formulario, e-mail e telefone.",
    prova: "Nome feminino, titulo de psicologa, endereco e telefone publicados no site.",
    identidade: "Wix simples com texto institucional curto e poucos elementos de marca.",
    imagens: "Fotos/elementos do Wix e dados de contato podem orientar redesign.",
  },
  {
    nicho: "Psicanalista",
    regiao: "Itajai - SC",
    nome: "Valeria Maria - VM Psicanalise",
    phone: "(47) 9 9963-6530",
    site: "https://vmpsicanalise.wixsite.com/vmpsicanalise",
    contato: "Tel/Whats publico no site: (47) 9 9963-6530; vmpsicanalise@gmail.com.",
    motivo: "Psicanalista mulher em Itajai, dentro do cluster inicial; site Wix com muito texto e conversao pouco direta.",
    diagnostico: "Site extenso em Wix, textual, com CTA de agendamento pouco priorizado e baixa organizacao visual para mobile.",
    conteudo: "Site apresenta VM Psicanalise, atendimento presencial/online, clinica intercultural para brasileiras e brasileiros no exterior, oficinas e endereco Rua Pedro Ferreira, 155, Centro.",
    servicos: "Atendimento psicanalitico presencial e online; oficina Praticas da escuta.",
    prova: "Pagina declara Valeria Maria como mulher, psicanalista, professora, atriz e mae.",
    identidade: "Uso de imagens pessoais e consultorio, com layout Wix informativo e pouco comercial.",
    imagens: "Foto Valeria VM e imagem de consultorio podem ser aproveitadas.",
  },
  {
    nicho: "Psicologa",
    regiao: "Balneario Camboriu - SC",
    nome: "Sandra Gaya Oliveira de Amorim",
    phone: "(47) 99156-0518",
    site: "https://sites.google.com/view/reservatriodepsis/",
    contato: "WhatsApp publico no site: (47) 99156-0518; e-mail psandragaya53@gmail.com.",
    motivo: "Psicologa mulher em Balneario Camboriu com Google Sites de listagem, fraco para autoridade individual.",
    diagnostico: "Google Sites em formato de repertorio/listagem, sem landing individual, CTA visual ou posicionamento profissional proprio.",
    conteudo: "Entrada informa Sandra Gaya Oliveira de Amorim, CRP 12/03769, TCC, atendimento adulto online e presencial em Balneario Camboriu.",
    servicos: "Terapia Cognitivo-Comportamental para adultos, online e presencial.",
    prova: "CRP 12/03769, mestrado, doutorado, especializacao e contato publicados.",
    identidade: "Google Sites basico, quase sem identidade individual.",
    imagens: "Sem logo individual claro; conteudo e credenciais sao aproveitaveis.",
  },
  {
    nicho: "Psicologa",
    regiao: "Florianopolis - SC",
    nome: "Fernanda Andreassi",
    phone: "(47) 99912-1082",
    site: "https://sites.google.com/view/psicologafernandaandreassi",
    contato: "WhatsApp/ligacao publico no site: (47) 99912-1082.",
    motivo: "Psicologa mulher em Florianopolis com Google Sites simples e oportunidade clara de autoridade visual.",
    diagnostico: "Google Sites basico, com boa informacao tecnica mas pouca sofisticacao visual, CTA e prova social estruturada.",
    conteudo: "Site informa Psicologa Fernanda Andreassi, CRP 12/20897, psicoterapia para jovens, adultos e casais no Centro de Florianopolis e online.",
    servicos: "Psicoterapia presencial e online para jovens, adultos e casais.",
    prova: "CRP 12/20897, formacao em Terapia Relacional Sistemica e experiencia no SUS.",
    identidade: "Google Sites branco, texto direto, poucas camadas visuais.",
    imagens: "Foto profissional e dados de endereco podem orientar redesign.",
  },
  {
    nicho: "Psicologa",
    regiao: "Florianopolis - SC",
    nome: "Isabela Ausem",
    phone: "(48) 98832-3938",
    site: "https://psicologaisabelaau.wixsite.com/psicologaisabela",
    contato: "WhatsApp publico no site: (48) 98832-3938; psicologaisabelaausem@gmail.com.",
    motivo: "Psicologa em Florianopolis com site Wix simples e marca pessoal pouco consolidada.",
    diagnostico: "Subdominio Wix com formulario basico, credito de template no rodape e CTA de agenda pouco destacado.",
    conteudo: "Site informa localizacao Life Medical Tower, Rua Santos Dumont 182, sala 303, Centro de Florianopolis.",
    servicos: "Atendimento psicologico presencial/contato por WhatsApp e e-mail.",
    prova: "Nome feminino, titulo Psicologa Isabela Ausem e contato publico no site.",
    identidade: "Wix minimalista com poucas provas visuais proprietarias.",
    imagens: "Imagens de perfil e icones sociais podem ser aproveitados.",
  },
  {
    nicho: "Psicologa",
    regiao: "Joinville - SC",
    nome: "Valquiria Ferreira",
    phone: "(47) 99979-8592",
    site: "https://psicologavalquiria.wixsite.com/website",
    contato: "Telefone/WhatsApp publicado: (47) 99979-8592 e (47) 98497-0118.",
    motivo: "Psicologa mulher em Joinville, nota comercial favorecida por site Wix antigo e visual datado.",
    diagnostico: "Site Wix antigo, com navegacao simples, imagens datadas e pouca clareza de agendamento em primeira dobra.",
    conteudo: "Site informa Valquiria Goncalves Ferreira Silva, CRP 12/11073, psicologa clinica especialista em Gestalt-terapia.",
    servicos: "Psicologia clinica, Gestalt-terapia, atendimento clinico.",
    prova: "CRP 12/11073, graduacao pela Faculdade Guilherme Guimbala e especializacao CEG-SC.",
    identidade: "Visual antigo com imagens de WhatsApp e elementos leves de consultorio.",
    imagens: "Foto de perfil e imagens existentes podem ser reaproveitadas.",
  },
  {
    nicho: "Psicologa / Psicanalista",
    regiao: "Florianopolis - SC",
    nome: "Julia de Souza Lopes",
    phone: "+55 48 99135-5861",
    site: "https://julialopespsi.wixsite.com/website",
    contato: "Telefone/WhatsApp publico no rodape: +55 48 99135-5861; julialopes.psicologia@gmail.com.",
    motivo: "Psicologa mulher com subdominio Wix e site muito enxuto, bom para landing autoral.",
    diagnostico: "Pagina Wix curta, pouco CTA, pouca prova social e baixa estrutura para explicar metodo/agenda.",
    conteudo: "Site informa Julia de Souza Lopes, Psicologa CRP 12/18154, psicologa e psicanalista com atendimento online.",
    servicos: "Psicologia e psicanalise; atendimento online.",
    prova: "CRP 12/18154, e-mail e telefone publicados.",
    identidade: "Estetica minimalista com poucos elementos de marca.",
    imagens: "Conteudo textual e identidade simples podem guiar redesign.",
  },
  {
    nicho: "Psicologa",
    regiao: "Florianopolis / Sao Jose - SC",
    nome: "Maristela Alves Marinho",
    phone: "(48) 99128-2714",
    site: "https://therapstelalves.wixsite.com/psicoterapia",
    contato: "Telefone/Whats publico no site: (48) 99128-2714; psi.stelalves@gmail.com.",
    motivo: "Psicologa clinica com site Wix antigo, multiplos enderecos e oportunidade de reposicionamento.",
    diagnostico: "Site visualmente datado, muito baseado em texto/listagem, com CTA e especialidades pouco hierarquizados.",
    conteudo: "Site informa Maristela Alves Marinho, CRP 12/17552, abordagem psicanalitica, atendimento em Barreiros/Sao Jose e Centro/Florianopolis.",
    servicos: "Orientacoes psicologicas para adolescentes/adultos; neuropsicologia.",
    prova: "CRP 12/17552, telefone, e-mail e enderecos publicados.",
    identidade: "Wix antigo com icones sociais e imagens pouco integradas.",
    imagens: "Fotos, icones sociais e dados de consultorio podem ser aproveitados.",
  },
  {
    nicho: "Psicologa",
    regiao: "Joinville - SC",
    nome: "Patricia Toniote",
    phone: "+55 47 99949-2375",
    site: "https://patriciatoniote.wixsite.com/patriciatoniote",
    contato: "WhatsApp publico: +55 47 99949-2375; patricia.toniote@gmail.com.",
    motivo: "Psicologa mulher em Joinville com site Wix simples e conteudo real aproveitavel.",
    diagnostico: "Site em Wix com texto biografico, imagem de WhatsApp no conteudo e baixa organizacao para conversao.",
    conteudo: "Site informa Patricia Toniote, psicologa clinica, atendimento online e presencial, abordagem psicologia analitica.",
    servicos: "Psicoterapia online e presencial para adolescentes e adultos.",
    prova: "CRP 12/15543, formacao pela UNIVILLE e contato publico.",
    identidade: "Wix com fotografia pessoal e layout basico.",
    imagens: "Foto pessoal e imagens de WhatsApp existentes podem orientar redesign.",
  },
  {
    nicho: "Psicologa",
    regiao: "Joinville - SC",
    nome: "Jessica Cristina da Silva",
    phone: "(47) 9 9981-5585",
    site: "https://psicologajessicasc.wixsite.com/jessica",
    contato: "Telefone publico no site: (47) 9 9981-5585; jessicacristinapsicologa@gmail.com.",
    motivo: "Psicologa mulher em Joinville com site Wix antigo e oportunidade de melhorar autoridade e agenda.",
    diagnostico: "Pagina Wix antiga, pouca hierarquia visual, contato no rodape e CTA pouco presente.",
    conteudo: "Site informa Jessica Cristina da Silva, graduada em Psicologia pela Univille e especializacao em Terapia do Esquema.",
    servicos: "Atendimento psicologico em Joinville.",
    prova: "Formacao Univille, especializacao e telefone/e-mail publicados.",
    identidade: "Wix simples com texto curto e poucos elementos de marca.",
    imagens: "Elementos visuais do site e foto podem ser reaproveitados.",
  },
  {
    nicho: "Psicologa",
    regiao: "Curitiba - PR",
    nome: "Tiene Guimaraes",
    phone: "(41) 98896-8510",
    site: "https://tieneguimaraes1.wixsite.com/website",
    contato: "Telefone publico no site: (41) 98896-8510; tiene.guimaraes1@gmail.com.",
    motivo: "Psicologa clinica em Curitiba com subdominio Wix e site basico.",
    diagnostico: "Site Wix simples, com contato duplicado e pouca diferenciacao visual para agendamento.",
    conteudo: "Site informa atendimento no Centro de Curitiba e em Araucaria, com e-mail e telefone publicados.",
    servicos: "Psicologia clinica; atendimento presencial.",
    prova: "Nome feminino, titulo Psicologa Tiene Guimaraes e canais oficiais no site.",
    identidade: "Wix basico com icones de redes e rodape padrao.",
    imagens: "Icones sociais e dados de consultorio podem orientar redesign.",
  },
  {
    nicho: "Psicologa / Psicanalista",
    regiao: "Sao Paulo - SP",
    nome: "Nyara Bretas",
    phone: "+55 11 95921-2648",
    site: "https://nypsico.wixsite.com/nyarabretas",
    contato: "WhatsApp publico no site: +55 11 95921-2648; nyara.bretas@unesp.br.",
    motivo: "Psicologa e psicanalista mulher em Sao Paulo com site Wix e forte potencial para landing premium.",
    diagnostico: "Site Wix com depoimento e formacao, mas CTA e autoridade poderiam ser reorganizados em primeira dobra.",
    conteudo: "Site informa atendimento na Vila Mariana, CRP 06/173156, graduacao UNESP e fundamentos da psicanalise.",
    servicos: "Psicologia e psicanalise para jovens, adultos e idosos.",
    prova: "CRP 06/173156, endereco, e-mail, WhatsApp e depoimento publicados.",
    identidade: "Wix com textos e depoimento, visual simples.",
    imagens: "Depoimentos e foto/elementos do site podem compor redesign.",
  },
  {
    nicho: "Psicologa / Neuropsicologa",
    regiao: "Florianopolis - SC",
    nome: "Vanessa Dechen",
    phone: "(48) 99131-0260",
    site: "https://vanessadechen.wixsite.com/my-site",
    contato: "WhatsApp publico no site: (48) 99131-0260; vanessadechen@gmail.com.",
    motivo: "Psicologa mulher em Florianopolis com Wix simples e nicho de neuropsicologia que pede mais autoridade.",
    diagnostico: "Site com conteudo bom mas identidade visual basica, baixa hierarquia comercial e CTA discreto.",
    conteudo: "Site informa Vanessa Dechen, psicologa, neuropsicologa, tecnica em neurometria, CRP 19272 e contato Instagram @incognita.neuro.",
    servicos: "Psicologia, neuropsicologia e neurometria.",
    prova: "CRP 19272, telefone, e-mail e formacoes publicados.",
    identidade: "Wix com marca Terapia Consciente e visual minimalista.",
    imagens: "Foto e identidade Terapia Consciente podem orientar redesign.",
  },
  {
    nicho: "Psicologa",
    regiao: "Campinas - SP",
    nome: "Isabel Freitas",
    phone: "(19) 99980-4799",
    site: "https://creisconsultor.wixsite.com/psic-isabel",
    contato: "Telefone/WhatsApp publico no site: (19) 99980-4799; psicologaisabelfreitas@gmail.com.",
    motivo: "Psicologa mulher em Campinas com site Wix simples e foco em brasileiras expatriadas.",
    diagnostico: "Site Wix com informacao de contato, mas design basico, CTA pouco trabalhado e autoridade pouco estruturada.",
    conteudo: "Site informa psicologa brasileira para expatriados, endereco Rua Raul de Castro 132, sala 5, Chapadao, Campinas.",
    servicos: "Psicologia para expatriados; atendimento em Campinas e online.",
    prova: "Nome feminino, e-mail, endereco e telefone publicados.",
    identidade: "Wix simples com icones de WhatsApp e Instagram.",
    imagens: "Icones sociais e foto do site podem ser aproveitados.",
  },
  {
    nicho: "Psicologa",
    regiao: "Campinas - SP",
    nome: "Brenda D. Barbosa",
    phone: "(19) 98360-9550",
    site: "https://psicobrendabarbosa.wixsite.com/psico",
    contato: "Telefone de agendamento publico no site: (19) 98360-9550.",
    motivo: "Psicologa mulher em Campinas com site Wix antigo e CTA simples.",
    diagnostico: "Site Wix com texto generico e poucas provas/servicos organizados, deixando potencial de conversao baixo.",
    conteudo: "Site informa Psicologa Brenda Barbosa, atendimento em Campinas, foco em bem-estar e saude mental.",
    servicos: "Atendimento psicologico; suporte para autoconhecimento e superacao de obstaculos.",
    prova: "Nome feminino, titulo de psicologa em Campinas e telefone de agendamento publicados.",
    identidade: "Template Wix com visual generico.",
    imagens: "Imagens do template e foto podem orientar uma versao mais proprietaria.",
  },
  {
    nicho: "Psicologa",
    regiao: "Uberlandia - MG",
    nome: "Leticia Santos",
    phone: "(34) 99163-7775",
    site: "https://lesantospsico.wixsite.com/leticiasantospsi",
    contato: "WhatsApp publico no site: (34) 99163-7775; lesantospsico@gmail.com.",
    motivo: "Psicologa mulher em Uberlandia com subdominio Wix e oportunidade para landing mais forte.",
    diagnostico: "Site Wix com conteudo basico, CTA textual e pouca estrutura visual para diferenciais e agendamento.",
    conteudo: "Site informa Leticia Santos, CRP 04/54636, formada pela UFU, mais de seis anos de experiencia clinica.",
    servicos: "Atendimento presencial em Uberlandia e online; criancas, adolescentes, adultos e idosos; abordagem psicanalise.",
    prova: "CRP 04/54636, endereco Rua Felisberto Carrejo 930, e-mail e WhatsApp publicados.",
    identidade: "Wix simples com tom pessoal.",
    imagens: "Fotos e textos do site podem orientar redesign.",
  },
  {
    nicho: "Psicologa",
    regiao: "Uberlandia - MG",
    nome: "Luciana Gomes",
    phone: "34 99172-8418",
    site: "https://lucianagomes125.wixsite.com/website",
    contato: "Telefone publico no site: 34 99172-8418; lucianagpsico@gmail.com.",
    motivo: "Psicologa mulher em Uberlandia com Wix antigo, contato simples e oportunidade de autoridade local.",
    diagnostico: "Site Wix basico com formulario em ingles, pouco CTA e baixa percepcao de marca profissional.",
    conteudo: "Site informa Psicologa Luciana Gomes, CRP 04/45227, endereco Rua Duque de Caxias, 450, Centro, Uberlandia.",
    servicos: "Atendimento psicologico clinico.",
    prova: "CRP 04/45227, telefone, e-mail e endereco publicados.",
    identidade: "Wix simples com rodape padrao.",
    imagens: "Imagem de perfil e dados de consultorio podem ser aproveitados.",
  },
  {
    nicho: "Psicologa",
    regiao: "Uberlandia - MG",
    nome: "Mirian Santos",
    phone: "(34) 99922-4879",
    site: "https://cristinassmirian.wixsite.com/psicomiriansantos/blank-1",
    contato: "WhatsApp publico no site: (34) 99922-4879.",
    motivo: "Psicologa mulher em Uberlandia com site Wix fragmentado e conteudo biografico que pode virar landing.",
    diagnostico: "Pagina interna Wix com informacao profissional sem estrutura comercial clara, CTA e identidade visual fracos.",
    conteudo: "Site informa CRP 04/33254, Psicologia Hospitalar, formacao pela UFU e experiencia clinica desde 2010.",
    servicos: "Psicologia clinica; neuropsicologia e terapia cognitivo-comportamental mencionadas na formacao.",
    prova: "CRP 04/33254, WhatsApp e formacao publicados.",
    identidade: "Wix antigo com conteudo curricular.",
    imagens: "Conteudo de formacao e eventuais fotos podem orientar redesign.",
  },
  {
    nicho: "Engenheira autonoma",
    regiao: "Sao Paulo - SP",
    nome: "Carolina Consolino de Souza",
    phone: "(11) 95980-7424",
    site: "https://carolinaconsolino.wixsite.com/lb1637084406598",
    contato: "Telefone/WhatsApp publico no site: (11) 95980-7424; engconsolino.avcb@gmail.com.",
    motivo: "Engenheira mulher prestadora individual, nicho permitido, com Wix antigo e servico claro de AVCB.",
    diagnostico: "Site Wix com texto simples, rodape generico, visual datado e baixa credibilidade para servicos tecnicos.",
    conteudo: "Site informa Engenheira Carolina Consolino de Souza, solucoes em engenharia contra incendio e panico, Sao Paulo.",
    servicos: "AVCB para regularizacao de imoveis, eventos, renovacao de AVCB e maquetes 3D para eventos.",
    prova: "Nome feminino, titulo Engenheira, e-mail, WhatsApp e servicos publicados.",
    identidade: "Wix com imagens de servicos e pouca identidade proprietaria.",
    imagens: "Fotos de servicos e imagem 1_edited podem ser aproveitadas.",
  },
  {
    nicho: "Massoterapeuta",
    regiao: "Sao Paulo - SP",
    nome: "Beatriz Gueiros",
    phone: "11 99198-9002",
    site: "https://maridofazdetudo.wixsite.com/beatriz",
    contato: "Telefone/WhatsApp publico no site: 11 99198-9002.",
    motivo: "Massoterapeuta mulher em Sao Paulo, nicho permitido, com Wix simples e contato direto.",
    diagnostico: "Site Wix antigo, layout simples, endereco e WhatsApp no rodape, pouca proposta de valor e prova social.",
    conteudo: "Site informa Beatriz Gueiros Massoterapeuta, Rua Bucuituba 1319, Vila Diva, Sao Paulo.",
    servicos: "Massoterapia; agendamento por WhatsApp.",
    prova: "Nome feminino, titulo massoterapeuta, endereco e telefone publicados.",
    identidade: "Wix basico com visual de servicos.",
    imagens: "Imagens de servicos e endereco podem orientar redesign.",
  },
  {
    nicho: "Psicologa",
    regiao: "Londrina - PR",
    nome: "Emanuela Brisola Theis",
    phone: "(43) 99933-1266",
    site: "https://emanuelapsicologa.wixsite.com/psicologaemanuela",
    contato: "WhatsApp publico no site: (43) 99933-1266.",
    motivo: "Psicologa mulher em Londrina com site Wix antigo e atendimento infantil/adolescente claro.",
    diagnostico: "Site Wix com cabecalho simples, imagens datadas e baixa organizacao de CTA/provas.",
    conteudo: "Site informa Emanuela Brisola Theis, CRP 08/23377, psicoterapia infantil, adolescente e orientacao de pais.",
    servicos: "Psicoterapia infantil, adolescente e orientacao de pais.",
    prova: "CRP 08/23377, endereco Senador Souza Naves 441 sala 81 e WhatsApp publicados.",
    identidade: "Wix antigo com fotos de clinica.",
    imagens: "Fotos da profissional/clinica podem ser aproveitadas.",
  },
  {
    nicho: "Psicologa / Psicanalista",
    regiao: "Maringa - PR",
    nome: "Amanda Amancio",
    phone: "+55 44 99818-4958",
    site: "https://psicoamandaamancio.wixsite.com/website",
    contato: "Telefone publico em fonte social associada ao site: +55 44 99818-4958; psicoamandaamancio@hotmail.com.",
    motivo: "Psicologa e psicanalista mulher em Maringa com Wix visualmente simples e CTA dependente de WhatsApp.",
    diagnostico: "Site Wix com conteudo real e perguntas frequentes, mas sem telefone visivel no texto principal e com oportunidade de melhorar primeira dobra.",
    conteudo: "Site informa Amanda Amancio da Silva, psicologa ha 10 anos, psicanalise, atendimento de adultos, criancas e adolescentes em Maringa e online.",
    servicos: "Psicologia e psicanalise; atendimento presencial e online; supervisao clinica.",
    prova: "CRP 08/21759, nome feminino e pagina social vinculada com telefone publico.",
    identidade: "Wix com fotos pessoais e visual autoral simples.",
    imagens: "Fotos pessoais e secoes de FAQ podem orientar redesign.",
  },
  {
    nicho: "Psicologa",
    regiao: "Curitiba - PR",
    nome: "Tatiane Micheli Okamoto Silva Vicente",
    phone: "+55 43 99614-0291",
    site: "https://tatimichelipsi.wixsite.com/tatimichelipsi",
    contato: "WhatsApp publico no site: +55 43 9 9614-0291; tatimicheli.psi@gmail.com.",
    motivo: "Psicologa mulher com site Wix muito extenso, bom conteudo e baixa objetividade comercial.",
    diagnostico: "Site com excesso de secoes, imagens e textos longos; CTA e especialidades podem ser organizados em landing mais clara.",
    conteudo: "Site informa Tatiane Micheli, CRP 08/25327, neuropsicologa e psicopedagoga, atendimento online e presencial.",
    servicos: "Avaliacao neuropsicologica, psicodiagnostico, psicoterapia, supervisao e mentoria.",
    prova: "CRP 08/25327, WhatsApp, e-mail e formacoes publicados.",
    identidade: "Wix com identidade roxa e muitas imagens.",
    imagens: "Logo Tati Psi, fotos e depoimentos podem ser aproveitados.",
  },
  {
    nicho: "Psicologa",
    regiao: "Londrina - PR",
    nome: "Gleicieni Quiel",
    phone: "(43) 9 9980-0134",
    site: "https://psigleiciquiel.wixsite.com/consultorio",
    contato: "WhatsApp publico no site: (43) 9 9980-0134.",
    motivo: "Psicologa mulher em Londrina, atende mulheres, com Wix simples e bom gancho de nicho.",
    diagnostico: "Site Wix basico, texto claro mas design simples, pouca prova social e CTA visual pouco sofisticado.",
    conteudo: "Site informa Psicologa Gleicieni Quiel, CRP 08/23494, graduada pela UEL, pos-graduada em Saude Mental.",
    servicos: "Terapia online para mulheres; ansiedade, independencia emocional, inseguranca e autoconfianca.",
    prova: "CRP 08/23494, foco em atendimento para mulheres e WhatsApp publicados.",
    identidade: "Wix com foto e layout simples.",
    imagens: "Foto da profissional e elementos de especialidades podem ser aproveitados.",
  },
  {
    nicho: "Psicologa",
    regiao: "Ponta Grossa - PR",
    nome: "Fernanda Lopes",
    phone: "(42) 98426-6503",
    site: "https://fernandalopespsico9.wixsite.com/psifernandalopes",
    contato: "WhatsApp publico no site: (42) 98426-6503.",
    motivo: "Psicologa mulher ligada a Ponta Grossa/Curitiba, com Wix simples e conteudo biografico forte.",
    diagnostico: "Site Wix com conteudo bom, mas sem proposta comercial clara, CTA simples e visual pouco diferenciado.",
    conteudo: "Site informa psicoterapia como processo de autoconhecimento e trajetoria com UFSC, Gestalt-Terapia e atuacao em Ponta Grossa.",
    servicos: "Psicoterapia; Gestalt-terapia.",
    prova: "Nome feminino, historico profissional e WhatsApp publicados.",
    identidade: "Wix simples com fotos e texto institucional.",
    imagens: "Fotos do site e trajetoria podem ser aproveitadas.",
  },
  {
    nicho: "Psicologa",
    regiao: "Betim - MG",
    nome: "Fabiana Alves",
    phone: "(31) 98228-8898",
    site: "https://fabianaalvescostap.wixsite.com/fabiana-alves-psic-l",
    contato: "Telefone/WhatsApp publico no site: (31) 98228-8898; @psifabiana.alves.",
    motivo: "Psicologa mulher em Betim, nicho permitido, com site Wix e oferta clara para casais/familias.",
    diagnostico: "Site Wix com muitos blocos textuais, hierarquia dispersa e CTA visual que pode ser simplificado.",
    conteudo: "Site informa Fabiana Alves, CRP 04/51815, terapeuta individual, casal e familia em Rua Alzira Rocha Saliba 18, Betim.",
    servicos: "Terapia de casal, individual, familiar e orientacao parental.",
    prova: "CRP 04/51815, endereco, WhatsApp e posicionamento publicados.",
    identidade: "Wix com tons suaves e imagens familiares.",
    imagens: "Logo/imagens familiares e foto da profissional podem ser aproveitadas.",
  },
  {
    nicho: "Psicologa",
    regiao: "Contagem - MG",
    nome: "Samantha Alves Pereira de Souza",
    phone: "(31) 98543-5300",
    site: "https://samanthapsi.wixsite.com/amorimperfeito",
    contato: "Telefone publico no site: (31) 98543-5300; samantha.psi@yahoo.com.",
    motivo: "Psicologa mulher em Contagem com posicionamento de terapia de casal e site Wix que pode converter melhor.",
    diagnostico: "Site Wix com boa oferta, mas layout longo, texto denso e oportunidade de primeira dobra mais forte.",
    conteudo: "Site informa Samantha Alves Pereira de Souza, CRP 04/54059, psicologa e terapeuta de casal em Contagem.",
    servicos: "Psicoterapia individual especializada em relacionamentos amorosos, psicoterapia de casal e SOS Relacao.",
    prova: "CRP 04/54059, telefone, e-mail e formacao UFMG publicados.",
    identidade: "Marca Amor Imperfeito, com fotos e depoimentos.",
    imagens: "Fotos profissionais e marca Amor Imperfeito podem ser aproveitadas.",
  },
  {
    nicho: "Psicologia",
    regiao: "Sao Paulo - SP",
    nome: "Consultorio de Psicologia Fernandes",
    phone: "(11) 98060-3694",
    site: "https://consultoriofernand0.wixsite.com/website",
    contato: "Telefone/WhatsApp publico no site: (11) 99300-3935 / (11) 98060-3694; consultorio.fernandes2018@gmail.com.",
    motivo: "Consultorio de psicologia com decisoras mulheres listadas e site Wix antigo, permitido no nicho psicologia.",
    diagnostico: "Site Wix com texto de equipe longo, visual antigo e baixa clareza de agendamento/posicionamento na primeira dobra.",
    conteudo: "Site lista Andreza Lara CRP 06/139114, Rosenilda M. da Silva CRP 06/55185 e Debora Cibele B. S. Fernandes.",
    servicos: "Psicologia clinica, psicomotricidade e atendimento psicologico.",
    prova: "Equipe com profissionais mulheres, CRPs e telefone/WhatsApp publicados.",
    identidade: "Wix antigo com marca Consultorio de Psicologia Fernandes.",
    imagens: "Fotos/equipe e textos curriculares podem orientar redesign.",
  },
  {
    nicho: "Psicologa / Psicanalista",
    regiao: "Sao Paulo - SP",
    nome: "Luciana Silva do Prado",
    phone: "+55 11 99157-9284",
    site: "https://lusdoprado.wixsite.com/website",
    contato: "WhatsApp publico no site: +55 (11) 99157-9284.",
    motivo: "Psicologa e psicanalista mulher em Sao Paulo com site Wix basico e telefone direto.",
    diagnostico: "Site Wix simples, contato no rodape e pouca estruturacao de autoridade e agendamento.",
    conteudo: "Site informa Luciana Prado, CRP 06/54798-4, consultorio na Vila Mariana/Santa Cruz.",
    servicos: "Psicologia clinica e psicanalise; consulta presencial ou online.",
    prova: "CRP 06/54798-4, WhatsApp e endereco publicados.",
    identidade: "Wix basico com poucos elementos visuais.",
    imagens: "Dados de consultorio e marca textual podem orientar redesign.",
  },
  {
    nicho: "Psicologa",
    regiao: "Sao Paulo - SP",
    nome: "Priscila Vicente Garrito",
    phone: "(11) 94169-1331",
    site: "https://priscilagarrito.wixsite.com/website",
    contato: "Telefone publico no site: (11) 94169-1331; priscilagarrito@hotmail.com.",
    motivo: "Psicologa mulher em Sao Paulo com site Wix muito simples e contato direto.",
    diagnostico: "Pagina Wix enxuta, pouca informacao de servicos e prova social, visual basico.",
    conteudo: "Site informa Psicologa Priscila Vicente Garrito, Sao Paulo, SP, telefone e e-mail.",
    servicos: "Atendimento psicologico.",
    prova: "Nome feminino, titulo psicologa, telefone e e-mail publicados.",
    identidade: "Wix simples com icones sociais.",
    imagens: "Icones sociais e foto, se presentes, podem orientar redesign.",
  },
  {
    nicho: "Psicologa",
    regiao: "Sao Paulo - SP",
    nome: "Fabiana Nascimento",
    phone: "(11) 95557-0283",
    site: "https://consultoriopsifabi.wixsite.com/psicologafabiana",
    contato: "Telefone publico no site: (11) 95557-0283; consultoriopsifabiana@gmail.com.",
    motivo: "Psicologa mulher em Sao Paulo com site Wix simples e atendimento online/presencial.",
    diagnostico: "Site Wix basico, conteudo enxuto e CTA pouco sofisticado para captar conversas.",
    conteudo: "Site informa Dra Fabiana Nascimento, psicologa, atendimento online para todo o Brasil e presencial em Sao Paulo.",
    servicos: "Atendimento psicologico online e presencial.",
    prova: "Nome feminino, telefone e e-mail publicados.",
    identidade: "Wix com visual simples e pouca marca proprietaria.",
    imagens: "Fotos e icones sociais podem ser reaproveitados.",
  },
  {
    nicho: "Psicologa",
    regiao: "Sao Paulo - SP",
    nome: "Samantha Teixeira",
    phone: "(11) 9 4196-2191",
    site: "https://samanthateixeira20.wixsite.com/psicologasamantha",
    contato: "Telefone/WhatsApp publico no site: (11) 9 4196-2191; steix20@gmail.com.",
    motivo: "Psicologa mulher em Sao Paulo com site Wix antigo e dados de contato claros.",
    diagnostico: "Site Wix com fotos e informacoes, mas layout datado, pouca autoridade visual e baixa clareza de conversao.",
    conteudo: "Site informa Samantha Teixeira, CRP 06/135697, atendimento na Alameda Joaquim Eugenio de Lima, Jardim Paulista.",
    servicos: "Atendimento psicologico; psicoterapia.",
    prova: "CRP 06/135697, telefone, e-mail e endereco publicados.",
    identidade: "Wix antigo com fotos de sala e cartoes de visita.",
    imagens: "Fotos da sala e da profissional podem ser aproveitadas.",
  },
  {
    nicho: "Psicologa",
    regiao: "Sao Paulo - SP",
    nome: "Marcela Bento",
    phone: "+55 11 94890-2189",
    site: "https://psicologamarcelabe.wixsite.com/marcelabento",
    contato: "Telefone publico em pagina social associada ao site: +55 11 94890-2189; psicologamarcelabento@gmail.com.",
    motivo: "Psicologa mulher em Sao Paulo com site Wix simples e telefone publico em perfil associado.",
    diagnostico: "Site Wix com apresentacao profissional curta, poucas provas e CTA que depende de canal externo.",
    conteudo: "Site informa Marcela Bento, Psicologa CRP 06/140927, formada pelo UNASP, formacao em Logoterapia e pos em intervencao em crise.",
    servicos: "Psicologia clinica; divulgacao de psicologia e atendimento profissional.",
    prova: "CRP 06/140927, nome feminino, e-mail e telefone publico associado.",
    identidade: "Wix simples com conteudo biografico.",
    imagens: "Foto da profissional e textos institucionais podem orientar redesign.",
  },
  {
    nicho: "Psicologa",
    regiao: "Sao Paulo / Santos - SP",
    nome: "Leticia Ribeiro",
    phone: "(19) 9 7166-1919",
    site: "https://lermribeiro.wixsite.com/leticiaribeiro",
    contato: "Telefone publico no site: (19) 9 7166-1919; lermribeiro@gmail.com.",
    motivo: "Psicologa mulher com atendimento em Santos e online, site Wix simples e conteudo profissional claro.",
    diagnostico: "Site Wix enxuto, com perfil profissional bom, mas pouco CTA e baixa diferenciacao visual.",
    conteudo: "Site informa Leticia Ribeiro, CRP 06/153805, formada pela UNIFESP, atendimento em Santos e online.",
    servicos: "Atendimentos clinicos em Santos e online; reabilitacao neuropsicologica mencionada.",
    prova: "CRP 06/153805, telefone, e-mail e endereco Rua Jose Caballero 53 publicados.",
    identidade: "Wix minimalista com imagem de folhas e foto profissional.",
    imagens: "Foto profissional e paleta minimalista podem ser aproveitadas.",
  },
  {
    nicho: "Psicologia",
    regiao: "Campinas / Americana - SP",
    nome: "Triade Clinica de Avaliacao Psicologica",
    phone: "(19) 2144-3124",
    site: "https://psicologiatriade.wixsite.com/psico",
    contato: "Telefone publico no site: (19) 2144-3124; psicologia.triade@gmail.com.",
    motivo: "Clinica de psicologia conduzida por mulheres, com site Wix e oportunidade clara de redesign.",
    diagnostico: "Site Wix com conteudo relevante, mas visual antigo, excesso de blocos e CTA pouco orientado para conversao.",
    conteudo: "Site informa Triade, formada por psicologas Bruna Kelly Magalhaes de Lima CRP 06/116251 e Suzana Cristina dos Reis Caneschi CRP 06/109057.",
    servicos: "Avaliacao psicologica, psicoterapia, neuropsicologia e avaliacao psicologica no transito.",
    prova: "Equipe feminina, CRPs, telefone, e-mail e endereco Rua Achiles Zanaga 57 publicados.",
    identidade: "Marca Triade com logo horizontal e imagens de equipe.",
    imagens: "Logo Triade, fotos das psicologas e blocos de servicos podem ser aproveitados.",
  },
  {
    nicho: "Psicologa",
    regiao: "Campinas / Sao Carlos - SP",
    nome: "Daniela Costa",
    phone: "(19) 99676-9846",
    site: "https://danigcosta.wixsite.com/danielacostapsico",
    contato: "Telefone/WhatsApp publico no site: (19) 99676-9846; Instagram @amoresendo.",
    motivo: "Psicologa mulher com site Wix, abordagem junguiana e servico claro de atendimento online/presencial.",
    diagnostico: "Site Wix com fotos e textos, mas CTA isolado e pouca organizacao comercial das especialidades.",
    conteudo: "Site informa Daniela Costa, CRP 06/153072, psicologa clinica analitica junguiana, mais de seis anos de experiencia.",
    servicos: "Atendimento individual online e presencial; adultos; dificuldades nas relacoes, estresse, trauma, ansiedade e vicios.",
    prova: "CRP 06/153072, telefone/WhatsApp, endereco Rua Dom Pedro II 2066 e formacao publicados.",
    identidade: "Wix com fotos pessoais e frase de Jung.",
    imagens: "Fotos pessoais e linguagem junguiana podem orientar redesign.",
  },
  {
    nicho: "Psicologa / Psicopedagoga",
    regiao: "Sao Paulo - SP",
    nome: "Beatriz Honorio Chagas",
    phone: "11 98494-2180",
    site: "https://beatrizhonoriochag.wixsite.com/psicologa",
    contato: "Telefone/WhatsApp publico no site: 11 98494-2180; beatrizhonoriochagas@hotmail.com.",
    motivo: "Psicologa e psicopedagoga mulher em Sao Paulo com site Wix antigo e oportunidade de autoridade local.",
    diagnostico: "Site Wix com visual simples, texto institucional longo, contatos soltos e pouca hierarquia de conversao.",
    conteudo: "Site informa Beatriz Honorio Chagas, CRP 06/148544, psicologa e psicopedagoga em Jardim Diomar, Sao Paulo.",
    servicos: "Psicoterapia para criancas, adolescentes, adultos e idosos; servicos multiprofissionais.",
    prova: "CRP 06/148544, telefone, e-mail e endereco Avenida Nossa Senhora de Sabara 2313 publicados.",
    identidade: "Wix basico com marca Clinica de Psicologia e imagens de consultorio.",
    imagens: "Logo, imagem de consultorio e dados da profissional podem ser reaproveitados.",
  },
];

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function normalizePhone(raw) {
  let digits = String(raw).replace(/\D/g, "");
  if (!digits.startsWith("55")) digits = `55${digits}`;
  return `+${digits}`;
}

function waLink(phone) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function mapsUrl(lead) {
  const query = `${lead.nome} ${lead.regiao}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function firstName(fullName) {
  return String(fullName).split(/\s+/)[0];
}

function abordagem(lead) {
  return `Olá! Tudo bem?\n\nAqui é o Leonardo Brasil. Encontrei o seu site e preparei, sem compromisso, uma nova versão com visual mais moderno e pronta para celular.\n\nQuer que eu te envie o link para ver como ficou?\n\nMe envie uma mensagem no WhatsApp 51 99256-8861 que eu te mando o link:\nhttps://wa.me/5551992568861\n\nRascunho operacional para ${firstName(lead.nome)}: quando houver redesign individual, usar [INSERIR_LINK_DO_REDESIGN_APOS_CRIACAO].`;
}

async function collectPriorText() {
  const roots = [
    path.join(root, "prospeccao"),
    ...[
      "prospeccao-ativa-2026-07-12",
      "prospeccao-ativa-2026-07-13",
      "prospeccao-ativa-2026-07-14",
      "prospeccao-ativa-2026-07-15",
      "prospeccao-ativa-2026-07-17",
      "prospeccao-ativa-2026-07-22",
      "prospeccao-ativa-2026-07-23",
      "prospeccao-ativa-2026-07-25",
      "prospeccao-ativa-2026-07-26",
    ].map((folder) => path.join(root, folder)),
  ];
  const chunks = [];
  async function walk(dir) {
    let entries = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      if (entry.isFile() && /\.(csv|json|txt)$/i.test(entry.name)) {
        chunks.push(await fs.readFile(full, "utf8").catch(() => ""));
      }
    }
  }
  for (const dir of roots) await walk(dir);
  const extraCache = path.join(root, "dedupe-cache-2026-07-26-sites.txt");
  chunks.push(await fs.readFile(extraCache, "utf8").catch(() => ""));
  return chunks.join("\n").toLowerCase();
}

function isDuplicate(lead, priorText, seen) {
  const site = lead.site.toLowerCase().replace(/\/$/, "");
  const phone = normalizePhone(lead.phone).replace(/\D/g, "");
  const name = lead.nome.toLowerCase();
  const slug = slugify(lead.nome);
  if (seen.sites.has(site) || seen.phones.has(phone) || seen.names.has(name) || seen.slugs.has(slug)) return true;
  if (priorText.includes(site) || priorText.includes(phone) || priorText.includes(name) || priorText.includes(slug)) return true;
  seen.sites.add(site);
  seen.phones.add(phone);
  seen.names.add(name);
  seen.slugs.add(slug);
  return false;
}

function toRow(lead, rank) {
  const slug = `${slugify(lead.nome)}-${slugify(lead.regiao).split("-").slice(0, 3).join("-")}`;
  const maps = mapsUrl(lead);
  const phone = normalizePhone(lead.phone);
  const printMaps = path.join(printsDir, `${slug}-maps.png`);
  const printDesktop = path.join(printsDir, `${slug}-desktop.png`);
  const printMobile = path.join(printsDir, `${slug}-mobile.png`);
  return {
    data: date,
    rank,
    nicho: lead.nicho,
    regiao: lead.regiao,
    nome: lead.nome,
    nota: "nao capturada",
    avaliacoes: "nao capturadas",
    contato: lead.contato,
    "WhatsApp/telefone normalizado": phone,
    "site atual": lead.site,
    "link Maps": maps,
    "motivo da abordagem": lead.motivo,
    "diagnostico do site atual": lead.diagnostico,
    "conteudo real extraido": lead.conteudo,
    "servicos reais identificados": lead.servicos,
    "prova social real": lead.prova,
    "identidade visual observada": lead.identidade,
    "imagens/logo aproveitaveis": lead.imagens,
    "slug sugerido": slug,
    "status redesign": "Aguardando redesign individual",
    "URL curta gerada": "",
    "print Maps": printMaps,
    "print site atual desktop": printDesktop,
    "print site atual mobile": printMobile,
    "link wa.me preliminar": waLink(phone),
    status: "LEAD_QUALIFICADO_AGUARDANDO_REDESIGN_INDIVIDUAL",
    observacoes: "Lead novo apos dedupe local por URL, telefone, nome e slug; nao houve envio automatico nem criacao de redesign.",
    "Bloco 1 (Link)": abordagem(lead),
    "Bloco 2 (Proposta)": `Proposta posterior para ${lead.nome}: redesign individual da pagina por R$497, com hospedagem/manutencao por R$37,90 mensais quando fizer sentido apos aprovacao humana.`,
    "Toque 1 (2 dias)": "Follow-up manual 2 dias apos primeiro contato, sem automacao de envio.",
    "Toque 2 (5 dias)": "Follow-up manual 5 dias depois, somente se houver canal adequado e confirmacao humana.",
    "Toque 3 (10 dias)": "Ultimo toque manual em 10 dias, respeitando opt-out e sem insistencia.",
  };
}

function colLetter(n) {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(printsDir, { recursive: true });

const priorText = await collectPriorText();
const seen = { sites: new Set(), phones: new Set(), names: new Set(), slugs: new Set() };
const rejected = [];
const selected = [];
for (const candidate of candidates) {
  const duplicate = isDuplicate(candidate, priorText, seen);
  if (duplicate) rejected.push({ nome: candidate.nome, site: candidate.site, phone: normalizePhone(candidate.phone), reason: "duplicate_local_history_or_current_batch" });
  else selected.push(candidate);
  if (selected.length === 30) break;
}

if (selected.length < 30) {
  throw new Error(`Only ${selected.length} unique candidates after dedupe. Rejected: ${JSON.stringify(rejected, null, 2)}`);
}

const rows = selected.map((lead, index) => toRow(lead, index + 1));
const csv = [columns.join(","), ...rows.map((row) => columns.map((col) => csvEscape(row[col])).join(","))].join("\r\n");
const csvPath = path.join(outDir, `prospeccao_${date}.csv`);
const jsonPath = path.join(outDir, "qualification-capture.json");
const xlsxPath = path.join(outDir, `Prospeccao_Ativa_${date}.xlsx`);
const previewPath = path.join(outDir, "preview.png");

await fs.writeFile(csvPath, csv, "utf8");
await fs.writeFile(jsonPath, JSON.stringify(rows, null, 2), "utf8");
await fs.writeFile(path.join(outDir, "rejected-dedupe.json"), JSON.stringify(rejected, null, 2), "utf8");

const workbook = await Workbook.fromCSV(csv, { sheetName: date });
const sheet = workbook.worksheets.getItem(date);
sheet.freezePanes.freezeRows(1);
sheet.freezePanes.freezeColumns(10);
sheet.showGridLines = false;

const lastRow = rows.length + 1;
const lastCol = columns.length;
const lastColLetter = colLetter(lastCol);
const allRange = sheet.getRange(`A1:${lastColLetter}${lastRow}`);
allRange.format = {
  font: { name: "Inter", size: 10, color: "#111111" },
  wrapText: true,
  verticalAlignment: "top",
};
sheet.getRange(`A1:${lastColLetter}1`).format = {
  fill: "#111111",
  font: { bold: true, color: "#FFFFFF", size: 10 },
  horizontalAlignment: "center",
  verticalAlignment: "middle",
  wrapText: true,
};
for (const index of [9, 10, 21, 25, 26]) {
  sheet.getRange(`${colLetter(index)}1`).format = {
    fill: "#FFD700",
    font: { bold: true, color: "#111111", size: 10 },
    horizontalAlignment: "center",
    verticalAlignment: "middle",
    wrapText: true,
  };
}
allRange.format.borders = { preset: "all", style: "thin", color: "#E5E7EB" };
sheet.getRange(`A2:${lastColLetter}${lastRow}`).format = { wrapText: true, verticalAlignment: "top" };
sheet.getRange(`A1:${lastColLetter}${lastRow}`).format.autofitColumns();
sheet.getRange("A:A").format.columnWidth = 12;
sheet.getRange("B:B").format.columnWidth = 8;
sheet.getRange("C:C").format.columnWidth = 18;
sheet.getRange("D:D").format.columnWidth = 20;
sheet.getRange("E:E").format.columnWidth = 28;
sheet.getRange("F:G").format.columnWidth = 14;
sheet.getRange("H:H").format.columnWidth = 36;
sheet.getRange("I:I").format.columnWidth = 22;
sheet.getRange("J:K").format.columnWidth = 42;
sheet.getRange("L:R").format.columnWidth = 45;
sheet.getRange("S:S").format.columnWidth = 28;
sheet.getRange("T:U").format.columnWidth = 22;
sheet.getRange("V:Y").format.columnWidth = 42;
sheet.getRange("Z:Z").format.columnWidth = 44;
sheet.getRange("AA:AF").format.columnWidth = 45;
sheet.getRange(`A2:${lastColLetter}${lastRow}`).format.rowHeight = 92;

const table = sheet.tables.add(`A1:${lastColLetter}${lastRow}`, true, "LeadsQualificados20260729");
table.showFilterButton = true;
table.showBandedRows = true;

sheet.getRange(`Z2:Z${lastRow}`).dataValidation = { rule: { type: "list", values: statusValues } };
sheet.getRange(`Z2:Z${lastRow}`).conditionalFormats.add("containsText", {
  text: "LEAD_QUALIFICADO",
  format: { fill: "#DCFCE7", font: { color: "#14532D" } },
});
sheet.getRange(`U2:U${lastRow}`).conditionalFormats.add("containsBlanks", {
  format: { fill: "#FFFFFF" },
});

const preview = await workbook.render({ sheetName: date, range: "A1:J12", scale: 1, format: "png" });
await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));

const inspect = await workbook.inspect({
  kind: "table",
  range: `${date}!A1:AF5`,
  include: "values",
  tableMaxRows: 5,
  tableMaxCols: 32,
  maxChars: 6000,
});
const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan",
});
await fs.writeFile(path.join(outDir, "workbook-inspect.ndjson"), `${inspect.ndjson}\n${errors.ndjson}\n`, "utf8");

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(xlsxPath);

const validation = {
  date,
  rows: rows.length,
  columns: columns.length,
  qualified: rows.filter((row) => row.status === "LEAD_QUALIFICADO_AGUARDANDO_REDESIGN_INDIVIDUAL").length,
  uniqueSites: new Set(rows.map((row) => row["site atual"].toLowerCase())).size,
  uniquePhones: new Set(rows.map((row) => row["WhatsApp/telefone normalizado"].replace(/\D/g, ""))).size,
  invalidWa: rows.filter((row) => !/^https:\/\/wa\.me\/55\d{10,13}$/.test(row["link wa.me preliminar"])).length,
  filledShortUrls: rows.filter((row) => row["URL curta gerada"]).length,
  rejectedCount: rejected.length,
  csvPath,
  jsonPath,
  xlsxPath,
  previewPath,
};
await fs.writeFile(path.join(outDir, "validation.json"), JSON.stringify(validation, null, 2), "utf8");
console.log(JSON.stringify(validation, null, 2));
