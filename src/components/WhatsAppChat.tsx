import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Check, CheckCheck } from 'lucide-react';
import { useWhatsApp } from '../hooks/useWhatsApp';

interface Props {
  contactNumber: string | null;
}

export default function WhatsAppChat({ contactNumber }: Props) {
  const { messages, loading, error, sendMessage } = useWhatsApp(contactNumber);
  const [text, setText] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && contactNumber) {
      sendMessage(text.trim());
      setText('');
    }
  };

  if (!contactNumber) {
    return (
      <div className="flex items-center justify-center h-full bg-[#111111] text-gray-400">
        Selecione uma conversa ao lado para começar.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border border-[#333] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-[#111111] border-b border-[#333]">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white">{contactNumber}</h3>
          <span className="text-xs text-gray-400">Conversa via WhatsApp</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm">Carregando mensagens...</div>
        )}
        
        {messages.map((msg) => {
          const isMe = msg.from === 'me';
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[70%] rounded-xl px-4 py-2 ${
                  isMe ? 'bg-primary text-black' : 'bg-[#222] text-white'
                }`}
              >
                <p className="text-sm">{msg.body}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && (
                    <span className="text-black/70">
                      {msg.status === 'read' ? <CheckCheck className="w-3 h-3 text-blue-600" /> : <Check className="w-3 h-3" />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-[#111111] border-t border-[#333] flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 bg-[#222] border-none rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-1 focus:ring-primary outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-primary text-black p-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
