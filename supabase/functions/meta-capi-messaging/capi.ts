// Conversions API da Meta — variante Business Messaging (Click-to-WhatsApp).
//
// Diferente da CAPI de site (`action_source: "website"`, que já existe em
// lead-intake/capi.ts), aqui devolvemos à Meta o que aconteceu DEPOIS que a
// conversa começou: o lead foi qualificado, virou oportunidade, fechou.
//
// Dois campos são obrigatórios e definem tudo:
//   action_source:     "business_messaging"  → distingue de conversão web
//   messaging_channel: "whatsapp"            → distingue de Messenger / IG Direct
//
// E a atribuição depende de `user_data.ctwa_clid`, capturado no webhook da
// Cloud API (ver whatsapp-inbound/ctwa.ts). Sem ele a Meta tenta casar por
// telefone hasheado — funciona, mas com precisão bem menor.
//
// Ref.: developers.facebook.com/docs/marketing-api/conversions-api/business-messaging

export type MessagingEventName =
  | "Lead" // conversa iniciada virou lead identificado
  | "Contact" // houve contato humano real
  | "Schedule" // agendou diagnóstico/reunião
  | "SubmitApplication" // lead qualificado (MQL/SQL)
  | "Purchase"; // fechou

export type MetaMessagingEventInput = {
  ctwaClid?: string | null;
  /** ID da WABA que recebeu a mensagem. */
  whatsappBusinessAccountId?: string | null;
  eventName: MessagingEventName;
  /** Dedupe: mesma string reenviada não conta duas vezes. */
  eventId: string;
  /** Unix seconds. Deve ser o momento REAL do evento, não do envio. */
  eventTime: number;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  /** Valor do negócio, quando houver. */
  value?: number | null;
  currency?: string | null;
};

export type MetaMessagingEvent = {
  action_source: "business_messaging";
  messaging_channel: "whatsapp";
  event_name: MessagingEventName;
  event_id: string;
  event_time: number;
  user_data: Record<string, unknown>;
  custom_data?: Record<string, unknown>;
};

const clean = (value?: string | null) => (value ?? "").trim();

/** Telefone para hash: só dígitos, com DDI. */
function normalizePhoneForHash(phone: string) {
  let p = phone.replace(/\D/g, "");
  while (p.startsWith("0")) p = p.slice(1);
  if (p.length === 10 || p.length === 11) p = "55" + p;
  return p;
}

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hashNormalized(value: string) {
  const normalized = value.trim().toLowerCase();
  return normalized ? await sha256Hex(normalized) : "";
}

export async function buildMessagingEvent(
  input: MetaMessagingEventInput,
): Promise<MetaMessagingEvent> {
  const userData: Record<string, unknown> = {};

  // Identificadores de atribuição (não são hasheados — são IDs da própria Meta).
  const ctwaClid = clean(input.ctwaClid);
  const wabaId = clean(input.whatsappBusinessAccountId);
  if (ctwaClid) userData.ctwa_clid = ctwaClid;
  if (wabaId) userData.whatsapp_business_account_id = wabaId;

  // PII sempre hasheada em SHA-256, conforme exigido pela Meta.
  const phone = normalizePhoneForHash(clean(input.phone));
  if (phone) userData.ph = [await sha256Hex(phone)];

  const firstNameHash = await hashNormalized(clean(input.firstName));
  if (firstNameHash) userData.fn = [firstNameHash];

  const lastNameHash = await hashNormalized(clean(input.lastName));
  if (lastNameHash) userData.ln = [lastNameHash];

  const event: MetaMessagingEvent = {
    action_source: "business_messaging",
    messaging_channel: "whatsapp",
    event_name: input.eventName,
    event_id: input.eventId,
    event_time: input.eventTime,
    user_data: userData,
  };

  if (typeof input.value === "number" && Number.isFinite(input.value)) {
    event.custom_data = {
      value: input.value,
      currency: clean(input.currency) || "BRL",
    };
  }

  return event;
}

/**
 * Envia para o DATASET da Meta. Atenção: eventos de business messaging vão para
 * o dataset vinculado à WABA — que pode ser diferente do pixel do site.
 */
export async function sendMessagingEvent(args: {
  accessToken: string;
  apiVersion: string;
  datasetId: string;
  events: MetaMessagingEvent[];
  testEventCode?: string;
}) {
  const response = await fetch(
    `https://graph.facebook.com/${args.apiVersion}/${args.datasetId}/events`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${args.accessToken}`,
      },
      body: JSON.stringify({
        data: args.events,
        ...(args.testEventCode ? { test_event_code: args.testEventCode } : {}),
      }),
    },
  );

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `[meta-capi-messaging] ${response.status} ${JSON.stringify(body).slice(0, 500)}`,
    );
  }

  return body as { events_received?: number; fbtrace_id?: string };
}
