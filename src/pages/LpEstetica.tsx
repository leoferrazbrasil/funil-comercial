import { Link } from "react-router-dom";
import { ArrowRight, Globe, Smartphone, MessageCircle, BarChart3, ShieldCheck } from "lucide-react";
import Logo from "../components/Logo";
import { SeoHead } from "../components/SeoHead";
import { LeadCaptureForm } from "../components/LeadCaptureForm";
import { trackWhatsappClick } from "../lib/analytics";

const WHATSAPP_NUMBER = "5551996737359";
const WHATSAPP_MESSAGE = "Olá! Vim pela página da Estrutura de Vendas para Clínicas de Estética e gostaria de avaliar o funil da minha clínica.";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export default function LpEstetica() {
  return (
    <div data-theme="dark" className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <SeoHead
        title="Estrutura de Vendas para Estética | Procedimentos High-Ticket"
        description="A sua clínica lota o WhatsApp de curiosos? Implemente o funil comercial que filtra quem não quer pagar e agenda pacientes focados em estética avançada."
        canonicalUrl="https://funilcomercial.com/estrutura-de-vendas-para-estetica"
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-6">
          <Link to="/">
            <Logo iconSize={32} />
          </Link>
          <a
            href={whatsappLink}
            onClick={() =>
              trackWhatsappClick({ source: "estrutura_vendas_estetica" })
            }
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
                Para Clínicas de Estética Avançada
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 text-foreground">
                O seu Instagram lota o WhatsApp de curiosos. <span className="text-primary block mt-2">Nós lotamos de procedimentos Premium.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                Implemente o Funil Comercial que filtra quem só quer preço baixo e agenda automaticamente os pacientes focados em estética avançada.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={whatsappLink}
                  onClick={() =>
                    trackWhatsappClick({ source: "estrutura_vendas_estetica" })
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-lg shadow-primary/25"
                >
                  Quero estruturar a captação da clínica
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">O funil furado de curiosos</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Você tem os melhores equipamentos e profissionais, mas a sua recepção não consegue fechar as vendas.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Globe className="text-red-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Vícios de Promoção</h3>
                <p className="text-muted-foreground leading-relaxed">As campanhas da agência trazem centenas de cliques, mas o foco é sempre o "antes e depois" com desconto. O público que chega não valoriza a qualidade clínica, apenas o menor preço.</p>
              </div>
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                  <MessageCircle className="text-orange-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Recepção Sufocada</h3>
                <p className="text-muted-foreground leading-relaxed">Sua secretária gasta horas respondendo "Qual o valor da harmonização?". Ela envia o preço, a pessoa visualiza e some. Nenhuma triagem é feita e o fechamento fica no zero.</p>
              </div>
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="text-yellow-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Dependência do Profissional</h3>
                <p className="text-muted-foreground leading-relaxed">Você quer que a clínica fature sem depender 100% da sua imagem o tempo todo, mas sem uma estrutura de vendas previsível (processos de CRM), a agenda fica refém do Instagram.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sessão 3: A Solução */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Implementamos a Captação High-Ticket</h2>
                <p className="text-lg text-muted-foreground mb-8">Nós construímos um sistema duplo focado em intenção de compra. Chega de atender curiosos sem qualificação.</p>
                
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">1</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Google Ads (Intenção Direta)</h4>
                      <p className="text-muted-foreground">Posicionamos sua clínica no topo das buscas para pessoas pesquisando "fios de PDO perto de mim" ou "botox na cidade X", focando em quem já decidiu fazer o procedimento.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">2</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Landing Pages de Procedimento</h4>
                      <p className="text-muted-foreground">Em vez de mandar o tráfego pro seu Instagram ou home do site, enviamos para uma página específica sobre aquele tratamento. Uma página linda que já constrói desejo e prova social.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">3</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">CRM de Triagem de Atendimento</h4>
                      <p className="text-muted-foreground">No WhatsApp, implementamos os scripts e o CRM que organizam o fluxo. O curioso recebe o preço; o paciente potencial é qualificado, agendado e recebe follow-up se esquecer da avaliação.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12">
                <div className="aspect-[4/3] rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center p-6">
                   <div className="text-center">
                      <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">Agenda Qualificada.</h3>
                      <h3 className="text-2xl font-bold text-primary">Previsibilidade.</h3>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Análise gratuita — formulário web */}
        <section id="analise-gratuita" className="py-24">
          <div className="mx-auto max-w-xl px-6">
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 md:p-10">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                Diagnóstico gratuito da clínica
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Deixe seu nome e WhatsApp. Vamos analisar a operação digital da
                sua clínica e desenhar o fluxo de vendas necessário para escalar seus
                procedimentos premium.
              </p>
              <LeadCaptureForm />
            </div>
          </div>
        </section>

        {/* Sessão 4: CTA Final */}
        <section className="py-24 bg-primary text-primary-foreground text-center">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Pronta para blindar a sua recepção?</h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Alerte-me no WhatsApp. Vamos construir o funil que atrai as pacientes ideais para a sua clínica de estética.
            </p>
            <a
              href={whatsappLink}
              onClick={() =>
                trackWhatsappClick({ source: "estrutura_vendas_estetica" })
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-5 text-lg font-bold text-foreground transition-all hover:scale-105 hover:opacity-90 shadow-xl"
            >
              <Smartphone size={24} />
              Falar com o Comercial
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
