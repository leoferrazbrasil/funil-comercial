import {
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { getPhoneVariations, reopenArchiveBefore } from "./index.ts";

Deno.test("uses the persisted inbound message timestamp as the archive reopen cutoff", () => {
  assertEquals(
    reopenArchiveBefore({
      created_at: "2026-07-16T12:00:00.000Z",
      direction: "inbound",
    }),
    "2026-07-16T12:00:00.000Z",
  );
});

Deno.test("does not reopen archived conversations for persisted outbound messages", () => {
  assertEquals(
    reopenArchiveBefore({
      created_at: "2026-07-16T12:00:00.000Z",
      direction: "outbound",
    }),
    null,
  );
});

// Regressão: mensagem nova gravada com channel_id NULL (some do filtro
// padrão "ativos" do Inbox) porque resolveOwnerChannel comparava o número
// reportado pela Z-API/Meta contra integration_channels.numero exigindo
// formato EXATO — sem tolerar a variação com/sem o 9º dígito.
Deno.test("getPhoneVariations includes both the 13-digit (with 9th digit) and 12-digit forms", () => {
  const variations = getPhoneVariations("5551996737359");
  assertEquals(variations.includes("5551996737359"), true);
  assertEquals(variations.includes("555196737359"), true);
});

Deno.test("getPhoneVariations includes both forms when starting from the 12-digit number", () => {
  const variations = getPhoneVariations("555196737359");
  assertEquals(variations.includes("555196737359"), true);
  assertEquals(variations.includes("5551996737359"), true);
});

Deno.test("getPhoneVariations resolves the exact bug: identifier reported by Z-API matches a channel stored in the other digit format", () => {
  // integration_channels.numero salvo sem o 9º dígito (formato antigo/legado).
  const storedChannelNumero = "555196737359";
  // Z-API reporta connectedPhone já normalizado COM o 9º dígito.
  const identifierFromWebhook = "5551996737359";

  const variations = getPhoneVariations(identifierFromWebhook);
  assertEquals(variations.includes(storedChannelNumero), true);
});
