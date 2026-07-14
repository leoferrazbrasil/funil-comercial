import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  HelpCircle,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  MousePointerClick,
  Send,
  ShieldCheck,
  Store,
  Target,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import Logo from "../components/Logo";

const WHATSAPP_NUMBER = "5551996737359";
const WHATSAPP_MESSAGE =
  "Olá! Tenho interesse em tráfego pago com CRM e WhatsApp conectado. Vi que o setup é R$497 e a gestão começa em R$997/mês. Pode me explicar como funciona?";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const problems = [
  "o lead chamou no WhatsApp e ninguém respondeu rápido",
  "os contatos ficaram perdidos nas conversas",
  "não havia funil de vendas",
  "ninguém sabia quem recebeu proposta",
  "não existia follow-up",
  "o dono não conseguia medir o que virou venda",
  "a campanha parecia ruim, mas o problema estava no atendimento e na conversão",
];

const solutionSteps = [
  { title: "Lead chama no WhatsApp", icon: MessageCircle },
  { title: "Conversa fica conectada ao CRM", icon: LayoutDashboard },
  { title: "Contato entra na base", icon: UsersRound },
  { title: "Oportunidade vai para o funil", icon: Target },
  { title: "Atendimento acompanha proposta e fechamento", icon: TrendingUp },
];

const includedItems = [
  {
    title: "Planejamento da campanha",
    text: "definição de público, oferta, canais e objetivo comercial.",
    icon: ClipboardCheck,
  },
  {
    title: "Google Ads e/ou Meta Ads",
    text: "campanhas voltadas para gerar conversas qualificadas e intenção de compra.",
    icon: Megaphone,
  },
  {
    title: "Estrutura de conversão",
    text: "orientação sobre destino, página, WhatsApp e chamada de ação.",
    icon: MousePointerClick,
  },
  {
    title: "CRM Funil Comercial incluso",
    text: "organização da base de contatos, leads e oportunidades.",
    icon: LayoutDashboard,
  },
  {
    title: "WhatsApp conectado",
    text: "atendimento centralizado para acompanhar conversas e histórico.",
    icon: MessageCircle,
  },
  {
    title: "Funil de vendas organizado",
    text: "etapas comerciais para visualizar contatos novos, propostas, negociações, ganhos e perdas.",
    icon: Target,
  },
  {
    title: "Acompanhamento comercial",
    text: "visão dos leads gerados, oportunidades em andamento e pontos de melhoria.",
    icon: TrendingUp,
  },
  {
    title: "Relatórios de campanha e funil",
    text: "não olhar só clique e mensagem, mas também avanço comercial.",
    icon: BarChart3,
  },
];

const priceItems = [
  {
    label: "Setup",
    value: "R$497",
    detail: "pagamento único",
  },
  {
    label: "Gestão mensal",
    value: "a partir de R$997/mês",
    detail: "campanhas e operação de aquisição",
  },
  {
    label: "Verba de anúncios recomendada",
    value: "a partir de R$1.000/mês",
    detail: "paga diretamente às plataformas",
  },
  {
    label: "CRM + WhatsApp conectado",
    value: "inclusos",
    detail: "sem custo extra na gestão",
  },
];

const commonTraffic = [
  "foco em clique e lead",
  "contatos caem soltos no WhatsApp",
  "pouca visão do que virou venda",
  "follow-up depende da memória",
  "campanha e comercial separados",
];

const structuredTraffic = [
  "foco em oportunidade acompanhada",
  "WhatsApp conectado ao CRM",
  "base de contatos organizada",
  "funil de vendas visual",
  "campanha e atendimento no mesmo processo",
];

const audiences = [
  "clínicas e consultórios",
  "dentistas",
  "nutricionistas",
  "estética e beleza",
  "advogados e contadores",
  "prestadores de serviço",
  "academias e estúdios",
  "comércio local",
  "negócios que já recebem WhatsApp, mas não acompanham bem",
  "negócios que já anunciaram e não sabem o que virou venda",
];

const prerequisites = [
  "oferta clara",
  "WhatsApp ativo",
  "rotina mínima de atendimento",
  "disponibilidade para responder leads",
  "página, perfil do Google ou destino adequado",
  "verba de mídia compatível",
  "acompanhamento do funil",
];

const layers = [
  {
    title: "Presença",
    text: "onde o cliente te encontra e confia",
    icon: Store,
  },
  {
    title: "Aquisição",
    text: "anúncios que geram oportunidades",
    icon: Megaphone,
  },
  {
    title: "Conversão",
    text: "CRM e WhatsApp para acompanhar cada contato",
    icon: LayoutDashboard,
  },
  {
    title: "Escala",
    text: "automações e IA para evoluir a operação",
    icon: TrendingUp,
  },
];

