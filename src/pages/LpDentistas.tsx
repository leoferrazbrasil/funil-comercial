import { Link } from "react-router-dom";
import { ArrowRight, BadgeDollarSign, Smartphone, MessageCircle, Activity, CheckCircle2 } from "lucide-react";
import Logo from "../components/Logo";
import { SeoHead } from "../components/SeoHead";

const WHATSAPP_NUMBER = "5551996737359";
const WHATSAPP_MESSAGE = "Olá! Vim pela página da Estrutura de Vendas para Dentistas e gostaria de fazer o diagnóstico gratuito da minha clínica.";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export default function LpDentistas() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <SeoHead
        title="Estrutura de Vendas para Dentistas | Pare de Disputar Preço"
        description="O seu consultório atrai apenas pesquisas de 'preço de limpeza' no WhatsApp? Montamos a estrutura comercial focada em tratamentos de alto ticket para a sua clínica."
        canonicalUrl="https://funilcomercial.com/estrutura-de-vendas-para-dentistas"
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
                Especial para Clínicas Odontológicas
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 text-foreground">
                O seu problema não é falta de paciente. <span className="text-primary block mt-2">É atrair quem só busca o preço mais baixo.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                Você investe pesado em especializações e equipamentos, mas o WhatsApp da clínica virou um "leilão de orçamentos". Nós montamos a sua máquina comercial para atrair procedimentos rentáveis.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-lg shadow-primary/25"
                >
                  Quero atrair pacientes rentáveis
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que o faturamento da cadeira não cresce?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Sua clínica está cheia, mas com procedimentos que não remuneram o seu verdadeiro valor como especialista.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                  <MessageCircle className="text-red-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">O Leilão do WhatsApp</h3>
                <p className="text-muted-foreground leading-relaxed">O lead chega perguntando "Qual o valor do implante?". A recepção responde, o paciente visualiza e some para procurar o concorrente mais barato.</p>
              </div>
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                  <BadgeDollarSign className="text-orange-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">A Armadilha do Baixo Ticket</h3>
                <p className="text-muted-foreground leading-relaxed">A cadeira está ocupada, mas com manutenções e convênios que não trazem lucratividade, enquanto os procedimentos de alto ticket não chegam.</p>
              </div>
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Activity className="text-blue-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Presença Genérica</h3>
                <p className="text-muted-foreground leading-relaxed">Se o seu site parece igual ao de todas as outras clínicas do bairro, você perde a autoridade de especialista e o paciente decide pelo preço.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sessão 3: A Solução */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Nós construímos o seu Funil Comercial de Alto Ticket</h2>
                <p className="text-lg text-muted-foreground mb-8">Posicionamento de autoridade e qualificação comercial. O paciente precisa entender o seu valor antes mesmo de falar com a sua recepção.</p>
                
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">1</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Google & Intenção Direta</h4>
                      <p className="text-muted-foreground">Em vez de panfletagem no Instagram, posicionamos a sua clínica para buscas de alta intenção como "especialista em implante" ou "Invisalign na cidade".</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">2</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Páginas de Alta Conversão</h4>
                      <p className="text-muted-foreground">Criamos Landing Pages focadas em tratamentos específicos (HOF, Lentes, Implantes) para ancorar a sua autoridade de especialista de forma premium.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">3</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">CRM e Follow-up da Recepção</h4>
                      <p className="text-muted-foreground">Implementamos um CRM que organiza quem agendou, quem avaliou e quem fechou o tratamento, evitando que propostas valiosas fiquem esquecidas.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12">
                <div className="aspect-[4/3] rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center p-6">
                   <div className="text-center">
                      <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">A sua especialidade exige precisão.</h3>
                      <h3 className="text-2xl font-bold text-primary">A sua captação também.</h3>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sessão 4: CTA Final */}
        <section className="py-24 bg-primary text-primary-foreground text-center">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Pronto para procedimentos rentáveis?</h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Me chame no WhatsApp. Vou analisar a presença digital da sua clínica e te mostrar como blindar o seu consultório contra a guerra de preços.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-5 text-lg font-bold text-foreground transition-all hover:scale-105 hover:bg-white shadow-xl"
            >
              <Smartphone size={24} />
              Falar com Especialista em Odontologia
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
