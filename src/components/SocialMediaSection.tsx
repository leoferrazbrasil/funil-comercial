import { useState } from 'react';
import { 
  CheckCircle2, X, AlertTriangle, LayoutTemplate, Palette, Type, 
  Image as ImageIcon, Grid3X3, Smartphone, CheckSquare, Target,
  MessageSquare, Compass, ShieldCheck, Zap
} from 'lucide-react';
import Logo from './Logo';

export default function SocialMediaSection() {
  const [activeTab, setActiveTab] = useState('estrategia');

  const tabs = [
    { id: 'estrategia', label: 'Estratégia & Pilares' },
    { id: 'visuais', label: 'Regras Visuais' },
    { id: 'formatos', label: 'Formatos & Carrosséis' },
    { id: 'templates', label: 'Templates Editoriais' },
    { id: 'checklist', label: 'Checklist Final' }
  ];

  return (
    <div className="space-y-8 w-full max-w-full overflow-hidden">
      <div>
        <h2 className="text-3xl font-bold mb-2">Guia Editorial (Social Media)</h2>
        <p className="text-muted-foreground">Padrão visual e estratégico para todos os canais digitais do Funil Comercial.</p>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-20 flex overflow-x-auto snap-x border-b border-white/10 bg-background/95 backdrop-blur-md pb-[-1px] scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`snap-start whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === tab.id 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-4 space-y-12 w-full max-w-full">
        {activeTab === 'estrategia' && <TabEstrategia />}
        {activeTab === 'visuais' && <TabVisuais />}
        {activeTab === 'formatos' && <TabFormatos />}
        {activeTab === 'templates' && <TabTemplates />}
        {activeTab === 'checklist' && <TabChecklist />}
      </div>
    </div>
  );
}

function TabEstrategia() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-card/30 p-6 space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <Compass size={24} />
            <h3 className="text-xl font-bold text-foreground">Posicionamento Editorial</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O Funil Comercial é a solução definitiva para a desorganização em vendas B2B. A comunicação deve ser <strong className="text-foreground">moderna, tecnológica, estratégica e profissional</strong>. 
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><strong className="text-foreground">Orientado a Resultados:</strong> Prometemos previsibilidade e conversão, não milagres.</li>
            <li><strong className="text-foreground">Acessível, não simplista:</strong> Explicamos CRM e processos de forma didática, sem perder a autoridade técnica.</li>
            <li><strong className="text-foreground">Comercial, não chato:</strong> Vendemos organização. Toda publicação deve inspirar ação.</li>
          </ul>
        </div>
        
        <div className="rounded-2xl border border-white/5 bg-card/30 p-6 space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <Target size={24} />
            <h3 className="text-xl font-bold text-foreground">Público-Alvo</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Gestores comerciais, diretores de vendas (Head of Sales) e empreendedores B2B que lidam com equipes pequenas a médias, vendas via WhatsApp e ciclos de venda complexos.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold border-b border-white/10 pb-2">Pilares de Conteúdo</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PilarCard 
            title="Educação Comercial" 
            desc="Processos de vendas, organização de leads, gestão de funil." 
            formats="Carrosséis, Posts Educativos"
            cta="Conheça a metodologia."
          />
          <PilarCard 
            title="Produto & Funcionalidades" 
            desc="CRM, Kanban, Atendimento WhatsApp, Automação." 
            formats="Mockups, Vídeos de Tela (Reels)"
            cta="Teste a plataforma."
          />
          <PilarCard 
            title="Produtividade & IA" 
            desc="Como a inteligência artificial ajuda equipes a vender mais rápido." 
            formats="Estatísticas, Carrosséis"
            cta="Automatize seu processo."
          />
          <PilarCard 
            title="Provas Sociais" 
            desc="Casos de uso, depoimentos de gestores que organizaram o caos." 
            formats="Cards estáticos, Vídeos curtos"
            cta="Leia o estudo de caso."
          />
        </div>
      </div>
      
      <div className="space-y-6">
        <h3 className="text-2xl font-bold border-b border-white/10 pb-2">Tom de Voz (Exemplos)</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">
            <div className="flex items-center gap-2 text-green-500 mb-3"><CheckCircle2 size={16}/> <span className="font-bold text-sm">Aprovado</span></div>
            <div className="space-y-3">
              <p className="text-sm border-l-2 border-green-500 pl-3">"Sua equipe de vendas perde 3h por dia procurando informações no WhatsApp. Organize tudo em um funil centralizado."</p>
              <p className="text-sm border-l-2 border-green-500 pl-3">"CRM não precisa ser complexo. Precisa dar previsibilidade comercial."</p>
            </div>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="flex items-center gap-2 text-red-500 mb-3"><X size={16}/> <span className="font-bold text-sm">Evitar</span></div>
            <div className="space-y-3">
              <p className="text-sm border-l-2 border-red-500 pl-3 text-muted-foreground">"Fature 10x mais amanhã instalando nosso sistema mágico." (Promessa irreal)</p>
              <p className="text-sm border-l-2 border-red-500 pl-3 text-muted-foreground">"E aí galeris das vendas, bora bater meta? #Foguete" (Gírias informais)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PilarCard({title, desc, formats, cta}: {title: string, desc: string, formats: string, cta: string}) {
  return (
    <div className="rounded-xl bg-card p-5 border border-white/5 hover:border-white/20 transition-colors flex flex-col">
      <h4 className="font-bold text-primary mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4 flex-1">{desc}</p>
      <div className="space-y-2 border-t border-white/10 pt-4 mt-auto">
        <div className="text-xs"><strong className="text-foreground">Formatos:</strong> <span className="text-muted-foreground">{formats}</span></div>
        <div className="text-xs"><strong className="text-foreground">CTA Típico:</strong> <span className="text-muted-foreground">{cta}</span></div>
      </div>
    </div>
  )
}

function TabVisuais() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="space-y-6">
        <h3 className="text-2xl font-bold border-b border-white/10 pb-2">Hierarquia Tipográfica (Posts)</h3>
        <div className="rounded-3xl border border-white/5 bg-card/30 p-8 space-y-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">H1 - Headline Principal (Capa)</div>
            <div className="text-4xl sm:text-5xl font-black leading-[1.1] mb-2">O fim do caos<br/>no atendimento.</div>
            <p className="text-sm text-muted-foreground">Outfit 900 • Máx 3 linhas • Cor: Branca ou Primary. Evite textos minúsculos.</p>
          </div>
          <div className="border-t border-white/10 pt-8">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">H2 - Subheadline (Contexto)</div>
            <div className="text-2xl font-bold leading-tight mb-2">Transforme seu WhatsApp em uma máquina de vendas previsível.</div>
            <p className="text-sm text-muted-foreground">Outfit 700 ou Inter 600 • Complementa a Headline.</p>
          </div>
          <div className="border-t border-white/10 pt-8">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Corpo de Texto (Carrossel interno)</div>
            <div className="text-lg leading-relaxed text-foreground/80 max-w-2xl mb-2">
              Seus vendedores perdem tempo procurando mensagens antigas. Centralizar as conversas no CRM permite que o gestor tenha visibilidade total das oportunidades.
            </div>
            <p className="text-sm text-muted-foreground">Inter 400/500 • Legibilidade máxima (tamanho min 24px em artes 1080x1350).</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">Aplicação da Paleta</h3>
          <p className="text-sm text-muted-foreground">
            O fundo principal das artes deve ser invariavelmente escuro (<code className="text-foreground">#09090B</code> ou gradientes muito sutis partindo dele).
            O <strong>Mostarda (<code className="text-amber-500">#F59E0B</code>)</strong> é exclusivo para botões de CTA, setas direcionais, palavras em destaque na headline e ícones chave.
          </p>
          <div className="flex gap-4">
            <div className="flex-1 rounded-xl bg-[#09090B] border border-white/10 p-4 aspect-square flex flex-col justify-end">
              <span className="text-xs font-mono text-white/50">#09090B</span>
              <span className="font-bold text-white">Fundo Padrão</span>
            </div>
            <div className="flex-1 rounded-xl bg-amber-500 p-4 aspect-square flex flex-col justify-end">
              <span className="text-xs font-mono text-black/50">#F59E0B</span>
              <span className="font-bold text-black">Destaque</span>
            </div>
            <div className="flex-1 rounded-xl bg-[#121214] p-4 aspect-square flex flex-col justify-end">
              <span className="text-xs font-mono text-white/50">#121214</span>
              <span className="font-bold text-white">Superfície</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">Elementos Gráficos</h3>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-3"><Grid3X3 className="shrink-0 text-primary" size={20}/> <strong>Grids:</strong> Linhas de grade (<code className="text-foreground">border-white/5</code>) sutis ao fundo para transmitir tecnologia e organização.</li>
            <li className="flex gap-3"><Zap className="shrink-0 text-primary" size={20}/> <strong>Glows (Pontos de luz):</strong> Radiais suaves, preferencialmente Verdes ou Mostardas sob elementos de produto (ex: cards).</li>
            <li className="flex gap-3"><ImageIcon className="shrink-0 text-primary" size={20}/> <strong>Fotografias:</strong> Sempre em P&B com contraste alto ou imersas na escuridão, para não conflitar com a UI. Evite fotos genéricas de banco de imagens "sorrindo para o laptop".</li>
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold border-b border-white/10 pb-2">Uso da Logo em Artes</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/5 bg-card/30 p-6 flex flex-col items-center justify-center gap-6">
            <Logo iconSize={32} />
            <p className="text-xs text-center text-muted-foreground">Assinatura padrão (canto inferior direito ou superior esquerdo). Versão completa.</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-card/30 p-6 flex flex-col items-center justify-center gap-6">
            <Logo variant="icon-only" iconSize={32} />
            <p className="text-xs text-center text-muted-foreground">Para cards internos de carrossel onde o espaço é limitado. Símbolo isolado.</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}

function TabFormatos() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-card p-6 border border-white/5">
          <h3 className="font-bold text-lg mb-2">Feed Padrão (Recomendado)</h3>
          <div className="text-xs font-mono text-primary bg-primary/10 w-fit px-2 py-1 rounded mb-4">4:5 (1080 x 1350px)</div>
          <p className="text-sm text-muted-foreground mb-4">O formato oficial para todo conteúdo estático e carrosséis. Ocupa o máximo de tela possível sem ser cortado no feed principal.</p>
          <div className="aspect-[4/5] bg-background border border-dashed border-white/20 rounded-lg flex items-center justify-center text-muted-foreground text-xs font-mono">4:5</div>
        </div>
        <div className="rounded-2xl bg-card p-6 border border-white/5">
          <h3 className="font-bold text-lg mb-2">Reels / Stories</h3>
          <div className="text-xs font-mono text-primary bg-primary/10 w-fit px-2 py-1 rounded mb-4">9:16 (1080 x 1920px)</div>
          <p className="text-sm text-muted-foreground mb-4">Para conteúdos em vídeo e demonstrações rápidas do produto. Cuidado com a Safe Zone nativa da plataforma.</p>
          <div className="aspect-[9/16] bg-background border border-dashed border-white/20 rounded-lg flex items-center justify-center text-muted-foreground text-xs font-mono">9:16</div>
        </div>
        <div className="rounded-2xl bg-card p-6 border border-white/5">
          <h3 className="font-bold text-lg mb-2">Estático de Conversão</h3>
          <div className="text-xs font-mono text-primary bg-primary/10 w-fit px-2 py-1 rounded mb-4">1:1 (1080 x 1080px)</div>
          <p className="text-sm text-muted-foreground mb-4">Usado estritamente para anúncios patrocinados (Tráfego Pago) em redes de display onde 4:5 não tem suporte total.</p>
          <div className="aspect-square bg-background border border-dashed border-white/20 rounded-lg flex items-center justify-center text-muted-foreground text-xs font-mono">1:1</div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold border-b border-white/10 pb-2">Margens de Segurança (Safe Zones)</h3>
        <p className="text-sm text-muted-foreground mb-4">Não permita que o grid do Instagram (que exibe apenas 1:1) corte partes críticas das Headlines em artes 4:5.</p>
        
        <div className="rounded-3xl border border-white/5 bg-card/30 p-8 flex justify-center">
          {/* Safezone Visualizer */}
          <div className="w-[300px] h-[375px] bg-[#09090B] border border-white/20 relative rounded-md overflow-hidden flex items-center justify-center">
            {/* 1:1 Safe zone indicator */}
            <div className="w-full h-[300px] border-y border-dashed border-amber-500/50 bg-amber-500/5 relative flex flex-col justify-between p-6">
               <div className="w-full h-8 bg-white/10 rounded flex items-center px-2"><span className="text-[10px] text-white">Headline Principal</span></div>
               <div className="w-full h-24 bg-white/5 rounded mt-2 border border-white/10 flex items-center justify-center text-[10px] text-white/50">Elemento Central</div>
               <div className="flex justify-between items-end mt-auto">
                 <Logo variant="icon-only" iconSize={16}/>
                 <div className="text-[8px] bg-primary text-black px-2 py-1 rounded-sm font-bold">CTA</div>
               </div>
               
               <div className="absolute right-2 top-2 text-[8px] text-amber-500 font-mono">Área segura do Feed (1:1)</div>
            </div>
            
            {/* Danger zones */}
            <div className="absolute top-0 w-full h-[37.5px] bg-red-500/20 border-b border-red-500/50 flex items-center justify-center">
               <span className="text-[8px] text-red-300 font-mono text-center">Área de corte do feed (não coloque texto vital)</span>
            </div>
            <div className="absolute bottom-0 w-full h-[37.5px] bg-red-500/20 border-t border-red-500/50 flex items-center justify-center">
               <span className="text-[8px] text-red-300 font-mono text-center">Área de corte do feed (não coloque texto vital)</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function TabTemplates() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="space-y-6">
        <h3 className="text-2xl font-bold border-b border-white/10 pb-2">Estrutura de Carrossel (O Padrão Ouro)</h3>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Os carrosséis são a principal ferramenta de retenção e educação. Cada slide deve ter uma função editorial exata. 
          Recomendamos de 5 a 10 slides.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 overflow-x-auto pb-4">
          <SlideTemplate 
            num="1" 
            title="A Capa (Gancho)" 
            desc="Headline chocante ou contra-intuitiva. Muito respiro visual. Mantenha o texto centralizado ou forte à esquerda."
          />
          <SlideTemplate 
            num="2" 
            title="Contexto (A Dor)" 
            desc="Valide o problema. Ex: 'Seus leads esfriam porque seu time demora 4h para responder'."
          />
          <SlideTemplate 
            num="3-7" 
            title="Desenvolvimento" 
            desc="Explicação técnica, visualizações da UI da plataforma, diagramas de funil. 1 conceito por slide."
          />
          <SlideTemplate 
            num="Fim" 
            title="A Chamada (CTA)" 
            desc="Resumo da solução + Ação clara. Ex: 'Acesse o link e organize sua operação'. Logo maior."
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold border-b border-white/10 pb-2">Práticas Evitadas (Hall of Shame)</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 space-y-4">
            <h4 className="font-bold text-red-400">Excesso de Texto</h4>
            <div className="aspect-[4/5] bg-card border border-white/10 rounded-lg p-4 flex flex-col gap-1 overflow-hidden opacity-70">
              <div className="h-4 bg-white/20 w-3/4 mb-2"></div>
              {Array.from({length: 15}).map((_, i) => <div key={i} className="h-1.5 bg-white/10 w-full"></div>)}
            </div>
            <p className="text-xs text-muted-foreground">Transformar o card em um livro. Reduza para tópicos curtos.</p>
          </div>
          
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 space-y-4">
            <h4 className="font-bold text-red-400">Hierarquia Plana</h4>
            <div className="aspect-[4/5] bg-card border border-white/10 rounded-lg p-4 flex flex-col gap-2 justify-center opacity-70">
              <div className="h-3 bg-white/20 w-full"></div>
              <div className="h-3 bg-white/20 w-full"></div>
              <div className="h-3 bg-white/20 w-full"></div>
              <div className="h-3 bg-white/20 w-full"></div>
            </div>
            <p className="text-xs text-muted-foreground">Headline e corpo de texto com tamanhos parecidos. Falta contraste.</p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 space-y-4">
            <h4 className="font-bold text-red-400">Desalinhamento</h4>
            <div className="aspect-[4/5] bg-card border border-white/10 rounded-lg p-4 flex flex-col gap-4 opacity-70 relative">
              <div className="h-4 bg-white/20 w-1/2 ml-4"></div>
              <div className="h-20 bg-white/5 border border-white/10 w-3/4 absolute right-2 top-1/2 -translate-y-1/2"></div>
              <div className="h-2 bg-white/20 w-1/3 mt-auto mb-2 text-center"></div>
            </div>
            <p className="text-xs text-muted-foreground">Falta de grid. Elementos jogados de forma arbitrária sem alinhamento lateral.</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}

function SlideTemplate({num, title, desc}: {num: string, title: string, desc: string}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#121214] p-4 flex flex-col">
      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-sm mb-4">{num}</div>
      <h4 className="font-bold text-sm text-foreground mb-2">{title}</h4>
      <p className="text-xs text-muted-foreground leading-relaxed flex-1">{desc}</p>
      
      <div className="mt-4 aspect-[4/5] bg-[#09090B] border border-white/5 rounded flex flex-col p-3">
        {num === '1' && (
           <div className="mt-8 space-y-1">
             <div className="h-3 w-4/5 bg-white rounded"></div>
             <div className="h-3 w-3/4 bg-white rounded"></div>
             <div className="h-3 w-2/3 bg-primary rounded"></div>
           </div>
        )}
        {num === '2' && (
           <div className="mt-4 space-y-2">
             <div className="h-2 w-1/2 bg-white/50 rounded mb-4"></div>
             <div className="h-1.5 w-full bg-white/20 rounded"></div>
             <div className="h-1.5 w-full bg-white/20 rounded"></div>
             <div className="h-1.5 w-3/4 bg-white/20 rounded"></div>
           </div>
        )}
        {num === '3-7' && (
           <div className="h-full flex flex-col justify-center">
             <div className="w-full h-1/2 bg-white/5 border border-white/10 rounded mb-2"></div>
             <div className="h-1.5 w-full bg-white/20 rounded mt-2"></div>
           </div>
        )}
        {num === 'Fim' && (
           <div className="h-full flex flex-col items-center justify-center gap-4">
             <div className="w-12 h-12 bg-white/10 rounded-full"></div>
             <div className="h-6 w-3/4 bg-primary rounded"></div>
           </div>
        )}
      </div>
    </div>
  )
}


function TabChecklist() {
  const checks = [
    "A arte está no formato 4:5 (ou correspondente ao canal)?",
    "A headline e textos críticos respeitam a margem de segurança do Feed 1:1?",
    "A logo foi aplicada sem distorções, com clear space e cores originais?",
    "A família tipográfica (Outfit / Inter) foi usada corretamente?",
    "Existe contraste adequado (textos legíveis sobre fundos escuros)?",
    "A hierarquia está clara? (O olho vai da Headline -> Subheadline -> Imagem -> CTA)?",
    "Há respiro visual? (Bordas e elementos não estão se esmagando)?",
    "Foi utilizado um grid coerente para alinhar os elementos?",
    "O tom de voz é profissional, direto e comercial?",
    "O texto foi revisado (ortografia, concordância, dupla checagem)?",
    "Existe apenas uma Call to Action (CTA) forte no final?",
    "Imagens e mockups de tela possuem boa resolução e estilo consistente?",
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-3xl">
        <p className="text-muted-foreground leading-relaxed mb-8">
          Antes de exportar e publicar qualquer material, valide o design e o conteúdo com as regras abaixo. Nenhuma publicação deve ir para o ar se algum destes pontos falhar.
        </p>
        
        <div className="space-y-2 bg-card/30 border border-white/5 rounded-2xl p-6">
          {checks.map((check, i) => (
            <label key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
              <div className="mt-0.5 shrink-0 w-5 h-5 rounded border border-white/20 flex items-center justify-center text-transparent group-hover:border-primary group-active:scale-95 transition-all">
                <CheckSquare size={14} className="text-primary opacity-0 group-hover:opacity-50" />
              </div>
              <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">{check}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
