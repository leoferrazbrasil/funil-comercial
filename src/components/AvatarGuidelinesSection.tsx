import { CheckCircle2, X, AlertTriangle, ShieldCheck, Crop, MonitorSmartphone, Bot, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo';

export default function AvatarGuidelinesSection() {
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const aiPrompt = "O símbolo oficial (Funil geométrico) deve ser preservado como um elemento 2D flat absoluto. A IA atua apenas no background ou na iluminação ambiente ao redor do avatar, mas NUNCA modifica o traço, a cor (#F59E0B) ou a espessura do ícone central. Não adicione reflexos 3D, sombras chanfradas ou texturas orgânicas sobre o vetor. O ícone deve permanecer estritamente vetorial e no centro perfeito do canvas.";

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(aiPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="space-y-16 w-full max-w-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER DA SEÇÃO */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">Avatar & IA</h2>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
          Diretrizes estritas para aplicação da marca como foto de perfil (Profile Picture) em canais digitais e regras de restrição para geração de variações utilizando Inteligência Artificial.
        </p>
      </div>

      {/* BLOCO 1: O PADRÃO OFICIAL */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <ShieldCheck className="text-primary" size={24} />
          <h3 className="text-2xl font-bold">A Versão Oficial</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          O avatar oficial é estritamente o <strong>símbolo isolado (icon-only)</strong> centralizado em um quadrado de 1080x1080px. Nunca utilize a versão com texto (Full Logo), pois ela se torna ilegível em telas de celular.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Fundo Escuro */}
          <div className="rounded-2xl border border-white/5 bg-card/30 p-8 flex flex-col items-center justify-center gap-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#09090B]" />
            <div className="relative w-40 h-40 flex items-center justify-center">
              <Logo variant="icon-only" iconSize={80} className="relative z-10 transition-transform group-hover:scale-105 duration-500" />
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <span className="font-bold text-white mb-1">Matriz Principal</span>
              <span className="text-xs text-white/50">Fundo Escuro (#09090B)<br/>1080x1080px</span>
            </div>
          </div>
          
          {/* Fundo Claro */}
          <div className="rounded-2xl border border-white/5 bg-card/30 p-8 flex flex-col items-center justify-center gap-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white" />
            <div className="relative w-40 h-40 flex items-center justify-center">
              <Logo variant="icon-only" theme="monochrome-black" iconSize={80} className="relative z-10 transition-transform group-hover:scale-105 duration-500" />
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <span className="font-bold text-black mb-1">Matriz Secundária</span>
              <span className="text-xs text-black/50">Fundo Claro (#FFFFFF)<br/>1080x1080px</span>
            </div>
          </div>
        </div>
      </div>

      {/* BLOCO 2: SAFE ZONES E CORTES */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Crop className="text-primary" size={24} />
          <h3 className="text-2xl font-bold">Safe Zones & Crop Circular</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Quase todas as plataformas aplicam uma máscara circular sobre o arquivo de upload. Mantenha uma <strong>margem interna de pelo menos 25%</strong> para evitar que o símbolo seja cortado.
        </p>

        <div className="rounded-3xl border border-white/5 bg-card/30 p-8 md:p-16 flex flex-col md:flex-row items-center justify-center gap-12">
          
          {/* Diagrama de Safe Zone */}
          <div className="relative w-64 h-64 border-2 border-white/20 bg-[#09090B] flex items-center justify-center group shrink-0">
            {/* Máscara Circular Hover */}
            <div className="absolute inset-0 border-[3px] border-dashed border-amber-500/50 rounded-full scale-95 opacity-50 transition-all duration-700 group-hover:bg-amber-500/10 group-hover:opacity-100" />
            {/* Grid Helper */}
            <div className="absolute w-full h-[1px] bg-white/5" />
            <div className="absolute h-full w-[1px] bg-white/5" />
            {/* Logo */}
            <Logo variant="icon-only" iconSize={96} className="relative z-10" />
            {/* Guidelines */}
            <div className="absolute top-2 left-2 text-[10px] font-mono text-white/40">1080x1080px Canvas</div>
            <div className="absolute bottom-6 w-full text-center text-[10px] font-mono text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Corte Circular (Safe Zone)</div>
          </div>

          <div className="space-y-4 max-w-sm">
            <h4 className="font-bold text-foreground">Regra Proporcional</h4>
            <p className="text-sm text-muted-foreground">O tamanho do ícone deve ocupar <strong>50% da altura total</strong> do canvas.</p>
            <ul className="space-y-3 mt-4">
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">1</span>
                Se o canvas tem 1080px...
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">2</span>
                O ícone deve ter aproximadamente 540px de altura...
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">3</span>
                Totalmente centralizado nos eixos X e Y.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* BLOCO 3: MOCKUPS EM AMBIENTE REAL */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <MonitorSmartphone className="text-primary" size={24} />
          <h3 className="text-2xl font-bold">Previews de Contexto</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Simulação de legibilidade e contraste nos principais pontos de contato com o usuário.
        </p>

        <div className="grid gap-6 sm:grid-cols-3">
          {/* IG Profile */}
          <div className="rounded-2xl bg-card border border-white/5 p-6 flex flex-col items-center text-center gap-4">
            <div className="text-xs text-muted-foreground font-mono w-full text-left mb-2 border-b border-white/5 pb-2">Instagram Perfil</div>
            <div className="w-24 h-24 rounded-full border border-white/10 bg-[#09090B] flex items-center justify-center p-2 shadow-lg ring-2 ring-background ring-offset-2 ring-offset-primary/20">
              <Logo variant="icon-only" iconSize={48} />
            </div>
            <div>
              <div className="font-bold text-sm">funilcomercial</div>
              <div className="text-xs text-muted-foreground mt-1">CRM para times B2B</div>
            </div>
          </div>

          {/* WA Chat */}
          <div className="rounded-2xl bg-card border border-white/5 p-6 flex flex-col items-center text-center gap-4">
            <div className="text-xs text-muted-foreground font-mono w-full text-left mb-2 border-b border-white/5 pb-2">WhatsApp Business</div>
            <div className="w-full flex items-center gap-3 bg-[#121214] border border-white/5 p-3 rounded-xl mt-4">
              <div className="w-12 h-12 rounded-full bg-[#09090B] shrink-0 flex items-center justify-center">
                <Logo variant="icon-only" iconSize={24} />
              </div>
              <div className="flex flex-col text-left flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm truncate text-white">Funil Comercial</span>
                  <span className="text-[10px] text-muted-foreground">10:42</span>
                </div>
                <span className="text-xs text-muted-foreground truncate">Aqui está o seu relatório...</span>
              </div>
            </div>
          </div>

          {/* Micro Notification */}
          <div className="rounded-2xl bg-card border border-white/5 p-6 flex flex-col items-center text-center gap-4">
            <div className="text-xs text-muted-foreground font-mono w-full text-left mb-2 border-b border-white/5 pb-2">Notificações</div>
            <div className="w-full bg-[#121214]/50 border border-white/5 rounded-xl p-3 shadow-2xl mt-4 flex items-start gap-3 relative overflow-hidden backdrop-blur-sm">
               <div className="w-8 h-8 rounded-full bg-[#09090B] shrink-0 flex items-center justify-center ring-1 ring-white/10">
                 <Logo variant="icon-only" iconSize={16} />
               </div>
               <div className="text-left">
                 <div className="font-semibold text-xs text-white">Novo Lead</div>
                 <div className="text-[10px] text-white/60">Uma empresa acabou de...</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* BLOCO 4: DIRETRIZES PARA IA */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Bot className="text-primary" size={24} />
          <h3 className="text-2xl font-bold">Diretrizes para Ferramentas de IA</h3>
        </div>
        
        <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          
          <div className="flex gap-4 items-start mb-6">
            <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-bold text-amber-500 mb-2">O Avatar é um Ativo Fixo (Imutável)</h4>
              <p className="text-sm text-amber-500/80 leading-relaxed">
                Quando for utilizar ferramentas de IA Generativa (Midjourney, DALL-E, Firefly) para criar assets de marketing, avatares temáticos ou composições comemorativas, <strong>o símbolo deve ser protegido contra as "alucinações" da rede neural.</strong>
              </p>
            </div>
          </div>

          <div className="bg-[#09090B] border border-white/10 rounded-xl p-6 relative group">
            <div className="absolute top-0 right-0 p-4">
              <button 
                onClick={handleCopyPrompt}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/80 transition-colors rounded-md px-3 py-1.5 text-xs font-semibold backdrop-blur-md border border-white/10"
              >
                {copiedPrompt ? <Check size={14} className="text-green-400"/> : <Copy size={14} />}
                {copiedPrompt ? 'Copiado!' : 'Copiar Prompt de Restrição'}
              </button>
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">System Prompt Fragment</div>
            <p className="text-sm text-foreground/90 font-mono leading-relaxed max-w-2xl mt-4">
              "{aiPrompt}"
            </p>
          </div>
          
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground list-disc list-inside">
             <li>A IA deve trabalhar <strong>apenas em camadas de background</strong> (trás do ícone).</li>
             <li>Nunca permita que a IA adicione texturas realistas de metal, vidro ou madeira <strong>no próprio vetor do funil</strong>.</li>
             <li>Sempre aplique o vetor oficial (`.svg` transparente) por cima da imagem gerada por IA na pós-produção.</li>
          </ul>
        </div>
      </div>

      {/* BLOCO 5: DO'S AND DON'TS (USOS INCORRETOS) */}
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <X className="text-red-500" size={24} />
          <h3 className="text-2xl font-bold">Hall of Shame (Usos Proibidos)</h3>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-3">
          {/* Logo Completa (Fica minúscula) */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 flex flex-col gap-4 relative">
             <div className="w-full aspect-square rounded-full border border-red-500/30 flex items-center justify-center bg-[#09090B] overflow-hidden">
                <Logo variant="full-horizontal" iconSize={20} />
             </div>
             <div>
                <h4 className="font-bold text-red-400 text-sm flex items-center gap-2"><X size={14}/> Ilegível</h4>
                <p className="text-xs text-muted-foreground mt-1">Usar a logo com texto faz com que ela fique impossível de ler em celulares.</p>
             </div>
          </div>

          {/* Símbolo Sem Margem */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 flex flex-col gap-4 relative">
             <div className="w-full aspect-square rounded-full border border-red-500/30 flex items-center justify-center bg-[#09090B] overflow-hidden">
                <Logo variant="icon-only" iconSize={200} className="scale-150" />
             </div>
             <div>
                <h4 className="font-bold text-red-400 text-sm flex items-center gap-2"><X size={14}/> Sem Respiro</h4>
                <p className="text-xs text-muted-foreground mt-1">Ícone esmagado nas bordas. O corte circular mutilou as pontas do funil.</p>
             </div>
          </div>

          {/* Baixo Contraste (Cores Inválidas) */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 flex flex-col gap-4 relative">
             <div className="w-full aspect-square rounded-full border border-red-500/30 flex items-center justify-center bg-[#F59E0B]">
                <Logo variant="icon-only" theme="default" iconSize={64} />
             </div>
             <div>
                <h4 className="font-bold text-red-400 text-sm flex items-center gap-2"><X size={14}/> Baixo Contraste</h4>
                <p className="text-xs text-muted-foreground mt-1">Mostarda sobre Mostarda (Tom sobre tom). Desrespeita a regra de acessibilidade visual.</p>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
