import { requireSupabase } from "./supabase";

// Exportação de conversões do CRM no formato "Offline event data import" do GA4 (Web).
// Schema EXATO (confirmado na doc do Google e pelo próprio erro do GA4):
//   measurement_id, client_id, event_name, timestamp_micros,
//   event_param.value, event_param.currency
// - measurement_id: OBRIGATÓRIO (ID do fluxo de dados web).
// - client_id: obrigatório; só é preenchido quando a captura do cookie `_ga` existir.
//   Hoje o site é WhatsApp-first (sem form web) → sai VAZIO e o GA4 rejeita a linha.
// - parâmetros de evento usam o prefixo `event_param.` (ex.: event_param.value).
// - janela: o GA4 aceita apenas eventos recentes (~72h) — não serve para backfill.

// Measurement ID do fluxo web — o MESMO do gtag em index.html (G-NSMD6MKLMK).
// Se mudar lá, mudar aqui.
const GA4_MEASUREMENT_ID = "G-NSMD6MKLMK";
const GA4_WINDOW_MS = 72 * 60 * 60 * 1000;

export type Ga4Opp = {
  valor?: number | null;
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
  measurementId: string;
  clientId: string;
  eventName: string;
  timestampMicros: string;
  value: string;
  currency: string;
};

// Ordem e cabeçalho EXATOS das colunas do CSV do GA4 (desacoplados dos campos
// internos porque `event_param.value` não é um identificador JS válido).
const GA4_COLUMNS: Array<{ header: string; get: (r: Ga4Row) => string }> = [
  { header: "measurement_id", get: (r) => r.measurementId },
  { header: "client_id", get: (r) => r.clientId },
  { header: "event_name", get: (r) => r.eventName },
  { header: "timestamp_micros", get: (r) => r.timestampMicros },
  { header: "event_param.value", get: (r) => r.value },
  { header: "event_param.currency", get: (r) => r.currency },
];

// Unix timestamp em MICROSSEGUNDOS (ms × 1000).
const toMicros = (iso?: string | null): string => {
  const ms = iso ? new Date(iso).getTime() : NaN;
  return Number.isFinite(ms) ? String(ms * 1000) : "";
};

const toMoney = (v?: number | null): string =>
  (typeof v === "number" && Number.isFinite(v) ? v : 0).toFixed(2);

export function buildGa4Rows(input: Ga4ConversionInput): Ga4Row[] {
  const rows: Ga4Row[] = [];

  // Oportunidades ganhas → offline_sale (evento de dinheiro, com value + currency).
  for (const o of input.opportunities) {
    rows.push({
      measurementId: GA4_MEASUREMENT_ID,
      clientId: o.ga_client_id?.trim() || "",
      eventName: "offline_sale",
      timestampMicros: toMicros(o.created_at),
      value: toMoney(o.valor),
      currency: "BRL",
    });
  }

  // Leads qualificados → qualified_lead.
  for (const l of input.leads) {
    rows.push({
      measurementId: GA4_MEASUREMENT_ID,
      clientId: l.ga_client_id?.trim() || "",
      eventName: "qualified_lead",
      timestampMicros: toMicros(l.created_at),
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
    if (r.clientId) s.withClientId += 1;
    const ts = Number(r.timestampMicros);
    if (Number.isFinite(ts) && ts >= cutoff) s.within72h += 1;
    if (r.eventName === "offline_sale") s.offlineSale += 1;
    else if (r.eventName === "qualified_lead") s.qualifiedLead += 1;
  }
  return s;
}

const csvCell = (v: string): string =>
  /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;

export function toGa4Csv(rows: Ga4Row[]): string {
  const header = GA4_COLUMNS.map((c) => c.header).join(",");
  if (rows.length === 0) return `${header}\n`;
  const body = rows
    .map((r) => GA4_COLUMNS.map((c) => csvCell(c.get(r))).join(","))
    .join("\n");
  return `${header}\n${body}\n`;
}

// Busca as conversões do owner logado (RLS aplica o escopo). `opportunities` não tem
// `updated_at`; usamos `created_at`. `ga_client_id` ainda não existe (captura futura).
export async function fetchGa4Conversions(): Promise<Ga4ConversionInput> {
  const supabase = requireSupabase();
  const [opps, leads] = await Promise.all([
    supabase.from("opportunities").select("id, valor, created_at").eq("etapa", "Ganho"),
    supabase.from("leads").select("id, valor_estimado, created_at").eq("status", "qualificado"),
  ]);
  if (opps.error) throw opps.error;
  if (leads.error) throw leads.error;
  return {
    opportunities: (opps.data ?? []) as unknown as Ga4Opp[],
    leads: (leads.data ?? []) as unknown as Ga4Lead[],
  };
}
