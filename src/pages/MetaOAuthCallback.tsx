import React, { useEffect, useState } from "react";
import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function MetaOAuthCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Autenticando com a Meta...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    const error_description = params.get("error_description");

    if (error) {
      setStatus("error");
      setMessage(error_description || "Ocorreu um erro durante a autenticação.");
      setTimeout(() => window.close(), 3000);
      return;
    }

    if (code) {
      // Exchange code for token via Edge Function
      const exchangeCode = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('meta-auth', {
            body: { 
              code, 
              redirectUri: `${window.location.origin}/oauth/meta` 
            }
          });

          if (error) throw error;
          if (data && data.error) throw new Error(data.error);

          setStatus("success");
          setMessage("Conta conectada com sucesso! Você pode fechar esta janela.");
          
          if (window.opener) {
            window.opener.postMessage({ type: "META_OAUTH_SUCCESS" }, window.location.origin);
          }
          setTimeout(() => window.close(), 2000);

        } catch (err: any) {
          console.error(err);
          setStatus("error");
          setMessage(err.message || "Falha ao conectar com o Instagram.");
        }
      };

      exchangeCode();
    } else {
      setStatus("error");
      setMessage("Código de autorização não encontrado.");
    }
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-background text-foreground p-6 font-sans">
      <div className="bg-card border border-foreground/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4">
        {status === "loading" && <RefreshCw className="animate-spin text-primary" size={48} />}
        {status === "success" && <CheckCircle2 className="text-green-500" size={48} />}
        {status === "error" && <XCircle className="text-red-500" size={48} />}
        
        <h2 className="text-xl font-bold tracking-tight">Conexão Instagram</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
        
        {status !== "loading" && (
          <button 
            onClick={() => window.close()} 
            className="mt-4 px-6 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-lg text-sm font-semibold transition-colors"
          >
            Fechar Janela
          </button>
        )}
      </div>
    </div>
  );
}
