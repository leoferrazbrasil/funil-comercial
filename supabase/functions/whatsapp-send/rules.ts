export function isMetaProvider(provider: string | null | undefined) {
  return provider === "whatsapp" || provider === "whatsapp_cloud";
}

export function requiresTemplateForMetaInitiation(input: {
  provider: string | null | undefined;
  hasTemplate: boolean;
  hasSourceMessage: boolean;
}) {
  return isMetaProvider(input.provider) && !input.hasTemplate && !input.hasSourceMessage;
}

export function describeMetaApiError(errorCode: unknown, errorMessage: string) {
  const code = String(errorCode ?? "unknown");
  if (
    code === "100" &&
    /unsupported post request|object with id|missing permissions/i.test(errorMessage)
  ) {
    return "Meta Cloud API nao encontrou o Phone Number ID configurado ou o token nao tem permissao para usa-lo. Verifique se o canal ativo usa o Phone Number ID correto da Meta, nao o WABA ID, e se o token pertence a mesma conta WhatsApp Business.";
  }

  return `Meta API Error [${code}]: ${errorMessage}`;
}
