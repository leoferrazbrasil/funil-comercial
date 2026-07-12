import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, Copy, Check, X, Eye, EyeOff, ArrowLeft, Sparkles, Download,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import {
  getMyAggregators, createAggregator, updateAggregator, deleteAggregator, isAggregatorSlugAvailable,
} from "../lib/crmService";
import { AGGREGATOR_THEMES } from "../lib/aggregatorThemes";
import { renderBioHtml } from "../lib/aggregatorHtml";
import { AGGREGATORS, type AggregatorLink, type AggregatorLinkIcon } from "../lib/aggregators";
import type { Aggregator } from "../lib/types";

type Draft = {
  slug: string; name: string; tagline: string; avatar_url: string; status: string;
  footer: string; footer_highlight: string; theme: string; links: AggregatorLink[]; published: boolean;
};

const MAX_LINKS = 5;
const ICONS: AggregatorLinkIcon[] = ["whatsapp", "globe", "link"];

const blankDraft = (): Draft => ({
  slug: "", name: "", tagline: "", avatar_url: "", status: "", footer: "", footer_highlight: "",
  theme: "funil", links: [{ variant: "primary", icon: "whatsapp", label: "", sublabel: "", href: "" }], published: true,
});

const draftFromRow = (a: Aggregator): Draft => ({
  slug: a.slug, name: a.name, tagline: a.tagline ?? "", avatar_url: a.avatar_url ?? "", status: a.status ?? "",
  footer: a.footer ?? "", footer_highlight: a.footer_highlight ?? "", theme: a.theme, links: a.links ?? [], published: a.published,
});

const draftFromStaticFc = (): Draft => {
  const c = AGGREGATORS.funilcomercial;
  return {
    slug: c.slug, name: c.name, tagline: c.tagline ?? "", avatar_url: c.avatarUrl ?? "", status: c.status ?? "",
    footer: c.footer ?? "", footer_highlight: c.footerHighlight ?? "", theme: c.theme ?? "funil", links: [...c.links], published: true,
  };
};

const friendlyErr = (e: unknown): string => {
  const m = e instanceof Error ? e.message : String(e);
  if (/duplicate|unique|aggregators_slug/i.test(m)) return "Esse endereço (slug) já está em uso. Escolha outro.";
  if (/aggregators_slug_check|violates check/i.test(m)) return "Slug inválido: use só letras minúsculas, números e hífen.";
  return m;
};

