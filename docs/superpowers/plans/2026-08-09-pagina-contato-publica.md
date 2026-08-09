# Página de Contato Pública Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar `/contato` como uma página pública responsiva que registra solicitações no CRM através do intake Supabase existente.

**Architecture:** A rota pública será carregada pela SPA React e usará o `LeadCaptureForm` em modo detalhado. O navegador continuará enviando dados apenas para a Edge Function `lead-intake`, que valida, normaliza e grava um lead no owner padrão. O motivo e a mensagem serão persistidos no campo existente `leads.interesse`, evitando uma nova tabela.

**Tech Stack:** React 19, React Router 8, Vite, Tailwind CSS, lucide-react, Supabase Edge Functions/Deno, Vitest.

## Global Constraints

- A rota `/contato` deve funcionar sem autenticação e ser adicionada a `PUBLIC_PATHS` e ao bloco de rotas públicas.
- O endereço exibido é exatamente `Rua Liberal, 1329, 12, Tristeza, Porto Alegre, RS, CEP 91920-680`.
- O formulário deve manter honeypot, estados de envio/sucesso/erro e rastreamento de conversão.
- A Edge Function não pode aceitar chaves privadas no navegador.
- A origem pública permitida para esta página é `Página de contato`; demais envios continuam como `Site`.
- Não modificar nem incluir no commit os sitemaps e artefatos de prospecção já pendentes.

---

### Task 1: Definir e testar o contrato do formulário detalhado

**Files:**
- Create: `src/lib/leadIntake.ts`
- Test: `src/lib/leadIntake.test.ts`

**Interfaces:**
- Produces `ContactLeadFields = { email: string; origem: string; interesse: string; mensagem: string }` for the contact form payload.
- Produces `buildLeadInterest(interesse, mensagem): string`.
- Produces `isValidOptionalEmail(email): boolean`.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from "vitest";
import { buildLeadInterest, isValidOptionalEmail } from "./leadIntake";

