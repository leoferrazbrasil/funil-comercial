import { Link } from "react-router";
import Logo from "../components/Logo";
import { SeoHead } from "../components/SeoHead";
import locationsData from "../lib/seoLocations.json";

export default function CitiesDirectory() {
  const { TARGET_CITIES, NICHES } = locationsData;

  // Group cities by state
  const citiesByState = TARGET_CITIES.reduce((acc, cityObj) => {
    const estadoUpper = cityObj.estado.toUpperCase();
    if (!acc[estadoUpper]) {
      acc[estadoUpper] = [];
    }
    acc[estadoUpper].push(cityObj);
    return acc;
  }, {} as Record<string, typeof TARGET_CITIES>);

  const estadosSorted = Object.keys(citiesByState).sort();

  return (
    <div data-theme="dark" className="min-h-screen bg-background text-foreground">
      <SeoHead 
        title="Cidades Atendidas - Funil Comercial"
        description="Confira todas as cidades e estados onde criamos sites profissionais e estruturas de vendas otimizadas para negócios locais."
        canonicalUrl="https://funilcomercial.com/cidades-atendidas"
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
             <h1 className="text-4xl font-black md:text-5xl lg:text-6xl mb-6">
                Cidades e Regiões Atendidas
             </h1>
             <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Desenvolvemos estruturas de vendas e sites profissionais de alta conversão 
                para mais de {TARGET_CITIES.length} cidades no Brasil. Selecione a sua região abaixo para ver as especialidades atendidas.
             </p>
          </div>

          <div className="flex flex-col gap-12">
             {estadosSorted.map(estado => (
               <section key={estado}>
                 <h2 className="text-3xl font-bold mb-6 border-b border-white/10 pb-4 text-primary">
                    Estado: {estado}
                 </h2>
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                   {citiesByState[estado].map(city => (
                     <div key={city.cidade} className="rounded-xl border border-white/10 bg-card/30 p-6">
                        <h3 className="text-xl font-bold mb-4">{city.nome}</h3>
                        <ul className="flex flex-col gap-2">
                           {NICHES.map(niche => (
                             <li key={niche.slug} className="mb-4">
                                <Link 
                                  to={`/local/${niche.slug}/${city.estado}/${city.cidade}`}
                                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-primary/50 before:rounded-full hover:before:bg-primary"
                                >
                                   Site para {niche.nome} em {city.nome}
                                </Link>
                                <Link 
                                  to={`/blog/guia-de-vendas/${niche.slug}/${city.estado}/${city.cidade}`}
                                  className="text-xs text-muted-foreground/60 hover:text-primary transition-colors ml-3 mt-1 flex items-center gap-2 before:content-['↳']"
                                >
                                   Guia de Atração de {niche.nome}
                                </Link>
                             </li>
                           ))}
                        </ul>
                     </div>
                   ))}
                 </div>
               </section>
             ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 text-center mt-12">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Funil Comercial. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
