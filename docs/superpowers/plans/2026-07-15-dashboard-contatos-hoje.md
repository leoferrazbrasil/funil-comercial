# Dashboard Contatos Hoje Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show how many contacts must be made today to stay on pace for the monthly cash goal.

**Architecture:** Extend the existing pure metric engine in `src/lib/dashboardMetrics.ts` so the daily pace is computed from monthly contacts still missing, not from the raw monthly target. Then update the existing `ProjectionResult` card in `src/pages/Dashboard.tsx` to label and contextualize the result as "Contatos para hoje".

**Tech Stack:** React, TypeScript, Vitest, Vite, existing dashboard metric helpers.

## Global Constraints

- Use the approved formula: `ceil(max(0, contatosNecessariosNoMes - contatosRealizadosNoMes) / diasUteisRestantes)`.
- `contactsRealized` must come from `realMetrics.currentMonth.contacts`.
- Keep monthly total contacts visible in the simulator.
- If rates are missing, rates are zero, or ticket/setup is invalid, do not show a false daily number.
- Do not add editable daily goals, holiday calendars, current-day-only contact tracking, or automatic notifications.

---

### Task 1: Add Contacts-Today Projection Math

**Files:**
- Modify: `src/lib/dashboardMetrics.ts`
- Test: `src/lib/dashboardMetrics.test.ts`

**Interfaces:**
- Consumes: existing `calculateGoalProjection(input: GoalProjectionInput): GoalProjection`.
- Produces:
  - `GoalProjectionInput.contactsRealized?: number`
  - `GoalProjection.contactsRemaining: number | null`
  - `GoalProjection.contactsNeededToday: number | null`

- [ ] **Step 1: Write failing tests for remaining contacts and daily pace**

Add these tests inside `describe("calculateGoalProjection", () => { ... })` in `src/lib/dashboardMetrics.test.ts`:

```ts
  it("calculates contacts needed today from remaining monthly contacts", () => {
    const projection = calculateGoalProjection({
      monthlyCashGoal: 5000,
      setupTicket: 497,
      mrrPerSale: 37.9,
      contactToLeadRate: 0.5,
      leadToSaleRate: 0.25,
      contactsRealized: 17,
      now,
    });

    expect(projection.status).toBe("ok");
    expect(projection.contactsNeeded).toBe(88);
    expect(projection.contactsRemaining).toBe(71);
    expect(projection.contactsNeededToday).toBe(6);
  });

  it("returns zero contacts needed today when monthly contact target is already covered", () => {
    const projection = calculateGoalProjection({
      monthlyCashGoal: 5000,
      setupTicket: 497,
      mrrPerSale: 37.9,
      contactToLeadRate: 0.5,
      leadToSaleRate: 0.25,
      contactsRealized: 100,
      now,
    });

    expect(projection.status).toBe("ok");
    expect(projection.contactsRemaining).toBe(0);
    expect(projection.contactsNeededToday).toBe(0);
  });

  it("does not expose contacts needed today when rates are missing", () => {
    const projection = calculateGoalProjection({
      monthlyCashGoal: 5000,
      setupTicket: 497,
      mrrPerSale: 37.9,
      contactToLeadRate: null,
      leadToSaleRate: null,
      contactsRealized: 17,
      now,
    });

    expect(projection.status).toBe("needs_rates");
    expect(projection.contactsRemaining).toBeNull();
    expect(projection.contactsNeededToday).toBeNull();
  });
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- src/lib/dashboardMetrics.test.ts
```

Expected: FAIL because `contactsRealized`, `contactsRemaining`, and `contactsNeededToday` do not exist yet.

- [ ] **Step 3: Extend types and invalid-state returns**

In `src/lib/dashboardMetrics.ts`, update the types:

```ts
export type GoalProjectionInput = {
  monthlyCashGoal: number;
  setupTicket: number;
  mrrPerSale: number;
  contactToLeadRate: number | null;
  leadToSaleRate: number | null;
  contactsRealized?: number;
  now: Date;
};
```

