import { useEffect } from "react";
import { trackWhatsappClick } from "../lib/analytics";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Globe,
  HelpCircle,
  MapPin,
  MessageCircle,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  Target,
  UsersRound,
  Video,
  Wrench,
} from "lucide-react";
import Logo from "../components/Logo";
import { LeadCaptureForm } from "../components/LeadCaptureForm";

const WHATSAPP_NUMBER = "5551996737359";
const WHATSAPP_MESSAGE =
  "Olá! Tenho interesse no site para nutricionistas e profissionais da saúde por R$497 + R$37,90/mês. Pode me explicar como funciona?";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const problems = [
  "dependem apenas do Instagram",
  "têm informações espalhadas no feed",
  "não explicam claramente como atendem",
  "não mostram áreas de atuação de forma organizada",
  "deixam dúvidas sobre consulta presencial ou online",
  "não destacam localização, WhatsApp ou forma de agendamento",
  "não transmitem confiança na primeira impressão",
  "parecem menos estruturados que outros profissionais",
];

const solutionItems = [
  "quem é o profissional",
  "quais áreas atende",
  "como funciona a consulta",
  "se atende presencial, online ou ambos",
  "onde atende",
  "como agendar",
  "quais diferenciais fazem sentido comunicar",
  "qual é o canal de contato",
];

const includedItems = [
  {
    title: "Página profissional responsiva",
    text: "feita para funcionar bem no celular, tablet e computador.",
    icon: MonitorSmartphone,
  },
  {
    title: "Apresentação do profissional",
    text: "espaço para bio, formação, abordagem e forma de atendimento.",
    icon: UsersRound,
  },
  {
    title: "Áreas de atendimento",
    text: "nutrição clínica, esportiva, saúde da mulher, materno-infantil, comportamento alimentar ou outras especialidades, conforme o caso.",
    icon: ClipboardCheck,
  },
  {
    title: "Botões de WhatsApp",
    text: "chamadas claras para agendamento ou tirar dúvidas.",
    icon: MessageCircle,
  },
  {
    title: "Consulta online ou presencial",
    text: "explicação simples dos formatos de atendimento.",
    icon: Video,
  },
  {
    title: "Localização",
    text: "endereço, cidade, região atendida ou informação de atendimento online.",
    icon: MapPin,
  },
  {
    title: "Perguntas frequentes",
    text: "espaço para reduzir dúvidas antes do primeiro contato.",
    icon: HelpCircle,
  },
  {
    title: "Hospedagem e manutenção",
    text: "site no ar com mensalidade acessível de R$37,90.",
    icon: Globe,
  },
  {
    title: "Ajustes básicos após publicação",
    text: "pequenos ajustes para deixar a página correta depois da entrega.",
    icon: Wrench,
  },
];

const audiences = [
  "nutricionistas clínicos",
  "nutricionistas esportivos",
  "nutricionistas materno-infantis",
  "nutricionistas comportamentais",
  "profissionais de saúde integrativa",
  "fisioterapeutas",
  "psicólogos",
  "terapeutas",
  "fonoaudiólogos",
  "profissionais que atendem online",
  "profissionais que atendem presencialmente",
  "profissionais que recebem agendamentos pelo WhatsApp",
];

const siteBlocks = [
  "chamada principal para agendamento",
  "apresentação profissional",
  "abordagem de atendimento",
  "áreas de atuação",
  "formato da consulta",
  "localização ou atendimento online",
  "dúvidas frequentes",
  "botão de WhatsApp fixo",
  "chamada final para agendar ou conversar",
];

const beforeItems = [
  "só Instagram como cartão de visita",
  "posts misturados com informações importantes",
  "paciente precisa procurar como agendar",
  "áreas de atuação pouco claras",
  "WhatsApp escondido",
  "primeira impressão incompleta",
];

const afterItems = [
  "site próprio",
  "bio e abordagem organizadas",
  "áreas de atendimento claras",
  "WhatsApp em destaque",
  "consulta presencial/online explicada",
  "presença mais profissional",
];

const nextStructureItems = [
  "Google Meu Negócio otimizado",
  "tráfego pago para atrair pacientes ou clientes",
  "CRM com WhatsApp conectado",
  "funil de vendas para acompanhar contatos e agendamentos",
  "automações e pré-atendimento com IA",
];

