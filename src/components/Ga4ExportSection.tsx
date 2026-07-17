import { useState } from "react";
import { Download, BarChart3, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchGa4Conversions,
  buildGa4Rows,
  toGa4Csv,
  summarizeGa4Rows,
} from "../lib/ga4Export";

// Configurações → Exportar conversões para o GA4 (formato de importação de eventos
// offline). Gera o CSV com o schema exato do GA4 a partir das oportunidades ganhas
// (offline_sale) e leads qualificados (qualified_lead).
export function Ga4ExportSection() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await fetchGa4Conversions();
      const rows = buildGa4Rows(data);
      if (rows.length === 0) {
        toast(
          "Nenhuma conversão para exportar ainda (oportunidades ganhas ou leads qualificados).",
        );
        return;
      }

      const summary = summarizeGa4Rows(rows);
      const csv = toGa4Csv(rows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `ga4-conversoes-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      toast.success(
        `${summary.total} conversões exportadas (${summary.offlineSale} vendas · ${summary.qualifiedLead} leads) — ${summary.withClientId} com client_id.`,
      );
    } catch (error) {
      console.error("[Ga4ExportSection] export falhou", error);
      toast.error("Não foi possível exportar as conversões.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center border border-primary/20 shrink-0">
          <BarChart3 size={18} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Exportar conversões (Google Analytics 4)
          </h3>
          <p className="text-sm text-muted-foreground">
            Gera um CSV no formato de importação de eventos offline do GA4.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-60"
      >
        <Download size={16} />
        {loading ? "Gerando…" : "Exportar CSV (GA4)"}
      </button>

      <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 text-amber-500 font-semibold mb-2">
          <AlertTriangle size={16} /> Antes de importar no GA4
        </div>
        <ul className="space-y-1.5 list-disc pl-5">
          <li>
            Colunas:{" "}
            <span className="font-mono text-xs text-foreground">
              client_id, event_name, timestamp_micros, value, currency
            </span>
            .
          </li>
          <li>
            <strong className="text-foreground">
              O client_id sai vazio por enquanto
            </strong>{" "}
            — o site ainda não captura o cookie <code>_ga</code> (é WhatsApp-first,
            sem formulário web). O GA4 rejeita linhas sem client_id, então a
            importação só fica válida <strong className="text-foreground">depois</strong>{" "}
            que a captura existir.
          </li>
          <li>
            O GA4 aceita apenas eventos das{" "}
            <strong className="text-foreground">últimas 72 horas</strong> — não serve
            para backfill de vendas antigas.
          </li>
          <li>
            Eventos: <code>offline_sale</code> (oportunidades ganhas) e{" "}
            <code>qualified_lead</code> (leads qualificados), com <code>value</code>{" "}
            em <code>BRL</code>.
          </li>
        </ul>
      </div>
    </div>
  );
}
