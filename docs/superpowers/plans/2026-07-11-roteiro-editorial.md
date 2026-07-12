# Roteiro Editorial (`/roteiro`) — Plano de Implementação

> **For agentic workers:** Executar tarefa a tarefa. Steps com checkbox (`- [ ]`).

**Goal:** Fila persistida de próximos posts seguindo a rotação de pilares da 4.2, com deep-link para `/criativos`.

**Architecture:** Tabela Postgres (RLS por owner) + front-end React. Sem Edge Function. Registro de pilares compartilhado entre estúdio e roteiro.

**Tech Stack:** React 19 + Vite + TS, Tailwind, Supabase (Postgres/RLS), React Query, react-router-dom.

## Global Constraints

- Sem Edge Function nova (deploy 403 bloqueado). Migração aplicada pelo dono (colar SQL).
- `App.tsx` e `src/styles.css` são **WIP de prospecção** — isolar com `git stash` antes de editar/commitar `App.tsx`; restaurar depois. NÃO commitar a WIP.
- RLS `auth.uid() = owner_id` (using + with check). `owner_id` sempre da sessão, nunca do payload.
- Design dark, tokens e cards no idioma do `/criativos`. `prefers-reduced-motion` respeitado (reusa `fc-*`).
- Acesso: diretor + gestor (vendedor não vê), espelhando `/criativos`.
- Validar cada bloco com `npx tsc --noEmit` + `npm run build`.

---

### Task 1: Migração `editorial_queue`

**Files:** Create `supabase/migrations/20260713100000_editorial_queue.sql`

- [ ] Criar a migração:

```sql
-- Roteiro Editorial: fila sequencial de próximos posts (rotação de pilares 4.2).
-- Puro Postgres + RLS; sem Edge Function. Aplicar colando no SQL Editor.

create table if not exists public.editorial_queue (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  pilar text not null check (pilar in ('dor','bastidores','metodo','prova')),
  tema text not null default '',
  status text not null default 'a_fazer'
    check (status in ('a_fazer','gerado','publicado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists editorial_queue_owner_created_idx
  on public.editorial_queue (owner_id, created_at);

drop trigger if exists editorial_queue_set_updated_at on public.editorial_queue;
create trigger editorial_queue_set_updated_at
  before update on public.editorial_queue
  for each row execute function public.set_updated_at();

alter table public.editorial_queue enable row level security;

drop policy if exists "editorial_queue_crud_own" on public.editorial_queue;
create policy "editorial_queue_crud_own"
  on public.editorial_queue for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
```

- [ ] Verificar que `public.set_updated_at()` já existe (migração de canais). Se não, o trigger falha — nesse caso incluir a função antes.

**Test:** o dono cola o SQL; INSERT/SELECT respeitam RLS.

---

### Task 2: Registro de pilares compartilhado + refactor do estúdio

**Files:** Create `src/lib/editorialPillars.ts`; Modify `src/pages/Creatives.tsx`

**Interfaces produzidas:** `EDITORIAL_PILLARS`, `PillarId`, `EditorialPillar`, `getPillarById`, `getPillarByName`, `nextPillarAfter`.

- [ ] Criar `src/lib/editorialPillars.ts`:

