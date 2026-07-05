import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, CheckCircle2, Database, MoveRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import Logo from "../components/Logo";
import { brandConfig } from "../lib/branding";
import { isSupabaseConfigured } from "../lib/supabase";

export default function SignUpScreen({
  authError,
  onAuth,
}: {
  authError: string | null;
  onAuth: (
    email: string,
    password: string,
    mode: "login" | "signup",
    name?: string
  ) => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states for validation
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    // Validações locais
    if (password.length < 6) {
      setLocalError("A senha deve conter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("As senhas não conferem.");
      return;
    }

    setIsSubmitting(true);
    await onAuth(email, password, "signup", name);
    setIsSubmitting(false);
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 33;
    if (/[A-Z]/.test(password)) strength += 33;
    if (/[0-9!@#$%^&*]/.test(password)) strength += 34;
    return strength;
  };

  const strength = getPasswordStrength();
  let strengthLabel = "";
  let strengthColor = "bg-muted";
  
  if (password.length > 0) {
    if (strength < 40) { strengthLabel = "Fraca"; strengthColor = "bg-red-500"; }
    else if (strength < 70) { strengthLabel = "Média"; strengthColor = "bg-amber-500"; }
    else { strengthLabel = "Forte"; strengthColor = "bg-green-500"; }
  }

  const errorToDisplay = localError || authError;

  return (
    <main className="min-h-screen bg-background flex flex-col md:flex-row selection:bg-primary/30">
      {/* Esquerda: Lado Decorativo e Confiança */}
      <section 
        className="hidden md:flex flex-1 bg-primary/5 flex-col justify-center p-12 border-r border-border relative overflow-hidden" 
        aria-label="Benefícios da Plataforma"
      >
        <div className="max-w-lg mx-auto relative z-10">
          <Logo iconSize={40} className="mb-10" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            Sua operação pronta para escalar.
          </h1>
          <p className="text-lg text-muted-foreground mb-12 max-w-md">
            Crie sua conta em segundos e conecte tráfego, CRM e automações em um só lugar. Pare de perder leads.
          </p>
          
          <div className="grid gap-6 max-w-md">
            <article className="flex gap-4 items-start p-6 rounded-2xl bg-card border border-white/5 shadow-sm">
              <div className="mt-1 bg-green-500/10 p-2 rounded-lg text-green-600 dark:text-green-400">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <strong className="block text-foreground text-lg font-semibold mb-1">Setup instantâneo</strong>
                <span className="text-muted-foreground text-sm">Nenhuma configuração complexa. Crie a conta e comece a operar.</span>
              </div>
            </article>

            <article className="flex gap-4 items-start p-6 rounded-2xl bg-card border border-white/5 shadow-sm">
              <div className="mt-1 bg-blue-500/10 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                <MessageCircle size={24} />
              </div>
              <div>
                <strong className="block text-foreground text-lg font-semibold mb-1">Integração WhatsApp</strong>
                <span className="text-muted-foreground text-sm">Responda clientes e mova cards do funil sem sair da mesma tela.</span>
              </div>
            </article>

            <article className="flex gap-4 items-start p-6 rounded-2xl bg-card border border-white/5 shadow-sm">
              <div className="mt-1 bg-amber-500/10 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                <Database size={24} />
              </div>
              <div>
                <strong className="block text-foreground text-lg font-semibold mb-1">CRM focado em conversão</strong>
                <span className="text-muted-foreground text-sm">Visualizações limpas que mostram onde está o dinheiro.</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Direita: Formulário */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-y-auto">
        <div className="md:hidden w-full max-w-md mb-8">
          <Logo iconSize={32} />
        </div>

        <form 
          className="w-full max-w-[420px] space-y-6 bg-card p-8 md:p-10 rounded-3xl border border-border shadow-[0_18px_48px_rgba(4,29,87,0.1)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.32)]" 
          aria-label="Criar nova conta" 
          onSubmit={handleSubmit}
        >
          <div className="mb-6">
            <p className="text-xs font-bold tracking-wider text-primary uppercase mb-3">Cadastro Gratuito</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Crie sua conta</h2>
            <p className="text-sm text-muted-foreground">
              Preencha os dados abaixo para iniciar sua jornada.
            </p>
          </div>

          {!isSupabaseConfigured && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20" role="alert">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Modo Local</p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
                Configure as chaves do Supabase para criar dados reais.
              </p>
            </div>
          )}

          {errorToDisplay && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex gap-3 items-start" role="alert" aria-live="assertive">
              <AlertCircle size={18} className="text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Falha no cadastro</p>
                <p className="text-xs text-destructive/80 mt-1">{errorToDisplay}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-foreground">
                Nome completo
              </label>
              <input 
                id="name"
                className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                name="name"
                placeholder="Ex: João da Silva"
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-foreground">
                E-mail profissional
              </label>
              <input 
                id="email"
                className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                name="email"
                placeholder="joao@suaempresa.com.br"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-foreground">
                Senha
              </label>
              <div className="relative">
                <input 
                  id="password"
                  className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 pr-12 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                  minLength={6}
                  name="password"
                  placeholder="Mínimo de 6 caracteres"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Indicador de força de senha */}
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden flex">
                    <div className={`h-full transition-all duration-300 ${strengthColor}`} style={{ width: `${strength}%` }} />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground w-12 text-right">
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                Confirme a senha
              </label>
              <div className="relative">
                <input 
                  id="confirmPassword"
                  className={`flex h-12 w-full rounded-xl border bg-background px-4 py-2 pr-12 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
                    confirmPassword && confirmPassword !== password ? 'border-destructive focus-visible:ring-destructive' : 'border-input'
                  }`}
                  minLength={6}
                  name="confirmPassword"
                  placeholder="Digite a senha novamente"
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showConfirmPassword ? "Ocultar confirmação" : "Ver confirmação"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <input 
                type="checkbox" 
                id="terms" 
                required
                className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-ring"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer select-none leading-tight">
                Li e concordo com os <a href="#" className="text-primary hover:underline font-medium">Termos de Uso</a> e <a href="#" className="text-primary hover:underline font-medium">Política de Privacidade</a>.
              </label>
            </div>
          </div>

          <div className="pt-2 space-y-4">
            <button
              className="flex w-full items-center justify-center gap-2 h-12 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_24px_rgba(245,158,11,0.2)]"
              disabled={!isSupabaseConfigured || isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Criando conta..." : "Começar Agora"}
              <MoveRight size={18} />
            </button>
          </div>
          
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Já possui uma conta?{" "}
              <Link to="/login" className="font-semibold text-foreground hover:text-primary transition-colors">
                Faça login
              </Link>
            </p>
          </div>
        </form>
        
        <p className="mt-8 text-xs text-muted-foreground/60">
          Garantimos a segurança e confidencialidade dos seus dados.
        </p>
      </div>
    </main>
  );
}
