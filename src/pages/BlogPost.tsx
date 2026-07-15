import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Logo from "../components/Logo";
import { SeoHead } from "../components/SeoHead";
import { getBlogPostBySlug, blogPosts } from "../lib/blogData";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function BlogPost() {
  const { slug } = useParams();
  const post = getBlogPostBySlug(slug || "");

  const satellitePosts = post?.clusterType === 'pillar' 
    ? blogPosts.filter(p => p.pillarSlug === post.slug) 
    : [];
  const pillarPost = post?.clusterType === 'satellite' && post.pillarSlug 
    ? blogPosts.find(p => p.slug === post.pillarSlug) 
    : null;

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold mb-4">Artigo não encontrado</h1>
        <p className="text-muted-foreground mb-8">Desculpe, o artigo que você está procurando não existe ou foi removido.</p>
        <Link to="/blog" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
          Voltar para o Blog
        </Link>
      </div>
    );
  }

  // Create article schema for SEO
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "image": post.imageUrl ? [post.imageUrl] : [],
    "datePublished": post.date,
    "author": [{
        "@type": "Person",
        "name": post.author
    }],
    "publisher": {
      "@type": "Organization",
      "name": "Funil Comercial",
      "logo": {
        "@type": "ImageObject",
        "url": "https://funilcomercial.com/logo.png"
      }
    }
  };

  const formattedDate = new Date(post.date).toLocaleDateString('pt-BR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div data-theme="dark" className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <SeoHead 
        title={post.title}
        description={post.excerpt}
        canonicalUrl={`https://funilcomercial.com/blog/${post.slug}`}
        image={post.imageUrl}
        schema={articleSchema}
      />
      
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5 md:h-20">
          <Link to="/" aria-label="Funil Comercial">
            <Logo iconSize={32} theme="monochrome-white" />
          </Link>
          <Link 
            to="/blog" 
            className="text-sm font-semibold hover:text-primary transition flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Voltar
          </Link>
        </div>
      </header>

      <main className="py-12 md:py-20">
        <article 
          className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-card/50 backdrop-blur-sm border border-white/10 shadow-2xl pb-16"
          itemScope 
          itemType="http://schema.org/BlogPosting"
        >
          <meta itemProp="headline" content={post.title} />
          <meta itemProp="image" content={post.imageUrl || ""} />
          
          <header className="px-6 py-12 md:px-12 md:py-16 text-center border-b border-white/10 bg-black/20">
            <div className="mb-6 flex items-center justify-center gap-4">
              <span 
                className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary border border-primary/20"
                itemProp="articleSection"
              >
                {post.category}
              </span>
              <time 
                dateTime={post.date} 
                className="text-sm text-muted-foreground font-medium"
                itemProp="datePublished"
              >
                {formattedDate}
              </time>
            </div>
            
            <h1 
              className="text-3xl md:text-5xl font-black tracking-tight text-white mb-8 leading-tight"
            >
              {post.title}
            </h1>
            
            <div 
              className="flex items-center justify-center gap-x-4"
              itemProp="author" 
              itemScope 
              itemType="http://schema.org/Person"
            >
               <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-lg overflow-hidden border-2 border-primary/20">
                 {post.authorAvatar ? (
                   <img src={post.authorAvatar} alt={post.author} className="h-full w-full object-cover" />
                 ) : (
                   post.author.charAt(0)
                 )}
               </div>
               <div className="text-left leading-6">
                 <p className="font-semibold text-foreground text-sm" itemProp="name">
                   {post.author}
                 </p>
                 <p className="text-xs text-muted-foreground">
                   Especialista em Vendas
                 </p>
               </div>
            </div>
          </header>

          {post.imageUrl && (
            <figure className="mb-14 aspect-video w-full overflow-hidden border-b border-white/5 shadow-2xl">
              <img 
                src={post.imageUrl} 
                alt={post.title}
                className="h-full w-full object-cover" 
              />
            </figure>
          )}

          {post.clusterType === 'satellite' && pillarPost && (
            <div className="mx-auto px-6 md:px-12 mb-10">
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="bg-primary/20 p-3 rounded-xl text-primary shrink-0">
                  <BookOpen size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Faz parte do guia</p>
                  <Link to={`/blog/${pillarPost.slug}`} className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                    {pillarPost.title}
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div 
            className="prose prose-invert prose-lg md:prose-xl mx-auto px-6 md:px-12 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl"
            itemProp="articleBody"
          >
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {post.clusterType === 'pillar' && satellitePosts.length > 0 && (
            <div className="mx-auto px-6 md:px-12 mt-16">
              <div className="rounded-3xl border border-white/10 bg-black/40 p-8 md:p-10">
                <h3 className="text-2xl md:text-3xl font-black mb-2">Artigos neste Guia</h3>
                <p className="text-muted-foreground mb-8">Aprofunde-se em cada estratégia clicando nos capítulos abaixo.</p>
                <div className="flex flex-col gap-3">
                  {satellitePosts.map((sat, index) => (
                    <Link 
                      key={sat.slug} 
                      to={`/blog/${sat.slug}`} 
                      className="group flex items-center justify-between p-5 rounded-2xl bg-card/50 border border-white/5 hover:bg-primary/10 hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-sm font-bold text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                          {index + 1}
                        </span>
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">{sat.title}</span>
                      </div>
                      <ArrowLeft size={20} className="rotate-180 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-20 pt-10 border-t border-white/10 text-center">
            <h3 className="text-2xl font-bold mb-4">Gostou deste conteúdo?</h3>
            <p className="text-muted-foreground mb-8">Nós aplicamos exatamente essas estratégias na criação da sua estrutura de vendas.</p>
            <Link 
              to="/" 
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-black text-primary-foreground transition hover:bg-primary/90"
            >
              Criar minha estrutura agora
            </Link>
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
