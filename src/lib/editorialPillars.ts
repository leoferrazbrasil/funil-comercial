import type { LucideIcon } from "lucide-react";
import { Target, PenTool, Lightbulb, Star } from "lucide-react";

// Registro ÚNICO dos pilares editoriais (Brandbook 04 → 4.1). Fonte compartilhada
// pelo estúdio (/criativos) e pelo roteiro (/roteiro): mantém nome, objetivo,
// etapa, CTA e ícone em sincronia. No Brandbook, objetivo e pilar são 1:1.
export type PillarId = "dor" | "bastidores" | "metodo" | "prova";

/** Um tema pronto: `titulo` é o gancho (vira a headline) e `apoio` é o texto de
 *  apoio próprio do tema (vira a subheadline) — evita subheadline repetida. */
export type EditorialTheme = {
  titulo: string;
  apoio: string;
};

export type EditorialPillar = {
  id: PillarId;
  name: string;
  objetivo: string;
  objetivoId: string; // vai no body das Edge Functions de IA (Fase B)
  etapa: string;
  cta: string;
  desc: string;
  icon: LucideIcon;
  /** Temas prontos (Brandbook 04 → Linha Editorial 4.1) — "o conteúdo a postar",
   *  apresentados no Passo 2 do estúdio para eliminar a "página em branco". */
  temas: EditorialTheme[];
};

// A ORDEM do array é a rotação da 4.2 ("When"): Dor → Bastidores → Método → Prova.
export const EDITORIAL_PILLARS: EditorialPillar[] = [
  {
    id: "dor",
    name: "Diagnóstico da Dor",
    objetivo: "Atrair",
    objetivoId: "atrair",
    etapa: "Atração",
    desc: "Agita uma dor operacional real para atrair quem sente o caos, mas ainda não sabe nomeá-lo.",
    cta: "Peça um diagnóstico gratuito no WhatsApp.",
    icon: Target,
    temas: [
      {
        titulo: "Seu WhatsApp está virando uma gaveta de oportunidades perdidas.",
        apoio: "Sem processo de atendimento, cada lead sem resposta vira venda que foi para o concorrente.",
      },
      {
        titulo: "Impulsionar botão sem estrutura é queimar dinheiro com aparência de marketing.",
        apoio: "O anúncio traz gente; sem funil para receber, o investimento evapora sem virar cliente.",
      },
      {
        titulo: "Seu concorrente aparece primeiro porque organizou a presença digital antes de você.",
        apoio: "Google, perfil e site alinhados fazem o cliente te encontrar na hora da decisão.",
      },
      {
        titulo: "Lead sem acompanhamento vira orçamento esquecido.",
        apoio: "Um CRM simples lembra de cada follow-up para nenhuma proposta morrer no vácuo.",
      },
      {
        titulo: "O cliente não espera sua rotina ficar tranquila para decidir comprar.",
        apoio: "Enquanto você resolve o operacional, a estrutura atende e qualifica por você.",
      },
    ],
  },
  {
    id: "bastidores",
    name: "Bastidores & Autoridade",
    objetivo: "Autoridade",
    objetivoId: "posicionar",
    etapa: "Conexão",
    desc: "Mostra a própria estrutura em ação — bastidor real, sem teatro.",
    cta: "Veja como aplicar essa estrutura no seu negócio.",
    icon: PenTool,
    temas: [
      {
        titulo: "Bastidores do CRM: como organizamos WhatsApp, leads e oportunidades.",
        apoio: "Um lugar só para conversar, registrar e acompanhar cada negócio até o fechamento.",
      },
      {
        titulo: "Prints e fluxos reais da operação — o método em ação.",
        apoio: "Sem teatro: o passo a passo que transforma contato solto em venda previsível.",
      },
      {
        titulo: "Rotina de prospecção ativa estruturada, sem improviso.",
        apoio: "Cadência definida de contatos para o pipeline nunca ficar vazio.",
      },
      {
        titulo: "Um diagnóstico real (sem expor dados): o que trava a venda de um negócio.",
        apoio: "Quase sempre o problema não é o produto — é a estrutura que leva até a compra.",
      },
      {
        titulo: "Aprendizados práticos de vendas para negócio local.",
        apoio: "O que funciona no dia a dia de quem vende no bairro, não teoria de palco.",
      },
    ],
  },
  {
    id: "metodo",
    name: "Método das 4 Camadas",
    objetivo: "Educar",
    objetivoId: "educar",
    etapa: "Educação",
    desc: "Explica uma camada do método: Presença, Aquisição, Conversão ou Escala.",
    cta: "Descubra qual camada está travando as vendas.",
    icon: Lightbulb,
    temas: [
      {
        titulo: "Antes de anunciar, arrume onde o cliente vai cair.",
        apoio: "Presença: perfil, site e Google prontos para receber quem clica no anúncio.",
      },
      {
        titulo: "Google Meu Negócio é vitrine comercial, não cadastro decorativo.",
        apoio: "Bem configurado, ele aparece na busca local e traz cliente pronto para comprar.",
      },
      {
        titulo: "CRM não é burocracia — é memória comercial.",
        apoio: "Cada contato, histórico e próximo passo registrados para nada se perder.",
      },
      {
        titulo: "WhatsApp sem processo parece atendimento, mas vira perda de venda.",
        apoio: "Com fluxo e responsáveis definidos, a conversa vira conversão.",
      },
      {
        titulo: "IA não substitui venda: ela tira o peso da triagem repetitiva.",
        apoio: "Automatize a primeira resposta e a qualificação; o time foca em fechar.",
      },
    ],
  },
  {
    id: "prova",
    name: "Prova Social por Segmento",
    objetivo: "Converter",
    objetivoId: "vender",
    etapa: "Conversão",
    desc: "Prova por segmento (antes/depois, diagnóstico) para converter a intenção.",
    cta: "Solicite uma análise do seu segmento.",
    icon: Star,
    temas: [
      {
        titulo: "Como um consultório de fisioterapia organiza o WhatsApp e para de perder pacientes.",
        apoio: "Agendamentos e retornos acompanhados de perto, sem mensagem esquecida.",
      },
      {
        titulo: "Como um nutricionista aparece melhor no Google sem depender só de indicação.",
        apoio: "Presença digital estruturada trazendo pacientes particulares de forma constante.",
      },
      {
        titulo: "Como um contador transforma contatos soltos em oportunidades acompanhadas.",
        apoio: "Cada lead em uma etapa clara do funil, do primeiro contato ao fechamento.",
      },
      {
        titulo: "Como um estúdio usa site, Google e WhatsApp numa jornada simples.",
        apoio: "Do descobrir ao agendar, sem fricção — o cliente flui até a compra.",
      },
    ],
  },
];

export const getPillarById = (id?: string | null): EditorialPillar | undefined =>
  EDITORIAL_PILLARS.find((p) => p.id === id);

export const getPillarByName = (name?: string | null): EditorialPillar | undefined =>
  EDITORIAL_PILLARS.find((p) => p.name === name);

// Próximo pilar do ciclo a partir do id; sem id/ inválido (fila vazia) → o primeiro (Dor).
export function nextPillarAfter(id?: PillarId | string | null): EditorialPillar {
  const idx = EDITORIAL_PILLARS.findIndex((p) => p.id === id);
  if (idx === -1) return EDITORIAL_PILLARS[0];
  return EDITORIAL_PILLARS[(idx + 1) % EDITORIAL_PILLARS.length];
}
