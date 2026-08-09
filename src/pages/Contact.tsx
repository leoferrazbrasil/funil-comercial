import {
  ArrowLeft,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router";
import Logo from "../components/Logo";
import { LeadCaptureForm } from "../components/LeadCaptureForm";
import { SeoHead } from "../components/SeoHead";

const PHONE = "+5551992568861";
const PHONE_LABEL = "+55 (51) 99256-8861";
const WHATSAPP_LINK = `https://wa.me/${PHONE.replace("+", "")}`;

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contato | Funil Comercial",
  url: "https://funilcomercial.com/contato",
  mainEntity: {
    "@type": "LocalBusiness",
    name: "Funil Comercial",
    telephone: PHONE,
    email: "funil@funilcomercial.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rua Liberal, 1329, 12",
      addressLocality: "Porto Alegre",
      addressRegion: "RS",
      postalCode: "91920-680",
      addressCountry: "BR",
    },
  },
};

export default function Contact() {
  return (
    <div
      data-theme="dark"
      className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30"
    >
      <SeoHead
        title="Contato"
        description="Fale com a Funil Comercial sobre estrutura de vendas, site, tráfego, CRM e WhatsApp organizado."
        canonicalUrl="https://funilcomercial.com/contato"
        schema={contactSchema}
      />

      <header className="border-b border-white/10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link
            to="/"
            aria-label="Funil Comercial - início"
            className="transition-opacity hover:opacity-80"
          >
            <Logo iconSize={32} theme="monochrome-white" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Voltar ao site
          </Link>
        </div>
      </header>

      <main>
        <section className="border-b border-white/10">
          <div className="mx-auto grid max-w-7xl lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-between border-b border-white/10 px-5 py-14 md:px-8 md:py-20 lg:border-b-0 lg:border-r">
              <div>
                <p className="mb-6 text-xs font-bold uppercase tracking-[0.24em] text-primary">
                  Contato / Funil Comercial
                </p>
                <h1 className="max-w-xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
                  Uma conversa pode começar aqui.
                </h1>
                <p className="mt-7 max-w-lg text-lg leading-8 text-muted-foreground">
                  Conte o que está travando sua operação comercial. A mensagem chega
                  organizada para que a conversa comece com contexto, não com mais uma
                  troca perdida no WhatsApp.
                </p>
              </div>

              <div className="mt-14 grid max-w-lg grid-cols-[auto_1fr] gap-x-4 border-t border-white/10 pt-5 text-sm">
                <span className="font-mono text-primary">01</span>
                <span className="text-muted-foreground">
                  Você envia o contexto do seu negócio.
                </span>
                <span className="mt-3 font-mono text-primary">02</span>
                <span className="mt-3 text-muted-foreground">
                  A equipe recebe a solicitação no CRM.
                </span>
              </div>
            </div>

            <div className="px-5 py-10 md:px-8 md:py-14">
              <div className="mb-8 max-w-xl">
                <p className="text-sm font-semibold text-primary">Envie sua mensagem</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                  Vamos entender o próximo passo.
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Preencha os dados abaixo. O envio será registrado para que nenhum
                  contexto se perca no caminho.
                </p>
              </div>

              <div className="max-w-xl">
                <LeadCaptureForm mode="contact" source="Página de contato" />
                <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                  <ShieldCheck size={15} className="mt-0.5 shrink-0 text-primary" />
                  Seus dados são usados apenas para responder à sua solicitação. Leia a
                  <Link to="/privacidade" className="ml-1 text-foreground underline underline-offset-4 hover:text-primary">
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-16">
            <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                  Canais oficiais
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                  Onde encontrar a Funil Comercial
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-muted-foreground md:text-right">
                Atendimento remoto para negócios locais em todo o Brasil.
              </p>
            </div>

            <div className="grid border-y border-white/10 md:grid-cols-3 md:divide-x md:divide-white/10">
              <a
                href="mailto:funil@funilcomercial.com"
                className="group flex min-h-36 items-start gap-4 border-b border-white/10 py-6 md:border-b-0 md:pr-7"
              >
                <Mail size={22} className="mt-1 shrink-0 text-primary" />
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    E-mail
                  </span>
                  <span className="mt-2 block break-all text-base font-semibold group-hover:text-primary">
                    funil@funilcomercial.com
                  </span>
                </span>
              </a>

              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-36 items-start gap-4 border-b border-white/10 py-6 md:px-7 md:border-b-0"
              >
                <MessageCircle size={22} className="mt-1 shrink-0 text-primary" />
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    WhatsApp
                  </span>
                  <span className="mt-2 block text-base font-semibold group-hover:text-primary">
                    {PHONE_LABEL}
                  </span>
                </span>
              </a>

              <div className="flex min-h-36 items-start gap-4 py-6 md:pl-7">
                <MapPin size={22} className="mt-1 shrink-0 text-primary" />
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Endereço do MEI
                  </span>
                  <span className="mt-2 block text-base font-semibold leading-6">
                    Rua Liberal, 1329, 12
                    <br />
                    Tristeza · Porto Alegre, RS
                    <br />
                    CEP 91920-680
                  </span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <p>Funil Comercial é uma marca operada por LEONARDO FERRAZ DA SILVA BRASIL.</p>
          <p>CNPJ 65.993.728/0001-07 · Porto Alegre, RS</p>
        </div>
      </footer>
    </div>
  );
}
