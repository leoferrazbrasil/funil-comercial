import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FileText,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  ListChecks,
  MessageCircle,
  Search,
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
  "Olá! Quero testar o CRM com WhatsApp conectado por 7 dias. Vi que o setup é R$597 e a mensalidade é R$97. Pode me explicar como funciona?";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const problems = [
  "atendem tudo direto no WhatsApp pessoal ou Business",
  "não sabem quem já recebeu orçamento",
  "esquecem follow-up",
  "não registram valor da oportunidade",
  "misturam cliente, curioso, fornecedor e lead na mesma caixa",
  "não sabem quantas negociações estão abertas",
  "não têm histórico comercial organizado",
  "dependem da memória para vender",
];

const solutionItems = [
  "contatos ficam cadastrados",
  "conversas do WhatsApp ficam centralizadas",
  "leads podem ser qualificados",
  "oportunidades entram no funil",
  "propostas e negociações são acompanhadas",
  "ganhos e perdas ficam visíveis",
  "o dono sabe o que precisa de atenção",
];

const crmItems = [
  {
    title: "Inbox de WhatsApp",
    text: "converse e acompanhe mensagens conectadas ao CRM.",
    icon: Inbox,
  },
  {
    title: "Contatos",
    text: "organize nome, telefone, origem e potencial de cada pessoa.",
    icon: UsersRound,
  },
  {
    title: "Leads",
    text: "qualifique quem demonstrou interesse antes de virar oportunidade.",
    icon: Target,
  },
  {
    title: "Funil de vendas",
    text: "acompanhe etapas como novo, em atendimento, proposta, negociação, ganho e perdido.",
    icon: LayoutDashboard,
  },
  {
    title: "Oportunidades",
    text: "registre produto, valor, mensalidade e próxima ação.",
    icon: CircleDollarSign,
  },
  {
    title: "Follow-up",
    text: "veja quem precisa de resposta e quem não pode ficar esquecido.",
    icon: Clock3,
  },
  {
    title: "Indicadores",
    text: "acompanhe pipeline aberto, oportunidades ganhas, perdas e evolução comercial.",
    icon: TrendingUp,
  },
];

const priceItems = [
  {
    label: "Teste grátis",
    value: "7 dias",
    detail: "para conhecer o CRM na rotina",
  },
  {
    label: "Setup",
    value: "R$597",
    detail: "pagamento único",
  },
  {
    label: "Mensalidade",
    value: "R$97/mês",
    detail: "CRM ativo com WhatsApp conectado",
  },
  {
    label: "WhatsApp conectado",
    value: "incluso",
    detail: "sem custo extra na mensalidade",
  },
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
  "negócios que recebem orçamento pelo WhatsApp",
  "negócios que fazem follow-up manual",
  "negócios que já anunciam e precisam acompanhar os leads",
];

const beforeItems = [
  "conversas soltas",
  "contatos sem origem",
  "orçamento esquecido",
  "follow-up manual",
  "nenhuma visão de pipeline",
  "venda depende da memória",
];

const afterItems = [
  "contatos organizados",
  "WhatsApp conectado",
  "leads qualificados",
  "oportunidades no funil",
  "próxima ação visível",
  "histórico comercial em um só lugar",
];

const layers = [
  {
    title: "Presença",
    text: "faz o cliente encontrar.",
    icon: Store,
  },
  {
    title: "Aquisição",
    text: "faz o cliente chegar.",
    icon: Send,
  },
  {
    title: "Conversão",
    text: "faz o cliente não se perder.",
    icon: LayoutDashboard,
  },
  {
    title: "Escala",
    text: "ajuda a operação crescer com automação e IA.",
    icon: TrendingUp,
  },
];

const useCases = [
  "cadastrar contatos vindos do WhatsApp",
  "transformar contato em lead",
  "criar oportunidade a partir de uma conversa",
  "registrar valor de proposta",
  "mover negociação no funil",
  "saber quem não recebeu retorno",
  "acompanhar ganhos e perdas",
  "organizar leads de tráfego pago",
  "separar contatos frios, mornos e quentes",
];

