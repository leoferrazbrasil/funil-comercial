export type ProspectingPreview = {
  slug: string;
  niche: string;
  region: string;
  name: string;
  shortName: string;
  rating: string;
  reviews: string;
  contact: string;
  phone: string;
  email?: string;
  currentSite: string;
  mapsLink: string;
  platform: string;
  reason: string;
  address: string;
  services: string[];
  proof: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
};

export const PROSPECTING_PREVIEWS: ProspectingPreview[] = [
  {
    slug: "kns-odontologia",
    niche: "Dentista",
    region: "Sao Paulo",
    name: "KNS Odontologia",
    shortName: "KNS Odontologia",
    rating: "5,0",
    reviews: "5",
    contact: "WhatsApp (11) 97415-1008",
    phone: "11974151008",
    currentSite: "https://sites.google.com/view/knsodontologia/home",
    mapsLink: "https://www.google.com/maps/search/KNS+Odontologia+Tucuruvi+S%C3%A3o+Paulo",
    platform: "Google Sites",
    reason:
      "Site em Google Sites com layout simples, pouca hierarquia visual e CTA pouco premium para uma clinica com implante, estetica e avaliacao 5,0.",
    address: "Av. Tucuruvi, 666, sala 7 - Tucuruvi, Sao Paulo/SP",
    services: [
      "Implantodontia",
      "Odontologia estetica",
      "Atendimento com hora marcada",
      "Tratamento integral",
    ],
    proof: "atuacao em implantodontia no Tucuruvi",
    colors: { primary: "#0f766e", secondary: "#164e63", accent: "#d4af37" },
  },
  {
    slug: "dra-talita-nacamura",
    niche: "Dentista",
    region: "Sao Paulo",
    name: "Dra. Talita Nacamura",
    shortName: "Talita",
    rating: "Pendente validar Maps",
    reviews: "",
    contact: "WhatsApp (11) 94930-1006",
    phone: "11949301006",
    currentSite: "https://ortodontiavilamariana.wordpress.com/",
    mapsLink: "https://www.google.com/maps/search/Dra+Talita+Nacamura+Vila+Mariana",
    platform: "WordPress.com",
    reason:
      "Pagina antiga de WordPress com aparencia datada, formulario e navegacao pouco comerciais para ortodontia em Vila Mariana.",
    address: "Rua Dr. Neto de Araujo, 320 cj. 408 - Vila Mariana, Sao Paulo/SP",
    services: [
      "Ortodontia",
      "Avaliacao ortodontica",
      "Aparelhos esteticos",
      "Cirurgia oral e buco maxilo facial",
    ],
    proof:
      "formacao pela USP, especializacao em Ortodontia e CRO/SP 92735",
    colors: { primary: "#155e75", secondary: "#7c3aed", accent: "#059669" },
  },
  {
    slug: "brasiliense-odontologia",
    niche: "Dentista",
    region: "Sao Paulo",
    name: "Brasiliense Odontologia",
    shortName: "Brasiliense Odontologia",
    rating: "Pendente validar Maps",
    reviews: "",
    contact: "Telefone (11) 2047-5333 / brasiliense.odontologia@gmail.com",
    phone: "1120475333",
    email: "brasiliense.odontologia@gmail.com",
    currentSite: "https://brasilienseodontol.wixsite.com/my-site",
    mapsLink: "https://www.google.com/maps/search/Brasiliense+Odontologia+Itaquera",
    platform: "Wix",
    reason:
      "Site Wix com visual antigo, marca do construtor, pouca clareza de agenda e contato principal sem WhatsApp destacado.",
    address: "Av. Campanella, 540, sala 3 - Itaquera, Sao Paulo/SP",
    services: [
      "Ortodontia",
      "Convenios",
      "Atendimento com agendamento",
      "Resultados odontologicos",
    ],
    proof:
      "endereco em Itaquera, atendimento com agendamento previo e e-mail comercial publicado",
    colors: { primary: "#0f4c81", secondary: "#78350f", accent: "#047857" },
  },
  {
    slug: "dra-marcia-yamashita",
    niche: "Dentista",
    region: "Sao Paulo",
    name: "Dra. Marcia Yamashita e Equipe",
    shortName: "Marcia",
    rating: "Pendente validar Maps",
    reviews: "",
    contact: "WhatsApp (11) 95589-9390",
    phone: "11955899390",
    currentSite: "https://sites.google.com/view/odontomooca/p%C3%A1gina-inicial",
    mapsLink: "https://www.google.com/maps/search/Dra+M%C3%A1rcia+Yamashita+Mooca",
    platform: "Google Sites",
    reason:
      "Conteudo tecnico forte, mas disperso em Google Sites; oportunidade de transformar especialidades em jornada clara de agendamento.",
    address: "Mooca, Sao Paulo/SP",
    services: [
      "Odontologia do Esporte",
      "DTM",
      "Alinhadores invisiveis",
      "Clareamento dental",
      "Laserterapia",
    ],
    proof:
      "CRO-SP 42930, especialista em Odontologia do Esporte e habilitada em Odontologia do Sono",
    colors: { primary: "#0e7490", secondary: "#1e3a8a", accent: "#16a34a" },
  },
  {
    slug: "vilela-odontologia",
    niche: "Dentista",
    region: "Sao Paulo",
    name: "Vilela Odontologia",
    shortName: "Vilela Odontologia",
    rating: "Pendente validar Maps",
    reviews: "",
    contact: "WhatsApp (11) 98172-5117",
    phone: "11981725117",
    currentSite: "https://vilelaodontologia.wordpress.com/",
    mapsLink: "https://www.google.com/maps/search/Vilela+Odontologia+Barra+Funda",
    platform: "WordPress.com",
    reason:
      "Pagina WordPress simples, com rodape do construtor e CTA pouco forte para uma equipe com ortodontia e implantes.",
    address: "R. do Bosque, 1589, sala 1306 - Barra Funda, Sao Paulo/SP",
    services: [
      "Ortodontia",
      "Implante",
      "Planos odontologicos",
      "Consulta por telefone, WhatsApp ou Facebook",
    ],
    proof:
      "equipe com Dra. Luana Vilela Silva em ortodontia e Dr. Thiago Vilela dos Santos em implante",
    colors: { primary: "#134e4a", secondary: "#581c87", accent: "#ca8a04" },
  },
  {
    slug: "cidmep-odontologia",
    niche: "Dentista",
    region: "Sao Paulo",
    name: "CIDMEP Odontologia",
    shortName: "CIDMEP",
    rating: "Pendente validar Maps",
    reviews: "",
    contact: "WhatsApp (11) 95761-6388 / cidmep.odontologia@gmail.com",
    phone: "11957616388",
    email: "cidmep.odontologia@gmail.com",
    currentSite: "https://sites.google.com/view/cidmep/contato",
    mapsLink: "https://www.google.com/maps/search/CIDMEP+Odontologia+Aclima%C3%A7%C3%A3o",
    platform: "Google Sites",
    reason:
      "Pagina de contato muito basica, quase sem proposta de valor, ideal para redesign focado em agendamento e autoridade.",
    address: "Rua Castro Alves, 1002 A - Aclimacao, Sao Paulo/SP",
    services: [
      "Clinica odontologica",
      "Agendamento de consulta",
      "Atendimento por WhatsApp",
    ],
    proof: "endereco na Aclimacao, e-mail comercial e WhatsApp publicados",
    colors: { primary: "#075985", secondary: "#334155", accent: "#059669" },
  },
  {
    slug: "dr-alexandre-serrano-lima",
    niche: "Dentista",
    region: "Sao Paulo",
    name: "Dr. Alexandre Serrano Lima",
    shortName: "Alexandre",
    rating: "Pendente validar Maps",
    reviews: "",
    contact: "WhatsApp (11) 95812-7911 / dr.aslima@gmail.com",
    phone: "11958127911",
    email: "dr.aslima@gmail.com",
    currentSite: "https://aslodontologia.wordpress.com/",
    mapsLink: "https://www.google.com/maps/search/Dr+Alexandre+Serrano+Lima+Santo+Andr%C3%A9",
    platform: "WordPress.com",
    reason:
      "Conteudo rico e servicos de alto valor, mas apresentacao antiga e pouco direcionada para conversao mobile.",
    address: "Rua Frederico Falbo, 237 - Jardim Milena, Santo Andre/SP",
    services: [
      "Clinica geral",
      "Clareamento dental",
      "Proteses",
      "Facetas ceramicas",
      "Implantes",
      "Harmonizacao orofacial",
    ],
    proof: "24 anos de atuacao, laboratorio de protese proprio e CROSP 66.460",
    colors: { primary: "#0f172a", secondary: "#0e7490", accent: "#b45309" },
  },
  {
    slug: "calligari-odontologia",
    niche: "Dentista",
    region: "Sao Paulo",
    name: "Calligari Odontologia",
    shortName: "Calligari Odontologia",
    rating: "Pendente validar Maps",
    reviews: "",
    contact: "WhatsApp (11) 97256-5552 / Tel. 5641-3272",
    phone: "11972565552",
    currentSite: "https://calligariodontologia.wixsite.com/calligariodontologia",
    mapsLink: "https://www.google.com/maps/search/Calligari+Odontologia+Vila+Cruzeiro",
    platform: "Wix",
    reason:
      "Site Wix antigo com marca do construtor e navegacao simples, apesar de se apresentar como referencia na Zona Sul.",
    address: "R. Doutor Fritz Martin, 34 - Vila Cruzeiro, Sao Paulo/SP",
    services: [
      "Protese",
      "Odontologia estetica",
      "Periodontia",
      "Cirurgia",
      "Endodontia",
      "Harmonizacao facial",
    ],
    proof:
      "clinica fundada pelo Dr. Luiz Calligari, com equipe multidisciplinar na Zona Sul",
    colors: { primary: "#1f2937", secondary: "#0369a1", accent: "#059669" },
  },
  {
    slug: "flavia-martins-dentista",
    niche: "Dentista",
    region: "Sao Paulo",
    name: "Flavia Martins Dentista",
    shortName: "Flavia",
    rating: "Pendente validar Maps",
    reviews: "",
    contact: "WhatsApp/telefone (11) 99714-5045 / (11) 2362-8467",
    phone: "11997145045",
    currentSite: "https://sites.google.com/view/flviamartinsdentista/in%C3%ADcio",
    mapsLink: "https://www.google.com/maps/search/Fl%C3%A1via+Martins+Dentista+Perdizes",
    platform: "Google Sites",
    reason:
      "Pagina extremamente simples, sem hierarquia premium para multiplas especialidades em Perdizes.",
    address: "R. Joao Ramalho, 1370 - Perdizes, Sao Paulo/SP",
    services: [
      "Endodontia",
      "Restauracoes",
      "Estetica",
      "Protese",
      "Periodontia",
      "Odontopediatria",
    ],
    proof: "servicos variados publicados no site atual e atendimento em Perdizes",
    colors: { primary: "#0f766e", secondary: "#831843", accent: "#0891b2" },
  },
  {
    slug: "clins-odontologia",
    niche: "Dentista",
    region: "Sao Paulo",
    name: "Clins Odontologia",
    shortName: "Clins Odontologia",
    rating: "3,3",
    reviews: "3",
    contact: "WhatsApp (11) 97487-2074 / Tel. 11 3348-4840",
    phone: "11974872074",
    currentSite: "https://clinsgerencia.wixsite.com/clins",
    mapsLink: "https://www.google.com/maps/search/Clins+Odontologia+Cambuci",
    platform: "Wix",
    reason:
      "Site Wix com marca do construtor, layout pouco atual e ausencia de proposta clara de agendamento.",
    address: "Av. Lins de Vasconcelos, 1010A - Cambuci, Sao Paulo/SP",
    services: [
      "Clinica odontologica",
      "Atendimento no Cambuci",
      "Contato por telefone e WhatsApp",
    ],
    proof: "presenca no Cambuci com WhatsApp publicado e nota publica 3,3 com 3 avaliacoes",
    colors: { primary: "#075985", secondary: "#14532d", accent: "#eab308" },
  },
];

const previewBySlug = new Map(PROSPECTING_PREVIEWS.map((preview) => [preview.slug, preview]));

export function normalizePublicPath(pathname: string) {
  const withoutTrailingSlash = pathname.replace(/\/+$/, "");
  return withoutTrailingSlash || "/";
}

export function getProspectingPreviewSlug(pathname: string) {
  const normalized = normalizePublicPath(pathname);
  const segments = normalized.split("/").filter(Boolean);

  if (segments.length === 1 && previewBySlug.has(segments[0])) {
    return segments[0];
  }

  if (
    segments.length === 2 &&
    segments[1] === "index.html" &&
    previewBySlug.has(segments[0])
  ) {
    return segments[0];
  }

  return null;
}

export function getProspectingPreview(slug: string | null | undefined) {
  return slug ? previewBySlug.get(slug) ?? null : null;
}

export function isProspectingPreviewPath(pathname: string) {
  return getProspectingPreviewSlug(pathname) !== null;
}
