import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Wand2, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabase";
import {
  EDITORIAL_PILLARS,
  getPillarById,
  nextPillarAfter,
  type PillarId,
} from "../lib/editorialPillars";
import {
  addEditorialQueueItem,
  deleteEditorialQueueItem,
  getEditorialQueue,
  updateEditorialQueueItemStatus,
} from "../lib/crmService";
import type { EditorialQueueItem, EditorialQueueStatus } from "../lib/types";

const STATUS_OPTIONS: { value: EditorialQueueStatus; label: string }[] = [
  { value: "a_fazer", label: "A fazer" },
  { value: "gerado", label: "Gerado" },
  { value: "publicado", label: "Publicado" },
];

export default function EditorialPlannerPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [tema, setTema] = useState("");
  const [pilarId, setPilarId] = useState<PillarId>(EDITORIAL_PILLARS[0].id);
  const [pilarTouched, setPilarTouched] = useState(false);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { data: queue = [], isLoading } = useQuery({
    queryKey: ["editorialQueue", userId],
    queryFn: () => getEditorialQueue(userId!),
    enabled: !!userId,
  });

  // Próximo sugerido = próximo do ciclo após o último item da fila (ou Dor, se vazia).
  const lastPilar = queue.length ? queue[queue.length - 1].pilar : null;
  const suggested = nextPillarAfter(lastPilar);
  // Enquanto o usuário não mexer no select, ele acompanha a sugestão.
  const effectivePilarId: PillarId = pilarTouched ? pilarId : suggested.id;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["editorialQueue", userId] });

  const addMutation = useMutation({
    mutationFn: () =>
      addEditorialQueueItem(userId!, { pilar: effectivePilarId, tema: tema.trim() }),
    onSuccess: () => {
      setTema("");
      setPilarTouched(false);
      invalidate();
    },
  });
  const statusMutation = useMutation({
    mutationFn: (v: { id: string; status: EditorialQueueStatus }) =>
      updateEditorialQueueItemStatus(v.id, v.status),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEditorialQueueItem(id),
    onSuccess: invalidate,
  });

  const openStudio = (item: EditorialQueueItem) => {
    const params = new URLSearchParams({ pilar: item.pilar });
    if (item.tema) params.set("tema", item.tema);
    navigate(`/criativos?${params.toString()}`);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-6 fc-fade-in">
      <h1 className="text-3xl font-black mb-2 tracking-tight">Roteiro Editorial</h1>
      <p className="text-muted-foreground mb-8 text-lg">
        Planeje a sequência de posts seguindo a doutrina 4.2 — um pilar de cada vez.
      </p>

      {/* Próximo sugerido + adicionar */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/10 to-transparent p-5 mb-8 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles size={15} className="text-primary" />
          <span>
            Próximo sugerido na rotação:{" "}
            <strong className="text-foreground">{suggested.name}</strong>
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={effectivePilarId}
            onChange={(e) => {
              setPilarId(e.target.value as PillarId);
              setPilarTouched(true);
            }}
            className="bg-foreground/10 border border-foreground/10 rounded-xl p-3 text-sm text-foreground focus:border-primary/50 outline-none"
          >
            {EDITORIAL_PILLARS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.objetivo}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            placeholder="Tema do post (opcional)"
            className="flex-1 bg-foreground/10 border border-foreground/10 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 outline-none"
          />
          <button
            onClick={() => addMutation.mutate()}
            disabled={addMutation.isPending || !userId}
            className="bg-primary text-black px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
          >
            <Plus size={18} /> Adicionar
          </button>
        </div>
      </div>

      {/* Lista / fila */}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando roteiro...</p>
      ) : queue.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-foreground/15 p-10 text-center text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">Seu roteiro está vazio.</p>
          <p className="text-sm">
            Comece pelo <strong>Diagnóstico da Dor</strong> — o topo de funil da rotação.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {queue.map((item) => {
            const p = getPillarById(item.pilar);
            const Icon = p?.icon ?? Sparkles;
            return (
              <li
                key={item.id}
                className="rounded-2xl border border-foreground/10 bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-foreground/5 text-muted-foreground flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-foreground">{p?.name ?? item.pilar}</span>
                    {p && (
                      <>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                          {p.objetivo}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-foreground/10 text-muted-foreground px-2 py-0.5 rounded-full">
                          {p.etapa}
                        </span>
                      </>
                    )}
                  </div>
                  {item.tema && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">"{item.tema}"</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      statusMutation.mutate({
                        id: item.id,
                        status: e.target.value as EditorialQueueStatus,
                      })
                    }
                    className="bg-foreground/10 border border-foreground/10 rounded-lg px-2 py-1.5 text-xs text-foreground focus:border-primary/50 outline-none"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => openStudio(item)}
                    className="bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    title="Gerar no estúdio"
                  >
                    <Wand2 size={13} /> Gerar
                    <ArrowRight size={13} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                    title="Remover"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
