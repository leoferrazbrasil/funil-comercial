import fs from 'node:fs/promises';
import path from 'node:path';

const today = '2026-07-10';
const root = process.cwd();
const outDir = path.join(root, 'teste-prospeccao-assistida-2026-07-10', 'simulacao-dia-completo-2026-07-10');
const publicDir = path.join(root, 'public');
const screenshotsDir = path.join(outDir, 'prints');

const leads = [
  {
    rank: 1,
    nicho: 'Dentista',
    regiao: 'São Paulo',
    nome: 'KNS Odontologia',
    shortName: 'KNS Odontologia',
    greeting: 'pessoal da KNS Odontologia',
    pronoun: 'plural',
    rating: '5,0',
    reviews: '5',
    contact: 'WhatsApp (11) 97415-1008',
    phone: '11974151008',
    email: '',
    currentSite: 'https://sites.google.com/view/knsodontologia/home',
    mapsLink: 'https://www.google.com/maps/search/KNS+Odontologia+Tucuruvi+São+Paulo',
    slug: 'kns-odontologia',
    platform: 'Google Sites',
    sourceType: 'Site atual em Google Sites, com prova social pública localizada em diretório de dentistas.',
    reason: 'Site em Google Sites com layout simples, pouca hierarquia visual e CTA pouco premium para uma clínica com implante, estética e avaliação 5,0.',
    address: 'Av. Tucuruvi, 666, sala 7 - Tucuruvi, São Paulo/SP',
    services: ['Implantodontia', 'Odontologia estética', 'Atendimento com hora marcada', 'Tratamento integral'],
    proof: 'atuação em implantodontia no Tucuruvi',
    visual: { primary: '#0f766e', secondary: '#164e63', accent: '#d4af37' },
  },
  {
    rank: 2,
    nicho: 'Dentista',
    regiao: 'São Paulo',
    nome: 'Dra. Talita Nacamura',
    shortName: 'Talita',
    greeting: 'Talita',
    pronoun: 'singular',
    rating: 'Pendente validar Maps',
    reviews: '',
    contact: 'WhatsApp (11) 94930-1006',
    phone: '11949301006',
    email: '',
    currentSite: 'https://ortodontiavilamariana.wordpress.com/',
    mapsLink: 'https://www.google.com/maps/search/Dra+Talita+Nacamura+Vila+Mariana',
    slug: 'dra-talita-nacamura',
    platform: 'WordPress.com',
    sourceType: 'Site WordPress.com antigo, com formação, CRO, endereço e WhatsApp publicados.',
    reason: 'Página antiga de WordPress com aparência datada, formulário e navegação pouco comerciais para ortodontia em Vila Mariana.',
    address: 'Rua Dr. Neto de Araújo, 320 cj. 408 - Vila Mariana, São Paulo/SP',
    services: ['Ortodontia', 'Avaliação ortodôntica', 'Aparelhos estéticos', 'Cirurgia oral e buco maxilo facial'],
    proof: 'formação pela USP, especialização em Ortodontia e CRO/SP 92735',
    visual: { primary: '#155e75', secondary: '#7c3aed', accent: '#059669' },
  },
  {
    rank: 3,
    nicho: 'Dentista',
    regiao: 'São Paulo',
    nome: 'Brasiliense Odontologia',
    shortName: 'Brasiliense Odontologia',
    greeting: 'pessoal da Brasiliense Odontologia',
    pronoun: 'plural',
    rating: 'Pendente validar Maps',
    reviews: '',
    contact: 'Telefone (11) 2047-5333 / brasiliense.odontologia@gmail.com',
    phone: '1120475333',
    email: 'brasiliense.odontologia@gmail.com',
    currentSite: 'https://brasilienseodontol.wixsite.com/my-site',
    mapsLink: 'https://www.google.com/maps/search/Brasiliense+Odontologia+Itaquera',
    slug: 'brasiliense-odontologia',
    platform: 'Wix',
    sourceType: 'Site Wix com endereço, telefone, e-mail, horários e menção a ortodontia.',
    reason: 'Site Wix com visual antigo, marca do construtor, pouca clareza de agenda e contato principal sem WhatsApp destacado.',
    address: 'Av. Campanella, 540, sala 3 - Itaquera, São Paulo/SP',
    services: ['Ortodontia', 'Convênios', 'Atendimento com agendamento', 'Resultados odontológicos'],
    proof: 'endereço em Itaquera, atendimento com agendamento prévio e e-mail comercial publicado',
    visual: { primary: '#0f4c81', secondary: '#78350f', accent: '#047857' },
  },
  {
    rank: 4,
    nicho: 'Dentista',
    regiao: 'São Paulo',
    nome: 'Dra. Márcia Yamashita e Equipe',
    shortName: 'Márcia',
    greeting: 'Márcia',
    pronoun: 'singular',
    rating: 'Pendente validar Maps',
    reviews: '',
    contact: 'WhatsApp (11) 95589-9390',
    phone: '11955899390',
    email: '',
    currentSite: 'https://sites.google.com/view/odontomooca/p%C3%A1gina-inicial',
    mapsLink: 'https://www.google.com/maps/search/Dra+Márcia+Yamashita+Mooca',
    slug: 'dra-marcia-yamashita',
    platform: 'Google Sites',
    sourceType: 'Site Google Sites com formação, CRO, serviços e WhatsApp.',
    reason: 'Conteúdo técnico forte, mas disperso em Google Sites; oportunidade de transformar especialidades em jornada clara de agendamento.',
    address: 'Mooca, São Paulo/SP',
    services: ['Odontologia do Esporte', 'DTM', 'Alinhadores invisíveis', 'Clareamento dental', 'Laserterapia'],
    proof: 'CRO-SP 42930, especialista em Odontologia do Esporte e habilitada em Odontologia do Sono',
    visual: { primary: '#0e7490', secondary: '#1e3a8a', accent: '#16a34a' },
  },
  {
    rank: 5,
    nicho: 'Dentista',
    regiao: 'São Paulo',
    nome: 'Vilela Odontologia',
    shortName: 'Vilela Odontologia',
    greeting: 'pessoal da Vilela Odontologia',
    pronoun: 'plural',
    rating: 'Pendente validar Maps',
    reviews: '',
    contact: 'WhatsApp (11) 98172-5117',
    phone: '11981725117',
    email: '',
    currentSite: 'https://vilelaodontologia.wordpress.com/',
    mapsLink: 'https://www.google.com/maps/search/Vilela+Odontologia+Barra+Funda',
    slug: 'vilela-odontologia',
    platform: 'WordPress.com',
    sourceType: 'Site WordPress.com com endereço, equipe, telefone e WhatsApp.',
    reason: 'Página WordPress simples, com rodapé do construtor e CTA pouco forte para uma equipe com ortodontia e implantes.',
    address: 'R. do Bosque, 1589, sala 1306 - Barra Funda, São Paulo/SP',
    services: ['Ortodontia', 'Implante', 'Planos odontológicos', 'Consulta por telefone, WhatsApp ou Facebook'],
    proof: 'equipe com Dra. Luana Vilela Silva em ortodontia e Dr. Thiago Vilela dos Santos em implante',
    visual: { primary: '#134e4a', secondary: '#581c87', accent: '#ca8a04' },
  },
  {
    rank: 6,
    nicho: 'Dentista',
    regiao: 'São Paulo',
    nome: 'CIDMEP Odontologia',
    shortName: 'CIDMEP',
    greeting: 'pessoal da CIDMEP Odontologia',
    pronoun: 'plural',
    rating: 'Pendente validar Maps',
    reviews: '',
    contact: 'WhatsApp (11) 95761-6388 / cidmep.odontologia@gmail.com',
    phone: '11957616388',
    email: 'cidmep.odontologia@gmail.com',
    currentSite: 'https://sites.google.com/view/cidmep/contato',
    mapsLink: 'https://www.google.com/maps/search/CIDMEP+Odontologia+Aclimação',
    slug: 'cidmep-odontologia',
    platform: 'Google Sites',
    sourceType: 'Página de contato em Google Sites com e-mail, endereço e WhatsApp.',
    reason: 'Página de contato muito básica, quase sem proposta de valor, ideal para redesign focado em agendamento e autoridade.',
    address: 'Rua Castro Alves, 1002 A - Aclimação, São Paulo/SP',
    services: ['Clínica odontológica', 'Agendamento de consulta', 'Atendimento por WhatsApp'],
    proof: 'endereço na Aclimação, e-mail comercial e WhatsApp publicados',
    visual: { primary: '#075985', secondary: '#334155', accent: '#059669' },
  },
  {
    rank: 7,
    nicho: 'Dentista',
    regiao: 'São Paulo',
    nome: 'Dr. Alexandre Serrano Lima',
    shortName: 'Alexandre',
    greeting: 'Alexandre',
    pronoun: 'singular',
    rating: 'Pendente validar Maps',
    reviews: '',
    contact: 'WhatsApp (11) 95812-7911 / dr.aslima@gmail.com',
    phone: '11958127911',
    email: 'dr.aslima@gmail.com',
    currentSite: 'https://aslodontologia.wordpress.com/',
    mapsLink: 'https://www.google.com/maps/search/Dr+Alexandre+Serrano+Lima+Santo+André',
    slug: 'dr-alexandre-serrano-lima',
    platform: 'WordPress.com',
    sourceType: 'Site WordPress.com com trajetória, serviços, WhatsApp, e-mail e endereço.',
    reason: 'Conteúdo rico e serviços de alto valor, mas apresentação antiga e pouco direcionada para conversão mobile.',
    address: 'Rua Frederico Falbo, 237 - Jardim Milena, Santo André/SP',
    services: ['Clínica geral', 'Clareamento dental', 'Próteses', 'Facetas cerâmicas', 'Implantes', 'Harmonização orofacial'],
    proof: '24 anos de atuação, laboratório de prótese próprio e CROSP 66.460',
    visual: { primary: '#0f172a', secondary: '#0e7490', accent: '#b45309' },
  },
  {
    rank: 8,
    nicho: 'Dentista',
    regiao: 'São Paulo',
    nome: 'Calligari Odontologia',
    shortName: 'Calligari Odontologia',
    greeting: 'pessoal da Calligari Odontologia',
    pronoun: 'plural',
    rating: 'Pendente validar Maps',
    reviews: '',
    contact: 'WhatsApp (11) 97256-5552 / Tel. 5641-3272',
    phone: '11972565552',
    email: '',
    currentSite: 'https://calligariodontologia.wixsite.com/calligariodontologia',
    mapsLink: 'https://www.google.com/maps/search/Calligari+Odontologia+Vila+Cruzeiro',
    slug: 'calligari-odontologia',
    platform: 'Wix',
    sourceType: 'Site Wix com logo, endereço, telefone, WhatsApp e menção a Google Places.',
    reason: 'Site Wix antigo com marca do construtor e navegação simples, apesar de se apresentar como referência na Zona Sul.',
    address: 'R. Doutor Fritz Martin, 34 - Vila Cruzeiro, São Paulo/SP',
    services: ['Prótese', 'Odontologia estética', 'Periodontia', 'Cirurgia', 'Endodontia', 'Harmonização facial'],
    proof: 'clínica fundada pelo Dr. Luiz Calligari, com equipe multidisciplinar na Zona Sul',
    visual: { primary: '#1f2937', secondary: '#0369a1', accent: '#059669' },
  },
  {
    rank: 9,
    nicho: 'Dentista',
    regiao: 'São Paulo',
    nome: 'Flávia Martins Dentista',
    shortName: 'Flávia',
    greeting: 'Flávia',
    pronoun: 'singular',
    rating: 'Pendente validar Maps',
    reviews: '',
    contact: 'WhatsApp/telefone (11) 99714-5045 / (11) 2362-8467',
    phone: '11997145045',
    email: '',
    currentSite: 'https://sites.google.com/view/flviamartinsdentista/in%C3%ADcio',
    mapsLink: 'https://www.google.com/maps/search/Flávia+Martins+Dentista+Perdizes',
    slug: 'flavia-martins-dentista',
    platform: 'Google Sites',
    sourceType: 'Google Sites com serviços, telefone, endereço e botão de WhatsApp.',
    reason: 'Página extremamente simples, sem hierarquia premium para múltiplas especialidades em Perdizes.',
    address: 'R. João Ramalho, 1370 - Perdizes, São Paulo/SP',
    services: ['Endodontia', 'Restaurações', 'Estética', 'Prótese', 'Periodontia', 'Odontopediatria'],
    proof: 'serviços variados publicados no site atual e atendimento em Perdizes',
    visual: { primary: '#0f766e', secondary: '#831843', accent: '#0891b2' },
  },
  {
    rank: 10,
    nicho: 'Dentista',
    regiao: 'São Paulo',
    nome: 'Clins Odontologia',
    shortName: 'Clins Odontologia',
    greeting: 'pessoal da Clins Odontologia',
    pronoun: 'plural',
    rating: '3,3',
    reviews: '3',
    contact: 'WhatsApp (11) 97487-2074 / Tel. 11 3348-4840',
    phone: '11974872074',
    email: '',
    currentSite: 'https://clinsgerencia.wixsite.com/clins',
    mapsLink: 'https://www.google.com/maps/search/Clins+Odontologia+Cambuci',
    slug: 'clins-odontologia',
    platform: 'Wix',
    sourceType: 'Site Wix com endereço, telefones e WhatsApp.',
    reason: 'Site Wix com marca do construtor, layout pouco atual e ausência de proposta clara de agendamento.',
    address: 'Av. Lins de Vasconcelos, 1010A - Cambuci, São Paulo/SP',
    services: ['Clínica odontológica', 'Atendimento no Cambuci', 'Contato por telefone e WhatsApp'],
    proof: 'presença no Cambuci com WhatsApp publicado e nota pública 3,3 com 3 avaliações',
    visual: { primary: '#075985', secondary: '#14532d', accent: '#eab308' },
  },
];

