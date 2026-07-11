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
  List,
  Ban,
  CalendarClock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getApprovedWhatsAppTemplates,
  createCampaign,
  getCampaign,
  getCampaigns,
  cancelCampaign,
  runOwnCampaigns,
  type WhatsAppTemplate,
} from "../lib/crmService";
import { renderTemplateBody } from "../components/TemplatePicker";
import { PhonePreview } from "../components/PhonePreview";
import { extractCsvRecipients } from "../lib/csv";
import type { Contact, IntegrationChannel, Campaign } from "../lib/types";

type VarMode = "name" | "fixed";
type Recipient = { key: string; nome: string; telefone: string; contactId: string | null };

const digits = (v: string) => (v ?? "").replace(/\D/g, "");
const hasPhone = (c: Contact) => digits(c.telefone ?? "").length >= 10;

const STEPS = [
  { n: 1, label: "Configurar" },
  { n: 2, label: "Contatos" },
  { n: 3, label: "Confirmação" },
];

// datetime-local (hora local) para o valor mínimo "agora".
const nowLocalInput = () => {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const STATUS_LABEL: Record<Campaign["status"], string> = {
  scheduled: "Agendada",
  sending: "Enviando",
  done: "Concluída",
  failed: "Falhou",
  canceled: "Cancelada",
};
const STATUS_STYLE: Record<Campaign["status"], string> = {
  scheduled: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  sending: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  done: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  failed: "text-red-500 bg-red-500/10 border-red-500/20",
  canceled: "text-muted-foreground bg-foreground/5 border-foreground/10",
};

const formatDateTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
};

