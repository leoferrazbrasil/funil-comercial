import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Loader2, Smartphone, QrCode, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

type ConnectionStatus = "loading" | "connected" | "disconnected" | "error";
type ScanStatus = "waiting" | "scanned" | "connecting" | "finalizing";

// Increased to 300s (5 minutes) to allow Z-API sufficient time to:
// 1. Finalize the QR code handshake with WhatsApp
// 2. Establish the WebSocket connection
// 3. Sync historical messages
// 4. Return connected=true status
// Z-API typically needs 90-180s+ depending on network and message volume
const QR_EXPIRY_MS = 300_000;

export function WhatsAppIntegration() {
  const [status, setStatus] = useState<ConnectionStatus>("loading");
  const [phone, setPhone] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("waiting");
  const [qrExpired, setQrExpired] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const qrExpiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearQrExpiry = () => {
    if (qrExpiryTimer.current) {
      clearTimeout(qrExpiryTimer.current);
      qrExpiryTimer.current = null;
    }
  };

  const checkStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-manager?action=status`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          // 30 second timeout for status check
          signal: AbortSignal.timeout(30000),
        }
      );

      if (!response.ok) {
        console.warn("[WhatsAppIntegration] Status check failed:", response.status);
        throw new Error("Failed to check status");
      }

      const data = await response.json();
      console.log("[WhatsAppIntegration] Status check:", data);

      if (data.connected) {
        console.log("[WhatsAppIntegration] ✅ Connection successful!");
        setStatus("connected");
        setPhone(data.phone ?? null);
        setQrCode(null);
        setScanStatus("waiting");
        clearQrExpiry();
        toast.success("WhatsApp conectado com sucesso!");
      } else {
        // Safe update: don't override if real-time listener just set it to connected
        setStatus((prev) => {
          if (prev === "connected") return "connected";
          if (qrCode && prev === "disconnected") {
            // Still waiting for connection while QR is visible
            setScanStatus("connecting");
          }
          return "disconnected";
        });
      }
    } catch (error) {
      console.error("[WhatsAppIntegration] Error checking WhatsApp status:", error);
      if (status === "loading") setStatus("error");
    }
  };

  useEffect(() => {
    checkStatus();

    // Listen for real-time updates on integration_channels
    const channel = supabase
      .channel("whatsapp-integration-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "integration_channels",
        },
        (payload: any) => {
          console.log("[WhatsAppIntegration] Realtime update:", payload.new);
          if (payload.new.provider !== "z-api") return;

          if (payload.new.status === "ativo") {
            setStatus("connected");
            setPhone(payload.new.numero !== "connected" ? payload.new.numero : null);
            setQrCode(null);
            setScanStatus("waiting");
            clearQrExpiry();
            toast.success("WhatsApp conectado com sucesso!");
          } else if (payload.new.status === "inativo" || payload.new.status === "pausado") {
            setStatus("disconnected");
            setPhone(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      clearQrExpiry();
    };
  }, []);

  // Polling while QR Code is visible — faster polling (3s) for responsiveness
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (qrCode && !qrExpired) {
      interval = setInterval(() => {
        checkStatus();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [qrCode, qrExpired]);

  const handleConnect = async () => {
    setIsGenerating(true);
    setQrExpired(false);
    setScanStatus("waiting");
    clearQrExpiry();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-manager?action=create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        const serverMessage = errorData.error || "";
        if (serverMessage.includes("ainda está sendo preparada") || serverMessage.includes("instancia")) {
          throw new Error("Estamos preparando uma nova conexão. Aguarde alguns segundos e tente novamente.");
        }
        throw new Error("Não conseguimos iniciar a conexão agora. Tente novamente em instantes.");
      }

      const data = await response.json();
      if (data.qrCode) {
        setQrCode(data.qrCode);
        setStatus("disconnected");

        // Start QR expiry countdown (300 seconds = 5 minutes)
        qrExpiryTimer.current = setTimeout(() => {
          setQrExpired(true);
          setQrCode(null);
          setScanStatus("waiting");
          setStatus("disconnected");
          toast.error("QR Code expirado após 5 minutos. Gere um novo código e tente novamente.", {
            icon: "⏱️",
            duration: 5000
          });
        }, QR_EXPIRY_MS);
      } else {
        toast.error("Estamos preparando a conexão. Aguarde alguns segundos e tente novamente.");
      }
    } catch (error: any) {
      console.error("Error connecting WhatsApp:", error);
      toast.error(error.message || "Não foi possível iniciar a conexão. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-manager?action=disconnect`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      setStatus("disconnected");
      setPhone(null);
      setQrCode(null);
      setScanStatus("waiting");
      clearQrExpiry();
      toast.success("Instância desconectada com sucesso.");
    } catch (error) {
      console.error("Error disconnecting WhatsApp:", error);
      toast.error("Não foi possível desconectar. Tente novamente.");
    }
  };

  // Scan status label and icon
  const scanLabel = () => {
    if (qrExpired) return null;
    if (scanStatus === "finalizing") return "QR Code lido! Finalizando conexão...";
    if (scanStatus === "connecting") return "Conectando seu WhatsApp...";
    if (scanStatus === "scanned") return "Sincronizando mensagens...";
    return "Aguardando leitura do QR Code...";
  };

  return (
    <div className="w-full max-w-md bg-card border border-white/5 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-white/5">
        <h3 className="flex items-center gap-2 font-bold text-lg text-foreground">
          <Smartphone className="w-5 h-5 text-primary" />
          Conexão WhatsApp
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie a conexão do seu número de WhatsApp com o Funil Comercial.
        </p>
      </div>

      <div className="p-6 space-y-4">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Verificando status...</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center p-6 space-y-4 text-red-500">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm font-medium text-center">Não foi possível verificar o status da conexão.</p>
            <button
              type="button"
              className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-sm"
              onClick={checkStatus}
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {status === "connected" && (
          <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-emerald-500">WhatsApp Conectado</p>
              {phone && phone !== "connected" && (
                <p className="text-sm text-emerald-500/80 mt-0.5">{phone}</p>
              )}
            </div>
            <button
              type="button"
              className="w-full px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors mt-2 text-sm"
              onClick={handleDisconnect}
            >
              Desconectar
            </button>
          </div>
        )}

        {status === "disconnected" && !qrCode && (
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
              <QrCode className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Nenhum número conectado no momento.
            </p>
            {qrExpired && (
              <div className="w-full p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-xs text-amber-600 text-center font-medium">
                  QR Code expirou após 5 minutos
                </p>
                <p className="text-xs text-amber-600/70 text-center mt-1">
                  Isso pode acontecer se o WhatsApp demorar muito para processar a leitura. Gere um novo código e tente novamente.
                </p>
              </div>
            )}
            <button
              type="button"
              className="w-full px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-50 gap-2"
              onClick={handleConnect}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando QR Code...
                </>
              ) : qrExpired ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Gerar Novo QR Code
                </>
              ) : (
                "Conectar Número"
              )}
            </button>
          </div>
        )}

        {qrCode && !qrExpired && (
          <div className="flex flex-col items-center justify-center p-4 space-y-4 bg-white/5 rounded-xl animate-in fade-in zoom-in duration-300">
            <p className="text-sm font-medium text-center">
              Escaneie o QR Code com seu WhatsApp
            </p>
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <img src={qrCode} alt="WhatsApp QR Code" className="w-48 h-48 object-contain" />
            </div>
            <div className="w-full px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-blue-600 text-center font-medium">
                💡 Escaneie com a câmera do seu celular
              </p>
              <p className="text-xs text-blue-600/70 text-center mt-1">
                Se usar o WhatsApp web, toque em Menu → Vincular um dispositivo
              </p>
            </div>
            <div className={`flex items-center text-sm gap-2 ${scanStatus !== "waiting" ? "text-emerald-500" : "text-muted-foreground"}`}>
              <Loader2 className="w-3 h-3 animate-spin shrink-0" />
              <span className="font-medium">{scanLabel()}</span>
            </div>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => { setQrCode(null); clearQrExpiry(); }}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
