import { useEffect, useMemo, useState } from "react";
import {
  Send,
  X,
  Loader2,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  FileText,
  Users,
} from "lucide-react";
import {
  getApprovedWhatsAppTemplates,
  sendInboxTemplate,
  type WhatsAppTemplate,
} from "../lib/crmService";
import { renderTemplateBody } from "./TemplatePicker";
import type { Contact } from "../lib/types";

type BulkTemplateDialogProps = {
  open: boolean;
  onClose: () => void;
  contacts: Contact[];
};

// Modo de cada variável: "name" = nome de cada contato (por destinatário);
// "fixed" = um valor único aplicado a todos.
type VarMode = "name" | "fixed";
type RowStatus = "pending" | "sent" | "error";

const hasDialablePhone = (c: Contact) =>
  (c.telefone ?? "").replace(/\D/g, "").length >= 10;

// Pausa entre envios para não estourar limites da Meta.
const SEND_DELAY_MS = 350;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function BulkTemplateDialog({ open, onClose, contacts }: BulkTemplateDialogProps) {
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selected, setSelected] = useState<WhatsAppTemplate | null>(null);

  const [varModes, setVarModes] = useState<VarMode[]>([]);
  const [fixedValues, setFixedValues] = useState<string[]>([]);

  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [sendState, setSendState] = useState<"idle" | "sending" | "done">("idle");
  const [results, setResults] = useState<Record<string, RowStatus>>({});
  const [progress, setProgress] = useState(0);

  // Candidatos = contatos com telefone discável; os sem telefone são omitidos.
  const candidates = useMemo(() => contacts.filter(hasDialablePhone), [contacts]);
  const omitted = contacts.length - candidates.length;
  const recipients = useMemo(
    () => candidates.filter((c) => !excludedIds.has(c.id)),
    [candidates, excludedIds],
  );

  // Reset ao abrir/fechar; carrega os templates ao abrir.
  useEffect(() => {
    if (!open) return;
    setSelected(null);
    setExcludedIds(new Set());
    setSendState("idle");
    setResults({});
    setProgress(0);
    setLoadError(null);
    // Limpa a lista antiga: se este recarregamento falhar, mostramos erro/vazio
    // em vez de templates obsoletos de uma abertura anterior.
    setTemplates([]);
    let active = true;
    setLoading(true);
    getApprovedWhatsAppTemplates()
      .then((list) => active && setTemplates(list))
      .catch((e) => active && setLoadError(e instanceof Error ? e.message : "Falha ao carregar templates."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [open]);

  const handleSelectTemplate = (t: WhatsAppTemplate) => {
    if (!t.supported) return;
    setSelected(t);
    // Padrão: {{1}} = nome do contato (por destinatário); demais = valor fixo.
    setVarModes(Array.from({ length: t.variableCount }, (_, i) => (i === 0 ? "name" : "fixed")));
    setFixedValues(Array.from({ length: t.variableCount }, () => ""));
    setSendState("idle");
    setResults({});
    setProgress(0);
  };

  const varsForContact = (contact: Contact) =>
    varModes.map((mode, i) => (mode === "name" ? contact.nome : fixedValues[i].trim()));

  // Todas as variáveis de valor fixo precisam estar preenchidas.
  const fixedFilled = varModes.every((mode, i) => mode === "name" || fixedValues[i].trim().length > 0);
  const canSend =
    Boolean(selected) && recipients.length > 0 && fixedFilled && sendState !== "sending";

  const handleSend = async () => {
    if (!selected || recipients.length === 0) return;
    setSendState("sending");
    setResults(Object.fromEntries(recipients.map((c) => [c.id, "pending" as RowStatus])));
    setProgress(0);

    let done = 0;
    for (const contact of recipients) {
      const variables = varsForContact(contact);
      const renderedText = renderTemplateBody(selected.bodyText, variables);
      try {
        await sendInboxTemplate({
          phone: contact.telefone,
          contactId: contact.id,
          leadId: null,
          renderedText,
          template: {
            name: selected.name,
            language: selected.language,
            variables,
          },
        });
        setResults((prev) => ({ ...prev, [contact.id]: "sent" }));
      } catch {
        setResults((prev) => ({ ...prev, [contact.id]: "error" }));
      }
      done += 1;
      setProgress(done);
      if (done < recipients.length) await sleep(SEND_DELAY_MS);
    }
    setSendState("done");
  };

  if (!open) return null;

  const sentCount = Object.values(results).filter((s) => s === "sent").length;
  const errorCount = Object.values(results).filter((s) => s === "error").length;
  const total = recipients.length;
  const previewContact = recipients[0];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-foreground/10 backdrop-blur-sm p-0 sm:p-4"
      onClick={sendState === "sending" ? undefined : onClose}
    >
      <div
        className="w-full sm:max-w-xl bg-card border border-foreground/10 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-foreground/10 shrink-0">
          {selected && sendState === "idle" ? (
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="p-1.5 -ml-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          ) : (
            <span className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <Users size={16} />
            </span>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground leading-tight">
              {selected ? `Disparo: ${selected.name}` : "Disparo de template em massa"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {selected
                ? `${total} destinatário(s) selecionado(s)`
                : "Envie um template aprovado para vários contatos"}
            </p>
          </div>
          {sendState !== "sending" && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{loadError}</span>
            </div>
          )}

          {/* Etapa 1 — escolher template */}
          {!selected ? (
            loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
                <Loader2 className="animate-spin" size={22} />
                <p className="text-sm">Carregando templates...</p>
              </div>
            ) : templates.length === 0 && !loadError ? (
              <div className="text-center py-10 text-muted-foreground">
                <FileText size={28} className="mx-auto opacity-40 mb-3" />
                <p className="text-sm font-medium">Nenhum template aprovado encontrado.</p>
                <p className="text-xs opacity-70 mt-1">
                  Ative a Meta Cloud API, aprove templates e configure o secret{" "}
                  <code>META_WABA_ID</code>.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {templates.map((t) => (
                  <button
                    key={`${t.name}-${t.language}`}
                    type="button"
                    onClick={() => handleSelectTemplate(t)}
                    disabled={!t.supported}
                    title={t.supported ? undefined : t.unsupportedReason}
                    className={`w-full text-left p-3 rounded-2xl border transition-colors ${
                      t.supported
                        ? "border-foreground/10 bg-foreground/[0.02] hover:border-primary/40 hover:bg-foreground/5"
                        : "border-foreground/5 bg-foreground/[0.01] opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-foreground truncate">{t.name}</span>
                      {t.supported ? (
                        <span className="text-[10px] font-medium text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5 shrink-0">
                          Aprovado
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 shrink-0">
                          Não suportado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {t.supported ? t.bodyText : t.unsupportedReason}
                    </p>
                  </button>
                ))}
              </div>
            )
          ) : (
            <>
              {/* Variáveis */}
              {selected.variableCount > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Variáveis
                  </p>
                  {varModes.map((mode, i) => (
                    <div key={i} className="rounded-xl border border-foreground/10 p-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-medium text-foreground">{`{{${i + 1}}}`}</span>
                        <div className="flex rounded-lg bg-foreground/5 p-0.5 text-[11px]">
                          <button
                            type="button"
                            disabled={sendState !== "idle"}
                            onClick={() =>
                              setVarModes((m) => m.map((v, idx) => (idx === i ? "name" : v)))
                            }
                            className={`px-2 py-1 rounded-md font-medium transition-colors ${
                              mode === "name" ? "bg-primary/20 text-primary" : "text-muted-foreground"
                            }`}
                          >
                            Nome do contato
                          </button>
                          <button
                            type="button"
                            disabled={sendState !== "idle"}
                            onClick={() =>
                              setVarModes((m) => m.map((v, idx) => (idx === i ? "fixed" : v)))
                            }
                            className={`px-2 py-1 rounded-md font-medium transition-colors ${
                              mode === "fixed" ? "bg-primary/20 text-primary" : "text-muted-foreground"
                            }`}
                          >
                            Valor fixo
                          </button>
                        </div>
                      </div>
                      {mode === "name" ? (
                        <p className="text-[11px] text-muted-foreground">
                          Cada mensagem usa o nome do respectivo contato.
                        </p>
                      ) : (
                        <input
                          value={fixedValues[i]}
                          disabled={sendState !== "idle"}
                          onChange={(e) =>
                            setFixedValues((v) => v.map((x, idx) => (idx === i ? e.target.value : x)))
                          }
                          placeholder={`Valor único para {{${i + 1}}}`}
                          className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Preview */}
              {previewContact && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Prévia ({previewContact.nome})
                  </p>
                  <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-sm text-foreground whitespace-pre-wrap">
                    {renderTemplateBody(selected.bodyText, varsForContact(previewContact))}
                  </div>
                </div>
              )}

              {/* Destinatários */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Destinatários ({total}/{candidates.length})
                  </p>
                  {sendState === "idle" && (
                    <div className="flex gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setExcludedIds(new Set())}
                        className="text-primary hover:underline"
                      >
                        Todos
                      </button>
                      <button
                        type="button"
                        onClick={() => setExcludedIds(new Set(candidates.map((c) => c.id)))}
                        className="text-muted-foreground hover:underline"
                      >
                        Nenhum
                      </button>
                    </div>
                  )}
                </div>
                {omitted > 0 && (
                  <p className="text-[11px] text-amber-500/90 mb-2">
                    {omitted} contato(s) sem telefone válido foram omitidos.
                  </p>
                )}
                {total > 50 && sendState === "idle" && (
                  <p className="text-[11px] text-amber-500/90 mb-2">
                    Você vai enviar para {total} contatos — o envio é sequencial e pode levar alguns minutos.
                  </p>
                )}
                <div className="max-h-48 overflow-y-auto rounded-xl border border-foreground/10 divide-y divide-foreground/5">
                  {candidates.map((c) => {
                    const checked = !excludedIds.has(c.id);
                    const status = results[c.id];
                    return (
                      <label
                        key={c.id}
                        className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-foreground/[0.02]"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={sendState !== "idle"}
                          onChange={(e) =>
                            setExcludedIds((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) next.delete(c.id);
                              else next.add(c.id);
                              return next;
                            })
                          }
                          className="accent-primary"
                        />
                        <span className="flex-1 min-w-0 truncate text-foreground">{c.nome}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{c.telefone}</span>
                        {status === "sent" && <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />}
                        {status === "error" && <AlertCircle size={15} className="text-red-500 shrink-0" />}
                        {status === "pending" && sendState === "sending" && (
                          <Loader2 size={15} className="animate-spin text-muted-foreground shrink-0" />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Resultado */}
              {sendState === "done" && (
                <div className="p-3 rounded-xl bg-foreground/5 border border-foreground/10 text-sm">
                  <span className="text-emerald-500 font-semibold">{sentCount} enviado(s)</span>
                  {errorCount > 0 && (
                    <span className="text-red-500 font-semibold"> · {errorCount} falha(s)</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {selected && (
          <div className="p-4 border-t border-foreground/10 shrink-0">
            {sendState === "sending" ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-foreground/10 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${total ? (progress / total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {progress}/{total}
                </span>
              </div>
            ) : sendState === "done" ? (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-foreground/10 text-foreground font-semibold hover:bg-foreground/15 transition-colors"
              >
                Fechar
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Send size={16} />
                Enviar para {total} contato(s)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
