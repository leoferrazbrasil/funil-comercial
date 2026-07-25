import { useParams, Link } from "react-router";
import ReactMarkdown from "react-markdown";
import Logo from "../components/Logo";
import { SeoHead } from "../components/SeoHead";
import { glossarioTerms } from "../lib/glossarioData";
import { ArrowLeft, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "5551996737359";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=Ol%C3%A1%2C%20estava%20lendo%20o%20Gloss%C3%A1rio%20e%20gostaria%20de%20ajuda%20para%20aplicar%20isso%20no%20meu%20neg%C3%B3cio.`;

export default function GlossarioTermo() {
  const { slug } = useParams();
  const term = glossarioTerms.find(t => t.slug === slug);

  if (!term) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold mb-4">Termo não encontrado</h1>
        <p className="text-muted-foreground mb-8">Desculpe, a definição que você está procurando não existe em nosso glossário.</p>
        <Link to="/glossario" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
          Voltar para o Dicionário
        </Link>
      </div>
    );
  }

  // Related Terms
  const relatedTerms = term.relatedTermSlugs 
    ? glossarioTerms.filter(t => term.relatedTermSlugs?.includes(t.slug))
    : [];

  // Create article/FAQ schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [{
      "@type": "Question",
      "name": term.title,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": term.description
      }
    }]
  };

  return (
    <div data-theme="dark" className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <SeoHead 
        title={term.title}
        description={term.description}
        canonicalUrl={`https://funilcomercial.com/glossario/${term.slug}`}
        schema={faqSchema}
      />
      
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5 md:h-20">
          <Link to="/" aria-label="Funil Comercial">
            <Logo iconSize={32} theme="monochrome-white" />
          </Link>
          <Link 
            to="/glossario" 
            className="text-sm font-semibold hover:text-primary transition flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Voltar ao Dicionário
          </Link>
        </div>
      </header>

      <main className="py-12 md:py-20">
        <article className="mx-auto max-w-3xl px-6 md:px-0">
          <header className="mb-12 border-b border-white/10 pb-8 text-center">
            <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-6 inline-block">
              Termo do Dicionário
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              {term.title}
            </h1>
          </header>

          <div className="prose prose-invert prose-lg md:prose-xl mx-auto prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-white">
            <ReactMarkdown>{term.content}</ReactMarkdown>
          </div>

          {/* Related Terms */}
          {relatedTerms.length > 0 && (
            <div className="mt-16 pt-8 border-t border-white/10">
              <h3 className="text-xl font-bold mb-6">Conceitos Relacionados</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedTerms.map(rt => (
                  <Link 
                    key={rt.slug}
                    to={`/glossario/${rt.slug}`}
                    className="p-4 rounded-xl bg-card/30 border border-white/5 hover:bg-card/60 hover:border-primary/30 transition-all flex justify-between items-center group"
                  >
                    <span className="font-semibold text-sm group-hover:text-primary">{rt.title}</span>
                    <ArrowLeft size={16} className="rotate-180 text-muted-foreground group-hover:text-primary shrink-0 ml-2" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Aggressive CTA Block */}
          <div className="mt-20 overflow-hidden rounded-3xl bg-gradient-to-br from-black to-card border border-white/10 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="relative p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center gap-8">
               <div className="flex-1">
                 <h3 className="text-2xl md:text-3xl font-black mb-4">
                   Não basta apenas entender a teoria. <span className="text-primary">Tem que dar lucro.</span>
                 </h3>
                 <p className="text-muted-foreground text-lg mb-0">
                   Você pode gastar meses estudando {term.title} ou pode chamar a Funil Comercial no WhatsApp para aplicarmos isso no seu negócio ainda essa semana. Nós escalamos clínicas, construtoras e escritórios.
                 </p>
               </div>
               <div className="shrink-0 w-full md:w-auto">
                 <a 
                   href={whatsappLink}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="inline-flex h-14 w-full md:w-auto items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-black text-primary-foreground transition-transform hover:scale-105 shadow-[0_0_40px_-10px_rgba(var(--primary),0.8)]"
                 >
                   <MessageCircle size={20} />
                   Falar com Especialista
                 </a>
               </div>
            </div>
          </div>
        </article>
      </main>
      
      <footer className="border-t border-white/10 py-12 text-center mt-12">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Funil Comercial. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
