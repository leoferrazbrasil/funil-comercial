import { useCallback, useEffect, useState } from "react";
import { Users, Plus, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { createTeamMember, getTeamMembers } from "../lib/crmService";
import type { TeamMember } from "../lib/types";

// Seção "Equipe" em Configurações: lista os vendedores vinculados ao
// admin logado e permite criar novos (email + senha provisória). Só é
// renderizada pelo Settings.tsx quando o usuário logado é admin.
export function TeamSection() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const reload = useCallback(async () => {
    try {
      setMembers(await getTeamMembers());
    } catch (error) {
      console.error("[TeamSection] load members", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || senha.length < 6) {
      toast.error("Informe email e senha (mín. 6).");
      return;
    }
    setSaving(true);
    try {
      await createTeamMember({ email, password: senha, nome });
      toast.success("Vendedor criado.");
      setNome("");
      setEmail("");
      setSenha("");
      await reload();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao criar vendedor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-5">
      <div>
        <h3 className="flex items-center gap-2 font-bold text-lg text-foreground">
          <Users className="w-5 h-5 text-primary" />
          Equipe
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Crie vendedores para receber transferências de conversas.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-6">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {members.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum vendedor ainda.
              </p>
            )}
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-card px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {m.nome || m.email}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.email}</p>
                </div>
                <span className="text-[11px] font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                  Vendedor
                </span>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleAdd}
            className="space-y-3 border-t border-white/5 pt-4"
          >
            <input
              className="w-full"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <input
              className="w-full"
              type="email"
              placeholder="E-mail do vendedor"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="w-full"
              type="text"
              placeholder="Senha provisória (mín. 6)"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="submit"
              disabled={saving}
              className="primary-button w-full"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus size={16} /> Adicionar vendedor
                </>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
