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
