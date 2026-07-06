import React, { useState, useEffect } from "react";
import { X, Send, CheckCircle2, AlertTriangle, RefreshCw, Share2 } from "lucide-react";
import { supabase } from "../lib/supabase";

type PublishModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  defaultCaption?: string;
  onPublish: (caption: string) => Promise<void>;
};

export default function PublishModal({ isOpen, onClose, imageUrl, defaultCaption = "" }: PublishModalProps) {
  const [caption, setCaption] = useState(defaultCaption);
  const [status, setStatus] = useState<"idle" | "uploading" | "publishing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Connection State
  const [isConnected, setIsConnected] = useState(false);
  const [instagramAccountId, setInstagramAccountId] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    if (isOpen) {
      checkIntegration();
    }
  }, [isOpen]);

  useEffect(() => {
    // Listen for OAuth popup success
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.data?.type === "META_OAUTH_SUCCESS") {
        checkIntegration();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const checkIntegration = async () => {
    setIsLoadingAuth(true);
    try {
      const { data, error } = await supabase
        .from('social_integrations')
        .select('account_id')
        .eq('platform', 'instagram')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (data && data.account_id) {
        setInstagramAccountId(data.account_id);
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      console.error("Erro ao checar integração", err);
      setIsConnected(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogin = () => {
    const appId = import.meta.env.VITE_META_APP_ID;
    if (!appId) {
      setErrorMessage("O ID do Aplicativo Meta (VITE_META_APP_ID) não está configurado. Verifique as configurações de ambiente.");
      return;
    }
    
    const redirectUri = encodeURIComponent(`${window.location.origin}/oauth/meta`);
    const scopes = 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement';
    const oauthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&display=popup&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}`;
    
    const width = 600;
    const height = 700;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;
    
    window.open(oauthUrl, 'MetaAuth', `width=${width},height=${height},top=${top},left=${left}`);
  };

  const handlePublish = async () => {
    if (!isConnected || !instagramAccountId || !imageUrl || !supabase) return;
    
    setStatus("uploading");
    setErrorMessage("");
    try {
      setStatus("publishing");

      const { data, error } = await supabase.functions.invoke('meta-publish', {
        body: {
          imageBase64: imageUrl,
          caption: caption,
          instagramAccountId: instagramAccountId
        }
      });

      if (error) throw error;
      if (data && data.error) throw new Error(data.error);

      setStatus("success");
    } catch (err: any) {
      console.error(err);
      
      let errorMsg = err.message || "Erro ao publicar no Instagram.";
      if (errorMsg.includes('Error validating access token') || errorMsg.includes('token')) {
        errorMsg = "A sessão do Instagram expirou. Por favor, conecte a conta novamente.";
        setIsConnected(false);
      }
      
      setErrorMessage(errorMsg);
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Left Side: Preview */}
        <div className="w-full md:w-1/2 bg-[#09090B] p-6 flex flex-col justify-center items-center relative border-b md:border-b-0 md:border-r border-white/5">
          <div className="absolute top-4 left-4 flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-wider">
            <Share2 size={14} /> Prévia do Post
          </div>
          
          {imageUrl ? (
            <div className="w-full max-w-[300px] aspect-[4/5] rounded-xl overflow-hidden shadow-2xl border border-white/10 mt-8 relative">
              <img src={imageUrl} alt="Prévia" className="w-full h-full object-cover" />
              {/* Instagram UI Overlay Mock */}
              <div className="absolute top-0 left-0 w-full p-3 flex items-center gap-2 bg-gradient-to-b from-black/50 to-transparent">
                 <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">FC</div>
                 <span className="text-white text-xs font-bold">funilcomercial</span>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[300px] aspect-[4/5] rounded-xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center text-muted-foreground mt-8">
              <RefreshCw className="animate-spin mb-2" />
              <span className="text-sm">Processando imagem...</span>
            </div>
          )}
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Publicar Arte</h2>
              <p className="text-sm text-muted-foreground">Envio direto para a conta oficial</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-white" disabled={status === 'uploading' || status === 'publishing'}>
              <X size={20} />
            </button>
          </div>

          <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            
            {/* Connection Status */}
            {isLoadingAuth ? (
               <div className="flex items-center justify-center bg-white/5 rounded-xl p-6 border border-white/10 text-center gap-3">
                 <RefreshCw className="animate-spin text-muted-foreground" size={20} />
                 <span className="text-sm text-muted-foreground">Verificando conexão...</span>
               </div>
            ) : isConnected && instagramAccountId ? (
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-[2px]">
                      <div className="w-full h-full bg-card rounded-full flex items-center justify-center">
                         <span className="text-xs font-bold">IG</span>
                      </div>
                   </div>
                   <div>
                     <div className="text-sm font-bold">Conta Conectada</div>
                     <div className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 size={12}/> Pronta para publicar</div>
                   </div>
                 </div>
                 <button onClick={handleLogin} className="text-xs font-semibold text-primary hover:underline">Reconectar</button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl p-6 border border-white/10 text-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white">
                   <Share2 size={24} />
                 </div>
                 <div>
                   <h3 className="font-bold mb-1">Conecte seu Instagram</h3>
                   <p className="text-xs text-muted-foreground">Para publicar, vincule sua conta do Instagram Comercial (via Facebook).</p>
                 </div>
                 <button onClick={handleLogin} className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95">
                   Conectar Instagram
                 </button>
                 <span className="text-[10px] text-muted-foreground opacity-70">Integração Oficial Segura</span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Legenda do Post</label>
                <span className="text-[10px] font-medium text-muted-foreground">{caption.length}/2200</span>
              </div>
              <textarea 
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={6}
                maxLength={2200}
                placeholder="Escreva uma legenda engajadora para sua audiência..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-primary/50 outline-none transition-colors resize-none"
                disabled={status === 'uploading' || status === 'publishing' || status === 'success'}
              />
            </div>

            {/* Status Messages */}
            {status === "error" && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-red-400">
                 <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                 <div className="text-sm font-medium">{errorMessage}</div>
              </div>
            )}
            
            {status === "success" && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex gap-3 text-green-400">
                 <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                 <div>
                   <div className="text-sm font-bold">Publicado com sucesso!</div>
                   <div className="text-xs opacity-80 mt-1">Sua arte já está no ar no perfil oficial.</div>
                 </div>
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3 bg-black/20">
            {status !== 'success' && (
              <button 
                onClick={onClose} 
                className="px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-white/5 transition-colors"
                disabled={status === 'uploading' || status === 'publishing'}
              >
                Cancelar
              </button>
            )}
            
            {status === 'success' ? (
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 transition-colors">
                Fechar
              </button>
            ) : (
              <button 
                onClick={handlePublish}
                disabled={!isConnected || status === 'uploading' || status === 'publishing' || !imageUrl}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {(status === 'uploading' || status === 'publishing') ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <Send size={18} />
                )}
                {status === 'publishing' ? 'Enviando para Meta...' : 'Publicar Agora'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
