import { Link } from "react-router";
import seoLocationsData from "../lib/seoLocations.json";
import { blogPosts } from "../lib/blogData";
import { ArrowRight, BookOpen } from "lucide-react";

interface RelatedContentProps {
  currentNiche?: string;
  currentState?: string;
  currentCity?: string;
  intentType?: 'local' | 'agencia' | 'captacao' | 'crm' | 'guia';
}

const getNicheCategory = (nicheSlug?: string) => {
  if (!nicheSlug) return null;
  const map: Record<string, string> = {
    contadores: "Contabilidade",
    psicologas: "Psicologia",
    nutricionistas: "Saúde",
    fisioterapeutas: "Fisioterapia",
    dentistas: "Odontologia",
    advogados: "Advocacia",
    estetica: "Estética",
    arquitetos: "Engenharia",
  };
  return map[nicheSlug] || null;
};

export function RelatedContent({
  currentNiche,
  currentState,
  currentCity,
  intentType = 'local',
}: RelatedContentProps) {
  if (!currentNiche || !currentState || !currentCity) return null;

  const { TARGET_CITIES, NICHES } = seoLocationsData;
  const category = getNicheCategory(currentNiche);

  // Encontra artigos do blog relacionados ao nicho (ou gerais de Vendas/Tráfego Pago)
  const relevantPosts = blogPosts.filter(
    (p) => (category && p.category === category) || p.category === "Vendas" || p.category === "Tráfego Pago"
  ).slice(0, 3);

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
        <h2 className="text-2xl font-bold mb-8">Navegação Estratégica & Conteúdos Relacionados</h2>
        
        {/* Hub & Spoke: Links para o Blog */}
        {relevantPosts.length > 0 && (
          <div className="mb-12 rounded-3xl border border-primary/20 bg-primary/5 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="text-primary" size={24} />
              <h3 className="text-xl font-bold text-foreground">
                Artigos & Guias Recomendados para este Nicho
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relevantPosts.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-card/60 p-5 hover:border-primary/40 hover:bg-card transition-all"
                >
                  <div>
                    <span className="inline-block text-xs font-semibold text-primary mb-2">
                      {post.category}
                    </span>
                    <h4 className="font-bold text-foreground text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-white/5">
                    <span>Ler artigo</span>
                    <ArrowRight size={14} className="text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

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