function plural(lead, singular, pluralText) {
  return lead.pronoun === 'plural' ? pluralText : singular;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function waLink(phone, text) {
  const digits = phone.replace(/\D/g, '');
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(text)}`;
}

function linkUrl(lead) {
  return `https://funilcomercial.com/${lead.slug}/`;
}

function makeMessages(lead) {
  const name = lead.greeting;
  const urlLine = `👉 ${linkUrl(lead)}`;
  const ratingNumber = Number(String(lead.rating).replace(',', '.'));
  const hasStrongRating = Number.isFinite(ratingNumber) && ratingNumber >= 4.7;
  const ratingSentence = hasStrongRating
    ? `Fiquei bem impressionado, as avaliações no Google falam por ${plural(lead, 'você', 'vocês')}: nota ${lead.rating} com ${lead.reviews} avaliações, além de ${lead.proof}.`
    : `Vi que ${plural(lead, 'você já tem', 'vocês já têm')} informações importantes publicadas e uma presença local clara: ${lead.proof}.`;
  const services = lead.services.join(', ');
  const bloco1 = `Oi, ${name}! Tudo bem? 😊

Encontrei a ${plural(lead, 'sua página', 'página de vocês')} e fui dar uma olhada com atenção.

${ratingSentence}

Dá pra ver que ${plural(lead, 'você faz', 'vocês fazem')} um trabalho sério em ${services}. 💛

Enquanto navegava, notei alguns pontos que dava pra deixar mais bonitos e mais fáceis para quem quer ${plural(lead, 'marcar uma consulta', 'agendar ou chamar pelo WhatsApp')}.

Aí não resisti e montei uma nova versão da página, mantendo a identidade e as informações principais, só que num visual bem mais premium.

Organizei os principais serviços com destaque, criei uma seção de atendimento e deixei tudo levando direto para o WhatsApp, perfeito no celular.

Dá uma olhada e navega à vontade 👇

${urlLine}`;

  const bloco2 = `Oi, ${name}! Preparei um resumo pra ${plural(lead, 'você', 'vocês')} 👇

(envie a imagem da proposta aqui)

Fica assim. Um valor único de R$497 para deixar tudo pronto e publicado no ${plural(lead, 'seu domínio próprio', 'domínio próprio de vocês')}, e R$37,90 por mês cuidando da hospedagem e da manutenção, para o site seguir no ar, rápido e sempre atualizado.

Se fizer sentido pra ${plural(lead, 'você', 'vocês')}, eu já coloco no ar e passo o passo a passo.

${plural(lead, 'Prefere acertar os detalhes por aqui mesmo, ou marco uma ligação rápida amanhã?', 'Preferem acertar os detalhes por aqui mesmo, ou marco uma ligação rápida amanhã?')} 🙌`;

  const toque1 = `Oi, ${name}! Passando pra saber se ${plural(lead, 'você chegou', 'vocês chegaram')} a ver o site novo que mandei.

Se tiver algo que ${plural(lead, 'você mudaria', 'vocês mudariam')}, uma cor, um texto, uma foto, eu ajusto pra ficar do ${plural(lead, 'seu jeito', 'jeito de vocês')}. 😊`;

  const toque2 = `Oi, ${name}! Só pra deixar claro, esse é o trabalho que eu faço: ajudo profissionais e clínicas como ${plural(lead, 'você', 'vocês')} a terem um site que traz mais pacientes e passa mais autoridade.

Fiz ${plural(lead, 'o seu', 'o de vocês')} como demonstração, sem compromisso.

Se fizer sentido, explico como deixar ele no ar. Quer que eu mande os detalhes?`;

  const toque3 = `Oi, ${name}! Imagino que a correria ${plural(lead, 'do consultório', 'da clínica')} tenha falado mais alto, sem problema.

Vou deixar o link no ar por mais 24 horas.

Se um dia ${plural(lead, 'quiser', 'quiserem')} colocar no ar, é só me chamar que retomo na hora.

Sucesso, viu! 🙌`;

  return { bloco1, bloco2, toque1, toque2, toque3 };
}

