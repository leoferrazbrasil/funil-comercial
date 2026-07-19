// Captura de atribuição de anúncios Click-to-WhatsApp (CTWA).
//
// O `ctwa_clid` é o identificador do clique que a Meta gera quando alguém clica
// num anúncio CTWA. Ele é a ÚNICA forma de amarrar, com precisão, um lead
// qualificado ao anúncio que o originou — e é obrigatório no payload da
// Conversions API para Business Messaging.
//
// ONDE ELE APARECE:
// - Meta Cloud API (oficial): `entry[].changes[].value.messages[].referral.ctwa_clid`.
//   Só vem na PRIMEIRA mensagem da conversa iniciada pelo anúncio.
// - Z-API (não oficial): NÃO expõe `ctwa_clid`. Expõe, na melhor das hipóteses,
//   metadados do anúncio (título/corpo/sourceId). Capturamos como fallback para
//   pelo menos identificar a origem, mas a atribuição fica degradada (a Meta
//   passa a depender de match por telefone hasheado, bem menos preciso).
//
// Por isso: para atribuição real, o número do anúncio precisa apontar para a
// WABA conectada à Cloud API — não para o app do WhatsApp Business no celular.

type JsonRecord = Record<string, unknown>;

export type CtwaReferral = {
  /** Click ID do anúncio CTWA. Só existe via Cloud API. */
  ctwaClid: string | null;
  /** ID do criativo/anúncio de origem (`source_id`). */
  sourceId: string | null;
  /** `ad` | `post` — tipo da origem. */
  sourceType: string | null;
  /** URL do anúncio (permalink). */
  sourceUrl: string | null;
  headline: string | null;
  body: string | null;
  /** De onde extraímos: define a qualidade da atribuição. */
  provider: "whatsapp_cloud" | "z-api";
};

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const asString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const getRecord = (payload: JsonRecord, key: string) => {
  const value = payload[key];
  return isRecord(value) ? value : null;
};

const getArray = (payload: JsonRecord, key: string) => {
  const value = payload[key];
  return Array.isArray(value) ? value : [];
};

const firstString = (payload: JsonRecord, keys: string[]) => {
  for (const key of keys) {
    const value = asString(payload[key]);
    if (value) return value;
  }
  return null;
};

/**
 * Extrai o referral CTWA de uma mensagem individual da Meta Cloud API.
 * Retorna null quando a mensagem não veio de um anúncio.
 */
export function extractCloudReferral(message: JsonRecord): CtwaReferral | null {
  const referral = getRecord(message, "referral");
  if (!referral) return null;

  const ctwaClid = asString(referral.ctwa_clid);
  const sourceId = asString(referral.source_id);

  // Sem nenhum identificador útil não há o que atribuir.
  if (!ctwaClid && !sourceId) return null;

  return {
    ctwaClid,
    sourceId,
    sourceType: asString(referral.source_type),
    sourceUrl: asString(referral.source_url),
    headline: asString(referral.headline),
    body: asString(referral.body),
    provider: "whatsapp_cloud",
  };
}

/**
 * Fallback para Z-API. O provedor não repassa `ctwa_clid`; quando muito entrega
 * um bloco de anúncio referenciado. Capturamos para registrar a origem, mas
 * `ctwaClid` volta null — e a CAPI cairá em match por telefone.
 */
export function extractZApiReferral(payload: JsonRecord): CtwaReferral | null {
  const candidate =
    getRecord(payload, "referralAd") ??
    getRecord(payload, "adReply") ??
    getRecord(payload, "externalAdReply") ??
    getRecord(payload, "productAd");

  if (!candidate) return null;

  const sourceId = firstString(candidate, ["sourceId", "source_id", "id", "adId"]);
  const sourceUrl = firstString(candidate, ["sourceUrl", "source_url", "url"]);
  const headline = firstString(candidate, ["title", "headline"]);

  if (!sourceId && !sourceUrl && !headline) return null;

  return {
    // Z-API pode, em versões futuras, repassar o campo. Se vier, aproveitamos.
    ctwaClid: firstString(candidate, ["ctwaClid", "ctwa_clid"]),
    sourceId,
    sourceType: firstString(candidate, ["sourceType", "source_type"]) ?? "ad",
    sourceUrl,
    headline,
    body: firstString(candidate, ["body", "description"]),
    provider: "z-api",
  };
}

/**
 * Varre o payload inteiro do webhook e devolve o referral por telefone de origem.
 * Chave = telefone normalizado do remetente (mesma normalização do index.ts).
 */
export function extractReferralsByPhone(
  payload: JsonRecord,
  normalizePhone: (value: string | null | undefined) => string,
): Map<string, CtwaReferral> {
  const byPhone = new Map<string, CtwaReferral>();

  // --- Meta Cloud API ---
  if (payload.object === "whatsapp_business_account") {
    for (const entry of getArray(payload, "entry")) {
      if (!isRecord(entry)) continue;

      for (const change of getArray(entry, "changes")) {
        if (!isRecord(change)) continue;

        const value = getRecord(change, "value");
        if (!value) continue;

        for (const rawMessage of getArray(value, "messages")) {
          if (!isRecord(rawMessage)) continue;

          const referral = extractCloudReferral(rawMessage);
          if (!referral) continue;

          const phone = normalizePhone(asString(rawMessage.from));
          if (phone) byPhone.set(phone, referral);
        }
      }
    }

    return byPhone;
  }

  // --- Z-API ---
  const zApiReferral = extractZApiReferral(payload);
  if (zApiReferral) {
    const phone = normalizePhone(asString(payload.phone));
    if (phone) byPhone.set(phone, zApiReferral);
  }

  return byPhone;
}

/** Serializa o referral para gravar em `metadata` (jsonb). */
export function referralToMetadata(referral: CtwaReferral) {
  return {
    ctwa_clid: referral.ctwaClid,
    ad_source_id: referral.sourceId,
    ad_source_type: referral.sourceType,
    ad_source_url: referral.sourceUrl,
    ad_headline: referral.headline,
    ad_body: referral.body,
    ctwa_provider: referral.provider,
  };
}
