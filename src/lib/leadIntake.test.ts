import { describe, expect, it } from "vitest";
import {
  buildContactLeadFields,
  buildLeadInterest,
  isValidOptionalEmail,
} from "./leadIntake";

describe("lead intake helpers", () => {
  it("combines the selected reason and message for CRM interest", () => {
    expect(buildLeadInterest("Quero conhecer o CRM", "Preciso organizar meu WhatsApp.")).toBe(
      "Motivo: Quero conhecer o CRM\n\nMensagem: Preciso organizar meu WhatsApp.",
    );
  });

  it("keeps the fallback interest when both optional fields are empty", () => {
    expect(buildLeadInterest("", "")).toBe("Solicitou contato pela página de contato");
  });

  it("accepts an empty email and rejects malformed optional email", () => {
    expect(isValidOptionalEmail("")).toBe(true);
    expect(isValidOptionalEmail("leonardo@example.com")).toBe(true);
    expect(isValidOptionalEmail("leonardo@")).toBe(false);
  });

  it("builds the contact-page fields with the source and combined interest", () => {
    expect(
      buildContactLeadFields({
        email: "leonardo@example.com",
        origem: "Página de contato",
        interesse: "Quero melhorar meu site",
        mensagem: "Preciso de uma página mais clara.",
      }),
    ).toEqual({
      email: "leonardo@example.com",
      origem: "Página de contato",
      interesse: "Quero melhorar meu site",
      mensagem: "Preciso de uma página mais clara.",
    });
  });
});