describe("lead intake helpers", () => {
  it("combines the selected reason and message for CRM interest", () => {
    expect(buildLeadInterest("Quero conhecer o CRM", "Preciso organizar meu WhatsApp.")).toBe(
      "Motivo: Quero conhecer o CRM\n\nMensagem: Preciso organizar meu WhatsApp.",
    );
  });

  it("keeps the fallback interest when both optional fields are empty", () => {
    expect(buildLeadInterest("", "")).toBe("Solicitou contato pela página de contato");
  });

  it("accepts an empty email and rejects malformed optional email", () => {
    expect(isValidOptionalEmail("")).toBe(true);
    expect(isValidOptionalEmail("leonardo@example.com")).toBe(true);
    expect(isValidOptionalEmail("leonardo@")).toBe(false);
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- src/lib/leadIntake.test.ts`

Expected: FAIL because `src/lib/leadIntake.ts` does not exist yet.

- [ ] **Step 3: Implement the minimal helpers**

```ts
export function buildLeadInterest(reason: string, message: string) {
  const parts = [
    reason.trim() ? `Motivo: ${reason.trim()}` : "",
    message.trim() ? `Mensagem: ${message.trim()}` : "",
  ].filter(Boolean);

  return parts.join("\n\n") || "Solicitou contato pela página de contato";
}

export function isValidOptionalEmail(email: string) {
  return !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export type ContactLeadFields = {
  email: string;
  origem: string;
  interesse: string;
  mensagem: string;
};
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `npm test -- src/lib/leadIntake.test.ts`

Expected: PASS with 3 tests.

- [ ] **Step 5: Commit the focused unit**

```bash
git add -- src/lib/leadIntake.ts src/lib/leadIntake.test.ts
git commit -m "test: definir contrato do intake de contato"
```

### Task 2: Adicionar modo detalhado ao formulário público

**Files:**
- Modify: `src/components/LeadCaptureForm.tsx`
- Modify: `src/lib/leadIntake.ts`
- Test: `src/lib/leadIntake.test.ts`

**Interfaces:**
- `LeadCaptureFormProps = { mode?: "quick" | "contact"; source?: string }`.
- Default remains `mode="quick"` and `source="Site"`, preserving all existing landing pages.
- Contact mode renders e-mail, reason select and message textarea and posts `email`, `origem`, `interesse`, `mensagem`.

- [ ] **Step 1: Extend the failing helper tests for contact payload fields**

```ts
it("uses the contact-page source and CRM interest fallback", () => {
  expect(buildLeadInterest("", "")).toBe("Solicitou contato pela página de contato");
});
```

- [ ] **Step 2: Run the focused test and verify it fails if the helper contract is missing**

Run: `npm test -- src/lib/leadIntake.test.ts`

Expected: the test suite exposes any mismatch before changing the component.

- [ ] **Step 3: Implement contact mode without changing quick mode**

Add controlled state for `email`, `interesse` and `mensagem`. Keep the existing quick mode markup and behavior when `mode` is omitted. In contact mode:

```tsx
<input
  type="email"
  value={email}
  onChange={(event) => setEmail(event.target.value)}
  placeholder="Seu e-mail (opcional)"
/>
<select required value={interesse} onChange={(event) => setInteresse(event.target.value)}>
  <option value="">Motivo do contato</option>
  <option value="Quero estruturar minhas vendas">Quero estruturar minhas vendas</option>
  <option value="Quero conhecer o CRM">Quero conhecer o CRM</option>
  <option value="Quero melhorar meu site">Quero melhorar meu site</option>
  <option value="Outro assunto">Outro assunto</option>
</select>
<textarea
  required
  value={mensagem}
  onChange={(event) => setMensagem(event.target.value)}
  placeholder="Como podemos ajudar?"
/>
```

Before sending, validate `isValidOptionalEmail(email)`. The body must retain tracking fields and add:

```ts
email,
origem: source,
interesse,
mensagem,
```

Use the contact-mode button label `Enviar mensagem` and success text `Recebido. Sua mensagem foi registrada e entraremos em contato em breve.`.

- [ ] **Step 4: Run all unit tests and verify no quick-form regression**

Run: `npm test -- src/lib/leadIntake.test.ts src/lib/analytics.test.ts`

Expected: PASS; existing analytics behavior remains intact.

### Task 3: Extend and constrain the public Edge Function intake

**Files:**
- Modify: `supabase/functions/lead-intake/index.ts`

**Interfaces:**
- Accepts optional `email`, `origem`, `interesse` and `mensagem` JSON fields.
- Writes `email` to `leads.email` when present.
- Writes the combined reason/message to `leads.interesse`.
- Whitelists `Página de contato`; all other values resolve to `Site`.

- [ ] **Step 1: Add the validation implementation**

Read the optional fields with `asString`. Reject a non-empty malformed email with HTTP 422 and the message `Informe um e-mail válido ou deixe o campo vazio.`. Build the stored interest from the reason and message, falling back to `Solicitou análise pelo site` for the existing quick form and `Solicitou contato pela página de contato` for the contact source.

- [ ] **Step 2: Preserve existing lead creation and Meta CAPI behavior**

Keep owner lookup, phone normalization, honeypot response, Supabase service-role insert, optional `ga_client_id`, and Meta CAPI dispatch unchanged. Only extend the `base` object with `email`, `origem` and the resolved `interesse`.

- [ ] **Step 3: Run typecheck and existing tests**

Run: `npm run typecheck` and `npm test`

Expected: PASS. The Deno function source is type-checked through the project workflow only where supported; no existing frontend test may regress.

### Task 4: Build and register the public contact page

**Files:**
- Create: `src/pages/Contact.tsx`
- Modify: `src/App.tsx`
- Modify: `scripts/core-routes.mjs`
- Modify: `scripts/smoke-routes.mjs`

**Interfaces:**
- `ContactPage` is a default React component rendered without authentication.
- `App.tsx` lazy-loads it as `ContactPage`, includes `/contato` in `PUBLIC_PATHS`, and registers `<Route path="/contato" element={<ContactPage />} />` in public routes.

- [ ] **Step 1: Add the route contract to the smoke script**

Append `/contato` to the public route list in `scripts/smoke-routes.mjs`.

- [ ] **Step 2: Write the page component**

Use the existing `Logo`, `SeoHead`, `LeadCaptureForm`, `Link`, `Mail`, `MapPin`, `MessageCircle` and `ArrowLeft` patterns. The page must include:

- Header with logo and link back to the home page.
- H1 focused on sending a message, not a generic marketing slogan.
- Supporting copy explaining that the message will be registered and followed up.
- `<LeadCaptureForm mode="contact" source="Página de contato" />`.
- Institutional data block with the exact approved CNPJ, e-mail, telephone and full address.
- Link to `/privacidade` near the form.
- Mobile-first layout with no horizontal overflow and visible focus styles.

- [ ] **Step 3: Register the lazy import, public path and route**

Keep the public route before authenticated routes, add `/contato` to `scripts/core-routes.mjs` for prerendering, and do not add it to CRM navigation/access control.

- [ ] **Step 4: Run the route smoke test after a build**

Run: `npm run build` then `npm run routes:smoke`

Expected: `/contato` returns HTTP 200 and the SPA shell contains `Funil Comercial` and `id="root"`.

### Task 5: Publish the confirmed MEI address in metadata

**Files:**
- Modify: `index.html`
- Modify: `src/components/SeoHead.tsx`

**Interfaces:**
- Both `PostalAddress` JSON-LD definitions use the same confirmed address.

- [ ] **Step 1: Add the structured address fields**

Use:

```json
{
  "streetAddress": "Rua Liberal, 1329, 12",
  "addressLocality": "Porto Alegre",
  "addressRegion": "RS",
  "postalCode": "91920-680",
  "addressCountry": "BR"
}
```

- [ ] **Step 2: Verify no conflicting address remains**

Run: `rg -n -i "streetAddress|addressLocality|addressRegion|91920-680|Rua Liberal" index.html src/components/SeoHead.tsx src/pages/Contact.tsx`

Expected: the same address appears in all three intended locations and no other Funil Comercial address is introduced.

### Task 6: Final verification and focused review

**Files:**
- Review only: all files changed by Tasks 1-5.

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`

Expected: all Vitest files pass with zero failures.

- [ ] **Step 2: Run the complete typecheck and build**

Run: `npm run typecheck` and `npm run build`

Expected: both commands exit with code 0. Generated sitemap changes remain unstaged if the build updates them.

- [ ] **Step 3: Run route smoke verification**

Run: `npm run routes:smoke`

Expected: every listed route, including `/contato`, returns HTTP 200.

- [ ] **Step 4: Review the diff and repository hygiene**

Run: `git diff --check` and `git status --short`

Expected: no whitespace errors in the feature diff; only intended source/docs files are staged or committed, while pre-existing sitemaps/prospecting artifacts remain untouched.

- [ ] **Step 5: Report the implementation state**

Report changed files, verification commands and any generated/unrelated worktree changes. Do not claim deployment or push unless explicitly requested and performed.
