import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Leaf, HeartHandshake, MessageCircle, Link2Off } from "lucide-react";
import Logo from "../components/Logo";
import { SeoHead } from "../components/SeoHead";

const WHATSAPP_NUMBER = "5551996737359";
const WHATSAPP_MESSAGE = "Olá! Vim pela página da Estrutura de Captação para Terapeutas e gostaria de conversar sobre o meu espaço terapêutico.";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export default function LpTerapeutas() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <SeoHead
        title="Captação de Pacientes para Terapeutas | Mais Profissionalismo"
        description="Você transforma vidas, mas o seu perfil parece amador e a agenda está vazia? Montamos a estrutura digital que transmite a verdadeira autoridade do seu método terapêutico."
        canonicalUrl="https://funilcomercial.com/estrutura-de-vendas-para-terapeutas"
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
                Especial para Terapeutas e Profissionais Holísticos
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 text-foreground">
                Você transforma vidas. <span className="text-primary block mt-2">O seu digital transmite isso?</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                O seu problema não é o seu método ou a sua energia. É a falta de um posicionamento que atraia pacientes que valorizam o seu trabalho. Nós estruturamos a sua captação sem perder o acolhimento.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-lg shadow-primary/25"
                >
                  Quero profissionalizar minha captação
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que a sua agenda vive de altos e baixos?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Muitos profissionais excelentes sofrem com a imagem de "amadorismo" porque não estruturam a jornada do paciente.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Link2Off className="text-red-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">O "Linktree" Amador</h3>
                <p className="text-muted-foreground leading-relaxed">Seus pacientes caem numa página confusa cheia de botões soltos. Sem uma página própria, eles não entendem a profundidade da sua formação e do seu método.</p>
              </div>
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                  <MessageCircle className="text-orange-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">O Abandono no WhatsApp</h3>
                <p className="text-muted-foreground leading-relaxed">Alguém pergunta "como funciona", você manda um áudio enorme explicando a terapia com todo carinho, e a pessoa some com um "vou pensar".</p>
              </div>
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Leaf className="text-blue-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">A Exaustão do Instagram</h3>
                <p className="text-muted-foreground leading-relaxed">Você gasta energia produzindo posts de conscientização para quem ainda não está pronto, enquanto ignora quem já está buscando ativamente por alívio no Google.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sessão 3: A Solução */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Sua essência terapêutica em uma estrutura profissional</h2>
                <p className="text-lg text-muted-foreground mb-8">Nós construímos uma ponte segura entre quem precisa de ajuda emocional e a sua expertise, acabando com a sensação de estar "empurrando" sessão.</p>
                
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">1</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Busca Ativa (Apareça no Google)</h4>
                      <p className="text-muted-foreground">Posicionamos o seu nome para pessoas que já entenderam que precisam do seu método e estão buscando terapia ativamente na sua região ou online.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">2</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Página de Acolhimento e Autoridade</h4>
                      <p className="text-muted-foreground">Um site leve, acolhedor e altamente profissional. Ele educa o paciente sobre o seu método antes mesmo do primeiro contato, elevando o seu valor percebido.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">3</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Atendimento Estruturado no WhatsApp</h4>
                      <p className="text-muted-foreground">Organizamos o primeiro contato para que o paciente se sinta verdadeiramente acolhido, com respostas claras e cadência de acompanhamento no CRM.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12">
                <div className="aspect-[4/3] rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center p-6">
                   <div className="text-center">
                      <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">Terapia é conexão e energia.</h3>
                      <h3 className="text-2xl font-bold text-primary">Nós cuidamos da organização.</h3>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sessão 4: CTA Final */}
        <section className="py-24 bg-primary text-primary-foreground text-center">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Pronta para viver plenamente da sua terapia?</h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Me chame no WhatsApp. Vou entender o seu método e te mostrar como é possível atrair pacientes qualificados sem se desgastar produzindo conteúdo infinito.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-5 text-lg font-bold text-foreground transition-all hover:scale-105 hover:bg-white shadow-xl"
            >
              <HeartHandshake size={24} />
              Falar com Especialista em Captação
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
