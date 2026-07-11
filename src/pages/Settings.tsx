import { Settings as SettingsIcon } from "lucide-react";
import { IntegrationSection } from "../components/IntegrationSection";

// Página "Configurações": hub das integrações e ajustes do sistema. Hoje reúne
// a integração de WhatsApp (Z-API × Meta), desvinculada do Perfil. Novas seções
// entram como novos painéis abaixo — sem precisar de abas por enquanto (YAGNI).
export default function SettingsPage() {
  return (
    <div className="page-stack max-w-3xl mx-auto w-full pb-20 md:pb-8">
      <div className="panel bg-card border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-primary/10" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center border border-primary/20 shrink-0">
            <SettingsIcon size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Configurações
            </h2>
            <p className="text-muted-foreground text-sm mt-0.5">
              Integrações e ajustes do sistema.
            </p>
          </div>
        </div>
      </div>

      {/* Seção: Integrações */}
      <div className="panel p-6">
        <IntegrationSection />
      </div>
    </div>
  );
}
