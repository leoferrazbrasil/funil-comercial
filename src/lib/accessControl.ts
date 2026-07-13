import type { Profile, Route as AppRoute } from "./types";

export type CommercialRole = Profile["role"];

type PrivateRoute = Exclude<AppRoute, "login">;

// Permissão por ÁREA (não por papel solto). "Comercial" é o time de vendas;
// "Marketing" são os módulos do operador técnico (admin). Assim, adicionar um
// futuro perfil (ex.: social_media → só marketing) é trivial.
const AREA_ROUTES = {
  comercial: ["dashboard", "inbox", "contatos", "leads", "funil"],
  marketing: ["campanhas", "criativos", "roteiro", "agregadores"],
} satisfies Record<string, PrivateRoute[]>;

type Area = keyof typeof AREA_ROUTES;

// Papéis → áreas visíveis. admin = operador técnico (comercial + marketing);
// gestor/vendedor = área comercial apenas.
const roleAreas: Record<CommercialRole, Area[]> = {
  admin: ["comercial", "marketing"],
  gestor: ["comercial"],
  vendedor: ["comercial"],
};

export function getAllowedRoutes(role?: CommercialRole | null): PrivateRoute[] {
  const areas = roleAreas[role ?? "gestor"] ?? roleAreas.gestor;
  return areas.flatMap((area) => AREA_ROUTES[area]);
}

export function isRouteAllowed(
  role: CommercialRole | null | undefined,
  route: PrivateRoute,
) {
  return getAllowedRoutes(role).includes(route);
}

export function canCreateCommercialRecord(role?: CommercialRole | null) {
  return role === "admin" || role === "gestor" || role === "vendedor";
}
