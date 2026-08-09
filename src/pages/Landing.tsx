// HOME da EMPRESA (reposicionamento 2026-07-11): Funil Comercial deixa de se
// apresentar como "landing de CRM" e vira a marca-mãe de ESTRUTURA DE VENDAS
// para negócios locais (profissionais liberais, autônomos e prestadores de
// serviços). O CRM é um produto da casa e vive em /crm.
//
// Método comercial: "Método Estrutura de Vendas" — 4 camadas (Presença,
// Aquisição, Conversão, Escala). O cliente entra pela camada que precisa hoje.

import { useState, useEffect } from "react";
import { trackWhatsappClick } from "../lib/analytics";
import { Link } from "react-router";
import {
  MoveRight,
  Menu,
  X,
  ChevronDown,
  CheckCircle2,
  MessageCircle,
  Globe,
  MapPin,
  Megaphone,
  Bot,
  Layers,
  Wrench,
  Scale,
  Stethoscope,
  Scissors,
  PawPrint,
  Dumbbell,
  Building2,
  Briefcase,
  Search,
  Zap,
  Clock3,
  LayoutDashboard,
  Sparkles,
  UserRound,
} from "lucide-react";
import Logo from "../components/Logo";
import { brandConfig } from "../lib/branding";
import { SeoHead, generateEntityGraphSchema } from "../components/SeoHead";
import { LeadCaptureForm } from "../components/LeadCaptureForm";

// Número de WhatsApp comercial dos CTAs: o número aprovado na Meta e conectado
// ao painel via API Oficial. Ajustar aqui se o canal de atendimento mudar.
const WHATSAPP_NUMBER = "5551992568861";
const WHATSAPP_MESSAGE =
  "Olá! Quero um diagnóstico gratuito da estrutura de vendas do meu negócio.";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
const WHATSAPP_INFO_MESSAGE =
  "Olá! Quero mais informações sobre a estrutura de vendas para o meu negócio.";
const whatsappInfoLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_INFO_MESSAGE)}`;

// As 4 camadas do Método Estrutura de Vendas.
const METHOD_LAYERS = [
  {
    n: "01",
    nome: "Presença",
    pergunta: "Quem te procura, te encontra?",
    entrega: "Site profissional + Google Meu Negócio",
    descricao:
      "Antes de fechar, o cliente pesquisa. Um site que passa confiança e um perfil forte no Google fazem você ser encontrado — e escolhido.",
    icon: Globe,
  },
  {
    n: "02",
    nome: "Aquisição",
    pergunta: "Chega cliente novo toda semana?",
    entrega: "Tráfego pago (Google Ads + Meta Ads)",
    descricao:
      "Anúncios bem feitos colocam seu negócio na frente de quem está procurando agora — sem depender só de indicação.",
    icon: Megaphone,
  },
  {
    n: "03",
    nome: "Conversão",
    pergunta: "Quantos orçamentos morrem no WhatsApp?",
    entrega: "CRM Funil Comercial + WhatsApp organizado",
    descricao:
      "Cada conversa vira uma oportunidade registrada, com follow-up no prazo. Nenhum orçamento esquecido, nenhum cliente sem resposta.",
    icon: MessageCircle,
  },
  {
    n: "04",
    nome: "Escala",
    pergunta: "E quando você não dá conta de responder?",
    entrega: "Pré-atendimento com IA + rotina comercial",
    descricao:
      "Resposta imediata a qualquer hora, triagem automática e uma rotina de vendas que funciona mesmo quando você está atendendo.",
    icon: Bot,
  },
];

// Esteira de serviços (ofertas de entrada — o cliente compra a camada que precisa).
const SERVICES = [
  {
    nome: "Site / Landing Page",
    camada: "Presença",
    preco: "Porta de entrada",
    detalhe: "pronto em dias, não em meses",
    descricao:
      "Página profissional, rápida e feita para gerar contato no WhatsApp — não só para \"existir\".",
    icon: Globe,
    to: "/site-para-negocios-locais",
  },
  {
    nome: "Google Meu Negócio",
    camada: "Presença",
    preco: "Configuração completa",
    detalhe: "entrega única, resultado duradouro",
    descricao:
      "Perfil otimizado para aparecer no mapa quando alguém procura o que você faz na sua região.",
    icon: MapPin,
    to: "/google-meu-negocio",
  },
  {
    nome: "Tráfego Pago",
    camada: "Aquisição",
    preco: "Gestão mensal",
    detalhe: "Google Ads + Meta Ads (verba de anúncios à parte)",
    descricao:
      "Gestão profissional dos seus anúncios, com foco em uma coisa só: gerar conversa de venda.",
    icon: Megaphone,
    to: "/trafego-pago-negocios-locais",
  },
  {
    nome: "CRM Funil Comercial",
    camada: "Conversão",
    preco: "Teste grátis",
    detalhe: "nossa tecnologia própria",
    descricao:
      "WhatsApp, contatos, leads e funil de vendas em uma tela só. O sistema que usamos — e vendemos.",
    icon: LayoutDashboard,
    to: "/crm",
  },
  {
    nome: "Pré-atendimento com IA",
    camada: "Escala",
    preco: "Sob consulta",
    detalhe: "resposta imediata 24h",
    descricao:
      "Seu WhatsApp responde na hora, qualifica o interesse e entrega a conversa pronta para você fechar.",
    icon: Bot,
  },
];

// Segmentos de negócio local que atendemos.
const SEGMENTS = [
  { nome: "Psicólogos e terapeutas", icon: Stethoscope },
  { nome: "Nutricionistas", icon: UserRound },
  { nome: "Fisioterapeutas e massoterapeutas", icon: UserRound },
  { nome: "Contadores e engenheiros", icon: Scale },
  { nome: "Prestadores de serviço", icon: Wrench },
  { nome: "Autônomos", icon: Briefcase },
];

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      <SeoHead 
        title="Estrutura de Vendas para Negócios Locais"
        description="Criação de sites, Google Ads, Meta Ads, WhatsApp e CRM integrados. A estrutura completa para seu negócio atrair e fechar clientes todos os dias."
        canonicalUrl="https://funilcomercial.com/"
        schema={generateEntityGraphSchema()}
      />
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/">
              <Logo iconSize={32} />
            </Link>
          </div>

          <nav className="hidden md:flex gap-8">
            <a href="#metodo" onClick={(e) => handleScroll(e, "metodo")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">O Método</a>
            <a href="#servicos" onClick={(e) => handleScroll(e, "servicos")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Serviços</a>
            <a href="#para-quem" onClick={(e) => handleScroll(e, "para-quem")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Para quem</a>
            <Link to="/crm" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">CRM</Link>
            <Link to="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            <a href="#faq" onClick={(e) => handleScroll(e, "faq")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a href={whatsappLink} onClick={() => trackWhatsappClick({ source: "home" })} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 shadow-[0_0_24px_rgba(245,158,11,0.2)] dark:shadow-[0_0_24px_rgba(245,158,11,0.1)]">
              Diagnóstico gratuito
              <MoveRight size={16} />
            </a>
          </div>

          <div className="flex md:hidden items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 -mr-2"
              aria-label="Abrir menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-[64px] left-0 w-full h-[calc(100vh-64px)] bg-background/95 backdrop-blur-xl flex flex-col px-6 py-8 md:hidden border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-6 mb-8">
              <a href="#metodo" onClick={(e) => handleScroll(e, "metodo")} className="text-lg font-medium text-foreground">O Método</a>
              <a href="#servicos" onClick={(e) => handleScroll(e, "servicos")} className="text-lg font-medium text-foreground">Serviços</a>
              <a href="#para-quem" onClick={(e) => handleScroll(e, "para-quem")} className="text-lg font-medium text-foreground">Para quem</a>
              <Link to="/crm" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-foreground">CRM</Link>
              <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-foreground">Blog</Link>
              <a href="#faq" onClick={(e) => handleScroll(e, "faq")} className="text-lg font-medium text-foreground">FAQ</a>
            </nav>
            <a href={whatsappLink} onClick={() => { trackWhatsappClick({ source: "home" }); setIsMobileMenuOpen(false); }} target="_blank" rel="noreferrer" className="flex justify-center items-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-bold text-primary-foreground mt-auto mb-10 active:scale-95">
              Diagnóstico gratuito
              <MoveRight size={20} />
            </a>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 lg:pt-32 lg:pb-32">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50 dark:opacity-20" />

          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-primary mb-8 text-center leading-tight">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Estrutura de vendas para negócios locais
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-6 md:mb-8 leading-[1.1] md:leading-[1.1]">
              Não somos mais uma agência.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-300">Montamos a sua estrutura de vendas.</span>
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed px-2 sm:px-0">
              Site, Google, anúncios, WhatsApp e CRM funcionando <strong className="text-foreground">juntos</strong> — para o seu negócio ser encontrado, atrair clientes e fechar todos os dias. Você começa pelo que precisa hoje.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <a href={whatsappLink} onClick={() => trackWhatsappClick({ source: "home" })} target="_blank" rel="noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 shadow-[0_0_32px_rgba(245,158,11,0.25)]">
                <MessageCircle size={20} />
                Quero um diagnóstico gratuito
              </a>
              <a href="#metodo" onClick={(e) => handleScroll(e, "metodo")} className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-white/5 border border-white/10 px-8 py-4 text-base font-semibold hover:bg-white/10 transition-all">
                Conhecer o método
              </a>
            </div>

            {/* VISUAL: as 4 camadas empilhadas */}
            <div className="relative mx-auto max-w-3xl">
              <div className="absolute -top-12 -right-12 -z-10 h-64 w-64 rounded-full bg-blue-500/20 blur-[80px]" />
              <div className="absolute -bottom-12 -left-12 -z-10 h-64 w-64 rounded-full bg-primary/20 blur-[80px]" />

              <div className="space-y-3 text-left">
                {METHOD_LAYERS.map((layer, i) => {
                  const Icon = layer.icon;
                  return (
                    <div
                      key={layer.nome}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl px-5 py-4 shadow-lg hover:border-primary/40 transition-colors"
                      style={{ marginLeft: `${i * 4}%`, marginRight: `${(3 - i) * 4}%` }}
                    >
                      <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] font-black text-primary/60">{layer.n}</span>
                          <span className="font-bold text-sm sm:text-base">{layer.nome}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">{layer.entrega}</p>
                      </div>
                      <CheckCircle2 size={18} className="fc-success opacity-50 shrink-0 hidden sm:block" />
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
                <Layers size={13} /> Método Estrutura de Vendas — as 4 camadas do seu funil comercial
              </p>
            </div>
          </div>
        </section>

        {/* PROBLEMA */}
        <section id="problema" className="py-16 md:py-24 bg-card/30 border-y border-white/5 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-12 md:mb-16 max-w-2xl">
              <span className="text-primary font-bold tracking-wider text-sm uppercase mb-4 block">O Problema</span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">Você é bom no que faz. Mas o cliente precisa te encontrar, confiar e comprar.</h2>
              <p className="text-muted-foreground text-lg">A maioria dos negócios locais não perde venda por falta de qualidade — perde por falta de estrutura.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-background p-6 md:p-8 rounded-3xl border border-white/5 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                  <Search size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Invisível no Google</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Quem procura o seu serviço na sua cidade encontra o concorrente primeiro — porque ele aparece e você não.</p>
              </div>

              <div className="bg-background p-6 md:p-8 rounded-3xl border border-white/5 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-6">
                  <Megaphone size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Anúncio sem retorno</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Já tentou impulsionar e "não funcionou"? Anúncio sem estrutura por trás é dinheiro jogado fora.</p>
              </div>

              <div className="bg-background p-6 md:p-8 rounded-3xl border border-white/5 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                  <MessageCircle size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">WhatsApp no caos</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Orçamento enviado que ninguém acompanhou, cliente sem resposta, conversa perdida no meio de 200 chats.</p>
              </div>

              <div className="bg-background p-6 md:p-8 rounded-3xl border border-white/5 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <Clock3 size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Sem tempo para vender</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Você passa o dia atendendo — e a parte comercial fica para "quando sobrar tempo". Nunca sobra.</p>
              </div>
            </div>
          </div>
        </section>

        {/* O MÉTODO */}
        <section id="metodo" className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <span className="text-primary font-bold tracking-wider text-sm uppercase mb-4 block">O Método</span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Método Estrutura de Vendas: seu funil comercial de ponta a ponta.</h2>
              <p className="text-lg text-muted-foreground">
                Quatro camadas que se completam. Você não precisa contratar tudo — <strong className="text-foreground">entra pela camada que resolve o seu problema de hoje</strong> e evolui quando fizer sentido.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {METHOD_LAYERS.map((layer) => {
                const Icon = layer.icon;
                return (
                  <div key={layer.nome} className="bg-card border border-white/10 rounded-3xl p-8 relative overflow-hidden hover:border-primary/30 transition-colors">
                    <span className="absolute -top-4 -right-2 text-[96px] font-black text-white/[0.03] select-none leading-none">{layer.n}</span>
                    <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-6 border border-primary/20">
                      <Icon size={24} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Camada {layer.n} · {layer.nome}</p>
                    <h3 className="text-xl md:text-2xl font-bold mb-3">{layer.pergunta}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{layer.descricao}</p>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <CheckCircle2 size={16} className="fc-success shrink-0" /> {layer.entrega}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SERVIÇOS / ESTEIRA */}
        <section id="servicos" className="py-16 md:py-24 bg-card/30 border-y border-white/5">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <span className="text-primary font-bold tracking-wider text-sm uppercase mb-4 block">Serviços</span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Comece pequeno. Cresça com estrutura.</h2>
              <p className="text-lg text-muted-foreground">Cada serviço resolve um problema específico — e todos se encaixam no mesmo método.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SERVICES.map((service) => {
                const Icon = service.icon;
                const card = (
                  <div className="bg-background p-8 rounded-3xl border border-white/5 hover:border-primary/40 transition-colors h-full flex flex-col">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon size={24} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
                        {service.camada}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{service.nome}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">{service.descricao}</p>
                    <div className="mt-6 pt-5 border-t border-white/5">
                      <p className="text-lg font-black text-primary">{service.preco}</p>
                      <p className="text-xs text-muted-foreground">{service.detalhe}</p>
                    </div>
                  </div>
                );
                // Mensagem específica por serviço: o lead chega no WhatsApp já
                // dizendo o que quer (a intenção não se perde).
                const serviceLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Olá! Tenho interesse em ${service.nome} para o meu negócio. Pode me explicar como funciona?`,
                )}`;
                return service.to ? (
                  <Link key={service.nome} to={service.to} className="block h-full">
                    {card}
                  </Link>
                ) : (
                  <a key={service.nome} href={serviceLink} target="_blank" rel="noreferrer" className="block h-full">
                    {card}
                  </a>
                );
              })}

              {/* Card: estrutura completa */}
              <a href={whatsappLink} onClick={() => trackWhatsappClick({ source: "home" })} target="_blank" rel="noreferrer" className="block h-full">
                <div className="bg-primary/10 p-8 rounded-3xl border border-primary/30 hover:border-primary/60 transition-colors h-full flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mb-6">
                      <Layers size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Estrutura completa</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">As 4 camadas montadas e funcionando juntas — do site ao CRM, da campanha ao atendimento. O caminho de quem quer escalar.</p>
                  </div>
                  <div className="mt-6 pt-5 border-t border-primary/20 flex items-center justify-between">
                    <p className="text-base font-black text-primary">Plano sob medida</p>
                    <MoveRight size={20} className="text-primary" />
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* PARA QUEM */}
        <section id="para-quem" className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <span className="text-primary font-bold tracking-wider text-sm uppercase mb-4 block">Para quem</span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Feito para quem vive do próprio trabalho.</h2>
              <p className="text-lg text-muted-foreground">Profissionais liberais, autônomos e prestadores de serviços que atendem bem — e querem uma estrutura de vendas à altura.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {SEGMENTS.map((segment) => {
                const Icon = segment.icon;
                return (
                  <div key={segment.nome} className="bg-card border border-white/5 rounded-2xl p-5 md:p-6 flex flex-col items-center text-center gap-3 hover:border-primary/30 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Icon size={22} />
                    </div>
                    <span className="text-sm font-semibold leading-tight">{segment.nome}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="py-16 md:py-24 bg-card/30 border-y border-white/5">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <span className="text-primary font-bold tracking-wider text-sm uppercase mb-4 block">Como funciona</span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Três passos. Zero enrolação.</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mx-auto mb-6 border border-primary/20">
                  <span className="font-black text-xl">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Diagnóstico gratuito</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Uma conversa no WhatsApp para entender onde a sua estrutura está falhando: presença, aquisição, conversão ou escala.</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mx-auto mb-6 border border-primary/20">
                  <span className="font-black text-xl">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Plano da sua estrutura</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Você recebe um plano claro: o que montar primeiro, o que pode esperar e quanto custa. Sem pacote fechado, sem venda casada.</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mx-auto mb-6 border border-primary/20">
                  <span className="font-black text-xl">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Implantação e rotina</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Montamos, colocamos para rodar e acompanhamos. Seu negócio ganha uma rotina de vendas — não só mais uma ferramenta.</p>
              </div>
            </div>
          </div>
        </section>

        {/* POR QUE A FUNIL COMERCIAL */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-primary font-bold tracking-wider text-sm uppercase mb-4 block">Por que a Funil Comercial</span>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">Quem monta a sua estrutura usa a própria estrutura.</h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  Nós não revendemos ferramenta dos outros: <strong className="text-foreground">construímos o nosso próprio CRM</strong> — o mesmo que entregamos para você. E a nossa prospecção roda no mesmo método que oferecemos: site, Google, tráfego, WhatsApp e funil.
                </p>
                <div className="space-y-4">
                  {[
                    { titulo: "Tecnologia própria", texto: "O CRM Funil Comercial é nosso, de ponta a ponta — evolui na velocidade da sua necessidade." },
                    { titulo: "Método claro", texto: "Você sempre sabe em que camada está, o que vem depois e por quê." },
                    { titulo: "Foco em negócio local", texto: "Nada de estratégia genérica de agência: só o que faz negócio local vender." },
                    { titulo: "Você fala com quem faz", texto: "Atendimento direto com o fundador — sem gerente de conta, sem fila." },
                  ].map((item) => (
                    <div key={item.titulo} className="flex gap-4">
                      <CheckCircle2 size={22} className="fc-success shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">{item.titulo}</p>
                        <p className="text-muted-foreground text-sm">{item.texto}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-2xl" />
                <div className="bg-card border border-white/10 rounded-3xl p-8 md:p-10 relative shadow-2xl backdrop-blur-sm">
                  <Sparkles size={28} className="text-primary mb-6" />
                  <p className="text-lg md:text-xl leading-relaxed mb-8">
                    "Todo dia falo com donos de negócio que atendem muito bem e vendem menos do que deveriam. O problema nunca é o serviço — é a estrutura. É isso que a Funil Comercial monta: o caminho inteiro entre o cliente te procurar e fechar com você."
                  </p>
                  <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                    <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-black text-primary">
                      LB
                    </div>
                    <div>
                      <p className="font-bold">Leonardo Brasil</p>
                      <p className="text-sm text-muted-foreground">Fundador da Funil Comercial</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-16 md:py-24 bg-card/30 border-y border-white/5">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-primary font-bold tracking-wider text-sm uppercase mb-4 block">Perguntas Frequentes</span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">O que todo dono de negócio pergunta antes de começar.</h2>
            </div>

            <div className="space-y-4">
              {[
                { q: "Preciso contratar a estrutura inteira?", a: "Não — e normalmente nem recomendamos. O diagnóstico mostra qual camada está travando suas vendas hoje (presença, aquisição, conversão ou escala) e você começa por ela. As outras entram quando fizer sentido." },
                { q: "Quanto custa para começar?", a: "Depende da porta de entrada — por isso o diagnóstico vem antes. Ele é gratuito e você recebe o plano da sua estrutura com os valores fechados de cada camada, sem surpresa e sem pacote inflado. Você decide com tudo na mesa." },
                { q: "Funciona para o meu segmento?", a: "Se o seu cliente te procura no Google ou chega pelo WhatsApp, funciona. Atendemos nutricionistas, psicólogos, fisioterapeutas, contadores, engenheiros e prestadores de serviços autônomos em geral." },
                { q: "Já tenho site (ou já faço anúncios). E agora?", a: "Melhor ainda: aproveitamos o que já existe. O diagnóstico avalia o que está funcionando, o que precisa de ajuste e qual é a próxima camada — sem refazer o que está bom." },
                { q: "Vocês atendem a minha cidade?", a: "Sim. Toda a estrutura é digital e o acompanhamento é remoto, então atendemos negócios locais de todo o Brasil." },
                { q: "O que é o CRM Funil Comercial?", a: "É o nosso sistema próprio de vendas: WhatsApp, contatos, leads e funil em uma tela só. Ele é a camada de Conversão do método — e você pode testá-lo gratuitamente." },
              ].map((faq, i) => (
                <details key={i} className="group bg-card border border-white/5 rounded-2xl overflow-hidden">
                  <summary className="flex items-start md:items-center justify-between p-6 cursor-pointer list-none font-semibold text-lg hover:text-primary transition-colors gap-4">
                    <span className="flex-1">{faq.q}</span>
                    <ChevronDown className="transition-transform group-open:rotate-180 text-muted-foreground shrink-0 mt-1 md:mt-0" size={20} />
                  </summary>
                  <div className="p-6 pt-0 text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ANÁLISE GRATUITA — formulário web (captura o lead + o GA4 client_id) */}
        <section id="analise-gratuita" className="py-16 md:py-24">
          <div className="mx-auto max-w-xl px-4">
            <div className="rounded-3xl border border-white/5 bg-card/40 p-8 md:p-10">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                Peça sua análise gratuita
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Deixe seu nome e WhatsApp — a gente olha a sua presença digital e te
                mostra, sem compromisso, o que dá pra melhorar pra você ser encontrado e
                fechar mais.
              </p>
              <LeadCaptureForm />
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden bg-card border-t border-white/10">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center z-10">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-6 md:mb-8">Seu concorrente não é melhor que você. Ele só tem estrutura.</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 md:mb-12 max-w-2xl mx-auto">Peça o diagnóstico gratuito e descubra exatamente o que falta para o seu negócio vender todos os dias.</p>

            <a href={whatsappLink} onClick={() => trackWhatsappClick({ source: "home" })} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 shadow-[0_0_40px_rgba(245,158,11,0.3)] w-full sm:w-auto">
              <MessageCircle size={22} />
              Pedir diagnóstico no WhatsApp
            </a>
            <p className="mt-6 text-sm text-muted-foreground">Gratuito, direto no WhatsApp. Sem compromisso e sem reunião de 1 hora.</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-background py-10 md:py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-white/10 pb-8 mb-8 text-center md:text-left">
            <div className="flex flex-col gap-3 md:gap-4">
              <h4 className="text-sm font-bold text-foreground">Principais Regiões Atendidas</h4>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Balneário Camboriú, Itajaí, Blumenau, São Paulo, Campinas, Ribeirão Preto, Sorocaba, São José dos Campos, Rio de Janeiro, Niterói, Duque de Caxias, Nova Iguaçu, Petrópolis, Belo Horizonte, Uberlândia, Contagem, Juiz de Fora, Betim, Curitiba, Londrina, Maringá, Ponta Grossa, Cascavel, Florianópolis, Joinville.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:gap-4">
              <h4 className="text-sm font-bold text-foreground">Soluções por Nicho</h4>
              <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2">
                <Link to="/estrutura-de-vendas-para-nutricionistas" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">Nutricionistas</Link>
                <Link to="/estrutura-de-vendas-para-psicologas" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">Psicólogas</Link>
                <Link to="/estrutura-de-vendas-para-dentistas" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">Dentistas</Link>
                <Link to="/estrutura-de-vendas-para-terapeutas" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">Terapeutas</Link>
                <Link to="/estrutura-de-vendas-para-massoterapeutas" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">Massoterapeutas</Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
              <div className="flex items-center gap-3">
                <div className="grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                  <Logo iconSize={32} variant="icon-only" />
                </div>
                <span className="font-bold text-muted-foreground hidden md:inline">{brandConfig.name}</span>
              </div>
              <div className="flex flex-col items-center md:items-start gap-1">
                <p className="text-xs md:text-sm text-muted-foreground">© {new Date().getFullYear()} {brandConfig.name}. Todos os direitos reservados.</p>
                <div className="text-[10px] md:text-xs text-muted-foreground/80 mt-2 text-center md:text-left space-y-1">
                  <p>Funil Comercial é uma marca operada por LEONARDO FERRAZ DA SILVA BRASIL.</p>
                  <p>Razão social: LEONARDO FERRAZ DA SILVA BRASIL</p>
                  <p>CNPJ: 65.993.728/0001-07</p>
                  <p>E-mail: <a href="mailto:funil@funilcomercial.com" className="hover:text-primary transition-colors">funil@funilcomercial.com</a></p>
                  <p>Site: <a href="https://funilcomercial.com" className="hover:text-primary transition-colors">https://funilcomercial.com</a></p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6">
              <Link to="/blog" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link>
              <Link to="/cidades-atendidas" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">Cidades Atendidas</Link>
              <Link to="/crm" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">CRM</Link>
              <Link to="/contato" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">Contato</Link>
              <Link to="/termos" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">Termos</Link>
              <Link to="/privacidade" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">Privacidade</Link>
              <Link to="/exclusao-de-dados" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">Exclusão de Dados</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Botão flutuante de WhatsApp — mais informações */}
      <a
        href={whatsappInfoLink} onClick={() => trackWhatsappClick({ method: "whatsapp_info", source: "home" })}
        target="_blank"
        rel="noreferrer"
        aria-label="Fale conosco no WhatsApp"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2.5 rounded-full bg-[#25D366] pl-3 pr-3 sm:pr-5 py-3 text-white font-semibold shadow-[0_10px_30px_-6px_rgba(37,211,102,0.6)] hover:bg-[#1ebe5b] transition-all active:scale-95"
      >
        <span className="relative flex h-7 w-7 items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-white/30 opacity-70 motion-safe:animate-ping" />
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 relative">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.13c-.24.68-1.42 1.32-1.95 1.36-.5.04-.95.23-3.2-.67-2.7-1.07-4.42-3.83-4.55-4.01-.13-.18-1.1-1.46-1.1-2.78 0-1.32.69-1.97.94-2.24.24-.27.53-.33.7-.33.18 0 .35 0 .5.01.16.01.38-.06.6.46.24.55.8 1.9.87 2.04.07.13.12.29.02.47-.09.18-.14.29-.27.45-.13.16-.28.35-.4.47-.13.13-.27.28-.12.54.16.27.7 1.15 1.5 1.86 1.03.92 1.9 1.2 2.17 1.34.27.13.42.11.58-.07.16-.18.67-.78.85-1.05.18-.27.35-.22.6-.13.24.09 1.55.73 1.82.86.27.13.44.2.5.31.07.11.07.63-.17 1.32Z" />
          </svg>
        </span>
        <span className="hidden sm:inline text-sm">Mais informações</span>
      </a>
    </div>
  );
}
