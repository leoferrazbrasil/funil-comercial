import { requireSupabase } from "./supabase";

// Exportação de conversões do CRM no formato de "Offline event data import" do GA4.
// Schema EXATO exigido pelo GA4: client_id, event_name, timestamp_micros, value, currency.
//
// ⚠️ client_id: só é preenchido quando a captura do cookie `_ga` num formulário web
// existir. Hoje o site é WhatsApp-first (sem form), então sai VAZIO — e o GA4 rejeita
// linhas sem client_id. A exportação só fica válida DEPOIS que a captura existir.
// ⚠️ Janela: o GA4 aceita apenas eventos das ÚLTIMAS 72h (não serve para backfill).

export type Ga4Opp = {
  valor?: number | null;
  updated_at?: string | null;
  created_at?: string | null;
  ga_client_id?: string | null;
};

export type Ga4Lead = {
  valor_estimado?: number | null;
  created_at?: string | null;
  ga_client_id?: string | null;
};

export type Ga4ConversionInput = { opportunities: Ga4Opp[]; leads: Ga4Lead[] };

export type Ga4Row = {
  client_id: string;
  event_name: string;
  timestamp_micros: string;
  value: string;
  currency: string;
};

export const GA4_CSV_HEADER = [
  "client_id",
  "event_name",
  "timestamp_micros",
  "value",
  "currency",
] as const;

const GA4_WINDOW_MS = 72 * 60 * 60 * 1000;

// Unix timestamp em MICROSSEGUNDOS (ms × 1000), como o GA4 exige.
const toMicros = (iso?: string | null): string => {
  const ms = iso ? new Date(iso).getTime() : NaN;
  return Number.isFinite(ms) ? String(ms * 1000) : "";
};

const toMoney = (v?: number | null): string =>
  (typeof v === "number" && Number.isFinite(v) ? v : 0).toFixed(2);

export function buildGa4Rows(input: Ga4ConversionInput): Ga4Row[] {
  const rows: Ga4Row[] = [];

  // Oportunidades ganhas → offline_sale (o evento de dinheiro; puxa o Google Ads
  // a otimizar por LUCRO, via value + currency).
  for (const o of input.opportunities) {
    rows.push({
      client_id: o.ga_client_id?.trim() || "",
      event_name: "offline_sale",
      timestamp_micros: toMicros(o.updated_at ?? o.created_at),
      value: toMoney(o.valor),
      currency: "BRL",
    });
  }

  // Leads qualificados → qualified_lead.
  for (const l of input.leads) {
    rows.push({
      client_id: l.ga_client_id?.trim() || "",
      event_name: "qualified_lead",
      timestamp_micros: toMicros(l.created_at),
      value: toMoney(l.valor_estimado),
      currency: "BRL",
    });
  }

  return rows;
}

export type Ga4Summary = {
  total: number;
  offlineSale: number;
  qualifiedLead: number;
  withClientId: number;
  within72h: number;
};

export function summarizeGa4Rows(rows: Ga4Row[], now = Date.now()): Ga4Summary {
  const cutoff = (now - GA4_WINDOW_MS) * 1000;
  const s: Ga4Summary = {
    total: rows.length,
    offlineSale: 0,
    qualifiedLead: 0,
    withClientId: 0,
    within72h: 0,
  };
  for (const r of rows) {
    if (r.client_id) s.withClientId += 1;
    const ts = Number(r.timestamp_micros);
    if (Number.isFinite(ts) && ts >= cutoff) s.within72h += 1;
    if (r.event_name === "offline_sale") s.offlineSale += 1;
    else if (r.event_name === "qualified_lead") s.qualifiedLead += 1;
  }
  return s;
}

const csvCell = (v: string): string =>
  /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;

export function toGa4Csv(rows: Ga4Row[]): string {
  const header = GA4_CSV_HEADER.join(",");
  if (rows.length === 0) return `${header}\n`;
  const body = rows
    .map((r) => GA4_CSV_HEADER.map((k) => csvCell(r[k])).join(","))
    .join("\n");
  return `${header}\n${body}\n`;
}

// Busca as conversões do owner logado (RLS aplica o escopo automaticamente).
// NOTA: não selecionamos `ga_client_id` porque a coluna ainda não existe (a captura
// virá depois). Quando existir, adicionar ao select — o restante já está pronto.
export async function fetchGa4Conversions(): Promise<Ga4ConversionInput> {
  const supabase = requireSupabase();
  const [opps, leads] = await Promise.all([
    supabase
      .from("opportunities")
      .select("id, valor, updated_at, created_at")
      .eq("etapa", "Ganho"),
    supabase
      .from("leads")
      .select("id, valor_estimado, created_at")
      .eq("status", "qualificado"),
  ]);
  if (opps.error) throw opps.error;
  if (leads.error) throw leads.error;
  return {
    opportunities: (opps.data ?? []) as unknown as Ga4Opp[],
    leads: (leads.data ?? []) as unknown as Ga4Lead[],
  };
}
