import { useState, useEffect } from "react";
import { brandConfig } from "../lib/branding";
import { Link } from "react-router-dom";
import { MoveRight, Lock, LayoutDashboard, MessageCircle, BarChart3, ChevronDown, CheckCircle2, Building2, Briefcase, Zap, Menu, X } from "lucide-react";
import Logo from "../components/Logo";

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
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/">
              <Logo iconSize={32} />
            </Link>
          </div>
          
          <nav className="hidden md:flex gap-8">
            <a href="#problema" onClick={(e) => handleScroll(e, 'problema')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">O Problema</a>
            <a href="#solucao" onClick={(e) => handleScroll(e, 'solucao')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Como Funciona</a>
            <a href="#casos" onClick={(e) => handleScroll(e, 'casos')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Para Quem É</a>
            <a href="#faq" onClick={(e) => handleScroll(e, 'faq')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold hover:text-primary transition-colors">
              Entrar
            </Link>
            <Link to="/login" className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 shadow-[0_0_24px_rgba(245,158,11,0.2)] dark:shadow-[0_0_24px_rgba(245,158,11,0.1)]">
              Começar Agora
              <MoveRight size={16} />
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
              Entrar
            </Link>
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
              <a href="#problema" onClick={(e) => handleScroll(e, 'problema')} className="text-lg font-medium text-foreground">O Problema</a>
              <a href="#solucao" onClick={(e) => handleScroll(e, 'solucao')} className="text-lg font-medium text-foreground">Como Funciona</a>
              <a href="#casos" onClick={(e) => handleScroll(e, 'casos')} className="text-lg font-medium text-foreground">Para Quem É</a>
              <a href="#faq" onClick={(e) => handleScroll(e, 'faq')} className="text-lg font-medium text-foreground">FAQ</a>
            </nav>
            <Link to="/login" className="flex justify-center items-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-bold text-primary-foreground mt-auto mb-10 active:scale-95">
              Começar Agora
              <MoveRight size={20} />
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32 lg:pt-36 lg:pb-40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50 dark:opacity-20" />
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-primary mb-8 text-center leading-tight">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              O CRM definitivo para gestores
            </div>
            
            <h1 className="mx-auto max-w-4xl text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-6 md:mb-8 leading-[1.1] md:leading-[1.1]">
              Venda mais.<br className="hidden sm:block"/> Perca menos.<br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-300">Escale sua operação.</span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed px-2 sm:px-0">
              O CRM desenhado para equipes que não têm tempo a perder. Acompanhe cada negociação, do lead ao fechamento, em um fluxo visual impecável.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link to="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 shadow-[0_0_32px_rgba(245,158,11,0.25)]">
                Criar Conta Gratuita
                <MoveRight size={20} />
              </Link>
              <a href="#solucao" onClick={(e) => handleScroll(e, 'solucao')} className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-white/5 border border-white/10 px-8 py-4 text-base font-semibold hover:bg-white/10 transition-all">
                Ver como funciona
              </a>
            </div>

            {/* MOCKUP SHOWCASE */}
            <div className="relative mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-card/40 p-2 sm:p-4 shadow-2xl backdrop-blur-xl">
              <div className="absolute -top-12 -right-12 -z-10 h-64 w-64 rounded-full bg-blue-500/20 blur-[80px]" />
              <div className="absolute -bottom-12 -left-12 -z-10 h-64 w-64 rounded-full bg-primary/20 blur-[80px]" />
              
              <div className="rounded-2xl border border-white/5 bg-background overflow-hidden flex flex-col h-[500px] shadow-inner">
                {/* Mockup Header */}
                <div className="h-14 border-b border-white/5 flex items-center px-6 gap-4 bg-card/30">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 max-w-md mx-auto h-8 bg-black/20 dark:bg-white/5 rounded-md flex items-center px-3">
                    <span className="text-xs text-muted-foreground font-mono">app.funilcomercial.com</span>
                  </div>
                </div>
                {/* Mockup Body - Kanban Preview */}
                <div className="flex-1 p-6 overflow-hidden flex gap-6 bg-background/50 hidden sm:flex">
                  {['Novo Lead', 'Qualificação', 'Proposta'].map((stage, i) => (
                    <div key={stage} className="flex-1 flex flex-col gap-4 min-w-[280px]">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{stage}</span>
                        <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-full">{3 - i}</span>
                      </div>
                      <div className="flex-1 flex flex-col gap-3">
                        {[...Array(3 - i)].map((_, j) => (
                          <div key={j} className="bg-card p-4 rounded-xl border border-white/5 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-sm font-semibold">Empresa Alpha {i}{j}</span>
                              <div className={`w-2 h-2 rounded-full ${j === 0 ? 'bg-red-500' : 'bg-green-500'}`} />
                            </div>
                            <div className="text-xs text-muted-foreground mb-4">Negociação de serviços Enterprise</div>
                            <div className="flex justify-between items-center pt-3 border-t border-white/5">
                              <span className="text-xs font-medium">R$ {(15000 * (i+1)).toLocaleString('pt-BR')}</span>
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-[10px] text-primary">JD</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Mobile Mockup Preview */}
                <div className="flex-1 p-6 overflow-hidden flex flex-col gap-4 sm:hidden bg-background/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold">Novo Lead</span>
                        <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-full">3</span>
                    </div>
                    {[...Array(3)].map((_, j) => (
                        <div key={j} className="bg-card p-4 rounded-xl border border-white/5 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-sm font-semibold">Empresa Alpha 0{j}</span>
                            <div className={`w-2 h-2 rounded-full ${j === 0 ? 'bg-red-500' : 'bg-green-500'}`} />
                        </div>
                        <div className="text-xs text-muted-foreground mb-4">Negociação de serviços Enterprise</div>
                        <div className="flex justify-between items-center pt-3 border-t border-white/5">
                            <span className="text-xs font-medium">R$ 15.000</span>
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-[10px] text-primary">JD</span>
                            </div>
                        </div>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM SECTION */}
        <section id="problema" className="py-16 md:py-24 bg-card/30 border-y border-white/5 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-12 md:mb-16 max-w-2xl">
              <span className="text-primary font-bold tracking-wider text-sm uppercase mb-4 block">O Problema</span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">O mercado não perdoa desorganização. Sua equipe perde por falta de processo.</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-background p-6 md:p-8 rounded-3xl border border-white/5 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Leads esfriam</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">A demora no primeiro contato reduz drasticamente suas chances de conversão em vendas de alto ticket.</p>
              </div>
              
              <div className="bg-background p-6 md:p-8 rounded-3xl border border-white/5 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Falta de visão</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Você não sabe exatamente onde o dinheiro está parado nem o motivo das perdas mensais.</p>
              </div>

              <div className="bg-background p-6 md:p-8 rounded-3xl border border-white/5 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Tarefas perdidas</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Follow-ups esquecidos porque a equipe depende de planilhas manuais ou lembretes no celular.</p>
              </div>

              <div className="bg-background p-6 md:p-8 rounded-3xl border border-white/5 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <LayoutDashboard size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Gestão cega</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Decisões baseadas em achismos porque os dados comerciais não estão centralizados e visíveis.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SOLUTION SECTION */}
        <section id="solucao" className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <span className="text-primary font-bold tracking-wider text-sm uppercase mb-4 block">Como Funciona</span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Do primeiro contato ao contrato assinado. Um sistema sem atritos.</h2>
              <p className="text-lg text-muted-foreground">Cada etapa foi milimetricamente desenhada para reduzir o esforço operacional da sua equipe e maximizar o fechamento.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 relative z-10">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Captura & Inbox</h3>
                    <p className="text-muted-foreground">Centralize mensagens do WhatsApp em uma única tela. Transforme conversas em oportunidades com um clique.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Qualificação no Funil</h3>
                    <p className="text-muted-foreground">Mova os leads visualmente pelo Pipeline. Tenha previsibilidade exata de quanto dinheiro há em cada etapa.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Follow-up Automático</h3>
                    <p className="text-muted-foreground">O sistema avisa automaticamente quem precisa de resposta. Suas tarefas diárias priorizadas de forma inteligente.</p>
                  </div>
                </div>
              </div>
              
              <div className="relative hidden sm:block">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-2xl" />
                <div className="bg-card border border-white/10 rounded-3xl p-8 relative shadow-2xl backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="h-10 bg-background rounded-lg border border-white/5 flex items-center px-4">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-3" />
                      <div className="h-2 w-32 bg-white/20 rounded" />
                    </div>
                    <div className="h-10 bg-background rounded-lg border border-primary/50 flex items-center px-4 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                      <div className="w-4 h-4 rounded-full bg-amber-500 mr-3" />
                      <div className="h-2 w-48 bg-primary/60 rounded" />
                    </div>
                    <div className="h-10 bg-background rounded-lg border border-white/5 flex items-center px-4">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mr-3" />
                      <div className="h-2 w-24 bg-white/20 rounded" />
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Taxa de Conversão</p>
                      <p className="text-3xl font-black">28.4%</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-primary border-r-transparent flex items-center justify-center rotate-45">
                      <div className="-rotate-45 text-primary">
                        <MoveRight />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section id="casos" className="py-16 md:py-24 bg-card/30 border-y border-white/5">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Controle total para cada modelo de negócio.</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-background p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Building2 size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">Vendas B2B</h3>
                <p className="text-muted-foreground text-sm">Controle de ciclos longos, múltiplos decisores e histórico completo de propostas e reuniões.</p>
              </div>
              <div className="bg-background p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Briefcase size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">Agências & Serviços</h3>
                <p className="text-muted-foreground text-sm">Gestão visual de novos contratos, onboarding de clientes e upsells para contas existentes.</p>
              </div>
              <div className="bg-background p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Lock size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">Clínicas Premium</h3>
                <p className="text-muted-foreground text-sm">Atendimento via WhatsApp integrado, retenção de pacientes e gestão de procedimentos de alto valor.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-primary font-bold tracking-wider text-sm uppercase mb-4 block">Perguntas Frequentes</span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Antes de acelerar suas vendas, tire as dúvidas finais.</h2>
            </div>

            <div className="space-y-4">
              {[
                { q: "O sistema é difícil de implementar?", a: "Não. A interface foi desenhada para ser intuitiva. Você cria sua conta e em menos de 5 minutos já pode adicionar leads no funil e gerenciar contatos." },
                { q: "Posso testar antes de assinar?", a: "Sim, disponibilizamos uma conta de teste gratuita para você explorar todas as funcionalidades do MVP, criar oportunidades e simular a operação." },
                { q: "Como funciona a integração com WhatsApp?", a: "Oferecemos uma caixa de entrada (Inbox) unificada. Você conecta seu número e responde aos clientes diretamente pelo CRM, convertendo conversas em leads com um clique." },
                { q: "Meus dados estão seguros?", a: "Utilizamos criptografia de ponta a ponta e a infraestrutura robusta do Supabase, garantindo nível Enterprise de segurança para seus clientes e negociações." }
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

        {/* FINAL CTA */}
        <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden bg-card border-t border-white/10">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center z-10">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-6 md:mb-8">Sua operação está pronta para parar de perder dinheiro?</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 md:mb-12 max-w-2xl mx-auto">Crie sua conta de demonstração em 1 minuto e descubra como gestores de alto nível controlam suas vendas.</p>
            
            <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 shadow-[0_0_40px_rgba(245,158,11,0.3)] w-full sm:w-auto">
              Criar Conta de Teste
              <MoveRight size={24} />
            </Link>
            <p className="mt-6 text-sm text-muted-foreground">Sem necessidade de cartão de crédito. Setup instantâneo.</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-background py-10 md:py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                <Logo iconSize={32} variant="icon-only" />
              </div>
              <span className="font-bold text-muted-foreground hidden md:inline">{brandConfig.name}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">© {new Date().getFullYear()} {brandConfig.name}. Todos os direitos reservados.</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">Termos</a>
            <a href="#" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