export default function AggregatorsAdminPage() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id?: string; draft: Draft } | null>(null);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "ok" | "taken" | "invalid">("idle");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { data: list = [], isLoading } = useQuery({
    queryKey: ["aggregators", userId],
    queryFn: () => getMyAggregators(userId!),
    enabled: !!userId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["aggregators", userId] });
  const hasFc = list.some((a) => a.slug === "funilcomercial");

  const saveMutation = useMutation({
    mutationFn: async () => {
      const d = editing!.draft;
      const input = {
        slug: d.slug.trim(), name: d.name.trim(), tagline: d.tagline.trim(),
        avatar_url: d.avatar_url.trim() || null, status: d.status.trim() || null,
        footer: d.footer.trim() || null, footer_highlight: d.footer_highlight.trim() || null,
        theme: d.theme, links: d.links.filter((l) => l.href.trim() && l.label.trim()), published: d.published,
      };
      if (editing!.id) await updateAggregator(editing!.id, input);
      else await createAggregator(userId!, input);
    },
    onSuccess: () => { toast.success("Agregador salvo!"); setEditing(null); invalidate(); },
    onError: (e) => toast.error(friendlyErr(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAggregator(id),
    onSuccess: () => { toast.success("Agregador excluído."); invalidate(); },
    onError: (e) => toast.error(friendlyErr(e)),
  });

  const openEditor = (next: { id?: string; draft: Draft }) => { setSlugStatus("idle"); setEditing(next); };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/l/${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(null), 1600);
  };

  // ---------- LISTA ----------
  if (!editing) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-6 fc-fade-in">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Agregadores</h1>
            <p className="text-muted-foreground text-lg mt-1">Monte a bio de cada cliente e <strong className="text-foreground">gere um <code>/bio</code> estático</strong> para instalar no site (domínio) dele. O <code>/l/&lt;slug&gt;</code> serve de pré-visualização.</p>
          </div>
          <button onClick={() => openEditor({ draft: blankDraft() })} className="bg-primary text-black px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95 shrink-0">
            <Plus size={18} /> Novo
          </button>
        </div>

        {!hasFc && (
          <button onClick={() => openEditor({ draft: draftFromStaticFc() })} className="w-full mt-6 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 text-left flex items-center gap-3 hover:border-primary/40 transition-colors">
            <Sparkles size={18} className="text-primary shrink-0" />
            <span className="text-sm text-muted-foreground"><strong className="text-foreground">Importar o modelo Funil Comercial</strong> — abre o editor já preenchido para você editar a copy e publicar (passa a valer sobre o fallback estático).</span>
          </button>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Carregando...</p>
          ) : list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-foreground/15 p-10 text-center text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">Nenhum agregador ainda.</p>
              <p className="text-sm">Crie o primeiro em "Novo" — ou importe o modelo do Funil Comercial.</p>
            </div>
          ) : (
            list.map((a) => (
              <div key={a.id} className="rounded-2xl border border-foreground/10 bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-foreground">{a.name}</span>
                    {a.published ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary px-2 py-0.5 rounded-full">No ar</span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-foreground/10 text-muted-foreground px-2 py-0.5 rounded-full">Rascunho</span>
                    )}
                  </div>
                  <button onClick={() => copyLink(a.slug)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1" title="Copiar link">
                    /l/{a.slug} {copied === a.slug ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
                  </button>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a href={`/l/${a.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-foreground" title="Ver página"><ExternalLink size={16} /></a>
                  <button onClick={() => openEditor({ id: a.id, draft: draftFromRow(a) })} className="bg-foreground/5 hover:bg-foreground/10 text-foreground px-3 py-1.5 rounded-lg text-xs font-bold">Editar</button>
                  <button onClick={() => { if (confirm(`Excluir "${a.name}"?`)) deleteMutation.mutate(a.id); }} className="p-2 text-muted-foreground hover:text-red-400" title="Excluir"><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ---------- EDITOR ----------
  const d = editing.draft;
  const setD = (patch: Partial<Draft>) => setEditing({ ...editing, draft: { ...d, ...patch } });
  const setLink = (i: number, patch: Partial<AggregatorLink>) =>
    setD({ links: d.links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)) });
  const removeLink = (i: number) => setD({ links: d.links.filter((_, idx) => idx !== i) });
  const moveLink = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= d.links.length) return;
    const next = [...d.links];
    [next[i], next[j]] = [next[j], next[i]];
    setD({ links: next });
  };
  const addLink = () => {
    if (d.links.length >= MAX_LINKS) return;
    setD({ links: [...d.links, { variant: "secondary", icon: "link", label: "", sublabel: "", href: "" }] });
  };

  // Gera o /bio estático (autocontido) e baixa como index.html para instalar no
  // diretório do site do cliente (ex.: clinicaaurora.com.br/bio/index.html).
  const generateBio = () => {
    const html = renderBioHtml({
      name: d.name.trim() || "Agregador",
      tagline: d.tagline.trim() || undefined,
      avatarUrl: d.avatar_url.trim() || undefined,
      status: d.status.trim() || undefined,
      footer: d.footer.trim() || undefined,
      footerHighlight: d.footer_highlight.trim() || undefined,
      theme: d.theme,
      links: d.links.filter((l) => l.href.trim() && l.label.trim()),
    });
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("/bio gerado! Instale como /bio/index.html no site do cliente.");
  };

  const checkSlug = async () => {
    const s = d.slug.trim();
    if (!s) { setSlugStatus("idle"); return; }
    if (!/^[a-z0-9-]+$/.test(s)) { setSlugStatus("invalid"); return; }
    setSlugStatus("checking");
    try { setSlugStatus((await isAggregatorSlugAvailable(s, editing.id)) ? "ok" : "taken"); }
    catch { setSlugStatus("idle"); }
  };

  const canSave = d.name.trim() && d.slug.trim() && slugStatus !== "taken" && slugStatus !== "invalid" && !saveMutation.isPending;
  const field = "w-full bg-foreground/10 border border-foreground/10 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 outline-none transition-colors";
  const label = "text-sm font-semibold text-foreground/80";

  return (
    <div className="max-w-2xl mx-auto py-10 px-6 fc-fade-in">
      <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground flex items-center gap-2 mb-6 text-sm font-medium">
        <ArrowLeft size={16} /> Voltar aos agregadores
      </button>
      <h1 className="text-2xl font-black tracking-tight mb-6">{editing.id ? "Editar agregador" : "Novo agregador"}</h1>

      <div className="flex flex-col gap-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className={label}>Nome</label>
            <input className={field} value={d.name} onChange={(e) => setD({ name: e.target.value })} placeholder="Clínica Aurora" />
          </div>
          <div className="flex flex-col gap-2">
            <label className={label}>Endereço (slug)</label>
            <input
              className={field}
              value={d.slug}
              onChange={(e) => { setD({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }); setSlugStatus("idle"); }}
              onBlur={checkSlug}
              placeholder="clinicaaurora"
            />
            <span className="text-[11px] h-3">
              {slugStatus === "checking" && <span className="text-muted-foreground">verificando…</span>}
              {slugStatus === "ok" && <span className="text-primary">✓ disponível — /l/{d.slug}</span>}
              {slugStatus === "taken" && <span className="text-red-400">✗ já está em uso</span>}
              {slugStatus === "invalid" && <span className="text-red-400">só letras minúsculas, números e hífen</span>}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className={label}>Tagline</label>
          <input className={field} value={d.tagline} onChange={(e) => setD({ tagline: e.target.value })} placeholder="Agende sua avaliação sem sair do WhatsApp." />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className={label}>Avatar (URL) <span className="text-muted-foreground font-normal">— opcional</span></label>
            <input className={field} value={d.avatar_url} onChange={(e) => setD({ avatar_url: e.target.value })} placeholder="https://…/logo.png" />
          </div>
          <div className="flex flex-col gap-2">
            <label className={label}>Selo de status <span className="text-muted-foreground font-normal">— opcional</span></label>
            <input className={field} value={d.status} onChange={(e) => setD({ status: e.target.value })} placeholder="Atendendo hoje" />
          </div>
        </div>

        {/* Tema */}
        <div className="flex flex-col gap-2">
          <label className={label}>Tema</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {AGGREGATOR_THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setD({ theme: t.id })}
                className={`rounded-xl border-2 p-3 text-left transition-all ${d.theme === t.id ? "border-primary" : "border-foreground/10 hover:border-foreground/25"}`}
              >
                <div className="flex gap-1.5 mb-2">
                  <span className="w-5 h-5 rounded-full border border-foreground/10" style={{ background: t.swatch.bg }} />
                  <span className="w-5 h-5 rounded-full" style={{ background: t.swatch.accent }} />
                </div>
                <span className="text-[11px] font-semibold text-foreground/80 leading-tight block">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className={label}>Links <span className="text-muted-foreground font-normal">({d.links.length}/{MAX_LINKS})</span></label>
            <button onClick={addLink} disabled={d.links.length >= MAX_LINKS} className="text-xs font-semibold text-primary flex items-center gap-1 disabled:opacity-40"><Plus size={14} /> Adicionar</button>
          </div>
          {d.links.map((l, i) => (
            <div key={i} className="rounded-xl border border-foreground/10 bg-foreground/5 p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <select className="bg-foreground/10 border border-foreground/10 rounded-lg px-2 py-1.5 text-xs text-foreground outline-none" value={l.variant} onChange={(e) => setLink(i, { variant: e.target.value as AggregatorLink["variant"] })}>
                  <option value="primary">Primário (CTA)</option>
                  <option value="secondary">Secundário</option>
                </select>
                <select className="bg-foreground/10 border border-foreground/10 rounded-lg px-2 py-1.5 text-xs text-foreground outline-none" value={l.icon ?? "link"} onChange={(e) => setLink(i, { icon: e.target.value as AggregatorLinkIcon })}>
                  {ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                </select>
                <div className="flex-1" />
                <button onClick={() => moveLink(i, -1)} disabled={i === 0} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp size={14} /></button>
                <button onClick={() => moveLink(i, 1)} disabled={i === d.links.length - 1} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown size={14} /></button>
                <button onClick={() => removeLink(i)} className="p-1 text-muted-foreground hover:text-red-400"><X size={15} /></button>
              </div>
              <input className={field} value={l.label} onChange={(e) => setLink(i, { label: e.target.value })} placeholder="Rótulo (ex.: Agendar no WhatsApp)" />
              <div className="grid sm:grid-cols-2 gap-2">
                <input className={field} value={l.sublabel ?? ""} onChange={(e) => setLink(i, { sublabel: e.target.value })} placeholder="Sub-rótulo (opcional)" />
                <input className={field} value={l.href} onChange={(e) => setLink(i, { href: e.target.value })} placeholder="https://wa.me/55… ou https://site.com" />
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className={label}>Rodapé <span className="text-muted-foreground font-normal">— opcional</span></label>
            <input className={field} value={d.footer} onChange={(e) => setD({ footer: e.target.value })} placeholder="Presença · Aquisição · Conversão · Escala" />
          </div>
          <div className="flex flex-col gap-2">
            <label className={label}>Destaque do rodapé <span className="text-muted-foreground font-normal">— opcional</span></label>
            <input className={field} value={d.footer_highlight} onChange={(e) => setD({ footer_highlight: e.target.value })} placeholder="Conversão" />
          </div>
        </div>

        {/* Publicado */}
        <button onClick={() => setD({ published: !d.published })} className="flex items-center gap-2 text-sm font-semibold text-foreground w-fit">
          {d.published ? <Eye size={18} className="text-primary" /> : <EyeOff size={18} className="text-muted-foreground" />}
          {d.published ? "No ar (visível publicamente)" : "Rascunho (oculto)"}
        </button>

        <div className="flex items-center gap-3 pt-2 border-t border-foreground/10 mt-2">
          <button onClick={() => saveMutation.mutate()} disabled={!canSave} className="bg-primary text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            <Check size={18} /> {saveMutation.isPending ? "Salvando…" : "Salvar"}
          </button>
          <button onClick={generateBio} disabled={!d.name.trim()} className="bg-foreground/10 hover:bg-foreground/15 text-foreground px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50" title="Baixa o /bio estático para instalar no site do cliente">
            <Download size={18} /> Gerar /bio
          </button>
          {editing.id && (
            <a href={`/l/${d.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"><ExternalLink size={15} /> Pré-visualizar</a>
          )}
        </div>
      </div>
    </div>
  );
}
