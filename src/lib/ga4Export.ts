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

const isMissingColumn = (err: { code?: string; message?: string } | null): boolean => {
  if (!err) return false;
  return (
    err.code === "42703" ||
    err.code === "PGRST204" ||
    /column .* does not exist|could not find the .* column/i.test(err.message ?? "")
  );
};

const extractLeadClientId = (leads: unknown): string | null => {
  if (!leads) return null;
  const rec = Array.isArray(leads) ? leads[0] : leads;
  const id = (rec as { ga_client_id?: unknown } | null)?.ga_client_id;
  return typeof id === "string" && id ? id : null;
};

// Tipo comum pros dois selects (o "rico" com ga_client_id e o fallback sem).
type QueryRes = {
  data: unknown[] | null;
  error: { code?: string; message?: string } | null;
};

// Busca as conversões do owner (RLS aplica o escopo). Traz o `ga_client_id`: direto no
// lead (qualified_lead) e via lead vinculado na oportunidade (offline_sale). Degrada com
// elegância se a coluna ainda não existir (migração leads_ga_client_id não aplicada).
// NOTA: `opportunities` não tem `updated_at`; usamos `created_at`.
export async function fetchGa4Conversions(): Promise<Ga4ConversionInput> {
  const supabase = requireSupabase();

  // Leads qualificados (com ga_client_id se a coluna existir).
  let leadsRes: QueryRes = await supabase
    .from("leads")
    .select("id, valor_estimado, created_at, ga_client_id")
    .eq("status", "qualificado");
  if (leadsRes.error && isMissingColumn(leadsRes.error)) {
    leadsRes = await supabase
      .from("leads")
      .select("id, valor_estimado, created_at")
      .eq("status", "qualificado");
  }
  if (leadsRes.error) throw leadsRes.error;

  // Oportunidades ganhas (client_id via lead vinculado). Fallback amplo: se o join
  // falhar (coluna/relacionamento ausente), busca sem ele.
  let oppsRes: QueryRes = await supabase
    .from("opportunities")
    .select("id, valor, created_at, leads(ga_client_id)")
    .eq("etapa", "Ganho");
  if (oppsRes.error) {
    oppsRes = await supabase
      .from("opportunities")
      .select("id, valor, created_at")
      .eq("etapa", "Ganho");
  }
  if (oppsRes.error) throw oppsRes.error;

  const leadsData = (leadsRes.data ?? []) as Array<Record<string, unknown>>;
  const oppsData = (oppsRes.data ?? []) as Array<Record<string, unknown>>;

  return {
    opportunities: oppsData.map((o) => ({
      valor: (o.valor as number | null) ?? null,
      created_at: (o.created_at as string | null) ?? null,
      ga_client_id: extractLeadClientId(o.leads),
    })),
    leads: leadsData.map((l) => ({
      valor_estimado: (l.valor_estimado as number | null) ?? null,
      created_at: (l.created_at as string | null) ?? null,
      ga_client_id:
        typeof l.ga_client_id === "string" && l.ga_client_id ? l.ga_client_id : null,
    })),
  };
}
