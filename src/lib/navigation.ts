import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  ContactRound,
  Inbox,
  LayoutDashboard,
  UsersRound,
  Palette,
} from "lucide-react";
import type { OpportunityStage, Route as AppRoute } from "./types";

export type NavigationItem = {
  id: Exclude<AppRoute, "login">;
  label: string;
  icon: LucideIcon;
  description: string;
};

export const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Visão executiva da operação comercial.",
  },
  {
    id: "inbox",
    label: "Inbox",
    icon: Inbox,
    description: "Conversas recebidas pelo WhatsApp e canais digitais.",
  },
  {
    id: "contatos",
    label: "Contatos",
    icon: ContactRound,
    description: "Base organizada de pessoas e empresas.",
  },
  {
    id: "leads",
    label: "Leads",
    icon: UsersRound,
    description: "Interessados em qualificação comercial.",
  },
  {
    id: "funil",
    label: "Funil de vendas",
    icon: BriefcaseBusiness,
    description: "Oportunidades por etapa do pipeline.",
  },
  {
    id: "criativos",
    label: "Criativos",
    icon: Palette,
    description: "Gerador de artes para Social Media.",
  },
];

export const pipelineStages: OpportunityStage[] = [
  "Novo",
  "Em atendimento",
  "Qualificado",
  "Proposta",
  "Negociação",
  "Ganho",
  "Perdido",
];
