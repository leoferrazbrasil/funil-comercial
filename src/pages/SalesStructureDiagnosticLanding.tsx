import { useEffect } from "react";
import { trackEvent } from "../lib/analytics";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Globe,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  Megaphone,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Store,
  Target,
  UsersRound,
  Workflow,
  Wrench,
} from "lucide-react";
import Logo from "../components/Logo";

const WHATSAPP_NUMBER = "5551996737359";
const WHATSAPP_MESSAGE =
  "Olá! Quero um diagnóstico gratuito da estrutura de vendas do meu negócio.";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const layers = [
  {
    title: "Presença",
    question: "Quem procura por você consegue te encontrar e confiar?",
    icon: Globe,
    items: [
      "site ou página atual",
      "clareza da oferta",
      "botão de WhatsApp",
      "Google Meu Negócio",
      "primeira impressão digital",
    ],
  },
  {
    title: "Aquisição",
    question: "Seu negócio tem uma forma previsível de atrair oportunidades?",
    icon: Megaphone,
    items: [
      "canais de entrada",
      "tráfego pago",
      "origem dos contatos",
      "campanhas atuais",
      "dependência de indicação",
    ],
  },
  {
    title: "Conversão",
    question: "O que acontece depois que o cliente chama?",
    icon: LayoutDashboard,
    items: [
      "WhatsApp",
      "tempo de resposta",
      "organização dos contatos",
      "CRM",
      "funil de vendas",
      "follow-up",
    ],
  },
  {
    title: "Escala",
    question: "Sua operação depende 100% de você?",
    icon: Bot,
    items: [
      "automações",
      "pré-atendimento",
      "IA",
      "triagem",
      "rotina comercial",
    ],
  },
];

const diagnosticDeliverables = [
  "qual camada está mais fraca hoje",
  "o que corrigir primeiro",
  "quais ações podem esperar",
  "quais oportunidades estão sendo perdidas",
  "qual serviço faz sentido para o momento do negócio",
  "se o ideal é começar por site, Google, tráfego, CRM, WhatsApp organizado ou automação",
];

const audiences = [
  "clínicas e consultórios",
  "dentistas",
  "nutricionistas",
  "advogados",
  "contadores",
  "estética e beleza",
  "prestadores de serviço",
  "comércio local",
  "autônomos",
  "negócios que já anunciam mas não sabem se está funcionando",
  "negócios que recebem contatos mas não acompanham bem",
];

const warningSigns = [
  "Você depende quase só de indicação.",
  "Seu Instagram recebe visitas, mas poucos chamam.",
  "Seu site existe, mas não gera conversa.",
  "Você já impulsionou post e não viu retorno.",
  "Os clientes chamam no WhatsApp, mas somem.",
  "Você não sabe quantos orçamentos estão em aberto.",
  "Você perde contatos porque esquece de responder.",
  "Você não sabe se precisa de site, anúncio, CRM ou automação.",
];

const services = [
  { title: "Site / Landing Page", icon: Globe },
  { title: "Google Meu Negócio", icon: MapPin },
  { title: "Tráfego Pago com CRM e WhatsApp organizado", icon: Megaphone },
  { title: "CRM Funil Comercial", icon: LayoutDashboard },
  { title: "Pré-atendimento com IA", icon: Bot },
  { title: "Estrutura completa", icon: Workflow },
];

const faq = [
  {
    question: "O diagnóstico é gratuito mesmo?",
    answer:
      "Sim. A análise inicial é gratuita e serve para mostrar onde sua estrutura de vendas pode estar travando.",
  },
  {
    question: "Preciso contratar depois?",
    answer:
      "Não. Você recebe o diagnóstico e decide se quer avançar com alguma solução da Funil Comercial.",
  },
  {
    question: "Preciso já ter site?",
    answer:
      "Não. Se você não tem site, analisamos sua presença atual: Instagram, Google, WhatsApp e forma como os clientes chegam hoje.",
  },
  {
    question: "Serve para qualquer cidade?",
    answer:
      "Sim. A análise é feita de forma digital e pode atender negócios locais de todo o Brasil.",
  },
  {
    question: "Vocês vão analisar anúncios também?",
    answer:
      "Se você já anuncia, sim. O diagnóstico pode avaliar se o problema está na campanha, no destino, no atendimento ou no acompanhamento dos leads.",
  },
  {
    question: "Quanto tempo demora?",
    answer:
      "A primeira conversa é rápida pelo WhatsApp. Depois avaliamos o seu caso e te mostramos o próximo passo.",
  },
];

function updateMetaDescription(content: string) {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.appendChild(meta);
  }

  meta.content = content;
}

