import { useState, useRef, useEffect } from "react";
import { Camera, Save, User, Lock, Shield } from "lucide-react";
import { IMaskInput } from "react-imask";
import { toast } from "react-hot-toast";
import { updateProfile, updateUserSecurity, uploadAvatar } from "../lib/crmService";
import type { Profile } from "../lib/types";

type ProfilePageProps = {
  profile: Profile | null;
  onProfileUpdated: () => void;
};

export default function ProfilePage({ profile, onProfileUpdated }: ProfilePageProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // States
  const [nome, setNome] = useState(profile?.nome || "");
  const [telefone, setTelefone] = useState(profile?.telefone || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if profile prop changes
  useEffect(() => {
    if (profile) {
      setNome(profile.nome || "");
      setTelefone(profile.telefone || "");
      setEmail(profile.email || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const hasChanges = 
    nome !== (profile?.nome || "") || 
    telefone !== (profile?.telefone || "") || 
    email !== (profile?.email || "") ||
    avatarUrl !== (profile?.avatar_url || "") ||
    novaSenha.length > 0;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB.");
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Formato inválido. Envie uma imagem (JPG, PNG).");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadAvatar(profile.id, file);
      setAvatarUrl(url);
      
      // Auto-save avatar immediately
      await updateProfile(profile.id, { avatar_url: url });
      toast.success("Foto de perfil atualizada!");
      onProfileUpdated();
    } catch (error: any) {
      toast.error("Erro ao fazer upload da imagem. O bucket 'avatars' pode não estar configurado.");
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (novaSenha && novaSenha !== confirmaSenha) {
      toast.error("As senhas não coincidem.");
      return;
    }

    if (novaSenha && novaSenha.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Update Profile (DB & Metadata)
      if (nome !== profile.nome || telefone !== profile.telefone || avatarUrl !== profile.avatar_url) {
        await updateProfile(profile.id, {
          nome,
          telefone,
          avatar_url: avatarUrl,
        });
      }

      // 2. Update Security (Auth)
      const securityUpdates: any = {};
      if (email !== profile.email) securityUpdates.email = email;
      if (novaSenha) securityUpdates.password = novaSenha;

      if (Object.keys(securityUpdates).length > 0) {
        await updateUserSecurity(securityUpdates);
        if (securityUpdates.email) {
          toast.success("Um e-mail de confirmação foi enviado para o novo e o antigo endereço.");
        }
        if (securityUpdates.password) {
          toast.success("Senha alterada com sucesso.");
          setNovaSenha("");
          setConfirmaSenha("");
        }
      }

      toast.success("Perfil atualizado com sucesso!");
      onProfileUpdated();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar o perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  const initials = (nome || profile?.email || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="page-stack max-w-3xl mx-auto w-full pb-20 md:pb-8">
      <div className="panel bg-card border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-primary/10"></div>
        <div className="relative z-10 group">
          <button 
            type="button"
            onClick={handleAvatarClick}
            disabled={isUploading}
            className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-surface border-4 border-card flex items-center justify-center text-3xl font-black text-primary overflow-hidden relative shadow-xl transition-transform hover:scale-105"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="text-white" size={32} />
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/jpeg, image/png, image/webp" 
            className="hidden" 
          />
        </div>
        
        <div className="relative z-10 text-center md:text-left flex-1">
          <h2 className="text-2xl font-black text-foreground tracking-tight">{nome || "Usuário"}</h2>
          <p className="text-muted-foreground mt-1 flex items-center justify-center md:justify-start gap-1.5">
            <Shield size={14} />
            <span className="capitalize">{profile?.role || "Usuário"}</span> da organização
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="panel p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="text-primary" size={20} />
            <h3 className="font-bold text-lg text-foreground">Informações Pessoais</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <label className="input-group">
              <span>Nome completo</span>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Como deseja ser chamado"
                required
              />
            </label>

            <label className="input-group">
              <span>Telefone / WhatsApp</span>
              <IMaskInput
                mask="(00) 00000-0000"
                value={telefone}
                onAccept={(value) => setTelefone(value)}
                placeholder="(11) 99999-9999"
              />
            </label>
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="text-amber-500" size={20} />
            <h3 className="font-bold text-lg text-foreground">Segurança da Conta</h3>
          </div>

          <div className="space-y-6">
            <label className="input-group">
              <span>E-mail de Acesso</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <small className="text-muted-foreground mt-1 block">
                Alterar o e-mail enviará um link de confirmação para o endereço antigo e para o novo.
              </small>
            </label>

            <hr className="border-white/5" />

            <div className="grid md:grid-cols-2 gap-6">
              <label className="input-group">
                <span>Nova Senha</span>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Deixe em branco para não alterar"
                  minLength={6}
                />
              </label>

              <label className="input-group">
                <span>Confirmar Nova Senha</span>
                <input
                  type="password"
                  value={confirmaSenha}
                  onChange={(e) => setConfirmaSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  minLength={6}
                />
              </label>
            </div>
          </div>
        </div>

        <div className={`fixed bottom-0 left-0 right-0 p-4 md:p-6 flex justify-center z-50 transition-transform duration-300 ${hasChanges ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="bg-surface/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-md w-full">
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Alterações não salvas</p>
              <p className="text-xs text-muted-foreground">Você modificou seu perfil.</p>
            </div>
            <button 
              type="button" 
              onClick={() => {
                setNome(profile?.nome || "");
                setTelefone(profile?.telefone || "");
                setEmail(profile?.email || "");
                setNovaSenha("");
                setConfirmaSenha("");
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSaving || (novaSenha !== confirmaSenha && novaSenha.length > 0)}
              className="primary-button !px-6"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={16} />
                  Salvar
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
