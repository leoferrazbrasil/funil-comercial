import { Link } from "react-router";
import seoLocationsData from "../lib/seoLocations.json";
import { ArrowRight } from "lucide-react";

interface RelatedContentProps {
  currentNiche?: string;
  currentState?: string;
  currentCity?: string;
  intentType?: 'local' | 'agencia' | 'captacao' | 'crm' | 'guia';
}

export function RelatedContent({
  currentNiche,
  currentState,
  currentCity,
  intentType = 'local',
}: RelatedContentProps) {
  if (!currentNiche || !currentState || !currentCity) return null;

  const { TARGET_CITIES, NICHES } = seoLocationsData;

  // Encontra 3 cidades do mesmo estado, excluindo a atual
  const relatedCities = TARGET_CITIES.filter(
    (c) => c.estado === currentState && c.cidade !== currentCity
  ).slice(0, 3);

  // Se não houver 3 cidades no mesmo estado, pega cidades aleatórias do mesmo nível (capital, etc)
  if (relatedCities.length === 0) {
     TARGET_CITIES.filter(c => c.cidade !== currentCity).slice(0, 3).forEach(c => relatedCities.push(c));
  }

  // Encontra 3 nichos diferentes na mesma cidade
  const relatedNiches = NICHES.filter((n) => n.slug !== currentNiche).slice(0, 3);

  const getPath = (niche: string, state: string, city: string) => {
    switch(intentType) {
      case 'agencia': return `/agencia-de-marketing/${niche}/${state}/${city}`;
      case 'captacao': return `/empresa-de-captacao/${niche}/${state}/${city}`;
      case 'crm': return `/melhor-crm/${niche}/${state}/${city}`;
      case 'guia': return `/blog/guia-de-vendas/${niche}/${state}/${city}`;
      case 'local':
      default: return `/local/${niche}/${state}/${city}`;
    }
  };

  const isBlog = intentType === 'guia';

  return (
    <section className="bg-background py-16 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="text-2xl font-bold mb-8">Veja também em sua região</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mesma especialidade em outras cidades */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4 border-b border-white/10 pb-2">
              Em cidades próximas
            </h3>
            <ul className="space-y-3">
              {relatedCities.map((city) => {
                const nicheName = NICHES.find(n => n.slug === currentNiche)?.nome || currentNiche;
                return (
                  <li key={city.cidade}>
                    <Link
                      to={getPath(currentNiche, city.estado, city.cidade)}
                      className="group flex items-center justify-between rounded-lg p-3 hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 text-muted-foreground hover:text-foreground"
                    >
                      <span>
                        {isBlog ? "Guia para " : ""}{nicheName} em {city.nome}
                      </span>
                      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Outras especialidades na mesma cidade */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4 border-b border-white/10 pb-2">
              Outras especialidades
            </h3>
            <ul className="space-y-3">
              {relatedNiches.map((niche) => (
                <li key={niche.slug}>
                  <Link
                    to={getPath(niche.slug, currentState, currentCity)}
                    className="group flex items-center justify-between rounded-lg p-3 hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 text-muted-foreground hover:text-foreground"
                  >
                    <span>
                      {isBlog ? "Guia para " : ""}{niche.nome} em {TARGET_CITIES.find((c) => c.cidade === currentCity)?.nome || currentCity}
                    </span>
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
