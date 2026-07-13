import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, RotateCcw, ShieldCheck, XCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import Logo from "../components/Logo";

// Página de redefinição de senha (rota pública /redefinir-senha). O Supabase, ao
// abrir o link do e-mail, cria uma sessão temporária de recuperação (detectada na
// URL). Aqui o usuário define a nova senha via updateUser; em sucesso, encerramos a
// sessão e voltamos ao /login. Link expirado/ inválido vira uma mensagem clara.
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"form" | "success" | "invalid">("form");

  // Link expirado/inválido: o Supabase pode redirecionar com
  // #error=...&error_description=... (hash) ou ?error=... (query).
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const search = new URLSearchParams(window.location.search);
    const err =
      hash.get("error_description") ||
      search.get("error_description") ||
      hash.get("error") ||
      search.get("error");
    if (err) {
      setStatus("invalid");
      setError(decodeURIComponent(err.replace(/\+/g, " ")));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (password.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      // Sem sessão de recuperação (link expirado/aberto fora do fluxo).
      if (/session|expired|token|missing|invalid/i.test(updateError.message)) {
        setStatus("invalid");
      }
      setError(updateError.message);
      return;
    }
    setStatus("success");
    // Encerra a sessão de recuperação e volta ao login para entrar com a nova senha.
    await supabase.auth.signOut();
    setTimeout(() => navigate("/login"), 2500);
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background text-foreground p-6">
      <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-[0_18px_48px_rgba(4,29,87,0.1)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.32)] flex flex-col gap-6">
        <div className="flex justify-center">
          <Logo iconSize={40} />
        </div>

        {status === "invalid" ? (
          <div className="text-center flex flex-col items-center gap-3">
            <XCircle className="text-destructive" size={44} />
            <h2 className="text-xl font-bold tracking-tight">Link inválido ou expirado</h2>
            <p className="text-sm text-muted-foreground">
              {error || "Este link de redefinição não é mais válido. Solicite um novo na tela de login."}
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-2 h-12 px-6 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              Voltar ao login
            </button>
          </div>
        ) : status === "success" ? (
          <div className="text-center flex flex-col items-center gap-3">
            <CheckCircle2 className="text-green-500" size={44} />
            <h2 className="text-xl font-bold tracking-tight">Senha alterada!</h2>
            <p className="text-sm text-muted-foreground">Redirecionando para o login…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-bold tracking-wider text-primary uppercase mb-3 flex items-center gap-1">
                <ShieldCheck size={14} /> Nova senha
              </p>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Crie uma nova senha</h2>
              <p className="text-sm text-muted-foreground">Escolha uma senha com pelo menos 6 caracteres.</p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20" role="alert">
                <p className="text-xs text-destructive/80">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-semibold">Nova senha</label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 pr-12 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2"
                  aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-semibold">Confirmar nova senha</label>
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={6}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 h-12 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading && <RotateCcw size={18} className="animate-spin" />}
              {loading ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