function DiagnosticMap() {
  return (
    <div className="relative mx-auto max-w-xl border border-white/10 bg-card/70 p-5 shadow-2xl backdrop-blur">
      <div className="absolute inset-x-8 top-1/2 hidden h-px bg-primary/30 md:block" />
      <div className="absolute inset-y-8 left-1/2 hidden w-px bg-primary/30 md:block" />
      <div className="relative grid gap-3 sm:grid-cols-2">
        {layers.map((layer, index) => {
          const Icon = layer.icon;
          return (
            <div
              key={layer.title}
              className="border border-white/10 bg-background/95 p-5"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="text-xs font-black text-primary">
                  0{index + 1}
                </span>
                <Icon className="text-primary" size={22} />
              </div>
              <h3 className="text-xl font-black">{layer.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {layer.question}
              </p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 border border-primary/30 bg-primary/10 p-4 text-sm font-bold text-primary">
        O diagnóstico encontra a camada que mais limita o próximo resultado.
      </div>
    </div>
  );
}

export default function SalesStructureDiagnosticLanding() {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content;
    const description =
      "Descubra se o seu negócio local está travando na Presença, Aquisição, Conversão ou Escala. Peça um diagnóstico gratuito da sua estrutura de vendas.";

    document.title = "Diagnóstico Gratuito de Estrutura de Vendas | Funil Comercial";
    updateMetaDescription(description);

    return () => {
      document.title = previousTitle;
      if (previousDescription) updateMetaDescription(previousDescription);
    };
  }, []);

  return (
    <div data-theme="dark" className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
          <Link to="/" aria-label="Funil Comercial">
            <Logo iconSize={32} theme="monochrome-white" />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-muted-foreground lg:flex">
            <a href="#camadas" className="hover:text-foreground">
              Camadas
            </a>
            <a href="#entrega" className="hover:text-foreground">
              Entrega
            </a>
            <a href="#como-funciona" className="hover:text-foreground">
              Como funciona
            </a>
            <a href="#faq" className="hover:text-foreground">
              FAQ
            </a>
          </nav>
          <a
            href={whatsappLink} onClick={(e) => { trackEvent("generate_lead", { method: "whatsapp" }); }}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-black text-primary-foreground transition hover:bg-primary/90"
          >
            <MessageCircle size={17} />
            WhatsApp
          </a>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_18%,rgba(245,158,11,.22),transparent_32rem),linear-gradient(180deg,rgba(5,5,5,.7),rgba(5,5,5,.98))]" />
          <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-5 py-20 md:px-8 lg:grid-cols-[1fr_.86fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                Gratuito · Direto no WhatsApp · Sem compromisso
              </div>
              <h1 className="max-w-4xl text-4xl font-black leading-[1.05] sm:text-5xl md:text-7xl">
                Descubra qual parte da sua estrutura de vendas está travando seus resultados
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg md:text-xl">
                Em um diagnóstico gratuito, analisamos sua Presença, Aquisição,
                Conversão e Escala para mostrar o que precisa ser ajustado primeiro
                no seu negócio.
              </p>
              <p className="mt-5 max-w-2xl border-l-4 border-primary pl-5 text-lg font-bold leading-8">
                Você não precisa contratar tudo. Precisa descobrir o próximo passo certo.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappLink} onClick={(e) => { trackEvent("generate_lead", { method: "whatsapp" }); }}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-black text-primary-foreground transition hover:bg-primary/90"
                >
                  Quero meu diagnóstico gratuito
                  <ArrowRight size={19} />
                </a>
                <a
                  href="#como-funciona"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 text-base font-bold text-foreground transition hover:bg-white/10"
                >
                  Ver como funciona
                </a>
              </div>
            </div>
            <DiagnosticMap />
          </div>
        </section>

        <section className="border-b border-white/10 bg-card/20 py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[.9fr_1.1fr] md:px-8">
            <div>
              <p className="mb-3 text-sm font-bold text-primary">O problema</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Nem sempre o problema é falta de cliente
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Muitos negócios locais acham que precisam de mais leads, mas o gargalo
                pode estar em outro ponto da estrutura.
              </p>
              <p className="mt-6 border border-primary/30 bg-primary/10 p-5 font-bold text-primary">
                Sem diagnóstico, o negócio corre o risco de investir na camada errada.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "o cliente não encontra o negócio no Google",
                "o site não passa confiança",
                "os anúncios levam pessoas para uma estrutura fraca",
                "o WhatsApp recebe mensagens, mas ninguém acompanha direito",
                "os contatos ficam espalhados",
                "orçamentos não recebem follow-up",
                "não existe funil claro de vendas",
              ].map((item) => (
                <div key={item} className="border border-white/10 bg-background p-5">
                  <Search className="mb-4 text-primary" size={22} />
                  <p className="font-semibold leading-7">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="camadas" className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-12 max-w-3xl">
              <p className="mb-3 text-sm font-bold text-primary">As 4 camadas analisadas</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                O diagnóstico olha o caminho inteiro, não uma peça solta
              </h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-4">
              {layers.map((layer, index) => {
                const Icon = layer.icon;
                return (
                  <article key={layer.title} className="border border-white/10 bg-card p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <span className="text-sm font-black text-primary">
                        0{index + 1}
                      </span>
                      <Icon className="text-primary" size={28} />
                    </div>
                    <h3 className="text-2xl font-black">{layer.title}</h3>
                    <p className="mt-4 min-h-20 text-sm font-semibold leading-7 text-muted-foreground">
                      {layer.question}
                    </p>
                    <div className="mt-6 space-y-3">
                      {layer.items.map((item) => (
                        <p key={item} className="flex gap-3 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={16} />
                          <span>{item}</span>
                        </p>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="entrega" className="border-y border-white/10 bg-card/30 py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[.86fr_1.14fr] md:px-8">
            <div>
              <p className="mb-3 text-sm font-bold text-primary">O que você recebe</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                O que o diagnóstico entrega
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Uma análise prática, direta e comercial para entender o que corrigir
                primeiro. Não é um relatório longo nem uma consultoria complexa.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {diagnosticDeliverables.map((item) => (
                <div key={item} className="border border-white/10 bg-background p-5">
                  <ClipboardCheck className="mb-4 text-primary" size={22} />
                  <p className="font-semibold leading-7">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 max-w-4xl">
              <p className="mb-3 text-sm font-bold text-primary">Para quem é</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Esse diagnóstico é para quem vende pelo relacionamento, indicação, Google ou WhatsApp
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {audiences.map((item) => (
                <div key={item} className="flex items-center gap-3 border border-white/10 bg-card p-4">
                  <UsersRound className="shrink-0 text-primary" size={20} />
                  <span className="font-bold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-card/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 text-sm font-bold text-primary">Sinais de gargalo</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Sinais de que você precisa desse diagnóstico
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {warningSigns.map((item) => (
                <div key={item} className="flex gap-4 border border-white/10 bg-background p-5">
                  <HelpCircle className="mt-1 shrink-0 text-primary" size={22} />
                  <p className="text-lg font-bold leading-8">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-12 max-w-3xl">
              <p className="mb-3 text-sm font-bold text-primary">Como funciona</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Diagnóstico simples, sem reunião interminável
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Você chama no WhatsApp",
                  text: "Você envia o link do seu site, Instagram, Google ou explica como chegam os clientes hoje.",
                },
                {
                  step: "02",
                  title: "Analisamos as 4 camadas",
                  text: "Olhamos Presença, Aquisição, Conversão e Escala para encontrar o gargalo principal.",
                },
                {
                  step: "03",
                  title: "Você recebe o próximo passo",
                  text: "Mostramos o que corrigir primeiro e qual estrutura faz sentido para o seu momento.",
                },
              ].map((item) => (
                <article key={item.step} className="border border-white/10 bg-card p-6">
                  <span className="text-sm font-black text-primary">{item.step}</span>
                  <h3 className="mt-5 text-2xl font-black">{item.title}</h3>
                  <p className="mt-4 leading-7 text-muted-foreground">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-card/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 max-w-4xl">
              <p className="mb-3 text-sm font-bold text-primary">Depois do diagnóstico</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Depois do diagnóstico, você escolhe por onde começar
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                O diagnóstico não serve para empurrar um pacote fechado. Ele serve
                para identificar a camada certa para começar.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <div key={service.title} className="border border-white/10 bg-background p-5">
                    <Icon className="mb-5 text-primary" size={24} />
                    <h3 className="text-lg font-black">{service.title}</h3>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="faq" className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 text-sm font-bold text-primary">Objeções</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Perguntas antes de pedir o diagnóstico
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {faq.map((item) => (
                <article key={item.question} className="border border-white/10 bg-card p-6">
                  <h3 className="text-lg font-black">{item.question}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-card/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="grid gap-8 border border-primary/30 bg-primary/10 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10">
              <div>
                <div className="mb-5 flex items-center gap-2 text-primary">
                  <Clock3 size={22} />
                  <span className="font-bold">Próximo passo certo</span>
                </div>
                <h2 className="text-3xl font-black leading-tight md:text-5xl">
                  Antes de investir em mais marketing, descubra onde está o gargalo
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                  Peça seu diagnóstico gratuito e veja se o problema do seu negócio
                  está na Presença, Aquisição, Conversão ou Escala.
                </p>
              </div>
              <a
                href={whatsappLink} onClick={(e) => { trackEvent("generate_lead", { method: "whatsapp" }); }}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-black text-primary-foreground transition hover:bg-primary/90"
              >
                Pedir diagnóstico gratuito no WhatsApp
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <Logo iconSize={28} theme="monochrome-white" />
          <p>Diagnóstico gratuito · Presença, Aquisição, Conversão e Escala</p>
        </div>
      </footer>
    </div>
  );
}