const faq = [
  {
    question: "O CRM é difícil de usar?",
    answer:
      "Não. Ele foi pensado para negócios locais que precisam de clareza, não de burocracia. A ideia é organizar a rotina comercial sem complicar o atendimento.",
  },
  {
    question: "O WhatsApp está incluso?",
    answer: "Sim. O WhatsApp conectado está incluso na mensalidade do CRM.",
  },
  {
    question: "Tem teste grátis?",
    answer: "Sim. Você pode testar grátis por 7 dias.",
  },
  {
    question: "Quanto custa depois do teste?",
    answer: "O setup é R$597, pagamento único, e a mensalidade é R$97/mês.",
  },
  {
    question: "Posso usar mesmo sem fazer tráfego pago?",
    answer:
      "Sim. O CRM pode organizar contatos vindos de indicação, Instagram, Google, site, WhatsApp ou prospecção ativa.",
  },
  {
    question: "O CRM vende sozinho?",
    answer:
      "Não. O CRM não substitui atendimento e venda. Ele organiza contatos, conversas e oportunidades para você acompanhar melhor cada negociação.",
  },
  {
    question: "Serve para equipe?",
    answer:
      "O CRM foi pensado primeiro para operações enxutas. Se você tem equipe, fale conosco para avaliarmos o melhor formato de uso.",
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

function ConversionFlowMockup() {
  const flow = [
    { title: "Conversa", text: "mensagem recebida", icon: MessageCircle },
    { title: "Contato", text: "nome, telefone e origem", icon: UsersRound },
    { title: "Lead", text: "interesse qualificado", icon: Target },
    { title: "Oportunidade", text: "valor e próxima ação", icon: CircleDollarSign },
    { title: "Venda", text: "ganho, perdido ou em negociação", icon: TrendingUp },
  ];

  return (
    <div className="relative mx-auto max-w-xl border border-white/10 bg-card/75 p-5 shadow-2xl backdrop-blur">
      <div className="mb-4 flex items-center justify-between border border-primary/25 bg-primary/10 px-4 py-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-primary">
            Camada Conversão
          </p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            WhatsApp conectado ao funil
          </p>
        </div>
        <ShieldCheck className="text-primary" size={26} />
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_.8fr]">
        <div className="space-y-3">
          {flow.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative">
                <div className="grid grid-cols-[3rem_1fr] gap-3 border border-white/10 bg-background p-3">
                  <div className="flex h-12 w-12 items-center justify-center bg-primary text-primary-foreground">
                    <Icon size={22} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base font-black">{step.title}</h3>
                      <span className="text-xs font-black text-primary">
                        0{index + 1}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      {step.text}
                    </p>
                  </div>
                </div>
                {index < flow.length - 1 ? (
                  <div className="ml-6 h-3 w-px bg-primary/50" aria-hidden="true" />
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="grid gap-3">
          {[
            { label: "Inbox", value: "3 novas", icon: Inbox },
            { label: "Contatos", value: "base limpa", icon: UsersRound },
            { label: "Leads", value: "qualificar", icon: Search },
            { label: "Funil", value: "próxima ação", icon: LayoutDashboard },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="border border-white/10 bg-background p-4">
                <Icon className="mb-3 text-primary" size={20} />
                <p className="text-sm font-black">{card.label}</p>
                <p className="mt-1 text-xs font-bold text-muted-foreground">{card.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 border border-primary/30 bg-primary/10 p-4">
        <p className="text-sm font-black text-primary">
          O WhatsApp continua sendo o canal. O CRM vira a memória comercial.
        </p>
      </div>
    </div>
  );
}

export default function CrmWhatsappLanding() {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content;
    const description =
      "Organize contatos, leads, conversas e oportunidades com o CRM Funil Comercial. WhatsApp conectado incluso, teste grátis de 7 dias, setup R$597 e mensalidade R$97.";

    document.title = "CRM com WhatsApp para Negócios Locais | Funil Comercial";
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
            <a href="#organiza" className="hover:text-foreground">
              CRM
            </a>
            <a href="#preco" className="hover:text-foreground">
              Preço
            </a>
            <a href="#como-funciona" className="hover:text-foreground">
              Como funciona
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
            Teste grátis
          </a>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_74%_16%,rgba(245,158,11,.23),transparent_32rem),linear-gradient(180deg,rgba(5,5,5,.68),rgba(5,5,5,.98))]" />
          <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-5 py-20 md:px-8 lg:grid-cols-[1fr_.88fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                Setup R$597 · R$97/mês · WhatsApp conectado incluso
              </div>
              <h1 className="max-w-4xl text-4xl font-black leading-[1.05] sm:text-5xl md:text-7xl">
                Organize seu WhatsApp e pare de perder oportunidades no meio das conversas
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg md:text-xl">
                Com o CRM Funil Comercial, seus contatos, leads, conversas e
                oportunidades ficam em um funil simples de acompanhar. WhatsApp
                conectado, teste grátis de 7 dias e mensalidade de R$97.
              </p>
              <p className="mt-5 max-w-2xl border-l-4 border-primary pl-5 text-lg font-bold leading-8">
                Cada conversa pode virar uma oportunidade. O problema é quando ela se perde.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-black text-primary-foreground transition hover:bg-primary/90"
                >
                  Testar grátis por 7 dias
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
            <ConversionFlowMockup />
          </div>
        </section>

        <section className="border-b border-white/10 bg-card/20 py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[.9fr_1.1fr] md:px-8">
            <div>
              <p className="mb-3 text-sm font-bold text-primary">O problema</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                WhatsApp cheio não significa venda organizada
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Muitos negócios locais perdem vendas porque a conversa acontece, mas
                o acompanhamento fica solto, sem histórico, sem etapa e sem próxima ação.
              </p>
              <p className="mt-6 border border-primary/30 bg-primary/10 p-5 font-bold text-primary">
                Sem CRM, o WhatsApp parece atendimento. Mas muitas vezes vira uma gaveta de oportunidades perdidas.
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
                Transforme conversas em oportunidades acompanhadas
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                O CRM Funil Comercial organiza a rotina comercial sem tirar o
                WhatsApp do centro do atendimento. O WhatsApp continua sendo o canal
                de conversa. O CRM vira a memória comercial do negócio.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-7">
              {solutionItems.map((item) => (
                <div key={item} className="border border-white/10 bg-card p-4">
                  <CheckCircle2 className="mb-4 text-primary" size={20} />
                  <p className="text-sm font-bold leading-6">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="organiza" className="border-y border-white/10 bg-card/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div className="max-w-3xl">
                <p className="mb-3 text-sm font-bold text-primary">O que o CRM organiza</p>
                <h2 className="text-3xl font-black leading-tight md:text-5xl">
                  O que deixa de ficar espalhado no WhatsApp
                </h2>
                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                  A ideia não é trocar o relacionamento por burocracia. É dar lugar
                  para cada conversa, cada lead e cada oportunidade dentro da rotina comercial.
                </p>
              </div>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-bold text-primary-foreground"
              >
                Testar CRM grátis
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {crmItems.map((item) => {
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
                Preço simples para organizar sua operação comercial
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                O setup cobre a configuração inicial da sua estrutura. A mensalidade
                mantém o CRM ativo para organizar contatos, leads, conversas e
                oportunidades com WhatsApp conectado.
              </p>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-black text-primary-foreground transition hover:bg-primary/90"
              >
                Começar teste grátis
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

        <section className="border-y border-white/10 bg-card/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 text-sm font-bold text-primary">Para quem é</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Para quem vende ou atende pelo WhatsApp
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {audiences.map((item) => (
                <div key={item} className="flex items-center gap-3 border border-white/10 bg-background p-4">
                  <Store className="shrink-0 text-primary" size={20} />
                  <span className="font-bold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 text-sm font-bold text-primary">Antes e depois</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Do WhatsApp bagunçado para um funil claro
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="border border-red-400/20 bg-red-950/20 p-6 md:p-8">
                <h3 className="text-2xl font-black">Antes</h3>
                <ul className="mt-6 space-y-4 text-muted-foreground">
                  {beforeItems.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-emerald-400/20 bg-emerald-950/20 p-6 md:p-8">
                <h3 className="text-2xl font-black">Depois</h3>
                <ul className="mt-6 space-y-4 text-muted-foreground">
                  {afterItems.map((item) => (
                    <li key={item} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={20} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="border-y border-white/10 bg-card/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-12 max-w-3xl">
              <p className="mb-3 text-sm font-bold text-primary">Como funciona</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Simples para começar, útil todos os dias
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-5">
              {[
                {
                  step: "01",
                  title: "Você inicia o teste grátis",
                  text: "Comece com 7 dias para conhecer o CRM e entender como ele se encaixa na sua rotina.",
                },
                {
                  step: "02",
                  title: "Conectamos o WhatsApp",
                  text: "O WhatsApp fica conectado ao CRM para centralizar conversas e histórico.",
                },
                {
                  step: "03",
                  title: "Organizamos contatos e leads",
                  text: "Cada pessoa pode ser cadastrada, qualificada e acompanhada.",
                },
                {
                  step: "04",
                  title: "Você acompanha oportunidades",
                  text: "Veja quem está em atendimento, proposta, negociação, ganho ou perdido.",
                },
                {
                  step: "05",
                  title: "A rotina comercial fica clara",
                  text: "Você sabe quem responder, quem acompanhar e quais oportunidades estão abertas.",
                },
              ].map((item) => (
                <article key={item.step} className="border border-white/10 bg-background p-6">
                  <span className="text-sm font-black text-primary">{item.step}</span>
                  <h3 className="mt-5 text-xl font-black leading-7">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 max-w-4xl">
              <p className="mb-3 text-sm font-bold text-primary">As 4 camadas</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                CRM é a camada de Conversão da estrutura de vendas
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                O CRM Funil Comercial entra quando o problema não é só atrair mais
                contatos, mas organizar o que acontece depois que eles chamam.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {layers.map((layer, index) => {
                const Icon = layer.icon;
                return (
                  <article key={layer.title} className="border border-white/10 bg-card p-6">
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

        <section className="border-y border-white/10 bg-card/30 py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[.86fr_1.14fr] md:px-8">
            <div>
              <p className="mb-3 text-sm font-bold text-primary">Casos de uso</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                O que você consegue fazer na prática
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                O CRM não vende sozinho. Ele organiza a operação para você enxergar
                o que precisa de atenção e acompanhar melhor cada negociação.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {useCases.map((item) => (
                <div key={item} className="border border-white/10 bg-background p-5">
                  <ListChecks className="mb-4 text-primary" size={22} />
                  <p className="font-semibold leading-7">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 text-sm font-bold text-primary">FAQ</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Perguntas antes de testar o CRM
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
                  <ClipboardCheck size={22} />
                  <span className="font-bold">Conversão organizada</span>
                </div>
                <h2 className="text-3xl font-black leading-tight md:text-5xl">
                  Seu WhatsApp pode continuar sendo o canal. Só não precisa continuar bagunçado.
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                  Teste o CRM Funil Comercial por 7 dias e veja como organizar
                  contatos, leads, conversas e oportunidades em um funil simples de acompanhar.
                </p>
              </div>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-black text-primary-foreground transition hover:bg-primary/90"
              >
                Testar CRM grátis por 7 dias
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <Logo iconSize={28} theme="monochrome-white" />
          <p>CRM com WhatsApp · Conversão · Contatos, leads e oportunidades</p>
        </div>
      </footer>
    </div>
  );
}
