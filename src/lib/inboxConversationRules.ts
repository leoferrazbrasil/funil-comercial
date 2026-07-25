import type { InboxMessage } from "./types";

type ConversationRuleMessage = Pick<InboxMessage, "telefone" | "remetente_nome"> & {
  metadata?: Record<string, unknown> | null;
};

const truthyMetadataFlags = new Set<unknown>([true, "true", "1", 1]);

export const normalizeConversationPhone = (phone: string | null | undefined) => {
  if (!phone) return "";
  let p = phone.replace(/\D/g, "");
  if (!p) return "";

  while (p.startsWith("0")) {
    p = p.substring(1);
  }

  while (p.startsWith("550")) {
    p = "55" + p.substring(3);
  }

  if (p.length === 10 || p.length === 11) {
    p = "55" + p;
  }

  if (p.startsWith("55") && p.length === 13 && p[4] === "9") {
    return p.slice(0, 4) + p.slice(5);
  }

  return p;
};

export function isWhatsAppGroupMessage(message: ConversationRuleMessage) {
  const metadata = message.metadata ?? {};
  const rawIdentifiers = [
    message.telefone,
    metadata.raw_phone,
    metadata.rawPhone,
    metadata.remote_jid,
    metadata.remoteJid,
    metadata.group_id,
    metadata.groupId,
  ];

  if (
    truthyMetadataFlags.has(metadata.is_group) ||
    truthyMetadataFlags.has(metadata.isGroup)
  ) {
    return true;
  }

  if (
    rawIdentifiers.some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes("@g.us"),
    )
  ) {
    return true;
  }

  // Legacy Z-API group rows were saved as "person · group" using the participant phone.
  return /\s[·•]\s/.test(message.remetente_nome ?? "");
}
