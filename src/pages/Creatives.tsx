import React, { useState, useRef } from "react";
import * as htmlToImage from "html-to-image";
import { Download, LayoutTemplate, Type, Image as ImageIcon, Wand2, RefreshCw } from "lucide-react";
import Logo from "../components/Logo";

// 1. Definition of Templates and Formats
const FORMATS = [
  { id: "4:5", name: "Feed 4:5", width: 1080, height: 1350 },
  { id: "1:1", name: "Feed 1:1", width: 1080, height: 1080 },
  { id: "9:16", name: "Stories/Reels", width: 1080, height: 1920 },
];

const TEMPLATES = [
  { id: "t1", name: "Posicionamento", format: "4:5" },
  { id: "t4", name: "Lista / Passo a Passo", format: "4:5" },
  { id: "t12", name: "Prova Social", format: "4:5" },
];

export default function CreativesPage() {
  const [activeTab, setActiveTab] = useState<"content" | "design" | "preview">("content");
  const [template, setTemplate] = useState("t1");
  const [format, setFormat] = useState(FORMATS[0]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  // Editables
  const [headline, setHeadline] = useState("NÃO SOMOS\\nUMA AGÊNCIA\\nDE TRÁFEGO.");
  const [subheadline, setSubheadline] = useState("Estruturamos a operação do lead à visita.");
  const [highlight, setHighlight] = useState("TRÁFEGO.");
  const [tags, setTags] = useState("AQUISIÇÃO + CRM + IA");
  
  const [isExporting, setIsExporting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(canvasRef.current, {
        quality: 1.0,
        pixelRatio: 1, // Already at 1080px
      });
      const link = document.createElement("a");
      link.download = `criativo-funil-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Erro ao exportar", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100dvh-5rem)] lg:h-[calc(100vh-6rem)] overflow-hidden">
      
      {/* LEFT COLUMN: EDITOR */}
      <div className={`w-full lg:w-[400px] xl:w-[450px] bg-card border-r border-white/5 flex flex-col ${activeTab !== "preview" ? "flex" : "hidden lg:flex"}`}>
        
        {/* Mobile Tabs */}
        <div className="flex lg:hidden border-b border-white/5">
          <button onClick={() => setActiveTab("content")} className={`flex-1 py-4 text-sm font-semibold ${activeTab === 'content' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>Conteúdo</button>
          <button onClick={() => setActiveTab("design")} className={`flex-1 py-4 text-sm font-semibold ${activeTab === 'design' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>Design</button>
          <button onClick={() => setActiveTab("preview")} className={`flex-1 py-4 text-sm font-semibold ${activeTab === 'preview' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>Preview</button>
        </div>

        <div className="p-6 border-b border-white/5 hidden lg:block">
          <h1 className="text-xl font-bold tracking-tight">Estúdio de Criação</h1>
          <p className="text-sm text-muted-foreground mt-1">Gere artes no padrão da marca.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          
          {(activeTab === "design" || window.innerWidth >= 1024) && (
            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><LayoutTemplate size={16}/> Design Base</h3>
              
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold">Formato</label>
                <div className="flex gap-2">
                  {FORMATS.map(f => (
                    <button key={f.id} onClick={() => setFormat(f)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${format.id === f.id ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}>
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <label className="text-sm font-semibold">Template</label>
                <select value={template} onChange={(e) => setTemplate(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-primary/50 outline-none transition-colors">
                  {TEMPLATES.filter(t => t.format === format.id).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <label className="text-sm font-semibold">Tema</label>
                <div className="flex gap-2">
                  <button onClick={() => setTheme("dark")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors border ${theme === 'dark' ? 'bg-[#09090B] border-primary text-primary' : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10'}`}>Dark (Padrão)</button>
                  <button onClick={() => setTheme("light")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors border ${theme === 'light' ? 'bg-[#FAF9F6] border-primary text-primary' : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10'}`}>Light</button>
                </div>
              </div>
            </section>
          )}

          {(activeTab === "content" || window.innerWidth >= 1024) && (
            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Type size={16}/> Conteúdo</h3>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Headline</label>
                  <button className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-semibold"><Wand2 size={12}/> Melhorar com IA</button>
                </div>
                <textarea value={headline} onChange={(e) => setHeadline(e.target.value)} rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-primary/50 outline-none transition-colors resize-none" placeholder="Texto principal..." />
                <p className="text-[10px] text-muted-foreground text-right">{headline.length}/60 caracteres</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Palavra em Destaque (Cor Primária)</label>
                <input type="text" value={highlight} onChange={(e) => setHighlight(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-primary/50 outline-none transition-colors" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Subheadline</label>
                <textarea value={subheadline} onChange={(e) => setSubheadline(e.target.value)} rows={2} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-primary/50 outline-none transition-colors resize-none" />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Rodapé / Tags</label>
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-primary/50 outline-none transition-colors" />
              </div>
            </section>
          )}

        </div>
      </div>

      {/* RIGHT COLUMN: PREVIEW CANVAS */}
      <div className={`flex-1 bg-black/40 relative overflow-hidden flex-col items-center justify-center p-4 lg:p-8 ${activeTab === "preview" ? "flex" : "hidden lg:flex"}`}>
        
        {/* Mobile back to edit */}
        <div className="lg:hidden absolute top-4 left-4 z-50">
           <button onClick={() => setActiveTab("content")} className="px-4 py-2 bg-card rounded-lg text-sm font-semibold shadow-xl border border-white/10">Voltar para Edição</button>
        </div>

        <div className="absolute top-4 right-4 z-50">
          <button 
            onClick={handleExport} 
            disabled={isExporting}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-xl transition-transform active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
            {isExporting ? "Gerando..." : "Exportar Arte"}
          </button>
        </div>

        {/* 
          The actual scaling wrapper for the preview. 
          We use CSS transform scale to fit it in the viewport, 
          but the actual DOM element has 1080x1350px.
        */}
        <div className="w-full h-full flex items-center justify-center overflow-auto custom-scrollbar relative">
           
           <div className="scale-[0.3] sm:scale-[0.4] md:scale-[0.5] lg:scale-[0.5] xl:scale-[0.55] 2xl:scale-[0.65] origin-center transition-transform">
              
              {/* THE REAL CANVAS AT 1080px */}
              <div 
                ref={canvasRef} 
                className={`relative overflow-hidden ${theme === 'dark' ? 'bg-[#09090B]' : 'bg-[#FAF9F6]'}`} 
                style={{ width: format.width, height: format.height }}
              >
                {template === 't1' && <Template1 theme={theme} headline={headline} subheadline={subheadline} highlight={highlight} tags={tags} />}
                {template === 't4' && <Template4 theme={theme} headline={headline} subheadline={subheadline} />}
                {template === 't12' && <Template12 theme={theme} subheadline={subheadline} headline={headline} />}
              </div>

           </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// TEMPLATES (Renderizados na resolução real)
// ==========================================

const Dots = () => (
  <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
);

function Template1({ theme, headline, highlight, subheadline, tags }: any) {
  const isDark = theme === 'dark';
  
  // Replaces highlighted word with primary color span
  const formattedHeadline = headline.split('\\n').map((line: string, i: number) => {
    if (highlight && line.includes(highlight)) {
      const parts = line.split(highlight);
      return (
        <span key={i} className="block">
          {parts[0]}<span className="text-primary">{highlight}</span>{parts[1]}
        </span>
      );
    }
    return <span key={i} className="block">{line}</span>;
  });

  return (
    <div className={`w-full h-full flex flex-col p-24 relative ${isDark ? 'text-white' : 'text-[#121214]'}`}>
      <Dots />
      <div className={`absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent blur-[100px]`}></div>
      
      <div className="flex justify-center mb-16 z-10">
        <Logo iconSize={96} variant="icon-only" theme={isDark ? 'default' : 'monochrome-black'} />
      </div>
      
      <div className="mt-auto mb-32 z-10 px-8">
        <h1 className="text-[110px] font-black leading-[0.95] tracking-tight uppercase">
          {formattedHeadline}
        </h1>
        <p className={`text-[36px] mt-12 max-w-[80%] leading-relaxed font-medium ${isDark ? 'text-white/60' : 'text-black/60'}`}>
          {subheadline}
        </p>
      </div>
      
      <div className="absolute bottom-16 left-0 w-full flex justify-center gap-6 text-[24px] text-primary font-bold tracking-[0.2em] z-10">
        {tags.split('+').map((tag: string, i: number, arr: any) => (
          <React.Fragment key={i}>
            <span>{tag.trim()}</span>
            {i < arr.length - 1 && <span className="opacity-50">+</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function Template4({ theme, headline, subheadline }: any) {
  const isDark = theme === 'dark';
  const lines = subheadline.split('\\n').filter((l: string) => l.trim().length > 0);

  return (
    <div className={`w-full h-full flex flex-col p-24 relative ${isDark ? 'bg-[#09090B] text-white' : 'bg-[#FAF9F6] text-[#121214]'}`}>
      <Dots />
      <div className="flex justify-between items-center mb-24 z-10">
        <Logo iconSize={64} theme={isDark ? 'default' : 'monochrome-black'} />
        <span className="text-[32px] font-bold opacity-40 uppercase tracking-widest">PASSO A PASSO</span>
      </div>
      <h1 className="text-[96px] font-black leading-[0.95] mb-24 uppercase z-10">
        {headline.split('\\n').map((l: string, i: number) => <span key={i} className="block">{l}</span>)}
      </h1>
      
      <div className="space-y-12 flex-1 z-10">
        {lines.map((line: string, i: number) => {
          const [title, desc] = line.split('|');
          return (
            <div key={i} className={`flex gap-12 items-start border-t pt-12 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
              <span className="text-[64px] font-black text-primary leading-none">{i + 1}.</span>
              <div className="flex-1 mt-2">
                <div className="text-[48px] font-bold mb-4 leading-none">{title?.trim()}</div>
                {desc && <div className={`text-[32px] leading-tight font-medium ${isDark ? 'text-white/60' : 'text-black/60'}`}>{desc.trim()}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Template12({ theme, subheadline, headline }: any) {
  const isDark = theme === 'dark';
  
  return (
    <div className={`w-full h-full flex items-center justify-center p-16 relative ${isDark ? 'bg-[#09090B]' : 'bg-[#FAF9F6]'}`}>
      <Dots />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
      
      <div className={`w-full max-w-[800px] backdrop-blur-xl border rounded-[48px] p-24 shadow-2xl relative z-10 ${isDark ? 'bg-white/5 border-white/20' : 'bg-black/5 border-black/10'}`}>
        <div className="flex text-primary mb-12 gap-3">
          {[1,2,3,4,5].map(i => (
            <svg key={i} width="48" height="48" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          ))}
        </div>
        <p className={`text-[56px] leading-[1.3] font-medium mb-16 ${isDark ? 'text-white/90' : 'text-[#121214]/90'}`}>
          "{subheadline}"
        </p>
        <div className="flex items-center gap-8">
          <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center text-[48px] font-black text-primary">
            {headline.charAt(0)}
          </div>
          <div>
            <div className={`text-[40px] font-bold ${isDark ? 'text-white' : 'text-[#121214]'}`}>{headline.split('|')[0]?.trim()}</div>
            <div className={`text-[32px] ${isDark ? 'text-white/50' : 'text-black/50'}`}>{headline.split('|')[1]?.trim() || 'Cliente'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
