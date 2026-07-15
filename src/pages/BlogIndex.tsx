import { Link, useSearchParams } from "react-router-dom";
import Logo from "../components/Logo";
import { SeoHead } from "../components/SeoHead";
import { blogPosts } from "../lib/blogData";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BlogIndex() {
  const [searchParams] = useSearchParams();
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const firstPageItems = 10;
  const regularItems = 9;
  
  const totalPages = 1 + Math.ceil(Math.max(0, blogPosts.length - firstPageItems) / regularItems);
  const validPage = Math.max(1, Math.min(currentPage || 1, Math.max(1, totalPages)));
  
  const startIndex = validPage === 1 ? 0 : firstPageItems + (validPage - 2) * regularItems;
  const itemsForThisPage = validPage === 1 ? firstPageItems : regularItems;
  const currentPosts = blogPosts.slice(startIndex, startIndex + itemsForThisPage);
  
  const pageTitle = validPage > 1 ? `Blog e Estratégias de Vendas Locais - Página ${validPage}` : "Blog e Estratégias de Vendas Locais";
  const canonicalUrl = validPage > 1 ? `https://funilcomercial.com/blog?page=${validPage}` : "https://funilcomercial.com/blog";

  return (
    <div data-theme="dark" className="min-h-screen bg-background text-foreground font-sans">
      <SeoHead 
        title={pageTitle}
        description="Dicas de SEO local, Tráfego Pago e estruturação de funis comerciais para Advogados, Médicos, Dentistas e Negócios Locais."
        canonicalUrl={canonicalUrl}
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
             <h1 className="text-4xl font-black md:text-5xl lg:text-6xl mb-6 tracking-tight">
                Conteúdo <span className="text-primary">Estratégico</span>
             </h1>
             <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                As estratégias, táticas e ferramentas exatas que usamos para fazer negócios locais dominarem o mercado na sua região e fecharem clientes todos os dias.
             </p>
          </div>

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
             {currentPosts.map((post, index) => {
               const isFeatured = validPage === 1 && index === 0;
               return (
               <article key={post.slug} className={`group relative flex flex-col items-start justify-between rounded-2xl border border-white/10 transition-colors ${isFeatured ? 'md:col-span-2 lg:col-span-3 lg:flex-row lg:gap-10 lg:items-center bg-card/40 p-6 lg:p-10 hover:bg-card/60' : 'bg-card/30 p-6 hover:bg-card/50'}`}>
                 <div className={`w-full ${isFeatured ? 'lg:w-[55%]' : ''}`}>
                    {post.imageUrl && (
                      <div className={`mb-6 w-full overflow-hidden rounded-lg ${isFeatured ? 'lg:mb-0 aspect-video lg:aspect-[16/10]' : 'aspect-video'}`}>
                        <img 
                          src={post.imageUrl} 
                          alt={post.title}
                          loading="lazy" 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      </div>
                    )}
                 </div>
                 <div className={`w-full flex flex-col justify-between ${isFeatured ? 'lg:w-[45%] lg:py-6' : ''}`}>
                    <div className="flex items-center gap-x-4 text-xs">
                      <time dateTime={post.date} className="text-muted-foreground">
                        {new Date(post.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </time>
                      <span className="relative z-10 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">
                        {post.category}
                      </span>
                    </div>
                    <div className="group relative mt-4">
                      <h3 className={`font-bold leading-tight group-hover:text-primary transition-colors ${isFeatured ? 'text-2xl md:text-4xl lg:leading-tight mb-6' : 'text-xl'}`}>
                        <Link to={`/blog/${post.slug}`}>
                          <span className="absolute inset-0" />
                          {post.title}
                        </Link>
                      </h3>
                      <p className={`mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground ${isFeatured ? 'md:text-base md:line-clamp-4' : ''}`}>
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="mt-8 flex items-center gap-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary overflow-hidden border border-primary/20">
                        {post.authorAvatar ? (
                          <img src={post.authorAvatar} alt={post.author} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          post.author.charAt(0)
                        )}
                      </div>
                      <div className="text-sm leading-6">
                        <p className="font-semibold text-foreground">
                          {post.author}
                        </p>
                        <p className="text-muted-foreground text-xs">Especialista de Vendas</p>
                      </div>
                    </div>
                 </div>
               </article>
             )})}
          </div>

          {/* Paginação SEO */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-2">
              {validPage > 1 ? (
                <Link 
                  to={`/blog${validPage === 2 ? '' : `?page=${validPage - 1}`}`} 
                  className="flex h-10 items-center justify-center rounded-lg border border-white/10 bg-card px-4 text-sm font-medium hover:bg-white/5 transition-colors"
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={16} className="mr-2" /> Anterior
                </Link>
              ) : (
                <span className="flex h-10 items-center justify-center rounded-lg border border-white/5 bg-black/20 px-4 text-sm font-medium text-white/30 cursor-not-allowed">
                  <ChevronLeft size={16} className="mr-2" /> Anterior
                </span>
              )}
              
              <div className="flex items-center gap-1 mx-2 md:mx-4">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isCurrent = pageNum === validPage;
                  return (
                    <Link
                      key={pageNum}
                      to={`/blog${pageNum === 1 ? '' : `?page=${pageNum}`}`}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${
                        isCurrent 
                          ? "border-primary bg-primary/20 text-primary" 
                          : "border-white/10 bg-card hover:bg-white/5 text-muted-foreground hover:text-foreground"
                      }`}
                      aria-current={isCurrent ? "page" : undefined}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
              </div>

              {validPage < totalPages ? (
                <Link 
                  to={`/blog?page=${validPage + 1}`} 
                  className="flex h-10 items-center justify-center rounded-lg border border-white/10 bg-card px-4 text-sm font-medium hover:bg-white/5 transition-colors"
                  aria-label="Próxima página"
                >
                  Próxima <ChevronRight size={16} className="ml-2" />
                </Link>
              ) : (
                <span className="flex h-10 items-center justify-center rounded-lg border border-white/5 bg-black/20 px-4 text-sm font-medium text-white/30 cursor-not-allowed">
                  Próxima <ChevronRight size={16} className="ml-2" />
                </span>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-white/10 py-12 text-center mt-12">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Funil Comercial. Todos os direitos reservados.
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <Link to="/cidades-atendidas" className="text-xs text-muted-foreground hover:text-primary transition">Cidades Atendidas</Link>
          <Link to="/crm" className="text-xs text-muted-foreground hover:text-primary transition">Nosso CRM</Link>
        </div>
      </footer>
    </div>
  );
}
