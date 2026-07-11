import type { ReactNode } from "react";
import {
  Quote,
  X,
  CheckCircle2,
  Stethoscope,
  Layers,
  Camera,
  BadgeCheck,
  ListChecks,
  AlertTriangle,
  Calendar,
} from "lucide-react";

/* ------------------------------------------------------------------ *
 * 04. Diretrizes de Conteúdo & Ativação (Brandbook)
 * Fonte: cofre Obsidian — Linha_Editorial_Funil_Comercial.md +
 * Diretrizes_Publicacao_5W2H.md. Callouts do Obsidian ([!abstract])
 * traduzidos para cards com borda esquerda âmbar (identidade da marca).
 * ------------------------------------------------------------------ */

// Callout de pilar = equivalente ao [!abstract] do Obsidian.
function Pilar({
  n,
  icon,
  titulo,
  etapa,
  children,
}: {
  n: string;
  icon: ReactNode;
  titulo: string;
  etapa: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/5 border-l-4 border-l-primary bg-card/40 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-black text-primary/60">{n}</span>
          <h4 className="font-bold leading-tight">{titulo}</h4>
        </div>
        <span className="ml-auto shrink-0 text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
          {etapa}
        </span>
      </div>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  );
}

// Lista de temas com bullet âmbar (padrão do Brandbook).
function Temas({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

const MATRIZ_EDITORIAL = [
  ["Diagnóstico da Dor", "Atrair atenção qualificada", "Reels, carrossel, post direto", "Diagnóstico gratuito"],
  ["Método das 4 Camadas", "Educar e organizar percepção", "Carrossel, vídeo curto, artigo", "Descobrir camada travada"],
  ["Bastidores e Autoridade", "Criar confiança", "Stories, prints, posts de processo", "Ver estrutura aplicada"],
  ["Prova Social por Segmento", "Converter intenção", "Estudo de caso, antes/depois", "Pedir análise do segmento"],
];

const MATRIZ_5W2H: Array<{ el: string; q: string; d: ReactNode }> = [
  {
    el: "What · O quê",
    q: "Que tipo de conteúdo publicar?",
    d: (
      <>
        Conteúdo de <strong className="text-foreground">estrutura de vendas</strong>, não de "dicas de postagem". Cada peça trata de Presença, Aquisição, Conversão ou Escala.
      </>
    ),
  },
  {
    el: "Who · Quem",
    q: "Para quem foi criado?",
    d: <>Donos de negócio local, liberais e autônomos que vendem pelo WhatsApp, dependem de indicação ou precisam aparecer melhor no Google.</>,
  },
  {
    el: "When · Quando",
    q: "Qual frequência e momento?",
    d: <>Feed 3–4×/semana. Stories diários (bastidores, provas, dúvidas). Calendário do mês seguinte fechado até o dia 20.</>,
  },
  {
    el: "Where · Onde",
    q: "Em quais canais?",
    d: <>Instagram, LinkedIn e Google Meu Negócio. Cada canal adapta o formato, mas mantém a mesma lógica estratégica.</>,
  },
  {
    el: "Why · Por quê",
    q: "Por que precisa existir?",
    d: <>Posicionar a marca como a solução estrutural para quem não precisa de mais posts soltos, mas de um funil comercial funcionando.</>,
  },
  {
    el: "How · Como",
    q: "Como escrever e apresentar?",
    d: (
      <>
        Linguagem <strong className="text-foreground">zero enrolação</strong>, frases curtas, visual clean, prints reais, exemplos práticos, foco em operação comercial.
      </>
    ),
  },
  {
    el: "How Much · Quanto",
    q: "Quanto contribui para o negócio?",
    d: <>Precisa aproximar de ROI, diagnóstico, conversa no WhatsApp ou decisão comercial. Se não gera clareza ou conversão, não entra.</>,
  },
];

const DISTRIBUICAO = [
  ["Segunda", "Dor operacional", "Diagnóstico da Dor"],
  ["Terça", "Bastidor ou print real", "Bastidores e Autoridade"],
  ["Quarta", "Explicação de camada", "Método das 4 Camadas"],
  ["Quinta", "Prova por segmento", "Prova Social"],
  ["Sexta", "Diagnóstico ou CTA direto", "Conversão"],
];

const CHECKLIST = [
  "Fala de uma dor real ou de uma camada do método?",
  "Texto direto, sem jargão e sem enrolação?",
  "Tem um CTA claro (diagnóstico, WhatsApp ou próximo passo)?",
  "Reforça estrutura de vendas, não marketing genérico?",
  "Usa contraste, hierarquia e elementos reais?",
  "Conversa com negócio local e profissional liberal?",
];

export default function ContentGuidelinesSection() {
  return (
    <div className="space-y-14">
      <div>
        <h2 className="text-3xl font-bold mb-2">04. Diretrizes de Conteúdo &amp; Ativação</h2>
        <p className="text-muted-foreground">
          Como a Funil Comercial produz e publica conteúdo — linha editorial e matriz 5W2H. Ferramenta de consulta rápida da equipe. Zero enrolação.
        </p>
      </div>

      {/* Frase-guia (posicionamento) */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex gap-4">
        <Quote className="text-primary shrink-0" size={26} />
        <div>
          <p className="text-lg sm:text-xl font-bold leading-snug text-foreground">
            A Funil Comercial não vende post. Vende o caminho inteiro entre o cliente te encontrar, chamar no WhatsApp e fechar com você.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Ideia central: <strong className="text-foreground">seu concorrente não é melhor que você — ele só tem estrutura.</strong> O problema nunca é talento ou esforço; é presença, aquisição, conversão e escala funcionando juntas.
          </p>
        </div>
      </div>

      {/* ===================== 4.1 PILARES ===================== */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold border-b border-white/10 pb-2">4.1 Pilares da Linha Editorial</h3>
          <p className="text-sm text-muted-foreground mt-3">
            Não publicamos marketing genérico. Todo conteúdo mostra <strong className="text-foreground">estrutura, processo, diagnóstico e ação comercial</strong>.
          </p>
        </div>

        {/* Evitar / Priorizar */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/5 bg-card p-6">
            <div className="flex items-center gap-2 text-red-500 mb-4">
              <X size={18} />
              <h4 className="font-bold">Evitar</h4>
            </div>
            <Temas
              items={[
                "Dicas de postagem",
                "Frases motivacionais soltas",
                "Tendência sem relação com venda",
                "Criativo bonito sem função comercial",
                "Jargão de agência",
              ]}
            />
          </div>
          <div className="rounded-2xl border border-white/5 bg-card p-6">
            <div className="flex items-center gap-2 text-green-500 mb-4">
              <CheckCircle2 size={18} />
              <h4 className="font-bold">Priorizar</h4>
            </div>
            <Temas
              items={[
                "Diagnóstico de gargalos reais",
                "As 4 camadas do método",
                "Bastidores da operação",
                "Prova social por segmento",
                "CTA para diagnóstico no WhatsApp",
              ]}
            />
          </div>
        </div>

        {/* Os 4 pilares */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Pilar n="PILAR 01" icon={<Stethoscope size={18} />} titulo="O Diagnóstico da Dor" etapa="Atração">
            <p>
              <strong className="text-foreground">Função:</strong> atrair donos de negócio local que sentem o caos mas ainda não sabem nomear o problema.
            </p>
            <p>
              <strong className="text-foreground">Ângulo:</strong> não vende menos por falta de qualidade — vende menos por falta de estrutura comercial clara.
            </p>
            <Temas
              items={[
                "Seu WhatsApp virou gaveta de oportunidades perdidas.",
                "Impulsionar botão sem estrutura é queimar dinheiro.",
                "O concorrente aparece primeiro porque organizou a presença antes.",
                "Lead sem acompanhamento vira orçamento esquecido.",
              ]}
            />
            <p className="text-primary font-semibold pt-1">→ CTA: diagnóstico gratuito no WhatsApp.</p>
          </Pilar>

          <Pilar n="PILAR 02" icon={<Layers size={18} />} titulo="O Método das 4 Camadas" etapa="Educação">
            <p>
              <strong className="text-foreground">Função:</strong> transformar um problema confuso em um plano claro — a engrenagem da estrutura de vendas.
            </p>
            <Temas
              items={[
                "Presença: site, Google Meu Negócio e primeira impressão digital.",
                "Aquisição: tráfego pago e campanhas para gerar demanda real.",
                "Conversão: CRM, WhatsApp organizado, contatos, leads e funil.",
                "Escala: IA, automações, rotina comercial e triagem inteligente.",
              ]}
            />
            <p className="text-primary font-semibold pt-1">→ CTA: descobrir qual camada está travando as vendas.</p>
          </Pilar>

          <Pilar n="PILAR 03" icon={<Camera size={18} />} titulo="Bastidores e Autoridade" etapa="Conexão">
            <p>
              <strong className="text-foreground">Função:</strong> mostrar que a Funil Comercial usa a própria estrutura que vende. Quem monta a estrutura, usa a estrutura.
            </p>
            <Temas
              items={[
                "Bastidores e telas reais do CRM Funil Comercial.",
                "Decisões de produto (WhatsApp, leads, oportunidades).",
                "Rotina de prospecção ativa estruturada.",
              ]}
            />
            <p className="text-xs text-muted-foreground/80 pt-1">
              Regra: todo bastidor precisa ensinar algo sobre estrutura — nada de bastidor vazio.
            </p>
            <p className="text-primary font-semibold">→ CTA: ver como aplicar essa estrutura no negócio do lead.</p>
          </Pilar>

          <Pilar n="PILAR 04" icon={<BadgeCheck size={18} />} titulo="Prova Social por Segmento" etapa="Conversão">
            <p>
              <strong className="text-foreground">Função:</strong> transformar interesse em intenção com exemplos específicos (antes/depois por tipo de negócio).
            </p>
            <div className="flex flex-wrap gap-2">
              {["Clínicas", "Advogados", "Contadores", "Beleza & estética", "Serviços da casa", "Comércio local", "Autônomos"].map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-lg border border-white/5 bg-white/5 text-xs font-medium text-foreground">
                  {s}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/80 pt-1">
              Formato: diagnóstico → gargalo → camada aplicada → mudança estrutural → próximo passo.
            </p>
            <p className="text-primary font-semibold">→ CTA: solicitar uma análise do próprio segmento.</p>
          </Pilar>
        </div>

        {/* Matriz editorial rápida */}
        <div className="rounded-2xl border border-white/5 bg-card/30 p-2 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Pilar</th>
                <th className="px-4 py-3 font-semibold">Objetivo</th>
                <th className="px-4 py-3 font-semibold">Formato ideal</th>
                <th className="px-4 py-3 font-semibold">CTA principal</th>
              </tr>
            </thead>
            <tbody>
              {MATRIZ_EDITORIAL.map(([pilar, obj, fmt, cta]) => (
                <tr key={pilar} className="border-t border-white/5">
                  <td className="px-4 py-3 font-semibold text-foreground">{pilar}</td>
                  <td className="px-4 py-3 text-muted-foreground">{obj}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmt}</td>
                  <td className="px-4 py-3 text-primary font-medium">{cta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== 4.2 MATRIZ 5W2H ===================== */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold border-b border-white/10 pb-2">4.2 Matriz de Publicação 5W2H</h3>
          <p className="text-sm text-muted-foreground mt-3">
            Cada publicação é um checklist de clareza comercial. Responda os 7 antes de produzir. Objetivo não é volume — é fortalecer o posicionamento.
          </p>
        </div>

        {/* Tabela 5W2H */}
        <div className="rounded-2xl border border-white/5 bg-card/30 p-2 overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-semibold w-40">Elemento</th>
                <th className="px-4 py-3 font-semibold w-56">Pergunta-chave</th>
                <th className="px-4 py-3 font-semibold">Diretriz Funil Comercial</th>
              </tr>
            </thead>
            <tbody>
              {MATRIZ_5W2H.map((row) => (
                <tr key={row.el} className="border-t border-white/5 align-top">
                  <td className="px-4 py-3 font-bold text-primary whitespace-nowrap">{row.el}</td>
                  <td className="px-4 py-3 text-foreground">{row.q}</td>
                  <td className="px-4 py-3 text-muted-foreground leading-relaxed">{row.d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Distribuição semanal */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] items-start">
          <div className="rounded-2xl border border-white/5 bg-card/30 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-primary" />
              <h4 className="font-bold">Ritmo de publicação</h4>
            </div>
            <Temas
              items={[
                "Feed: 3 a 4 publicações por semana.",
                "Stories: todos os dias úteis.",
                "Calendário do mês seguinte fechado até o dia 20.",
                "Revisão semanal focada em conversas iniciadas no WhatsApp.",
              ]}
            />
          </div>

          <div className="rounded-2xl border border-white/5 bg-card/30 p-2 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Dia</th>
                  <th className="px-4 py-3 font-semibold">Conteúdo</th>
                  <th className="px-4 py-3 font-semibold">Pilar</th>
                </tr>
              </thead>
              <tbody>
                {DISTRIBUICAO.map(([dia, tipo, pilar]) => (
                  <tr key={dia} className="border-t border-white/5">
                    <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{dia}</td>
                    <td className="px-4 py-3 text-muted-foreground">{tipo}</td>
                    <td className="px-4 py-3 text-primary font-medium">{pilar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Checklist rápido antes de publicar */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-1">
            <ListChecks className="text-primary" size={20} />
            <h4 className="text-lg font-bold">Checklist rápido antes de publicar</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Pergunta de aprovação: <em className="text-foreground">"Este conteúdo ajuda alguém a entender por que precisa de estrutura de vendas agora?"</em> Se a resposta for não, revise antes de publicar.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm">
            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <span className="text-muted-foreground">
              <strong className="text-red-400">Nunca publicar</strong> com dado inventado, promessa exagerada ou prova social não validada.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
