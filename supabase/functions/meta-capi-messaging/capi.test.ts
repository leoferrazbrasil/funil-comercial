import { assert, assertEquals, assertMatch } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildMessagingEvent } from "./capi.ts";

Deno.test("buildMessagingEvent monta evento de business messaging com ctwa_clid", async () => {
  const event = await buildMessagingEvent({
    ctwaClid: "ARBxyz123clickid",
    whatsappBusinessAccountId: "1234567890",
    eventName: "SubmitApplication",
    eventId: "lead-abc:SubmitApplication",
    eventTime: 1_784_000_000,
    phone: "+55 (51) 99673-7359",
    firstName: "Maria",
    lastName: "Souza Lima",
  });

  // Os dois campos que fazem a Meta entender que é CTWA.
  assertEquals(event.action_source, "business_messaging");
  assertEquals(event.messaging_channel, "whatsapp");

  assertEquals(event.event_name, "SubmitApplication");
  assertEquals(event.event_id, "lead-abc:SubmitApplication");
  assertEquals(event.event_time, 1_784_000_000);

  // Identificadores de atribuição vão em claro (são IDs da própria Meta).
  assertEquals(event.user_data.ctwa_clid, "ARBxyz123clickid");
  assertEquals(event.user_data.whatsapp_business_account_id, "1234567890");
});

Deno.test("buildMessagingEvent hasheia toda PII em SHA-256", async () => {
  const event = await buildMessagingEvent({
    ctwaClid: "clid-1",
    eventName: "Lead",
    eventId: "lead-1:Lead",
    eventTime: 1_784_000_000,
    phone: "51992568861",
    firstName: "Maria",
    lastName: "Souza",
  });

  const ph = event.user_data.ph as string[];
  const fn = event.user_data.fn as string[];
  const ln = event.user_data.ln as string[];

  assertMatch(ph[0], /^[a-f0-9]{64}$/);
  assertMatch(fn[0], /^[a-f0-9]{64}$/);
  assertMatch(ln[0], /^[a-f0-9]{64}$/);

  // Nenhum dígito do telefone pode vazar em claro.
  assert(!ph[0].includes("99673"));
  assert(!JSON.stringify(event).includes("996737359"));
});

Deno.test("buildMessagingEvent normaliza telefone BR sem DDI antes do hash", async () => {
  const comDdi = await buildMessagingEvent({
    eventName: "Lead",
    eventId: "a",
    eventTime: 1,
    phone: "5551992568861",
  });
  const semDdi = await buildMessagingEvent({
    eventName: "Lead",
    eventId: "b",
    eventTime: 1,
    phone: "(51) 99673-7359",
  });

  assertEquals(
    (comDdi.user_data.ph as string[])[0],
    (semDdi.user_data.ph as string[])[0],
  );
});

Deno.test("buildMessagingEvent inclui custom_data só quando há valor", async () => {
  const semValor = await buildMessagingEvent({
    eventName: "Lead",
    eventId: "a",
    eventTime: 1,
    phone: "51992568861",
  });
  assertEquals(semValor.custom_data, undefined);

  const comValor = await buildMessagingEvent({
    eventName: "Purchase",
    eventId: "b",
    eventTime: 1,
    phone: "51992568861",
    value: 1497,
  });
  assertEquals(comValor.custom_data, { value: 1497, currency: "BRL" });
});

Deno.test("buildMessagingEvent omite campos vazios em vez de mandar string vazia", async () => {
  const event = await buildMessagingEvent({
    ctwaClid: null,
    whatsappBusinessAccountId: "",
    eventName: "Lead",
    eventId: "a",
    eventTime: 1,
    phone: "",
    firstName: "",
  });

  assertEquals(event.user_data.ctwa_clid, undefined);
  assertEquals(event.user_data.whatsapp_business_account_id, undefined);
  assertEquals(event.user_data.ph, undefined);
  assertEquals(event.user_data.fn, undefined);
});
