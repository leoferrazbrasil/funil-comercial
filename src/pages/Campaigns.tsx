import { useEffect, useMemo, useRef, useState } from "react";
import {
  Megaphone,
  FileText,
  Users,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Smartphone,
  Search,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getApprovedWhatsAppTemplates,
  sendInboxTemplate,
  type WhatsAppTemplate,
} from "../lib/crmService";
import { renderTemplateBody } from "../components/TemplatePicker";
import { PhonePreview } from "../components/PhonePreview";
import { extractCsvRecipients } from "../lib/csv";
import type { Contact, IntegrationChannel } from "../lib/types";

type VarMode = "name" | "fixed";
type RowStatus = "pending" | "sent" | "error";
type Recipient = { key: string; nome: string; telefone: string; contactId: string | null };

const digits = (v: string) => (v ?? "").replace(/\D/g, "");
const hasPhone = (c: Contact) => digits(c.telefone ?? "").length >= 10;

const SEND_DELAY_MS = 350;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const STEPS = [
  { n: 1, label: "Configurar" },
  { n: 2, label: "Contatos" },
  { n: 3, label: "Confirmação" },
];

export default function CampaignsPage({
  contacts,
  channels,
}: {
  contacts: Contact[];
  channels: IntegrationChannel[];
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");

  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [selected, setSelected] = useState<WhatsAppTemplate | null>(null);
  const [varModes, setVarModes] = useState<VarMode[]>([]);
  const [fixedValues, setFixedValues] = useState<string[]>([]);

  const [sourceTab, setSourceTab] = useState<"crm" | "csv">("crm");
  const [crmSelected, setCrmSelected] = useState<Set<string>>(new Set());
  const [crmSearch, setCrmSearch] = useState("");
  const [csvRecipients, setCsvRecipients] = useState<Recipient[]>([]);
  const [csvInvalid, setCsvInvalid] = useState(0);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sendState, setSendState] = useState<"idle" | "sending" | "done">("idle");
  const [results, setResults] = useState<Record<string, RowStatus>>({});
  const [progress, setProgress] = useState(0);

  // Canal Meta ativo (origem do envio) — read-only no MVP.
  const metaChannel = useMemo(
    () =>
      channels.find(
        (c) => c.status === "ativo" && (c.provider === "whatsapp" || c.provider === "whatsapp_cloud"),
      ),
    [channels],
  );
  const metaActive = Boolean(metaChannel);

  useEffect(() => {
    let active = true;
    setLoadingTemplates(true);
    setTemplatesError(null);
    getApprovedWhatsAppTemplates()
      .then((list) => active && setTemplates(list))
      .catch((e) => active && setTemplatesError(e instanceof Error ? e.message : "Falha ao carregar templates."))
      .finally(() => active && setLoadingTemplates(false));
    return () => {
      active = false;
    };
  }, []);

  const handleSelectTemplate = (t: WhatsAppTemplate) => {
    if (!t.supported) return;
    setSelected(t);
    setVarModes(Array.from({ length: t.variableCount }, (_, i) => (i === 0 ? "name" : "fixed")));
    setFixedValues(Array.from({ length: t.variableCount }, () => ""));
  };

  const crmCandidates = useMemo(() => {
    const q = crmSearch.trim().toLowerCase();
    return contacts
      .filter(hasPhone)
      .filter((c) => !q || `${c.nome} ${c.telefone}`.toLowerCase().includes(q));
  }, [contacts, crmSearch]);

  const recipients: Recipient[] = useMemo(() => {
    const base: Recipient[] =
      sourceTab === "csv"
        ? csvRecipients
        : contacts
            .filter((c) => crmSelected.has(c.id) && hasPhone(c))
            .map((c) => ({ key: c.id, nome: c.nome || "Contato", telefone: c.telefone, contactId: c.id }));
    // Dedupe por telefone normalizado — não envia duas vezes para o mesmo número.
    const seen = new Set<string>();
    const out: Recipient[] = [];
    for (const r of base) {
      const k = digits(r.telefone);
      if (k && !seen.has(k)) {
        seen.add(k);
        out.push(r);
      }
    }
    return out;
  }, [sourceTab, csvRecipients, contacts, crmSelected]);

  const varsFor = (r: Recipient) =>
    varModes.map((mode, i) => (mode === "name" ? r.nome : fixedValues[i].trim()));

  const sample: Recipient =
    recipients[0] ?? { key: "sample", nome: "Maria", telefone: "", contactId: null };
  const previewText = selected ? renderTemplateBody(selected.bodyText, varsFor(sample)) : "";

  const fixedFilled = varModes.every((m, i) => m === "name" || fixedValues[i].trim().length > 0);
  const canNext1 = name.trim().length > 0 && Boolean(selected) && fixedFilled && metaActive;
  const canNext2 = recipients.length > 0;

  const handleCsvFile = async (file: File) => {
    try {
      const text = await file.text();
      const { recipients: recs, invalid } = extractCsvRecipients(text);
      setCsvRecipients(
        recs.map((r, i) => ({ key: `csv-${i}`, nome: r.nome, telefone: r.telefone, contactId: null })),
      );
      setCsvInvalid(invalid);
      setCsvFileName(file.name);
      if (recs.length === 0) toast.error("Nenhum contato válido encontrado no CSV.");
    } catch {
      toast.error("Não foi possível ler o arquivo.");
    }
  };

  const resetSend = () => {
    setSendState("idle");
    setResults({});
    setProgress(0);
  };

  const handleSend = async () => {
    if (recipients.length === 0 || !selected) return;
    setSendState("sending");
    setResults(Object.fromEntries(recipients.map((r) => [r.key, "pending" as RowStatus])));
    setProgress(0);

    let done = 0;
    for (const r of recipients) {
      const variables = varsFor(r);
      const renderedText = renderTemplateBody(selected.bodyText, variables);
      try {
        await sendInboxTemplate({
          phone: r.telefone,
          contactId: r.contactId,
          leadId: null,
          renderedText,
          template: { name: selected.name, language: selected.language, variables },
        });
        setResults((prev) => ({ ...prev, [r.key]: "sent" }));
      } catch {
        setResults((prev) => ({ ...prev, [r.key]: "error" }));
      }
      done += 1;
      setProgress(done);
      if (done < recipients.length) await sleep(SEND_DELAY_MS);
    }
    setSendState("done");
  };

  const sentCount = Object.values(results).filter((s) => s === "sent").length;
  const errorCount = Object.values(results).filter((s) => s === "error").length;

  const toggleCrm = (id: string, checked: boolean) =>
    setCrmSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
          <Megaphone className="text-primary" size={26} /> Campanhas
        </h1>
        <p className="text-sm text-muted-foreground">
          Dispare um template aprovado da Meta para uma lista de contatos.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Coluna esquerda — Wizard */}
        <div className="panel bg-card border border-white/5 rounded-3xl p-5 md:p-6">
          {/* Stepper */}
          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    step === s.n
                      ? "bg-primary text-primary-foreground"
                      : step > s.n
                        ? "bg-primary/20 text-primary"
                        : "bg-white/5 text-muted-foreground"
                  }`}
                >
                  {step > s.n ? <CheckCircle2 size={15} /> : s.n}
                </div>
                <span
                  className={`text-xs font-semibold ${step === s.n ? "text-foreground" : "text-muted-foreground"} hidden sm:block`}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && <div className="flex-1 h-px bg-white/10" />}
              </div>
            ))}
          </div>

          {/* Etapa 1 — Configurar */}
          {step === 1 && (
            <div className="space-y-5">
              <label className="block">
                <span className="text-sm font-medium text-foreground">Nome da campanha</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Prospecção clínicas — Julho"
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                />
              </label>

              {/* Enviando de */}
              <div>
                <span className="text-sm font-medium text-foreground">Enviando de</span>
                {metaActive ? (
                  <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm">
                    <Smartphone size={16} className="text-emerald-500 shrink-0" />
                    <span className="text-foreground">{metaChannel?.numero || "WhatsApp (Meta Cloud API)"}</span>
                    <span className="ml-auto text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                      Ativo
                    </span>
                  </div>
                ) : (
                  <div className="mt-1 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-500">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>Nenhum canal Meta ativo. Ative a Meta Cloud API no /perfil para disparar templates.</span>
                  </div>
                )}
              </div>

              {/* Template */}
              <div>
                <span className="text-sm font-medium text-foreground">Template</span>
                {loadingTemplates ? (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 size={16} className="animate-spin" /> Carregando templates...
                  </div>
                ) : templatesError ? (
                  <div className="mt-2 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{templatesError}</span>
                  </div>
                ) : templates.length === 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Nenhum template aprovado. Aprove templates no Gerenciador do WhatsApp e configure o
                    secret <code>META_WABA_ID</code>.
                  </p>
                ) : (
                  <div className="mt-2 space-y-2 max-h-56 overflow-y-auto pr-1">
                    {templates.map((t) => {
                      const active = selected?.name === t.name && selected?.language === t.language;
                      return (
                        <button
                          key={`${t.name}-${t.language}`}
                          type="button"
                          onClick={() => handleSelectTemplate(t)}
                          disabled={!t.supported}
                          title={t.supported ? undefined : t.unsupportedReason}
                          className={`w-full text-left p-3 rounded-2xl border transition-colors ${
                            active
                              ? "border-primary bg-primary/10"
                              : t.supported
                                ? "border-white/10 bg-white/[0.02] hover:border-primary/40 hover:bg-white/5"
                                : "border-white/5 bg-white/[0.01] opacity-60 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-sm text-foreground truncate">{t.name}</span>
                            {!t.supported && (
                              <span className="text-[10px] font-medium text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 shrink-0">
                                Não suportado
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {t.supported ? t.bodyText : t.unsupportedReason}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Variáveis */}
              {selected && selected.variableCount > 0 && (
                <div className="space-y-3">
                  <span className="text-sm font-medium text-foreground">Variáveis</span>
                  {varModes.map((mode, i) => (
                    <div key={i} className="rounded-xl border border-white/10 p-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-medium text-foreground">{`{{${i + 1}}}`}</span>
                        <div className="flex rounded-lg bg-white/5 p-0.5 text-[11px]">
                          <button
                            type="button"
                            onClick={() => setVarModes((m) => m.map((v, idx) => (idx === i ? "name" : v)))}
                            className={`px-2 py-1 rounded-md font-medium transition-colors ${mode === "name" ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}
                          >
                            Nome do contato
                          </button>
                          <button
                            type="button"
                            onClick={() => setVarModes((m) => m.map((v, idx) => (idx === i ? "fixed" : v)))}
                            className={`px-2 py-1 rounded-md font-medium transition-colors ${mode === "fixed" ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}
                          >
                            Valor fixo
                          </button>
                        </div>
                      </div>
                      {mode === "name" ? (
                        <p className="text-[11px] text-muted-foreground">Usa o nome de cada contato.</p>
                      ) : (
                        <input
                          value={fixedValues[i]}
                          onChange={(e) => setFixedValues((v) => v.map((x, idx) => (idx === i ? e.target.value : x)))}
                          placeholder={`Valor único para {{${i + 1}}}`}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Envio */}
              <div>
                <span className="text-sm font-medium text-foreground">Envio</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-primary bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary flex items-center gap-2">
                    <Send size={15} /> Enviar agora
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm text-muted-foreground flex items-center gap-2 cursor-not-allowed">
                    <Clock3 size={15} /> Agendar
                    <span className="ml-auto text-[9px] font-semibold bg-white/10 rounded-full px-1.5 py-0.5">em breve</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Etapa 2 — Contatos */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex rounded-xl bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setSourceTab("crm")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${sourceTab === "crm" ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}
                >
                  <Users size={14} /> Do CRM
                </button>
                <button
                  type="button"
                  onClick={() => setSourceTab("csv")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${sourceTab === "csv" ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}
                >
                  <Upload size={14} /> Importar CSV
                </button>
              </div>

              {sourceTab === "crm" ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={crmSearch}
                        onChange={(e) => setCrmSearch(e.target.value)}
                        placeholder="Buscar contato..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-sm outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="flex gap-2 text-[11px] shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setCrmSelected((prev) => new Set([...prev, ...crmCandidates.map((c) => c.id)]))
                        }
                        className="text-primary hover:underline"
                      >
                        Todos
                      </button>
                      <button
                        type="button"
                        onClick={() => setCrmSelected(new Set())}
                        className="text-muted-foreground hover:underline"
                      >
                        Nenhum
                      </button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto rounded-xl border border-white/10 divide-y divide-white/5">
                    {crmCandidates.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground text-center">Nenhum contato com telefone.</p>
                    ) : (
                      crmCandidates.map((c) => (
                        <label key={c.id} className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-white/[0.02]">
                          <input
                            type="checkbox"
                            checked={crmSelected.has(c.id)}
                            onChange={(e) => toggleCrm(c.id, e.target.checked)}
                            className="accent-primary"
                          />
                          <span className="flex-1 min-w-0 truncate text-foreground">{c.nome}</span>
                          <span className="text-xs text-muted-foreground shrink-0">{c.telefone}</span>
                        </label>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleCsvFile(f);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-2xl border-2 border-dashed border-white/15 hover:border-primary/40 hover:bg-white/[0.02] transition-colors text-muted-foreground"
                  >
                    <Upload size={22} />
                    <span className="text-sm font-medium">Escolher arquivo .csv</span>
                    <span className="text-xs opacity-70">Colunas nome e telefone (detecção automática)</span>
                  </button>
                  {csvFileName && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText size={14} />
                      <span className="text-foreground font-medium">{csvFileName}</span>
                      <span>· {csvRecipients.length} válido(s)</span>
                      {csvInvalid > 0 && <span className="text-amber-500">· {csvInvalid} descartado(s)</span>}
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">{recipients.length}</strong> destinatário(s) selecionado(s).
              </p>
            </div>
          )}

          {/* Etapa 3 — Confirmação */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">Confirme o disparo</h3>
              <dl className="rounded-2xl border border-white/10 divide-y divide-white/5 text-sm">
                {[
                  ["Campanha", name || "—"],
                  ["Template", selected?.name ?? "—"],
                  ["Enviando de", metaChannel?.numero || "Meta Cloud API"],
                  ["Destinatários", String(recipients.length)],
                  ["Quando", "Agora"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-foreground font-medium text-right truncate">{v}</dd>
                  </div>
                ))}
              </dl>

              {sendState !== "idle" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${recipients.length ? (progress / recipients.length) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {progress}/{recipients.length}
                    </span>
                  </div>
                  {sendState === "done" && (
                    <p className="text-sm">
                      <span className="text-emerald-500 font-semibold">{sentCount} enviado(s)</span>
                      {errorCount > 0 && <span className="text-red-500 font-semibold"> · {errorCount} falha(s)</span>}
                    </p>
                  )}
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-white/10 divide-y divide-white/5">
                    {recipients.map((r) => (
                      <div key={r.key} className="flex items-center gap-2 px-3 py-1.5 text-sm">
                        <span className="flex-1 min-w-0 truncate text-foreground">{r.nome}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{r.telefone}</span>
                        {results[r.key] === "sent" && <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
                        {results[r.key] === "error" && <AlertCircle size={14} className="text-red-500 shrink-0" />}
                        {results[r.key] === "pending" && sendState === "sending" && (
                          <Loader2 size={14} className="animate-spin text-muted-foreground shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navegação do wizard */}
          <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                if (step === 3) resetSend();
                setStep((s) => Math.max(1, s - 1));
              }}
              disabled={step === 1 || sendState === "sending"}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Voltar
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={(step === 1 && !canNext1) || (step === 2 && !canNext2)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Avançar <ChevronRight size={16} />
              </button>
            ) : sendState === "done" ? (
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setName("");
                  setSelected(null);
                  setVarModes([]);
                  setFixedValues([]);
                  setCrmSelected(new Set());
                  setCsvRecipients([]);
                  setCsvInvalid(0);
                  setCsvFileName(null);
                  setSourceTab("crm");
                  resetSend();
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/10 text-foreground text-sm font-semibold hover:bg-white/15 transition-colors"
              >
                <Megaphone size={16} /> Nova campanha
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={recipients.length === 0 || sendState === "sending" || !metaActive}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {sendState === "sending" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Disparar para {recipients.length}
              </button>
            )}
          </div>
        </div>

        {/* Coluna direita — Preview iPhone */}
        <div className="lg:sticky lg:top-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 text-center">
            Prévia ({sample.nome})
          </p>
          <PhonePreview contactName={sample.nome} body={previewText} />
        </div>
      </div>
    </div>
  );
}
