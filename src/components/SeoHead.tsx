import { Helmet } from "react-helmet-async";
import { brandConfig } from "../lib/branding";

interface SeoHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  image?: string;
  schema?: Record<string, any> | Record<string, any>[];
  noindex?: boolean;
  breadcrumbs?: { name: string; url: string }[];
}

export function SeoHead({
  title,
  description,
  canonicalUrl,
  image = "https://funilcomercial.com/logo.png",
  schema,
  noindex = false,
  breadcrumbs,
}: SeoHeadProps) {
  const defaultTitle = `${brandConfig.name} — Estrutura de Vendas para Negócios Locais`;
  const finalTitle = title ? `${title} | ${brandConfig.name}` : defaultTitle;
  
  const defaultDescription = "Montamos a sua estrutura de vendas. Site, Google, anúncios, WhatsApp e CRM funcionando juntos, de ponta a ponta.";
  const finalDescription = description || defaultDescription;
  
  const finalCanonical = canonicalUrl || "https://funilcomercial.com";

  // Breadcrumb Schema
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  } : null;

  // Combine schemas if both exist
  let finalSchema: any[] = [];
  if (schema) {
    if (Array.isArray(schema)) {
      finalSchema = [...schema];
    } else {
      finalSchema.push(schema);
    }
  }
  if (breadcrumbSchema) {
    finalSchema.push(breadcrumbSchema);
  }

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
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
      {finalSchema.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(finalSchema.length === 1 ? finalSchema[0] : finalSchema)}
        </script>
      )}
    </Helmet>
  );
}

// Helper to generate unified Entity Graph Schema (@graph with Organization, Person, WebSite, Service)
export const generateEntityGraphSchema = () => {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://funilcomercial.com/#website",
        "url": "https://funilcomercial.com",
        "name": brandConfig.name,
        "description": "Estrutura de Vendas para Negócios Locais",
        "publisher": {
          "@id": "https://funilcomercial.com/#organization"
        },
        "inLanguage": "pt-BR"
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://funilcomercial.com/#organization",
        "name": brandConfig.name,
        "url": "https://funilcomercial.com",
        "logo": "https://funilcomercial.com/logo.png",
        "image": "https://funilcomercial.com/logo.png",
        "telephone": "+5551996737359",
        "email": "funil@funilcomercial.com",
        "description": "Montamos a sua estrutura de vendas para negócios locais de ponta a ponta.",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "BR"
        },
        "founder": {
          "@id": "https://funilcomercial.com/#person"
        },
        "priceRange": "$$"
      },
      {
        "@type": "Person",
        "@id": "https://funilcomercial.com/#person",
        "name": "Leonardo Brasil",
        "url": "https://funilcomercial.com",
        "jobTitle": "Fundador & Estrategista Comercial",
        "worksFor": {
          "@id": "https://funilcomercial.com/#organization"
        },
        "image": "https://funilcomercial.com/images/leo-avatar.jpg"
      },
      {
        "@type": "Service",
        "@id": "https://funilcomercial.com/#service",
        "name": "Estrutura de Vendas para Negócios Locais",
        "serviceType": "Consultoria e Implementação Comercial",
        "provider": {
          "@id": "https://funilcomercial.com/#organization"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Brasil"
        },
        "description": "Implementação completa de infraestrutura comercial: site de alta conversão, tráfego pago (Google & Meta Ads), automação de WhatsApp e CRM de vendas."
      }
    ]
  };
};

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
export const generateServiceSchema = (
  serviceName: string, 
  description: string,
  cityName?: string,
  stateName?: string
) => {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": serviceName,
    "serviceType": serviceName,
    "provider": {
      "@type": "Organization",
      "name": brandConfig.name,
      "url": "https://funilcomercial.com",
      "logo": "https://funilcomercial.com/logo.png"
    },
    "areaServed": cityName ? {
      "@type": "City",
      "name": cityName,
      "containedInPlace": {
        "@type": "AdministrativeArea",
        "name": stateName || "Brasil"
      }
    } : {
      "@type": "Country",
      "name": "Brasil"
    },
    "description": description,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Estrutura de Vendas Local",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Site de Alta Conversão & SEO Local"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Tráfego Pago Google Ads & Meta Ads"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Funil Comercial CRM para WhatsApp"
          }
        }
      ]
    }
  };
};

// Helper to generate FAQ Schema
export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => {
  if (!faqs || faqs.length === 0) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};
