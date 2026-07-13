import type { LucideIcon } from "lucide-react";
import { RectangleHorizontal, Briefcase, Play, AtSign, MessageCircle, UserRound, Sparkles } from "lucide-react";

// Registro ÚNICO das peças de marca do Estúdio de Peças (/pecas). Cada peça define
// dimensão exata, proporção, área segura e (quando houver) a zona da foto de perfil
// a evitar — tudo em px na resolução real. As guias derivam daqui.
export type SafeShape = "rect" | "circle";

export type ProfileZone = {
  x: number; // px (canto superior-esquerdo)
  y: number;
  w: number;
  h: number;
  label: string;
};

export type SocialPiece = {
  id: string;
  platform: string;
  name: string;
  icon: LucideIcon;
  width: number;
  height: number;
  ratioLabel: string;
  /** "cover" = retangular (logo + tagline); "profile" = quadrado, seguro p/ recorte. */
  art: "cover" | "profile";
  safeShape: SafeShape;
  /** Área segura centralizada. Em círculo, safeW = safeH = diâmetro. */
  safeW: number;
  safeH: number;
  /** Zona da foto de perfil/avatar a EVITAR (guia vermelha), quando a plataforma sobrepõe. */
  profileZone?: ProfileZone;
  notes: string;
};

export const SOCIAL_PIECES: SocialPiece[] = [
  {
    id: "facebook-capa",
    platform: "Facebook",
    name: "Capa",
    icon: RectangleHorizontal,
    width: 820,
    height: 360,
    ratioLabel: "2,28 : 1",
    art: "cover",
    safeShape: "rect",
    safeW: 640,
    safeH: 312,
    profileZone: { x: 24, y: 176, w: 168, h: 168, label: "Foto de perfil — evitar" },
    notes:
      "No desktop o Facebook corta 24 px em cima e embaixo (mostra 820 × 312); no celular estica e esconde as laterais (mostra 640 × 360). Tudo que importa está centralizado na área segura, longe do canto da foto do perfil.",
  },
  {
    id: "perfil-1x1",
    platform: "Perfil (universal)",
    name: "Foto de perfil",
    icon: UserRound,
    width: 1080,
    height: 1080,
    ratioLabel: "1 : 1",
    art: "profile",
    safeShape: "circle",
    safeW: 972,
    safeH: 972,
    notes:
      "Instagram, Facebook e WhatsApp recortam a foto de perfil em CÍRCULO. Mantenha o ícone/marca dentro do círculo central (guia dourada) — os cantos do quadrado somem no recorte.",
  },
  {
    id: "linkedin-capa",
    platform: "LinkedIn",
    name: "Capa do perfil",
    icon: Briefcase,
    width: 1584,
    height: 396,
    ratioLabel: "4 : 1",
    art: "cover",
    safeShape: "rect",
    safeW: 1350,
    safeH: 240,
    profileZone: { x: 96, y: 236, w: 160, h: 160, label: "Foto de perfil — evitar" },
    notes:
      "A imagem de fundo do LinkedIn é bem larga e baixa. A foto de perfil fica no canto inferior esquerdo e cobre parte da capa — deixe essa área livre. O corte varia entre desktop e celular; mantenha logo e frase no centro.",
  },
  {
    id: "whatsapp-perfil",
    platform: "WhatsApp Business",
    name: "Foto de perfil",
    icon: MessageCircle,
    width: 640,
    height: 640,
    ratioLabel: "1 : 1",
    art: "profile",
    safeShape: "circle",
    safeW: 576,
    safeH: 576,
    notes:
      "O WhatsApp recorta em círculo. Centralize o ícone do funil dentro do círculo (guia dourada). Fundo grafite garante contraste na lista de conversas.",
  },
  {
    id: "youtube-banner",
    platform: "YouTube",
    name: "Banner do canal",
    icon: Play,
    width: 2560,
    height: 1440,
    ratioLabel: "16 : 9",
    art: "cover",
    safeShape: "rect",
    safeW: 1546,
    safeH: 423,
    notes:
      "O YouTube mostra tamanhos diferentes por dispositivo. Só a faixa central de 1546 × 423 (a 'área para todos os dispositivos', guia dourada) aparece em TODOS. Deixe logo e frase 100% dentro dela; o resto é sangria.",
  },
  {
    id: "x-capa",
    platform: "X / Twitter",
    name: "Capa (header)",
    icon: AtSign,
    width: 1500,
    height: 500,
    ratioLabel: "3 : 1",
    art: "cover",
    safeShape: "rect",
    safeW: 1400,
    safeH: 360,
    profileZone: { x: 60, y: 320, w: 180, h: 180, label: "Avatar — evitar" },
    notes:
      "O avatar circular fica sobre o canto inferior esquerdo do header, e a interface cobre as bordas. Mantenha o essencial no centro, longe do canto do avatar.",
  },
  {
    id: "story-destaque",
    platform: "Instagram",
    name: "Capa de destaque (Story)",
    icon: Sparkles,
    width: 1080,
    height: 1920,
    ratioLabel: "9 : 16",
    art: "profile",
    safeShape: "circle",
    safeW: 620,
    safeH: 620,
    notes:
      "A capa do destaque recorta um CÍRCULO do centro do Story. Coloque só o ícone do funil bem no meio (guia dourada) — texto e detalhes fora desse círculo somem na capa do destaque.",
  },
];

export const getPieceById = (id?: string | null): SocialPiece | undefined =>
  SOCIAL_PIECES.find((p) => p.id === id);
