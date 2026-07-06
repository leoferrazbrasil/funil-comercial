import React, { useState, useRef, useEffect } from "react";
import * as htmlToImage from "html-to-image";
import { Download, LayoutTemplate, Type, Wand2, RefreshCw, Share2, Target, PenTool, Lightbulb, ChevronRight, ArrowLeft, Sparkles, Copy, Check, Camera, BrainCircuit } from "lucide-react";
import Logo from "../components/Logo";
import PublishModal from "../components/PublishModal";
import { supabase } from "../lib/supabase";

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

const OBJECTIVES = [
  { id: "educar", name: "Educar", icon: Lightbulb, desc: "Ensinar algo novo ou resolver uma dúvida" },
  { id: "vender", name: "Vender", icon: Target, desc: "Oferta direta, desconto ou foco em conversão" },
  { id: "posicionar", name: "Posicionar", icon: PenTool, desc: "Mostrar autoridade e opinião forte" },
];

const PILARS = ["CRM", "WhatsApp", "Gestão Comercial", "Funil de Vendas", "Automação", "IA", "Produtividade"];

export default function CreativesPage() {
  // Wizard State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [objective, setObjective] = useState("educar");
  const [pilar, setPilar] = useState("CRM");
  const [idea, setIdea] = useState("");
  
  // Editor State
  const [activeTab, setActiveTab] = useState<"content" | "design" | "preview">("content");
  const [template, setTemplate] = useState("t1");
  const [format, setFormat] = useState(FORMATS[0]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  // Creative Content State
  const [headline, setHeadline] = useState("COMO ORGANIZAR\\nSEUS LEADS EM\\nUM SÓ LUGAR.");
  const [subheadline, setSubheadline] = useState("Aprenda a estruturar o CRM da sua empresa do zero.");
  const [highlight, setHighlight] = useState("LEADS");
  const [tags, setTags] = useState("CRM + PRODUTIVIDADE");
  const [caption, setCaption] = useState("Ter controle sobre os seus leads é o primeiro passo para aumentar as vendas. Sem um CRM estruturado, dinheiro fica na mesa. Salve este post para aplicar na sua operação!");
  
  // UI State
  const [isExporting, setIsExporting] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Recommendation State
  const [recState, setRecState] = useState<"loading" | "ready" | "error" | "unauthorized">("loading");
  const [recommendation, setRecommendation] = useState<any>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchRecommendation() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (isMounted) setRecState("unauthorized");
          return;
        }

        const { data, error } = await supabase.functions.invoke('ai-recommend-post');
        
        if (!isMounted) return;
        
        if (error || !data) {
          console.error("Erro ao buscar recomendação:", error);
          setRecState("error");
          return;
        }

        if (data.error === 'Unauthorized' || data.error?.includes('Unauthorized')) {
          setRecState("unauthorized");
        } else if (data.recommendation) {
          setRecommendation(data);
          setRecState("ready");
        } else {
          setRecState("error");
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setRecState("error");
      }
    }
    
    fetchRecommendation();
    return () => { isMounted = false; }
  }, []);

  const acceptRecommendation = () => {
    if (!recommendation) return;
    const rec = recommendation.recommendation;
    
    // Auto-select Objective
    const mappedObjective = OBJECTIVES.find(o => o.name.toLowerCase() === rec.objective?.toLowerCase());
    if (mappedObjective) setObjective(mappedObjective.id);
    else setObjective("educar");
    
    // Auto-select Pilar
    const pilarExists = PILARS.find(p => p.toLowerCase() === rec.pilar?.toLowerCase());
    if (pilarExists) setPilar(pilarExists);
    else setPilar(PILARS[0]);
    
    // Set Theme/Format if applicable (you can expand this logic)
    if (rec.format === "Feed 4:5") setFormat(FORMATS[0]);
    
    // Prefill the idea and go to Step 2
    setIdea(rec.theme || "");
    setStep(2);
  };

  const generateWithAI = async () => {
    if (!idea.trim()) return;
    setStep(3);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-generate-post', {
        body: { objective, pilar, format: format.id, idea }
      });
      
      if (error || !data) throw new Error(error?.message || "Erro na geração");
      
      // Update states with AI response
      if (data.headline) setHeadline(data.headline);
      if (data.subheadline) setSubheadline(data.subheadline);
      if (data.highlight_word) setHighlight(data.highlight_word);
      if (data.footer_tags) setTags(data.footer_tags);
      if (data.caption) setCaption(data.caption);
      if (data.recommended_template_id) setTemplate(data.recommended_template_id);
      
      setStep(4);
    } catch (error) {
      console.error(error);
      alert("Falha ao conectar com o serviço de IA. Preenchendo com exemplos de fallback.");
      // Fallback in case the edge function isn't ready
      setTimeout(() => setStep(4), 1000);
    }
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(canvasRef.current, { quality: 1.0, pixelRatio: 1 });
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

  const handleOpenPublishModal = async () => {
    if (!canvasRef.current) return;
    setIsPublishModalOpen(true);
    setPreviewImageUrl(null);
    try {
      const dataUrl = await htmlToImage.toJpeg(canvasRef.current, { quality: 0.9, pixelRatio: 1 });
      setPreviewImageUrl(dataUrl);
    } catch (err) {
      console.error("Erro ao gerar preview", err);
    }
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ----------------------------------------------------
  // Render Steps
  // ----------------------------------------------------
  
  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6 fade-in">
        <h1 className="text-3xl font-black mb-2 tracking-tight">Qual o objetivo do post?</h1>
        <p className="text-muted-foreground mb-8 text-lg">Selecione o direcionamento estratégico da sua próxima publicação.</p>
        
        {/* ESTRATEGISTA IA CARD */}
        <div className="mb-12">
          {recState === "loading" && (
            <div className="bg-card border border-white/5 rounded-2xl p-8 flex items-center justify-center gap-4 animate-pulse">
              <BrainCircuit className="text-primary animate-pulse" size={24} />
              <p className="text-muted-foreground font-medium">Analisando o grid do seu Instagram e montando estratégia de continuidade...</p>
            </div>
          )}
          
          {recState === "unauthorized" && (
            <div className="bg-card border border-white/5 rounded-2xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-muted-foreground">
                  <Camera size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Instagram não conectado</h3>
                  <p className="text-sm text-muted-foreground">Conecte sua conta para que a IA analise seu histórico e sugira o próximo post automaticamente.</p>
                </div>
              </div>
            </div>
          )}
          
          {recState === "ready" && recommendation && (
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="flex items-start gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 bg-primary text-black rounded-full flex items-center justify-center shrink-0">
                  <BrainCircuit size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Estrategista de Social Media <Sparkles size={16} className="text-primary" />
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Baseado no seu último post: <span className="italic text-white/70">"{recommendation.last_post?.preview}"</span>
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 relative z-10">
                <div className="bg-black/40 rounded-xl p-5 border border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2">Recomendação Estratégica</span>
                  <p className="text-white font-medium mb-3">"{recommendation.recommendation?.reason}"</p>
                  
                  <div className="space-y-2 mt-4 text-sm">
                    <div className="flex items-center gap-2"><Target size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Objetivo sugerido:</span> <strong className="text-white">{recommendation.recommendation?.objective}</strong></div>
                    <div className="flex items-center gap-2"><LayoutTemplate size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Formato sugerido:</span> <strong className="text-white">{recommendation.recommendation?.format}</strong></div>
                    <div className="flex items-center gap-2"><Type size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Pilar sugerido:</span> <strong className="text-white">{recommendation.recommendation?.pilar}</strong></div>
                  </div>
                </div>
                
                <div className="flex flex-col justify-end">
                  <button 
                    onClick={acceptRecommendation}
                    className="w-full bg-primary text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-transform active:scale-95 shadow-lg"
                  >
                    Aceitar Recomendação <ArrowLeft className="rotate-180" size={18} />
                  </button>
                  <p className="text-xs text-center text-muted-foreground mt-3">Ou escolha o objetivo manualmente abaixo</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {OBJECTIVES.map((obj) => {
            const Icon = obj.icon;
            const isActive = objective === obj.id;
            return (
              <button 
                key={obj.id} 
                onClick={() => setObjective(obj.id)}
                className={`flex flex-col items-start p-6 rounded-2xl border-2 transition-all text-left ${isActive ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20 bg-card hover:bg-card/80'}`}
              >
                <div className={`p-3 rounded-xl mb-4 ${isActive ? 'bg-primary text-black' : 'bg-white/5 text-muted-foreground'}`}>
                  <Icon size={24} />
                </div>
                <h3 className="font-bold text-lg text-white mb-2">{obj.name}</h3>
                <p className="text-sm text-muted-foreground">{obj.desc}</p>
              </button>
            )
          })}
        </div>
        
        <h2 className="text-xl font-bold mb-4">Escolha um pilar editorial:</h2>
        <div className="flex flex-wrap gap-3 mb-12">
          {PILARS.map(p => (
            <button 
              key={p} 
              onClick={() => setPilar(p)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${pilar === p ? 'bg-primary text-black border-primary' : 'bg-transparent border-white/20 text-muted-foreground hover:border-white/40 hover:text-white'}`}
            >
              {p}
            </button>
          ))}
        </div>
        
        <div className="flex justify-end pt-8 border-t border-white/10">
          <button onClick={() => setStep(2)} className="bg-white text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white/90 transition-transform active:scale-95">
            Continuar Manualmente <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6 fade-in">
        <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-white flex items-center gap-2 mb-8 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Voltar para estratégia
        </button>
        
        <h1 className="text-3xl font-black mb-2 tracking-tight">Qual a sua ideia?</h1>
        <p className="text-muted-foreground mb-8 text-lg">Escreva um resumo do que você quer falar. A nossa IA cuidará do resto.</p>
        
        <div className="bg-card border border-white/10 rounded-3xl p-2 mb-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
          <textarea 
            value={idea} 
            onChange={e => setIdea(e.target.value)}
            placeholder="Ex: Quero dar 3 dicas de como organizar leads pelo WhatsApp sem perder vendas..."
            className="w-full bg-transparent border-none outline-none p-6 text-xl min-h-[200px] resize-none placeholder:text-muted-foreground/50 relative z-10"
            autoFocus
          />
        </div>
        
        <div className="flex justify-end">
          <button 
            disabled={!idea.trim()}
            onClick={generateWithAI} 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale shadow-[0_0_40px_-10px_rgba(236,72,153,0.5)]"
          >
            <Sparkles size={20} />
            Gerar Post Mágico
          </button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-6 fade-in text-center">
        <div className="w-24 h-24 mb-8 relative flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          <Sparkles className="text-primary animate-pulse" size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Escrevendo a Copy...</h2>
        <p className="text-muted-foreground">O motor de inteligência artificial está selecionando o melhor template e validando o Brandbook.</p>
      </div>
    );
  }

  // STEP 4: O ESTÚDIO
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100dvh-5rem)] lg:h-[calc(100vh-6rem)] overflow-hidden fade-in bg-[#0a0a0c]">
      
      {/* LEFT COLUMN: EDITOR */}
      <div className={`w-full lg:w-[450px] xl:w-[500px] bg-card border-r border-white/5 flex flex-col ${activeTab !== "preview" ? "flex" : "hidden lg:flex"}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div>
            <button onClick={() => setStep(2)} className="text-xs text-muted-foreground hover:text-white mb-1 flex items-center gap-1"><ArrowLeft size={12}/> Nova Ideia</button>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">Estúdio de Criação <Sparkles size={16} className="text-primary"/></h1>
          </div>
          <button onClick={generateWithAI} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-primary" title="Gerar Variação com IA">
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Mobile Tabs */}
        <div className="flex lg:hidden border-b border-white/5 bg-black/40">
          <button onClick={() => setActiveTab("content")} className={`flex-1 py-4 text-sm font-semibold ${activeTab === 'content' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>Conteúdo</button>
          <button onClick={() => setActiveTab("design")} className={`flex-1 py-4 text-sm font-semibold ${activeTab === 'design' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>Design</button>
          <button onClick={() => setActiveTab("preview")} className={`flex-1 py-4 text-sm font-semibold ${activeTab === 'preview' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>Preview</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
          
          {(activeTab === "content" || window.innerWidth >= 1024) && (
            <section className="flex flex-col gap-6">
              
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <Type size={16}/> Legenda Sugerida
                  </h3>
                  <button onClick={copyCaption} className="text-xs font-semibold text-primary hover:text-white flex items-center gap-1 transition-colors">
                    {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <textarea 
                  value={caption} 
                  onChange={(e) => setCaption(e.target.value)} 
                  rows={4} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-primary/50 outline-none transition-colors resize-y text-white/90" 
                />
              </div>

              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-4">Textos da Arte</h3>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/80">Headline</label>
                <textarea value={headline} onChange={(e) => setHeadline(e.target.value)} rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-primary/50 outline-none transition-colors resize-none text-white font-medium" />
                <p className="text-[10px] text-muted-foreground text-right mt-1">Use \n para quebrar linha</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/80">Palavra em Destaque (Cor Primária)</label>
                <input type="text" value={highlight} onChange={(e) => setHighlight(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-primary/50 outline-none transition-colors text-white font-medium" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/80">Subheadline / Texto de Apoio</label>
                <textarea value={subheadline} onChange={(e) => setSubheadline(e.target.value)} rows={2} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-primary/50 outline-none transition-colors resize-none text-white/90" />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/80">Rodapé / Tags</label>
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-primary/50 outline-none transition-colors text-white/90" />
              </div>
            </section>
          )}

          {(activeTab === "design" || window.innerWidth >= 1024) && (
            <section className="flex flex-col gap-6 pt-6 border-t border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <LayoutTemplate size={16}/> Design Base
              </h3>
              
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-white/80">Formato</label>
                <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                  {FORMATS.map(f => (
                    <button key={f.id} onClick={() => setFormat(f)} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${format.id === f.id ? 'bg-white/10 text-white shadow-sm' : 'text-muted-foreground hover:text-white'}`}>
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-white/80">Template</label>
                <select value={template} onChange={(e) => setTemplate(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary/50 outline-none transition-colors font-medium">
                  {TEMPLATES.filter(t => t.format === format.id).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-white/80">Tema</label>
                <div className="flex gap-2">
                  <button onClick={() => setTheme("dark")} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-colors border ${theme === 'dark' ? 'bg-[#09090B] border-primary text-primary' : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10 hover:text-white'}`}>Dark (Padrão)</button>
                  <button onClick={() => setTheme("light")} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-colors border ${theme === 'light' ? 'bg-[#FAF9F6] border-primary text-primary' : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10 hover:text-white'}`}>Light</button>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>

      {/* RIGHT COLUMN: PREVIEW CANVAS */}
      <div className={`flex-1 relative overflow-hidden flex-col items-center justify-center p-4 lg:p-8 ${activeTab === "preview" ? "flex" : "hidden lg:flex"}`}>
        
        {/* Pattern Background for Editor Area */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '32px 32px' }}></div>
        
        {/* Mobile back to edit */}
        <div className="lg:hidden absolute top-4 left-4 z-50">
           <button onClick={() => setActiveTab("content")} className="px-4 py-2 bg-card rounded-lg text-sm font-semibold shadow-xl border border-white/10 flex items-center gap-2"><ArrowLeft size={16}/> Voltar</button>
        </div>

        <div className="absolute top-4 right-4 z-40 flex items-center gap-3">
          <button 
            onClick={handleExport} 
            disabled={isExporting}
            className="flex items-center gap-2 bg-card border border-white/10 hover:bg-white/10 hover:border-white/20 text-white px-5 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 shadow-xl"
          >
            {isExporting ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
            <span className="hidden md:inline">Baixar Alta Qualidade</span>
          </button>
          
          <button 
            onClick={handleOpenPublishModal} 
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black px-6 py-3 rounded-xl font-bold shadow-xl transition-all active:scale-95"
          >
            <Share2 size={18} />
            <span>Publicar</span>
          </button>
        </div>

        <div className="w-full h-full flex items-center justify-center overflow-auto custom-scrollbar relative">
           <div className="scale-[0.35] sm:scale-[0.4] md:scale-[0.5] lg:scale-[0.55] xl:scale-[0.6] 2xl:scale-[0.7] origin-center transition-transform drop-shadow-2xl">
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
      
      <PublishModal 
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        imageUrl={previewImageUrl}
        defaultCaption={caption}
        onPublish={async (cap) => { console.log('Publishing', cap); }}
      />
    </div>
  );
}

// ==========================================
// TEMPLATES (Renderizados na resolução real 1080px)
// ==========================================

const Dots = () => (
  <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
);

function Template1({ theme, headline, highlight, subheadline, tags }: any) {
  const isDark = theme === 'dark';
  
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
  const lines = (subheadline||'').split('\\n').filter((l: string) => l.trim().length > 0);

  return (
    <div className={`w-full h-full flex flex-col p-24 relative ${isDark ? 'bg-[#09090B] text-white' : 'bg-[#FAF9F6] text-[#121214]'}`}>
      <Dots />
      <div className="flex justify-between items-center mb-24 z-10">
        <Logo iconSize={64} theme={isDark ? 'default' : 'monochrome-black'} />
        <span className="text-[32px] font-bold opacity-40 uppercase tracking-widest">PASSO A PASSO</span>
      </div>
      <h1 className="text-[96px] font-black leading-[0.95] mb-24 uppercase z-10">
        {(headline||'').split('\\n').map((l: string, i: number) => <span key={i} className="block">{l}</span>)}
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
            {(headline||'C').charAt(0)}
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