const faq = [
  {
    question: "Vocês garantem vendas?",
    answer:
      "Não. Nenhuma gestão séria pode garantir vendas. O que fazemos é montar campanhas e estrutura comercial para aumentar as chances de transformar contatos em oportunidades acompanhadas.",
  },
  {
    question: "O que está incluso no valor mensal?",
    answer:
      "A gestão das campanhas, acompanhamento da estrutura de aquisição e uso do CRM com WhatsApp conectado, sem custo extra.",
  },
  {
    question: "A verba de anúncios está inclusa?",
    answer:
      "Não. A verba é paga separadamente às plataformas de anúncios. Recomendamos começar com pelo menos R$1.000/mês de mídia.",
  },
  {
    question: "Preciso ter site?",
    answer:
      "Não obrigatoriamente, mas ajuda. Dependendo do caso, a campanha pode levar para WhatsApp, página específica, site ou Perfil da Empresa no Google.",
  },
  {
    question: "O CRM está incluso mesmo?",
    answer:
      "Sim. Na contratação da gestão de tráfego, o CRM Funil Comercial e o WhatsApp conectado entram sem custo extra para organizar contatos, conversas e oportunidades.",
  },
  {
    question: "Posso contratar só o tráfego sem CRM?",
    answer:
      "O diferencial da Funil Comercial é unir tráfego e estrutura de conversão, porque gerar lead sem acompanhamento aumenta o risco de desperdício.",
  },
  {
    question: "Em quanto tempo aparecem resultados?",
    answer:
      "Depende do mercado, verba, oferta, concorrência e velocidade de atendimento. O trabalho começa com configuração, testes e otimização contínua.",
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

function AcquisitionFlowMockup() {
  return (
    <div className="relative mx-auto max-w-xl border border-white/10 bg-card/75 p-5 shadow-2xl backdrop-blur">
      <div className="mb-4 flex items-center justify-between border border-primary/25 bg-primary/10 px-4 py-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-primary">
            Fluxo comercial
          </p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            campanha conectada ao atendimento
          </p>
        </div>
        <ShieldCheck className="text-primary" size={26} />
      </div>

      <div className="space-y-3">
        {[
          { title: "Anúncio", text: "Google ou Meta Ads", icon: Megaphone },
          { title: "WhatsApp", text: "conversa recebida", icon: MessageCircle },
          { title: "CRM", text: "contato identificado", icon: LayoutDashboard },
          { title: "Funil", text: "oportunidade acompanhada", icon: Target },
          { title: "Venda", text: "proposta, negociação e fechamento", icon: TrendingUp },
        ].map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="relative">
              <div className="grid grid-cols-[3rem_1fr] gap-3 border border-white/10 bg-background p-4">
                <div className="flex h-12 w-12 items-center justify-center bg-primary text-primary-foreground">
                  <Icon size={23} />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-black">{step.title}</h3>
                    <span className="text-xs font-black text-primary">
                      0{index + 1}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    {step.text}
                  </p>
                </div>
              </div>
              {index < 4 ? (
                <div className="ml-6 h-3 w-px bg-primary/50" aria-hidden="true" />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="border border-white/10 bg-background p-3">
          <p className="text-2xl font-black text-primary">CRM</p>
          <p className="mt-1 text-xs font-bold text-muted-foreground">incluso</p>
        </div>
        <div className="border border-white/10 bg-background p-3">
          <p className="text-2xl font-black text-primary">WA</p>
          <p className="mt-1 text-xs font-bold text-muted-foreground">conectado</p>
        </div>
        <div className="border border-white/10 bg-background p-3">
          <p className="text-2xl font-black text-primary">R$997+</p>
          <p className="mt-1 text-xs font-bold text-muted-foreground">gestão</p>
        </div>
      </div>
    </div>
  );
}

export default function PaidTrafficLocalBusinessLanding() {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content;
    const description =
      "Gestão de tráfego pago para negócios locais com CRM, WhatsApp conectado e funil de vendas organizado. Setup R$497, gestão a partir de R$997/mês e verba recomendada a partir de R$1.000.";

    document.title =
      "Tráfego Pago para Negócios Locais com CRM e WhatsApp | Funil Comercial";
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
            <a href="#incluso" className="hover:text-foreground">
              Incluso
            </a>
            <a href="#preco" className="hover:text-foreground">
              Preço
            </a>
            <a href="#comparacao" className="hover:text-foreground">
              Comparação
            </a>
            <a href="#faq" className="hover:text-foreground">
              FAQ
            </a>
          </nav>
          <a
            href={whatsappLink}
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
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_76%_16%,rgba(245,158,11,.23),transparent_32rem),linear-gradient(180deg,rgba(5,5,5,.68),rgba(5,5,5,.98))]" />
          <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-5 py-20 md:px-8 lg:grid-cols-[1fr_.88fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                Setup R$497 · Gestão a partir de R$997/mês · CRM e WhatsApp inclusos
              </div>
              <h1 className="max-w-4xl text-4xl font-black leading-[1.05] sm:text-5xl md:text-7xl">
                Tráfego pago para negócios locais sem perder leads no WhatsApp
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg md:text-xl">
                Criamos campanhas no Google e Meta Ads com CRM, WhatsApp conectado e
                funil de vendas organizado para cada contato virar uma oportunidade
                acompanhada.
              </p>
              <p className="mt-5 max-w-2xl border-l-4 border-primary pl-5 text-lg font-bold leading-8">
                Não é só gerar contato. É organizar o caminho até a venda.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-black text-primary-foreground transition hover:bg-primary/90"
                >
                  Quero tráfego com estrutura
                  <ArrowRight size={19} />
                </a>
                <a
                  href="#incluso"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 text-base font-bold text-foreground transition hover:bg-white/10"
                >
                  Ver o que está incluso
                </a>
              </div>
            </div>
            <AcquisitionFlowMockup />
          </div>
        </section>

        <section className="border-b border-white/10 bg-card/20 py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[.9fr_1.1fr] md:px-8">
            <div>
              <p className="mb-3 text-sm font-bold text-primary">O problema</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Gerar lead não resolve se o atendimento vira bagunça
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Muitos negócios já tentaram anúncio e se frustraram porque a
                campanha trouxe conversas, mas a operação comercial não estava pronta
                para acompanhar cada oportunidade.
              </p>
              <p className="mt-6 border border-primary/30 bg-primary/10 p-5 font-bold text-primary">
                Tráfego pago sem estrutura comercial vira apenas mais mensagens para administrar.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {problems.map((item) => (
                <div key={item} className="border border-white/10 bg-background p-5">
                  <AlertTriangle className="mb-4 text-primary" size={22} />
                  <p className="font-semibold leading-7">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-bold text-primary">A solução</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Campanha, WhatsApp e funil trabalhando juntos
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                A Funil Comercial cria campanhas para atrair oportunidades e já
                organiza a etapa seguinte. O anúncio abre a porta. O CRM ajuda a não
                deixar a oportunidade escapar.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-5">
              {solutionSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className="border border-white/10 bg-card p-5">
                    <Icon className="mb-5 text-primary" size={24} />
                    <h3 className="text-base font-black leading-7">{step.title}</h3>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="incluso" className="border-y border-white/10 bg-card/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div className="max-w-3xl">
                <p className="mb-3 text-sm font-bold text-primary">O que está incluso</p>
                <h2 className="text-3xl font-black leading-tight md:text-5xl">
                  O que está incluso na gestão
                </h2>
                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                  Não é simples gestão de anúncios. A entrega junta aquisição,
                  atendimento, CRM e acompanhamento comercial no mesmo processo.
                </p>
              </div>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-bold text-primary-foreground"
              >
                Tirar dúvida no WhatsApp
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {includedItems.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="border border-white/10 bg-background p-5">
                    <Icon className="mb-5 text-primary" size={24} />
                    <h3 className="text-lg font-black leading-7">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="preco" className="py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-[.9fr_1.1fr] md:px-8">
            <div>
              <p className="mb-3 text-sm font-bold text-primary">Investimento</p>
              <h2 className="max-w-3xl text-3xl font-black leading-tight md:text-5xl">
                Investimento transparente para começar com estrutura
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                O setup cobre a configuração inicial da estrutura. A gestão mensal
                cobre o acompanhamento das campanhas e da operação de aquisição. A
                verba de anúncios é paga diretamente às plataformas, como Google ou
                Meta.
              </p>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-black text-primary-foreground transition hover:bg-primary/90"
              >
                Quero começar com tráfego pago
                <ArrowRight size={19} />
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {priceItems.map((item) => (
                <article key={item.label} className="border border-primary/25 bg-primary/10 p-6">
                  <CircleDollarSign className="mb-5 text-primary" size={26} />
                  <p className="text-sm font-bold text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-3xl font-black text-primary">{item.value}</p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">
                    {item.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="comparacao" className="border-y border-white/10 bg-card/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 text-sm font-bold text-primary">Comparação</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Tráfego comum vs. Tráfego com estrutura
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="border border-white/10 bg-background p-6 md:p-8">
                <h3 className="text-2xl font-black">Tráfego comum</h3>
                <ul className="mt-6 space-y-4 text-muted-foreground">
                  {commonTraffic.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-primary/30 bg-primary/10 p-6 md:p-8">
                <h3 className="text-2xl font-black">Tráfego com Funil Comercial</h3>
                <ul className="mt-6 space-y-4 text-muted-foreground">
                  {structuredTraffic.map((item) => (
                    <li key={item} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={20} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 text-sm font-bold text-primary">Para quem é</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Para negócios que querem atrair clientes sem perder o controle
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {audiences.map((item) => (
                <div key={item} className="flex items-center gap-3 border border-white/10 bg-card p-4">
                  <Store className="shrink-0 text-primary" size={20} />
                  <span className="font-bold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-card/30 py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[.9fr_1.1fr] md:px-8">
            <div>
              <p className="mb-3 text-sm font-bold text-primary">Pré-requisitos</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Antes de anunciar, a estrutura precisa estar pronta
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Se alguma dessas partes estiver fraca, a Funil Comercial ajuda a
                organizar antes ou durante o início da campanha.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {prerequisites.map((item) => (
                <div key={item} className="border border-white/10 bg-background p-5">
                  <CheckCircle2 className="mb-4 text-primary" size={22} />
                  <p className="font-semibold leading-7">{item}</p>
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
                Como começamos
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-5">
              {[
                {
                  step: "01",
                  title: "Diagnóstico inicial",
                  text: "Entendemos seu negócio, oferta, público, região e canais atuais.",
                },
                {
                  step: "02",
                  title: "Configuração da estrutura",
                  text: "Organizamos CRM, WhatsApp conectado, base e etapas do funil.",
                },
                {
                  step: "03",
                  title: "Criação das campanhas",
                  text: "Configuramos campanhas no Google Ads e/ou Meta Ads de acordo com o objetivo.",
                },
                {
                  step: "04",
                  title: "Entrada dos leads",
                  text: "Os contatos chegam pelo WhatsApp e são acompanhados no funil.",
                },
                {
                  step: "05",
                  title: "Otimização contínua",
                  text: "Ajustamos campanhas e acompanhamos gargalos entre lead, atendimento e venda.",
                },
              ].map((item) => (
                <article key={item.step} className="border border-white/10 bg-card p-6">
                  <span className="text-sm font-black text-primary">{item.step}</span>
                  <h3 className="mt-5 text-xl font-black leading-7">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-card/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 max-w-4xl">
              <p className="mb-3 text-sm font-bold text-primary">As 4 camadas</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Tráfego pago é Aquisição. Mas venda depende de Conversão.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                A camada de Aquisição gera demanda. Mas, sem Conversão, o lead pode
                ser perdido. Por isso, a gestão de tráfego da Funil Comercial já
                inclui CRM, WhatsApp conectado e funil organizado.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {layers.map((layer, index) => {
                const Icon = layer.icon;
                return (
                  <article key={layer.title} className="border border-white/10 bg-background p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <span className="text-sm font-black text-primary">0{index + 1}</span>
                      <Icon className="text-primary" size={26} />
                    </div>
                    <h3 className="text-2xl font-black">{layer.title}</h3>
                    <p className="mt-4 text-sm font-semibold leading-7 text-muted-foreground">
                      {layer.text}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="faq" className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 text-sm font-bold text-primary">FAQ</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Perguntas antes de começar com tráfego pago
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {faq.map((item) => (
                <article key={item.question} className="border border-white/10 bg-card p-6">
                  <HelpCircle className="mb-4 text-primary" size={22} />
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
                  <span className="font-bold">Aquisição com conversão</span>
                </div>
                <h2 className="text-3xl font-black leading-tight md:text-5xl">
                  Pare de pagar por leads que se perdem no WhatsApp
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                  Contrate tráfego pago com CRM, WhatsApp conectado e funil de vendas
                  organizado para acompanhar cada oportunidade do primeiro contato ao
                  fechamento.
                </p>
              </div>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-black text-primary-foreground transition hover:bg-primary/90"
              >
                Chamar no WhatsApp e começar
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <Logo iconSize={28} theme="monochrome-white" />
          <p>Tráfego pago · CRM · WhatsApp conectado · Funil de vendas</p>
        </div>
      </footer>
    </div>
  );
}
