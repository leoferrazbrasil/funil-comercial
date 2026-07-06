import { useState } from 'react';
import { Filter, UserCircle, MessageSquare, ArrowRight, CheckCircle2, ChevronRight, BarChart3, Star, Bell, Image as ImageIcon, Box, AlertTriangle, X, Zap } from 'lucide-react';
import Logo from './Logo';

type Format = '4:5' | '1:1' | '9:16';
type Objective = 'all' | 'posicionamento' | 'educacao' | 'vendas' | 'carrossel' | 'stories';

interface TemplateDef {
  id: string;
  name: string;
  objective: Objective;
  format: Format;
  theme: 'light' | 'dark';
  desc: string;
}

const TEMPLATES: TemplateDef[] = [
  { id: 't1', name: 'Posicionamento (Hero)', objective: 'posicionamento', format: '4:5', theme: 'dark', desc: 'Forte presença tipográfica. Oposto de agência.' },
  { id: 't2', name: 'Educativo (Timeline)', objective: 'educacao', format: '4:5', theme: 'light', desc: 'Fluxograma explicativo.' },
  { id: 't3', name: 'Autoridade (Quote)', objective: 'posicionamento', format: '4:5', theme: 'dark', desc: 'Citação do gestor/CEO.' },
  { id: 't4', name: 'Lista / Passo a Passo', objective: 'educacao', format: '4:5', theme: 'light', desc: 'Dicas numeradas.' },
  { id: 't5', name: 'Dado e Estatística', objective: 'educacao', format: '4:5', theme: 'dark', desc: 'Número colossal centralizado.' },
  { id: 't6', name: 'Comparativo (VS)', objective: 'educacao', format: '4:5', theme: 'dark', desc: 'Split screen Caos vs Funil.' },
  { id: 't7', name: 'Problema x Solução', objective: 'posicionamento', format: '4:5', theme: 'light', desc: 'Apresenta a dor e resolve embaixo.' },
  { id: 't8', name: 'Funcionalidade', objective: 'vendas', format: '4:5', theme: 'dark', desc: 'Foco na UI.' },
  { id: 't9', name: 'Benefício Direto', objective: 'vendas', format: '4:5', theme: 'light', desc: 'Texto curto com ícone de destaque.' },
  { id: 't10', name: 'Demonstração (Kanban)', objective: 'vendas', format: '4:5', theme: 'dark', desc: 'UI do Kanban em perspectiva.' },
  { id: 't11', name: 'Captura (WhatsApp)', objective: 'vendas', format: '4:5', theme: 'light', desc: 'Simulação de chat/leads.' },
  { id: 't12', name: 'Prova Social', objective: 'posicionamento', format: '4:5', theme: 'dark', desc: 'Depoimento em Glassmorphism.' },
  { id: 't13', name: 'Lançamento', objective: 'vendas', format: '4:5', theme: 'dark', desc: 'Glow radial intenso.' },
  { id: 't14', name: 'Promocional', objective: 'vendas', format: '4:5', theme: 'light', desc: 'Foco em CTA e urgência.' },
  { id: 't15', name: 'Capa de Carrossel', objective: 'carrossel', format: '4:5', theme: 'dark', desc: 'Gancho visual forte.' },
  { id: 't16', name: 'Card Interno', objective: 'carrossel', format: '4:5', theme: 'light', desc: 'Conteúdo denso.' },
  { id: 't17', name: 'Último Card (CTA)', objective: 'carrossel', format: '4:5', theme: 'dark', desc: 'CTA para o produto.' },
  { id: 't18', name: 'Story Interativo', objective: 'stories', format: '9:16', theme: 'dark', desc: 'Espaço p/ sticker do Instagram.' },
  { id: 't19', name: 'Capa de Reels', objective: 'stories', format: '9:16', theme: 'dark', desc: 'Safe zone restrita no centro.' },
  { id: 't20', name: 'Anúncio 1:1', objective: 'vendas', format: '1:1', theme: 'dark', desc: 'Quadrado puro para conversão.' }
];

