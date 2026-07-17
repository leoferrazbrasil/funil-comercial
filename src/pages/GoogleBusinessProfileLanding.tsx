import { useEffect } from "react";
import { trackEvent } from "../lib/analytics";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Camera,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Globe,
  HelpCircle,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Store,
  Wrench,
} from "lucide-react";
import Logo from "../components/Logo";

const WHATSAPP_NUMBER = "5551996737359";
const WHATSAPP_MESSAGE =
  "Olá! Tenho interesse na otimização do Google Meu Negócio por R$797. Pode me explicar como funciona?";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const problems = [
  "não aparecem bem no Google",
  "têm perfil incompleto",
  "usam categoria errada",
  "não mostram serviços com clareza",
  "têm poucas fotos ou fotos ruins",
  "não têm descrição comercial forte",
  "deixam horário, endereço ou telefone desatualizados",
  "não conduzem o cliente para WhatsApp, ligação ou rota",
  "parecem menos confiáveis que concorrentes mais organizados",
];

const solutionItems = [
  "o que você faz",
  "onde atende",
  "quando está aberto",
  "quais serviços oferece",
  "como entrar em contato",
  "por que confiar no seu negócio",
];

const includedItems = [
  { title: "Revisão completa do perfil atual", icon: Search },
  { title: "Configuração ou ajuste de categoria principal", icon: Store },
  { title: "Categorias secundárias quando fizer sentido", icon: Briefcase },
  { title: "Descrição comercial do negócio", icon: ClipboardCheck },
  { title: "Organização dos serviços", icon: Wrench },
  { title: "Ajuste de endereço, telefone, horário e área de atendimento", icon: MapPin },
  { title: "Inserção ou orientação sobre fotos", icon: Camera },
  { title: "Configuração de links de contato", icon: MessageCircle },
  { title: "Direcionamento para site ou WhatsApp", icon: Globe },
  { title: "Revisão de informações inconsistentes", icon: ShieldCheck },
  { title: "Recomendações para melhorar a presença local", icon: Star },
  { title: "Orientação sobre avaliações e respostas", icon: CheckCircle2 },
];

const audiences = [
  "nutricionistas",
  "psicólogos e terapeutas",
  "fisioterapeutas e massoterapeutas",
  "contadores",
  "engenheiros",
  "prestadores de serviço",
  "autônomos",
  "serviços da casa",
  "profissionais autônomos",
  "negócios que recebem clientes por ligação, rota, WhatsApp ou visita presencial",
];

const beforeItems = [
  "perfil incompleto",
  "poucas informações",
  "serviços confusos",
  "fotos sem intenção comercial",
  "cliente sem caminho claro para contato",
  "pouca confiança na primeira impressão",
];

const afterItems = [
  "perfil organizado",
  "serviços claros",
  "descrição profissional",
  "fotos e informações alinhadas",
  "botão de contato em destaque",
  "presença local mais confiável",
];

