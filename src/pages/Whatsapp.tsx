import React, { useState, useEffect } from 'react';

import WhatsAppChat from '../components/WhatsAppChat';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { MessageSquare, Phone, Activity } from 'lucide-react';
import { requireSupabase } from '../lib/supabase';

export default function WhatsappPage() {
  const [activeContact, setActiveContact] = useState<string | null>(null);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const { connectionStatus } = useWhatsApp(null);
  const supabase = requireSupabase();

  useEffect(() => {
    async function loadContacts() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('inbox_messages')
        .select('telefone, remetente_nome, unread_count, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        const uniqueContacts: any[] = [];
        const seen = new Set();
        data.forEach((msg) => {
          if (!seen.has(msg.telefone)) {
            seen.add(msg.telefone);
            uniqueContacts.push({
              number: msg.telefone,
              name: msg.remetente_nome || msg.telefone,
              unread: msg.unread_count || 0
            });
          }
        });
        setRecentContacts(uniqueContacts);
      }
    }
    loadContacts();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'close':
      case 'disconnected':
      default: return 'bg-red-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'Conectado';
      case 'connecting': return 'Conectando...';
      case 'close':
      case 'disconnected': return 'Desconectado';
      default: return status;
    }
  };

  return (
    <>
      <div className="flex h-[calc(100vh-8rem)] gap-6">
        {/* Sidebar Contacts */}
        <div className="w-80 flex flex-col bg-[#111111] border border-[#222] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#222]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              WhatsApp
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2 h-2 rounded-full ${getStatusColor(connectionStatus)}`}></span>
              <span className="text-xs text-gray-400">
                Instância: {getStatusText(connectionStatus)}
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {recentContacts.map((contact, i) => (
              <button
                key={i}
                onClick={() => setActiveContact(contact.number)}
                className={`w-full text-left p-3 rounded-lg mb-1 flex items-center gap-3 transition-colors ${
                  activeContact === contact.number ? 'bg-primary/10 border border-primary/20' : 'hover:bg-[#222] border border-transparent'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-gray-400 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-white text-sm font-medium truncate">{contact.name}</h4>
                  <p className="text-xs text-gray-500 truncate">{contact.number}</p>
                </div>
                {contact.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-black">
                    {contact.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1">
          <WhatsAppChat contactNumber={activeContact} />
        </div>
      </div>
    </>
  );
}
