import React, { useState, useEffect } from "react";
import { X, Send, Info, CheckCircle2, AlertTriangle, RefreshCw, Share2 } from "lucide-react";
import { supabase } from "../lib/supabase";

declare global {
  interface Window {
    FB: any;
  }
}

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
  
  // Facebook Auth State
  const [isConnected, setIsConnected] = useState(false);
  const [fbAccessToken, setFbAccessToken] = useState<string | null>(null);
  const [instagramAccount, setInstagramAccount] = useState<{ id: string, username: string } | null>(null);

  useEffect(() => {
    // Check if FB SDK is loaded
    if (window.FB) {
      window.FB.getLoginStatus((response: any) => {
        if (response.status === 'connected') {
          handleFacebookToken(response.authResponse.accessToken);
        }
      });
    }
  }, [isOpen]);

  const handleFacebookToken = async (token: string) => {
    try {
      setFbAccessToken(token);
      // Fetch Pages
      const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${token}`);
      const pagesData = await pagesRes.json();
      
      if (!pagesData.data || pagesData.data.length === 0) {
        throw new Error("Nenhuma página do Facebook encontrada.");
      }

      // Check each page for an Instagram Business Account
      for (const page of pagesData.data) {
        const igRes = await fetch(`https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${token}`);
        const igData = await igRes.json();
        
        if (igData.instagram_business_account) {
          const igId = igData.instagram_business_account.id;
          // Get IG Username
          const igProfileRes = await fetch(`https://graph.facebook.com/v19.0/${igId}?fields=username&access_token=${token}`);
          const igProfile = await igProfileRes.json();
          
          setInstagramAccount({ id: igId, username: igProfile.username || 'Conta Instagram' });
          setIsConnected(true);
          return;
        }
      }
      
      throw new Error("Nenhuma conta do Instagram Business conectada às suas páginas.");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message);
    }
  };

  const handleLogin = () => {
    if (!window.FB) {
      setErrorMessage("O SDK do Facebook ainda não foi carregado.");
      return;
    }
    
    window.FB.login((response: any) => {
      if (response.authResponse) {
        handleFacebookToken(response.authResponse.accessToken);
      } else {
        setErrorMessage("O login com o Facebook foi cancelado.");
      }
    }, { scope: 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement' });
  };

  if (!isOpen) return null;

  const handlePublish = async () => {
    if (!fbAccessToken || !instagramAccount || !imageUrl || !supabase) return;
    
    setStatus("uploading");
    setErrorMessage("");
    try {
      // 1. Convert base64 to Blob
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
      }
      const fileBlob = new Blob([bytes], { type: 'image/jpeg' });
      const fileName = `post_${Date.now()}.jpg`;

      // 2. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('social_media_temp')
        .upload(fileName, fileBlob, { contentType: 'image/jpeg' });
        
      if (uploadError) throw new Error("Erro ao fazer upload para nuvem: " + uploadError.message);

      // 3. Get Public URL
      const { data: publicUrlData } = supabase.storage.from('social_media_temp').getPublicUrl(fileName);
      const publicUrl = publicUrlData.publicUrl;

      setStatus("publishing");

      // 4. Create IG Container
      const createRes = await fetch(`https://graph.facebook.com/v19.0/${instagramAccount.id}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: publicUrl,
          caption: caption,
          access_token: fbAccessToken
        })
      });
      const createData = await createRes.json();
      
      if (createData.error) throw new Error("Erro na API do Instagram: " + createData.error.message);
      
      // 5. Publish IG Container
      const publishRes = await fetch(`https://graph.facebook.com/v19.0/${instagramAccount.id}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: createData.id,
          access_token: fbAccessToken
        })
      });
      const publishData = await publishRes.json();

      if (publishData.error) throw new Error("Erro ao publicar no Instagram: " + publishData.error.message);

      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Erro ao publicar no Instagram.");
      setStatus("error");
    }
  };

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

          <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
            
            {/* Connection Status */}
            {isConnected && instagramAccount ? (
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-[2px]">
                      <div className="w-full h-full bg-card rounded-full flex items-center justify-center">
                         <span className="text-xs font-bold">{instagramAccount.username.substring(0, 2).toUpperCase()}</span>
                      </div>
                   </div>
                   <div>
                     <div className="text-sm font-bold">@{instagramAccount.username}</div>
                     <div className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 size={12}/> Conta conectada</div>
                   </div>
                 </div>
                 <button onClick={handleLogin} className="text-xs font-semibold text-primary hover:underline">Trocar</button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl p-6 border border-white/10 text-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500">
                   <Share2 size={24} />
                 </div>
                 <div>
                   <h3 className="font-bold mb-1">Conecte seu Instagram</h3>
                   <p className="text-xs text-muted-foreground">Você precisa conectar a página do Facebook vinculada ao seu Instagram Comercial.</p>
                 </div>
                 <button onClick={handleLogin} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors">
                   Conectar com Facebook
                 </button>
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
                   <div className="text-xs opacity-80 mt-1">Sua arte já está no ar no perfil @funilcomercial.</div>
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
                {status === 'uploading' ? 'Preparando Imagem...' : status === 'publishing' ? 'Enviando para Meta...' : 'Publicar Agora'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
