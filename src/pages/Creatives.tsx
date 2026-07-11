import React, { useState, useRef, useEffect } from "react";
import * as htmlToImage from "html-to-image";
import { Download, LayoutTemplate, Type, Wand2, RefreshCw, Share2, Target, PenTool, Lightbulb, ChevronRight, ArrowLeft, Sparkles, Copy, Check, Camera, BrainCircuit, Hash, X, Plus, ListChecks } from "lucide-react";
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
  { id: "t1", name: "Posicionamento / Dor", format: "4:5" },
  { id: "t4", name: "Lista / 4 Camadas", format: "4:5" },
  { id: "t12", name: "Prova Social", format: "4:5" },
];

// Objetivo = intenção da peça, realinhado à Linha Editorial (Brandbook 04).
// Os ids são mantidos (usados pelo body das Edge Functions de IA); só a cópia
// migrou do posicionamento antigo (B2B/SaaS) para "estrutura de vendas".
const OBJECTIVES = [
  { id: "educar", name: "Educar", icon: Lightbulb, desc: "Explicar uma camada do método: Presença, Aquisição, Conversão ou Escala." },
  { id: "vender", name: "Converter", icon: Target, desc: "Levar ao diagnóstico no WhatsApp a partir de uma dor concreta." },
  { id: "posicionar", name: "Autoridade", icon: PenTool, desc: "Bastidor real e a própria estrutura em ação — sem teatro." },
];

// Pilares da Linha Editorial (Brandbook 04 → 4.1). O pilar é a âncora estratégica
// de cada peça; carrega a etapa do funil e o CTA sugerido.
const PILARS = [
  { name: "Diagnóstico da Dor", etapa: "Atração", cta: "Peça um diagnóstico gratuito no WhatsApp." },
  { name: "Método das 4 Camadas", etapa: "Educação", cta: "Descubra qual camada está travando as vendas." },
  { name: "Bastidores & Autoridade", etapa: "Conexão", cta: "Veja como aplicar essa estrutura no seu negócio." },
  { name: "Prova Social por Segmento", etapa: "Conversão", cta: "Solicite uma análise do seu segmento." },
];

// Checklist de aprovação (Brandbook 04 → 4.2) — consulta rápida antes de publicar.
const CHECKLIST = [
  "Fala de uma dor real ou de uma camada do método?",
  "Texto direto, sem jargão e sem enrolação?",
  "Tem um CTA claro (diagnóstico, WhatsApp ou próximo passo)?",
  "Reforça estrutura de vendas, não marketing genérico?",
  "Conversa com negócio local e profissional liberal?",
];

// Barra compacta de uma etapa já concluída no fluxo manual — clicável para editar.
function StepSummary({ index, label, value, onEdit }: { index: number; label: string; value: string; onEdit: () => void }) {
  return (
    <button
      onClick={onEdit}
      className="w-full group flex items-center justify-between gap-4 rounded-xl border border-foreground/10 bg-card px-5 py-4 text-left transition-colors hover:border-primary/40"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-7 h-7 shrink-0 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <Check size={15} />
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0">Passo {index} · {label}</span>
        <span className="font-semibold text-foreground truncate">{value}</span>
      </div>
      <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors shrink-0">Alterar</span>
    </button>
  );
}