```ts
import type { LucideIcon } from "lucide-react";
import { Target, PenTool, Lightbulb, Star } from "lucide-react";

export type PillarId = "dor" | "bastidores" | "metodo" | "prova";

export type EditorialPillar = {
  id: PillarId;
  name: string;
  objetivo: string;
  objetivoId: string; // vai no body da IA (Fase B)
  etapa: string;
  cta: string;
  desc: string;
  icon: LucideIcon;
};

// Ordem do array = rotação da 4.2 (When): Dor → Bastidores → Método → Prova.
export const EDITORIAL_PILLARS: EditorialPillar[] = [
  { id: "dor", name: "Diagnóstico da Dor", objetivo: "Atrair", objetivoId: "atrair", etapa: "Atração",
    desc: "Agita uma dor operacional real para atrair quem sente o caos, mas ainda não sabe nomeá-lo.",
    cta: "Peça um diagnóstico gratuito no WhatsApp.", icon: Target },
  { id: "bastidores", name: "Bastidores & Autoridade", objetivo: "Autoridade", objetivoId: "posicionar", etapa: "Conexão",
    desc: "Mostra a própria estrutura em ação — bastidor real, sem teatro.",
    cta: "Veja como aplicar essa estrutura no seu negócio.", icon: PenTool },
  { id: "metodo", name: "Método das 4 Camadas", objetivo: "Educar", objetivoId: "educar", etapa: "Educação",
    desc: "Explica uma camada do método: Presença, Aquisição, Conversão ou Escala.",
    cta: "Descubra qual camada está travando as vendas.", icon: Lightbulb },
  { id: "prova", name: "Prova Social por Segmento", objetivo: "Converter", objetivoId: "vender", etapa: "Conversão",
    desc: "Prova por segmento (antes/depois, diagnóstico) para converter a intenção.",
    cta: "Solicite uma análise do seu segmento.", icon: Star },
];

export const getPillarById = (id?: string | null): EditorialPillar | undefined =>
  EDITORIAL_PILLARS.find((p) => p.id === id);

export const getPillarByName = (name?: string | null): EditorialPillar | undefined =>
  EDITORIAL_PILLARS.find((p) => p.name === name);

// Próximo pilar do ciclo a partir do id; sem id (fila vazia) → o primeiro (Dor).
export function nextPillarAfter(id?: PillarId | string | null): EditorialPillar {
  const idx = EDITORIAL_PILLARS.findIndex((p) => p.id === id);
  if (idx === -1) return EDITORIAL_PILLARS[0];
  return EDITORIAL_PILLARS[(idx + 1) % EDITORIAL_PILLARS.length];
}
```

- [ ] Em `Creatives.tsx`: remover a const `PILARS` inline e importar do registro:
  `import { EDITORIAL_PILLARS as PILARS, getPillarById } from "../lib/editorialPillars";`
- [ ] Ajustar o import lucide de `Creatives.tsx`: remover `Lightbulb` e `Star` (agora só usados no registro); manter `Target` (card IA) e `PenTool` (botão manual). Rodar tsc para confirmar que não sobrou uso.
- [ ] (Nota) A ordem dos cards de pilar no estúdio passa a ser a da rotação (dor, bastidores, metodo, prova); `PILARS[0]` continua sendo "Diagnóstico da Dor", então os defaults não mudam.

**Test:** `npx tsc --noEmit` + `npm run build` limpos; `/criativos` renderiza os 4 pilares.

---

### Task 3: Tipos + camada de dados

**Files:** Modify `src/lib/types.ts`, `src/lib/crmService.ts`

**Interfaces consumidas:** `PillarId` (Task 2).
**Interfaces produzidas:** `EditorialQueueItem`, `EditorialQueueStatus`, Route `'roteiro'`, CRUD `getEditorialQueue`/`addEditorialQueueItem`/`updateEditorialQueueItemStatus`/`deleteEditorialQueueItem`.

- [ ] `types.ts`: adicionar `'roteiro'` ao union `Route`.
- [ ] `types.ts`: adicionar tipos:

```ts
import type { PillarId } from "./editorialPillars";

export type EditorialQueueStatus = "a_fazer" | "gerado" | "publicado";

export type EditorialQueueItem = {
  id: string;
  owner_id: string;
  pilar: PillarId;
  tema: string;
  status: EditorialQueueStatus;
  created_at: string;
  updated_at: string;
};
```

- [ ] `crmService.ts`: adicionar CRUD (seguindo o padrão de client `supabase` do arquivo; se o padrão usar guard de null, replicar):

