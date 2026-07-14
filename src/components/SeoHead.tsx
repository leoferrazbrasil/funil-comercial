import { Helmet } from "react-helmet-async";
import { brandConfig } from "../lib/branding";

interface SeoHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  image?: string;
  schema?: Record<string, any> | Record<string, any>[];
}

export function SeoHead({
  title,
  description,
  canonicalUrl,
  image = "https://funilcomercial.com/logo.png",
  schema,
}: SeoHeadProps) {
  const defaultTitle = `${brandConfig.name} — Estrutura de Vendas para Negócios Locais`;
  const finalTitle = title ? `${title} | ${brandConfig.name}` : defaultTitle;
  
  const defaultDescription = "Montamos a sua estrutura de vendas. Site, Google, anúncios, WhatsApp e CRM funcionando juntos, de ponta a ponta.";
  const finalDescription = description || defaultDescription;
  
  const finalCanonical = canonicalUrl || "https://funilcomercial.com";

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalCanonical} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={image} />

      {/* Canonical */}
      <link rel="canonical" href={finalCanonical} />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

// Helper to generate LocalBusiness Schema
export const generateLocalBusinessSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": brandConfig.name,
    "image": "https://funilcomercial.com/logo.png",
    "@id": "https://funilcomercial.com",
    "url": "https://funilcomercial.com",
    "telephone": "+5551996737359",
    "email": "funil@funilcomercial.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BR"
    },
    "description": "Montamos a sua estrutura de vendas para negócios locais de ponta a ponta.",
    "priceRange": "$$"
  };
};

// Helper to generate Service Schema
export const generateServiceSchema = (serviceName: string, description: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": serviceName,
    "provider": {
      "@type": "LocalBusiness",
      "name": brandConfig.name
    },
    "areaServed": {
      "@type": "Country",
      "name": "Brazil"
    },
    "description": description
  };
};
