import { describe, expect, it } from "vitest";
import {
  isWhatsAppGroupMessage,
  normalizeConversationPhone,
} from "./inboxConversationRules";

describe("inboxConversationRules", () => {
  it("normalizes Brazilian WhatsApp phones with or without the ninth digit", () => {
    expect(normalizeConversationPhone("+55 (47) 99111-1000")).toBe("554791111000");
    expect(normalizeConversationPhone("47 99111-1000")).toBe("554791111000");
  });

  it("detects current and legacy WhatsApp group messages", () => {
    expect(
      isWhatsAppGroupMessage({
        telefone: "120363012345678901@g.us",
        remetente_nome: "Grupo",
        metadata: null,
      }),
    ).toBe(true);

    expect(
      isWhatsAppGroupMessage({
        telefone: "5547991111000",
        remetente_nome: "Pessoa · Grupo Comercial",
        metadata: null,
      }),
    ).toBe(true);

    expect(
      isWhatsAppGroupMessage({
        telefone: "5547991111000",
        remetente_nome: "Pessoa",
        metadata: { is_group: true },
      }),
    ).toBe(true);
  });

  it("keeps ordinary one-to-one WhatsApp conversations visible", () => {
    expect(
      isWhatsAppGroupMessage({
        telefone: "5547991111000",
        remetente_nome: "Pessoa",
        metadata: null,
      }),
    ).toBe(false);
  });
});
