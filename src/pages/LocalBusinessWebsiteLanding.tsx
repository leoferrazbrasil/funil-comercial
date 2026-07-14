import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Globe,
  MapPin,
  MessageCircle,
  Scale,
  Scissors,
  Search,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  Store,
  UserRound,
  Wrench,
} from "lucide-react";
import Logo from "../components/Logo";

const WHATSAPP_NUMBER = "5551996737359";
const WHATSAPP_MESSAGE =
  "Olá! Tenho interesse no site profissional de R$497 + R$37,90/mês. Pode me explicar como funciona?";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const includedItems = [
  {
    title: "Página profissional responsiva",
    description: "Layout preparado para celular, tablet e computador.",
    icon: Smartphone,
  },
  {
    title: "Textos organizados para venda",
    description: "Apresentação clara do negócio, dos serviços e do próximo passo.",
    icon: CheckCircle2,
  },
  {
    title: "Botões de WhatsApp",
    description: "Chamadas visíveis para o cliente tirar dúvida, agendar ou pedir orçamento.",
    icon: MessageCircle,
  },
  {
    title: "Estrutura para serviços",
    description: "Seus principais serviços organizados em blocos fáceis de entender.",
    icon: Briefcase,
  },
  {
    title: "Seção de localização",
    description: "Endereço, região atendida e caminho para o cliente chegar até você.",
    icon: MapPin,
  },
  {
    title: "Integração com domínio próprio",
    description: "Publicação no endereço do seu negócio, quando você já tiver domínio.",
    icon: Globe,
  },
  {
    title: "Hospedagem e manutenção mensal",
    description: "Site no ar, com suporte básico e ajustes técnicos de rotina.",
    icon: Wrench,
  },
  {
    title: "Ajustes básicos após publicação",
    description: "Pequenas correções para deixar a página redonda depois de publicada.",
    icon: ShieldCheck,
  },
];

const audiences = [
  { label: "Clínicas e consultórios", icon: Stethoscope },
  { label: "Dentistas e nutricionistas", icon: UserRound },
  { label: "Advogados e contadores", icon: Scale },
  { label: "Beleza e estética", icon: Scissors },
  { label: "Prestadores de serviço", icon: Wrench },
  { label: "Comércio local", icon: Store },
  { label: "Autônomos", icon: Briefcase },
];

const faq = [
  {
    question: "O domínio está incluso?",
    answer:
      "O domínio não está incluso no valor. Se você ainda não tiver um, eu te oriento na compra e conecto o site ao domínio depois.",
  },
  {
    question: "Preciso ter fotos profissionais?",
    answer:
      "Não precisa. Fotos boas ajudam, mas a página pode começar com imagens simples, identidade visual, textos claros e dados reais do negócio.",
  },
  {
    question: "Em quanto tempo fica pronto?",
    answer:
      "Normalmente em poucos dias, dependendo da velocidade de envio das informações básicas do negócio.",
  },
  {
    question: "Posso pedir alterações?",
    answer:
      "Sim. A criação inclui ajustes básicos para corrigir texto, ordem das informações e detalhes importantes antes da publicação.",
  },
  {
    question: "O site funciona no celular?",
    answer:
      "Sim. A página é feita mobile-first, porque boa parte dos clientes pesquisa e chama pelo WhatsApp direto do celular.",
  },
  {
    question: "A mensalidade é obrigatória?",
    answer:
      "Sim, para manter a página hospedada, no ar e com suporte básico. O valor mensal é R$37,90.",
  },
  {
    question: "Posso usar meu próprio domínio?",
    answer:
      "Sim. Se você já tem domínio, a página pode ser conectada nele. Se ainda não tem, eu te ajudo a escolher o caminho mais simples.",
  },
  {
    question: "Vocês fazem sites para qualquer segmento?",
    answer:
      "O foco é negócio local e profissional liberal. Se o seu cliente chega por Google, Instagram, indicação ou WhatsApp, provavelmente faz sentido.",
  },
];

function updateMetaDescription(content: string) {
  const selector = 'meta[name="description"]';
  let meta = document.querySelector<HTMLMetaElement>(selector);
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.appendChild(meta);
  }

  meta.content = content;
}

