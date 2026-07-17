import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

// O MESMO Measurement ID do gtag em index.html (e do exportador GA4).
const GA4_MEASUREMENT_ID = "G-NSMD6MKLMK";

// `window.gtag` já está tipado globalmente em src/lib/analytics.ts.

// Captura o client_id do GA4: via gtag('get', ...) (oficial) com fallback pro cookie _ga.
function getGa4ClientId(): Promise<string> {
  return new Promise((resolve) => {
    const fromCookie = () => {
      const match = document.cookie.match(/_ga=GA\d+\.\d+\.(\d+\.\d+)/);
      resolve(match?.[1] ?? "");
    };
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      let done = false;
      try {
        window.gtag("get", GA4_MEASUREMENT_ID, "client_id", (id: unknown) => {
          done = true;
          resolve(typeof id === "string" ? id : "");
        });
      } catch {
        fromCookie();
        return;
      }
      // gtag pode não responder (adblock/consentimento) → fallback no cookie.
      window.setTimeout(() => {
        if (!done) fromCookie();
      }, 800);
    } else {
      fromCookie();
    }
  });
}

export function LeadCaptureForm() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [honeypot, setHoneypot] = useState(""); // anti-spam (oculto)
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const gaClientId = await getGa4ClientId();
      const baseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
      if (!baseUrl) throw new Error("VITE_SUPABASE_URL ausente");

      const response = await fetch(`${baseUrl}/functions/v1/lead-intake`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(anonKey ? { apikey: anonKey, Authorization: `Bearer ${anonKey}` } : {}),
        },
        body: JSON.stringify({
          nome,
          telefone,
          ga_client_id: gaClientId,
          website: honeypot,
        }),
      });
      if (!response.ok) throw new Error(`intake ${response.status}`);
      setStatus("done");
    } catch (error) {
      console.error("[LeadCaptureForm] envio falhou", error);
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-foreground">
        <CheckCircle2 className="text-emerald-500 shrink-0" size={22} />
        <p className="text-sm">
          <strong>Recebido!</strong> Em breve entramos em contato pelo WhatsApp com a
          sua análise.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Honeypot: invisível para humanos, atrai bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={honeypot}
        onChange={(event) => setHoneypot(event.target.value)}
        className="hidden"
      />

      <input
        required
        type="text"
        placeholder="Seu nome"
        value={nome}
        onChange={(event) => setNome(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
      />
      <input
        required
        type="tel"
        inputMode="numeric"
        placeholder="Seu WhatsApp (DDD + número)"
        value={telefone}
        onChange={(event) => setTelefone(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-60"
      >
        {status === "sending" && <Loader2 size={16} className="animate-spin" />}
        Quero minha análise gratuita
      </button>

      {status === "error" && (
        <p className="text-sm text-red-500">
          Não foi possível enviar agora. Tente novamente em instantes.
        </p>
      )}
    </form>
  );
}