```ts
export async function getEditorialQueue(ownerId: string): Promise<EditorialQueueItem[]> {
  const { data, error } = await supabase
    .from("editorial_queue")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as EditorialQueueItem[];
}

export async function addEditorialQueueItem(
  ownerId: string,
  input: { pilar: string; tema: string },
): Promise<EditorialQueueItem> {
  const { data, error } = await supabase
    .from("editorial_queue")
    .insert({ owner_id: ownerId, pilar: input.pilar, tema: input.tema })
    .select()
    .single();
  if (error) throw error;
  return data as EditorialQueueItem;
}

export async function updateEditorialQueueItemStatus(
  id: string,
  status: EditorialQueueStatus,
): Promise<void> {
  const { error } = await supabase.from("editorial_queue").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteEditorialQueueItem(id: string): Promise<void> {
  const { error } = await supabase.from("editorial_queue").delete().eq("id", id);
  if (error) throw error;
}
```

- [ ] Importar `EditorialQueueItem`/`EditorialQueueStatus` no topo de `crmService.ts`.

**Test:** `npx tsc --noEmit` limpo.

---

### Task 4: Página `EditorialPlanner`

**Files:** Create `src/pages/EditorialPlanner.tsx`

**Interfaces consumidas:** registro (Task 2), CRUD + tipos (Task 3).

- [ ] Criar a página autossuficiente (obtém user via `supabase.auth.getUser()`, React Query para dados):

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const lastPilar = queue.length ? queue[queue.length - 1].pilar : null;
  const suggested = nextPillarAfter(lastPilar);
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
            disabled={addMutation.isPending}
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
```

**Test:** `npx tsc --noEmit` limpo.

---

### Task 5: Fiação (nav, acesso, rota, deep-link)

**Files:** Modify `src/lib/navigation.ts`, `src/lib/accessControl.ts`, `src/pages/Creatives.tsx`, `src/App.tsx` (WIP-isolado)

- [ ] `navigation.ts`: importar `CalendarClock` do lucide e adicionar o item ao fim de `navigationItems`:
  `{ id: "roteiro", label: "Roteiro", icon: CalendarClock, description: "Sequência de posts seguindo a doutrina editorial." }`
- [ ] `accessControl.ts`: adicionar `"roteiro"` aos arrays de `diretor` e `gestor` (não em `vendedor`).
- [ ] `Creatives.tsx`: deep-link. Importar `useSearchParams` de `react-router-dom` e adicionar, no corpo do componente, um efeito de mount:

```tsx
const [searchParams, setSearchParams] = useSearchParams();
useEffect(() => {
  const slug = searchParams.get("pilar");
  if (!slug) return;
  const p = getPillarById(slug);
  if (!p) return;
  setPilar(p.name);
  setObjective(p.objetivoId);
  setIdea(searchParams.get("tema") ?? "");
  setManualStage(2);
  setStep("manual");
  setSearchParams({}, { replace: true }); // evita re-disparo no refresh
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

- [ ] `App.tsx` (isolar WIP primeiro): `git stash push src/App.tsx src/styles.css`.
- [ ] `App.tsx`: `import EditorialPlannerPage from "./pages/EditorialPlanner";` e a rota
  `<Route path="/roteiro" element={<EditorialPlannerPage />} />` junto às privadas.
- [ ] `npx tsc --noEmit` + `npm run build`.
- [ ] Commit dos arquivos do roteiro (migração, editorialPillars, EditorialPlanner, Creatives, crmService, types, navigation, accessControl, App.tsx).
- [ ] `git stash pop` para restaurar a WIP de prospecção.

**Test:** build limpo; `/roteiro` no menu (diretor/gestor); adicionar item; mudar status; Gerar → abre `/criativos` no Passo 2 com pilar+tema; excluir remove.

---

## Self-Review

- **Cobertura:** migração (T1), registro+refactor (T2), tipos+dados (T3), página (T4), fiação+deep-link (T5) → cobre todo o spec.
- **Consistência de tipos:** `PillarId` definido em `editorialPillars.ts`, consumido por `types.ts` (import type, sem ciclo — `editorialPillars` não importa `types`). CRUD retorna `EditorialQueueItem`.
- **Sem placeholders:** código completo em cada arquivo.
- **Risco WIP:** App.tsx isolado por stash; restaurar com pop após commit.
- **Nota de deploy:** migração aplicada pelo dono (colar SQL) — a feature só funciona após isso.
