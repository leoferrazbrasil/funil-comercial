import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  describeMetaApiError,
  requiresTemplateForMetaInitiation,
} from "./rules.ts";

Deno.test("requires template when initiating a Meta conversation without a source message", () => {
  assertEquals(
    requiresTemplateForMetaInitiation({
      provider: "whatsapp_cloud",
      hasTemplate: false,
      hasSourceMessage: false,
    }),
    true,
  );
});

Deno.test("allows free text for Meta when replying to an existing source message", () => {
  assertEquals(
    requiresTemplateForMetaInitiation({
      provider: "whatsapp_cloud",
      hasTemplate: false,
      hasSourceMessage: true,
    }),
    false,
  );
});

Deno.test("explains Meta object errors as Phone Number ID or permission configuration", () => {
  assertEquals(
    describeMetaApiError(
      100,
      "Unsupported post request. Object with ID '1193366603864213' does not exist, cannot be loaded due to missing permissions, or does not support this operation.",
    ),
    "Meta Cloud API nao encontrou o Phone Number ID configurado ou o token nao tem permissao para usa-lo. Verifique se o canal ativo usa o Phone Number ID correto da Meta, nao o WABA ID, e se o token pertence a mesma conta WhatsApp Business.",
  );
});
