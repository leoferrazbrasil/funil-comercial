import { Link } from "react-router";
import { ArrowRight, Globe, Smartphone, MessageCircle, BarChart3, ShieldCheck } from "lucide-react";
import Logo from "../components/Logo";
import { SeoHead, generateFAQSchema } from "../components/SeoHead";
import { LeadCaptureForm } from "../components/LeadCaptureForm";
import { trackWhatsappClick } from "../lib/analytics";

const WHATSAPP_NUMBER = "5551996737359";
const WHATSAPP_MESSAGE = "Olá! Vim pela página da Estrutura de Vendas para Arquitetos e Engenheiros e gostaria de organizar a captação do meu escritório.";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export default function LpArquitetos() {
  const faqs = [
    {
        "question": "Como atrair clientes que valorizam o projeto arquitetônico e não apenas o preço?",
        "answer": "Parando de competir apenas por imagem. Projetos de alto padrão exigem confiança técnica. Nossa estrutura posiciona o escritório no Google para buscas qualificadas (B2B ou luxo), ancorando autoridade antes do contato."
    },
    {
        "question": "Por que apenas postar renders em 3D no Instagram não traz bons clientes?",
        "answer": "O Instagram atrai admiradores e estudantes de arquitetura. O cliente que está reformando uma clínica ou construindo uma casa pesquisa por 'escritório de arquitetura' no Google."
    },
    {
        "question": "O que deve ter na Landing Page de um arquiteto?",
        "answer": "Velocidade, prova social (projetos executados) e um formulário de qualificação (entender tamanho da obra e orçamento) antes da primeira reunião de briefing."
    }
];

  return (
    <div data-theme="dark" className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <SeoHead
        title="Estrutura de Vendas para Arquitetos | Clientes de Alto Padrão"
        description="Seguidores não assinam projetos. Pare de atrair curiosos e construa a estrutura digital que capta projetos de alto padrão e contratos B2B no Google."
        canonicalUrl="https://funilcomercial.com/estrutura-de-vendas-para-arquitetos"
        schema={generateFAQSchema(faqs)}
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
              trackWhatsappClick({ source: "estrutura_vendas_arquitetos" })
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
                Para Arquitetos e Engenheiros
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 text-foreground">
                Seguidores não assinam projetos. <span className="text-primary block mt-2">Comece a captar Alto Padrão.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                Construa a estrutura comercial que faz o seu portfólio vender grandes projetos e laudos técnicos, fugindo da guerra de preços do Instagram.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={whatsappLink}
                  onClick={() =>
                    trackWhatsappClick({ source: "estrutura_vendas_arquitetos" })
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-lg shadow-primary/25"
                >
                  Estruturar a máquina de contratos
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">A armadilha do render no Instagram</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Você tem um portfólio incrível, mas a presença digital do seu escritório atrai o público sensível a preço.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Globe className="text-red-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Elogios não pagam a equipe</h3>
                <p className="text-muted-foreground leading-relaxed">Você investe horas em renderizações 3D impecáveis. As pessoas curtem, elogiam e pedem "diquinhas" de decoração, mas os grandes contratos não vêm dali.</p>
              </div>
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                  <MessageCircle className="text-orange-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Orçamentos de Curiosos</h3>
                <p className="text-muted-foreground leading-relaxed">Quando alguém te chama no WhatsApp, é para cotar um projeto pequeno e barganhar valor, desvalorizando toda a sua expertise técnica e anos de estudo.</p>
              </div>
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="text-yellow-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">O Cliente Corporativo (B2B)</h3>
                <p className="text-muted-foreground leading-relaxed">Quando um diretor de empresa precisa investir R$ 500 mil em um projeto ou retrofit, ele pesquisa no Google por histórico e solidez. E hoje, o seu escritório não está lá.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sessão 3: A Solução */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">O Funil de Vendas de Alto Padrão</h2>
                <p className="text-lg text-muted-foreground mb-8">Nós construímos o Fichário Técnico do seu escritório na internet. Uma máquina focada em fechar negócios de alto Valor Geral de Vendas (VGV).</p>
                
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">1</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Posicionamento B2B e High-Ticket</h4>
                      <p className="text-muted-foreground">Configuramos suas campanhas no Google Ads (Fundo de Funil) para capturar quem precisa de regularização, laudos, projetos corporativos ou arquitetura de alto padrão.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">2</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Página de Apresentação (Portfólio Ativo)</h4>
                      <p className="text-muted-foreground">O clique do anúncio não cai no seu Instagram. Ele vai para uma Landing Page de altíssima velocidade que vende a sua segurança técnica, experiência e metodologia.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">3</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">CRM para Ciclos Longos</h4>
                      <p className="text-muted-foreground">Vender um projeto grande leva meses. Sem um CRM visual, as negociações esfriam e morrem no WhatsApp. Estruturamos o acompanhamento (follow-up) automático para você.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12">
                <div className="aspect-[4/3] rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center p-6">
                   <div className="text-center">
                      <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">Segurança Técnica.</h3>
                      <h3 className="text-2xl font-bold text-primary">Contratos B2B.</h3>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        
        {/* FAQ Section */}
        <section className="py-24 bg-white/[0.02] border-y border-white/5">
          <div className="mx-auto max-w-3xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Perguntas Frequentes</h2>
              <p className="text-muted-foreground text-lg">Tudo o que você precisa saber sobre a nossa estrutura comercial.</p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="group border border-white/10 bg-background rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 p-6 font-semibold text-lg transition-colors hover:bg-white/[0.02]">
                    {faq.question}
                    <span className="transition duration-300 group-open:-rotate-180 text-primary">
                      <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                    <p>{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>


        {/* Análise gratuita — formulário web */}
        <section id="analise-gratuita" className="py-24">
          <div className="mx-auto max-w-xl px-6">
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 md:p-10">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                Solicite o diagnóstico da sua captação
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Deixe seu nome e WhatsApp. Vamos analisar a presença do seu escritório
                e te mostrar como o Funil Comercial pode filtrar curiosos e trazer contratos reais.
              </p>
              <LeadCaptureForm />
            </div>
          </div>
        </section>

        {/* Sessão 4: CTA Final */}
        <section className="py-24 bg-primary text-primary-foreground text-center">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Pronto para fechar grandes projetos?</h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Me chame no WhatsApp e vamos estruturar a máquina de vendas que o seu portfólio merece.
            </p>
            <a
              href={whatsappLink}
              onClick={() =>
                trackWhatsappClick({ source: "estrutura_vendas_arquitetos" })
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-5 text-lg font-bold text-foreground transition-all hover:scale-105 hover:opacity-90 shadow-xl"
            >
              <Smartphone size={24} />
              Estruturar meu escritório agora
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
