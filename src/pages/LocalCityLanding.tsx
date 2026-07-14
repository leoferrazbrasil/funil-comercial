import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Globe,
  MapPin,
  MessageCircle,
  Search,
} from "lucide-react";
import Logo from "../components/Logo";
import { SeoHead, generateLocalBusinessSchema, generateServiceSchema, generateFAQSchema } from "../components/SeoHead";
import { seoNicheData, getDefaultNicheData } from "../lib/seoNicheData";

const WHATSAPP_NUMBER = "5551996737359";

// Helper to format strings like "sao-paulo" to "São Paulo"
function formatLocationName(slug?: string) {
  if (!slug) return "";
  const specialCases: Record<string, string> = {
    "sao-paulo": "São Paulo",
    "rio-de-janeiro": "Rio de Janeiro",
    "belo-horizonte": "Belo Horizonte",
    "curitiba": "Curitiba",
    "campinas": "Campinas",
    "sp": "SP",
    "rj": "RJ",
    "mg": "MG",
    "pr": "PR"
  };
  if (specialCases[slug]) return specialCases[slug];
  
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatNiche(nicho?: string) {
  if (!nicho) return "negócios locais";
  if (nicho === "dentistas") return "dentistas";
  if (nicho === "advogados") return "advogados";
  if (nicho === "psicologas") return "psicólogas";
  if (nicho === "nutricionistas") return "nutricionistas";
  return "negócios locais";
}

export default function LocalCityLanding() {
  const { nicho, estado, cidade } = useParams();
  
  const formattedCidade = formatLocationName(cidade);
  const formattedEstado = formatLocationName(estado);
  const formattedNicho = formatNiche(nicho);
  
  const nicheData = nicho && seoNicheData[nicho] 
    ? seoNicheData[nicho] 
    : getDefaultNicheData(formattedNicho, formattedCidade);
  
  const title = `${nicheData.title} em ${formattedCidade} - ${formattedEstado}`;
  const description = `Procurando criar um site para ${formattedNicho} em ${formattedCidade} (${formattedEstado})? ${nicheData.heroSubtitle} R$497 + hospedagem.`;
  
  const whatsappMessage = `Olá! Quero saber mais sobre a criação de site para ${formattedNicho} em ${formattedCidade}.`;
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  const schema: any[] = [
    generateLocalBusinessSchema(),
    generateServiceSchema(
      `Criação de Site para ${formattedNicho} em ${formattedCidade}`,
      description
    )
  ];

  if (nicheData.faqs) {
    const faqSchema = generateFAQSchema(nicheData.faqs);
    if (faqSchema) schema.push(faqSchema);
  }

  return (
    <div data-theme="dark" className="min-h-screen bg-background text-foreground">
      <SeoHead 
        title={title}
        description={description}
        canonicalUrl={`https://funilcomercial.com/local/${nicho}/${estado}/${cidade}`}
        schema={schema}
      />
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
          <Link to="/" aria-label="Funil Comercial">
            <Logo iconSize={32} theme="monochrome-white" />
          </Link>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            <MessageCircle size={17} />
            Falar no WhatsApp
          </a>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden border-b border-white/10 py-20 md:py-32">
          <div className="mx-auto max-w-7xl px-5 text-center md:px-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
              <MapPin size={16} /> Atendendo {formattedCidade} e região
            </div>
            <h1 className="mx-auto max-w-4xl text-4xl font-black leading-[1.05] sm:text-5xl md:text-7xl">
              Site profissional para {formattedNicho} em <span className="text-primary">{formattedCidade}</span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg md:text-xl">
              {nicheData.heroSubtitle.replace("sua cidade", formattedCidade).replace("sua região", formattedCidade)}
            </p>
            <div className="mt-10 flex justify-center">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-black text-primary-foreground transition hover:bg-primary/90"
              >
                Solicitar orçamento
                <ArrowRight size={19} />
              </a>
            </div>
          </div>
        </section>

        <section className="bg-card/20 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
             <div className="text-center">
               <h2 className="text-3xl font-black md:text-4xl">{nicheData.painPointTitle.replace("sua cidade", formattedCidade).replace("sua região", formattedCidade)}</h2>
               <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
                 {nicheData.painPointDescription.replace("sua cidade", formattedCidade).replace("sua região", formattedCidade)}
               </p>
             </div>
             
             <div className="mt-16 grid gap-6 md:grid-cols-3">
                {nicheData.benefits.map((benefit, i) => (
                  <div key={i} className="rounded-2xl border border-white/5 bg-background/50 p-6 flex gap-4">
                    <CheckCircle2 className="text-primary shrink-0" size={24} />
                    <p className="text-sm md:text-base font-medium">{benefit}</p>
                  </div>
                ))}
             </div>
          </div>
         </section>

         {nicheData.faqs && nicheData.faqs.length > 0 && (
           <section className="bg-background py-20 md:py-28">
             <div className="mx-auto max-w-4xl px-5 md:px-8">
               <div className="text-center mb-12">
                 <h2 className="text-3xl font-black md:text-4xl">Perguntas Frequentes</h2>
                 <p className="mt-4 text-muted-foreground">
                   Tudo o que você precisa saber sobre nosso serviço para {formattedNicho} em {formattedCidade}.
                 </p>
               </div>
               <div className="flex flex-col gap-6">
                 {nicheData.faqs.map((faq, i) => (
                   <div key={i} className="rounded-xl border border-white/10 bg-card/30 p-6">
                     <h3 className="text-xl font-bold mb-3">{faq.question}</h3>
                     <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                   </div>
                 ))}
               </div>
             </div>
           </section>
         )}
      </main>

      <footer className="border-t border-white/10 py-8 text-center flex flex-col gap-4 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Criamos estruturas de vendas para {formattedNicho} no Brasil inteiro.
        </p>
        <div className="flex gap-4">
          <Link to="/blog" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Blog e Estratégias
          </Link>
          <Link to="/cidades-atendidas" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Ver todas as cidades atendidas
          </Link>
        </div>
      </footer>
    </div>
  );
}
