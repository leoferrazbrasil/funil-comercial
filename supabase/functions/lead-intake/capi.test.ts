import { assert, assertEquals, assertMatch } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildMetaLeadEvent } from "./capi.ts";

Deno.test("buildMetaLeadEvent creates a deduplicated server Lead event", async () => {
  const event = await buildMetaLeadEvent({
    eventId: "lead-123",
    eventSourceUrl: "https://funilcomercial.com/site-para-nutricionistas",
    fbp: "fb.1.1234567890.1234567890",
    fbc: "fb.1.1234567890.fbclid-test",
    ipAddress: "203.0.113.10",
    name: "Teste Pixel Codex",
    phone: "+55 (51) 99673-7359",
    userAgent: "Vitest Browser",
  });

  assertEquals(event.event_name, "Lead");
  assertEquals(event.event_id, "lead-123");
  assertEquals(event.action_source, "website");
  assertEquals(event.event_source_url, "https://funilcomercial.com/site-para-nutricionistas");
  assertEquals(event.user_data.fbp, "fb.1.1234567890.1234567890");
  assertEquals(event.user_data.fbc, "fb.1.1234567890.fbclid-test");
  assertEquals(event.user_data.client_ip_address, "203.0.113.10");
  assertEquals(event.user_data.client_user_agent, "Vitest Browser");
  assert(event.user_data.ph);
  assert(event.user_data.fn);
  assert(event.user_data.ln);
  assertMatch(event.user_data.ph[0], /^[a-f0-9]{64}$/);
  assert(!event.user_data.ph[0].includes("99673"));
  assertMatch(event.user_data.fn[0], /^[a-f0-9]{64}$/);
  assertMatch(event.user_data.ln[0], /^[a-f0-9]{64}$/);
});