function SitePreview() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute left-1/2 top-10 w-[760px] max-w-[calc(100vw-24px)] -translate-x-1/2 opacity-25 md:top-20 md:opacity-35 lg:left-auto lg:right-[-60px] lg:translate-x-0">
        <div className="border border-white/15 bg-card/70 p-3 shadow-2xl backdrop-blur">
          <div className="mb-3 flex items-center gap-2 border-b border-white/10 pb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-3 h-7 flex-1 rounded bg-black/30" />
          </div>
          <div className="grid gap-3 md:grid-cols-[1.1fr_.9fr]">
            <div className="space-y-3 bg-background p-4">
              <span className="block h-3 w-28 rounded bg-primary" />
              <span className="block h-10 w-full rounded bg-white/80" />
              <span className="block h-10 w-4/5 rounded bg-white/70" />
              <span className="block h-5 w-3/4 rounded bg-white/30" />
              <div className="flex gap-2 pt-2">
                <span className="h-10 w-36 rounded bg-primary" />
                <span className="h-10 w-28 rounded border border-white/20" />
              </div>
            </div>
            <div className="grid gap-3">
              <div className="bg-white/10 p-4">
                <span className="mb-3 block h-4 w-24 rounded bg-white/60" />
                <div className="space-y-2">
                  <span className="block h-3 rounded bg-white/20" />
                  <span className="block h-3 rounded bg-white/20" />
                  <span className="block h-3 w-2/3 rounded bg-white/20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <span className="h-24 bg-white/10" />
                <span className="h-24 bg-primary/60" />
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <span className="h-24 bg-white/10" />
            <span className="h-24 bg-white/10" />
            <span className="h-24 bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LocalBusinessWebsiteLanding() {
  useEffect(() => {
    const previousTitle = document.title;
    const description =
      "Criação de site profissional para negócios locais por R$497 + R$37,90/mês de hospedagem e manutenção. Página rápida, responsiva e com WhatsApp em destaque.";
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content;

    document.title = "Site para Negócios Locais por R$497 | Funil Comercial";
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
          <nav className="hidden items-center gap-7 text-sm font-semibold text-muted-foreground md:flex">
            <a href="#incluso" className="hover:text-foreground">
              Incluso
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
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            <MessageCircle size={17} />
            WhatsApp
          </a>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden border-b border-white/10">
          <SitePreview />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,5,5,.72),rgba(5,5,5,.96))]" />
          <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center px-5 py-20 md:px-8">
            <div className="relative z-10 max-w-3xl pt-10 md:pt-0">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                Pronto em poucos dias · Pagamento único · Manutenção mensal acessível
              </div>
              <h1 className="max-w-4xl text-4xl font-black leading-[1.05] sm:text-5xl md:text-7xl">
                Site profissional para o cliente te encontrar, confiar e chamar no WhatsApp
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg md:text-xl">
                Criamos uma página rápida, clara e pronta para apresentar seu negócio,
                seus serviços e seus canais de atendimento. Investimento único de R$497
                + R$37,90/mês de hospedagem e manutenção.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-black text-primary-foreground transition hover:bg-primary/90"
                >
                  Quero meu site profissional
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
          </div>
        </section>

        <section className="border-b border-white/10 bg-card/20 py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[.9fr_1.1fr] md:px-8">
            <div>
              <p className="mb-3 text-sm font-bold text-primary">O problema</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Seu cliente pesquisa antes de chamar
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Quando alguém recebe uma indicação ou encontra seu nome no Google,
                a próxima pergunta é simples: esse negócio passa confiança?
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Não têm site próprio",
                "Dependem só do Instagram",
                "Têm página antiga ou confusa",
                "Não passam confiança no primeiro contato",
                "Deixam o botão de WhatsApp escondido",
                "Não explicam bem serviços, localização e diferenciais",
              ].map((item) => (
                <div key={item} className="border border-white/10 bg-background p-5">
                  <Search className="mb-4 text-primary" size={22} />
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
                Uma página feita para transformar visita em conversa
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                O site organiza o que o cliente precisa saber para dar o próximo passo:
                entender quem você é, o que faz, onde atende e como chamar.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-7">
              {[
                "Apresentação do negócio",
                "Serviços principais",
                "Diferenciais",
                "Prova social",
                "Localização",
                "Botão de WhatsApp",
                "Agendamento ou orçamento",
              ].map((item) => (
                <div key={item} className="border border-white/10 bg-card p-4">
                  <CheckCircle2 className="mb-4 text-primary" size={20} />
                  <p className="text-sm font-bold leading-6">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="incluso" className="border-y border-white/10 bg-card/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div className="max-w-3xl">
                <p className="mb-3 text-sm font-bold text-primary">O que está incluso</p>
                <h2 className="text-3xl font-black leading-tight md:text-5xl">
                  O essencial para colocar sua presença no ar
                </h2>
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
                    <h3 className="text-lg font-black">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="preco" className="py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-[1fr_.82fr] md:px-8">
            <div>
              <p className="mb-3 text-sm font-bold text-primary">Investimento</p>
              <h2 className="max-w-3xl text-3xl font-black leading-tight md:text-5xl">
                Investimento simples para colocar sua presença no ar
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                O valor único cobre a criação e publicação da página. A mensalidade
                mantém o site no ar, hospedado, atualizado e com suporte básico.
              </p>
            </div>
            <div className="border border-primary/30 bg-primary/10 p-6 md:p-8">
              <div className="flex items-center gap-3 text-primary">
                <CircleDollarSign size={28} />
                <span className="font-bold">Oferta da camada Presença</span>
              </div>
              <div className="mt-8">
                <p className="text-sm font-bold text-muted-foreground">Pagamento único</p>
                <p className="mt-1 text-5xl font-black text-primary">R$497</p>
              </div>
              <div className="my-6 h-px bg-white/10" />
              <div>
                <p className="text-sm font-bold text-muted-foreground">
                  Hospedagem e manutenção
                </p>
                <p className="mt-1 text-3xl font-black">+ R$37,90/mês</p>
              </div>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-black text-primary-foreground transition hover:bg-primary/90"
              >
                Quero colocar meu site no ar
                <ArrowRight size={19} />
              </a>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-card/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 text-sm font-bold text-primary">Para quem é</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Para quem vende com atendimento, confiança e relacionamento
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {audiences.map((audience) => {
                const Icon = audience.icon;
                return (
                  <div key={audience.label} className="flex items-center gap-3 border border-white/10 bg-background p-4">
                    <Icon className="text-primary" size={21} />
                    <span className="font-bold">{audience.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-12 max-w-3xl">
              <p className="mb-3 text-sm font-bold text-primary">Como funciona</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Três passos, sem complicar sua rotina
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Conversa rápida no WhatsApp",
                  text: "Você explica o negócio, o público, os serviços e o que precisa aparecer no site.",
                },
                {
                  step: "02",
                  title: "Organização das informações",
                  text: "A Funil Comercial transforma dados soltos em uma estrutura clara de apresentação e venda.",
                },
                {
                  step: "03",
                  title: "Criação, ajustes e publicação",
                  text: "A página é montada, revisada com você e colocada no ar pronta para receber clientes.",
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
          <div className="mx-auto grid max-w-7xl gap-6 px-5 md:grid-cols-2 md:px-8">
            <div className="border border-red-400/20 bg-red-950/20 p-6 md:p-8">
              <h2 className="text-2xl font-black">Antes</h2>
              <ul className="mt-6 space-y-4 text-muted-foreground">
                {[
                  "Instagram como único cartão de visita",
                  "Cliente precisa procurar informações",
                  "WhatsApp escondido",
                  "Pouca confiança",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-emerald-400/20 bg-emerald-950/20 p-6 md:p-8">
              <h2 className="text-2xl font-black">Depois</h2>
              <ul className="mt-6 space-y-4 text-muted-foreground">
                {[
                  "Site próprio",
                  "Serviços claros",
                  "WhatsApp em destaque",
                  "Negócio com presença profissional",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="border border-white/10 bg-card p-6 md:p-10">
              <div className="flex max-w-4xl flex-col gap-6 md:flex-row md:items-start">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-primary text-primary-foreground">
                  <Globe size={28} />
                </div>
                <div>
                  <p className="mb-3 text-sm font-bold text-primary">
                    Relação com a estrutura de vendas
                  </p>
                  <h2 className="text-3xl font-black leading-tight md:text-5xl">
                    O site é a primeira camada da estrutura de vendas
                  </h2>
                  <p className="mt-5 text-lg leading-8 text-muted-foreground">
                    Depois dele, seu negócio pode evoluir para Google Meu Negócio,
                    tráfego pago, CRM e WhatsApp organizado. Você começa pela Presença
                    e cresce para o restante da estrutura quando fizer sentido.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="border-y border-white/10 bg-card/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 text-sm font-bold text-primary">FAQ</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Dúvidas comuns antes de colocar o site no ar
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {faq.map((item) => (
                <article key={item.question} className="border border-white/10 bg-background p-6">
                  <h3 className="text-lg font-black">{item.question}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="grid gap-8 border border-primary/30 bg-primary/10 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10">
              <div>
                <div className="mb-5 flex items-center gap-2 text-primary">
                  <Clock3 size={22} />
                  <span className="font-bold">Comece pela presença</span>
                </div>
                <h2 className="text-3xl font-black leading-tight md:text-5xl">
                  Seu negócio já merece uma presença mais profissional
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                  Com R$497 de investimento único, você coloca no ar uma página clara,
                  rápida e pronta para receber clientes pelo WhatsApp.
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
          <p>Site profissional para negócios locais · Camada Presença</p>
        </div>
      </footer>
    </div>
  );
}
