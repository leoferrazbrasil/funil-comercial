import { Link } from "react-router-dom";
import { ArrowRight, BadgeDollarSign, Smartphone, UserMinus, Activity, CalendarRange } from "lucide-react";
import Logo from "../components/Logo";
import { SeoHead, generateFAQSchema } from "../components/SeoHead";

const WHATSAPP_NUMBER = "5551996737359";
const WHATSAPP_MESSAGE = "Olá! Vim pela página da Estrutura de Captação para Massoterapeutas e gostaria de conversar sobre a minha clínica/espaço.";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export default function LpMassoterapeutas() {
  const faqs = [
    {
        "question": "Como acabar com os buracos na agenda do meu estúdio de massagem?",
        "answer": "Implementando campanhas ativas de Google Ads para quem procura relaxamento na sua região e, principalmente, um CRM para ativar quem já foi seu cliente com ofertas de pacotes e assinaturas."
    },
    {
        "question": "Como vender planos de recorrência e não apenas sessões avulsas?",
        "answer": "A estrutura de vendas foca na esteira de produtos. A sessão avulsa é apenas a porta de entrada. A venda do pacote ocorre no pós-atendimento através de processos comerciais amarrados ao WhatsApp."
    },
    {
        "question": "Preciso de um site complexo?",
        "answer": "Pelo contrário. Você precisa de uma Landing Page rápida e direta, focada em mostrar o ambiente, especialidades e direcionar com 1 clique para o WhatsApp da sua marcação."
    }
];

  return (
    <div data-theme="dark" className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <SeoHead
        title="Captação de Pacientes para Massoterapeutas | Agenda Previsível"
        description="A sua maca vive com horários vazios ou você perde pacientes por causa de preço? Montamos a estrutura comercial focada em fidelizar e vender tratamentos."
        canonicalUrl="https://funilcomercial.com/estrutura-de-vendas-para-massoterapeutas"
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
                Especial para Profissionais de Massoterapia
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 text-foreground">
                Você alivia a dor dos outros. <span className="text-primary block mt-2">Mas quem alivia a dor da sua agenda vazia?</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                Você é excelente na maca, mas o seu WhatsApp virou uma guerra de preços e os pacientes somem após a primeira sessão. Nós estruturamos a sua captação para atrair quem valoriza o seu espaço e compra pacotes de tratamento.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-lg shadow-primary/25"
                >
                  Quero lotar a minha maca
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que é tão difícil manter a agenda 100% ocupada?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Vender saúde e relaxamento exige autoridade. Sem um processo, o seu trabalho vira apenas "apertar as costas" aos olhos do cliente.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                  <BadgeDollarSign className="text-red-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">A Guerra de Preços no WhatsApp</h3>
                <p className="text-muted-foreground leading-relaxed">O cliente manda "Qual o valor da massagem?". Você passa o preço, e ele vai no concorrente que cobra R$20 a menos. Falta construção de valor antes de passar o preço.</p>
              </div>
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                  <UserMinus className="text-orange-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">O Paciente de "Uma Sessão Só"</h3>
                <p className="text-muted-foreground leading-relaxed">Você atende com excelência, o paciente sai aliviado, elogia muito, mas não volta na semana seguinte. Sem um follow-up organizado, você não consegue vender pacotes.</p>
              </div>
              <div className="bg-background border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Activity className="text-blue-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Invisibilidade Geográfica</h3>
                <p className="text-muted-foreground leading-relaxed">Quem acorda travado de dor procura "massoterapeuta perto de mim" no Google. Se você gasta todo o seu tempo dançando no Instagram e não aparece na busca, perde dinheiro todos os dias.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sessão 3: A Solução */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Nós transformamos o seu dom em uma clínica lucrativa</h2>
                <p className="text-lg text-muted-foreground mb-8">Nossa Estrutura de Captação atrai o paciente pela dor aguda, gera autoridade na sua técnica e usa automação para vender pacotes de tratamento de forma leve.</p>
                
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">1</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Busca Local de Alta Intenção</h4>
                      <p className="text-muted-foreground">Colocamos o seu espaço de massoterapia nas primeiras posições quando alguém pesquisa por liberação miofascial, drenagem ou relaxante na sua região.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">2</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Landing Page Premium (A Experiência)</h4>
                      <p className="text-muted-foreground">Uma página própria para mostrar as suas técnicas e a estrutura do seu espaço. Ancoramos a sua autoridade, justificando o seu valor antes mesmo do contato no WhatsApp.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">3</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">CRM: Do Alívio à Fidelização</h4>
                      <p className="text-muted-foreground">Implementamos um sistema para que a sua recepção (ou você) consiga acompanhar o paciente 3 dias após a sessão e ofereça, de forma natural, um pacote de recorrência.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12">
                <div className="aspect-[4/3] rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center p-6">
                   <div className="text-center">
                      <CalendarRange className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">A sua técnica traz o alívio.</h3>
                      <h3 className="text-2xl font-bold text-primary">Nós trazemos a agenda lotada.</h3>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sessão 4: CTA Final */}
        <section className="py-24 bg-primary text-primary-foreground text-center">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Pronta para parar de vender sessões avulsas?</h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Me chame no WhatsApp. Vou entender as suas técnicas e mostrar como estruturar a captação para lotar a sua maca com pacientes que valorizam o seu espaço.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-5 text-lg font-bold text-foreground transition-all hover:scale-105 hover:opacity-90 shadow-xl"
            >
              <Smartphone size={24} />
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
