type MetaUserData = {
  client_ip_address?: string;
  client_user_agent?: string;
  fbc?: string;
  fbp?: string;
  fn?: string[];
  ln?: string[];
  ph?: string[];
};

export type MetaLeadEvent = {
  action_source: "website";
  event_id: string;
  event_name: "Lead";
  event_source_url: string;
  event_time: number;
  user_data: MetaUserData;
};

export type MetaLeadEventInput = {
  eventId: string;
  eventSourceUrl: string;
  fbc?: string;
  fbp?: string;
  ipAddress?: string;
  name: string;
  phone: string;
  userAgent?: string;
};

const asCleanString = (value?: string) => (value ?? "").trim();

function normalizePhoneForHash(phone: string) {
  return phone.replace(/\D/g, "");
}

function normalizeTextForHash(value: string) {
  return value.trim().toLowerCase();
}

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hashOptional(value: string) {
  const normalized = normalizeTextForHash(value);
  return normalized ? await sha256Hex(normalized) : "";
}

export async function buildMetaLeadEvent(input: MetaLeadEventInput): Promise<MetaLeadEvent> {
  const [firstName = "", ...lastNameParts] = normalizeTextForHash(input.name).split(/\s+/);
  const lastName = lastNameParts.join(" ");
  const phone = normalizePhoneForHash(input.phone);

  const userData: MetaUserData = {};
  const phoneHash = phone ? await sha256Hex(phone) : "";
  const firstNameHash = await hashOptional(firstName);
  const lastNameHash = await hashOptional(lastName);

  if (phoneHash) userData.ph = [phoneHash];
  if (firstNameHash) userData.fn = [firstNameHash];
  if (lastNameHash) userData.ln = [lastNameHash];

  const fbp = asCleanString(input.fbp);
  const fbc = asCleanString(input.fbc);
  const ipAddress = asCleanString(input.ipAddress);
  const userAgent = asCleanString(input.userAgent);

  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;
  if (ipAddress) userData.client_ip_address = ipAddress;
  if (userAgent) userData.client_user_agent = userAgent;

  return {
    action_source: "website",
    event_id: input.eventId,
    event_name: "Lead",
    event_source_url: input.eventSourceUrl || "https://funilcomercial.com/",
    event_time: Math.floor(Date.now() / 1000),
    user_data: userData,
  };
}

export async function sendMetaLeadEvent(args: {
  accessToken: string;
  apiVersion: string;
  event: MetaLeadEvent;
  pixelId: string;
  testEventCode?: string;
}) {
  const response = await fetch(
    `https://graph.facebook.com/${args.apiVersion}/${args.pixelId}/events?access_token=${encodeURIComponent(args.accessToken)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [args.event],
        ...(args.testEventCode ? { test_event_code: args.testEventCode } : {}),
      }),
    },
  );

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `[meta-capi] ${response.status} ${JSON.stringify(body).slice(0, 500)}`,
    );
  }

  return body;
}
