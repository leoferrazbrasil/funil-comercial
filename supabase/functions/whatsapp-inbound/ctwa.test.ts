import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { extractCloudReferral, extractReferralsByPhone, extractZApiReferral } from "./ctwa.ts";

// Mesma normalização do index.ts (BR, remove o 9 extra em celulares de 13 dígitos).
const normalizePhone = (value: string | null | undefined) => {
  const p = value?.replace("whatsapp:", "").replace(/\D/g, "") ?? "";
  if (!p) return "";
  let unified = p;
  while (unified.startsWith("0")) unified = unified.substring(1);
  if (unified.length === 10 || unified.length === 11) unified = "55" + unified;
  if (unified.startsWith("55") && unified.length === 13 && unified[4] === "9") {
    return unified.slice(0, 4) + unified.slice(5);
  }
  return unified;
};

Deno.test("extractCloudReferral lê o ctwa_clid do referral da Cloud API", () => {
  const referral = extractCloudReferral({
    from: "5551996737359",
    type: "text",
    referral: {
      source_url: "https://fb.me/abc",
      source_id: "120210000000000000",
      source_type: "ad",
      headline: "Sua agenda depende de indicação?",
      body: "Diagnóstico gratuito",
      ctwa_clid: "ARBxyzCLICKID",
    },
  });

  assertEquals(referral?.ctwaClid, "ARBxyzCLICKID");
  assertEquals(referral?.sourceId, "120210000000000000");
  assertEquals(referral?.sourceType, "ad");
  assertEquals(referral?.provider, "whatsapp_cloud");
});

Deno.test("extractCloudReferral devolve null em mensagem comum", () => {
  assertEquals(extractCloudReferral({ from: "5551996737359", type: "text" }), null);
});

Deno.test("extractCloudReferral ignora referral sem identificador útil", () => {
  const referral = extractCloudReferral({
    from: "5551996737359",
    referral: { headline: "só título, sem id" },
  });
  assertEquals(referral, null);
});

Deno.test("extractReferralsByPhone indexa pelo telefone normalizado", () => {
  const map = extractReferralsByPhone({
    object: "whatsapp_business_account",
    entry: [{
      changes: [{
        value: {
          messages: [{
            from: "5551996737359",
            referral: { source_id: "120", ctwa_clid: "CLID-A" },
          }],
        },
      }],
    }],
  }, normalizePhone);

  // 13 dígitos com 9 extra → normaliza para 12.
  assertEquals(map.get("555196737359")?.ctwaClid, "CLID-A");
});

Deno.test("extractZApiReferral captura o anúncio mas SEM ctwa_clid", () => {
  const referral = extractZApiReferral({
    instanceId: "abc",
    phone: "5551996737359",
    referralAd: {
      sourceId: "120210000000000000",
      sourceUrl: "https://fb.me/abc",
      title: "Sua agenda depende de indicação?",
    },
  });

  assertEquals(referral?.sourceId, "120210000000000000");
  assertEquals(referral?.provider, "z-api");
  // O ponto crítico: Z-API não repassa o click id → atribuição degradada.
  assertEquals(referral?.ctwaClid, null);
});

Deno.test("extractZApiReferral devolve null quando não há bloco de anúncio", () => {
  assertEquals(extractZApiReferral({ instanceId: "abc", phone: "5551996737359" }), null);
});
