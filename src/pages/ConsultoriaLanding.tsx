import { useState, useEffect } from "react";
import { trackEvent } from "../lib/analytics";
import { Link } from "react-router";
import {
  MoveRight,
  Menu,
  X,
  Target,
  BarChart4,
  TrendingUp,
  Search,
  MessageCircle,
  Clock3,
  Bot,
  Globe
} from "lucide-react";
import Logo from "../components/Logo";
import { brandConfig } from "../lib/branding";
import { SeoHead } from "../components/SeoHead";

const WHATSAPP_NUMBER = "5551992568861";
const WHATSAPP_MESSAGE = "Olá! Quero agendar um diagnóstico da minha estrutura comercial.";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const PILLARS = [
  {
    n: "01",
    nome: "Diagnóstico",
    descricao: "Mapeamos exatamente onde você está perdendo dinheiro e clientes no seu processo atual.",
    icon: Search,
  },
  {
    n: "02",
    nome: "Estratégia",
    descricao: "Desenhamos o funil perfeito de aquisição (Google/Meta) e conversão (CRM/WhatsApp).",
    icon: Target,
  },
  {
    n: "03",
    nome: "Execução",
    descricao: "Implementamos a infraestrutura completa de vendas que vai tracionar o seu negócio.",
    icon: TrendingUp,
  },
  {
    n: "04",
    nome: "Escala",
    descricao: "Aplicamos automações e IA para você focar no que importa enquanto o sistema vende.",
    icon: BarChart4,
  },
];

export default function ConsultoriaLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div data-theme="dark" className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <SeoHead 
        title="Consultoria Comercial Estratégica"
        description="Diagnóstico e implementação de infraestrutura de vendas para escalar seus resultados."
        canonicalUrl="https://funilcomercial.com/consultoria"
      />

      {/* Header */}
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/90 backdrop-blur-md border-b border-white/10 shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo iconSize={32} theme="monochrome-white" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/crm" className="text-muted-foreground hover:text-foreground transition-colors">CRM</Link>
            <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            <a 
              href={whatsappLink} onClick={(e) => { trackEvent("whatsapp_click", { method: "whatsapp" }); }} 
              target="_blank" 
              rel="noopener noreferrer"
              className="rounded-full bg-primary px-6 py-2.5 text-primary-foreground hover:bg-primary/90 transition-all font-bold shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)]"
            >
              Falar com Especialista
            </a>
          </nav>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-white/10 p-4 flex flex-col gap-4 shadow-xl md:hidden">
            <Link to="/crm" className="p-2 text-muted-foreground font-medium" onClick={() => setMobileMenuOpen(false)}>CRM</Link>
            <Link to="/blog" className="p-2 text-muted-foreground font-medium" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 text-center rounded-full bg-primary px-6 py-3 text-primary-foreground font-bold"
              onClick={(e) => { 
                trackEvent("whatsapp_click", { method: "whatsapp" });
                setMobileMenuOpen(false);
              }}
            >
              Agendar Diagnóstico
            </a>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="relative min-h-[90vh] pt-32 pb-20 flex items-center justify-center overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent/20 rounded-full blur-[100px] mix-blend-screen" />
            <div className="absolute inset-0 bg-black/60 z-10" />
            <div 
              className="absolute inset-0 bg-cover bg-center z-0 opacity-40" 
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop)' }} 
            />
          </div>

          <div className="relative z-20 mx-auto max-w-5xl px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 mb-8 text-sm font-medium text-primary">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-ping"></span>
              Vagas Abertas para Consultoria
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 text-balance leading-[1.1]">
              Sua empresa está <span className="text-primary">perdendo dinheiro</span> agora mesmo.
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-12 text-balance leading-relaxed">
              Descubra os gargalos invisíveis no seu processo comercial. Nossa consultoria vai desenhar e implementar a infraestrutura exata para escalar suas vendas com previsibilidade.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href={whatsappLink} onClick={(e) => { trackEvent("whatsapp_click", { method: "whatsapp" }); }}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:w-auto flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105"
              >
                Quero meu Diagnóstico
                <MoveRight className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>
            
            <p className="mt-6 text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Clock3 size={14} /> Atendimento rápido via WhatsApp
            </p>
          </div>
        </section>

        {/* Pillars */}
        <section className="py-24 bg-card/30">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-6">Como funciona a Consultoria?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Um método validado em 4 etapas para construir sua máquina de vendas.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {PILLARS.map((pillar) => (
                <div key={pillar.n} className="group relative overflow-hidden rounded-3xl bg-card border border-white/5 p-8 transition-all hover:border-primary/30 hover:bg-card/80">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <pillar.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
                    <span className="text-sm font-black text-muted-foreground/50">{pillar.n}</span>
                    {pillar.nome}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {pillar.descricao}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="mx-auto max-w-4xl px-6 relative z-10">
            <div className="rounded-[3rem] bg-gradient-to-b from-primary/20 to-transparent border border-primary/30 p-12 text-center md:p-20 backdrop-blur-sm">
              <h2 className="text-4xl md:text-5xl font-black mb-6">Pronto para escalar?</h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                Pare de perder oportunidades por desorganização ou falta de estratégia. Agende uma conversa com nosso time comercial.
              </p>
              <a 
                href={whatsappLink} onClick={(e) => { trackEvent("whatsapp_click", { method: "whatsapp" }); }}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-10 text-lg font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 shadow-[0_0_30px_rgba(var(--primary),0.3)]"
              >
                Falar com a Equipe
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-background py-12">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {brandConfig.name}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
