import type { CrmSnapshot, InboxMessage, Lead, Opportunity } from "../lib/types";

export type CommercialPriority = "critica" | "alta" | "media" | "baixa";

export type CommercialRecommendation = {
  id: string;
  title: string;
  summary: string;
  priority: CommercialPriority;
  reason: string;
  nextAction: string;
};

const priorityLabel: Record<CommercialPriority, string> = {
  critica: "Critica",
  alta: "Alta",
  media: "Media",
  baixa: "Baixa",
};

export function formatPriority(priority: CommercialPriority) {
  return priorityLabel[priority];
}

function messageNeedsAction(message: InboxMessage) {
  return message.unread_count > 0 || message.status !== "Resolvido";
}

function leadIsActive(lead: Lead) {
  return !["convertido", "perdido"].includes(lead.status);
}

function opportunityIsOpen(opportunity: Opportunity) {
  return !["Ganho", "Perdido"].includes(opportunity.etapa);
}

export function buildCommercialRecommendations(
  snapshot: CrmSnapshot,
): CommercialRecommendation[] {
  const pendingMessages = snapshot.messages.filter(messageNeedsAction);
  const activeLeads = snapshot.leads.filter(leadIsActive);
  const openOpportunities = snapshot.opportunities.filter(opportunityIsOpen);
  const recommendations: CommercialRecommendation[] = [];

  if (pendingMessages.length > 0) {
    const first = pendingMessages[0];
    recommendations.push({
      id: `inbox-${first.id}`,
      title: `Responder ${first.remetente_nome}`,
      summary: first.mensagem,
      priority: pendingMessages.length >= 3 ? "critica" : "alta",
      reason: `${pendingMessages.length} conversa(s) aguardando acao.`,
      nextAction: "Abrir inbox, responder e qualificar a necessidade.",
    });
  }

  const leadWithoutOpportunity = activeLeads.find(
    (lead) => !snapshot.opportunities.some((item) => item.lead_id === lead.id),
  );
  if (leadWithoutOpportunity) {
    recommendations.push({
      id: `lead-${leadWithoutOpportunity.id}`,
      title: `Qualificar ${leadWithoutOpportunity.nome}`,
      summary: leadWithoutOpportunity.proxima_acao,
      priority: "media",
      reason: "Lead ativo ainda sem oportunidade vinculada.",
      nextAction: "Validar interesse e criar oportunidade no funil.",
    });
  }

  const opportunityWithoutAction = openOpportunities.find(
    (opportunity) => !opportunity.proxima_acao?.trim(),
  );
  if (opportunityWithoutAction) {
    recommendations.push({
      id: `opportunity-${opportunityWithoutAction.id}`,
      title: `Definir proxima acao de ${opportunityWithoutAction.titulo}`,
      summary: `Etapa atual: ${opportunityWithoutAction.etapa}.`,
      priority: "alta",
      reason: "Oportunidade aberta sem proximo passo claro.",
      nextAction: "Registrar follow-up, proposta ou compromisso comercial.",
    });
  }

  if (recommendations.length === 0 && openOpportunities.length > 0) {
    recommendations.push({
      id: "pipeline-review",
      title: "Revisar pipeline aberto",
      summary: "O funil tem oportunidades em andamento e sem alerta critico.",
      priority: "baixa",
      reason: "Operacao sem pendencias urgentes detectadas.",
      nextAction: "Conferir etapas e antecipar proximos contatos.",
    });
  }

  return recommendations.slice(0, 4);
}
