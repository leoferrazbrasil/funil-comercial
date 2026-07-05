const fs = require('fs');

const codeToAppend = `
// --- DASHBOARD UI COMPONENTS ---

function StatCard({ title, value, icon: Icon, tone = "neutral", actionLabel, onAction, emptyState }: any) {
  const tones = {
    neutral: "text-foreground",
    success: "text-green-500",
    warning: "text-amber-500",
    danger: "text-red-500",
  };
  const bgTones = {
    neutral: "bg-white/5",
    success: "bg-green-500/10",
    warning: "bg-amber-500/10",
    danger: "bg-red-500/10",
  };

  return (
    <div className="flex flex-col rounded-3xl border border-white/5 bg-card p-6 shadow-sm relative overflow-hidden group transition-all hover:border-white/10 hover:bg-white/[0.02]">
      <div className="flex items-start justify-between mb-4">
        <div className={\`p-3 rounded-2xl \${bgTones[tone]}\`}>
          <Icon size={24} className={tones[tone]} strokeWidth={1.5} />
        </div>
        {actionLabel && (
          <button onClick={onAction} className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline">
            {actionLabel}
          </button>
        )}
      </div>
      <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
      <div className="text-3xl font-bold tracking-tight mb-2">{value}</div>
      <div className="text-xs text-muted-foreground/50 border-t border-white/5 pt-3 mt-auto">
        {emptyState}
      </div>
    </div>
  );
}

function PriorityTaskCard({ task, onAction }: { task: any, onAction: () => void }) {
  const isHigh = task.priority === "Alta";
  return (
    <div className={\`flex items-start gap-4 p-5 rounded-2xl border \${isHigh ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5 bg-white/[0.02]'} transition-colors hover:border-primary/50\`}>
      <div className={\`mt-0.5 flex-shrink-0 w-2.5 h-2.5 rounded-full \${isHigh ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-primary'}\`} />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground mb-1 truncate">{task.title}</h4>
        <p className="text-xs text-muted-foreground line-clamp-2">{task.summary || task.description}</p>
      </div>
      <button 
        onClick={onAction}
        className="flex-shrink-0 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
        title="Agir agora"
      >
        <MoveRight size={16} />
      </button>
    </div>
  );
}

function FunnelChart({ opportunities, stages }: { opportunities: Opportunity[], stages: OpportunityStage[] }) {
  const stageData = stages.slice(0, 6).map(stage => {
    const opps = opportunities.filter(o => o.etapa === stage);
    const count = opps.length;
    const value = opps.reduce((sum, o) => sum + Number(o.valor), 0);
    return { stage, count, value };
  });

  const maxCount = Math.max(...stageData.map(d => d.count), 1);

  return (
    <div className="flex flex-col gap-4">
      {stageData.map((data, idx) => {
        const percentage = Math.max((data.count / maxCount) * 100, 2); // Min 2% to show the bar
        const isFirst = idx === 0;
        const isLast = idx === stageData.length - 1;
        
        return (
          <div key={data.stage} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-end text-xs">
              <span className="font-medium text-muted-foreground">{data.stage}</span>
              <span className="text-foreground font-semibold">{data.count} <span className="opacity-50 text-[10px] ml-1">({formatMoney(data.value)})</span></span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden">
              <div 
                className={\`h-full rounded-full transition-all duration-1000 ease-out \${isFirst ? 'bg-white/20' : isLast ? 'bg-green-500' : 'bg-primary'}\`}
                style={{ width: \`\${percentage}%\` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard({
  snapshot,
  onOpenModal,
}: {
  snapshot: CrmSnapshot;
  onOpenModal: (modal: ModalType) => void;
}) {
  const activeLeads = snapshot.leads.filter(
    (lead) => !["convertido", "perdido"].includes(lead.status),
  );
  const openPipeline = snapshot.opportunities
    .filter((item) => !["Ganho", "Perdido"].includes(item.etapa))
    .reduce((sum, item) => sum + Number(item.valor), 0);
  const conversionRate = snapshot.leads.length
    ? Math.round((snapshot.opportunities.length / snapshot.leads.length) * 100)
    : 0;
  
  // Urgent Messages (Inbox)
  const pendingMessages = snapshot.messages.filter(
    (message) => message.unread_count > 0 || message.status !== "Resolvido",
  );

  const recommendations = buildCommercialRecommendations(snapshot);
  
  // Sort recent opportunities
  const recentOpportunities = [...snapshot.opportunities]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto pb-12">
      
      {/* 1. HEADER & Z-PATTERN TOP */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Visão Geral</h1>
          <p className="text-muted-foreground">Aqui está o resumo da sua operação neste momento.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-white/5 rounded-2xl px-4 py-2 text-sm text-muted-foreground mr-2 cursor-not-allowed opacity-50" title="Filtro temporal em breve">
            <Calendar size={16} />
            <span>Este mês</span>
          </div>
          <button onClick={() => onOpenModal("lead")} className="button button-primary">
            <Plus size={18} /> Novo Lead
          </button>
          <button onClick={() => onOpenModal("opportunity")} className="button button-outline hidden md:flex">
            Nova Oportunidade
          </button>
        </div>
      </header>

      {/* 2. KPIs (PULSO DA OPERAÇÃO) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Atenção Necessária" 
          value={String(pendingMessages.length)} 
          icon={Bell} 
          tone={pendingMessages.length > 0 ? "warning" : "success"}
          actionLabel="Ver Inbox"
          onAction={() => onOpenModal("message")}
          emptyState="Conversas pendentes no inbox."
        />
        <StatCard 
          title="Leads Ativos" 
          value={String(activeLeads.length)} 
          icon={UsersRound} 
          tone="neutral"
          emptyState="Histórico de tendência indisponível."
        />
        <StatCard 
          title="Pipeline Aberto" 
          value={formatMoney(openPipeline)} 
          icon={CircleDollarSign} 
          tone="neutral"
          emptyState="Oportunidades ativas no funil."
        />
        <StatCard 
          title="Taxa de Conversão" 
          value={\`\${conversionRate}%\`} 
          icon={Target} 
          tone="success"
          emptyState="Histórico de tendência indisponível."
        />
      </section>

      {/* 3. EXECUÇÃO E ANÁLISE (GRID 2/3 + 1/3) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLUNA PRINCIPAL (65%) */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          
          {/* Prioridades do Dia */}
          <div className="flex flex-col rounded-3xl border border-white/5 bg-card overflow-hidden shadow-lg">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Sparkles size={20} />
                </div>
                <h2 className="text-xl font-bold">Inteligência Comercial</h2>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 text-muted-foreground">Prioridades do dia</span>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              {recommendations.length > 0 ? (
                recommendations.slice(0, 5).map((rec) => (
                  <PriorityTaskCard 
                    key={rec.id} 
                    task={rec} 
                    onAction={() => onOpenModal("message")} 
                  />
                ))
              ) : (
                <EmptyState
                  action="Cadastrar Lead"
                  description="Você está sem tarefas pendentes. Cadastre um novo lead para gerar ações."
                  onAction={() => onOpenModal("lead")}
                />
              )}
            </div>
          </div>

          {/* Saúde do Funil */}
          <div className="flex flex-col rounded-3xl border border-white/5 bg-card overflow-hidden shadow-lg">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold mb-1">Saúde do Funil</h2>
              <p className="text-sm text-muted-foreground">Distribuição atual de volume e receita esperada.</p>
            </div>
            <div className="p-8">
               <FunnelChart opportunities={snapshot.opportunities} stages={stages} />
            </div>
          </div>

        </div>

        {/* COLUNA SECUNDÁRIA (35%) */}
        <div className="flex flex-col gap-8">
          
          {/* Oportunidades Recentes */}
          <div className="flex flex-col rounded-3xl border border-white/5 bg-card overflow-hidden shadow-lg">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Oportunidades Recentes</h2>
              <button onClick={() => onOpenModal("opportunity")} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <Plus size={16} />
              </button>
            </div>
            <div className="p-0">
              {recentOpportunities.length > 0 ? (
                <div className="flex flex-col divide-y divide-white/5">
                  {recentOpportunities.map(opp => (
                    <div key={opp.id} className="p-5 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground border border-white/10 group-hover:border-primary/50 transition-colors">
                          <CircleDollarSign size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm line-clamp-1">{opp.titulo}</p>
                          <p className="text-xs text-muted-foreground">{opp.etapa}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-green-500">{formatMoney(Number(opp.valor))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8">
                  <EmptyState action="Criar Oportunidade" description="Nenhuma oportunidade criada recentemente." onAction={() => onOpenModal("opportunity")} />
                </div>
              )}
            </div>
            <div className="p-4 border-t border-white/5 bg-black/20 text-center">
              <button className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">Ver todo o funil</button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});
`;

fs.appendFileSync('src/pages/Dashboard.tsx', codeToAppend);
console.log('Appended successfully');
