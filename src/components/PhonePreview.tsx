import { ChevronLeft, Video, Phone, MoreVertical, Plus, Mic } from "lucide-react";

// Mockup de iPhone com uma conversa de WhatsApp, para pré-visualizar como a
// mensagem/template chega no celular do contato. Cores fixas do WhatsApp
// (independem do tema claro/escuro do app — é uma simulação do WhatsApp).

type PhonePreviewProps = {
  contactName: string;
  body: string;
  time?: string;
};

export function PhonePreview({ contactName, body, time = "12:00" }: PhonePreviewProps) {
  const displayName = contactName?.trim() || "Contato";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="w-[300px] max-w-full mx-auto">
      {/* Moldura do aparelho */}
      <div className="rounded-[2.75rem] bg-black p-2.5 shadow-2xl border border-white/10">
        <div className="rounded-[2.25rem] overflow-hidden bg-[#e5ddd5] relative">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 h-6 w-32 bg-black rounded-b-2xl" />

          {/* Header do WhatsApp */}
          <div className="bg-[#008069] text-white pt-7 pb-2.5 px-3 flex items-center gap-2">
            <ChevronLeft size={20} className="shrink-0" />
            <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center font-semibold text-sm shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold leading-tight truncate">{displayName}</p>
              <p className="text-[10px] text-white/80 leading-tight">online</p>
            </div>
            <Video size={16} className="shrink-0 opacity-90" />
            <Phone size={16} className="shrink-0 opacity-90" />
            <MoreVertical size={16} className="shrink-0 opacity-90" />
          </div>

          {/* Área da conversa */}
          <div
            className="px-3 py-4 min-h-[380px] flex flex-col justify-end gap-2"
            style={{
              backgroundColor: "#e5ddd5",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cg fill='%23d9d0c6' fill-opacity='0.5'%3E%3Ccircle cx='6' cy='6' r='1.5'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          >
            {/* Balão recebido (a mensagem enviada pela empresa chega como recebida) */}
            <div className="max-w-[85%] self-start bg-white rounded-lg rounded-tl-none px-2.5 py-1.5 shadow-sm">
              <p className="text-[12.5px] text-[#111b21] whitespace-pre-wrap break-words leading-snug">
                {body?.trim() ? body : "Sua mensagem aparecerá aqui..."}
              </p>
              <div className="flex justify-end mt-0.5">
                <span className="text-[9px] text-[#667781]">{time}</span>
              </div>
            </div>
          </div>

          {/* Barra de input (decorativa) */}
          <div className="bg-[#f0f2f5] px-3 py-2 flex items-center gap-2">
            <Plus size={18} className="text-[#54656f] shrink-0" />
            <div className="flex-1 bg-white rounded-full h-7 px-3 flex items-center">
              <span className="text-[11px] text-[#8696a0]">Mensagem</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#008069] flex items-center justify-center shrink-0">
              <Mic size={14} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
