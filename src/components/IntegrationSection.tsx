import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  QrCode,
  BadgeCheck,
  CheckCircle2,
  Cable,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getIntegrationChannels,
  updateIntegrationChannelStatus,
} from "../lib/crmService";
import type { IntegrationChannel } from "../lib/types";
import { WhatsAppIntegration } from "./WhatsAppIntegration";

// Providers agrupados por integração. O envio (whatsapp-send) considera todos
// estes valores, então precisamos ativar/desativar por grupo, não por provider
// isolado.
const ZAPI_PROVIDERS = ["z-api"];
const META_PROVIDERS = ["whatsapp_cloud", "whatsapp"];

type ProviderKey = "z-api" | "meta";

const OPTIONS: Array<{
  key: ProviderKey;
  title: string;
  description: string;
  providers: string[];
  icon: typeof QrCode;
}> = [
  {
    key: "z-api",
    title: "Z-API (QR Code)",
    description: "Conecte lendo o QR Code no WhatsApp. Rápido para começar.",
    providers: ZAPI_PROVIDERS,
    icon: QrCode,
  },
  {
    key: "meta",
    title: "Meta Cloud API (Oficial)",
    description:
      "API oficial da Meta. Número dedicado, maior estabilidade e templates.",
    providers: META_PROVIDERS,
    icon: BadgeCheck,
  },
];

const isRealPhone = (value: unknown): value is string =>
  typeof value === "string" && /^\d{10,15}$/.test(value.trim());

export function IntegrationSection() {
  const [channels, setChannels] = useState<IntegrationChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [switching, setSwitching] = useState<ProviderKey | null>(null);

  const reload = useCallback(async () => {
    try {
      setChannels(await getIntegrationChannels());
    } catch (error) {
      console.error("[IntegrationSection] load channels", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Canal existente por grupo de provider.
  const channelFor = useCallback(
    (providers: string[]) =>
      channels.find((c) => providers.includes(c.provider)) ?? null,
    [channels],
  );

  // Provider ativo = aquele que tem ao menos um canal 'ativo'.
  const activeKey: ProviderKey | null = useMemo(() => {
    if (channels.some((c) => META_PROVIDERS.includes(c.provider) && c.status === "ativo"))
      return "meta";
    if (channels.some((c) => ZAPI_PROVIDERS.includes(c.provider) && c.status === "ativo"))
      return "z-api";
    return null;
  }, [channels]);

  const handleSelect = async (option: (typeof OPTIONS)[number]) => {
    if (option.key === activeKey || switching) return;

    const hasChannel = Boolean(channelFor(option.providers));
    if (!hasChannel) {
      toast.error(
        option.key === "meta"
          ? "Canal Meta ainda não configurado. Registre-o primeiro (Phone Number ID e secrets)."
          : "Canal Z-API ainda não existe. Conecte um número pelo QR Code abaixo.",
      );
      return;
    }

    setSwitching(option.key);
    try {
      // Ativa todos os canais do grupo escolhido e desativa os demais — assim o
      // envio (que usa o canal 'ativo' mais recente) fica sem ambiguidade.
      await Promise.all(
        channels.map((c) =>
          updateIntegrationChannelStatus(
            c.id,
            option.providers.includes(c.provider) ? "ativo" : "inativo",
          ),
        ),
      );
      await reload();
      toast.success(`Integração ativa: ${option.title}`);
    } catch (error) {
      console.error("[IntegrationSection] switch", error);
      toast.error("Não foi possível trocar a integração. Tente novamente.");
    } finally {
      setSwitching(null);
    }
  };

  const metaChannel = channelFor(META_PROVIDERS);

  return (
    <div className="w-full max-w-md space-y-5">
      <div>
        <h3 className="flex items-center gap-2 font-bold text-lg text-foreground">
          <Cable className="w-5 h-5 text-primary" />
          Integração de WhatsApp
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Escolha qual integração o Funil usa para enviar e receber mensagens.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-6">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Seletor de provider */}
          <div className="grid gap-3">
            {OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = option.key === activeKey;
              const configured = Boolean(channelFor(option.providers));
              const isBusy = switching === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleSelect(option)}
                  disabled={isBusy || isActive}
                  className={`text-left rounded-2xl border p-4 transition-all ${
                    isActive
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                      : "border-foreground/10 bg-card hover:border-foreground/20 hover:bg-foreground/5"
                  } ${isBusy || isActive ? "" : "active:scale-[0.99]"}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-foreground/5 text-muted-foreground"
                      }`}
                    >
                      {isBusy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {option.title}
                        </span>
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Ativo
                          </span>
                        ) : configured ? (
                          <span className="text-[11px] font-medium text-muted-foreground bg-foreground/5 border border-foreground/10 rounded-full px-2 py-0.5">
                            Configurado
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-amber-500/90 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                            Não configurado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Conteúdo do provider selecionado */}
          {activeKey === "meta" ? (
            <div className="bg-card border border-foreground/5 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 space-y-4">
                <div className="flex flex-col items-center justify-center p-6 space-y-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <BadgeCheck className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-emerald-500">
                      Meta Cloud API ativa
                    </p>
                    {isRealPhone(metaChannel?.numero) ? (
                      <p className="text-sm text-emerald-500/80 mt-0.5">
                        {metaChannel?.numero}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    Envio e recebimento são feitos pelo número oficial conectado
                    à Meta. Não é necessário QR Code.
                  </p>
                  {typeof metaChannel?.metadata?.phone_number_id === "string" && (
                    <p className="font-mono text-[11px] text-muted-foreground/70 break-all">
                      Phone Number ID: {String(metaChannel.metadata.phone_number_id)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Z-API (ou nenhum ativo): usa o gerenciador de QR Code existente.
            <WhatsAppIntegration />
          )}
        </>
      )}
    </div>
  );
}
