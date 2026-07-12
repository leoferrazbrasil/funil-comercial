# Agregadores Multi-tenant — Design

**Data:** 2026-07-12
**Status:** aprovado (brainstorming)

## Objetivo

Transformar o agregador de links (`/l/:slug`) num **produto multi-tenant**: o dono
cria/edita agregadores por cliente numa **tela de admin no CRM**, cada um com seu
**tema** (preset), sem tocar código. A página pública passa a ler do **banco**.

## Decisões (brainstorming)

1. **Temas:** presets curados (4), não custom. `src/lib/aggregatorThemes.ts`.
2. **Admin:** rota/menu próprios `/agregadores` (diretor/gestor).
3. **FC:** DB-first com **fallback estático** (`aggregators.ts`). A copy do FC é
   editável criando um registro no banco com slug `funilcomercial` (admin oferece
   "importar do modelo FC"); o registro do banco tem precedência sobre o estático.
4. **published:** rascunho × no ar. 5. **Links:** até 5 por agregador.

## Arquitetura

Puro Postgres + front-end. **Sem Edge Function** (leitura pública via cliente anon
+ RLS; escrita pelo admin autenticado). Migração aplicada pelo dono (colar SQL).

### Tabela `aggregators`
```sql
create table public.aggregators (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  tagline text not null default '',
  avatar_url text,
  status text,
  footer text,
  footer_highlight text,
  theme text not null default 'funil',
  links jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index aggregators_owner_idx on public.aggregators (owner_id, created_at desc);
-- trigger set_updated_at (já existe)
```

### RLS (o desvio: leitura pública)
```sql
alter table public.aggregators enable row level security;
-- dono faz tudo no que é seu
create policy aggregators_owner_all on public.aggregators
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
-- qualquer um (inclusive anônimo) lê os PUBLICADOS
create policy aggregators_public_read on public.aggregators
  for select using (published = true);
```
Policies permissivas são OR: o dono vê os seus (todos) + todos veem os publicados.
Rascunhos não vazam. `owner_id` sempre da sessão no front (nunca do payload).

### Tipos — `src/lib/types.ts`
`Aggregator` (linha do banco; `links: AggregatorLink[]`, `theme: string`,
`published: boolean`), reusa `AggregatorLink` de `aggregators.ts`. `Route` += `'agregadores'`.

### Temas — `src/lib/aggregatorThemes.ts`
```ts
type AggregatorTheme = { id: string; name: string; vars: Record<string, string> }; // CSS vars --agg-*
export const AGGREGATOR_THEMES: AggregatorTheme[];   // 4 presets
export const getTheme(id?): AggregatorTheme;          // fallback 'funil'
```
Presets (paletas testadas p/ contraste/hover, claro e escuro):
- **funil** — Preto & Ouro (o atual: bg #060606, accent #f5b417, status esmeralda).
- **grafite-esmeralda** — grafite + esmeralda (accent #10b981).
- **claro-premium** — off-white + texto escuro + ouro.
- **azul-confianca** — navy profundo + azul (médicos/advogados).

`LinkAggregator` deixa de ter cor hardcoded: o `.agg-*` usa `var(--agg-*)`, setadas
por `style={theme.vars}` no container. Presets dirigem tudo (bg, texto, accent,
botão, glow, status, funil).

### Camada de dados — `src/lib/crmService.ts`
```
getMyAggregators(ownerId): Aggregator[]          // do dono, ordenado
getAggregatorBySlug(slug): Aggregator | null     // PÚBLICO (published), p/ a página /l/:slug
createAggregator(ownerId, input): Aggregator
updateAggregator(id, patch): void
deleteAggregator(id): void
isAggregatorSlugAvailable(slug, exceptId?): boolean
```

### Página pública — `src/pages/LinkAggregator.tsx`
- Busca `getAggregatorBySlug(slug)` no banco → se achar, renderiza (com o tema).
- Senão, **fallback** `AGGREGATORS[slug]` (estático). Senão, "não encontrado".
- Estado de carregamento. Renderização dirigida pelo tema (CSS vars).

### Admin — `src/pages/AggregatorsAdmin.tsx` (`/agregadores`)
- **Lista** dos agregadores do dono (React Query): card com nome, `/l/slug`
  (copiar/abrir), selo publicado/rascunho, editar, excluir. Botão **"Importar
  modelo Funil Comercial"** (se ainda não houver registro `funilcomercial`) que
  abre o editor pré-preenchido da config estática.
- **Editor** (modal ou painel): name · slug (com checagem de disponibilidade) ·
  tagline · avatar_url · status · footer · footer_highlight · **tema** (swatches) ·
  **links** (até 5; adicionar/remover/reordenar; cada: label, sublabel, href,
  variant primary/secondary, icon whatsapp/globe/link) · **published** (toggle) ·
  "ver página" (abre `/l/slug`).
- Segue o design system do app (Tailwind, tokens theme-aware).

### Fiação
`navigation.ts` (item "Agregadores"), `accessControl.ts` (diretor/gestor),
`types.ts` (Route), `App.tsx` (rota privada `/agregadores` — **WIP-isolada** com
`git stash`; a pública `/l/:slug` já existe).

## Arquivos
- **Criar:** migração SQL · `src/lib/aggregatorThemes.ts` · `src/pages/AggregatorsAdmin.tsx`
- **Modificar:** `src/lib/aggregators.ts` (exporta `AggregatorLink` reutilizável),
  `src/pages/LinkAggregator.tsx` (DB + temas), `src/lib/crmService.ts`,
  `src/lib/types.ts`, `src/lib/navigation.ts`, `src/lib/accessControl.ts`, `src/App.tsx`

## Segurança
- RLS: dono CRUD do seu; leitura pública só `published = true`. `owner_id` da sessão.
- Sem Edge Function → sem novo vetor server-side. Migração pelo dono (colar SQL).
- `slug` global unique + check de formato (`^[a-z0-9-]+$`); admin valida disponibilidade.

## Fora do escopo (v1)
Temas custom, domínio próprio por cliente, analytics de clique, upload de avatar
(só URL), agregador vinculado a contato do CRM.
