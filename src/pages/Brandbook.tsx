import { useState, useEffect } from 'react';
import { brandConfig } from '../lib/branding';
import { Check, Copy, ChevronRight, Menu, X, Download, CheckCircle2, ShieldAlert, Target, Users, Briefcase, LayoutGrid, Activity, Building2, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import SocialMediaSection from '../components/SocialMediaSection';
import AvatarGuidelinesSection from '../components/AvatarGuidelinesSection';
import ContentGuidelinesSection from '../components/ContentGuidelinesSection';

function ColorSwatch({ color, name, hex, description }: { color: string, name: string, hex: string, description: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="group cursor-pointer rounded-2xl border border-white/5 bg-background p-4 transition-all hover:border-white/20"
      onClick={handleCopy}
    >
      <div 
        className="mb-4 h-32 w-full rounded-xl shadow-inner transition-transform group-hover:scale-[0.98]" 
        style={{ backgroundColor: hex }} 
      />
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold">{name}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3 font-mono text-xs text-muted-foreground">
        <span>HEX</span>
        <span className="text-foreground">{hex}</span>
      </div>
    </div>
  );
}

const SECTIONS = [
  { id: 'visao-geral', label: 'Visão Geral' },
  { id: 'atuacao-mercado', label: 'Atuação de Mercado' },
  { id: 'logo', label: 'Sistema de Logo' },
  { id: 'cores', label: 'Paleta de Cores' },
  { id: 'tipografia', label: 'Tipografia' },
  { id: 'ui', label: 'UI & Componentes' },
  { id: 'tom-de-voz', label: 'Tom de Voz' },
  { id: 'diretrizes-conteudo', label: '04. Conteúdo & Ativação' },
  { id: 'social-media', label: 'Guia Editorial (Social)' },
  { id: 'avatar-ia', label: 'Avatar & IA' },
];

export default function BrandbookPage() {
  const [activeSection, setActiveSection] = useState('visao-geral');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 flex">
      
      {/* MOBILE HEADER */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-white/5 bg-background/95 px-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2">
          <Logo iconSize={24} variant="icon-only" />
          <span className="font-bold text-sm">Brandbook</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-md p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-white/5 bg-card/30 backdrop-blur-xl transition-transform lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="hidden h-24 items-center gap-3 px-8 lg:flex">
            <Logo iconSize={32} />
          </div>
          
          <div className="mt-16 flex-1 px-4 lg:mt-0 lg:px-6">
            <p className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Índice</p>
            <nav className="flex flex-col gap-1">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${activeSection === section.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
                >
                  {section.label}
                  {activeSection === section.id && <ChevronRight size={14} />}
                </button>
              ))}
            </nav>
          </div>

          <div className="border-t border-white/5 p-4 lg:p-6">
             <Link to="/" className="flex items-center justify-center gap-2 w-full rounded-md bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition-colors">
                Voltar ao site
             </Link>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 pb-24 pt-24 lg:pl-72 lg:pr-8 lg:pt-16">
        <div className="mx-auto max-w-4xl space-y-32">
          
          {/* HERO */}
          <header>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-6">
              v1.0 Oficial
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl mb-6">
              Brandbook <br/>{brandConfig.name}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              O guia definitivo para a comunicação visual e verbal da nossa marca. 
              Utilize estas diretrizes para garantir consistência em todos os pontos de contato.
            </p>
          </header>

          {/* VISÃO GERAL */}
          <section id="visao-geral" className="scroll-mt-24 space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Visão Geral</h2>
              <p className="text-muted-foreground">Quem somos, o que vendemos e a distinção entre a marca-mãe e o produto.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-card/30 p-8">
                <h3 className="text-lg font-bold text-primary mb-3">Nosso Propósito</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Montar a <strong className="text-foreground">estrutura de vendas</strong> de negócios locais — presença, aquisição, conversão e escala funcionando juntas — para o cliente ser encontrado, atendido e acompanhado até fechar. Não somos "mais uma agência".
                </p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-card/30 p-8">
                <h3 className="text-lg font-bold text-primary mb-3">Personalidade</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Direta, pragmática e estrutural. Falamos como consultor que resolve, não como influencer — sem jargão de marketing. A língua é a de estrutura, processo e fechamento.
                </p>
              </div>
            </div>

            {/* Marca-mãe × Produto — a distinção central do posicionamento */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8">
              <h3 className="text-lg font-bold text-foreground mb-5">Marca-mãe × Produto</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-primary">A empresa</span>
                  <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                    <strong className="text-foreground">Funil Comercial</strong> é a <strong className="text-foreground">empresa de estrutura de vendas</strong> para negócios locais. Entrega o método completo das <strong className="text-foreground">4 camadas</strong>: Presença (site, Google), Aquisição (tráfego), Conversão e Escala.
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-primary">O software</span>
                  <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                    O <strong className="text-foreground">CRM</strong> (Funil Comercial CRM) é o nosso <strong className="text-foreground">software próprio</strong> — a camada de <strong className="text-foreground">Conversão</strong> do método (WhatsApp, contatos, leads e funil). É um <strong className="text-foreground">produto da casa</strong>, não a empresa inteira. Vive em <span className="text-foreground">funilcomercial.com/crm</span>.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ATUAÇÃO DE MERCADO */}
          <section id="atuacao-mercado" className="scroll-mt-24 space-y-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Clareza Estratégica de Atuação</h2>
              <p className="text-muted-foreground">O posicionamento comercial, clientes atendidos e as necessidades que resolvemos.</p>
            </div>
            
            <div className="space-y-6">
              {/* Grid 1: Segmento e Objetivo */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-card/30 p-8 flex flex-col h-full">
                  <div className="mb-4 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Building2 size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Segmento de Atuação</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground flex-1">
                    Estrutura de vendas para negócios locais. O Funil Comercial monta presença digital, aquisição, conversão e escala funcionando juntas — do Google ao WhatsApp. O <strong className="text-foreground">CRM próprio</strong> é a camada de Conversão desse método, não a oferta inteira.
                  </p>
                </div>
                
                <div className="rounded-2xl border border-white/5 bg-card/30 p-8 flex flex-col h-full">
                  <div className="mb-4 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Target size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Objetivo de Uso</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground flex-1">
                    Ser encontrado, atrair e fechar — todos os dias. A empresa entrega a estrutura completa; o CRM organiza a Conversão: do primeiro contato no WhatsApp ao fechamento da oportunidade, substituindo planilhas soltas e conversas dispersas por um fluxo rastreável e previsível.
                  </p>
                </div>
              </div>

              {/* Grid 2: Clientes e Segmentos */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-card/30 p-8">
                  <div className="mb-4 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Users size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">Principais Clientes Atendidos</h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="fc-success shrink-0 mt-0.5" />
                      Donos de negócios locais, profissionais liberais e autônomos.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="fc-success shrink-0 mt-0.5" />
                      Quem recebe leads e vende pelo WhatsApp.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="fc-success shrink-0 mt-0.5" />
                      Quem depende de indicação e precisa aparecer melhor no Google.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="fc-success shrink-0 mt-0.5" />
                      Negócios em estruturação comercial que querem previsibilidade.
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/5 bg-card/30 p-8">
                  <div className="mb-4 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Briefcase size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">Segmentos de Clientes</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Médicos e Clínicas', 'Advogados', 'Contadores', 'Estética e Beleza', 'Arquitetos e Engenheiros', 'Prestadores de Serviço', 'Comércio Local', 'Negócios Locais', 'Autônomos'].map((badge) => (
                      <span key={badge} className="px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-xs font-medium text-foreground">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid 3: Funcionalidades e Atividades */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-card/30 p-8">
                  <div className="mb-4 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <LayoutGrid size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">Funcionalidades mais Utilizadas</h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      <span><strong>Inbox Omnichannel:</strong> Gestão de WhatsApp e acompanhamento de conversas.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      <span><strong>Funil de Vendas:</strong> Movimentação de oportunidades no kanban.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      <span><strong>Leads e Contatos:</strong> Organização de histórico comercial completo.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      <span><strong>Dashboard:</strong> Visualização de indicadores em tempo real.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      <span><strong>Criativos e Brandbook:</strong> Apoio visual e estratégico.</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/5 bg-card/30 p-8">
                  <div className="mb-4 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Activity size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">Principais Atividades Executadas</h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      <span>Registrar novos contatos e qualificar leads.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      <span>Atender clientes via conversas do WhatsApp.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      <span>Criar, movimentar e acompanhar oportunidades no funil.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      <span>Organizar e executar follow-ups diários.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      <span>Visualizar indicadores de performance da operação.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bloco 4: Necessidades */}
              <div className="rounded-2xl border border-white/5 bg-card/30 p-8">
                <div className="mb-4 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Workflow size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Necessidades Resolvidas (Dores)</h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground text-sm">Organização e Histórico</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Resolve a perda de leads, o atendimento disperso no WhatsApp e a ausência de um histórico centralizado de conversas.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground text-sm">Processos e Previsibilidade</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Cura a dificuldade de acompanhar oportunidades ativas, a falta de processo comercial e a falta de previsibilidade em vendas.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground text-sm">Produtividade e Métricas</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Elimina follow-ups esquecidos, a baixa produtividade da equipe e a dificuldade de medir resultados com a ausência de visão do funil.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* LOGO */}
          <section id="logo" className="scroll-mt-24 space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Sistema de Logo</h2>
              <p className="text-muted-foreground">Aplicações oficiais da nossa marca (Vetor SVG nativo).</p>
            </div>
            
            <div className="space-y-10">
              {/* Variações */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold border-b border-white/10 pb-2">Variações Oficiais</h3>
                <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-card py-20 px-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                  <Logo iconSize={64} className="relative z-10" />
                  <div className="absolute bottom-4 left-6 text-xs text-muted-foreground">Versão Principal (Horizontal)</div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-16 relative overflow-hidden">
                     <Logo iconSize={48} theme="monochrome-black" className="relative z-10" />
                     <div className="absolute bottom-4 left-6 text-xs text-black/50">Fundo Claro</div>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-card py-16 relative">
                     <Logo variant="icon-only" iconSize={56} />
                     <div className="absolute bottom-4 left-6 text-xs text-muted-foreground">Símbolo Isolado</div>
                  </div>
                </div>
              </div>

              {/* Clear Space & Tamanho */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold border-b border-white/10 pb-2">Área de Respiro (Clear Space)</h3>
                  <div className="rounded-3xl border border-white/5 bg-card p-8 flex items-center justify-center relative">
                    <div className="border border-dashed border-primary/40 p-6 relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-1 text-[10px] text-primary">X</div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-card px-1 text-[10px] text-primary">X</div>
                      <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card py-1 text-[10px] text-primary">X</div>
                      <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 bg-card py-1 text-[10px] text-primary">X</div>
                      <Logo iconSize={40} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">O espaço mínimo "X" deve ser equivalente à altura do ícone para manter a leitura livre de poluição visual.</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold border-b border-white/10 pb-2">Tamanho Mínimo</h3>
                  <div className="rounded-3xl border border-white/5 bg-card p-8 flex flex-col gap-8 items-center justify-center">
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-4 border-r border-white/10 pr-8">
                        <Logo iconSize={24} />
                        <span className="text-xs text-muted-foreground">Digital:<br/>120px Largura</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Logo variant="icon-only" iconSize={24} />
                        <span className="text-xs text-muted-foreground">Favicon:<br/>24px Largura</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Incorrect Usage */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b border-white/10 pb-2 text-red-400">Usos Incorretos</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 flex items-center justify-center relative">
                    <Logo iconSize={32} className="scale-x-150" />
                    <div className="absolute top-2 right-2 text-red-500"><ShieldAlert size={16}/></div>
                    <div className="absolute bottom-2 text-[10px] text-red-400 font-bold uppercase">Não distorça</div>
                  </div>
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 flex items-center justify-center relative">
                    <Logo iconSize={32} className="-rotate-12" />
                    <div className="absolute top-2 right-2 text-red-500"><ShieldAlert size={16}/></div>
                    <div className="absolute bottom-2 text-[10px] text-red-400 font-bold uppercase">Não rotacione</div>
                  </div>
                  <div className="rounded-2xl border border-red-500/20 bg-amber-500 p-8 flex items-center justify-center relative">
                    <Logo iconSize={32} theme="default" />
                    <div className="absolute top-2 right-2 text-red-900"><ShieldAlert size={16}/></div>
                    <div className="absolute bottom-2 text-[10px] text-red-900 font-bold uppercase">Cor incorreta</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CORES */}
          <section id="cores" className="scroll-mt-24 space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Paleta de Cores</h2>
              <p className="text-muted-foreground">Clique nos cards para copiar o código HEX.</p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              <ColorSwatch 
                name="Mostarda Principal"
                description="Acentos, Botões Primários, Destaques."
                hex="#F59E0B"
                color="bg-amber-500"
              />
              <ColorSwatch 
                name="Fundo Escuro"
                description="Background principal da aplicação."
                hex="#09090B"
                color="bg-[#09090B]"
              />
              <ColorSwatch 
                name="Superfície (Card)"
                description="Elementos elevados, painéis."
                hex="#121214"
                color="bg-[#121214]"
              />
              <ColorSwatch 
                name="Linhas e Bordas"
                description="Separadores e contornos sutis."
                hex="#27272A"
                color="bg-[#27272A]"
              />
              <ColorSwatch 
                name="Sucesso"
                description="Feedback positivo, fechamento."
                hex="#22C55E"
                color="bg-green-500"
              />
              <ColorSwatch 
                name="Alerta"
                description="Erros, perdas, atenção."
                hex="#EF4444"
                color="bg-red-500"
              />
            </div>
          </section>

          {/* TIPOGRAFIA */}
          <section id="tipografia" className="scroll-mt-24 space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Tipografia</h2>
              <p className="text-muted-foreground">Famílias e pesos tipográficos oficiais.</p>
            </div>
            
            <div className="space-y-12 rounded-3xl border border-white/5 bg-card/30 p-8 sm:p-12">
              {/* Display */}
              <div>
                <div className="mb-6 flex items-baseline justify-between border-b border-white/5 pb-2">
                  <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Headlines (Outfit / Inter)</span>
                  <span className="text-xs text-muted-foreground">Pesos: 700, 900</span>
                </div>
                <div className="space-y-4">
                  <div className="text-5xl font-black">Venda mais com processo.</div>
                  <div className="text-3xl font-bold">Gestão comercial para equipes.</div>
                  <div className="text-xl font-bold text-muted-foreground">O mercado não perdoa desorganização.</div>
                </div>
              </div>
              
              {/* Body */}
              <div>
                <div className="mb-6 flex items-baseline justify-between border-b border-white/5 pb-2">
                  <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Corpo de Texto (Inter)</span>
                  <span className="text-xs text-muted-foreground">Pesos: 400, 500, 600</span>
                </div>
                <div className="space-y-4 max-w-2xl">
                  <p className="text-base leading-relaxed">
                    <span className="font-medium text-primary mr-2">Regular (400):</span>
                    Cada etapa foi milimetricamente desenhada para reduzir o esforço operacional da sua equipe e maximizar o fechamento. O Funil Comercial centraliza tudo.
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground mr-2">Small (400):</span>
                    Textos de apoio, dicas em inputs de formulários, descrições secundárias nos cards do Kanban. Mantenha as frases curtas e objetivas.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* UI & COMPONENTES */}
          <section id="ui" className="scroll-mt-24 space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">UI & Componentes</h2>
              <p className="text-muted-foreground">Estilos base para construção de interfaces.</p>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2">
               {/* Buttons */}
              <div className="rounded-2xl border border-white/5 bg-card/30 p-8">
                 <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Botões</h3>
                 <div className="space-y-4 flex flex-col items-start">
                    <button className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95">
                       Primário
                    </button>
                    <button className="rounded-md bg-white/5 border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition-colors">
                       Secundário (Contorno)
                    </button>
                    <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                       Ghost Button
                    </button>
                 </div>
              </div>

              {/* Inputs */}
              <div className="rounded-2xl border border-white/5 bg-card/30 p-8">
                 <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Inputs e Formulários</h3>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome da Empresa</label>
                       <input type="text" placeholder="Ex: Acme Corp" disabled className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 opacity-100" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Com Foco</label>
                       <div className="w-full rounded-md border border-primary bg-background px-3 py-2 text-sm text-foreground shadow-[0_0_0_2px_rgba(245,158,11,0.2)]">
                          Digitando...
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </section>

          {/* TOM DE VOZ */}
          <section id="tom-de-voz" className="scroll-mt-24 space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Tom de Voz</h2>
              <p className="text-muted-foreground">Diretrizes de comunicação textual.</p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-card p-6">
                <div className="flex items-center gap-2 fc-success mb-4">
                   <CheckCircle2 size={18} />
                   <h3 className="font-bold">Como devemos falar</h3>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                   <li><strong className="text-foreground">Direto:</strong> "Acesse o Kanban" (Não: "Por favor, clique aqui para acessar seu painel")</li>
                   <li><strong className="text-foreground">Comercial:</strong> Focamos em "Fechamento", "Receita", "Leads".</li>
                   <li><strong className="text-foreground">Incentivador:</strong> Celebre vitórias ("Oportunidade Ganhada!") de forma enérgica.</li>
                </ul>
              </div>
              
              <div className="rounded-2xl border border-white/5 bg-card p-6">
                <div className="flex items-center gap-2 text-red-500 mb-4">
                   <X size={18} />
                   <h3 className="font-bold">Como NÃO falar</h3>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                   <li>Evite gerúndios excessivos ("Estamos preparando seu dashboard...").</li>
                   <li>Não use linguagem excessivamente técnica (ex: "Falha de DB" → "Não foi possível carregar").</li>
                   <li>Evite gírias informais ("Mano", "Partiu"). Mantenha a postura profissional e consultiva.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 04. DIRETRIZES DE CONTEÚDO & ATIVAÇÃO */}
          <section id="diretrizes-conteudo" className="scroll-mt-24">
            <ContentGuidelinesSection />
          </section>

          {/* SOCIAL MEDIA */}
          <section id="social-media" className="scroll-mt-24 space-y-8">
            <SocialMediaSection />
          </section>

          {/* AVATAR & IA */}
          <section id="avatar-ia" className="scroll-mt-24 space-y-8">
            <AvatarGuidelinesSection />
          </section>
          
        </div>
      </main>
    </div>
  );
}
