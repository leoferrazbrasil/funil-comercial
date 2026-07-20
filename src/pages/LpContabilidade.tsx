import { Link } from "react-router-dom";
import { ArrowRight, Globe, Smartphone, MessageCircle, BarChart3, ShieldCheck } from "lucide-react";
import Logo from "../components/Logo";
import { SeoHead, generateFAQSchema } from "../components/SeoHead";
import { LeadCaptureForm } from "../components/LeadCaptureForm";
import { trackWhatsappClick } from "../lib/analytics";

const WHATSAPP_NUMBER = "5551996737359";
const WHATSAPP_MESSAGE = "Olá! Vim pela página da Estrutura de Vendas para Contabilidade e gostaria de entender como escalar a captação do meu escritório.";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export default function LpContabilidade() {
  const faqs = [
    {
        "question": "Como atrair grandes contas (empresas) em vez de apenas MEIs?",
        "answer": "Segmentando as campanhas no Google Ads para palavras-chave de fundo de funil, como 'trocar de contabilidade' ou 'contabilidade para lucro real', onde estão as empresas buscando transição."
    },
    {
        "question": "É possível escalar as vendas de serviços contábeis pela internet?",
        "answer": "Sim, através de previsibilidade. Com uma Landing Page de alta conversão captando leads e um CRM gerindo o ciclo de vendas (que costuma ser mais longo), você sai da dependência da indicação."
    },
    {
        "question": "Por que o empresário desiste da migração no meio do caminho?",
        "answer": "Pelo atrito percebido. Sua estrutura de vendas deve deixar claro que a sua equipe cuidará de toda a transição burocrática, reduzindo o medo da Receita Federal."
    }
];

  return (
    <div data-theme="dark" className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <SeoHead
        title="Estrutura de Vendas para Contabilidade | Captar Lucro Real e Presumido"
        description="Pare de brigar por honorários mínimos. Construa a estrutura comercial para captar contas B2B de alto valor para o seu escritório contábil."
        canonicalUrl="https://funilcomercial.com/estrutura-de-vendas-para-contabilidade"
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
              trackWhatsappClick({ source: "estrutura_vendas_contabilidade" })
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
                Consultoria Comercial para Contadores
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 text-foreground">
                Pare de brigar por honorários mínimos. <span className="text-primary block mt-2">Atraia empresas sólidas.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                A estrutura comercial invisível que os grandes escritórios de contabilidade usam para captar contas B2B de alto valor no Google.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={whatsappLink}
                  onClick={() =>
                    trackWhatsappClick({ source: "estrutura_vendas_contabilidade" })
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-lg shadow-primary/25"
                >
                  Quero estruturar meu funil B2B
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">A guerra por centavos e o lead fantasma</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Você luta para manter a margem atendendo quem só busca preço, enquanto as grandes contas migram silenciosamente.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Globe className="text-red-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">O Cliente Focado no Preço</h3>
                <p className="text-muted-foreground leading-relaxed">O marketing que você faz atrai apenas quem quer abrir um MEI de graça ou quer a contabilidade mais barata do mercado, esgotando o tempo do seu time fiscal.</p>
              </div>
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                  <MessageCircle className="text-orange-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">O Vazamento Comercial</h3>
                <p className="text-muted-foreground leading-relaxed">O empresário pesquisa "trocar de contabilidade", entra no seu site genérico e não encontra clareza. Ou pior, manda WhatsApp e a sua equipe, ocupada fechando folha, demora para responder.</p>
              </div>
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="text-yellow-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Falta de Inteligência de Migração</h3>
                <p className="text-muted-foreground leading-relaxed">Uma empresa de Lucro Real ou Presumido só troca de contador por erro ou lentidão no atendimento. Mas quando eles tomam essa decisão, você não está lá para capturá-los.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sessão 3: A Solução */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Implementamos a Máquina de Aquisição B2B</h2>
                <p className="text-lg text-muted-foreground mb-8">Nós transformamos o seu escritório contábil em uma autoridade digital focada em segurança fiscal e conversão rápida.</p>
                
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">1</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Tráfego de Migração (Fundo de Funil)</h4>
                      <p className="text-muted-foreground">Posicionamos o seu escritório no Google Ads para buscar o empresário que já está insatisfeito com a contabilidade atual e tem urgência na troca.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">2</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Landing Page de Transição Segura</h4>
                      <p className="text-muted-foreground">Criamos uma página focada em resolver o medo da Receita Federal. O foco do site é provar como o seu processo de migração (onboarding) é rápido e indolor para a empresa.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">3</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Inteligência Comercial B2B (CRM)</h4>
                      <p className="text-muted-foreground">Vendas B2B exigem reuniões e acompanhamento. Nosso CRM avisa quando enviar a proposta, quando cobrar e qual a temperatura (Lucro Real, Simples Nacional) de cada lead.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12">
                <div className="aspect-[4/3] rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center p-6">
                   <div className="text-center">
                      <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">Contratos Sólidos.</h3>
                      <h3 className="text-2xl font-bold text-primary">Margem Garantida.</h3>
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
                Solicite uma análise para o seu escritório
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Deixe seus dados abaixo. Vamos analisar o seu posicionamento no mercado
                e mostrar a estrutura necessária para captar contas de alto valor na sua região.
              </p>
              <LeadCaptureForm />
            </div>
          </div>
        </section>

        {/* Sessão 4: CTA Final */}
        <section className="py-24 bg-primary text-primary-foreground text-center">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Hora de parar de competir por preço.</h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Chame nossa equipe comercial agora e entenda o método exato de captação que blinda o caixa do seu escritório contábil.
            </p>
            <a
              href={whatsappLink}
              onClick={() =>
                trackWhatsappClick({ source: "estrutura_vendas_contabilidade" })
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-5 text-lg font-bold text-foreground transition-all hover:scale-105 hover:opacity-90 shadow-xl"
            >
              <Smartphone size={24} />
              Falar com Especialista
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
