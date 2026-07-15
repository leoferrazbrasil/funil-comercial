import { effectiveValue, monthlyForProduct, priceForProduct, type Product } from "./products";
import type { CrmSnapshot, Lead, Opportunity } from "./types";

export type MetricStatus = "ok" | "insufficient";

export type RateMetric = {
  value: number | null;
  status: MetricStatus;
};

export type DashboardRealMetrics = {
  currentMonth: {
    contacts: number;
    leads: number;
    leadsFromContacts: number;
    wonSales: number;
    cashRealized: number;
    newMrr: number;
  };
  rates: {
    contactToLead: RateMetric;
    leadToSale: RateMetric;
    contactToSale: RateMetric;
    contactsPerSale: RateMetric;
  };
};

export type GoalProjectionInput = {
  monthlyCashGoal: number;
  setupTicket: number;
  mrrPerSale: number;
  contactToLeadRate: number | null;
  leadToSaleRate: number | null;
  contactsRealized?: number;
  now: Date;
};

export type GoalProjectionStatus = "ok" | "needs_rates" | "unreachable" | "invalid_ticket";

export type GoalProjection = {
  status: GoalProjectionStatus;
  salesNeeded: number | null;
  leadsNeeded: number | null;
  contactsNeeded: number | null;
  contactsRemaining: number | null;
  contactsNeededToday: number | null;
  contactsPerSale: number | null;
  contactsPerBusinessDayRemaining: number | null;
  cashProjected: number;
  newMrrProjected: number;
  businessDaysRemaining: number;
};

export function clampRate(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function isInRange(dateString: string, start: Date, end: Date) {
  const date = new Date(dateString);
  return date >= start && date <= end;
}

function safeRate(numerator: number, denominator: number): RateMetric {
  if (denominator <= 0) return { value: null, status: "insufficient" };
  return { value: numerator / denominator, status: "ok" };
}

function wonThisMonth(opportunity: Opportunity) {
  return opportunity.etapa === "Ganho";
}

function leadHasCurrentMonthContact(lead: Lead, currentMonthContactIds: Set<string>) {
  return Boolean(lead.contact_id && currentMonthContactIds.has(lead.contact_id));
}

export function countBusinessDaysInclusive(start: Date, end: Date) {
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const final = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  let count = 0;

  while (cursor <= final) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }

  return count;
}

export function calculateDashboardRealMetrics(
  snapshot: CrmSnapshot,
  now: Date,
): DashboardRealMetrics {
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const currentMonthContacts = snapshot.contacts.filter((contact) =>
    isInRange(contact.created_at, monthStart, monthEnd),
  );
  const currentMonthContactIds = new Set(currentMonthContacts.map((contact) => contact.id));
  const currentMonthLeads = snapshot.leads.filter((lead) =>
    isInRange(lead.created_at, monthStart, monthEnd),
  );
  const currentMonthLeadIds = new Set(currentMonthLeads.map((lead) => lead.id));
  const currentMonthWonOpportunities = snapshot.opportunities.filter(
    (opportunity) =>
      wonThisMonth(opportunity) && isInRange(opportunity.created_at, monthStart, monthEnd),
  );
  const leadsFromContacts = currentMonthLeads.filter((lead) =>
    leadHasCurrentMonthContact(lead, currentMonthContactIds),
  ).length;
  const contactsConvertedToLeadIds = new Set(
    currentMonthLeads
      .filter((lead) => leadHasCurrentMonthContact(lead, currentMonthContactIds))
      .map((lead) => lead.contact_id as string),
  );
  const convertedLeadIds = new Set(
    currentMonthWonOpportunities
      .map((opportunity) => opportunity.lead_id)
      .filter(
        (leadId): leadId is string =>
          Boolean(leadId) && currentMonthLeadIds.has(leadId),
      ),
  );
  const convertedCurrentMonthContacts = new Set(
    currentMonthLeads
      .filter(
        (lead) =>
          convertedLeadIds.has(lead.id) &&
          lead.contact_id &&
          currentMonthContactIds.has(lead.contact_id),
      )
      .map((lead) => lead.contact_id as string),
  );
  const cashRealized = currentMonthWonOpportunities.reduce(
    (sum, opportunity) => sum + effectiveValue(opportunity.valor, opportunity.produto),
    0,
  );
  const newMrr = currentMonthWonOpportunities.reduce(
    (sum, opportunity) => sum + monthlyForProduct(opportunity.produto),
    0,
  );

  return {
    currentMonth: {
      contacts: currentMonthContacts.length,
      leads: currentMonthLeads.length,
      leadsFromContacts,
      wonSales: currentMonthWonOpportunities.length,
      cashRealized,
      newMrr,
    },
    rates: {
      contactToLead: safeRate(contactsConvertedToLeadIds.size, currentMonthContacts.length),
      leadToSale: safeRate(convertedLeadIds.size, currentMonthLeads.length),
      contactToSale: safeRate(convertedCurrentMonthContacts.size, currentMonthContacts.length),
      contactsPerSale: safeRate(currentMonthContacts.length, convertedCurrentMonthContacts.size),
    },
  };
}