export default function SocialTemplatesGallery() {
  const [filter, setFilter] = useState<Objective>('all');
  const [formatFilter, setFormatFilter] = useState<'all' | Format>('all');

  const filtered = TEMPLATES.filter(t => 
    (filter === 'all' || t.objective === filter) &&
    (formatFilter === 'all' || t.format === formatFilter)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/30 border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 border-r border-white/10 pr-4">
            <Filter size={16} className="text-muted-foreground" />
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Objetivo</span>
          </div>
          {(['all', 'posicionamento', 'educacao', 'vendas', 'carrossel', 'stories'] as Objective[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === f ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-muted-foreground hover:bg-white/10'
              }`}
            >
              {f === 'all' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(template => (
          <div key={template.id} className="flex flex-col group">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-background/50 aspect-square flex items-center justify-center p-4">
              <TemplateRenderer id={template.id} />
              
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                 <p className="text-xs text-white/70 mb-2">{template.desc}</p>
                 <div className="flex gap-2">
                   <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded uppercase font-bold">{template.format}</span>
                   <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold">{template.theme}</span>
                 </div>
              </div>
            </div>
            <div className="mt-3">
              <h4 className="font-bold text-sm">{template.name}</h4>
              <p className="text-xs text-muted-foreground capitalize">{template.objective}</p>
            </div>
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum template encontrado para os filtros selecionados.
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// RENDERIZADOR DE TEMPLATES CSS (Pro-Max)
// ---------------------------------------------------------

function TemplateRenderer({ id }: { id: string }) {
  // Configura as classes base do container de acordo com o formato
  const formatMap: Record<string, string> = {
    t18: 'aspect-[9/16] w-[120px]',
    t19: 'aspect-[9/16] w-[120px]',
    t20: 'aspect-square w-[160px]'
  };
  
  const containerClass = formatMap[id] || 'aspect-[4/5] w-[140px]'; // Padrão 4:5

  // DOTS Background Pattern Helper
  const Dots = () => (
    <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
  );

  return (
    <div className={`${containerClass} relative overflow-hidden rounded-md shadow-2xl transition-transform group-hover:scale-[1.02] bg-[#09090B] border border-white/5 select-none`}>
      
      {id === 't1' && (
        <div className="w-full h-full flex flex-col p-3 relative">
          <Dots />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent blur-xl"></div>
          <div className="flex justify-center mb-6 z-10"><Logo iconSize={12} variant="icon-only"/></div>
          <div className="mt-auto mb-10 z-10">
            <h1 className="text-[18px] font-black leading-[0.95] text-white">
              NÃO SOMOS<br/>UMA AGÊNCIA<br/>DE <span className="text-primary">TRÁFEGO.</span>
            </h1>
            <p className="text-[6px] text-white/60 mt-3 max-w-[80%] leading-relaxed">Estruturamos a operação do lead à visita.</p>
          </div>
          <div className="absolute bottom-3 left-0 w-full flex justify-center gap-1 text-[4px] text-primary font-bold tracking-widest z-10">
            <span>AQUISIÇÃO</span><span>+</span><span>CRM</span><span>+</span><span>IA</span>
          </div>
        </div>
      )}

      {id === 't2' && (
        <div className="w-full h-full flex flex-col p-3 relative bg-[#FAF9F6]">
          <Dots />
          <div className="flex justify-center mb-4 z-10"><Logo iconSize={12} variant="icon-only" theme="monochrome-black"/></div>
          <div className="z-10 relative flex-1 flex">
            {/* Esquerda: Texto */}
            <div className="w-[60%] flex flex-col justify-center">
              <h1 className="text-[16px] font-black leading-[0.95] text-[#121214]">
                ONDE SUA<br/>OPERAÇÃO<br/><span className="text-[#B48545]">PERDE</span><br/>OPORTUNIDADES?
              </h1>
              <div className="border-l border-[#B48545] pl-1.5 mt-3">
                 <p className="text-[5px] text-[#121214]/70 leading-relaxed font-medium">O gargalo pode estar entre o lead e o atendimento.</p>
              </div>
            </div>
            {/* Direita: Timeline */}
            <div className="w-[40%] relative flex flex-col justify-between items-center py-2">
               <div className="absolute left-1/2 top-4 bottom-4 w-[0.5px] bg-black/20 border-l border-dashed border-black/30"></div>
               <div className="w-4 h-4 rounded-full bg-white border border-black/10 flex items-center justify-center relative z-10"><UserCircle size={8} className="text-black/60"/></div>
               <div className="w-4 h-4 rounded-full bg-white border border-black/10 flex items-center justify-center relative z-10"><MessageSquare size={8} className="text-black/60"/></div>
               <div className="w-5 h-5 rounded-full bg-white border border-[#B48545] flex items-center justify-center relative z-10 shadow-[0_0_10px_rgba(180,133,69,0.3)]">
                  <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex items-center">
                     <div className="w-10 h-[0.5px] bg-[#B48545]"></div>
                     <span className="text-[3px] text-[#B48545] whitespace-nowrap ml-1 font-bold">GARGALO</span>
                  </div>
                  <AlertTriangle size={8} className="text-[#B48545]"/>
               </div>
               <div className="w-4 h-4 rounded-full bg-white border border-black/10 flex items-center justify-center relative z-10"><CheckCircle2 size={8} className="text-black/60"/></div>
            </div>
          </div>
        </div>
      )}

      {id === 't3' && (
        <div className="w-full h-full flex flex-col p-3 relative justify-center">
          <div className="absolute top-2 left-2 opacity-20"><Logo variant="icon-only" iconSize={24}/></div>
          <div className="flex-1 flex flex-col justify-center">
            <span className="text-3xl text-primary font-serif italic opacity-50 mb-[-10px]">"</span>
            <h1 className="text-[12px] font-bold leading-snug text-white z-10">
              Vendas não é sobre tentar convencer. É sobre ter o processo certo para a pessoa certa no momento exato.
            </h1>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-4 h-4 rounded-full bg-white/20"></div>
              <div>
                 <div className="text-[5px] font-bold text-white">CEO & Founder</div>
                 <div className="text-[4px] text-white/50">Funil Comercial</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {id === 't4' && (
        <div className="w-full h-full flex flex-col p-3 bg-white relative">
          <div className="flex justify-between items-center mb-4">
             <Logo iconSize={10} theme="monochrome-black"/>
             <span className="text-[5px] font-bold text-black/40">PASSO A PASSO</span>
          </div>
          <h1 className="text-[12px] font-black text-black leading-none mb-3">3 PASSOS PARA<br/>ORGANIZAR<br/>SEUS LEADS.</h1>
          <div className="space-y-2 flex-1">
             {[1,2,3].map(i => (
               <div key={i} className="flex gap-2 items-start border-t border-black/10 pt-1.5">
                  <span className="text-[8px] font-black text-primary">{i}.</span>
                  <div>
                    <div className="text-[6px] font-bold text-black mb-0.5">Centralize a entrada</div>
                    <div className="text-[4px] text-black/60 leading-tight">Conecte Meta Ads e WhatsApp num só lugar.</div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {id === 't5' && (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-primary/20 blur-2xl rounded-full"></div>
          <h2 className="text-[32px] font-black text-white leading-none tracking-tighter">78<span className="text-primary">%</span></h2>
          <p className="text-[6px] text-center text-white/70 mt-2 font-medium px-2">das vendas são perdidas por falta de follow-up organizado.</p>
          <div className="mt-4 w-12 h-6 border-b border-l border-white/20 relative flex items-end justify-between pb-0.5 px-0.5">
             <div className="w-1.5 h-1/3 bg-white/20 rounded-t-sm"></div>
             <div className="w-1.5 h-2/3 bg-white/40 rounded-t-sm"></div>
             <div className="w-1.5 h-full bg-primary rounded-t-sm shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
          </div>
        </div>
      )}

      {id === 't6' && (
        <div className="w-full h-full flex flex-col">
          <div className="h-1/2 w-full bg-red-950/30 border-b border-white/10 flex flex-col items-center justify-center p-2 relative overflow-hidden">
             <div className="absolute top-1 left-1 text-[5px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-1 rounded">Sem CRM</div>
             <X size={16} className="text-red-500/20 absolute right-2 top-2"/>
             <div className="space-y-1 w-full max-w-[80%] mt-2">
               <div className="h-2 bg-white/5 rounded w-full border border-red-500/20"></div>
               <div className="h-2 bg-white/5 rounded w-3/4 border border-red-500/20"></div>
               <div className="h-2 bg-white/5 rounded w-full border border-red-500/20"></div>
             </div>
          </div>
          <div className="h-1/2 w-full bg-green-950/20 flex flex-col items-center justify-center p-2 relative overflow-hidden">
             <div className="absolute top-1 left-1 text-[5px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-1 rounded">Com Funil Comercial</div>
             <div className="w-full max-w-[80%] flex gap-1 mt-2">
               <div className="flex-1 bg-white/10 rounded h-10 border border-white/5 p-0.5 space-y-0.5">
                 <div className="h-1 bg-white/20 rounded w-full"></div>
                 <div className="h-2 bg-primary/80 rounded w-full"></div>
               </div>
               <div className="flex-1 bg-white/10 rounded h-10 border border-white/5 p-0.5 space-y-0.5">
                 <div className="h-1 bg-white/20 rounded w-full"></div>
                 <div className="h-2 bg-white/20 rounded w-full"></div>
                 <div className="h-2 bg-white/20 rounded w-full"></div>
               </div>
             </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-[#09090B] border border-white/10 rounded-full flex items-center justify-center shadow-xl font-black text-[6px] text-white">VS</div>
        </div>
      )}

      {id === 't7' && (
        <div className="w-full h-full flex flex-col bg-white">
          <div className="p-3 bg-black/5 flex-1">
             <div className="text-[5px] text-black/50 font-bold mb-1">O PROBLEMA</div>
             <h1 className="text-[10px] font-black leading-tight text-black">Leads chegando de todos os lados e se perdendo no WhatsApp.</h1>
          </div>
          <div className="p-3 bg-primary flex-1 flex flex-col justify-end text-black">
             <div className="text-[5px] text-black/50 font-bold mb-1">A SOLUÇÃO</div>
             <h1 className="text-[10px] font-black leading-tight">Kanban integrado com Meta Ads e Inbox centralizada.</h1>
             <Logo iconSize={10} theme="monochrome-black" className="mt-2"/>
          </div>
        </div>
      )}

      {id === 't8' && (
        <div className="w-full h-full flex flex-col relative overflow-hidden p-3">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-xl rounded-full"></div>
          <h1 className="text-[12px] font-black text-white leading-tight mb-2">CRM<br/>ULTRARRÁPIDO.</h1>
          <div className="flex-1 w-full bg-[#121214] border border-white/10 rounded-lg shadow-2xl relative mt-2 overflow-hidden flex flex-col">
            <div className="h-2 border-b border-white/5 flex items-center px-1 gap-0.5">
              <div className="w-0.5 h-0.5 rounded-full bg-white/20"></div>
              <div className="w-0.5 h-0.5 rounded-full bg-white/20"></div>
              <div className="w-0.5 h-0.5 rounded-full bg-white/20"></div>
            </div>
            <div className="p-1.5 flex gap-1 h-full">
              <div className="w-1/3 bg-white/5 rounded"></div>
              <div className="flex-1 bg-white/5 rounded flex flex-col gap-0.5 p-0.5">
                 <div className="h-2 bg-primary/80 rounded w-full"></div>
                 <div className="h-2 bg-white/10 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {id === 't9' && (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-[#FAF9F6] relative text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
            <Zap size={20} />
          </div>
          <h1 className="text-[14px] font-black text-[#121214] leading-tight mb-2">AUTOMAÇÃO<br/>COMERCIAL</h1>
          <p className="text-[6px] text-black/60 font-medium">Economize 3h diárias da sua equipe com triagem inteligente.</p>
        </div>
      )}

      {id === 't10' && (
        <div className="w-full h-full relative overflow-hidden bg-[#09090B]">
          <div className="absolute top-4 left-4 z-20"><Logo variant="icon-only" iconSize={12}/></div>
          <div className="absolute -bottom-10 -right-10 w-[200%] h-[150%] transform -rotate-12 translate-x-10 translate-y-10 scale-[0.8] opacity-80 pointer-events-none">
            {/* Fake 3D Kanban */}
            <div className="flex gap-2">
              <div className="w-12 h-32 bg-[#121214] rounded-lg border border-white/10 p-1 space-y-1">
                <div className="h-1 bg-white/20 w-1/2 mb-2"></div>
                <div className="h-4 bg-white/5 rounded border border-white/10"></div>
                <div className="h-4 bg-white/5 rounded border border-white/10"></div>
              </div>
              <div className="w-12 h-32 bg-[#121214] rounded-lg border border-white/10 p-1 space-y-1">
                <div className="h-1 bg-primary w-1/2 mb-2"></div>
                <div className="h-4 bg-primary/20 rounded border border-primary/50"></div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 z-20">
            <h2 className="text-[10px] font-black text-white">VISÃO<br/>COMPLETA</h2>
          </div>
        </div>
      )}

      {id === 't11' && (
        <div className="w-full h-full p-3 bg-white flex flex-col relative overflow-hidden">
           <h1 className="text-[12px] font-black leading-none mb-3 text-black">PARE DE<br/>PERDER<br/>LEADS.</h1>
           <div className="flex-1 bg-green-50 rounded-t-xl border border-green-100 flex flex-col p-2 gap-1.5 shadow-lg relative mt-auto mx-1 translate-y-2">
             <div className="self-end bg-green-500 text-white text-[4px] px-1.5 py-0.5 rounded-l-md rounded-tr-md max-w-[80%]">
               Olá, vi o anúncio e quero saber mais.
             </div>
             <div className="self-start bg-white border border-black/10 text-black text-[4px] px-1.5 py-0.5 rounded-r-md rounded-tl-md max-w-[80%]">
               Claro! Já registrei seu contato no nosso CRM.
             </div>
           </div>
        </div>
      )}

      {id === 't12' && (
        <div className="w-full h-full flex items-center justify-center p-3 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
          <div className="w-full bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-2xl relative z-10">
             <div className="flex text-primary mb-2 gap-0.5">
               <Star size={6} fill="currentColor" />
               <Star size={6} fill="currentColor" />
               <Star size={6} fill="currentColor" />
               <Star size={6} fill="currentColor" />
               <Star size={6} fill="currentColor" />
             </div>
             <p className="text-[7px] text-white/90 leading-relaxed font-medium mb-3">
               "Nossa taxa de conversão dobrou no primeiro mês usando o Funil Comercial. Não perdemos mais nenhum contato no Whats."
             </p>
             <div className="flex items-center gap-1.5">
               <div className="w-4 h-4 bg-white/20 rounded-full"></div>
               <div>
                 <div className="text-[5px] font-bold text-white">João Silva</div>
                 <div className="text-[4px] text-white/50">Diretor Comercial</div>
               </div>
             </div>
          </div>
        </div>
      )}

      {id === 't13' && (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 relative text-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-primary/40 rounded-full blur-2xl animate-pulse"></div>
          </div>
          <Logo iconSize={12} className="relative z-10 mb-2"/>
          <h2 className="text-[6px] text-primary tracking-[0.2em] font-bold mb-1 relative z-10 uppercase">Nova Funcionalidade</h2>
          <h1 className="text-[16px] font-black text-white leading-none relative z-10">INBOX<br/>UNIFICADA</h1>
          <div className="mt-4 px-3 py-1 bg-white text-black text-[5px] font-bold rounded-full relative z-10">
            JÁ DISPONÍVEL
          </div>
        </div>
      )}

      {id === 't14' && (
        <div className="w-full h-full p-3 flex flex-col bg-primary text-black">
          <div className="flex justify-between items-center mb-6">
             <Logo iconSize={10} theme="monochrome-black" />
             <span className="text-[5px] font-bold bg-black text-white px-1.5 py-0.5 rounded">OFERTA LIMITADA</span>
          </div>
          <h1 className="text-[18px] font-black leading-[0.9]">PLANO<br/>PRO COM<br/>50% OFF</h1>
          <p className="text-[6px] font-medium mt-2 leading-tight">Organize sua operação hoje mesmo. Oferta válida até sexta-feira.</p>
          <div className="mt-auto bg-black text-white text-[7px] font-bold text-center py-1.5 rounded-md flex items-center justify-center gap-1">
            ASSINE AGORA <ArrowRight size={6}/>
          </div>
        </div>
      )}

      {id === 't15' && (
        <div className="w-full h-full flex flex-col p-3 relative">
          <Logo iconSize={10} className="mb-auto"/>
          <h1 className="text-[14px] font-black text-white leading-tight mb-2">POR QUE SEUS<br/><span className="text-primary">LEADS</span> FOGEM?</h1>
          <p className="text-[6px] text-white/50 max-w-[80%]">Arraste e descubra os 3 erros do seu time.</p>
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-primary animate-pulse">
            <span className="text-[5px] font-bold">DESLIZE</span>
            <ArrowRight size={8} />
          </div>
        </div>
      )}

      {id === 't16' && (
        <div className="w-full h-full p-3 bg-white text-black relative flex flex-col">
          <div className="flex justify-between items-center mb-4">
             <div className="w-4 h-4 bg-black text-white rounded-full flex items-center justify-center text-[7px] font-black">2</div>
             <Logo iconSize={8} theme="monochrome-black" />
          </div>
          <h2 className="text-[12px] font-black leading-tight mb-2">ERRO 1:<br/>FALTA DE<br/>RESPOSTA RÁPIDA</h2>
          <p className="text-[6px] text-black/70 leading-relaxed max-w-[90%]">
            O lead B2B não espera. Se você demorar mais de 10 minutos para o primeiro contato, ele já procurou o seu concorrente.
          </p>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-black/10">
            <div className="h-full bg-primary w-2/5"></div>
          </div>
        </div>
      )}

      {id === 't17' && (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 relative text-center">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
             <Logo variant="icon-only" iconSize={20} />
          </div>
          <h1 className="text-[12px] font-black text-white leading-tight mb-2">PARE DE PERDER<br/>DINHEIRO.</h1>
          <p className="text-[5px] text-white/50 px-4 mb-4">Teste o Funil Comercial e organize seu processo.</p>
          <div className="bg-primary text-black text-[6px] font-bold px-3 py-1.5 rounded-md flex items-center gap-1 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            CRIAR CONTA GRÁTIS
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-black/10">
            <div className="h-full bg-primary w-full"></div>
          </div>
        </div>
      )}

      {id === 't18' && (
        <div className="w-full h-full p-2 relative flex flex-col bg-[#121214]">
          {/* Safe zones indicators */}
          <div className="absolute top-0 left-0 w-full h-8 bg-red-500/20 border-b border-red-500/50 flex items-center justify-center text-[4px] text-red-200">Não usar (UI App)</div>
          <div className="absolute bottom-0 left-0 w-full h-8 bg-red-500/20 border-t border-red-500/50 flex items-center justify-center text-[4px] text-red-200">Não usar (UI App)</div>
          
          <div className="flex-1 flex flex-col justify-center items-center text-center z-10 px-2 mt-4">
            <h1 className="text-[8px] font-black text-white mb-2 leading-tight">SUA EQUIPE BATEU<br/>A META ESTE MÊS?</h1>
            
            {/* Fake Poll Sticker */}
            <div className="w-full max-w-[80%] bg-white rounded-lg p-2 shadow-xl border border-black/10 mt-4">
               <div className="text-[5px] font-bold text-black mb-1.5">Responda sinceramente:</div>
               <div className="bg-green-500/10 text-green-700 text-[6px] font-bold p-1 rounded mb-1 text-center border border-green-500/20">Sim, passamos!</div>
               <div className="bg-red-500/10 text-red-700 text-[6px] font-bold p-1 rounded text-center border border-red-500/20">Não, faltou lead.</div>
            </div>
          </div>
        </div>
      )}

      {id === 't19' && (
        <div className="w-full h-full relative bg-[#09090B] flex items-center justify-center">
          {/* Fundo simulando um video/imagem escurecida */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=400&auto=format&fit=crop')] bg-cover bg-center opacity-30 grayscale mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-[#09090B]"></div>
          
          <div className="w-[80%] aspect-square border-2 border-dashed border-primary/50 relative flex flex-col items-center justify-center text-center p-2 z-10">
            <div className="absolute -top-3 text-[4px] text-primary font-mono uppercase bg-[#09090B] px-1">Feed Safe Zone</div>
            <h1 className="text-[10px] font-black text-white leading-tight shadow-black drop-shadow-xl">COMO ORGANIZAR<br/>SEUS LEADS EM<br/><span className="text-primary">3 MINUTOS</span>.</h1>
          </div>
          
          <div className="absolute bottom-4 right-1 flex flex-col gap-2 opacity-50">
             <div className="w-3 h-3 bg-white/20 rounded-full"></div>
             <div className="w-3 h-3 bg-white/20 rounded-full"></div>
             <div className="w-3 h-3 bg-white/20 rounded-full"></div>
          </div>
        </div>
      )}

      {id === 't20' && (
        <div className="w-full h-full bg-[#121214] flex">
           {/* Formato quadrado agressivo para conversão */}
           <div className="w-1/2 p-2 flex flex-col justify-center border-r border-white/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 blur-xl rounded-full"></div>
             <Logo iconSize={8} className="mb-2"/>
             <h1 className="text-[10px] font-black text-white leading-[1.1] relative z-10">O CRM QUE<br/>A SUA<br/>EQUIPE<br/>VAI USAR.</h1>
           </div>
           <div className="w-1/2 p-2 flex flex-col justify-center items-center text-center bg-[#09090B]">
             <div className="text-[6px] text-white/50 mb-1 line-through">De R$ 97/mês</div>
             <div className="text-[14px] font-black text-primary mb-2">R$ 47</div>
             <div className="w-[80%] bg-white text-black text-[5px] font-bold py-1 rounded">ASSINAR AGORA</div>
           </div>
        </div>
      )}
    </div>
  );
}
