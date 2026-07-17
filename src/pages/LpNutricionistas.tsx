import { Link } from "react-router-dom";
import { ArrowRight, Globe, Smartphone, MessageCircle, BarChart3, ShieldCheck } from "lucide-react";
import Logo from "../components/Logo";
import { SeoHead } from "../components/SeoHead";

const WHATSAPP_NUMBER = "5551996737359";
const WHATSAPP_MESSAGE = "Olá! Vim pela página da Estrutura de Vendas para Nutricionistas e gostaria de fazer o diagnóstico gratuito do meu consultório.";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export default function LpNutricionistas() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <SeoHead
        title="Estrutura de Vendas para Nutricionistas | Pare de Depender de Indicação"
        description="Você atende bem, mas o site parece amador e os leads somem no WhatsApp? Montamos a estrutura de vendas do seu consultório de nutrição de ponta a ponta."
        canonicalUrl="https://funilcomercial.com/estrutura-de-vendas-para-nutricionistas"
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
                Especial para Nutricionistas
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 text-foreground">
                O seu problema não é competência. <span className="text-primary block mt-2">É estrutura comercial.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                Você atende bem, mas o site parece amador, os leads somem no WhatsApp e a agenda depende de indicação. Nós montamos a máquina de vendas do seu consultório.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-lg shadow-primary/25"
                >
                  Quero ver como ficaria a minha página
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que você está perdendo pacientes todos os dias?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Você investe em especializações, mas a porta de entrada do seu consultório afasta os melhores clientes.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Globe className="text-red-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">A Presença Amadora</h3>
                <p className="text-muted-foreground leading-relaxed">Seu nome não aparece no Google ou o seu link da bio leva para um site genérico, lento e que não transmite a sua verdadeira autoridade como nutricionista.</p>
              </div>
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                  <MessageCircle className="text-orange-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">O Buraco Negro do WhatsApp</h3>
                <p className="text-muted-foreground leading-relaxed">O potencial paciente pergunta "Qual o valor da consulta?", você responde com um texto enorme e, em seguida, ele visualiza e simplesmente some.</p>
              </div>
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="text-yellow-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Montanha-Russa de Indicações</h3>
                <p className="text-muted-foreground leading-relaxed">Sua agenda é imprevisível. Você tem meses bons porque pacientes indicaram outros, mas não tem um processo ativo para captar quem já está pesquisando por um nutri.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sessão 3: A Solução */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Nós montamos a sua Estrutura de Vendas de ponta a ponta</h2>
                <p className="text-lg text-muted-foreground mb-8">Chega de vender "marketing genérico". Nós implementamos os 3 pilares exatos para transformar desconhecidos do Google em pacientes na sua cadeira.</p>
                
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">1</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Google & Presença Orgânica</h4>
                      <p className="text-muted-foreground">Configuramos o seu Perfil de Empresa e otimizamos a busca para que você seja encontrada por quem procura nutricionista na sua cidade hoje.</p>
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
                      <p className="text-muted-foreground">Substituímos sites lentos por uma Landing Page focada exclusivamente em converter o visitante em um clique direto para o seu WhatsApp.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">3</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">WhatsApp & CRM Organizado</h4>
                      <p className="text-muted-foreground">Fim dos pacientes perdidos. Implementamos etiquetas, cadência de acompanhamento e organização para você nunca mais esquecer um follow-up.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12">
                <div className="aspect-[4/3] rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center p-6">
                   <div className="text-center">
                      <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">Menos achismo.</h3>
                      <h3 className="text-2xl font-bold text-primary">Mais processo.</h3>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sessão 4: CTA Final */}
        <section className="py-24 bg-primary text-primary-foreground text-center">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Pronta para parar de perder pacientes?</h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Me chame no WhatsApp. Vou analisar o seu consultório hoje e te mostrar, na prática, como ficaria a sua nova estrutura comercial rodando.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-5 text-lg font-bold text-foreground transition-all hover:scale-105 hover:bg-white shadow-xl"
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
