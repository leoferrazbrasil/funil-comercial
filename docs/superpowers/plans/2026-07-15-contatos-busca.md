# Busca na Pagina de Contatos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a visible contact search field to `/contatos`, synchronized with the existing global search.

**Architecture:** `ContactsPage` already filters contacts with `matchesQuery(query, [...])`; keep that filtering as the single source of truth. Add an `onQueryChange` prop from `App.tsx`, render a page-local search control, and update empty/count copy from the filtered result.

**Tech Stack:** React, TypeScript, Vite, Vitest, Tailwind-style utility classes, lucide-react icons.

## Global Constraints

- Search fields: `nome`, `telefone`, `email`, `origem`, `potencial`.
- Placeholder text: `Buscar por nome, telefone, e-mail, origem ou potencial...`
- The page search must stay synchronized with the global shell search.
- Show an `X` clear button only when search text exists.
- Count must indicate filtered vs total contacts when search is active, for example `8 de 23 contatos`.
- Do not add remote database search, debounce, pagination, advanced filters, URL persistence, or global search changes on other pages.

---

### Task 1: Add Page Search Contract

**Files:**
- Modify: `src/pages/Contacts.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: existing `ContactsPage({ contacts, query, ... })`.
- Produces: `ContactsPage` prop `onQueryChange: (query: string) => void`.

- [ ] **Step 1: Update the `ContactsPage` function parameters and props type**

In `src/pages/Contacts.tsx`, change the function signature from:

```ts
export default function ContactsPage({
  contacts,
  query,
  isSaving,
  onConvertContact,
  onDeleteContact,
  onEditContact,
  onOpenModal,
}: {
  contacts: Contact[];
  query: string;
  isSaving: boolean;
  onConvertContact: (contact: Contact) => Promise<void>;
  onDeleteContact: (contactId: string) => Promise<void>;
  onEditContact: (contact: Contact) => void;
  onOpenModal: (modal: ModalType) => void;
}) {
```

to:

```ts
export default function ContactsPage({
  contacts,
  query,
  isSaving,
  onConvertContact,
  onDeleteContact,
  onEditContact,
  onOpenModal,
  onQueryChange,
}: {
  contacts: Contact[];
  query: string;
  isSaving: boolean;
  onConvertContact: (contact: Contact) => Promise<void>;
  onDeleteContact: (contactId: string) => Promise<void>;
  onEditContact: (contact: Contact) => void;
  onOpenModal: (modal: ModalType) => void;
  onQueryChange: (query: string) => void;
}) {
```

- [ ] **Step 2: Pass `setQuery` from `App.tsx`**

In the `/contatos` route inside `src/App.tsx`, add:

```tsx
                  onQueryChange={setQuery}
```

The route should include:

```tsx
                <ContactsPage
                  contacts={snapshot.contacts}
                  query={query}
                  isSaving={isSaving}
                  onConvertContact={handleConvertContact}
                  onDeleteContact={handleDeleteContact}
                  onEditContact={(contact) =>
                    openEditModal({ type: "contact", record: contact })
                  }
                  onOpenModal={openModal}
                  onQueryChange={setQuery}
                />
```

- [ ] **Step 3: Run typecheck to verify the new required prop is wired**

Run:

```bash
npm run typecheck
```

Expected: PASS. If it fails because `onQueryChange` is missing, add it to the `/contatos` route only.

- [ ] **Step 4: Commit Task 1**

```bash
git add src/pages/Contacts.tsx src/App.tsx
git commit -m "feat: wire contacts search query"
```

---

### Task 2: Render Search Field and Filter Feedback

**Files:**
- Modify: `src/pages/Contacts.tsx`

**Interfaces:**
- Consumes: `query: string`, `onQueryChange: (query: string) => void`, `filteredContacts`.
- Produces: page-local search field with clear button, filtered count copy, and query-aware empty state.

- [ ] **Step 1: Add derived search state**

After `filteredContacts`, add:

```ts
  const hasSearch = query.trim().length > 0;
  const contactsCountLabel = hasSearch
    ? `${filteredContacts.length} de ${contacts.length} contatos`
    : `${filteredContacts.length} registros`;
```

- [ ] **Step 2: Update empty state description**

Change the `EmptyState` description inside `renderDataGrid` from:

```tsx
            description="Cadastre, organize e encontre rapidamente pessoas que podem virar leads."
```

to:

```tsx
            description={
              hasSearch
                ? "Nenhum contato encontrado para a busca atual."
                : "Cadastre, organize e encontre rapidamente pessoas que podem virar leads."
            }
```

- [ ] **Step 3: Update header count text**

Change:

```tsx
            Sua agenda centralizada ({filteredContacts.length} registros).
```

to:

```tsx
            Sua agenda centralizada ({contactsCountLabel}).
```

- [ ] **Step 4: Add the search field under the header**

After the header actions block and before the main content area, add:

```tsx
      <div className="shrink-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative flex-1 max-w-2xl">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar por nome, telefone, e-mail, origem ou potencial..."
            className="w-full min-h-11 rounded-2xl border border-foreground/10 bg-card px-10 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-foreground/[0.02]"
          />
          {hasSearch ? (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
              aria-label="Limpar busca"
            >
              <X size={16} />
            </button>
          ) : null}
        </label>
        {hasSearch ? (
          <span className="text-xs font-semibold text-muted-foreground">
            {contactsCountLabel}
          </span>
        ) : null}
      </div>
```

- [ ] **Step 5: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit Task 2**

```bash
git add src/pages/Contacts.tsx
git commit -m "feat: add contacts page search"
```

---

### Task 3: Final Verification

**Files:**
- Verify: `src/pages/Contacts.tsx`
- Verify: `src/App.tsx`

**Interfaces:**
- Consumes: outputs from Task 1 and Task 2.
- Produces: verified branch ready for merge or push.

- [ ] **Step 1: Run tests**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: PASS. If `public/sitemap.xml` changes only because the sitemap script regenerated it, restore it:

```bash
git restore -- public/sitemap.xml
```

- [ ] **Step 4: Review final diff**

Run:

```bash
git diff --stat main..HEAD
git diff main..HEAD -- src/pages/Contacts.tsx src/App.tsx
```

Expected: only the contact search wiring and UI should appear.