const faq = [
  {
    question: "Vocês garantem que meu negócio ficará em primeiro no Google?",
    answer:
      "Não. Nenhuma empresa séria pode garantir primeira posição. O que fazemos é organizar e otimizar seu perfil para melhorar sua apresentação, clareza e presença local.",
  },
  {
    question: "Preciso já ter um Perfil da Empresa?",
    answer:
      "Não necessariamente. Se você ainda não tem, podemos orientar a criação e configuração. Se já tem, fazemos a revisão e otimização.",
  },
  {
    question: "O valor tem mensalidade?",
    answer: "Não. O investimento é R$797, pagamento único.",
  },
  {
    question: "O Google pode pedir verificação?",
    answer:
      "Sim. Em alguns casos, o Google pode exigir verificação por telefone, vídeo, e-mail ou outros métodos. Quando isso acontecer, orientamos o processo.",
  },
  {
    question: "Preciso enviar fotos?",
    answer:
      "Sim, se você tiver fotos reais do local, equipe, atendimento ou serviços, elas ajudam muito. Se não tiver, orientamos quais fotos produzir.",
  },
  {
    question: "Isso substitui um site?",
    answer:
      "Não. O Google ajuda o cliente a encontrar seu negócio. O site ajuda a apresentar melhor sua oferta, serviços e diferenciais. Os dois funcionam melhor juntos.",
  },
  {
    question: "Serve para negócios sem loja física?",
    answer:
      "Depende do tipo de serviço e das regras do Google. Prestadores que atendem em área de cobertura podem configurar área de atendimento quando aplicável.",
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

function LocalProfileMockup() {
  return (
    <div className="relative mx-auto max-w-xl border border-white/10 bg-card/70 p-5 shadow-2xl backdrop-blur">
      <div className="mb-4 flex items-center gap-3 border border-white/10 bg-background px-4 py-3">
        <Search className="text-primary" size={20} />
        <span className="text-sm font-semibold text-muted-foreground">
          serviço perto de mim
        </span>
      </div>
      <div className="border border-primary/25 bg-primary/10 p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary">
              Perfil local organizado
            </p>
            <h3 className="mt-2 text-2xl font-black">Seu Negócio</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Categoria correta · Região atendida · Contato visível
            </p>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-primary text-primary-foreground">
            <MapPin size={28} />
          </div>
        </div>
        <div className="mb-5 flex flex-wrap gap-2 text-xs font-bold">
          <span className="border border-white/10 bg-background px-3 py-2">Aberto hoje</span>
          <span className="border border-white/10 bg-background px-3 py-2">Serviços claros</span>
          <span className="border border-white/10 bg-background px-3 py-2">Fotos alinhadas</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="border border-white/10 bg-background p-3">
            <Phone className="mb-3 text-primary" size={20} />
            <p className="text-sm font-black">Ligar</p>
          </div>
          <div className="border border-white/10 bg-background p-3">
            <MessageCircle className="mb-3 text-primary" size={20} />
            <p className="text-sm font-black">WhatsApp</p>
          </div>
          <div className="border border-white/10 bg-background p-3">
            <MapPin className="mb-3 text-primary" size={20} />
            <p className="text-sm font-black">Rota</p>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <span className="h-24 bg-white/10" />
        <span className="h-24 bg-white/10" />
        <span className="h-24 bg-primary/50" />
      </div>
    </div>
  );
}

export default function GoogleBusinessProfileLanding() {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content;
    const description =
      "Otimize o Perfil da Empresa no Google do seu negócio local por R$797, pagamento único e sem mensalidade. Organize serviços, fotos, contatos e presença local.";

    document.title = "Otimização Google Meu Negócio por R$797 | Funil Comercial";
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
            <a href="#como-funciona" className="hover:text-foreground">
              Como funciona
            </a>
            <a href="#faq" className="hover:text-foreground">
              FAQ
            </a>
          </nav>
          <a
            href={whatsappLink} onClick={(e) => { trackEvent("whatsapp_click", { method: "whatsapp" }); }}
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
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_18%,rgba(245,158,11,.22),transparent_32rem),linear-gradient(180deg,rgba(5,5,5,.72),rgba(5,5,5,.98))]" />
          <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-5 py-20 md:px-8 lg:grid-cols-[1fr_.86fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                R$797 pagamento único · Sem mensalidade · Foco em negócios locais
              </div>
              <h1 className="max-w-4xl text-4xl font-black leading-[1.05] sm:text-5xl md:text-7xl">
                Faça seu negócio aparecer melhor quando o cliente procura no Google
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg md:text-xl">
                Configuramos e otimizamos seu Perfil da Empresa no Google para
                apresentar seus serviços, localização, fotos, horários e canais de
                contato com mais clareza. Investimento único de R$797, sem mensalidade.
              </p>
              <p className="mt-5 max-w-2xl border-l-4 border-primary pl-5 text-lg font-bold leading-8">
                Seu perfil no Google pode ser a primeira impressão antes do cliente
                chamar no WhatsApp.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappLink} onClick={(e) => { trackEvent("whatsapp_click", { method: "whatsapp" }); }}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-black text-primary-foreground transition hover:bg-primary/90"
                >
                  Quero otimizar meu Google
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
            <LocalProfileMockup />
          </div>
        </section>

        <section className="border-b border-white/10 bg-card/20 py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[.9fr_1.1fr] md:px-8">
            <div>
              <p className="mb-3 text-sm font-bold text-primary">O problema</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Seu cliente pesquisa antes de decidir
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Muitos negócios locais perdem oportunidades porque a primeira
                impressão digital está incompleta, confusa ou desatualizada.
              </p>
              <p className="mt-6 border border-primary/30 bg-primary/10 p-5 font-bold text-primary">
                Às vezes o concorrente não é melhor. Ele só está mais bem apresentado no Google.
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
                O Perfil da Empresa no Google é sua vitrine local
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Quando alguém procura por um serviço perto dela, o Google pode mostrar
                empresas locais no Maps e na busca. Um perfil bem configurado ajuda o
                cliente a entender o essencial antes de chamar.
              </p>
              <p className="mt-5 text-base leading-7 text-muted-foreground">
                A otimização melhora clareza, organização e presença local. Resultados
                dependem de mercado, concorrência, avaliações, localização e comportamento
                dos clientes.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-6">
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
                  O que fazemos na otimização
                </h2>
                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                  Alguns itens dependem de acesso, aprovação do Google e informações
                  fornecidas pelo cliente. Quando for o caso, orientamos o processo.
                </p>
              </div>
              <a
                href={whatsappLink} onClick={(e) => { trackEvent("whatsapp_click", { method: "whatsapp" }); }}
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
                Investimento único para organizar sua presença no Google
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                A configuração e otimização do Perfil da Empresa no Google é feita
                uma vez, com foco em deixar sua presença local mais clara, completa e
                preparada para receber clientes. Não há mensalidade.
              </p>
            </div>
            <div className="border border-primary/30 bg-primary/10 p-6 md:p-8">
              <div className="flex items-center gap-3 text-primary">
                <CircleDollarSign size={28} />
                <span className="font-bold">Camada Presença</span>
              </div>
              <div className="mt-8">
                <p className="text-sm font-bold text-muted-foreground">Pagamento único</p>
                <p className="mt-1 text-6xl font-black text-primary">R$797</p>
              </div>
              <div className="my-6 h-px bg-white/10" />
              <p className="text-2xl font-black">Sem mensalidade</p>
              <a
                href={whatsappLink} onClick={(e) => { trackEvent("whatsapp_click", { method: "whatsapp" }); }}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-black text-primary-foreground transition hover:bg-primary/90"
              >
                Quero otimizar meu perfil
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
                Para negócios que precisam ser encontrados na região
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
                De cadastro esquecido para vitrine comercial
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
                Simples, direto e sem mensalidade
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                {
                  step: "01",
                  title: "Você chama no WhatsApp",
                  text: "Entendemos seu negócio, sua região, seus serviços e como os clientes costumam chegar até você.",
                },
                {
                  step: "02",
                  title: "Coletamos acessos e informações",
                  text: "Você envia os dados necessários, como serviços, horários, fotos, endereço e contatos.",
                },
                {
                  step: "03",
                  title: "Otimizamos o perfil",
                  text: "Ajustamos as informações estratégicas e deixamos seu Perfil da Empresa mais claro e completo.",
                },
                {
                  step: "04",
                  title: "Você recebe orientação",
                  text: "Depois da entrega, você sabe o que manter atualizado para o perfil continuar forte.",
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
            <div className="border border-white/10 bg-card p-6 md:p-10">
              <div className="flex max-w-4xl flex-col gap-6 md:flex-row md:items-start">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-primary text-primary-foreground">
                  <MapPin size={28} />
                </div>
                <div>
                  <p className="mb-3 text-sm font-bold text-primary">
                    Relação com a estrutura de vendas
                  </p>
                  <h2 className="text-3xl font-black leading-tight md:text-5xl">
                    O Google é a primeira camada da estrutura
                  </h2>
                  <p className="mt-5 text-lg leading-8 text-muted-foreground">
                    O Perfil da Empresa no Google faz parte da camada de Presença.
                    Ele ajuda o cliente a encontrar e confiar. Depois disso, seu
                    negócio pode evoluir para site profissional, tráfego pago, CRM,
                    WhatsApp organizado e funil de vendas.
                  </p>
                  <p className="mt-5 text-lg font-bold leading-8">
                    O Google não resolve tudo sozinho. Ele fortalece a entrada do
                    funil. Para vender mais, a presença precisa se conectar com
                    atendimento, acompanhamento e conversão.
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
                Perguntas antes de otimizar seu perfil
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {faq.map((item) => (
                <article key={item.question} className="border border-white/10 bg-background p-6">
                  <HelpCircle className="mb-4 text-primary" size={22} />
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
                  <MapPin size={22} />
                  <span className="font-bold">Presença local mais clara</span>
                </div>
                <h2 className="text-3xl font-black leading-tight md:text-5xl">
                  Seu negócio pode estar perdendo clientes antes mesmo da primeira conversa
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                  Organize seu Perfil da Empresa no Google e transforme sua presença
                  local em uma vitrine mais clara, confiável e pronta para gerar contato.
                </p>
              </div>
              <a
                href={whatsappLink} onClick={(e) => { trackEvent("whatsapp_click", { method: "whatsapp" }); }}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-black text-primary-foreground transition hover:bg-primary/90"
              >
                Chamar no WhatsApp e otimizar meu Google
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <Logo iconSize={28} theme="monochrome-white" />
          <p>Perfil da Empresa no Google · Camada Presença</p>
        </div>
      </footer>
    </div>
  );
}
