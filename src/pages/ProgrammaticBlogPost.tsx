import { Link, useParams } from "react-router-dom";
import { trackEvent } from "../lib/analytics";
import { MessageCircle, CheckCircle2, Target, PenTool, Lightbulb, Star, ArrowRight } from "lucide-react";
import Logo from "../components/Logo";
import { SeoHead, generateLocalBusinessSchema, generateServiceSchema, generateFAQSchema } from "../components/SeoHead";
import { seoNicheData, getDefaultNicheData } from "../lib/seoNicheData";
import { EDITORIAL_PILLARS } from "../lib/editorialPillars";
import { RelatedContent } from "../components/RelatedContent";

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
    "pr": "PR",
  };
  if (specialCases[slug]) return specialCases[slug];

  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatNiche(nicho?: string) {
  if (!nicho) return "negócios locais";
  if (nicho === "psicologas") return "psicólogas";
  if (nicho === "nutricionistas") return "nutricionistas";
  if (nicho === "contadores") return "contadores";
  if (nicho === "fisioterapeutas") return "fisioterapeutas";
  if (nicho === "esteticistas") return "clínicas de estética";
  if (nicho === "engenheiros") return "engenheiros";
  if (nicho === "corretores") return "corretores de imóveis";
  if (nicho === "advogados") return "advogados";
  if (nicho === "dentistas") return "dentistas";
  if (nicho === "medicos") return "médicos";
  if (nicho === "personal-trainers") return "personal trainers";
  if (nicho === "terapeutas") return "terapeutas";
  if (nicho === "massoterapeutas") return "massoterapeutas";
  return "negócios locais";
}

