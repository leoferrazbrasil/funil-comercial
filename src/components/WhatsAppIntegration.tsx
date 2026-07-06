import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Smartphone, QrCode, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type ConnectionStatus = "loading" | "connected" | "disconnected" | "error";

export function WhatsAppIntegration() {
  const [status, setStatus] = useState<ConnectionStatus>("loading");
  const [phone, setPhone] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

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
        (payload) => {
          if (payload.new.status === 'ativo') {
            setStatus("connected");
            setPhone(payload.new.numero);
            setQrCode(null);
            toast({
              title: "WhatsApp Conectado!",
              description: "Sua instância foi conectada com sucesso.",
            });
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
        toast({
          title: "Erro",
          description: "Não foi possível gerar o QR Code. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error connecting WhatsApp:", error);
      toast({
        title: "Erro de Conexão",
        description: "Falha ao comunicar com o servidor.",
        variant: "destructive",
      });
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
      toast({
        title: "WhatsApp Desconectado",
        description: "A instância foi desconectada.",
      });
    } catch (error) {
      console.error("Error disconnecting WhatsApp:", error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-primary" />
          Conexão WhatsApp
        </CardTitle>
        <CardDescription>
          Gerencie a conexão do seu número de WhatsApp com o Funil Comercial.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Verificando status...</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center p-6 space-y-4 text-destructive">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm font-medium">Erro ao verificar status.</p>
            <Button variant="outline" onClick={checkStatus}>Tentar Novamente</Button>
          </div>
        )}

        {status === "connected" && (
          <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-green-50/50 dark:bg-green-950/20 rounded-xl border border-green-100 dark:border-green-900/50">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-green-700 dark:text-green-300">Conectado</p>
              <p className="text-sm text-green-600/80 dark:text-green-400/80">{phone}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={handleDisconnect}>
              Desconectar
            </Button>
          </div>
        )}

        {status === "disconnected" && !qrCode && (
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <QrCode className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Nenhum número conectado no momento.
            </p>
            <Button className="w-full" onClick={handleConnect} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando QR Code...
                </>
              ) : (
                "Conectar Número"
              )}
            </Button>
          </div>
        )}

        {qrCode && (
          <div className="flex flex-col items-center justify-center p-4 space-y-4 bg-muted/30 rounded-xl animate-in fade-in zoom-in duration-300">
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
            <Button variant="ghost" size="sm" onClick={() => setQrCode(null)}>
              Cancelar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
