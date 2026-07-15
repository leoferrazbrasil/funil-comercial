import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import { SeoHead } from "../components/SeoHead";
import { glossarioTerms } from "../lib/glossarioData";
import { BookA } from "lucide-react";

export default function GlossarioIndex() {
  const sortedTerms = [...glossarioTerms].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div data-theme="dark" className="min-h-screen bg-background text-foreground font-sans">
      <SeoHead 
        title="Dicionário de Vendas e Marketing Digital"
        description="Um glossário completo e descomplicado para você entender CAC, LTV, Leads, Funil de Vendas e todas as métricas do mundo dos negócios locais."
        canonicalUrl="https://funilcomercial.com/glossario"
      />
      
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
          <Link to="/" aria-label="Funil Comercial">
            <Logo iconSize={32} theme="monochrome-white" />
          </Link>
          <Link 
            to="/" 
            className="text-sm font-semibold hover:text-primary transition"
          >
            Voltar para o Início
          </Link>
        </div>
      </header>

      <main className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="mb-16 text-center">
             <div className="flex justify-center mb-6">
                <div className="bg-primary/20 text-primary p-4 rounded-full border border-primary/20">
                   <BookA size={40} />
                </div>
             </div>
             <h1 className="text-4xl font-black md:text-5xl lg:text-6xl mb-6 tracking-tight">
                Dicionário de <span className="text-primary">Vendas e Marketing</span>
             </h1>
             <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Tudo o que você precisa saber sobre estratégias e métricas (CAC, LTV, Leads) para colocar a sua empresa no caminho do crescimento.
             </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
             {sortedTerms.map((term) => (
               <Link 
                 key={term.slug}
                 to={`/glossario/${term.slug}`}
                 className="group flex flex-col justify-between p-8 rounded-2xl bg-card/30 border border-white/5 hover:bg-card/60 hover:border-primary/30 transition-all"
               >
                  <div>
                    <h3 className="text-2xl font-bold group-hover:text-primary transition-colors mb-3">
                      {term.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-3">
                      {term.description}
                    </p>
                  </div>
                  <div className="mt-6 text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Ler explicação completa &rarr;
                  </div>
               </Link>
             ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-12 text-center mt-12">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Funil Comercial. Todos os direitos reservados.
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <Link to="/cidades-atendidas" className="text-xs text-muted-foreground hover:text-primary transition">Cidades Atendidas</Link>
          <Link to="/blog" className="text-xs text-muted-foreground hover:text-primary transition">Blog</Link>
        </div>
      </footer>
    </div>
  );
}