// Function to deterministically pick a theme based on string length to avoid random layout shifts on crawl
function getThemeIndex(baseString: string, max: number) {
  let hash = 0;
  for (let i = 0; i < baseString.length; i++) {
    hash = baseString.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % max;
}

export default function ProgrammaticBlogPost() {
  const { nicho, estado, cidade } = useParams();

  const formattedCidade = formatLocationName(cidade);
  const formattedEstado = formatLocationName(estado);
  const formattedNicho = formatNiche(nicho);

  const nicheData = nicho && seoNicheData[nicho]
    ? seoNicheData[nicho]
    : getDefaultNicheData(formattedNicho, formattedCidade);

  const title = `Guia Definitivo: Como captar clientes para ${formattedNicho} em ${formattedCidade} - ${formattedEstado}`;
  const description = `Descubra a estratégia exata para atrair mais clientes e dominar o mercado para ${formattedNicho} em ${formattedCidade}. Aprenda como organizar seu SEO, tráfego e WhatsApp.`;

  const whatsappMessage = `Olá! Li o guia de vendas para ${formattedNicho} em ${formattedCidade} e quero estruturar meu processo comercial.`;
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  const schema: any[] = [
    generateLocalBusinessSchema(),
    generateServiceSchema(
      `Consultoria de Vendas e Site para ${formattedNicho} em ${formattedCidade}`,
      description
    ),
  ];

  if (nicheData.faqs) {
    const faqSchema = generateFAQSchema(nicheData.faqs);
    if (faqSchema) schema.push(faqSchema);
  }

  // Deterministic pillars to ensure stable rendering for SEO
  const dorPillar = EDITORIAL_PILLARS[0];
  const dorTheme = dorPillar.temas[getThemeIndex(formattedCidade, dorPillar.temas.length)];
  
  const metodoPillar = EDITORIAL_PILLARS[2];
  const metodoTheme = metodoPillar.temas[getThemeIndex(formattedNicho, metodoPillar.temas.length)];

  return (
    <div data-theme="dark" className="min-h-screen bg-background text-foreground font-sans">
      <SeoHead
        title={title}
        description={description}
        canonicalUrl={`https://funilcomercial.com/blog/guia-de-vendas/${nicho}/${estado}/${cidade}`}
        schema={schema}
      />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
          <Link to="/" aria-label="Funil Comercial">
            <Logo iconSize={32} theme="monochrome-white" />
          </Link>
          <Link
            to="/blog"
            className="text-sm font-semibold hover:text-primary transition"
          >
            Voltar para o Blog
          </Link>
        </div>
      </header>

      <main className="py-16 md:py-24">
        <article className="mx-auto max-w-4xl px-5 md:px-8">
          {/* Cabeçalho do Artigo */}
          <header className="mb-16 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
              <Target size={16} /> Guia de Mercado Local
            </div>
            <h1 className="text-4xl font-black md:text-5xl lg:text-6xl mb-6 tracking-tight leading-[1.1]">
              Como atrair clientes para <span className="text-primary capitalize">{formattedNicho}</span> em {formattedCidade}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              O mercado na região de {formattedCidade} mudou. Veja a estratégia exata para se posicionar no Google e fechar negócios todos os dias.
            </p>
            
            <div className="mt-8 flex items-center justify-center gap-x-4 text-sm">
               <div className="flex items-center gap-2">
                 <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary overflow-hidden border border-primary/20">
                    <img src="/images/leo-avatar.jpg" alt="Leonardo Brasil" className="h-full w-full object-cover" loading="lazy" />
                 </div>
                 <div className="text-left leading-tight">
                    <p className="font-semibold text-foreground">Leonardo Brasil</p>
                    <p className="text-muted-foreground text-xs">Especialista de Vendas</p>
                 </div>
               </div>
               <span className="text-muted-foreground">•</span>
               <time className="text-muted-foreground">
                 Estratégia atualizada em {new Date().getFullYear()}
               </time>
            </div>
          </header>

          <div className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-a:text-primary">
            
            {/* Seção 1: O Cenário (A Dor) */}
            <section className="mb-16">
              <h2 className="flex items-center gap-3 text-3xl mb-6"><Target className="text-primary" /> O Cenário em {formattedCidade}</h2>
              <p>
                Quando analisamos o cenário de negócios locais em {formattedCidade}, o diagnóstico costuma ser sempre o mesmo: <strong>{dorTheme.titulo.toLowerCase()}</strong> {dorTheme.apoio}
              </p>
              <p>
                Para o segmento de {formattedNicho}, depender exclusivamente de indicações (boca a boca) não é mais suficiente. O consumidor moderno na sua cidade não tem tempo a perder: quando ele precisa de um profissional, ele pesquisa no Google. Se ele não encontrar um site altamente conversivo passando credibilidade, ele clica no concorrente.
              </p>
            </section>

            {/* Seção 2: Especificidades do Nicho */}
            <section className="mb-16 rounded-2xl border border-white/5 bg-card/30 p-8 md:p-10">
              <h2 className="text-3xl mb-4 mt-0">{nicheData.painPointTitle.replace("sua cidade", formattedCidade).replace("sua região", formattedCidade)}</h2>
              <p className="text-muted-foreground mb-8">
                {nicheData.painPointDescription.replace("sua cidade", formattedCidade).replace("sua região", formattedCidade)}
              </p>
              
              <h3 className="text-xl mb-4 text-primary">A estrutura ideal precisa contar com:</h3>
              <ul className="list-none pl-0 space-y-4">
                {nicheData.benefits.map((benefit, i) => (
                  <li key={i} className="flex gap-4 m-0">
                    <CheckCircle2 className="text-primary shrink-0 mt-1" size={24} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Seção 3: O Método */}
            <section className="mb-16">
              <h2 className="flex items-center gap-3 text-3xl mb-6"><Lightbulb className="text-primary" /> A Estrutura de Vendas Local</h2>
              <p>
                A diferença entre uma agenda vazia e um processo previsível de vendas está na aplicação inteligente de um funil de captação. O princípio é simples: <strong>{metodoTheme.titulo}</strong>
              </p>
              <p>
                {metodoTheme.apoio} Em {formattedCidade}, isso significa ter três pilares alinhados simultaneamente:
              </p>
              <ol className="pl-6 space-y-4">
                <li><strong>Posicionamento no Google (Local):</strong> Uma ficha de Perfil da Empresa (Google Meu Negócio) muito bem ranqueada e com avaliações para dominar as buscas "perto de mim".</li>
                <li><strong>Site de Alta Conversão:</strong> Uma página voltada exclusivamente para transformar o visitante em um lead. Não é sobre ter um site institucional bonito e confuso, mas um funil claro que conduz ao contato.</li>
                <li><strong>CRM e WhatsApp Organizados:</strong> Se o anúncio gera o clique, o site gera o WhatsApp e você demora a responder ou esquece de fazer acompanhamento (follow-up), o investimento vai para o lixo. Um CRM local salva todas as vendas perdidas.</li>
              </ol>
            </section>

            {/* Call To Action */}
            <section className="mt-20 rounded-3xl bg-primary/10 border border-primary/20 p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-black mb-6 mt-0">Pronto para dominar o mercado em {formattedCidade}?</h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                Não deixe seus clientes irem para o concorrente só porque eles têm uma presença digital melhor estruturada. Descubra como montamos essa máquina de vendas para {formattedNicho}.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                 <a
                  href={whatsappLink}
                  onClick={() => trackEvent("generate_lead", { method: "whatsapp", source: "programmatic_blog" })}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-bold text-primary-foreground transition hover:bg-primary/90"
                 >
                  <MessageCircle size={19} />
                  Falar no WhatsApp
                 </a>
                 <Link
                  to={`/local/${nicho}/${estado}/${cidade}`}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-8 text-lg font-bold text-foreground transition hover:bg-white/5"
                 >
                  Ver Landing Page Específica
                  <ArrowRight size={19} />
                 </Link>
              </div>
            </section>
          </div>
        </article>
      </main>

      <RelatedContent currentNiche={nicho} currentState={estado} currentCity={cidade} isBlog />

      <footer className="border-t border-white/10 py-12 text-center mt-12">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Funil Comercial. Acelerando {formattedNicho} em {formattedCidade} e todo o Brasil.
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <Link to="/blog" className="text-xs text-muted-foreground hover:text-primary transition">Todos os Artigos</Link>
          <Link to="/cidades-atendidas" className="text-xs text-muted-foreground hover:text-primary transition">Cidades Atendidas</Link>
        </div>
      </footer>
    </div>
  );
}
