import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import { SeoHead } from "../components/SeoHead";
import { blogPosts } from "../lib/blogData";

export default function BlogIndex() {
  return (
    <div data-theme="dark" className="min-h-screen bg-background text-foreground font-sans">
      <SeoHead 
        title="Blog e Estratégias de Vendas Locais"
        description="Dicas de SEO local, Tráfego Pago e estruturação de funis comerciais para Advogados, Médicos, Dentistas e Negócios Locais."
        canonicalUrl="https://funilcomercial.com/blog"
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
             {blogPosts.map(post => (
               <article key={post.slug} className="group relative flex flex-col items-start justify-between rounded-2xl border border-white/10 bg-card/30 p-6 hover:bg-card/50 transition-colors">
                 <div className="w-full">
                    {post.imageUrl && (
                      <div className="mb-6 aspect-video w-full overflow-hidden rounded-lg">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title}
                          loading="lazy" 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-x-4 text-xs">
                      <time dateTime={post.date} className="text-muted-foreground">
                        {new Date(post.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </time>
                      <span className="relative z-10 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">
                        {post.category}
                      </span>
                    </div>
                    <div className="group relative mt-4">
                      <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                        <Link to={`/blog/${post.slug}`}>
                          <span className="absolute inset-0" />
                          {post.title}
                        </Link>
                      </h3>
                      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {post.excerpt}
                      </p>
                    </div>
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
               </article>
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
          <Link to="/crm" className="text-xs text-muted-foreground hover:text-primary transition">Nosso CRM</Link>
        </div>
      </footer>
    </div>
  );
}
