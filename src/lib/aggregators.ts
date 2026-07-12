// Agregador de links (estilo "linktree") — config-driven para virar produto.
// Cada cliente = uma config aqui; a página pública é /l/:slug (ver LinkAggregator.tsx).

export type AggregatorLinkIcon = "whatsapp" | "globe" | "link";

export type AggregatorLink = {
  label: string;
  sublabel?: string;
  href: string;
  variant: "primary" | "secondary";
  icon?: AggregatorLinkIcon;
};

export type AggregatorConfig = {
  slug: string;
  name: string;
  /** id do preset de tema (ver aggregatorThemes.ts); default "funil". */
  theme?: string;
  tagline?: string;
  /** Foto do perfil; sem ela, usa a marca-funil padrão (ouro). */
  avatarUrl?: string;
  /** Ex.: "Disponível para diagnóstico" — renderiza com um ponto esmeralda pulsante. */
  status?: string;
  /** Rodapé-sussurro (ex.: as 4 camadas). */
  footer?: string;
  /** Uma palavra do rodapé destacada em ouro. */
  footerHighlight?: string;
  /** Recomendado no máximo 2. */
  links: AggregatorLink[];
};

export const AGGREGATORS: Record<string, AggregatorConfig> = {
  bio: {
    slug: "bio",
    name: "Funil Comercial",
    theme: "funil",
    tagline: "Estrutura de vendas para negócio local.",
    status: "Disponível para diagnóstico",
    footer: "Presença · Aquisição · Conversão · Escala",
    footerHighlight: "Conversão",
    links: [
      {
        variant: "primary",
        icon: "whatsapp",
        label: "Diagnóstico no WhatsApp",
        sublabel: "Grátis · resposta rápida",
        href: "https://wa.me/5551996737359?text=Quero%20um%20diagn%C3%B3stico%20gratuito%20da%20minha%20estrutura%20de%20vendas",
      },
      {
        variant: "secondary",
        icon: "globe",
        label: "Site — funilcomercial.com",
        sublabel: "Método completo das 4 camadas",
        href: "https://funilcomercial.com",
      },
    ],
  },
};

export const getAggregator = (slug?: string): AggregatorConfig | undefined =>
  slug ? AGGREGATORS[slug.toLowerCase()] : undefined;
