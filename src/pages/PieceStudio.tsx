import { useMemo, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { ArrowLeft, Download, Eye, EyeOff, ExternalLink, ShieldCheck, RotateCcw } from "lucide-react";
import Logo from "../components/Logo";
import { SOCIAL_PIECES, getPieceById, type SocialPiece } from "../lib/socialPieces";

// Cores fixas da ARTE (exportada) — não são theme-aware (a peça precisa ser idêntica
// em qualquer tema). A UI ao redor é theme-aware.
const ART_BG = "#0d1526";
const GOLD = "#F59E0B";
const AMBER = "#EAB308";

// ---------------------------------------------------------------------------
// Arte da marca (renderizada em px reais dentro do canvasRef → vira o PNG)
// ---------------------------------------------------------------------------
function CoverArt({ piece }: { piece: SocialPiece }) {
  const s = piece.safeH;
  const iconSize = Math.round(s * 0.42);
  const nameSize = Math.round(s * 0.19);
  const taglineSize = Math.round(s * 0.1);
  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden" style={{ background: ART_BG, color: "#fff" }}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(120% 95% at 80% 25%, rgba(245,158,11,0.18), transparent 60%)` }} />
      {/* funil marca d'água */}
      <div className="absolute top-1/2 -translate-y-1/2" style={{ right: `-${piece.height * 0.08}px`, opacity: 0.06 }}>
        <Logo iconSize={Math.round(piece.height * 1.25)} variant="icon-only" theme="monochrome-white" />
      </div>
      {/* conteúdo dentro da área segura */}
      <div className="relative z-10 flex items-center justify-center" style={{ width: piece.safeW, height: piece.safeH }}>
        <div className="flex items-center" style={{ gap: iconSize * 0.5 }}>
          <Logo iconSize={iconSize} variant="icon-only" theme="default" />
          <div style={{ width: Math.max(2, iconSize * 0.03), height: iconSize * 1.15, background: "rgba(245,158,11,0.55)" }} />
          <div className="flex flex-col" style={{ gap: s * 0.04 }}>
            <div className="font-brand tracking-tight leading-none uppercase" style={{ fontSize: nameSize }}>
              <span className="font-bold">Funil</span> <span className="font-light" style={{ opacity: 0.9 }}>Comercial</span>
            </div>
            <div className="font-medium leading-tight" style={{ fontSize: taglineSize, color: AMBER, letterSpacing: "0.02em" }}>
              Estrutura de vendas para negócios locais
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileArt({ piece }: { piece: SocialPiece }) {
  const d = Math.min(piece.width, piece.height);
  const iconSize = Math.round(d * 0.42);
  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden" style={{ background: ART_BG }}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(70% 70% at 50% 45%, rgba(245,158,11,0.18), transparent 65%)` }} />
      <Logo iconSize={iconSize} variant="icon-only" theme="default" />
    </div>
  );
}

function PieceArt({ piece }: { piece: SocialPiece }) {
  return piece.art === "cover" ? <CoverArt piece={piece} /> : <ProfileArt piece={piece} />;
}

// ---------------------------------------------------------------------------
// Guias (área segura + zona da foto de perfil) — overlay que NÃO entra no PNG
// ---------------------------------------------------------------------------
function PieceGuides({ piece }: { piece: SocialPiece }) {
  const cx = piece.width / 2;
  const cy = piece.height / 2;
  const labelSize = Math.max(11, Math.round(piece.height * 0.03));
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ width: piece.width, height: piece.height }}>
      {/* área segura */}
      <div
        className="absolute border-2 border-dashed"
        style={{
          left: cx - piece.safeW / 2,
          top: cy - piece.safeH / 2,
          width: piece.safeW,
          height: piece.safeH,
          borderColor: GOLD,
          borderRadius: piece.safeShape === "circle" ? "9999px" : 0,
        }}
      >
        <span
          className="absolute font-bold whitespace-nowrap rounded"
          style={{ top: 6, left: 6, background: GOLD, color: "#000", fontSize: labelSize, padding: "2px 8px" }}
        >
          {piece.safeShape === "circle"
            ? `ÁREA SEGURA (círculo) · ⌀ ${piece.safeW}`
            : `ÁREA SEGURA · ${piece.safeW} × ${piece.safeH}`}
        </span>
      </div>

      {/* zona da foto de perfil / avatar a evitar */}
      {piece.profileZone && (
        <div
          className="absolute border-2 border-dashed"
          style={{
            left: piece.profileZone.x,
            top: piece.profileZone.y,
            width: piece.profileZone.w,
            height: piece.profileZone.h,
            borderColor: "#ef4444",
            background: "rgba(239,68,68,0.15)",
            borderRadius: "9999px",
          }}
        >
          <span
            className="absolute font-bold whitespace-nowrap rounded"
            style={{ bottom: 6, left: 6, background: "#ef4444", color: "#fff", fontSize: labelSize, padding: "2px 8px" }}
          >
            {piece.profileZone.label.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

// Renderiza a peça em px reais, escalada para caber. `guides` fica FORA do canvasRef.
function PieceStage({
  piece,
  scale,
  showGuides,
  canvasRef,
}: {
  piece: SocialPiece;
  scale: number;
  showGuides: boolean;
  canvasRef?: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="relative" style={{ width: piece.width * scale, height: piece.height * scale }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
        <div ref={canvasRef} className="relative overflow-hidden" style={{ width: piece.width, height: piece.height }}>
          <PieceArt piece={piece} />
        </div>
        {showGuides && <PieceGuides piece={piece} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Página: hub (lista) + gerador (por peça)
// ---------------------------------------------------------------------------
export default function PieceStudioPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGuides, setShowGuides] = useState(true);
  const [exporting, setExporting] = useState<1 | 2 | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const piece = getPieceById(selectedId);

  // Escala de exibição do gerador: cabe numa área ~820 × 560.
  const genScale = useMemo(() => {
    if (!piece) return 1;
    return Math.min(820 / piece.width, 560 / piece.height, 1);
  }, [piece]);

  const handleDownload = async (factor: 1 | 2) => {
    if (!canvasRef.current || !piece) return;
    setExporting(factor);
    try {
      const dataUrl = await htmlToImage.toPng(canvasRef.current, { pixelRatio: factor, quality: 1 });
      const link = document.createElement("a");
      link.download = `funil-comercial-${piece.id}${factor === 2 ? "-2x" : ""}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Erro ao exportar a peça", err);
    } finally {
      setExporting(null);
    }
  };

  // ---- HUB ----
  if (!piece) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-6 fc-fade-in">
        <h1 className="text-3xl font-black tracking-tight mb-2">Estúdio de Peças</h1>
        <p className="text-muted-foreground mb-10 text-lg">
          Gere as peças de presença da marca do Funil Comercial para cada rede — na medida exata e com área segura.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SOCIAL_PIECES.map((p) => {
            const Icon = p.icon;
            const previewScale = Math.min(300 / p.width, 150 / p.height);
            return (
              <div key={p.id} className="rounded-2xl border border-foreground/10 bg-card p-4 flex flex-col gap-4">
                {/* preview */}
                <div className="rounded-xl bg-foreground/5 border border-foreground/5 h-[160px] flex items-center justify-center overflow-hidden">
                  <PieceStage piece={p} scale={previewScale} showGuides={false} />
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Icon size={14} /> {p.platform}
                    </div>
                    <h3 className="font-bold text-lg text-foreground leading-tight mt-1">{p.name}</h3>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-md flex items-center gap-1">
                    <ShieldCheck size={11} /> Disponível
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <span><strong className="text-foreground">{p.width} × {p.height}</strong> px · {p.ratioLabel}</span>
                  <span>Área segura {p.safeShape === "circle" ? `⌀ ${p.safeW}` : `${p.safeW} × ${p.safeH}`} px</span>
                </div>

                <button
                  onClick={() => { setSelectedId(p.id); setShowGuides(true); }}
                  className="mt-auto w-full bg-primary text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98]"
                >
                  <ExternalLink size={16} /> Abrir gerador
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ---- GERADOR ----
  const Icon = piece.icon;
  return (
    <div className="max-w-5xl mx-auto py-8 px-6 fc-fade-in">
      <button
        onClick={() => setSelectedId(null)}
        className="text-muted-foreground hover:text-foreground flex items-center gap-2 mb-6 text-sm font-medium transition-colors"
      >
        <ArrowLeft size={16} /> Estúdio de Peças
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-foreground/5 flex items-center justify-center text-primary shrink-0">
          <Icon size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">{piece.platform} · {piece.name}</h1>
          <p className="text-sm text-muted-foreground">
            {piece.width} × {piece.height} px · proporção {piece.ratioLabel} · área segura {piece.safeShape === "circle" ? `⌀ ${piece.safeW}` : `${piece.safeW} × ${piece.safeH}`} px
          </p>
        </div>
      </div>

      {/* palco */}
      <div className="rounded-2xl border border-foreground/10 bg-foreground/5 p-6 md:p-10 flex items-center justify-center overflow-auto">
        <div className="drop-shadow-2xl">
          <PieceStage piece={piece} scale={genScale} showGuides={showGuides} canvasRef={canvasRef} />
        </div>
      </div>

      {/* ações */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        <button
          onClick={() => handleDownload(1)}
          disabled={exporting !== null}
          className="bg-primary text-black font-bold px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
        >
          {exporting === 1 ? <RotateCcw size={18} className="animate-spin" /> : <Download size={18} />}
          Baixar PNG ({piece.width} × {piece.height} exato)
        </button>
        <button
          onClick={() => handleDownload(2)}
          disabled={exporting !== null}
          className="border border-foreground/15 hover:bg-foreground/10 text-foreground font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {exporting === 2 ? <RotateCcw size={18} className="animate-spin" /> : <Download size={18} />}
          Baixar 2× ({piece.width * 2} × {piece.height * 2} — alta resolução)
        </button>
        <button
          onClick={() => setShowGuides((v) => !v)}
          className="border border-foreground/15 hover:bg-foreground/10 text-foreground font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95"
        >
          {showGuides ? <EyeOff size={18} /> : <Eye size={18} />}
          {showGuides ? "Ocultar guias" : "Mostrar guias"}
        </button>
      </div>

      {/* observações */}
      <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mt-8 leading-relaxed">
        <strong className="text-foreground">As guias aparecem só na tela — nunca são gravadas no PNG.</strong> {piece.notes}
      </p>
    </div>
  );
}