export function calculateGoalProjection(input: GoalProjectionInput): GoalProjection {
  const monthlyCashGoal = Math.max(0, Number(input.monthlyCashGoal) || 0);
  const setupTicket = Math.max(0, Number(input.setupTicket) || 0);
  const mrrPerSale = Math.max(0, Number(input.mrrPerSale) || 0);
  const businessDaysRemaining = countBusinessDaysInclusive(input.now, endOfMonth(input.now));

  if (setupTicket <= 0) {
    return {
      status: "invalid_ticket",
      salesNeeded: null,
      leadsNeeded: null,
      contactsNeeded: null,
      contactsRemaining: null,
      contactsNeededToday: null,
      contactsPerSale: null,
      contactsPerBusinessDayRemaining: null,
      cashProjected: 0,
      newMrrProjected: 0,
      businessDaysRemaining,
    };
  }

  const salesNeeded = Math.max(1, Math.ceil(monthlyCashGoal / setupTicket));
  const cashProjected = salesNeeded * setupTicket;
  const newMrrProjected = salesNeeded * mrrPerSale;

  if (input.contactToLeadRate === null || input.leadToSaleRate === null) {
    return {
      status: "needs_rates",
      salesNeeded,
      leadsNeeded: null,
      contactsNeeded: null,
      contactsRemaining: null,
      contactsNeededToday: null,
      contactsPerSale: null,
      contactsPerBusinessDayRemaining: null,
      cashProjected,
      newMrrProjected,
      businessDaysRemaining,
    };
  }

  const contactToLeadRate = clampRate(input.contactToLeadRate);
  const leadToSaleRate = clampRate(input.leadToSaleRate);

  if (contactToLeadRate <= 0 || leadToSaleRate <= 0) {
    return {
      status: "unreachable",
      salesNeeded,
      leadsNeeded: null,
      contactsNeeded: null,
      contactsRemaining: null,
      contactsNeededToday: null,
      contactsPerSale: null,
      contactsPerBusinessDayRemaining: null,
      cashProjected,
      newMrrProjected,
      businessDaysRemaining,
    };
  }

  const leadsNeeded = Math.ceil(salesNeeded / leadToSaleRate);
  const contactsNeeded = Math.ceil(leadsNeeded / contactToLeadRate);
  const contactsRealized = Math.max(0, Number(input.contactsRealized) || 0);
  const contactsRemaining = Math.max(0, contactsNeeded - contactsRealized);
  const contactsNeededToday =
    businessDaysRemaining > 0 ? Math.ceil(contactsRemaining / businessDaysRemaining) : null;

  return {
    status: "ok",
    salesNeeded,
    leadsNeeded,
    contactsNeeded,
    contactsRemaining,
    contactsNeededToday,
    contactsPerSale: contactsNeeded / salesNeeded,
    contactsPerBusinessDayRemaining: contactsNeededToday,
    cashProjected,
    newMrrProjected,
    businessDaysRemaining,
  };
}

export function pricingForGoalProduct(product: Product) {
  return {
    setupTicket: priceForProduct(product) ?? 0,
    mrrPerSale: monthlyForProduct(product),
  };
}
