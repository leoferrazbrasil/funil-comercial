import { useState, useEffect } from 'react';
import { requireSupabase } from '../lib/supabase';

export interface Message {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | string;
}

export function useWhatsApp(contactNumber: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('connected');
  
  const supabase = requireSupabase();

  const fetchMessages = async () => {
    if (!contactNumber) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error: fetchError } = await supabase
        .from('inbox_messages')
        .select('*')
        .eq('owner_id', user.id)
        .eq('telefone', contactNumber)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      const formattedMessages: Message[] = (data || []).map((msg: any) => ({
        id: msg.id,
        from: msg.direction === 'inbound' ? msg.telefone : 'me',
        to: msg.direction === 'outbound' ? msg.telefone : 'me',
        body: msg.mensagem,
        timestamp: msg.created_at,
        status: msg.status,
      }));

      setMessages(formattedMessages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!contactNumber) return;
    
    const tempId = Date.now().toString();
    const tempMsg: Message = {
      id: tempId,
      from: 'me',
      to: contactNumber,
      body: text,
      timestamp: new Date().toISOString(),
      status: 'sending',
    };

    try {
      // Optimistic update
      setMessages((prev) => [...prev, tempMsg]);

      const { data, error: invokeError } = await supabase.functions.invoke('whatsapp-send', {
        body: { phone: contactNumber, message: text },
      });

      if (invokeError || data?.error) {
        throw new Error(data?.error || invokeError?.message || 'Erro ao enviar mensagem');
      }

      // O Realtime irá se encarregar de trazer a mensagem verdadeira do banco e atualizar o estado
      fetchMessages(); 
    } catch (err: any) {
      setError(err.message);
      // Remove temp message if failed
      setMessages((prev) => prev.filter(m => m.id !== tempId));
    }
  };

  useEffect(() => {
    fetchMessages();

    if (!contactNumber) return;

    // Supabase Realtime Subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inbox_messages',
          filter: `telefone=eq.${contactNumber}`,
        },
        (payload) => {
          const newMsg = payload.new;
          const formattedMessage: Message = {
            id: newMsg.id,
            from: newMsg.direction === 'inbound' ? newMsg.telefone : 'me',
            to: newMsg.direction === 'outbound' ? newMsg.telefone : 'me',
            body: newMsg.mensagem,
            timestamp: newMsg.created_at,
            status: newMsg.status,
          };
          
          setMessages((prev) => {
            // Previne duplicidade caso o fetch já tenha trazido ou seja a optimistic update realocada
            if (prev.find(m => m.id === formattedMessage.id)) return prev;
            return [...prev.filter(m => m.status !== 'sending'), formattedMessage];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'inbox_messages',
          filter: `telefone=eq.${contactNumber}`,
        },
        (payload) => {
          // Atualiza o status da mensagem
          setMessages((prev) => 
            prev.map(m => m.id === payload.new.id ? { ...m, status: payload.new.status } : m)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contactNumber]);

  return {
    messages,
    loading,
    error,
    connectionStatus,
    sendMessage,
  };
}
