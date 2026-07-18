import { Link } from "react-router-dom";
import { ArrowRight, Globe, Smartphone, MessageCircle, BarChart3, ShieldCheck } from "lucide-react";
import Logo from "../components/Logo";
import { SeoHead } from "../components/SeoHead";
import { LeadCaptureForm } from "../components/LeadCaptureForm";
import { trackWhatsappClick } from "../lib/analytics";

const WHATSAPP_NUMBER = "5551996737359";
const WHATSAPP_MESSAGE = "Olá! Vim pela página da Estrutura de Vendas para Advogados e gostaria de fazer uma análise da presença do meu escritório.";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export default function LpAdvogados() {
  return (
    <div data-theme="dark" className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <SeoHead
        title="Estrutura de Vendas para Advogados | Captação Ética OAB"
        description="A sua captação de clientes não precisa ferir a OAB nem depender apenas de indicações. Estruture seu escritório para captar demandas de alto valor no Google."
        canonicalUrl="https://funilcomercial.com/estrutura-de-vendas-para-advogados"
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
              trackWhatsappClick({ source: "estrutura_vendas_advogados" })
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
                Consultoria para Escritórios Jurídicos
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 text-foreground">
                A sua captação não precisa ferir a OAB <span className="text-primary block mt-2">nem depender de indicações.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                Descubra a estrutura digital que capta demandas de alto valor no Google e qualifica o cliente antes de ele falar com o seu escritório.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={whatsappLink}
                  onClick={() =>
                    trackWhatsappClick({ source: "estrutura_vendas_advogados" })
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-lg shadow-primary/25"
                >
                  Quero solicitar a análise do meu escritório
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">A armadilha do marketing de vaidade</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">A OAB proíbe a mercantilização, mas não proíbe você de ser encontrado por quem já procura a solução técnica.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Globe className="text-red-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Posts que não pagam as contas</h3>
                <p className="text-muted-foreground leading-relaxed">Você investe em agências que fazem posts comemorando feriados no Instagram, gerando curtidas e parabéns, mas nenhum contrato lucrativo é fechado por lá.</p>
              </div>
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                  <MessageCircle className="text-orange-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">O curioso da "dúvida rápida"</h3>
                <p className="text-muted-foreground leading-relaxed">Quando um lead chega, é sempre buscando consultoria gratuita pelo WhatsApp. O seu contato é direto e sem filtro, sugando o tempo valioso dos sócios do escritório.</p>
              </div>
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="text-yellow-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Perdendo para a concorrência</h3>
                <p className="text-muted-foreground leading-relaxed">Enquanto você foca no "boca a boca", seu concorrente fatura alto porque aparece no Google quando alguém com dinheiro na mão pesquisa por "advogado tributarista".</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sessão 3: A Solução */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Construímos o escudo de autoridade do seu escritório</h2>
                <p className="text-lg text-muted-foreground mb-8">Nossa metodologia de Funil Comercial foca em atração corporativa. Quando o lead chegar, ele pedirá para agendar uma reunião, não se é de graça.</p>
                
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">1</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Posicionamento SEO (OAB Compliant)</h4>
                      <p className="text-muted-foreground">Você vai aparecer no topo do Google apenas para quem já tem a dor (pesquisando por divórcio, tributário, trabalhista), respeitando totalmente o provimento 205/2021.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">2</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Página de Alta Performance</h4>
                      <p className="text-muted-foreground">Substituímos o cartão de visitas genérico por uma página que projeta a autoridade do seu currículo e escritório, filtrando os curiosos com um formulário profissional.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">3</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">CRM de Acompanhamento</h4>
                      <p className="text-muted-foreground">Casos jurídicos levam meses para fechar. Com nosso CRM integrado, nenhum cliente potencial fica esquecido. Você terá o controle visual de cada negociação.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12">
                <div className="aspect-[4/3] rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center p-6">
                   <div className="text-center">
                      <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">Inteligência Comercial.</h3>
                      <h3 className="text-2xl font-bold text-primary">Captação Passiva.</h3>
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
                Solicite uma análise da presença do seu escritório
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Deixe seu nome e WhatsApp. A gente analisa a sua pegada digital e te
                mostra, sem compromisso, a viabilidade de uma estrutura comercial ética
                para o seu nicho.
              </p>
              <LeadCaptureForm />
            </div>
          </div>
        </section>

        {/* Sessão 4: CTA Final */}
        <section className="py-24 bg-primary text-primary-foreground text-center">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Pronto para assumir o controle dos seus honorários?</h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Fale comigo diretamente no WhatsApp. Vou entender as áreas do seu escritório e mostrar o funil exato que os maiores players usam para crescer.
            </p>
            <a
              href={whatsappLink}
              onClick={() =>
                trackWhatsappClick({ source: "estrutura_vendas_advogados" })
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-5 text-lg font-bold text-foreground transition-all hover:scale-105 hover:opacity-90 shadow-xl"
            >
              <Smartphone size={24} />
              Falar com Consultor B2B
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
