const fs = require('fs');

const codeToAppend = `
export default function InboxPage({
  channels,
  contacts,
  isSaving,
  leads,
  messages,
  opportunities,
  query,
  onCreateContact,
  onCreateLead,
  onCreateOpportunity,
  onOpenModal,
  onSendReply,
  onUpdateChannelStatus,
  onUpdateMessageStatus,
}: {
  channels: IntegrationChannel[];
  contacts: Contact[];
  isSaving: boolean;
  leads: Lead[];
  messages: InboxMessage[];
  opportunities: Opportunity[];
  query: string;
  onCreateContact: (message: InboxMessage) => Promise<void>;
  onCreateLead: (message: InboxMessage) => Promise<void>;
  onCreateOpportunity: (message: InboxMessage) => Promise<void>;
  onOpenModal: (modal: ModalType) => void;
  onSendReply: (message: InboxMessage, reply: string) => Promise<void>;
  onUpdateChannelStatus: (
    channel: IntegrationChannel,
    status: IntegrationChannel["status"],
  ) => Promise<void>;
  onUpdateMessageStatus: (
    message: InboxMessage,
    status: string,
    unreadCount: number,
  ) => Promise<void>;
}) {
  const filteredMessages = messages.filter((message) =>
    matchesQuery(query, [
      message.remetente_nome,
      message.telefone,
      message.mensagem,
      message.status,
    ]),
  );

  const conversations = useMemo(() => {
    const grouped = new Map<string, InboxMessage[]>();

    for (const message of filteredMessages) {
      const key = message.telefone || message.id;
      grouped.set(key, [...(grouped.get(key) ?? []), message]);
    }

    return Array.from(grouped.entries())
      .map(([key, conversationMessages]) => {
        const sortedMessages = [...conversationMessages].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        const latest = sortedMessages[sortedMessages.length - 1];
        const latestInbound =
          [...sortedMessages].reverse().find((item) => item.direction === "inbound") ??
          latest;

        return {
          key,
          latest,
          latestInbound,
          messages: sortedMessages,
          unreadCount: sortedMessages.reduce(
            (sum, item) => sum + Number(item.unread_count || 0),
            0,
          ),
        };
      })
      .sort(
        (a, b) =>
          new Date(b.latest.created_at).getTime() -
          new Date(a.latest.created_at).getTime(),
      );
  }, [filteredMessages]);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  
  // Mobile UI States: "list" | "chat" | "context"
  const [mobileView, setMobileView] = useState<"list" | "chat" | "context">("list");

  // Selection Logic
  useEffect(() => {
    if (!selectedKey && conversations.length > 0) {
      // Don't auto-select on mobile to keep the list view open initially
      if (window.innerWidth >= 1024) {
        setSelectedKey(conversations[0].key);
      }
    }
  }, [conversations, selectedKey]);

  // View handlers for mobile
  const handleSelectConversation = (key: string) => {
    setSelectedKey(key);
    setMobileView("chat");
  };

  const activeChannels = channels.filter((channel) => channel.status === "ativo");
  const selectedConversation = conversations.find((c) => c.key === selectedKey);
  const selected = selectedConversation?.latest;
  const sourceMessage = selectedConversation?.latestInbound;
  
  const recommendation = selectedConversation
    ? buildInboxRecommendation(selectedConversation.latestInbound)
    : undefined;
    
  const sourcePhone = sourceMessage?.telefone ?? selected?.telefone ?? "";
  
  const conversationContactId =
    selectedConversation?.messages.find((message) => message.contact_id)
      ?.contact_id ?? null;
  const conversationLeadId =
    selectedConversation?.messages.find((message) => message.lead_id)
      ?.lead_id ?? null;
      
  const contactByPhone = contacts.find(
    (contact) => normalizePhone(contact.telefone) === normalizePhone(sourcePhone),
  );
  const leadByPhone = leads.find(
    (lead) => normalizePhone(lead.telefone) === normalizePhone(sourcePhone),
  );
  
  const linkedContact = contacts.find((contact) => contact.id === conversationContactId) ?? contactByPhone;
  const linkedLead = leads.find((lead) => lead.id === conversationLeadId) ?? leadByPhone;
  const linkedOpportunity = linkedLead
    ? opportunities.find((opportunity) => opportunity.lead_id === linkedLead.id)
    : undefined;
    
  const conversationHasContactLink = Boolean(conversationContactId);
  const conversationHasLeadLink = Boolean(conversationLeadId);
  const conversationHasOpportunityReady = Boolean(
    conversationHasLeadLink && linkedOpportunity,
  );

  const contactActionLabel = conversationHasContactLink
    ? "Contato vinculado"
    : linkedContact
      ? "Vincular contato"
      : "Criar contato";
  const leadActionLabel = conversationHasLeadLink
    ? "Lead vinculado"
    : linkedLead
      ? "Vincular lead"
      : "Criar lead";
  const opportunityActionLabel = conversationHasOpportunityReady
    ? "Oportunidade aberta"
    : linkedOpportunity
      ? "Vincular oportunidade"
      : "Criar oportunidade";

  const crmBridgeTitle = linkedLead
    ? \`Lead: \${linkedLead.nome}\`
    : linkedContact
      ? \`Contato: \${linkedContact.nome}\`
      : "Sem registro comercial";

  useEffect(() => {
    setReplyText(recommendation?.suggestedReply ?? "");
  }, [selectedConversation?.key, recommendation?.suggestedReply]);

  const handleReplySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sourceMessage || !replyText.trim()) return;
    await onSendReply(sourceMessage, replyText.trim());
    setReplyText("");
  };

  // Renders the list column
  const renderListColumn = () => (
    <div className={\`flex-col bg-card border-r border-white/5 h-full overflow-hidden \${mobileView === "list" ? "flex" : "hidden lg:flex"} lg:w-[320px] xl:w-[380px] shrink-0\`}>
      <div className="p-4 border-b border-white/5 bg-black/20 flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Inbox</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => onOpenModal("channel")} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors" title="Canais">
              <Plus size={18} />
            </button>
          </div>
        </div>
        
        {/* Fake Search / Filters */}
        <div className="flex bg-white/5 rounded-xl p-1">
          <button className="flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg bg-white/10 text-foreground">Abertas</button>
          <button className="flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg text-muted-foreground hover:text-foreground">Não Lidas</button>
          <button className="flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg text-muted-foreground hover:text-foreground">Todas</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {activeChannels.length === 0 && channels.length > 0 && (
          <div className="p-4 m-4 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl">
            Nenhum canal ativo para receber mensagens.
          </div>
        )}
        
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageCircle size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nenhuma conversa encontrada.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {conversations.map((conv) => {
              const isSelected = selectedKey === conv.key;
              const hasUnread = conv.unreadCount > 0;
              return (
                <button
                  key={conv.key}
                  onClick={() => handleSelectConversation(conv.key)}
                  className={\`flex items-start gap-3 p-4 border-b border-white/5 text-left transition-all hover:bg-white/[0.02] \${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'}\`}
                >
                  <div className="relative shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-muted-foreground">
                      {conv.latestInbound.remetente_nome.charAt(0).toUpperCase()}
                    </div>
                    {hasUnread && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full border-2 border-[#121212]" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <strong className={\`text-sm truncate \${hasUnread ? 'text-foreground' : 'text-foreground/80'}\`}>
                        {conv.latestInbound.remetente_nome}
                      </strong>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {new Date(conv.latest.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={\`text-xs line-clamp-1 \${hasUnread ? 'text-foreground/80 font-medium' : 'text-muted-foreground'}\`}>
                      {conv.latest.mensagem}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Renders the chat column
  const renderChatColumn = () => {
    if (!selectedConversation) {
      return (
        <div className={\`flex-1 bg-black/20 hidden lg:flex flex-col items-center justify-center text-center p-8\`}>
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <MessageCircle size={32} className="text-muted-foreground/30" />
          </div>
          <h2 className="text-xl font-bold mb-2">Central de Atendimento</h2>
          <p className="text-muted-foreground max-w-sm">Selecione uma conversa na barra lateral para começar a responder e qualificar seus leads.</p>
        </div>
      );
    }

    return (
      <div className={\`flex-1 bg-black/20 flex-col h-full \${mobileView === "chat" ? "flex" : "hidden lg:flex"}\`}>
        {/* Chat Header */}
        <div className="h-16 shrink-0 border-b border-white/5 bg-card/50 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile back button */}
            <button onClick={() => setMobileView("list")} className="lg:hidden p-2 -ml-2 rounded-xl text-muted-foreground hover:bg-white/5">
              <MoveRight size={20} className="rotate-180" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">
                {sourceMessage?.remetente_nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">{sourceMessage?.remetente_nome}</h3>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  {selected?.status ?? "Atendimento"} • {sourceMessage?.canal}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => sourceMessage && onUpdateMessageStatus(sourceMessage, "Resolvido", 0)}
              className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 font-semibold text-xs hover:bg-green-500/20 transition-colors hidden sm:flex items-center gap-1"
            >
              <CheckCircle2 size={14} /> Resolver
            </button>
            <button 
              onClick={() => setMobileView("context")}
              className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-white/5"
            >
              <UsersRound size={20} />
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4">
          <div className="text-center my-4">
            <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-white/5 rounded-full text-muted-foreground">Início da conversa</span>
          </div>
          
          {selectedConversation.messages.map((message) => {
            const isInbound = message.direction === "inbound";
            return (
              <div key={message.id} className={\`flex flex-col max-w-[85%] \${isInbound ? 'self-start' : 'self-end'}\`}>
                <div 
                  className={\`p-3.5 rounded-2xl text-sm \${
                    isInbound 
                      ? 'bg-white/10 text-foreground rounded-tl-sm' 
                      : 'bg-primary text-primary-foreground rounded-tr-sm'
                  }\`}
                >
                  {message.mensagem}
                </div>
                <div className={\`text-[10px] text-muted-foreground mt-1 \${isInbound ? 'text-left' : 'text-right'}\`}>
                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Footer / Composer */}
        <div className="p-4 bg-card/80 border-t border-white/5 shrink-0">
          <form onSubmit={handleReplySubmit} className="flex items-end gap-3 max-w-4xl mx-auto">
            <div className="flex-1 bg-black/40 rounded-2xl border border-white/10 overflow-hidden focus-within:border-primary/50 transition-colors">
              <textarea
                className="w-full bg-transparent p-4 text-sm resize-none outline-none min-h-[50px] max-h-[150px]"
                rows={1}
                placeholder="Escreva sua resposta..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleReplySubmit(e as any);
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isSaving || !replyText.trim()}
              className="shrink-0 h-[50px] w-[50px] rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-lg"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
        </div>
      </div>
    );
  };

  // Renders the CRM Context column
  const renderContextColumn = () => {
    if (!selectedConversation) return null;

    return (
      <div className={\`flex-col bg-card border-l border-white/5 h-full overflow-y-auto \${mobileView === "context" ? "flex absolute inset-0 z-50" : "hidden lg:flex"} lg:w-[320px] xl:w-[380px] shrink-0\`}>
        
        {/* Mobile header for context */}
        <div className="lg:hidden h-16 shrink-0 border-b border-white/5 bg-card flex items-center px-4">
          <button onClick={() => setMobileView("chat")} className="p-2 -ml-2 rounded-xl text-muted-foreground hover:bg-white/5 flex items-center gap-2">
            <MoveRight size={20} className="rotate-180" /> <span className="font-semibold text-sm">Voltar ao Chat</span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-8">
          
          {/* AI Recommendation Panel */}
          {recommendation && (
            <div className={\`p-5 rounded-3xl border \${recommendation.priority === 'Alta' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-primary/5 border-primary/20'}\`}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className={recommendation.priority === 'Alta' ? 'text-amber-500' : 'text-primary'} />
                <h3 className="font-bold text-sm">Inteligência Comercial</h3>
              </div>
              <p className="text-sm font-medium text-foreground mb-2">{recommendation.nextAction}</p>
              <div className="p-3 rounded-xl bg-black/20 text-xs text-muted-foreground border border-white/5">
                <span className="block mb-1 text-[10px] uppercase font-bold tracking-wider opacity-50">Sugestão de resposta</span>
                "{recommendation.suggestedReply}"
              </div>
            </div>
          )}

          {/* CRM Context Panel */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-sm tracking-widest uppercase text-muted-foreground">Contexto de CRM</h3>
            
            <div className="flex flex-col gap-3">
              {/* Contato Link */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <UsersRound size={16} className="text-muted-foreground" />
                    <span>Contato</span>
                  </div>
                  {linkedContact && <CheckCircle2 size={14} className="text-green-500" />}
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {linkedContact ? \`\${linkedContact.nome} (\${linkedContact.telefone})\` : "Nenhum contato encontrado. Deseja registrar no banco de dados?"}
                </p>

                <button
                  className={\`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors \${conversationHasContactLink ? 'bg-white/5 text-muted-foreground cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-foreground'}\`}
                  disabled={isSaving || !sourceMessage || conversationHasContactLink}
                  onClick={() => sourceMessage && onCreateContact(sourceMessage)}
                >
                  {contactActionLabel}
                </button>
              </div>

              {/* Lead Link */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Target size={16} className="text-muted-foreground" />
                    <span>Lead</span>
                  </div>
                  {linkedLead && <CheckCircle2 size={14} className="text-green-500" />}
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {linkedLead ? \`Lead ativo com interesse em \${linkedLead.interesse || 'indefinido'}.\` : "O contato demonstrou interesse comercial? Transforme-o em Lead."}
                </p>

                <button
                  className={\`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors \${conversationHasLeadLink ? 'bg-white/5 text-muted-foreground cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg'}\`}
                  disabled={isSaving || !sourceMessage || conversationHasLeadLink}
                  onClick={() => sourceMessage && onCreateLead(sourceMessage)}
                >
                  {leadActionLabel}
                </button>
              </div>

              {/* Oportunidade Link */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <CircleDollarSign size={16} className="text-muted-foreground" />
                    <span>Oportunidade</span>
                  </div>
                  {linkedOpportunity && <CheckCircle2 size={14} className="text-green-500" />}
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {linkedOpportunity ? \`Oportunidade aberta na etapa: \${linkedOpportunity.etapa}.\` : "Negociação iniciada? Abra uma oportunidade no Funil."}
                </p>

                <button
                  className={\`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors \${conversationHasOpportunityReady ? 'bg-white/5 text-muted-foreground cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg'}\`}
                  disabled={isSaving || !sourceMessage || conversationHasOpportunityReady}
                  onClick={() => sourceMessage && onCreateOpportunity(sourceMessage)}
                >
                  {opportunityActionLabel}
                </button>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    );
  };

  return (
    // Fixed height wrapper taking full space below top navbar (assuming standard Layout)
    <div className="flex -mx-4 sm:-mx-8 -mb-12 h-[calc(100vh-6rem)] min-h-[600px] border-t border-white/5 overflow-hidden relative">
      {renderListColumn()}
      {renderChatColumn()}
      {renderContextColumn()}
    </div>
  );
}
`;

fs.appendFileSync('src/pages/Inbox.tsx', codeToAppend);
console.log('Appended Inbox successfully');
