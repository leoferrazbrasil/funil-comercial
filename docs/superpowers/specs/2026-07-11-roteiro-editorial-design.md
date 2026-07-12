# Roteiro Editorial (`/roteiro`) — Design

**Data:** 2026-07-11
**Status:** aprovado (brainstorming concluído)

## Objetivo

Dar ao usuário uma **fila persistida de próximos posts** que segue a rotação de
pilares prescrita pela Matriz 5W2H (Brandbook 04 → 4.2 "When"), resolvendo a
orquestração da **sequência temporal** que o estúdio `/criativos` (peça isolada)
não faz. A v1 é um **roteiro sequencial** (sem datas/calendário), com deep-link
para o estúdio.

## Contexto e motivação

O `/criativos` gera **um post de cada vez**, sem noção de ordem. A 4.2 prescreve
uma **cadência** de pilares (progressão atrair → conectar → educar → provar).
Nada hoje guia o usuário nessa rotação. O Estrategista de IA (`ai-recommend-post`)
seria o motor de continuidade, mas está **offline** (Fase B, bloqueada por deploy
403). Portanto o Roteiro precisa funcionar **sem IA**, deixando um gancho para a
IA ler a fila no futuro.

## Decisões (do brainstorming)

1. **Forma:** fila / roteiro sequencial (sem datas).
2. **Persistência:** banco (Supabase, por dono), padrão RLS do app.
3. **Item:** pilar + tema + status em 3 estados (A fazer → Gerado → Publicado).
4. **Integração:** deep-link para `/criativos` + status marcado manualmente.
5. **Lugar/nome:** rota e item de menu próprios — **"Roteiro"** (`/roteiro`).
6. **Acesso:** diretor e gestor (espelha `/criativos`; vendedor não vê).

## Rotação de pilares (4 pilares, ordem da 4.2)

Ciclo canônico, repetindo:

```
Diagnóstico da Dor → Bastidores & Autoridade → Método das 4 Camadas → Prova Social por Segmento ↺
```

A 4.2 lista Sexta como "Conversão / CTA direto", que **não é um 5º pilar** — é uma
intenção de CTA. Como o Brandbook 4.1 define exatamente 4 pilares, a rotação usa os
4 (a etapa "Conversão" já pertence à Prova Social). **Confirmado pelo usuário.**

## Arquitetura

Pura **tabela Postgres + front-end**. Sem Edge Function nova (não esbarra no 403 de
deploy). A migração é aplicada pelo dono colando o SQL.

### Registro compartilhado de pilares — `src/lib/editorialPillars.ts`

Extrair a lista `PILARS` de dentro de `Creatives.tsx` para um módulo compartilhado,
fonte única para o estúdio e o roteiro. Exporta:

```ts
export type PillarId = "dor" | "bastidores" | "metodo" | "prova";

export type EditorialPillar = {
  id: PillarId;
  name: string;          // "Diagnóstico da Dor"
  objetivo: string;      // "Atrair"
  objetivoId: string;    // "atrair" | "posicionar" | "educar" | "vender" (body da IA)
  etapa: string;         // "Atração"
  cta: string;
  desc: string;
  icon: LucideIcon;
};

export const EDITORIAL_PILLARS: EditorialPillar[];      // ordem = rotação da 4.2
export const getPillarById(id: string): EditorialPillar | undefined;
export const getPillarByName(name: string): EditorialPillar | undefined;
export function nextPillarAfter(id?: PillarId | null): EditorialPillar; // próximo do ciclo; dor se vazio
```

Ordem do array = rotação: `dor, bastidores, metodo, prova`.
`Creatives.tsx` passa a importar `EDITORIAL_PILLARS` (renomeando seu uso interno de
`PILARS`) — mantém nome/objetivo/etapa/CTA/ícone em sincronia.

### Tabela `editorial_queue`

