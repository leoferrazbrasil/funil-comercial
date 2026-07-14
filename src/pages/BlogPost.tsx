import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Logo from "../components/Logo";
import { SeoHead } from "../components/SeoHead";
import { getBlogPostBySlug } from "../lib/blogData";
import { ArrowLeft } from "lucide-react";

export default function BlogPost() {
  const { slug } = useParams();
  const post = getBlogPostBySlug(slug || "");

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
        <article className="mx-auto max-w-3xl px-5 md:px-8">
          <header className="mb-14 text-center">
            <div className="flex items-center justify-center gap-x-4 text-xs mb-6">
              <time dateTime={post.date} className="text-muted-foreground">
                {new Date(post.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
              <span className="rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">
                {post.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-8 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-x-4">
               <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-lg overflow-hidden border-2 border-primary/20">
                 {post.authorAvatar ? (
                   <img src={post.authorAvatar} alt={post.author} className="h-full w-full object-cover" />
                 ) : (
                   post.author.charAt(0)
                 )}
               </div>
               <div className="text-left leading-6">
                 <p className="font-semibold text-foreground text-sm">
                   {post.author}
                 </p>
                 <p className="text-muted-foreground text-xs">Especialista de Vendas</p>
               </div>
            </div>
          </header>

          {post.imageUrl && (
            <figure className="mb-14 aspect-video w-full overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
              <img 
                src={post.imageUrl} 
                alt={post.title}
                className="h-full w-full object-cover" 
              />
            </figure>
          )}

          <div className="prose prose-invert prose-lg md:prose-xl mx-auto prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

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
