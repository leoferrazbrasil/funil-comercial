const fs = require('fs');

const codeToAppend = `
// Color generator for Avatars based on name
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-red-500/20 text-red-500",
    "bg-blue-500/20 text-blue-500",
    "bg-green-500/20 text-green-500",
    "bg-amber-500/20 text-amber-500",
    "bg-purple-500/20 text-purple-500",
    "bg-pink-500/20 text-pink-500",
    "bg-indigo-500/20 text-indigo-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (name.substring(0, 2)).toUpperCase();
};

export default function ContactsPage({
  contacts,
  query,
  isSaving,
  onConvertContact,
  onEditContact,
  onOpenModal,
}: {
  contacts: Contact[];
  query: string;
  isSaving: boolean;
  onConvertContact: (contact: Contact) => Promise<void>;
  onEditContact: (contact: Contact) => void;
  onOpenModal: (modal: ModalType) => void;
}) {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "commercial">("overview");

  const filteredContacts = contacts.filter((contact) =>
    matchesQuery(query, [
      contact.nome,
      contact.telefone,
      contact.email,
      contact.origem,
      contact.potencial,
    ]),
  );

  const selectedContact = contacts.find((c) => c.id === selectedContactId);

  // Keyboard escape to close drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedContactId(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const renderDataGrid = () => {
    return (
      <div className="flex-1 overflow-auto bg-card rounded-2xl border border-white/5 shadow-2xl relative min-h-[500px]">
        {filteredContacts.length === 0 ? (
          <EmptyState
            action="Novo Contato"
            description="Cadastre, organize e encontre rapidamente pessoas que podem virar leads."
            onAction={() => onOpenModal("contact")}
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <table className="w-full text-left hidden md:table border-collapse">
              <thead className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-wider text-muted-foreground sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="p-4 font-semibold">Contato</th>
                  <th className="p-4 font-semibold">Canais</th>
                  <th className="p-4 font-semibold">Origem</th>
                  <th className="p-4 font-semibold">Potencial</th>
                  <th className="p-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr 
                    key={contact.id} 
                    onClick={() => setSelectedContactId(contact.id)}
                    className={\`group border-b border-white/5 transition-colors cursor-pointer \${selectedContactId === contact.id ? 'bg-primary/5' : 'hover:bg-white/[0.02]'}\`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={\`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm \${getAvatarColor(contact.nome)}\`}>
                          {getInitials(contact.nome)}
                        </div>
                        <div>
                          <strong className="block text-sm font-semibold text-foreground">{contact.nome}</strong>
                          <span className="text-xs text-muted-foreground block truncate max-w-[180px]">Criado em {new Date(contact.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-xs">
                        {contact.telefone ? (
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1.5"><MessageCircle size={12} /> {contact.telefone}</span>
                        ) : <span className="text-muted-foreground opacity-50">-</span>}
                        {contact.email ? (
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1.5"><Send size={12} /> {contact.email}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-white/5 rounded-full text-muted-foreground">
                        {contact.origem || "Manual"}
                      </span>
                    </td>
                    <td className="p-4">
                      {contact.potencial === 'Alto' ? (
                        <span className="text-amber-500 text-xs font-semibold flex items-center gap-1"><TrendingUp size={14} /> Alto</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">{contact.potencial || "Desconhecido"}</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                          onClick={(e) => { e.stopPropagation(); onEditContact(contact); }}
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Mobile Cards View */}
            <div className="flex flex-col md:hidden p-4 gap-3">
              {filteredContacts.map((contact) => (
                <div 
                  key={contact.id}
                  onClick={() => setSelectedContactId(contact.id)}
                  className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className={\`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg \${getAvatarColor(contact.nome)}\`}>
                      {getInitials(contact.nome)}
                    </div>
                    <div className="flex-1">
                      <strong className="block text-base font-semibold text-foreground">{contact.nome}</strong>
                      <span className="px-2 py-0.5 mt-1 inline-block text-[10px] font-bold tracking-wider uppercase bg-black/40 rounded-full text-muted-foreground">
                        {contact.origem || "Manual"}
                      </span>
                    </div>
                  </div>
                  {contact.telefone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MessageCircle size={14} /> {contact.telefone}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderProfileDrawer = () => {
    if (!selectedContact) return null;
    
    return (
      <>
        {/* Backdrop for Mobile */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSelectedContactId(null)}
        />
        
        {/* The Drawer */}
        <div className="fixed lg:relative inset-y-0 right-0 z-50 w-full md:w-[450px] lg:w-[400px] xl:w-[450px] bg-card lg:bg-transparent lg:border-l border-white/5 shadow-2xl lg:shadow-none flex flex-col shrink-0 transition-transform animate-in slide-in-from-right lg:animate-none">
          
          <div className="h-16 shrink-0 border-b border-white/5 flex items-center justify-between px-6 bg-card/50">
            <h3 className="font-bold text-sm tracking-widest uppercase text-muted-foreground">Perfil do Contato</h3>
            <button 
              onClick={() => setSelectedContactId(null)} 
              className="p-2 -mr-2 rounded-xl text-muted-foreground hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-card">
            {/* Header / Hero */}
            <div className="p-8 flex flex-col items-center text-center border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
              <div className={\`w-24 h-24 rounded-full flex items-center justify-center font-bold text-3xl mb-4 shadow-xl border-4 border-card \${getAvatarColor(selectedContact.nome)}\`}>
                {getInitials(selectedContact.nome)}
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">{selectedContact.nome}</h2>
              <p className="text-muted-foreground text-sm flex items-center gap-2 justify-center">
                <Clock3 size={14} /> Cliente desde {new Date(selectedContact.created_at).toLocaleDateString()}
              </p>
              
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => onEditContact(selectedContact)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <Pencil size={16} /> Editar
                </button>
                <button 
                  className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <MessageCircle size={16} /> WhatsApp
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5">
              <button 
                onClick={() => setActiveTab("overview")}
                className={\`flex-1 py-4 text-sm font-semibold transition-colors \${activeTab === "overview" ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}\`}
              >
                Visão Geral
              </button>
              <button 
                onClick={() => setActiveTab("commercial")}
                className={\`flex-1 py-4 text-sm font-semibold transition-colors \${activeTab === "commercial" ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}\`}
              >
                Comercial
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 flex flex-col gap-6">
              {activeTab === "overview" && (
                <>
                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Informações</h4>
                    
                    <div className="p-4 bg-white/5 rounded-2xl flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <MessageCircle size={16} className="text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase text-muted-foreground font-semibold">Telefone</span>
                          <span className="text-sm">{selectedContact.telefone || "Não informado"}</span>
                        </div>
                      </div>
                      
                      <div className="w-full h-px bg-white/5 my-1" />
                      
                      <div className="flex items-center gap-3">
                        <Send size={16} className="text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase text-muted-foreground font-semibold">E-mail</span>
                          <span className="text-sm">{selectedContact.email || "Não informado"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Contexto</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-white/5 rounded-2xl flex flex-col gap-1">
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold">Origem</span>
                        <span className="text-sm font-semibold">{selectedContact.origem || "Manual"}</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl flex flex-col gap-1">
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold">Potencial</span>
                        <span className="text-sm font-semibold">{selectedContact.potencial || "Normal"}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {activeTab === "commercial" && (
                <div className="flex flex-col gap-6">
                  <div className="p-5 rounded-3xl border border-primary/20 bg-primary/5 flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Target size={64} />
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-primary mb-1">Qualificação de Lead</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Transforme este contato em um Lead no funil de vendas para acompanhar o ciclo de compra.
                      </p>
                    </div>
                    
                    <button
                      className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                      disabled={isSaving}
                      onClick={() => onConvertContact(selectedContact)}
                    >
                      <Target size={16} /> Converter em Lead
                    </button>
                  </div>
                  
                  <div className="p-5 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col gap-3 text-center">
                    <CircleDollarSign size={24} className="mx-auto text-muted-foreground/50 mb-1" />
                    <h4 className="font-semibold text-sm text-muted-foreground">Oportunidades</h4>
                    <p className="text-xs text-muted-foreground/60">
                      Este contato ainda não tem oportunidades diretas vinculadas ao CRM. Qualifique-o primeiro.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-6rem)] -mb-12">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Base de Contatos</h1>
          <p className="text-sm text-muted-foreground">
            Sua agenda centralizada ({filteredContacts.length} registros).
          </p>
        </div>
        
        <button 
          onClick={() => onOpenModal("contact")}
          className="primary-button hidden sm:flex"
        >
          <Plus size={16} /> Novo Contato
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden gap-6 pb-6">
        {renderDataGrid()}
        {renderProfileDrawer()}
      </div>
    </div>
  );
}
`;

fs.appendFileSync('src/pages/Contacts.tsx', codeToAppend);
console.log('Appended Contacts successfully');