export default function CampaignsPage({
  contacts,
  channels,
}: {
  contacts: Contact[];
  channels: IntegrationChannel[];
}) {
  const [view, setView] = useState<"wizard" | "history">("wizard");

  // ----- Wizard -----
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");

  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [selected, setSelected] = useState<WhatsAppTemplate | null>(null);
  const [varModes, setVarModes] = useState<VarMode[]>([]);
  const [fixedValues, setFixedValues] = useState<string[]>([]);

  const [sendMode, setSendMode] = useState<"now" | "schedule">("now");
  const [scheduleAt, setScheduleAt] = useState("");

  const [sourceTab, setSourceTab] = useState<"crm" | "csv">("crm");
  const [crmSelected, setCrmSelected] = useState<Set<string>>(new Set());
  const [crmSearch, setCrmSearch] = useState("");
  const [csvRecipients, setCsvRecipients] = useState<Recipient[]>([]);
  const [csvInvalid, setCsvInvalid] = useState(0);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<"idle" | "sending" | "done" | "timeout">("idle");
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);

  // ----- Histórico -----
  const [history, setHistory] = useState<Campaign[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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

  const loadHistory = () => {
    setHistoryLoading(true);
    getCampaigns()
      .then(setHistory)
      .catch(() => toast.error("Não foi possível carregar o histórico."))
      .finally(() => setHistoryLoading(false));
  };

  useEffect(() => {
    if (view === "history") loadHistory();
  }, [view]);

  // Poll do status da campanha em envio ("enviar agora").
  useEffect(() => {
    if (phase !== "sending" || !activeCampaign) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    let count = 0;
    const MAX_POLLS = 60; // ~2 min; depois orienta a acompanhar no histórico
    const tick = async () => {
      count += 1;
      try {
        const c = await getCampaign(activeCampaign.id);
        if (!alive) return;
        if (c) {
          setActiveCampaign(c);
          if (c.status === "done" || c.status === "failed" || c.status === "canceled") {
            setPhase("done");
            return;
          }
        }
      } catch {
        /* transitório */
      }
      if (!alive) return;
      if (count >= MAX_POLLS) {
        setPhase("timeout");
        return;
      }
      timer = setTimeout(tick, 2000);
    };
    timer = setTimeout(tick, 1500);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [phase, activeCampaign?.id]);

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
  const scheduleValid = sendMode === "now" || (scheduleAt !== "" && new Date(scheduleAt).getTime() > Date.now());
  const canConfirm =
    recipients.length > 0 && metaActive && scheduleValid && !submitting && phase === "idle";

  const resetWizard = () => {
    setStep(1);
    setName("");
    setSelected(null);
    setVarModes([]);
    setFixedValues([]);
    setSendMode("now");
    setScheduleAt("");
    setCrmSelected(new Set());
    setCsvRecipients([]);
    setCsvInvalid(0);
    setCsvFileName(null);
    setSourceTab("crm");
    setPhase("idle");
    setActiveCampaign(null);
  };

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

  const handleConfirm = async () => {
    if (!selected || recipients.length === 0) return;
    const scheduledAt =
      sendMode === "now" ? new Date().toISOString() : new Date(scheduleAt).toISOString();
    const variables = varModes.map((mode, i) => ({
      mode,
      value: mode === "fixed" ? fixedValues[i].trim() : "",
    }));
    setSubmitting(true);
    try {
      const campaign = await createCampaign({
        nome: name.trim(),
        templateName: selected.name,
        templateLanguage: selected.language,
        bodyText: selected.bodyText,
        variables,
        scheduledAt,
        recipients: recipients.map((r) => ({
          nome: r.nome,
          telefone: r.telefone,
          contactId: r.contactId,
        })),
      });
      if (sendMode === "now") {
        setActiveCampaign(campaign);
        setPhase("sending");
        runOwnCampaigns().catch(() =>
          toast("Campanha criada — o agendador vai processá-la.", { icon: "⏱️" }),
        );
      } else {
        toast.success("Campanha agendada!");
        resetWizard();
        setView("history");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível criar a campanha.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const canceled = await cancelCampaign(id);
      if (canceled) toast.success("Campanha cancelada.");
      else toast("Não foi possível cancelar — o envio já começou.", { icon: "⏱️" });
      loadHistory();
    } catch {
      toast.error("Não foi possível cancelar.");
    }
  };

  const toggleCrm = (id: string, checked: boolean) =>
    setCrmSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  const ac = activeCampaign;
  const acTotal = ac?.total ?? recipients.length;

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
            <Megaphone className="text-primary" size={26} /> Campanhas
          </h1>
          <p className="text-sm text-muted-foreground">
            Dispare (ou agende) um template aprovado da Meta para uma lista de contatos.
          </p>
        </div>
        <div className="flex rounded-xl bg-foreground/5 p-1">
          <button
            type="button"
            onClick={() => setView("wizard")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${view === "wizard" ? "bg-foreground/10 text-foreground" : "text-muted-foreground"}`}
          >
            <Megaphone size={14} /> Nova campanha
          </button>
          <button
            type="button"
            onClick={() => setView("history")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${view === "history" ? "bg-foreground/10 text-foreground" : "text-muted-foreground"}`}
          >
            <List size={14} /> Histórico
          </button>
        </div>
      </div>

      {view === "history" ? (
        <div className="panel bg-card border border-foreground/5 rounded-3xl p-5 md:p-6">
          {historyLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
              <Loader2 size={16} className="animate-spin" /> Carregando...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Megaphone size={28} className="mx-auto opacity-40 mb-3" />
              <p className="text-sm font-medium">Nenhuma campanha ainda.</p>
              <button
                type="button"
                onClick={() => setView("wizard")}
                className="mt-3 text-sm text-primary hover:underline"
              >
                Criar a primeira
              </button>
            </div>
          ) : (
            <div className="divide-y divide-foreground/5">
              {history.map((c) => (
                <div key={c.id} className="flex items-center gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground truncate">{c.nome}</span>
                      <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 shrink-0 ${STATUS_STYLE[c.status]}`}>
                        {STATUS_LABEL[c.status]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {c.template_name} · {c.sent}/{c.total} enviados
                      {c.failed > 0 ? ` · ${c.failed} falha(s)` : ""} ·{" "}
                      {c.status === "scheduled" ? `agendada p/ ${formatDateTime(c.scheduled_at)}` : formatDateTime(c.created_at)}
                    </p>
                  </div>
                  {c.status === "scheduled" && (
                    <button
                      type="button"
                      onClick={() => handleCancel(c.id)}
                      className="shrink-0 flex items-center gap-1 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-lg px-2 py-1 transition-colors"
                    >
                      <Ban size={13} /> Cancelar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* Wizard */}
          <div className="panel bg-card border border-foreground/5 rounded-3xl p-5 md:p-6">
            <div className="flex items-center gap-2 mb-6">
              {STEPS.map((s, i) => (
                <div key={s.n} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      step === s.n
                        ? "bg-primary text-primary-foreground"
                        : step > s.n
                          ? "bg-primary/20 text-primary"
                          : "bg-foreground/5 text-muted-foreground"
                    }`}
                  >
                    {step > s.n ? <CheckCircle2 size={15} /> : s.n}
                  </div>
                  <span className={`text-xs font-semibold ${step === s.n ? "text-foreground" : "text-muted-foreground"} hidden sm:block`}>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && <div className="flex-1 h-px bg-foreground/10" />}
                </div>
              ))}
            </div>

            {/* Etapa 1 */}
            {step === 1 && (
              <div className="space-y-5">
                <label className="block">
                  <span className="text-sm font-medium text-foreground">Nome da campanha</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex.: Prospecção clínicas — Julho"
                    className="mt-1 w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                  />
                </label>

                <div>
                  <span className="text-sm font-medium text-foreground">Enviando de</span>
                  {metaActive ? (
                    <div className="mt-1 flex items-center gap-2 rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2.5 text-sm">
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
                                  ? "border-foreground/10 bg-foreground/[0.02] hover:border-primary/40 hover:bg-foreground/5"
                                  : "border-foreground/5 bg-foreground/[0.01] opacity-60 cursor-not-allowed"
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

                {selected && selected.variableCount > 0 && (
                  <div className="space-y-3">
                    <span className="text-sm font-medium text-foreground">Variáveis</span>
                    {varModes.map((mode, i) => (
                      <div key={i} className="rounded-xl border border-foreground/10 p-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-medium text-foreground">{`{{${i + 1}}}`}</span>
                          <div className="flex rounded-lg bg-foreground/5 p-0.5 text-[11px]">
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
                            className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-foreground">Envio</span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSendMode("now")}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium flex items-center gap-2 transition-colors ${sendMode === "now" ? "border-primary bg-primary/10 text-primary" : "border-foreground/10 bg-foreground/[0.02] text-muted-foreground hover:text-foreground"}`}
                    >
                      <Send size={15} /> Enviar agora
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSendMode("schedule");
                        if (!scheduleAt) setScheduleAt(nowLocalInput());
                      }}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium flex items-center gap-2 transition-colors ${sendMode === "schedule" ? "border-primary bg-primary/10 text-primary" : "border-foreground/10 bg-foreground/[0.02] text-muted-foreground hover:text-foreground"}`}
                    >
                      <CalendarClock size={15} /> Agendar
                    </button>
                  </div>
                  {sendMode === "schedule" && (
                    <div className="mt-2">
                      <input
                        type="datetime-local"
                        value={scheduleAt}
                        min={nowLocalInput()}
                        onChange={(e) => setScheduleAt(e.target.value)}
                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 text-foreground"
                      />
                      {!scheduleValid && (
                        <p className="text-[11px] text-amber-500 mt-1">Escolha uma data/hora futura.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Etapa 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex rounded-xl bg-foreground/5 p-1">
                  <button
                    type="button"
                    onClick={() => setSourceTab("crm")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${sourceTab === "crm" ? "bg-foreground/10 text-foreground" : "text-muted-foreground"}`}
                  >
                    <Users size={14} /> Do CRM
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceTab("csv")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${sourceTab === "csv" ? "bg-foreground/10 text-foreground" : "text-muted-foreground"}`}
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
                          className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-2 pl-9 pr-3 text-sm outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="flex gap-2 text-[11px] shrink-0">
                        <button
                          type="button"
                          onClick={() => setCrmSelected((prev) => new Set([...prev, ...crmCandidates.map((c) => c.id)]))}
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
                    <div className="max-h-64 overflow-y-auto rounded-xl border border-foreground/10 divide-y divide-foreground/5">
                      {crmCandidates.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground text-center">Nenhum contato com telefone.</p>
                      ) : (
                        crmCandidates.map((c) => (
                          <label key={c.id} className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-foreground/[0.02]">
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
                      className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-2xl border-2 border-dashed border-foreground/15 hover:border-primary/40 hover:bg-foreground/[0.02] transition-colors text-muted-foreground"
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

            {/* Etapa 3 */}
            {step === 3 && (
              <div className="space-y-4">
                {phase === "idle" ? (
                  <>
                    <h3 className="font-bold text-foreground">Confirme a campanha</h3>
                    <dl className="rounded-2xl border border-foreground/10 divide-y divide-foreground/5 text-sm">
                      {[
                        ["Campanha", name || "—"],
                        ["Template", selected?.name ?? "—"],
                        ["Enviando de", metaChannel?.numero || "Meta Cloud API"],
                        ["Destinatários", String(recipients.length)],
                        ["Quando", sendMode === "now" ? "Agora" : formatDateTime(new Date(scheduleAt || Date.now()).toISOString())],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-3 px-3 py-2.5">
                          <dt className="text-muted-foreground">{k}</dt>
                          <dd className="text-foreground font-medium text-right truncate">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground flex-1">{ac?.nome}</h3>
                      {ac && (
                        <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 ${STATUS_STYLE[ac.status]}`}>
                          {STATUS_LABEL[ac.status]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-foreground/10 overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${acTotal ? ((ac?.sent ?? 0) + (ac?.failed ?? 0)) / acTotal * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {(ac?.sent ?? 0) + (ac?.failed ?? 0)}/{acTotal}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="text-emerald-500 font-semibold">{ac?.sent ?? 0} enviado(s)</span>
                      {(ac?.failed ?? 0) > 0 && <span className="text-red-500 font-semibold"> · {ac?.failed} falha(s)</span>}
                      {phase === "sending" && (
                        <span className="text-muted-foreground inline-flex items-center gap-1 ml-2">
                          <Loader2 size={12} className="animate-spin" /> enviando...
                        </span>
                      )}
                    </p>
                    {phase === "timeout" && (
                      <p className="text-xs text-amber-500">
                        Ainda processando no servidor — acompanhe o resultado no Histórico.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Navegação */}
            <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-foreground/5">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1 || phase !== "idle"}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Voltar
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={(step === 1 && (!canNext1 || !scheduleValid)) || (step === 2 && !canNext2)}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Avançar <ChevronRight size={16} />
                </button>
              ) : phase === "done" || phase === "timeout" ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setView("history")}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                  >
                    Ver histórico
                  </button>
                  <button
                    type="button"
                    onClick={resetWizard}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <Megaphone size={16} /> Nova campanha
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!canConfirm}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {submitting || phase === "sending" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : sendMode === "now" ? (
                    <Send size={16} />
                  ) : (
                    <CalendarClock size={16} />
                  )}
                  {sendMode === "now" ? `Disparar para ${recipients.length}` : "Agendar"}
                </button>
              )}
            </div>
          </div>

          {/* Preview iPhone */}
          <div className="lg:sticky lg:top-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 text-center">
              Prévia ({sample.nome})
            </p>
            <PhonePreview contactName={sample.nome} body={previewText} />
          </div>
        </div>
      )}
    </div>
  );
}
