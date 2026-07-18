import { Link } from "react-router-dom";
import { ArrowRight, Brain, Smartphone, MessageCircle, EyeOff, ShieldCheck } from "lucide-react";
import Logo from "../components/Logo";
import { SeoHead } from "../components/SeoHead";

const WHATSAPP_NUMBER = "5551996737359";
const WHATSAPP_MESSAGE = "Olá! Vim pela página da Estrutura de Captação para Psicólogas e gostaria de fazer o diagnóstico gratuito do meu consultório.";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export default function LpPsicologas() {
  return (
    <div data-theme="dark" className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <SeoHead
        title="Estrutura de Captação para Psicólogos | Agenda Previsível e Ética"
        description="Você é excelente na clínica, mas o seu site não transmite autoridade e a agenda depende de indicação? Montamos a máquina de atração do seu consultório."
        canonicalUrl="https://funilcomercial.com/estrutura-de-vendas-para-psicologas"
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-6">
          <Link to="/">
            <Logo iconSize={32} />
          </Link>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 sm:flex"
          >
            Falar no WhatsApp
          </a>
        </div>
      </header>

      <main>
        {/* Sessão 1: Hero */}
        <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
                Especial para Profissionais de Psicologia
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 text-foreground">
                O seu problema não é a abordagem. <span className="text-primary block mt-2">É a captação.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                Você é excelente com seus pacientes, mas o seu site afasta quem pesquisa no Google, o WhatsApp é frio no primeiro contato e o medo do CRP te paralisa. Nós montamos a sua presença digital de forma segura e acolhedora.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-lg shadow-primary/25"
                >
                  Quero estruturar meu consultório
                  <ArrowRight size={20} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Sessão 2: Agitação da Dor */}
        <section className="py-24 bg-white/[0.02] border-y border-white/5">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que a sua agenda nunca estabiliza?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Não basta ser uma ótima profissional se o primeiro ponto de contato quebra a confiança do paciente.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                  <EyeOff className="text-red-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">A Presença Invisível no Google</h3>
                <p className="text-muted-foreground leading-relaxed">Enquanto dezenas de pacientes pesquisam "psicólogo perto de mim" ou "terapia online", eles encontram grandes clínicas populares e não o seu consultório.</p>
              </div>
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                  <MessageCircle className="text-blue-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">O Acolhimento Frio no WhatsApp</h3>
                <p className="text-muted-foreground leading-relaxed">O paciente entra em contato num momento sensível. Se a sua primeira resposta for demorada ou focar apenas em dar o "preço da sessão", ele some na mesma hora.</p>
              </div>
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Brain className="text-purple-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">O Medo de "Se Vender"</h3>
                <p className="text-muted-foreground leading-relaxed">O CRP exige ética, com razão. Mas muitos confundem agir com ética com ser invisível. Você não precisa fazer dancinhas, precisa apenas estar presente onde o paciente já está.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sessão 3: A Solução */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Nós criamos a sua estrutura alinhada ao conselho de ética</h2>
                <p className="text-lg text-muted-foreground mb-8">Posicionamento profissional. Chega de táticas de marketing agressivo. Nós focamos na clareza e no acolhimento para atrair o paciente no momento certo.</p>
                
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">1</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Busca Ativa (Google)</h4>
                      <p className="text-muted-foreground">Posicionamos o seu nome onde a intenção já existe. Você aparecerá para pacientes que estão buscando ativamente por terapia no Google.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">2</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Página de Alta Conversão</h4>
                      <p className="text-muted-foreground">Sua formação, especialidades (TCC, Psicanálise) e abordagem apresentadas em um site seguro, rápido e projetado para gerar confiança no primeiro olhar.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">3</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Primeiro Atendimento Organizado</h4>
                      <p className="text-muted-foreground">Implementamos um CRM integrado ao seu WhatsApp. Fluxos de mensagens éticas e acompanhamento organizado para você não esquecer nenhum paciente.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12">
                <div className="aspect-[4/3] rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center p-6">
                   <div className="text-center">
                      <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">A psicologia cuida da mente.</h3>
                      <h3 className="text-2xl font-bold text-primary">Nós cuidamos do negócio.</h3>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sessão 4: CTA Final */}
        <section className="py-24 bg-primary text-primary-foreground text-center">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Pronta para ter um consultório previsível?</h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Me chame no WhatsApp. Vou entender o seu momento atual e te mostrar como estruturamos a captação de outras colegas psicólogas de forma totalmente ética.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-5 text-lg font-bold text-foreground transition-all hover:scale-105 hover:opacity-90 shadow-xl"
            >
              <Smartphone size={24} />
              Falar com Especialista no WhatsApp
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-background py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Logo iconSize={24} />
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Funil Comercial. Todos os direitos reservados.
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
            <Link to="/termos" className="hover:text-foreground transition-colors">Termos de Serviço</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
