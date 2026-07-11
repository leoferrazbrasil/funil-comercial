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
  // Só mensagens RECEBIDAS ainda não respondidas/resolvidas. Sem o filtro de
  // direção, o painel sugeria "responder" às mensagens que nós mesmos enviamos.
  if (message.direction !== "inbound") return false;
  return (
    message.unread_count > 0 ||
    (message.status !== "Resolvido" && message.status !== "Respondido")
  );
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
  // Não-lidas primeiro; entre iguais, a que aguarda há mais tempo (mais antiga).
  const pendingMessages = snapshot.messages
    .filter(messageNeedsAction)
    .sort((a, b) => {
      const unreadDiff =
        (b.unread_count > 0 ? 1 : 0) - (a.unread_count > 0 ? 1 : 0);
      if (unreadDiff !== 0) return unreadDiff;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
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

  // Entre leads sem oportunidade, prioriza o de maior valor estimado.
  const leadWithoutOpportunity = [...activeLeads]
    .sort((a, b) => b.valor_estimado - a.valor_estimado)
    .find(
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

  // Entre oportunidades sem próxima ação, prioriza a de maior valor.
  const opportunityWithoutAction = [...openOpportunities]
    .sort((a, b) => b.valor - a.valor)
    .find((opportunity) => !opportunity.proxima_acao?.trim());
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
