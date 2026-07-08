import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Loader2, Smartphone, QrCode, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

type ConnectionStatus = "loading" | "connected" | "disconnected" | "error";
type ScanStatus = "waiting" | "finalizing";

// QR Code validity window on our side. While it is visible we poll the live
// Z-API status every few seconds; the connection is ALSO pushed to us in real
// time via the integration_channels realtime channel (fed by the Z-API
// on-connect webhook). Either path flips the UI to "Conectado".
const QR_EXPIRY_MS = 300_000; // 5 minutes
const POLL_INTERVAL_MS = 3_000;
// After this many consecutive failed status checks we stop hiding the problem
// and surface an actionable hint (instead of an eternal silent spinner).
const POLL_FAILURE_HINT_THRESHOLD = 3;

// The backend stores placeholder markers in `numero` (pending-*, disconnected-*,
// "connected") until a real phone is known. Only ever render a real phone.
const isRealPhone = (value: unknown): value is string =>
  typeof value === "string" && /^\d{10,15}$/.test(value.trim());

export function WhatsAppIntegration() {
  const [status, setStatus] = useState<ConnectionStatus>("loading");
  const [phone, setPhone] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("waiting");
  const [qrExpired, setQrExpired] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pollWarning, setPollWarning] = useState(false);
  const qrExpiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollFailuresRef = useRef(0);
  // Kept in refs so the realtime handler and interval callback always read the
  // latest values without needing to re-subscribe.
  const qrVisibleRef = useRef(false);
  qrVisibleRef.current = Boolean(qrCode) && !qrExpired;
  const statusRef = useRef<ConnectionStatus>(status);
  statusRef.current = status;

  const clearQrExpiry = () => {
    if (qrExpiryTimer.current) {
      clearTimeout(qrExpiryTimer.current);
      qrExpiryTimer.current = null;
    }
  };

  const applyConnected = (rawPhone: unknown) => {
    setStatus("connected");
    setPhone(isRealPhone(rawPhone) ? rawPhone.trim() : null);
    setQrCode(null);
    setQrExpired(false);
    setScanStatus("waiting");
    setPollWarning(false);
    pollFailuresRef.current = 0;
    clearQrExpiry();
  };

  // Returns true if the check confirmed a connection (used by the manual button).
  const checkStatus = async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-manager?action=status`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
          signal: AbortSignal.timeout(30000),
        }
      );

      if (!response.ok) {
        throw new Error(`status HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("[WhatsAppIntegration] Status check:", data);
      pollFailuresRef.current = 0;
      setPollWarning(false);

      if (data.connected) {
        const alreadyConnected = statusRef.current === "connected";
        applyConnected(data.phone);
        if (!alreadyConnected) toast.success("WhatsApp conectado com sucesso!");
        return true;
      }

      // Not connected yet. Never override a connection that a realtime event may
      // have just applied; otherwise settle on "disconnected".
      setStatus((prev) => (prev === "connected" ? "connected" : "disconnected"));
      return false;
    } catch (error) {
      // IMPORTANT: during polling `status` is "disconnected", so we must NOT stay
      // silent here (the old code only surfaced errors while "loading", which let
      // a timed-out status check leave the spinner hanging forever).
      console.error("[WhatsAppIntegration] Error checking WhatsApp status:", error);
      pollFailuresRef.current += 1;
      if (status === "loading") {
        setStatus("error");
      } else if (qrVisibleRef.current && pollFailuresRef.current >= POLL_FAILURE_HINT_THRESHOLD) {
        setPollWarning(true);
      }
      return false;
    }
  };

  useEffect(() => {
    checkStatus();

    // Realtime push: the Z-API on-connect webhook (whatsapp-qr-inbound) writes
    // integration_channels.status='ativo', which is streamed here. This is the
    // authoritative, instant path — independent of polling.
    const channel = supabase
      .channel("whatsapp-integration-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "integration_channels" },
        (payload: any) => {
          const row = payload?.new;
          if (!row || row.provider !== "z-api") return;
          console.log("[WhatsAppIntegration] Realtime update:", row.status, row.numero);

          if (row.status === "ativo") {
            const wasConnected = statusRef.current === "connected";
            applyConnected(row.numero);
            if (!wasConnected) toast.success("WhatsApp conectado com sucesso!");
          } else if (row.status === "inativo" || row.status === "pausado") {
            // Ignore downgrade events while a QR is on screen (mid-connect churn
            // from create/regenerate) to avoid flicker; the poll/expiry govern that view.
            if (qrVisibleRef.current) return;
            setStatus((prev) => (prev === "connected" ? "disconnected" : prev === "loading" ? "disconnected" : prev));
            setPhone(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      clearQrExpiry();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll live status every 3s while the QR Code is visible.
  useEffect(() => {
    if (!qrCode || qrExpired) return;
    const interval = setInterval(() => { checkStatus(); }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCode, qrExpired]);

  const handleConnect = async () => {
    setIsGenerating(true);
    setQrExpired(false);
    setScanStatus("waiting");
    setPollWarning(false);
    pollFailuresRef.current = 0;
    clearQrExpiry();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-manager?action=create`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
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

        qrExpiryTimer.current = setTimeout(() => {
          // Do a final check before declaring the QR expired — the connection may
          // have landed right at the edge of the window.
          checkStatus().then((connected) => {
            if (connected) return;
            setQrExpired(true);
            setQrCode(null);
            setScanStatus("waiting");
            setStatus("disconnected");
            toast.error("Não foi possível confirmar a conexão. Gere um novo QR Code e tente novamente.", {
              icon: "⏱️",
              duration: 6000,
            });
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

  // Manual "I already scanned — confirm now" escape hatch: the user is never
  // trapped waiting on the automatic detection.
  const handleVerifyNow = async () => {
    setIsVerifying(true);
    setScanStatus("finalizing");
    try {
      const connected = await checkStatus();
      if (!connected) {
        toast("Ainda não detectamos a conexão. Aguarde alguns segundos após escanear.", { icon: "⏳" });
      }
    } finally {
      setIsVerifying(false);
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
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      setStatus("disconnected");
      setPhone(null);
      setQrCode(null);
      setQrExpired(false);
      setScanStatus("waiting");
      clearQrExpiry();
      toast.success("Instância desconectada com sucesso.");
    } catch (error) {
      console.error("Error disconnecting WhatsApp:", error);
      toast.error("Não foi possível desconectar. Tente novamente.");
    }
  };

  const scanLabel = () =>
    scanStatus === "finalizing"
      ? "QR Code lido! Finalizando conexão..."
      : "Aguardando leitura do QR Code...";

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
              onClick={() => checkStatus()}
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
              {phone && (
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
                  Não foi possível confirmar a conexão
                </p>
                <p className="text-xs text-amber-600/70 text-center mt-1">
                  Se você já escaneou, toque em “Verificar conexão”. Caso contrário, gere um novo QR Code e tente novamente.
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
            {qrExpired && (
              <button
                type="button"
                className="w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                onClick={handleVerifyNow}
                disabled={isVerifying}
              >
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Já escaneei — Verificar conexão
              </button>
            )}
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

            {pollWarning && (
              <p className="text-xs text-amber-500 text-center">
                Estamos com dificuldade para confirmar automaticamente. Se já escaneou, use o botão abaixo.
              </p>
            )}

            <button
              type="button"
              className="w-full px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              onClick={handleVerifyNow}
              disabled={isVerifying}
            >
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Já escaneei — Verificar conexão
            </button>

            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => { setQrCode(null); setScanStatus("waiting"); clearQrExpiry(); }}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
