# Context Schema

Use this schema as the common contract for CRM intelligence features in Funil Imobiliario.

## Input context

```ts
type CrmIntelligenceContext = {
  module:
    | "dashboard"
    | "inbox"
    | "contatos"
    | "leads"
    | "oportunidades"
    | "funil_parceiros"
    | "imoveis"
    | "atendimentos";
  user?: {
    id?: string;
    name?: string;
    role?: "admin" | "gestor" | "corretor" | "atendimento" | "marketing";
  };
  lead?: {
    id?: string;
    nome?: string;
    telefone?: string;
    email?: string;
    canal?: string;
    origem?: string;
    campanha?: string;
    status?: string;
    mensagemInicial?: string;
    criadoEm?: string;
    atualizadoEm?: string;
  };
  atendimento?: {
    id?: string;
    status?: "pendente" | "em_atendimento" | "agendado" | "arquivado";
    tempoEsperaMinutos?: number;
    slaStatus?: "ok" | "atencao" | "critico" | "respondido";
    ultimaInteracao?: string;
    responsavelNome?: string;
  };
  oportunidade?: {
    id?: string;
    pipeline?: "vendas" | "parcerias";
    estagio?: string;
    valorEstimado?: number;
    imovelId?: string;
    notas?: string;
    criadoEm?: string;
    atualizadoEm?: string;
  };
  imovel?: {
    id?: string;
    titulo?: string;
    tipo?: string;
    finalidade?: "venda" | "locacao";
    preco?: number;
    bairro?: string;
    cidade?: string;
    status?: string;
  };
  parceiro?: {
    id?: string;
    nomeEmpresa?: string;
    contato?: string;
    telefone?: string;
    origem?: string;
    status?: string;
  };
  historico?: Array<{
    tipo?: string;
    canal?: string;
    mensagem?: string;
    criadoEm?: string;
  }>;
  metrics?: Record<string, unknown>;
};
```

## Output contract

Use this output shape when the result will be consumed by UI or automation.

```ts
type CrmIntelligenceRecommendation = {
  module: CrmIntelligenceContext["module"];
  summary: string;
  priority: "critica" | "alta" | "media" | "baixa";
  priorityReason: string;
  nextBestAction: string;
  suggestedMessage?: string;
  recommendedStage?: string;
  missingFields: string[];
  risks: string[];
  tasks: string[];
  ui?: {
    surface:
      | "dashboard_agent"
      | "inbox_detail"
      | "lead_drawer"
      | "kanban_card"
      | "atendimento_row"
      | "property_detail"
      | "partner_pipeline";
    label?: string;
    severity?: "neutral" | "warning" | "critical" | "success";
  };
};
```

## Priority rules

- `critica`: SLA critical, direct WhatsApp lead waiting, hot buying intent, visit request, proposal negotiation at risk, or high-value opportunity stalled.
- `alta`: fresh inbound lead, clear interest, campaign lead with phone, partner inquiry with business fit.
- `media`: partial data, ambiguous interest, early qualification, needs enrichment.
- `baixa`: duplicate, archived, no intent, missing contact channel, or passive record.

## Recommended stage mapping

Sales pipeline:

- new inbound lead: `novo_contato`
- first qualification needed: `qualificacao`
- visit requested or ready: `visita`
- proposal requested/sent: `proposta`
- price/payment negotiation: `negociacao`
- closing intent: `fechamento`
- no fit or lost: `perdido`

Partner pipeline:

- new partner inquiry: `novo_parceiro`
- business model discovery: `diagnostico`
- commercial proposal: `proposta_parceria`
- contract/legal: `contrato`
- onboarding: `onboarding`
- active partnership: `parceria_fechada`

