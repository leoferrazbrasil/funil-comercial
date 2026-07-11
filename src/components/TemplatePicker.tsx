import { useEffect, useState } from "react";
import { FileText, X, Send, Loader2, ChevronLeft, AlertCircle } from "lucide-react";
import type { WhatsAppTemplate } from "../lib/crmService";

type TemplatePickerProps = {
  open: boolean;
  onClose: () => void;
  loadTemplates: () => Promise<WhatsAppTemplate[]>;
  contactName: string;
  onSend: (
    template: WhatsAppTemplate,
    variables: string[],
    renderedText: string,
  ) => Promise<void>;
};

// Substitui {{n}} pelo valor da variável n (1-based); mantém o placeholder se vazio.
export function renderTemplateBody(bodyText: string, variables: string[]) {
  return bodyText.replace(/\{\{\s*(\d+)\s*\}\}/g, (_match, idx: string) => {
    const value = variables[Number(idx) - 1];
    return value && value.trim() ? value : `{{${idx}}}`;
  });
}

export function TemplatePicker({
  open,
  onClose,
  loadTemplates,
  contactName,
  onSend,
}: TemplatePickerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selected, setSelected] = useState<WhatsAppTemplate | null>(null);
  const [variables, setVariables] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  // Carrega os templates ao abrir; reseta o estado ao fechar.
  useEffect(() => {
    if (!open) {
      setSelected(null);
      setVariables([]);
      setError(null);
      setSending(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    loadTemplates()
      .then((list) => {
        if (active) setTemplates(list);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "Falha ao carregar templates.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, loadTemplates]);

  const handleSelect = (template: WhatsAppTemplate) => {
    if (!template.supported) return;
    setSelected(template);
    // Campos começam VAZIOS — não assumimos que {{1}} é o nome do contato (pode
    // ser código, data, valor). O botão "usar nome do contato" oferece sob demanda.
    setVariables(Array.from({ length: template.variableCount }, () => ""));
  };

  const handleSend = async () => {
    if (!selected) return;
    // Um único conjunto com trim para o texto renderizado (histórico) E o payload
    // — evita divergência entre o que é gravado e o que a Meta recebe.
    const clean = variables.map((v) => v.trim());
    const rendered = renderTemplateBody(selected.bodyText, clean);
    setSending(true);
    setError(null);
    try {
      await onSend(selected, clean, rendered);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível enviar o template.");
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  const allVarsFilled = variables.every((v) => v.trim().length > 0);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-card border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10 shrink-0">
          {selected ? (
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="p-1.5 -ml-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          ) : (
            <span className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <FileText size={16} />
            </span>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground leading-tight">
              {selected ? selected.name : "Enviar template"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {selected
                ? `Idioma: ${selected.language}${selected.category ? ` · ${selected.category}` : ""}`
                : "Templates aprovados pela Meta"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-3 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
              <Loader2 className="animate-spin" size={22} />
              <p className="text-sm">Carregando templates...</p>
            </div>
          ) : !selected ? (
            templates.length === 0 && !error ? (
              <div className="text-center py-10 text-muted-foreground">
                <FileText size={28} className="mx-auto opacity-40 mb-3" />
                <p className="text-sm font-medium">Nenhum template aprovado encontrado.</p>
                <p className="text-xs opacity-70 mt-1">
                  Crie e aprove templates no Gerenciador do WhatsApp e configure o
                  secret <code>META_WABA_ID</code>.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {templates.map((t) => (
                  <button
                    key={`${t.name}-${t.language}`}
                    type="button"
                    onClick={() => handleSelect(t)}
                    disabled={!t.supported}
                    title={t.supported ? undefined : t.unsupportedReason}
                    className={`w-full text-left p-3 rounded-2xl border transition-colors ${
                      t.supported
                        ? "border-white/10 bg-white/[0.02] hover:border-primary/40 hover:bg-white/5"
                        : "border-white/5 bg-white/[0.01] opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {t.name}
                      </span>
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
            <div className="space-y-4">
              {/* Preview */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                  Prévia
                </p>
                <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-sm text-foreground whitespace-pre-wrap">
                  {renderTemplateBody(selected.bodyText, variables)}
                </div>
              </div>

              {/* Variáveis */}
              {selected.variableCount > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Variáveis
                  </p>
                  {variables.map((value, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          {`Variável {{${i + 1}}}`}
                        </span>
                        {contactName && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...variables];
                              next[i] = contactName;
                              setVariables(next);
                            }}
                            className="text-[11px] text-primary hover:underline"
                          >
                            usar nome do contato
                          </button>
                        )}
                      </div>
                      <input
                        value={value}
                        onChange={(e) => {
                          const next = [...variables];
                          next[i] = e.target.value;
                          setVariables(next);
                        }}
                        placeholder={`Valor para {{${i + 1}}}`}
                        className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50 focus:bg-white/10 transition-colors text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {selected && (
          <div className="p-4 border-t border-white/10 shrink-0">
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !allVarsFilled}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Enviar template
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