```ts
export type GoalProjection = {
  status: GoalProjectionStatus;
  salesNeeded: number | null;
  leadsNeeded: number | null;
  contactsNeeded: number | null;
  contactsRemaining: number | null;
  contactsNeededToday: number | null;
  contactsPerSale: number | null;
  contactsPerBusinessDayRemaining: number | null;
  cashProjected: number;
  newMrrProjected: number;
  businessDaysRemaining: number;
};
```

For the `invalid_ticket`, `needs_rates`, and `unreachable` returns, add:

```ts
contactsRemaining: null,
contactsNeededToday: null,
```

- [ ] **Step 4: Implement the daily pace calculation**

Inside `calculateGoalProjection`, after `contactsNeeded` is calculated:

```ts
  const contactsRealized = Math.max(0, Number(input.contactsRealized) || 0);
  const contactsRemaining = Math.max(0, contactsNeeded - contactsRealized);
  const contactsNeededToday =
    businessDaysRemaining > 0 ? Math.ceil(contactsRemaining / businessDaysRemaining) : null;
```

Return these values in the `ok` result:

```ts
    contactsRemaining,
    contactsNeededToday,
```

Keep `contactsPerBusinessDayRemaining` for backward compatibility, but set it to the same daily pace value:

```ts
    contactsPerBusinessDayRemaining: contactsNeededToday,
```

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:

```bash
npm test -- src/lib/dashboardMetrics.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

```bash
git add src/lib/dashboardMetrics.ts src/lib/dashboardMetrics.test.ts
git commit -m "feat: calculate dashboard contacts for today"
```

---

### Task 2: Show Contacts for Today in the Dashboard

**Files:**
- Modify: `src/pages/Dashboard.tsx`

**Interfaces:**
- Consumes: `GoalProjection.contactsRemaining` and `GoalProjection.contactsNeededToday`.
- Produces: UI card labeled `Contatos para hoje` with context `X restantes / Y dias uteis`.

- [ ] **Step 1: Pass realized contacts into the projection**

In `src/pages/Dashboard.tsx`, update the `calculateGoalProjection` call:

```ts
  const projection = calculateGoalProjection({
    monthlyCashGoal,
    setupTicket,
    mrrPerSale,
    contactToLeadRate,
    leadToSaleRate,
    contactsRealized: realMetrics.currentMonth.contacts,
    now: new Date(),
  });
```

- [ ] **Step 2: Update `ProjectionResult` copy and context**

In `ProjectionResult`, replace the `MiniMetric` currently labeled `Contatos por dia útil` with:

```tsx
      <MiniMetric
        label="Contatos para hoje"
        value={formatNumber(projection.contactsNeededToday)}
        hint={
          projection.contactsRemaining === null
            ? undefined
            : `${formatNumber(projection.contactsRemaining)} restantes / ${formatNumber(projection.businessDaysRemaining)} dias úteis`
        }
      />
```

- [ ] **Step 3: Allow `MiniMetric` to render an optional hint**

Change the component signature:

```tsx
function MiniMetric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-foreground/5 bg-foreground/[0.02] p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <strong className="mt-1 block text-lg font-bold text-foreground">{value}</strong>
      {hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}
```

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: show dashboard contacts for today"
```

---

### Task 3: Final Verification

**Files:**
- Verify: `src/lib/dashboardMetrics.ts`
- Verify: `src/lib/dashboardMetrics.test.ts`
- Verify: `src/pages/Dashboard.tsx`

**Interfaces:**
- Consumes: outputs from Task 1 and Task 2.
- Produces: verified branch with tests, typecheck, and build evidence.

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

Expected: PASS. If `public/sitemap.xml` is regenerated, restore it unless the diff is intentionally part of this task:

```bash
git restore -- public/sitemap.xml
```

- [ ] **Step 4: Check final Git state**

Run:

```bash
git status --short --branch
```

Expected: only unrelated pre-existing local files may remain outside the task files.