function renderPage(lead) {
  const services = lead.services.map((service) => `
          <article class="service-card">
            <span aria-hidden="true"></span>
            <h3>${escapeHtml(service)}</h3>
            <p>Serviço real identificado no site atual, reorganizado para facilitar decisão e contato pelo WhatsApp.</p>
          </article>`).join('');
  const whatsapp = waLink(lead.phone, `Olá! Vim pelo site e gostaria de agendar uma avaliação com ${lead.nome}.`);
  const hasRating = /^\d/.test(lead.rating);
  const ratingText = hasRating ? `${lead.rating} no Google` : 'Presença local';
  const reviewsText = hasRating ? `${lead.reviews} avaliações` : 'dados do site atual';
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(lead.nome)} | Atendimento odontológico</title>
  <meta name="description" content="Nova versão demonstrativa para ${escapeHtml(lead.nome)}, com serviços reais, contato e endereço preservados.">
  <style>
    :root {
      --primary: ${lead.visual.primary};
      --secondary: ${lead.visual.secondary};
      --accent: ${lead.visual.accent};
      --ink: #12323f;
      --muted: #5f7380;
      --line: #dbe7ec;
      --paper: #f7fbfc;
      --white: #ffffff;
      --shadow: 0 24px 70px rgba(18, 50, 63, .14);
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: var(--ink); background: var(--paper); line-height: 1.55; }
    a { color: inherit; text-decoration: none; }
    .wrap { width: min(1120px, calc(100% - 32px)); margin: 0 auto; }
    .topbar { background: var(--secondary); color: var(--white); font-size: 14px; }
    .topbar .wrap { display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; flex-wrap: wrap; }
    header { position: sticky; top: 0; z-index: 20; background: rgba(255,255,255,.94); border-bottom: 1px solid var(--line); backdrop-filter: blur(14px); }
    header .wrap { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 24px; padding: 14px 0; }
    .brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
    .mark { width: 52px; height: 52px; border-radius: 8px; display: grid; place-items: center; color: white; background: linear-gradient(135deg, var(--primary), var(--accent)); font-weight: 800; }
    .brand strong { display: block; font-size: 18px; }
    .brand small { color: var(--muted); }
    nav { display: flex; justify-content: center; gap: 22px; color: var(--muted); font-size: 14px; }
    .btn { min-height: 48px; border-radius: 8px; padding: 0 18px; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; color: white; background: var(--accent); box-shadow: 0 14px 28px rgba(5, 150, 105, .22); border: 1px solid transparent; }
    .btn.alt { background: white; color: var(--ink); border-color: var(--line); box-shadow: none; }
    .hero { background: radial-gradient(circle at 85% 18%, rgba(34,211,238,.26), transparent 28%), linear-gradient(120deg, rgba(255,255,255,.98), rgba(236,254,255,.90)); border-bottom: 1px solid var(--line); }
    .hero-grid { min-height: 650px; display: grid; grid-template-columns: 1.05fr .75fr; gap: 44px; align-items: center; padding: 72px 0; }
    .eyebrow { color: var(--primary); font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 14px; }
    h1, h2, h3, p { margin-top: 0; }
    h1 { font-size: clamp(42px, 6vw, 72px); line-height: 1; letter-spacing: 0; margin-bottom: 22px; }
    h2 { font-size: clamp(30px, 4vw, 48px); line-height: 1.08; margin-bottom: 14px; }
    .lead { color: var(--muted); font-size: 20px; max-width: 720px; margin-bottom: 28px; }
    .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
    .trust { display: flex; gap: 10px; flex-wrap: wrap; }
    .pill { border: 1px solid var(--line); background: rgba(255,255,255,.72); border-radius: 999px; padding: 9px 13px; color: var(--muted); font-size: 14px; }
    .hero-panel { background: white; border: 1px solid var(--line); border-radius: 8px; box-shadow: var(--shadow); overflow: hidden; }
    .photo { min-height: 260px; background: linear-gradient(135deg, var(--secondary), var(--primary)); position: relative; display: grid; place-items: center; color: white; padding: 32px; text-align: center; }
    .photo svg { width: min(260px, 80%); height: auto; opacity: .92; }
    .panel-body { padding: 24px; }
    .metric-grid { display: grid; grid-template-columns: repeat(2, 1fr); border-top: 1px solid var(--line); }
    .metric { padding: 18px 24px; border-right: 1px solid var(--line); }
    .metric:last-child { border-right: 0; }
    .metric strong { display: block; font-size: 24px; color: var(--primary); }
    section { padding: 78px 0; }
    .section-head { max-width: 760px; margin-bottom: 34px; }
    .section-head p, .split p { color: var(--muted); font-size: 18px; }
    .cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
    .service-card, .quote, .info-card { background: white; border: 1px solid var(--line); border-radius: 8px; padding: 24px; box-shadow: 0 12px 28px rgba(18,50,63,.07); }
    .service-card span { width: 38px; height: 38px; border-radius: 8px; display: block; background: linear-gradient(135deg, var(--primary), var(--accent)); margin-bottom: 16px; }
    .service-card h3 { font-size: 21px; margin-bottom: 9px; }
    .service-card p, .quote p, .info-card p { color: var(--muted); margin-bottom: 0; }
    .soft { background: #eaf7fa; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
    .split { display: grid; grid-template-columns: .9fr 1.1fr; gap: 42px; align-items: center; }
    .proof-list { display: grid; gap: 14px; }
    .proof-item { display: grid; grid-template-columns: 44px 1fr; gap: 14px; align-items: start; }
    .proof-item b { width: 44px; height: 44px; border-radius: 8px; background: white; border: 1px solid var(--line); display: grid; place-items: center; color: var(--primary); }
    .cta-band { background: var(--secondary); color: white; padding: 58px 0; }
    .cta-band .wrap { display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: center; }
    .cta-band p { color: rgba(255,255,255,.78); margin-bottom: 0; }
    footer { background: white; border-top: 1px solid var(--line); padding: 42px 0; color: var(--muted); }
    .footer-grid { display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 24px; }
    footer strong { color: var(--ink); display: block; margin-bottom: 7px; }
    @media (max-width: 860px) {
      header .wrap, .hero-grid, .cards, .split, .cta-band .wrap, .footer-grid { grid-template-columns: 1fr; }
      nav { display: none; }
      header .btn, .actions .btn { width: 100%; }
      .hero-grid { min-height: auto; padding: 52px 0; }
      h1 { font-size: 42px; }
      section { padding: 56px 0; }
      .metric-grid { grid-template-columns: 1fr; }
      .metric { border-right: 0; border-bottom: 1px solid var(--line); }
      .metric:last-child { border-bottom: 0; }
    }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="wrap">
      <span>${escapeHtml(lead.address)}</span>
      <a href="${whatsapp}" target="_blank" rel="noopener">${escapeHtml(lead.contact)}</a>
    </div>
  </div>
  <header>
    <div class="wrap">
      <a class="brand" href="#inicio" aria-label="${escapeHtml(lead.nome)}">
        <div class="mark">${escapeHtml(lead.nome.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase())}</div>
        <div><strong>${escapeHtml(lead.nome)}</strong><small>${escapeHtml(lead.nicho)} em ${escapeHtml(lead.regiao)}</small></div>
      </a>
      <nav aria-label="Navegação principal">
        <a href="#servicos">Serviços</a>
        <a href="#prova">Diferenciais</a>
        <a href="#localizacao">Localização</a>
      </nav>
      <a class="btn" href="${whatsapp}" target="_blank" rel="noopener">Agendar pelo WhatsApp</a>
    </div>
  </header>
  <main id="inicio">
    <section class="hero">
      <div class="wrap hero-grid">
        <div>
          <div class="eyebrow">Nova versão demonstrativa</div>
          <h1>${escapeHtml(lead.nome)} com presença digital mais clara e premium</h1>
          <p class="lead">Uma reorganização da página atual com as informações reais preservadas: serviços, contato, localização e chamadas diretas para agendamento.</p>
          <div class="actions">
            <a class="btn" href="${whatsapp}" target="_blank" rel="noopener">Quero agendar uma avaliação</a>
            <a class="btn alt" href="#servicos">Ver serviços</a>
          </div>
          <div class="trust">
            <span class="pill">${escapeHtml(ratingText)}</span>
            <span class="pill">${escapeHtml(reviewsText)}</span>
            <span class="pill">${escapeHtml(lead.platform)}</span>
          </div>
        </div>
        <aside class="hero-panel" aria-label="Resumo">
          <div class="photo">
            <svg viewBox="0 0 320 220" role="img" aria-label="Ilustração de consultório odontológico">
              <rect x="24" y="42" width="272" height="136" rx="18" fill="rgba(255,255,255,.20)"/>
              <circle cx="108" cy="105" r="34" fill="rgba(255,255,255,.86)"/>
              <path d="M174 78h68M174 108h88M174 138h58" stroke="white" stroke-width="13" stroke-linecap="round"/>
              <path d="M94 101c12-22 36-22 48 0 7 14-2 38-15 54-4 5-10 5-14 0-13-16-22-40-19-54z" fill="var(--accent)"/>
            </svg>
          </div>
          <div class="panel-body">
            <h2>Atendimento mais fácil de entender e chamar</h2>
            <p>${escapeHtml(lead.reason)}</p>
          </div>
          <div class="metric-grid">
            <div class="metric"><strong>${escapeHtml(ratingText)}</strong><span>prova social</span></div>
            <div class="metric"><strong>CTA direto</strong><span>WhatsApp em todos os pontos</span></div>
          </div>
        </aside>
      </div>
    </section>
    <section id="servicos">
      <div class="wrap">
        <div class="section-head">
          <div class="eyebrow">Serviços reais do site atual</div>
          <h2>Especialidades organizadas para decisão rápida</h2>
          <p>O conteúdo foi reorganizado para que o visitante entenda rapidamente o que a clínica faz e tenha um caminho claro para conversar pelo WhatsApp.</p>
        </div>
        <div class="cards">${services}
        </div>
      </div>
    </section>
    <section class="soft" id="prova">
      <div class="wrap split">
        <div class="quote">
          <div class="eyebrow">Identidade preservada</div>
          <h2>Reconhecível, só que mais forte</h2>
          <p>${escapeHtml(lead.sourceType)} A nova versão mantém as informações principais e melhora hierarquia, clareza, leitura no celular e chamadas de agendamento.</p>
        </div>
        <div class="proof-list">
          <div class="proof-item"><b>1</b><p><strong>Dados reais.</strong> Serviços, endereço e contato vieram do site atual ou de fonte pública localizada durante a simulação.</p></div>
          <div class="proof-item"><b>2</b><p><strong>Prova social.</strong> ${escapeHtml(lead.proof)}.</p></div>
          <div class="proof-item"><b>3</b><p><strong>Conversão.</strong> CTAs de consulta, localização e informações levam para WhatsApp/telefone publicado.</p></div>
        </div>
      </div>
    </section>
    <section id="localizacao">
      <div class="wrap split">
        <div>
          <div class="eyebrow">Localização</div>
          <h2>${escapeHtml(lead.address)}</h2>
          <p>Endereço preservado do site atual ou da fonte pública consultada. Antes de publicar no domínio definitivo do cliente, a rotina deve revisar eventuais mudanças de endereço e horário.</p>
          <div class="actions">
            <a class="btn" href="${whatsapp}" target="_blank" rel="noopener">Confirmar atendimento</a>
            <a class="btn alt" href="${escapeHtml(lead.mapsLink)}" target="_blank" rel="noopener">Abrir localização</a>
          </div>
        </div>
        <div class="info-card">
          <h3>Contato</h3>
          <p>${escapeHtml(lead.contact)}</p>
          ${lead.email ? `<p>${escapeHtml(lead.email)}</p>` : ''}
          <p>Site atual: ${escapeHtml(lead.currentSite)}</p>
        </div>
      </div>
    </section>
    <section class="cta-band">
      <div class="wrap">
        <div>
          <h2>Pronto para receber pacientes com mais clareza</h2>
          <p>Versão demonstrativa criada para mostrar como a página atual pode ficar mais profissional sem perder a identidade.</p>
        </div>
        <a class="btn" href="${whatsapp}" target="_blank" rel="noopener">Falar pelo WhatsApp</a>
      </div>
    </section>
  </main>
  <footer>
    <div class="wrap footer-grid">
      <div><strong>${escapeHtml(lead.nome)}</strong><span>Redesign demonstrativo baseado em informações públicas do site atual.</span></div>
      <div><strong>Contato</strong><span>${escapeHtml(lead.contact)}</span></div>
      <div><strong>Site atual</strong><span>${escapeHtml(lead.platform)}</span></div>
    </div>
  </footer>
</body>
</html>`;
}

const headers = [
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
  'slug',
  'URL curta validada',
  'subdomínio opcional',
  'status DNS subdomínio',
  'arquivo local da nova versão',
  'print site atual',
  'print nova versão desktop',
  'print nova versão mobile',
  'link wa.me',
  'status',
  'observações',
  'Bloco 1 (Link)',
  'Bloco 2 (Proposta)',
  'Toque 1 (2 dias)',
  'Toque 2 (5 dias)',
  'Toque 3 (10 dias)',
];

await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(screenshotsDir, { recursive: true });

const rows = [];
for (const lead of leads) {
  const messages = makeMessages(lead);
  const leadDir = path.join(publicDir, lead.slug);
  await fs.mkdir(leadDir, { recursive: true });
  await fs.writeFile(path.join(leadDir, 'index.html'), renderPage(lead), 'utf8');

  const firstText = `Olá! Vim pelo site da ${lead.nome} e gostaria de agendar uma avaliação.`;
  const localPage = `public/${lead.slug}/index.html`;
  rows.push({
    data: today,
    rank: lead.rank,
    nicho: lead.nicho,
    região: lead.regiao,
    nome: lead.nome,
    nota: lead.rating,
    avaliações: lead.reviews,
    contato: lead.contact,
    'WhatsApp/telefone normalizado': lead.phone,
    'site atual': lead.currentSite,
    'link Maps': lead.mapsLink,
    'motivo da abordagem': lead.reason,
    slug: lead.slug,
    'URL curta validada': linkUrl(lead),
    'subdomínio opcional': '',
    'status DNS subdomínio': 'NAO_SOLICITADO',
    'arquivo local da nova versão': localPage,
    'print site atual': `teste-prospeccao-assistida-2026-07-10/simulacao-dia-completo-2026-07-10/prints/${lead.slug}-site-atual.png`,
    'print nova versão desktop': `teste-prospeccao-assistida-2026-07-10/simulacao-dia-completo-2026-07-10/prints/${lead.slug}-desktop.png`,
    'print nova versão mobile': `teste-prospeccao-assistida-2026-07-10/simulacao-dia-completo-2026-07-10/prints/${lead.slug}-mobile.png`,
    'link wa.me': waLink(lead.phone, firstText),
    status: 'PRONTO_PARA_BUILD_VALIDAR_URL_CURTA',
    observações: `${lead.sourceType} Nota: ${lead.rating}${lead.reviews ? ` (${lead.reviews} avaliações)` : ''}.`,
    'Bloco 1 (Link)': messages.bloco1,
    'Bloco 2 (Proposta)': messages.bloco2,
    'Toque 1 (2 dias)': messages.toque1,
    'Toque 2 (5 dias)': messages.toque2,
    'Toque 3 (10 dias)': messages.toque3,
  });
}

const csv = [headers.join(',')]
  .concat(rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')))
  .join('\r\n');

const csvPath = path.join(outDir, 'simulacao-dia-completo-leads-2026-07-10.csv');
const jsonPath = path.join(outDir, 'simulacao-dia-completo-leads-2026-07-10.json');
await fs.writeFile(csvPath, csv, 'utf8');
await fs.writeFile(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), leads: rows }, null, 2), 'utf8');

const report = `# Simulação completa da tarefa diária - ${today}

Total de prospects acionáveis simulados: ${leads.length}

Critério usado: site atual fraco/improvisado, contato disponível, URL atual válida e possibilidade de redesign com CTA para WhatsApp/telefone.

Observação importante: quando a nota do Google não foi localizada com confiança durante o teste, o campo ficou como "Pendente validar Maps" em vez de ser inventado.

Arquivos gerados:
- CSV: ${path.relative(root, csvPath)}
- JSON: ${path.relative(root, jsonPath)}
- Páginas: public/<slug>/index.html
`;
await fs.writeFile(path.join(outDir, 'relatorio-simulacao-dia-completo-2026-07-10.md'), report, 'utf8');

console.log(JSON.stringify({ csvPath, jsonPath, leads: leads.length, slugs: leads.map((lead) => lead.slug) }, null, 2));
