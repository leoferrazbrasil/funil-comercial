import { useEffect } from "react";
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
  Store,
  Target,
  Wrench,
} from "lucide-react";
import Logo from "../components/Logo";

const WHATSAPP_NUMBER = "5551996737359";
const WHATSAPP_MESSAGE =
  "Olá! Tenho interesse no site para dentistas por R$497 + R$37,90/mês. Pode me explicar como funciona?";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const problems = [
  "dependem apenas do Instagram",
  "têm site antigo ou confuso",
  "não explicam bem os tratamentos",
  "escondem o botão de WhatsApp",
  "não mostram localização com clareza",
  "não transmitem autoridade na primeira impressão",
  "deixam o paciente com dúvidas antes de chamar",
  "parecem menos organizadas que concorrentes",
];

const solutionItems = [
  "quem é o dentista ou clínica",
  "quais tratamentos são oferecidos",
  "onde fica o atendimento",
  "como agendar",
  "quais diferenciais passam confiança",
  "botão de WhatsApp sempre visível",
  "estrutura clara no celular",
];

const includedItems = [
  {
    title: "Página profissional responsiva",
    text: "funciona bem no celular, tablet e computador.",
    icon: MonitorSmartphone,
  },
  {
    title: "Apresentação da clínica ou dentista",
    text: "espaço para contar quem atende e transmitir confiança.",
    icon: Stethoscope,
  },
  {
    title: "Tratamentos organizados",
    text: "implantes, ortodontia, clareamento, estética dental, clínica geral e outros serviços.",
    icon: ClipboardCheck,
  },
  {
    title: "Botões de WhatsApp",
    text: "chamadas claras para agendamento, avaliação ou tirar dúvidas.",
    icon: MessageCircle,
  },
  {
    title: "Seção de localização",
    text: "endereço, área atendida e orientação para o paciente encontrar a clínica.",
    icon: MapPin,
  },
  {
    title: "Prova de confiança",
    text: "espaço para avaliações, diferenciais, estrutura, fotos e informações relevantes.",
    icon: BadgeCheck,
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
  "dentistas autônomos",
  "clínicas odontológicas",
  "consultórios recém-abertos",
  "clínicas que dependem de indicação",
  "clínicas que querem melhorar a primeira impressão",
  "especialistas em implantes",
  "especialistas em ortodontia",
  "profissionais de estética dental",
  "clínicas que anunciam e precisam de uma página melhor",
  "clínicas que recebem pacientes pelo WhatsApp",
];

const siteBlocks = [
  "chamada principal para agendamento",
  "apresentação do profissional ou clínica",
  "lista de tratamentos",
  "diferenciais do atendimento",
  "fotos reais quando disponíveis",
  "localização",
  "perguntas frequentes",
  "botão de WhatsApp fixo",
  "chamada final para agendar",
];

const beforeItems = [
  "só Instagram ou link solto",
  "tratamentos misturados no feed",
  "WhatsApp difícil de encontrar",
  "pouca clareza sobre localização",
  "paciente precisa perguntar tudo",
  "primeira impressão fraca",
];

const afterItems = [
  "site próprio",
  "tratamentos organizados",
  "WhatsApp em destaque",
  "clínica apresentada com clareza",
  "localização visível",
  "experiência melhor no celular",
];

const nextStructureItems = [
  "Google Meu Negócio otimizado",
  "tráfego pago para atrair pacientes",
  "CRM com WhatsApp conectado",
  "funil de vendas para acompanhar orçamentos e avaliações",
  "automações e pré-atendimento com IA",
];

const faq = [
  {
    question: "O site serve para dentista autônomo ou só para clínica?",
    answer:
      "Serve para os dois. A página pode apresentar um profissional, uma clínica pequena ou uma estrutura maior.",
  },
  {
    question: "Preciso ter fotos profissionais?",
    answer:
      "Fotos reais ajudam muito, mas não são obrigatórias para começar. Se você não tiver, orientamos quais imagens e informações enviar.",
  },
  {
    question: "Posso colocar todos os tratamentos?",
    answer:
      "Sim, mas a página deve priorizar os tratamentos principais para não ficar confusa. A ideia é organizar a oferta para o paciente entender rápido.",
  },
  {
    question: "O site funciona no celular?",
    answer:
      "Sim. A página é feita pensando principalmente no celular, onde a maioria dos pacientes acessa antes de chamar no WhatsApp.",
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
      "Não. O site melhora sua presença e primeira impressão, mas resultados dependem de procura, reputação, Google, anúncios, atendimento e mercado local.",
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

function DentalSiteMockup() {
  return (
    <div className="relative mx-auto max-w-xl border border-white/10 bg-card/75 p-5 shadow-2xl backdrop-blur">
      <div className="mb-4 flex items-center justify-between border border-primary/25 bg-primary/10 px-4 py-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-primary">
            Página odontológica
          </p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            apresentação, tratamentos e agendamento
          </p>
        </div>
        <ShieldCheck className="text-primary" size={26} />
      </div>

      <div className="border border-white/10 bg-background p-4">
        <div className="mb-5 grid gap-4 md:grid-cols-[1fr_.68fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary">
              Clínica odontológica
            </p>
            <h3 className="mt-2 text-2xl font-black leading-tight">
              Agende sua avaliação com segurança
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Tratamentos, localização e WhatsApp em uma página clara para o paciente.
            </p>
          </div>
          <div className="flex min-h-32 items-center justify-center border border-white/10 bg-primary/10">
            <Stethoscope className="text-primary" size={44} />
          </div>
        </div>

        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          {["Implantes", "Ortodontia", "Clareamento"].map((item) => (
            <div key={item} className="border border-white/10 bg-card p-3">
              <CheckCircle2 className="mb-3 text-primary" size={18} />
              <p className="text-xs font-black">{item}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border border-white/10 bg-card p-4">
            <MapPin className="mb-3 text-primary" size={20} />
            <p className="text-sm font-black">Localização visível</p>
            <p className="mt-1 text-xs text-muted-foreground">endereço e região atendida</p>
          </div>
          <div className="border border-primary/30 bg-primary/10 p-4">
            <MessageCircle className="mb-3 text-primary" size={20} />
            <p className="text-sm font-black">Agendar pelo WhatsApp</p>
            <p className="mt-1 text-xs text-muted-foreground">CTA claro no celular</p>
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

export default function DentistWebsiteLanding() {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content;
    const description =
      "Criação de site profissional para dentistas e clínicas odontológicas por R$497 + R$37,90/mês. Página responsiva com tratamentos, localização e WhatsApp.";

    document.title =
      "Site para Dentistas e Clínicas Odontológicas por R$497 | Funil Comercial";
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
                R$497 pagamento único · R$37,90/mês · Feito para WhatsApp e celular
              </div>
              <h1 className="max-w-4xl text-4xl font-black leading-[1.05] sm:text-5xl md:text-7xl">
                Site profissional para dentistas que querem passar mais confiança e gerar agendamentos pelo WhatsApp
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg md:text-xl">
                Criamos uma página clara, rápida e responsiva para apresentar sua
                clínica, seus tratamentos, sua localização e seu canal de atendimento.
                Investimento único de R$497 + R$37,90/mês de hospedagem e manutenção.
              </p>
              <p className="mt-5 max-w-2xl border-l-4 border-primary pl-5 text-lg font-bold leading-8">
                O paciente pesquisa antes de agendar. Seu site precisa ajudar nessa decisão.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-black text-primary-foreground transition hover:bg-primary/90"
                >
                  Quero um site para minha clínica
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
            <DentalSiteMockup />
          </div>
        </section>

        <section className="border-b border-white/10 bg-card/20 py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[.9fr_1.1fr] md:px-8">
            <div>
              <p className="mb-3 text-sm font-bold text-primary">O problema</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                O paciente não decide só pelo preço. Ele decide pela confiança.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Antes de agendar, o paciente pesquisa, compara e procura sinais de
                organização. Muitas clínicas perdem oportunidades porque a primeira
                impressão digital não acompanha a qualidade do atendimento.
              </p>
              <p className="mt-6 border border-primary/30 bg-primary/10 p-5 font-bold text-primary">
                Na odontologia, a primeira impressão digital pode influenciar se o paciente chama você ou continua pesquisando.
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
                Uma página pensada para transformar pesquisa em conversa
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                O site organiza as informações que o paciente precisa antes de entrar
                em contato. Ele não substitui o atendimento. Ele prepara o paciente
                para chamar com mais segurança.
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

        <section id="incluso" className="border-y border-white/10 bg-card/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div className="max-w-3xl">
                <p className="mb-3 text-sm font-bold text-primary">O que está incluso</p>
                <h2 className="text-3xl font-black leading-tight md:text-5xl">
                  O que o site da sua clínica pode incluir
                </h2>
                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                  Uma estrutura simples de entender, pensada para celular, confiança e
                  caminho rápido para o WhatsApp.
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
                Investimento simples para profissionalizar sua presença online
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                O valor único cobre a criação e publicação da página. A mensalidade
                mantém o site no ar, hospedado, atualizado e com suporte básico.
              </p>
              <a
                href={whatsappLink}
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
                Para dentistas e clínicas que querem uma presença mais profissional
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
                O que sua página precisa mostrar para o paciente
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                A página precisa orientar a decisão sem exagero, com informações
                claras e um caminho simples para agendamento.
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
                De presença improvisada para uma página que orienta o paciente
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
                Como criamos o site da sua clínica
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                {
                  step: "01",
                  title: "Conversa rápida no WhatsApp",
                  text: "Entendemos sua clínica, tratamentos, cidade, diferenciais e objetivo principal.",
                },
                {
                  step: "02",
                  title: "Coleta das informações",
                  text: "Você envia nome, serviços, fotos, endereço, WhatsApp e dados necessários.",
                },
                {
                  step: "03",
                  title: "Criação da página",
                  text: "Montamos uma página clara, profissional e pensada para gerar contato.",
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
                O site é a primeira camada da sua estrutura comercial
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Para clínicas odontológicas, o site faz parte da camada de Presença.
                Ele ajuda o paciente a encontrar, entender e confiar. Depois disso, a
                clínica pode evoluir para novas camadas da operação comercial.
              </p>
              <p className="mt-6 border border-primary/30 bg-primary/10 p-5 font-bold text-primary">
                Não adianta atrair pacientes se a primeira impressão não transmite confiança.
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
                Perguntas antes de criar o site da clínica
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
                  <span className="font-bold">Presença profissional</span>
                </div>
                <h2 className="text-3xl font-black leading-tight md:text-5xl">
                  Sua clínica pode passar mais confiança antes mesmo da primeira mensagem
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                  Com R$497 de investimento único, você coloca no ar uma página
                  profissional para apresentar seus tratamentos, localização e WhatsApp
                  de agendamento.
                </p>
              </div>
              <a
                href={whatsappLink}
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
          <p>Site para dentistas · Presença profissional · WhatsApp de agendamento</p>
        </div>
      </footer>
    </div>
  );
}
