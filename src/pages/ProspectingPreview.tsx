import { useEffect, type CSSProperties } from "react";
import { Navigate, useLocation } from "react-router";
import {
  getProspectingPreview,
  getProspectingPreviewSlug,
  type ProspectingPreview,
} from "../lib/prospectingPreviews";

function waLink(preview: ProspectingPreview, text: string) {
  const digits = preview.phone.replace(/\D/g, "");
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(text)}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProspectingPreviewPage() {
  const location = useLocation();
  const slug = getProspectingPreviewSlug(location.pathname);
  const preview = getProspectingPreview(slug);

  useEffect(() => {
    if (!preview) return;
    document.title = `${preview.name} | Atendimento odontológico`;
  }, [preview]);

  if (!preview) {
    return <Navigate to="/" replace />;
  }

  const whatsapp = waLink(
    preview,
    `Olá! Vim pelo site e gostaria de agendar uma avaliação com ${preview.name}.`,
  );
  const hasNumericRating = /^\d/.test(preview.rating);
  const ratingText = hasNumericRating
    ? `${preview.rating} no Google`
    : "Presença local";
  const reviewsText = hasNumericRating
    ? `${preview.reviews} avaliações`
    : "dados do site atual";
  const style = {
    "--prospect-primary": preview.colors.primary,
    "--prospect-secondary": preview.colors.secondary,
    "--prospect-accent": preview.colors.accent,
  } as CSSProperties;

  return (
    <main className="prospect-page" style={style}>
      <div className="prospect-alert">
        <div className="prospect-wrap">
          <span>{preview.address}</span>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer">
            {preview.contact}
          </a>
        </div>
      </div>

      <header className="prospect-header">
        <div className="prospect-wrap prospect-header-grid">
          <a className="prospect-brand" href="#inicio" aria-label={preview.name}>
            <span className="prospect-mark">{initials(preview.name)}</span>
            <span>
              <strong>{preview.name}</strong>
              <small>
                {preview.niche} em {preview.region}
              </small>
            </span>
          </a>
          <nav className="prospect-nav" aria-label="Navegação principal">
            <a href="#servicos">Serviços</a>
            <a href="#prova">Diferenciais</a>
            <a href="#localizacao">Localização</a>
          </nav>
          <a className="prospect-button" href={whatsapp} target="_blank" rel="noopener noreferrer">
            Agendar pelo WhatsApp
          </a>
        </div>
      </header>

      <section className="prospect-hero" id="inicio">
        <div className="prospect-wrap prospect-hero-grid">
          <div>
            <p className="prospect-eyebrow">Nova versão demonstrativa</p>
            <h1>{preview.name} com presença digital mais clara e premium</h1>
            <p className="prospect-lead">
              Uma reorganização da página atual com as informações reais preservadas:
              serviços, contato, localização e chamadas diretas para agendamento.
            </p>
            <div className="prospect-actions">
              <a className="prospect-button" href={whatsapp} target="_blank" rel="noopener noreferrer">
                Quero agendar uma avaliação
              </a>
              <a className="prospect-button prospect-button-light" href="#servicos">
                Ver serviços
              </a>
            </div>
            <div className="prospect-trust">
              <span>{ratingText}</span>
              <span>{reviewsText}</span>
              <span>{preview.platform}</span>
            </div>
          </div>

          <aside className="prospect-showcase" aria-label="Resumo do atendimento">
            <div className="prospect-visual">
              <svg viewBox="0 0 320 220" role="img" aria-label="Consultório odontológico">
                <rect x="24" y="42" width="272" height="136" rx="18" fill="rgba(255,255,255,.2)" />
                <circle cx="108" cy="105" r="34" fill="rgba(255,255,255,.86)" />
                <path d="M174 78h68M174 108h88M174 138h58" stroke="white" strokeWidth="13" strokeLinecap="round" />
                <path d="M94 101c12-22 36-22 48 0 7 14-2 38-15 54-4 5-10 5-14 0-13-16-22-40-19-54z" fill="var(--prospect-accent)" />
              </svg>
            </div>
            <div className="prospect-showcase-body">
              <h2>Atendimento mais fácil de entender e chamar</h2>
              <p>{preview.reason}</p>
            </div>
            <div className="prospect-metrics">
              <span>
                <strong>{ratingText}</strong>
                prova social
              </span>
              <span>
                <strong>CTA direto</strong>
                WhatsApp em todos os pontos
              </span>
            </div>
          </aside>
        </div>
      </section>

      <section className="prospect-section" id="servicos">
        <div className="prospect-wrap">
          <div className="prospect-section-head">
            <p className="prospect-eyebrow">Serviços reais do site atual</p>
            <h2>Especialidades organizadas para decisão rápida</h2>
            <p>
              O conteúdo foi reorganizado para que o visitante entenda rapidamente
              o que a clínica faz e tenha um caminho claro para conversar pelo WhatsApp.
            </p>
          </div>
          <div className="prospect-cards">
            {preview.services.map((service) => (
              <article className="prospect-service" key={service}>
                <span aria-hidden="true" />
                <h3>{service}</h3>
                <p>
                  Serviço real identificado no site atual, reorganizado para facilitar
                  decisão e contato pelo WhatsApp.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="prospect-section prospect-soft" id="prova">
        <div className="prospect-wrap prospect-split">
          <div className="prospect-proof">
            <p className="prospect-eyebrow">Identidade preservada</p>
            <h2>Reconhecível, só que mais forte</h2>
            <p>
              A nova versão mantém as informações principais do site atual e melhora
              hierarquia, clareza, leitura no celular e chamadas de agendamento.
            </p>
          </div>
          <div className="prospect-proof-list">
            <p>
              <strong>Dados reais.</strong> Serviços, endereço e contato vieram do
              site atual ou de fonte pública localizada durante a simulação.
            </p>
            <p>
              <strong>Prova social.</strong> {preview.proof}.
            </p>
            <p>
              <strong>Conversão.</strong> CTAs de consulta, localização e informações
              levam para WhatsApp/telefone publicado.
            </p>
          </div>
        </div>
      </section>

      <section className="prospect-section" id="localizacao">
        <div className="prospect-wrap prospect-split">
          <div>
            <p className="prospect-eyebrow">Localização</p>
            <h2>{preview.address}</h2>
            <p className="prospect-muted">
              Endereço preservado do site atual ou da fonte pública consultada.
              Antes de publicar no domínio definitivo do cliente, a rotina revisa
              eventuais mudanças de endereço e horário.
            </p>
            <div className="prospect-actions">
              <a className="prospect-button" href={whatsapp} target="_blank" rel="noopener noreferrer">
                Confirmar atendimento
              </a>
              <a className="prospect-button prospect-button-light" href={preview.mapsLink} target="_blank" rel="noopener noreferrer">
                Abrir localização
              </a>
            </div>
          </div>
          <div className="prospect-info">
            <h3>Contato</h3>
            <p>{preview.contact}</p>
            {preview.email ? <p>{preview.email}</p> : null}
            <p>Site atual: {preview.currentSite}</p>
          </div>
        </div>
      </section>

      <section className="prospect-cta">
        <div className="prospect-wrap prospect-cta-grid">
          <div>
            <h2>Pronto para receber pacientes com mais clareza</h2>
            <p>
              Versão demonstrativa criada para mostrar como a página atual pode
              ficar mais profissional sem perder a identidade.
            </p>
          </div>
          <a className="prospect-button" href={whatsapp} target="_blank" rel="noopener noreferrer">
            Falar pelo WhatsApp
          </a>
        </div>
      </section>

      <footer className="prospect-footer">
        <div className="prospect-wrap prospect-footer-grid">
          <p>
            <strong>{preview.name}</strong>
            Redesign demonstrativo baseado em informações públicas do site atual.
          </p>
          <p>
            <strong>Contato</strong>
            {preview.contact}
          </p>
          <p>
            <strong>Site atual</strong>
            {preview.platform}
          </p>
        </div>
      </footer>
    </main>
  );
}
