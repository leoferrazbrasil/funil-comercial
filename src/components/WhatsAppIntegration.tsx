import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Loader2, Smartphone, QrCode, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

type ConnectionStatus = "loading" | "connected" | "disconnected" | "error";

export function WhatsAppIntegration() {
  const [status, setStatus] = useState<ConnectionStatus>("loading");
  const [phone, setPhone] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
        }
      );

      if (!response.ok) throw new Error("Failed to check status");

      const data = await response.json();
      if (data.connected) {
        setStatus("connected");
        setPhone(data.phone);
        setQrCode(null);
      } else {
        setStatus("disconnected");
      }
    } catch (error) {
      console.error("Error checking WhatsApp status:", error);
      setStatus("error");
    }
  };

  useEffect(() => {
    checkStatus();

    // Listen for real-time updates on integration_channels
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'integration_channels',
          filter: `provider=eq.z-api`
        },
        (payload: any) => {
          if (payload.new.status === 'ativo') {
            setStatus("connected");
            setPhone(payload.new.numero);
            setQrCode(null);
            toast.success("WhatsApp Conectado! Sua instância foi conectada com sucesso.");
          } else if (payload.new.status === 'inativo' || payload.new.status === 'pausado') {
            setStatus("disconnected");
            setPhone(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleConnect = async () => {
    setIsGenerating(true);
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

      if (!response.ok) throw new Error("Failed to generate QR Code");

      const data = await response.json();
      if (data.qrCode) {
        setQrCode(data.qrCode);
      } else {
        toast.error("Não foi possível gerar o QR Code. Tente novamente.");
      }
    } catch (error) {
      console.error("Error connecting WhatsApp:", error);
      toast.error("Falha ao comunicar com o servidor.");
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
      toast.success("A instância foi desconectada.");
    } catch (error) {
      console.error("Error disconnecting WhatsApp:", error);
    }
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
            <p className="text-sm font-medium">Erro ao verificar status.</p>
            <button 
              type="button" 
              className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
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
              <p className="font-semibold text-emerald-500">Conectado</p>
              <p className="text-sm text-emerald-500/80">{phone}</p>
            </div>
            <button 
              type="button"
              className="w-full px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors mt-2" 
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
            <button 
              type="button"
              className="w-full px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-50"
              onClick={handleConnect} 
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando QR Code...
                </>
              ) : (
                "Conectar Número"
              )}
            </button>
          </div>
        )}

        {qrCode && (
          <div className="flex flex-col items-center justify-center p-4 space-y-4 bg-white/5 rounded-xl animate-in fade-in zoom-in duration-300">
            <p className="text-sm font-medium text-center">
              Escaneie o QR Code com seu WhatsApp
            </p>
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <img src={qrCode} alt="WhatsApp QR Code" className="w-48 h-48 object-contain" />
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Aguardando leitura...
            </div>
            <button 
              type="button"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setQrCode(null)}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