export default function CreativesPage() {
  // Wizard State (Progressive Disclosure)
  // path   → escolha do caminho: Estrategista IA ou manual
  // manual → construção guiada (Objetivo → Pilar → Ideia), revelada por etapas
  // loading→ IA escrevendo a copy
  // studio → editor + canvas
  const [step, setStep] = useState<"path" | "manual" | "loading" | "studio">("path");
  // Sub-etapa do fluxo manual: 1 = Objetivo · 2 = Pilar · 3 = Ideia/gerar.
  const [manualStage, setManualStage] = useState<1 | 2 | 3>(1);
  const [objective, setObjective] = useState("educar");
  const [pilar, setPilar] = useState(PILARS[0].name);
  const [idea, setIdea] = useState("");
  
  // Editor State
  const [activeTab, setActiveTab] = useState<"content" | "design" | "preview">("content");
  const [template, setTemplate] = useState("t1");
  const [format, setFormat] = useState(FORMATS[0]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  // Creative Content State
  const [headline, setHeadline] = useState("SEU CONCORRENTE\\nNÃO É MELHOR.\\nELE SÓ TEM ESTRUTURA.");
  const [subheadline, setSubheadline] = useState("Presença, aquisição, conversão e escala funcionando juntas — do Google ao WhatsApp.");
  const [highlight, setHighlight] = useState("ESTRUTURA");
  const [tags, setTags] = useState("ESTRUTURA DE VENDAS");
  const [caption, setCaption] = useState("Você é bom no que faz. Mas o cliente precisa te encontrar, confiar e comprar — e isso é estrutura, não sorte. Presença no Google, anúncios que trazem gente e WhatsApp organizado, funcionando juntos. Quer um diagnóstico gratuito da estrutura de vendas do seu negócio? Chama no WhatsApp.");
  const [hashtags, setHashtags] = useState<string[]>(["estruturadevendas", "negociolocal", "funilcomercial", "googlemeunegocio"]);
  
  // UI State
  const [isExporting, setIsExporting] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [newHashtag, setNewHashtag] = useState("");
  
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
          console.error("Erro ao buscar recomendação (A Função Edge pode não estar online):", error);
          
          // MOCK DE FRONTEND (Para visualização do usuário enquanto o erro 403 da Supabase impede o deploy do backend)
          if (isMounted) {
            setRecommendation({
              last_post: { preview: "Erro 404: CRM não é bagunça! Entenda como...", time_ago: "Recentemente" },
              recommendation: {
                objective: "Vender", format: "Feed 4:5", pilar: "CRM",
                reason: "[SIMULAÇÃO VISUAL] Como seu último post foi educativo, agora é hora de fazer uma oferta direta usando fundo escuro.",
                theme: "Oferta de implantação de CRM B2B"
              }
            });
            setRecState("ready"); // Força o estado de ready para mostrar o card
          }
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

  // Geração central. Aceita overrides para evitar ler estado "stale" quando a
  // chamada acontece no mesmo tick de um setState (caso do "Aceitar Recomendação").
  const runGeneration = async (opts?: { idea?: string; objective?: string; pilar?: string; formatId?: string }) => {
    const ideaText = opts?.idea ?? idea;
    if (!ideaText.trim()) return;

    const body = {
      objective: opts?.objective ?? objective,
      pilar: opts?.pilar ?? pilar,
      format: opts?.formatId ?? format.id,
      idea: ideaText,
    };

    setStep("loading");

    try {
      const { data, error } = await supabase.functions.invoke('ai-generate-post', { body });

      if (error || !data) throw new Error(error?.message || "Erro na geração");

      // Update states with AI response
      if (data.headline) setHeadline(data.headline);
      if (data.subheadline) setSubheadline(data.subheadline);
      if (data.highlight_word) setHighlight(data.highlight_word);
      if (data.footer_tags) setTags(data.footer_tags);
      if (data.caption) setCaption(data.caption);
      if (data.hashtags) setHashtags(data.hashtags);
      if (data.recommended_template_id) setTemplate(data.recommended_template_id);

      setStep("studio");
    } catch (error) {
      console.error(error);
      alert("Falha ao conectar com o serviço de IA. Preenchendo com exemplos de fallback.");
      setTimeout(() => setStep("studio"), 1000);
    }
  };

  const generateWithAI = () => runGeneration();

  const acceptRecommendation = () => {
    if (!recommendation) return;
    const rec = recommendation.recommendation;

    // Resolve os valores da recomendação para ids/nomes internos.
    const mappedObjective = OBJECTIVES.find(o => o.name.toLowerCase() === rec.objective?.toLowerCase());
    const objectiveId = mappedObjective ? mappedObjective.id : "educar";
    const pilarExists = PILARS.find(p => p.name.toLowerCase() === rec.pilar?.toLowerCase());
    const pilarName = pilarExists ? pilarExists.name : PILARS[0].name;
    const ideaText = rec.theme || "";

    // Reflete a escolha na UI (caso o usuário volte para o modo manual).
    setObjective(objectiveId);
    setPilar(pilarName);
    setManualStage(3);
    if (rec.format === "Feed 4:5") setFormat(FORMATS[0]);
    setIdea(ideaText);

    // Vai direto para a geração — sem passar pelo fluxo manual.
    runGeneration({ objective: objectiveId, pilar: pilarName, idea: ideaText });
  };

  // Entra no fluxo manual sempre do zero (revela etapa por etapa).
  const startManualFlow = () => {
    setManualStage(1);
    setStep("manual");
  };

  const selectObjective = (id: string) => {
    setObjective(id);
    setManualStage(prev => (prev < 2 ? 2 : prev));
  };

  const selectPilar = (name: string) => {
    setPilar(name);
    setManualStage(prev => (prev < 3 ? 3 : prev));
  };

  const regenerateCaption = async () => {
    if (!idea.trim()) return;
    setIsRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-generate-post', {
        body: { objective, pilar, format: format.id, idea }
      });
      if (error || !data) throw new Error(error?.message || "Erro na geração");
      if (data.caption) setCaption(data.caption);
      if (data.hashtags) setHashtags(data.hashtags);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const addHashtag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newHashtag.trim()) {
      e.preventDefault();
      const cleanTag = newHashtag.trim().replace(/^#/, '');
      if (hashtags.length < 5 && !hashtags.includes(cleanTag)) {
        setHashtags([...hashtags, cleanTag]);
      }
      setNewHashtag("");
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(t => t !== tagToRemove));
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
    const fullText = `${caption}\n\n${hashtags.map(h => '#' + h).join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ----------------------------------------------------
  // Render Steps
  // ----------------------------------------------------
  
  if (step === "path") {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6 fc-fade-in">
        <h1 className="text-3xl font-black mb-2 tracking-tight">Vamos criar um post</h1>
        <p className="text-muted-foreground mb-10 text-lg">Comece pela recomendação do estrategista de IA ou monte a peça manualmente, no seu ritmo.</p>

        {/* ESTRATEGISTA IA — em destaque (Etapa 1: O Caminho) */}
        <div>
          {recState === "loading" && (
            <div className="bg-card border border-foreground/5 rounded-2xl p-8 flex items-center justify-center gap-4 animate-pulse">
              <BrainCircuit className="text-primary animate-pulse" size={24} />
              <p className="text-muted-foreground font-medium">Analisando o grid do seu Instagram e montando estratégia de continuidade...</p>
            </div>
          )}
          
          {recState === "unauthorized" && (
            <div className="bg-card border border-foreground/5 rounded-2xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-foreground/5 rounded-full flex items-center justify-center text-muted-foreground">
                  <Camera size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">Instagram não conectado</h3>
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
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    Estrategista de Social Media <Sparkles size={16} className="text-primary" />
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Baseado no seu último post: <span className="italic text-foreground/70">"{recommendation.last_post?.preview}"</span>
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 relative z-10">
                <div className="bg-foreground/10 rounded-xl p-5 border border-foreground/5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2">Recomendação Estratégica</span>
                  <p className="text-foreground font-medium mb-3">"{recommendation.recommendation?.reason}"</p>
                  
                  <div className="space-y-2 mt-4 text-sm">
                    <div className="flex items-center gap-2"><Target size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Objetivo sugerido:</span> <strong className="text-foreground">{recommendation.recommendation?.objective}</strong></div>
                    <div className="flex items-center gap-2"><LayoutTemplate size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Formato sugerido:</span> <strong className="text-foreground">{recommendation.recommendation?.format}</strong></div>
                    <div className="flex items-center gap-2"><Type size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Pilar sugerido:</span> <strong className="text-foreground">{recommendation.recommendation?.pilar}</strong></div>
                  </div>
                </div>
                
                <div className="flex flex-col justify-end">
                  <button
                    onClick={acceptRecommendation}
                    className="w-full bg-primary text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-transform active:scale-95 shadow-lg"
                  >
                    Aceitar e continuar <Wand2 size={18} />
                  </button>
                  <p className="text-xs text-center text-muted-foreground mt-3">Aproveita a recomendação e abre o editor com tudo pré-preenchido</p>
                </div>
              </div>
            </div>
          )}

          {recState === "error" && (
            <div className="bg-card border border-foreground/5 rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-foreground/5 rounded-full flex items-center justify-center text-muted-foreground shrink-0">
                <BrainCircuit size={20} />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Estrategista indisponível no momento</h3>
                <p className="text-sm text-muted-foreground">Não foi possível carregar a recomendação. Você pode criar a postagem manualmente abaixo.</p>
              </div>
            </div>
          )}
        </div>

        {/* Divisor "OU" */}
        <div className="flex items-center gap-4 my-8">
          <div className="h-px flex-1 bg-foreground/10" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">ou</span>
          <div className="h-px flex-1 bg-foreground/10" />
        </div>

        {/* Caminho manual */}
        <button
          onClick={startManualFlow}
          className="w-full group bg-card border border-foreground/10 hover:border-primary/40 rounded-2xl p-6 flex items-center justify-between transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-foreground/5 group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shrink-0">
              <PenTool size={22} />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">Criar postagem manualmente</h3>
              <p className="text-sm text-muted-foreground">Escolha o objetivo, o pilar editorial e escreva a sua ideia — passo a passo.</p>
            </div>
          </div>
          <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" size={22} />
        </button>
      </div>
    );
  }

  if (step === "manual") {
    const selectedPilar = PILARS.find(p => p.name === pilar);
    const selectedObjective = OBJECTIVES.find(o => o.id === objective);

    return (
      <div className="max-w-3xl mx-auto py-12 px-6 fc-fade-in">
        <button onClick={() => setStep("path")} className="text-muted-foreground hover:text-foreground flex items-center gap-2 mb-8 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Voltar para a estratégia
        </button>

        <h1 className="text-3xl font-black mb-2 tracking-tight">Montar a postagem</h1>
        <p className="text-muted-foreground mb-10 text-lg">Um passo de cada vez. Cada escolha revela a próxima.</p>

        <div className="flex flex-col gap-4">

          {/* PASSO 1 — Objetivo */}
          {manualStage === 1 ? (
            <section className="fc-reveal">
              <h2 className="text-xl font-bold mb-1">Passo 1: Qual o objetivo do seu post?</h2>
              <p className="text-sm text-muted-foreground mb-5">Define a intenção da peça.</p>
              <div className="grid md:grid-cols-3 gap-4">
                {OBJECTIVES.map((obj) => {
                  const Icon = obj.icon;
                  const isActive = objective === obj.id;
                  return (
                    <button
                      key={obj.id}
                      onClick={() => selectObjective(obj.id)}
                      className={`flex flex-col items-start p-6 rounded-2xl border-2 transition-all text-left active:scale-[0.98] ${isActive ? 'border-primary bg-primary/10' : 'border-foreground/10 hover:border-primary/50 bg-card hover:bg-card/80'}`}
                    >
                      <div className={`p-3 rounded-xl mb-4 ${isActive ? 'bg-primary text-black' : 'bg-foreground/5 text-muted-foreground'}`}>
                        <Icon size={24} />
                      </div>
                      <h3 className="font-bold text-lg text-foreground mb-2">{obj.name}</h3>
                      <p className="text-sm text-muted-foreground">{obj.desc}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : (
            <StepSummary
              index={1}
              label="Objetivo"
              value={selectedObjective?.name ?? ""}
              onEdit={() => setManualStage(1)}
            />
          )}

          {/* PASSO 2 — Pilar editorial */}
          {manualStage >= 2 && (
            manualStage === 2 ? (
              <section className="fc-reveal">
                <h2 className="text-xl font-bold mb-1">Passo 2: Escolha o pilar editorial</h2>
                <p className="text-sm text-muted-foreground mb-5">A âncora estratégica da peça (Brandbook · 04. Conteúdo &amp; Ativação → 4.1).</p>
                <div className="flex flex-wrap gap-3">
                  {PILARS.map(p => {
                    const isActive = pilar === p.name;
                    return (
                      <button
                        key={p.name}
                        onClick={() => selectPilar(p.name)}
                        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all border flex items-center gap-2 active:scale-95 ${isActive ? 'bg-primary text-black border-primary' : 'bg-transparent border-foreground/20 text-muted-foreground hover:border-primary/50 hover:text-foreground'}`}
                      >
                        {p.name}
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-black/60' : 'text-primary/70'}`}>{p.etapa}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : (
              <StepSummary
                index={2}
                label="Pilar editorial"
                value={pilar}
                onEdit={() => setManualStage(2)}
              />
            )
          )}

          {/* PASSO 3 — CTA + Ideia + Gerar */}
          {manualStage >= 3 && (
            <section className="fc-reveal flex flex-col gap-5">
              {selectedPilar && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground flex items-start gap-2">
                  <Sparkles size={15} className="text-primary shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">CTA sugerido:</strong> {selectedPilar.cta}</span>
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold mb-1">Passo 3: Sobre o que é o post?</h2>
                <p className="text-sm text-muted-foreground mb-4">Um resumo em uma ou duas frases. É o ponto de partida do criativo — você monta e ajusta tudo no editor a seguir.</p>
                <div className="bg-card border border-foreground/10 rounded-2xl p-2 shadow-xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                  <textarea
                    value={idea}
                    onChange={e => setIdea(e.target.value)}
                    placeholder="Ex: 3 sinais de que o WhatsApp do negócio está perdendo venda por falta de organização..."
                    className="w-full bg-transparent border-none outline-none p-4 text-lg min-h-[140px] resize-none placeholder:text-muted-foreground/50 relative z-10"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  disabled={!idea.trim()}
                  onClick={generateWithAI}
                  className="bg-primary text-black px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:bg-primary/90"
                >
                  <Wand2 size={20} />
                  Gerar Criativo
                </button>
              </div>
            </section>
          )}

        </div>
      </div>
    );
  }

  if (step === "loading") {
    return (
      <div className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-6 fc-fade-in text-center">
        <div className="w-24 h-24 mb-8 relative flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          <Sparkles className="text-primary animate-pulse" size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Preparando seu criativo...</h2>
        <p className="text-muted-foreground">Montando o editor com base no seu resumo. Em seguida você ajusta a copy e a arte.</p>
      </div>
    );
  }

  // STEP 4: O ESTÚDIO
  const isCaptionOverLimit = caption.length > 350;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100dvh-5rem)] lg:h-[calc(100vh-6rem)] overflow-hidden fade-in bg-[#0a0a0c]">
      
      {/* LEFT COLUMN: EDITOR */}
      <div className={`w-full lg:w-[450px] xl:w-[500px] bg-card border-r border-foreground/5 flex flex-col ${activeTab !== "preview" ? "flex" : "hidden lg:flex"}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-foreground/5 flex justify-between items-center bg-foreground/5 shrink-0">
          <div>
            <button onClick={() => { setManualStage(3); setStep("manual"); }} className="text-xs text-muted-foreground hover:text-foreground mb-1 flex items-center gap-1"><ArrowLeft size={12}/> Voltar ao roteiro</button>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">Estúdio de Criação <Sparkles size={16} className="text-primary"/></h1>
          </div>
          <button onClick={generateWithAI} className="p-3 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors text-primary" title="Gerar Variação Completa com IA">
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Mobile Tabs */}
        <div className="flex lg:hidden border-b border-foreground/5 bg-foreground/10 shrink-0">
          <button onClick={() => setActiveTab("content")} className={`flex-1 py-4 text-sm font-semibold ${activeTab === 'content' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>Conteúdo</button>
          <button onClick={() => setActiveTab("design")} className={`flex-1 py-4 text-sm font-semibold ${activeTab === 'design' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>Design</button>
          <button onClick={() => setActiveTab("preview")} className={`flex-1 py-4 text-sm font-semibold ${activeTab === 'preview' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>Preview</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar relative">
          
          {(activeTab === "content" || window.innerWidth >= 1024) && (
            <section className="flex flex-col gap-6">
              
              {/* NOVO PAINEL DE COPY ESTRATÉGICA */}
              <div className="bg-gradient-to-b from-primary/10 to-transparent border border-primary/20 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
                {isRegenerating && (
                  <div className="absolute inset-0 bg-foreground/10 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl">
                    <RefreshCw className="text-primary animate-spin" size={24} />
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <h3 className="text-[13px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Sparkles size={14}/> Painel de Copy
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={regenerateCaption} disabled={isRegenerating} className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors bg-foreground/5 px-2 py-1 rounded">
                      <RefreshCw size={12} className={isRegenerating ? "animate-spin" : ""} /> Regenerar IA
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider flex justify-between">
                    <span>Texto da Publicação</span>
                    <span className={`transition-colors ${isCaptionOverLimit ? 'text-red-400 font-bold' : 'text-muted-foreground'}`}>
                      {caption.length} / 350
                    </span>
                  </label>
                  <textarea 
                    value={caption} 
                    onChange={(e) => setCaption(e.target.value)} 
                    rows={4} 
                    className={`w-full bg-foreground/10 border rounded-xl p-3 text-sm focus:border-primary/50 outline-none transition-colors resize-y text-foreground/90 ${isCaptionOverLimit ? 'border-red-500/50 focus:border-red-500' : 'border-foreground/10'}`} 
                  />
                  {isCaptionOverLimit && (
                    <p className="text-[10px] text-red-400 flex items-center gap-1 mt-1">
                      Limites do Instagram atingidos. A copy está longa demais e perderá retenção.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider flex justify-between">
                    <span>Hashtags Estratégicas</span>
                    <span className="text-muted-foreground">{hashtags.length} / 5</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 bg-foreground/10 text-foreground/90 text-xs px-2.5 py-1.5 rounded-full border border-foreground/10 group">
                        <Hash size={10} className="text-primary opacity-70" />
                        {tag}
                        <button onClick={() => removeHashtag(tag)} className="ml-1 opacity-50 hover:opacity-100 hover:text-red-400 transition-colors">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {hashtags.length < 5 && (
                      <div className="flex items-center bg-foreground/10 border border-foreground/10 rounded-full px-2">
                        <Plus size={12} className="text-muted-foreground" />
                        <input 
                          type="text" 
                          value={newHashtag}
                          onChange={(e) => setNewHashtag(e.target.value)}
                          onKeyDown={addHashtag}
                          placeholder="Adicionar..." 
                          className="bg-transparent border-none outline-none text-xs w-20 px-1 py-1.5 text-foreground/90 placeholder:text-muted-foreground/50"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={copyCaption}
                  className="w-full mt-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />} 
                  {copied ? 'Legenda + Hashtags Copiadas!' : 'Copiar Tudo'}
                </button>
              </div>

              <h3 className="text-[13px] font-black uppercase tracking-widest text-muted-foreground mt-4 pb-2 border-b border-foreground/10">Textos da Arte</h3>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground/80">Headline</label>
                <textarea value={headline} onChange={(e) => setHeadline(e.target.value)} rows={3} className="w-full bg-foreground/10 border border-foreground/10 rounded-xl p-3 text-sm focus:border-primary/50 outline-none transition-colors resize-none text-foreground font-medium" />
                <p className="text-[10px] text-muted-foreground text-right mt-1">Use \n para quebrar linha</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground/80">Palavra em Destaque (Cor Primária)</label>
                <input type="text" value={highlight} onChange={(e) => setHighlight(e.target.value)} className="w-full bg-foreground/10 border border-foreground/10 rounded-xl p-3 text-sm focus:border-primary/50 outline-none transition-colors text-foreground font-medium" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground/80">Subheadline / Texto de Apoio</label>
                <textarea value={subheadline} onChange={(e) => setSubheadline(e.target.value)} rows={2} className="w-full bg-foreground/10 border border-foreground/10 rounded-xl p-3 text-sm focus:border-primary/50 outline-none transition-colors resize-none text-foreground/90" />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground/80">Rodapé / Tags</label>
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full bg-foreground/10 border border-foreground/10 rounded-xl p-3 text-sm focus:border-primary/50 outline-none transition-colors text-foreground/90" />
              </div>

              {/* Checklist editorial (Brandbook 04 · 4.2) — consulta antes de publicar */}
              <div className="rounded-2xl border border-foreground/10 bg-foreground/5 p-5 flex flex-col gap-3 mt-2">
                <h3 className="text-[13px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <ListChecks size={14} /> Antes de publicar
                </h3>
                <ul className="flex flex-col gap-2">
                  {CHECKLIST.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check size={14} className="text-primary shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-red-400 flex items-start gap-1.5 border-t border-foreground/10 pt-3">
                  <X size={13} className="shrink-0 mt-0.5" /> Nunca publique com dado inventado, promessa exagerada ou prova social não validada.
                </p>
              </div>
            </section>
          )}

          {(activeTab === "design" || window.innerWidth >= 1024) && (
            <section className="flex flex-col gap-6 pt-6 border-t border-foreground/10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <LayoutTemplate size={16}/> Design Base
              </h3>
              
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-foreground/80">Formato</label>
                <div className="flex gap-2 p-1 bg-foreground/10 rounded-xl border border-foreground/5">
                  {FORMATS.map(f => (
                    <button key={f.id} onClick={() => setFormat(f)} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${format.id === f.id ? 'bg-foreground/10 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-foreground/80">Template</label>
                <select value={template} onChange={(e) => setTemplate(e.target.value)} className="w-full bg-foreground/10 border border-foreground/10 rounded-xl p-3 text-sm text-foreground focus:border-primary/50 outline-none transition-colors font-medium">
                  {TEMPLATES.filter(t => t.format === format.id).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-foreground/80">Tema</label>
                <div className="flex gap-2">
                  <button onClick={() => setTheme("dark")} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-colors border ${theme === 'dark' ? 'bg-[#09090B] border-primary text-primary' : 'bg-foreground/5 border-transparent text-muted-foreground hover:bg-foreground/10 hover:text-foreground'}`}>Dark (Padrão)</button>
                  <button onClick={() => setTheme("light")} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-colors border ${theme === 'light' ? 'bg-[#FAF9F6] border-primary text-primary' : 'bg-foreground/5 border-transparent text-muted-foreground hover:bg-foreground/10 hover:text-foreground'}`}>Light</button>
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
           <button onClick={() => setActiveTab("content")} className="px-4 py-2 bg-card rounded-lg text-sm font-semibold shadow-xl border border-foreground/10 flex items-center gap-2"><ArrowLeft size={16}/> Voltar</button>
        </div>

        <div className="absolute top-4 right-4 z-40 flex items-center gap-3">
          <button 
            onClick={handleExport} 
            disabled={isExporting}
            className="flex items-center gap-2 bg-card border border-foreground/10 hover:bg-foreground/10 hover:border-foreground/20 text-foreground px-5 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 shadow-xl"
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
        defaultCaption={`${caption}\n\n${hashtags.map(h => '#' + h).join(' ')}`}
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