const faq = [
  {
    question: "Esse site serve para atendimento online?",
    answer:
      "Sim. A página pode explicar seu atendimento online, presencial ou híbrido, de acordo com sua rotina.",
  },
  {
    question: "Preciso ter fotos profissionais?",
    answer:
      "Fotos reais ajudam muito, mas não são obrigatórias para começar. Se você não tiver, orientamos quais imagens e informações enviar.",
  },
  {
    question: "Posso colocar minhas especialidades?",
    answer:
      "Sim. O site pode organizar suas áreas de atuação de forma clara, sem deixar a página confusa.",
  },
  {
    question: "O site funciona no celular?",
    answer:
      "Sim. A página é feita pensando principalmente no celular, onde a maioria das pessoas acessa antes de chamar no WhatsApp.",
  },
  {
    question: "O domínio está incluso?",
    answer:
      "Se você já tem domínio, podemos usar. Se ainda não tem, orientamos o melhor caminho para registrar.",
  },
  {
    question: "Quanto custa?",
    answer:
      "O investimento é R$497, pagamento único, mais R$37,90/mês de hospedagem e manutenção.",
  },
  {
    question: "Em quanto tempo fica pronto?",
    answer:
      "Depois que recebemos as informações, a criação é feita em poucos dias, dependendo da quantidade de conteúdo e ajustes.",
  },
  {
    question: "O site garante novos pacientes?",
    answer:
      "Não. O site melhora sua presença, clareza e primeira impressão, mas resultados dependem de procura, reputação, conteúdo, Google, anúncios, atendimento e mercado.",
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

function HealthProfessionalSiteMockup() {
  return (
    <div className="relative mx-auto max-w-xl border border-white/10 bg-card/75 p-5 shadow-2xl backdrop-blur">
      <div className="mb-4 flex items-center justify-between border border-primary/25 bg-primary/10 px-4 py-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-primary">
            Página profissional
          </p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            bio, abordagem e agendamento
          </p>
        </div>
        <ShieldCheck className="text-primary" size={26} />
      </div>

      <div className="border border-white/10 bg-background p-4">
        <div className="mb-5 grid gap-4 md:grid-cols-[1fr_.68fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary">
              Nutrição e saúde
            </p>
            <h3 className="mt-2 text-2xl font-black leading-tight">
              Atendimento claro antes da primeira conversa
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Abordagem, áreas de atuação, formato da consulta e WhatsApp em uma página simples.
            </p>
          </div>
          <div className="flex min-h-32 items-center justify-center border border-white/10 bg-primary/10">
            <Stethoscope className="text-primary" size={44} />
          </div>
        </div>

        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          {["Bio", "Áreas", "Consulta"].map((item) => (
            <div key={item} className="border border-white/10 bg-card p-3">
              <CheckCircle2 className="mb-3 text-primary" size={18} />
              <p className="text-xs font-black">{item}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border border-white/10 bg-card p-4">
            <Video className="mb-3 text-primary" size={20} />
            <p className="text-sm font-black">Online ou presencial</p>
            <p className="mt-1 text-xs text-muted-foreground">formato explicado com clareza</p>
          </div>
          <div className="border border-primary/30 bg-primary/10 p-4">
            <MessageCircle className="mb-3 text-primary" size={20} />
            <p className="text-sm font-black">Agendar pelo WhatsApp</p>
            <p className="mt-1 text-xs text-muted-foreground">CTA direto no celular</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="border border-white/10 bg-background p-3">
          <Smartphone className="mx-auto mb-2 text-primary" size={20} />
          <p className="text-xs font-bold text-muted-foreground">mobile-first</p>
        </div>
        <div className="border border-white/10 bg-background p-3">
          <BadgeCheck className="mx-auto mb-2 text-primary" size={20} />
          <p className="text-xs font-bold text-muted-foreground">confiança</p>
        </div>
        <div className="border border-white/10 bg-background p-3">
          <Target className="mx-auto mb-2 text-primary" size={20} />
          <p className="text-xs font-bold text-muted-foreground">agendamento</p>
        </div>
      </div>
    </div>
  );
}

export default function NutritionistWebsiteLanding() {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content;
    const description =
      "Criação de site profissional para nutricionistas e profissionais da saúde por R$497 + R$37,90/mês. Página responsiva com apresentação, áreas de atendimento e WhatsApp.";

    document.title =
      "Site para Nutricionistas e Profissionais da Saúde por R$497 | Funil Comercial";
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
            <a href="#estrutura" className="hover:text-foreground">
              Estrutura
            </a>
            <a href="#faq" className="hover:text-foreground">
              FAQ
            </a>
          </nav>
          <a
            href={whatsappLink}
            onClick={() => trackWhatsappClick({ source: "site_para_nutricionistas" })}
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
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_74%_16%,rgba(245,158,11,.22),transparent_32rem),linear-gradient(180deg,rgba(5,5,5,.68),rgba(5,5,5,.98))]" />
          <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-5 py-20 md:px-8 lg:grid-cols-[1fr_.88fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                R$497 pagamento único · R$37,90/mês · Feito para celular e WhatsApp
              </div>
              <h1 className="max-w-4xl text-4xl font-black leading-[1.05] sm:text-5xl md:text-7xl">
                Site profissional para nutricionistas que querem passar confiança e facilitar agendamentos
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg md:text-xl">
                Criamos uma página clara, responsiva e pronta para apresentar sua
                abordagem, áreas de atendimento, localização e WhatsApp. Investimento
                único de R$497 + R$37,90/mês de hospedagem e manutenção.
              </p>
              <p className="mt-5 max-w-2xl border-l-4 border-primary pl-5 text-lg font-bold leading-8">
                Quem procura atendimento precisa entender sua abordagem antes de marcar uma consulta.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappLink}
                  onClick={() => trackWhatsappClick({ source: "site_para_nutricionistas" })}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-black text-primary-foreground transition hover:bg-primary/90"
                >
                  Quero um site profissional
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
            <HealthProfessionalSiteMockup />
          </div>
        </section>

        <section className="border-b border-white/10 bg-card/20 py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[.9fr_1.1fr] md:px-8">
            <div>
              <p className="mb-3 text-sm font-bold text-primary">O problema</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Seu futuro paciente pesquisa antes de chamar
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Antes de agendar, o paciente ou cliente quer entender quem é o
                profissional, como funciona o atendimento, quais áreas atende e como
                entrar em contato.
              </p>
              <p className="mt-6 border border-primary/30 bg-primary/10 p-5 font-bold text-primary">
                Na saúde, clareza e confiança vêm antes do agendamento.
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
                Uma página que apresenta seu trabalho com clareza
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                O site não substitui o relacionamento com o paciente. Ele organiza a
                primeira impressão para que a conversa comece melhor.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-4">
              {solutionItems.map((item) => (
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
                  O que o seu site pode incluir
                </h2>
                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                  Uma página acolhedora, objetiva e profissional para explicar sua
                  forma de atendimento e facilitar o primeiro contato pelo WhatsApp.
                </p>
              </div>
              <a
                href={whatsappLink}
                onClick={() => trackWhatsappClick({ source: "site_para_nutricionistas" })}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-bold text-primary-foreground"
              >
                Tirar dúvida no WhatsApp
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                Investimento simples para profissionalizar sua presença online
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                O valor único cobre a criação e publicação da página. A mensalidade
                mantém o site no ar, hospedado, atualizado e com suporte básico.
              </p>
              <a
                href={whatsappLink}
                onClick={() => trackWhatsappClick({ source: "site_para_nutricionistas" })}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-black text-primary-foreground transition hover:bg-primary/90"
              >
                Quero colocar meu site no ar
                <ArrowRight size={19} />
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <article className="border border-primary/25 bg-primary/10 p-6">
                <CircleDollarSign className="mb-5 text-primary" size={26} />
                <p className="text-sm font-bold text-muted-foreground">Criação do site</p>
                <p className="mt-2 text-4xl font-black text-primary">R$497</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">
                  pagamento único
                </p>
              </article>
              <article className="border border-primary/25 bg-primary/10 p-6">
                <Globe className="mb-5 text-primary" size={26} />
                <p className="text-sm font-bold text-muted-foreground">
                  Hospedagem e manutenção
                </p>
                <p className="mt-2 text-4xl font-black text-primary">R$37,90/mês</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">
                  site no ar e suporte básico
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-card/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 text-sm font-bold text-primary">Para quem é</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Para profissionais que precisam explicar bem seu atendimento
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {audiences.map((item) => (
                <div key={item} className="flex items-center gap-3 border border-white/10 bg-background p-4">
                  <Stethoscope className="shrink-0 text-primary" size={20} />
                  <span className="font-bold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="estrutura" className="py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[.86fr_1.14fr] md:px-8">
            <div>
              <p className="mb-3 text-sm font-bold text-primary">Estrutura sugerida</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                O que uma página de nutricionista precisa mostrar
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                A página precisa explicar o atendimento sem exagero, sem promessas
                sensíveis e com um caminho simples para conversar ou agendar.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {siteBlocks.map((item) => (
                <div key={item} className="border border-white/10 bg-card p-5">
                  <ClipboardCheck className="mb-4 text-primary" size={22} />
                  <p className="font-semibold leading-7">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-card/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 text-sm font-bold text-primary">Antes e depois</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                De informações espalhadas para uma presença profissional
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

        <section id="como-funciona" className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-12 max-w-3xl">
              <p className="mb-3 text-sm font-bold text-primary">Como funciona</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Como criamos seu site
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                {
                  step: "01",
                  title: "Conversa rápida no WhatsApp",
                  text: "Entendemos sua área de atuação, público, cidade, formato de atendimento e objetivo da página.",
                },
                {
                  step: "02",
                  title: "Coleta das informações",
                  text: "Você envia nome, bio, serviços, fotos, endereço, WhatsApp e dados necessários.",
                },
                {
                  step: "03",
                  title: "Criação da página",
                  text: "Montamos uma página clara, profissional e pensada para facilitar o primeiro contato.",
                },
                {
                  step: "04",
                  title: "Ajustes e publicação",
                  text: "Fazemos os ajustes finais e colocamos o site no ar.",
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
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[.9fr_1.1fr] md:px-8">
            <div>
              <p className="mb-3 text-sm font-bold text-primary">Estrutura de vendas</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                O site é a primeira camada da sua presença profissional
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Para nutricionistas e profissionais da saúde, o site faz parte da
                camada de Presença. Ele ajuda o paciente a encontrar, entender e
                confiar. Depois disso, o profissional pode evoluir para novas camadas
                da operação comercial.
              </p>
              <p className="mt-6 border border-primary/30 bg-primary/10 p-5 font-bold text-primary">
                Não adianta atrair visitantes se a primeira impressão não explica bem seu atendimento.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {nextStructureItems.map((item) => (
                <div key={item} className="border border-white/10 bg-background p-5">
                  <Target className="mb-4 text-primary" size={22} />
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
                Perguntas antes de criar seu site
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

        {/* Análise gratuita — formulário web (captura o lead + o GA4 client_id) */}
        <section id="analise-gratuita" className="py-20 md:py-28">
          <div className="mx-auto max-w-xl px-5 md:px-8">
            <div className="border border-white/10 bg-card/30 p-8 md:p-10">
              <h2 className="text-3xl font-black leading-tight md:text-4xl">
                Prefere que a gente te chame?
              </h2>
              <p className="mt-4 mb-6 leading-8 text-muted-foreground">
                Deixe seu nome e WhatsApp. A gente retorna com uma análise da sua
                presença digital e mostra como ficaria o seu site profissional — sem
                compromisso.
              </p>
              <LeadCaptureForm />
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-card/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="grid gap-8 border border-primary/30 bg-primary/10 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10">
              <div>
                <div className="mb-5 flex items-center gap-2 text-primary">
                  <Clock3 size={22} />
                  <span className="font-bold">Presença profissional</span>
                </div>
                <h2 className="text-3xl font-black leading-tight md:text-5xl">
                  Sua presença profissional pode começar com uma página clara e acessível
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                  Com R$497 de investimento único, você coloca no ar uma página para
                  apresentar sua abordagem, áreas de atendimento e WhatsApp de agendamento.
                </p>
              </div>
              <a
                href={whatsappLink}
                onClick={() => trackWhatsappClick({ source: "site_para_nutricionistas" })}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-black text-primary-foreground transition hover:bg-primary/90"
              >
                Chamar no WhatsApp e começar meu site
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <Logo iconSize={28} theme="monochrome-white" />
          <p>Site para nutricionistas · Presença profissional · WhatsApp de agendamento</p>
        </div>
      </footer>
    </div>
  );
}
