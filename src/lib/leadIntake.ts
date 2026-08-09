export type ContactLeadFields = {
  email: string;
  origem: string;
  interesse: string;
  mensagem: string;
};

export function buildLeadInterest(reason: string, message: string) {
  const parts = [
    reason.trim() ? `Motivo: ${reason.trim()}` : "",
    message.trim() ? `Mensagem: ${message.trim()}` : "",
  ].filter(Boolean);

  return parts.join("\n\n") || "Solicitou contato pela página de contato";
}

export function isValidOptionalEmail(email: string) {
  return !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
