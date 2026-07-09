// Catálogo de produtos/serviços oferecidos na prospecção ativa.
// Usado para: (1) o seletor no modal de oportunidade e (2) a auto-detecção do
// produto a partir da conversa ao criar a oportunidade pelo Inbox.

export const PRODUCTS = [
  "Site / Landing Page",
  "Google Meu Negócio",
  "Tráfego Pago",
  "Social Media / Criativos",
] as const;

export type Product = (typeof PRODUCTS)[number];

// Preço de entrada ("a partir de") de cada produto. Vira o `valor` da
// oportunidade (que já soma no card e na métrica "Pipeline Aberto").
export const PRODUCT_PRICES: Partial<Record<Product, number>> = {
  "Site / Landing Page": 497,
  "Google Meu Negócio": 800,
  "Tráfego Pago": 1497,
  // Social Media / Criativos: preço sob consulta (sem default).
};

// Mensalidade recorrente, quando houver (apenas informativo no card).
export const PRODUCT_MONTHLY: Partial<Record<Product, number>> = {
  "Site / Landing Page": 37.9,
};

export const priceForProduct = (produto: string | null | undefined): number | null => {
  if (!produto) return null;
  const price = (PRODUCT_PRICES as Record<string, number>)[produto];
  return typeof price === "number" ? price : null;
};

export const monthlyForProduct = (produto: string | null | undefined): number | null => {
  if (!produto) return null;
  const monthly = (PRODUCT_MONTHLY as Record<string, number>)[produto];
  return typeof monthly === "number" ? monthly : null;
};

const stripDiacritics = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Palavras-chave por produto (sem acento, minúsculas). A primeira correspondência
// vence, na ordem de PRODUCTS.
const PRODUCT_KEYWORDS: Array<{ product: Product; keywords: string[] }> = [
  {
    product: "Site / Landing Page",
    keywords: ["site", "website", "landing", "pagina", "hotsite", "one page", "web"],
  },
  {
    product: "Google Meu Negócio",
    keywords: ["google meu negocio", "meu negocio", "gmn", "perfil da empresa", "perfil do google", "google maps", "maps", "ficha do google"],
  },
  {
    product: "Tráfego Pago",
    keywords: ["trafego", "anuncio", "anuncios", "ads", "google ads", "meta ads", "facebook ads", "campanha", "impulsion", "patrocinado", "gestor de trafego"],
  },
  {
    product: "Social Media / Criativos",
    keywords: ["social media", "redes sociais", "instagram", "post", "postagem", "criativo", "criativos", "feed", "reels", "conteudo", "design"],
  },
];

// Detecta o produto tratado a partir do texto da conversa. Retorna null quando
// nada é reconhecido (a oportunidade fica sem produto até ser ajustada).
export function inferProductFromMessage(text: string | null | undefined): Product | null {
  const normalized = stripDiacritics(text ?? "");
  if (!normalized.trim()) return null;
  for (const { product, keywords } of PRODUCT_KEYWORDS) {
    if (keywords.some((kw) => normalized.includes(stripDiacritics(kw)))) {
      return product;
    }
  }
  return null;
}
