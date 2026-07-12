import type { LucideIcon } from "lucide-react";
import { Target, PenTool, Lightbulb, Star } from "lucide-react";

// Registro ÚNICO dos pilares editoriais (Brandbook 04 → 4.1). Fonte compartilhada
// pelo estúdio (/criativos) e pelo roteiro (/roteiro): mantém nome, objetivo,
// etapa, CTA e ícone em sincronia. No Brandbook, objetivo e pilar são 1:1.
export type PillarId = "dor" | "bastidores" | "metodo" | "prova";

export type EditorialPillar = {
  id: PillarId;
  name: string;
  objetivo: string;
  objetivoId: string; // vai no body das Edge Functions de IA (Fase B)
  etapa: string;
  cta: string;
  desc: string;
  icon: LucideIcon;
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
