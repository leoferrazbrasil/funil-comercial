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

export function buildContactLeadFields(fields: ContactLeadFields): ContactLeadFields {
  const email = fields.email.trim();
  const origem = fields.origem.trim() || "Página de contato";
  const interesse = fields.interesse.trim();
  const mensagem = fields.mensagem.trim();

  return {
    email,
    origem,
    interesse,
    mensagem,
  };
}