```sql
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

Ordenação da fila = `created_at` asc (o mais antigo é o "próximo"). Objetivo/etapa/
CTA **não** são gravados — derivam do pilar via o registro compartilhado.
`set_updated_at()` já existe (migração de canais).

### Camada de dados — `src/lib/crmService.ts`

```ts
getEditorialQueue(ownerId: string): Promise<EditorialQueueItem[]>          // order by created_at asc
addEditorialQueueItem(ownerId, { pilar, tema }): Promise<EditorialQueueItem>
updateEditorialQueueItemStatus(id, status): Promise<void>
deleteEditorialQueueItem(id): Promise<void>
```

`owner_id` sempre vem do `session.user.id` (nunca do cliente arbitrário); a RLS
`with check (auth.uid() = owner_id)` barra inserção em conta alheia.

### Tipos — `src/lib/types.ts`

```ts
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
// Route: adicionar 'roteiro'
```

### Página — `src/pages/EditorialPlanner.tsx`

Componente autossuficiente (como `Creatives`/`Settings`): obtém o usuário via
`supabase.auth.getUser()` e gerencia os dados com React Query
(`useQuery(['editorialQueue', ownerId])` + mutations que invalidam a chave).

Layout (design dark, tokens, cards no idioma do `/criativos`):

- **Cabeçalho:** título "Roteiro" (via nav) + subtítulo referenciando a 4.2.
- **Bloco "Próximo sugerido":** calcula `nextPillarAfter(último item da fila?.pilar)`;
  mostra o pilar sugerido; um `<select>` de pilar já vem nesse valor (editável) + um
  input de tema + botão **Adicionar** (chama `addEditorialQueueItem`).
- **Lista de itens** (ordem = fila): cada item com ícone + nome do pilar + badges
  (objetivo/etapa), tema, controle de **status** (3 estados, via `<select>` inline
  no padrão do app), botão **Gerar →** e excluir.
- **Gerar →** navega para `/criativos?pilar=<slug>&tema=<encodeURIComponent(tema)>`.
- **Estado vazio:** convite para começar pelo Diagnóstico da Dor (topo de funil).
- **Loading/erro:** faixa simples, no padrão do app.

### Deep-link no estúdio — `src/pages/Creatives.tsx`

Ao montar, ler `useSearchParams()`. Se houver `pilar`:
- resolve o slug via `getPillarById`;
- `setPilar(p.name)`, `setObjective(p.objetivoId)`, `setIdea(temaParam ?? "")`;
- `setManualStage(2)` e `setStep("manual")`.

A busca da recomendação de IA continua rodando em background (inofensiva). Só dispara
uma vez (guard de mount). Slug inválido → ignora (fluxo normal, começa em "path").

### Navegação e acesso

- `src/lib/navigation.ts`: novo item `{ id: "roteiro", label: "Roteiro", icon: CalendarClock, description: "Sequência de posts seguindo a doutrina editorial." }`.
- `src/lib/accessControl.ts`: adicionar `'roteiro'` a `diretor` e `gestor` (não a `vendedor`).
- `src/lib/types.ts`: `Route` ganha `'roteiro'`.
- `src/App.tsx`: `import EditorialPlannerPage` + `<Route path="/roteiro" element={<EditorialPlannerPage />} />`.
  **App.tsx é WIP de prospecção** → isolar com `git stash` antes de editar/commitar,
  restaurando a WIP depois.

## Arquivos

- **Criar:** `supabase/migrations/<ts>_editorial_queue.sql`, `src/lib/editorialPillars.ts`,
  `src/pages/EditorialPlanner.tsx`
- **Modificar:** `src/pages/Creatives.tsx`, `src/lib/crmService.ts`, `src/lib/types.ts`,
  `src/lib/navigation.ts`, `src/lib/accessControl.ts`, `src/App.tsx`

## Fora do escopo (v1 — YAGNI)

Datas/calendário mensal, reordenar por drag, auto-marcar "Gerado" via estúdio,
integração com a IA de continuidade (Fase B), papéis além de diretor/gestor,
vínculo duro entre item e criativo gerado (criativos não são persistidos hoje).

## Segurança

- RLS `auth.uid() = owner_id` (using + with check) — mesmo padrão de `campaigns`.
- `owner_id` derivado da sessão no front, nunca do payload do cliente.
- Sem Edge Function nova → sem novo vetor server-side.

## Testabilidade

- **Migração:** aplicável isolada; SELECT/INSERT respeitando RLS.
- **`editorialPillars.ts`:** `nextPillarAfter` é função pura (ciclo + caso vazio) — testável direto.
- **Deep-link:** `/criativos?pilar=dor&tema=x` cai no Passo 2 com pilar/tema corretos.
- **CRUD:** add → aparece na fila; status muda; delete remove — via UI.
