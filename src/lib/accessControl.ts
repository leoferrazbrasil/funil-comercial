import type { Profile, Route as AppRoute } from "./types";

export type CommercialRole = Profile["role"];

const roleRoutes: Record<CommercialRole, Array<Exclude<AppRoute, "login">>> = {
  diretor: ["dashboard", "inbox", "contatos", "leads", "funil", "campanhas", "criativos", "roteiro"],
  gestor: ["dashboard", "inbox", "contatos", "leads", "funil", "campanhas", "criativos", "roteiro"],
  vendedor: ["dashboard", "inbox", "contatos", "leads", "funil", "campanhas"],
};

export function getAllowedRoutes(role?: CommercialRole | null) {
  return roleRoutes[role ?? "gestor"];
}

export function canCreateCommercialRecord(role?: CommercialRole | null) {
  return role === "diretor" || role === "gestor" || role === "vendedor";
}
