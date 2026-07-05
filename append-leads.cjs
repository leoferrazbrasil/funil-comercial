const fs = require('fs');

const codeToAppend = `
// Circular Progress Component for Lead Scoring
const ScoreRing = ({ score }: { score: number }) => {
  const radius = 16;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  
  let color = "text-green-500";
  if (score < 50) color = "text-red-500";
  else if (score < 80) color = "text-amber-500";
  
  return (
    <div className="relative flex items-center justify-center w-10 h-10">
      <svg className="transform -rotate-90 w-10 h-10">
        <circle
          className="text-white/10"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="20"
          cy="20"
        />
        <circle
          className={\`\${color} transition-all duration-1000 ease-in-out\`}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="20"
          cy="20"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-foreground">{score}</span>
    </div>
  );
};

export default function LeadsPage({
  leads,
  opportunities,
  query,
  isSaving,
  onCreateOpportunity,
  onEditLead,
  onOpenModal,
}: {
  leads: Lead[];
  opportunities: Opportunity[];
  query: string;
  isSaving: boolean;
  onCreateOpportunity: (lead: Lead) => Promise<void>;
  onEditLead: (lead: Lead) => void;
  onOpenModal: (modal: ModalType) => void;
}) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const filteredLeads = leads.filter((lead) =>
    matchesQuery(query, [
      lead.nome,
      lead.telefone,
      lead.email,
      lead.interesse,
      lead.status,
      lead.origem,
    ]),
  );

  const activeLeads = filteredLeads.filter(isActiveLead);
  
  const opportunityByLeadId = new Map(
    opportunities
      .filter((opportunity) => opportunity.lead_id)
      .map((opportunity) => [opportunity.lead_id, opportunity]),
  );
  
  const leadQualifications = filteredLeads.map(buildLeadQualification);
  
  // Custom sorting: Unconverted Leads with HIGH scores first.
  const sortedQualifications = [...leadQualifications].sort((a, b) => {
    const aHasOpp = opportunityByLeadId.has(a.lead.id);
    const bHasOpp = opportunityByLeadId.has(b.lead.id);
    
    if (aHasOpp && !bHasOpp) return 1;
    if (!aHasOpp && bHasOpp) return -1;
    
    // Both converted or both unconverted, sort by score descending
    return b.score - a.score;
  });

  const qualifiedLeads = leadQualifications.filter(
    (q) => q.score >= 80 && !opportunityByLeadId.has(q.lead.id),
  );
  const incompleteQualifications = leadQualifications.filter(
    (q) => q.missingFields.length > 0 && !opportunityByLeadId.has(q.lead.id)
  );
  const leadsWithOpportunity = filteredLeads.filter((lead) =>
    opportunityByLeadId.has(lead.id),
  );

  const selectedQ = sortedQualifications.find((q) => q.lead.id === selectedLeadId);

  // Keyboard escape to close drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedLeadId(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const renderDataGrid = () => {
    return (
      <div className="flex-1 overflow-auto bg-card rounded-2xl border border-white/5 shadow-2xl relative min-h-[500px]">
        {sortedQualifications.length === 0 ? (
          <EmptyState
            action="Cadastrar Lead"
            description="Nenhum lead encontrado para esta conta. Importe ou crie um lead manualmente."
            onAction={() => onOpenModal("lead")}
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <table className="w-full text-left hidden md:table border-collapse">
              <thead className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-wider text-muted-foreground sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="p-4 font-semibold text-center w-20">Score</th>
                  <th className="p-4 font-semibold">Lead</th>
                  <th className="p-4 font-semibold">Contato</th>
                  <th className="p-4 font-semibold">Interesse & Valor</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedQualifications.map((q) => {
                  const lead = q.lead;
                  const hasOpp = opportunityByLeadId.has(lead.id);
                  const isSelected = selectedLeadId === lead.id;
                  
                  return (
                    <tr 
                      key={lead.id} 
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={\`group border-b border-white/5 transition-colors cursor-pointer \${isSelected ? 'bg-primary/5' : 'hover:bg-white/[0.02]'}\`}
                    >
                      <td className="p-4">
                        <div className="flex justify-center">
                          {hasOpp ? (
                            <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center" title="No Funil">
                              <CheckCircle2 size={20} />
                            </div>
                          ) : (
                            <ScoreRing score={q.score} />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <strong className="block text-sm font-semibold text-foreground">{lead.nome}</strong>
                        <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5 inline-block">
                          {lead.origem || "Desconhecido"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-xs">
                          {lead.telefone ? (
                            <span className="text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1.5"><MessageCircle size={12} /> {lead.telefone}</span>
                          ) : <span className="text-muted-foreground opacity-50">Sem Telefone</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <strong className="block text-sm text-foreground">{formatMoney(Number(lead.valor_estimado))}</strong>
                        <span className="text-xs text-muted-foreground truncate max-w-[150px] inline-block" title={lead.interesse}>{lead.interesse || "-"}</span>
                      </td>
                      <td className="p-4">
                        <span className={\`px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full \${hasOpp ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-white/5 text-muted-foreground'}\`}>
                          {hasOpp ? "No Funil" : lead.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1.5 text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                            onClick={(e) => { e.stopPropagation(); onEditLead(lead); }}
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Mobile Cards View */}
            <div className="flex flex-col md:hidden p-4 gap-3">
              {sortedQualifications.map((q) => {
                const lead = q.lead;
                const hasOpp = opportunityByLeadId.has(lead.id);
                return (
                  <div 
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {hasOpp ? (
                          <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                            <CheckCircle2 size={20} />
                          </div>
                        ) : (
                          <ScoreRing score={q.score} />
                        )}
                        <div>
                          <strong className="block text-sm font-semibold text-foreground">{lead.nome}</strong>
                          <span className="text-xs text-muted-foreground mt-0.5 inline-block">{lead.telefone || "Sem telefone"}</span>
                        </div>
                      </div>
                      <span className={\`px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full \${hasOpp ? 'bg-green-500/10 text-green-500' : 'bg-white/10 text-muted-foreground'}\`}>
                        {hasOpp ? "Funil" : lead.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderProfileDrawer = () => {
    if (!selectedQ) return null;
    const lead = selectedQ.lead;
    const hasOpp = opportunityByLeadId.has(lead.id);
    const opp = opportunityByLeadId.get(lead.id);
    
    return (
      <>
        {/* Backdrop for Mobile */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSelectedLeadId(null)}
        />
        
        {/* The Drawer */}
        <div className="fixed lg:relative inset-y-0 right-0 z-50 w-full md:w-[450px] lg:w-[400px] xl:w-[450px] bg-card lg:bg-transparent lg:border-l border-white/5 shadow-2xl lg:shadow-none flex flex-col shrink-0 transition-transform animate-in slide-in-from-right lg:animate-none">
          
          <div className="h-16 shrink-0 border-b border-white/5 flex items-center justify-between px-6 bg-card/50">
            <h3 className="font-bold text-sm tracking-widest uppercase text-muted-foreground flex items-center gap-2">
              <Target size={16} /> Qualificação
            </h3>
            <button 
              onClick={() => setSelectedLeadId(null)} 
              className="p-2 -mr-2 rounded-xl text-muted-foreground hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-card p-6 flex flex-col gap-8">
            
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">{lead.nome}</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground bg-white/5 px-2 py-1 rounded-md uppercase tracking-wider">{lead.status.replace("_", " ")}</span>
                <span className="text-xs font-semibold text-muted-foreground bg-white/5 px-2 py-1 rounded-md uppercase tracking-wider">{lead.origem || "Manual"}</span>
              </div>
            </div>
            
            {/* AI Action Box */}
            {!hasOpp ? (
              <div className={\`p-5 rounded-3xl border \${selectedQ.score >= 80 ? 'bg-primary/5 border-primary/30 shadow-[0_0_30px_rgba(35,196,131,0.1)]' : 'bg-amber-500/5 border-amber-500/20'}\`}>
                <div className="flex items-center gap-4 mb-4">
                  <ScoreRing score={selectedQ.score} />
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Score: {selectedQ.score}%</h4>
                    <p className="text-xs text-muted-foreground font-medium">{selectedQ.score >= 80 ? "Pronto para conversão!" : "Qualificação incompleta"}</p>
                  </div>
                </div>
                
                <p className="text-sm font-semibold mb-4 leading-snug">{selectedQ.nextAction}</p>
                
                {selectedQ.score >= 80 ? (
                  <button
                    className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl transition-all flex items-center justify-center gap-2 group"
                    disabled={isSaving}
                    onClick={() => onCreateOpportunity(lead)}
                  >
                    <CircleDollarSign size={18} className="group-hover:scale-110 transition-transform" /> 
                    Criar Oportunidade
                  </button>
                ) : (
                  <button
                    className="w-full py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-foreground font-semibold text-sm transition-all flex items-center justify-center gap-2"
                    onClick={() => onEditLead(lead)}
                  >
                    <Pencil size={16} /> Completar Cadastro
                  </button>
                )}
              </div>
            ) : (
              <div className="p-5 rounded-3xl border border-green-500/20 bg-green-500/5 text-center flex flex-col gap-3">
                <CheckCircle2 size={32} className="mx-auto text-green-500" />
                <div>
                  <h4 className="font-bold text-green-500 mb-1">Convertido em Oportunidade</h4>
                  <p className="text-xs text-muted-foreground font-medium">Este lead já está no Funil de Vendas na etapa <strong>"{opp?.etapa}"</strong>.</p>
                </div>
              </div>
            )}
            
            {/* Details */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Dados Base</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-white/5 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">Valor Estimado</span>
                  <span className="text-sm font-semibold">{formatMoney(Number(lead.valor_estimado))}</span>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">Telefone</span>
                  <span className="text-sm font-semibold">{lead.telefone || "-"}</span>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl flex flex-col gap-1 col-span-2">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">Interesse</span>
                  <span className="text-sm font-semibold leading-snug">{lead.interesse || "-"}</span>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl flex flex-col gap-1 col-span-2">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">Próxima Ação Manual</span>
                  <span className="text-sm font-semibold leading-snug">{lead.proxima_acao || "-"}</span>
                </div>
              </div>
            </div>
            
            <button
              className="w-full py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-foreground font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-auto"
              onClick={() => onEditLead(lead)}
            >
              <Pencil size={16} /> Editar Dados
            </button>
            
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-6rem)] -mb-12">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Qualificação de Leads</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe interessados e classifique potenciais negócios.
          </p>
        </div>
        
        <button 
          onClick={() => onOpenModal("lead")}
          className="primary-button hidden sm:flex"
        >
          <Plus size={16} /> Novo Lead
        </button>
      </div>

      {/* Top Metrics (KPIs) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-card border border-white/5 rounded-2xl p-4 md:p-5 flex flex-col gap-3 relative overflow-hidden group">
          <div className="flex items-center justify-between z-10 relative">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><UsersRound size={14}/> Ativos</span>
          </div>
          <strong className="text-3xl sm:text-4xl font-black text-foreground z-10 relative tracking-tighter">{activeLeads.length}</strong>
        </div>
        
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 md:p-5 flex flex-col gap-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
            <Target size={64} />
          </div>
          <div className="flex items-center justify-between z-10 relative">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5"><Target size={14}/> Prontos</span>
          </div>
          <strong className="text-3xl sm:text-4xl font-black text-foreground z-10 relative tracking-tighter">{qualifiedLeads.length}</strong>
        </div>
        
        <div className="bg-card border border-white/5 rounded-2xl p-4 md:p-5 flex flex-col gap-3 relative overflow-hidden group">
          <div className="flex items-center justify-between z-10 relative">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Clock3 size={14}/> Pendentes</span>
          </div>
          <strong className="text-3xl sm:text-4xl font-black text-foreground z-10 relative tracking-tighter">{incompleteQualifications.length}</strong>
        </div>
        
        <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4 md:p-5 flex flex-col gap-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
            <CircleDollarSign size={64} />
          </div>
          <div className="flex items-center justify-between z-10 relative">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-green-500 flex items-center gap-1.5"><CircleDollarSign size={14}/> No Funil</span>
          </div>
          <strong className="text-3xl sm:text-4xl font-black text-foreground z-10 relative tracking-tighter">{leadsWithOpportunity.length}</strong>
        </div>
      </section>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden gap-6 pb-6 mt-2">
        {renderDataGrid()}
        {renderProfileDrawer()}
      </div>
    </div>
  );
}
`;

fs.appendFileSync('src/pages/Leads.tsx', codeToAppend);
console.log('Appended Leads successfully');
