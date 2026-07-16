import {
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { reopenArchiveBefore } from "./index.ts";

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
