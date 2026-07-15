import { describe, expect, it } from "vitest";
import {
  calculateDashboardRealMetrics,
  calculateGoalProjection,
  clampRate,
  countBusinessDaysInclusive,
} from "./dashboardMetrics";
import type { Contact, CrmSnapshot, Lead, Opportunity } from "./types";

const ownerId = "owner-1";
const now = new Date("2026-07-14T12:00:00-03:00");

function contact(id: string, created_at = "2026-07-14T09:00:00-03:00"): Contact {
  return {
    id,
    owner_id: ownerId,
    nome: `Contato ${id}`,
    telefone: `55119999999${id}`,
    email: null,
    origem: "Manual",
    potencial: "Novo",
    site: null,
    instagram: null,
    linkedin: null,
    created_at,
  };
}

function lead(
  id: string,
  contact_id: string | null,
  created_at = "2026-07-14T10:00:00-03:00",
): Lead {
  return {
    id,
    owner_id: ownerId,
    contact_id,
    nome: `Lead ${id}`,
    telefone: `55118888888${id}`,
    email: null,
    interesse: "Site",
    status: "qualificado",
    valor_estimado: 497,
    proxima_acao: "Enviar proposta",
    origem: "Manual",
    created_at,
  };
}

function opportunity(
  id: string,
  lead_id: string | null,
  etapa: Opportunity["etapa"],
  produto: Opportunity["produto"] = "Site / Landing Page",
  valor = 497,
  created_at = "2026-07-14T11:00:00-03:00",
): Opportunity {
  return {
    id,
    owner_id: ownerId,
    lead_id,
    titulo: `Oportunidade ${id}`,
    etapa,
    valor,
    responsavel: "Equipe comercial",
    proxima_acao: "Onboarding",
    produto,
    motivo_perda: null,
    created_at,
  };
}

function snapshot(partial: Partial<CrmSnapshot>): CrmSnapshot {
  return {
    profile: null,
    contacts: [],
    leads: [],
    opportunities: [],
    messages: [],
    channels: [],
    ...partial,
  };
}

describe("calculateDashboardRealMetrics", () => {
  it("calculates contacts per sale from 17 current-month contacts and 1 won sale", () => {
    const contacts = Array.from({ length: 17 }, (_, index) => contact(String(index + 1)));
    const leads = [lead("lead-1", "1")];
    const opportunities = [opportunity("opp-1", "lead-1", "Ganho")];

    const metrics = calculateDashboardRealMetrics(
      snapshot({ contacts, leads, opportunities }),
      now,
    );

    expect(metrics.currentMonth.contacts).toBe(17);
    expect(metrics.currentMonth.leads).toBe(1);
    expect(metrics.currentMonth.wonSales).toBe(1);
    expect(metrics.currentMonth.cashRealized).toBe(497);
    expect(metrics.currentMonth.newMrr).toBe(37.9);
    expect(metrics.rates.contactsPerSale.value).toBe(17);
    expect(metrics.rates.contactToSale.value).toBeCloseTo(1 / 17, 6);
  });

  it("ignores records outside the current month", () => {
    const metrics = calculateDashboardRealMetrics(
      snapshot({
        contacts: [contact("old", "2026-06-30T23:59:00-03:00"), contact("new")],
        leads: [lead("old-lead", "old", "2026-06-30T23:59:00-03:00"), lead("new-lead", "new")],
        opportunities: [
          opportunity("old-opp", "old-lead", "Ganho", "Site / Landing Page", 497, "2026-06-30T23:59:00-03:00"),
          opportunity("new-opp", "new-lead", "Ganho"),
        ],
      }),
      now,
    );

    expect(metrics.currentMonth.contacts).toBe(1);
    expect(metrics.currentMonth.leads).toBe(1);
    expect(metrics.currentMonth.wonSales).toBe(1);
    expect(metrics.currentMonth.cashRealized).toBe(497);
  });

  it("returns insufficient rate states instead of Infinity or NaN", () => {
    const metrics = calculateDashboardRealMetrics(snapshot({}), now);

    expect(metrics.rates.contactToLead.status).toBe("insufficient");
    expect(metrics.rates.leadToSale.status).toBe("insufficient");
    expect(metrics.rates.contactToSale.status).toBe("insufficient");
    expect(metrics.rates.contactsPerSale.status).toBe("insufficient");
    expect(metrics.rates.contactsPerSale.value).toBeNull();
  });

  it("counts lead-to-sale conversion from linked current-month leads only", () => {
    const metrics = calculateDashboardRealMetrics(
      snapshot({
        contacts: [contact("1"), contact("2"), contact("3")],
        leads: [
          lead("converted-lead", "1"),
          lead("open-lead", "2"),
          lead("old-lead", "3", "2026-06-30T23:59:00-03:00"),
        ],
        opportunities: [
          opportunity("linked-sale", "converted-lead", "Ganho"),
          opportunity("duplicate-sale", "converted-lead", "Ganho"),
          opportunity("unlinked-sale", null, "Ganho"),
          opportunity("old-lead-sale", "old-lead", "Ganho"),
          opportunity("open-opp", "open-lead", "Proposta"),
        ],
      }),
      now,
    );

    expect(metrics.currentMonth.wonSales).toBe(4);
    expect(metrics.rates.leadToSale.value).toBe(0.5);
    expect(metrics.rates.contactToSale.value).toBeCloseTo(1 / 3, 6);
    expect(metrics.rates.contactsPerSale.value).toBe(3);
  });

  it("calculates contact-to-lead conversion from unique contacts", () => {
    const metrics = calculateDashboardRealMetrics(
      snapshot({
        contacts: [contact("1")],
        leads: [lead("lead-1", "1"), lead("lead-2", "1")],
      }),
      now,
    );

    expect(metrics.currentMonth.leadsFromContacts).toBe(2);
    expect(metrics.rates.contactToLead.value).toBe(1);
  });
});

describe("calculateGoalProjection", () => {
  it("requires 11 site sales for a R$5,000 cash goal and projects R$416.90 new MRR", () => {
    const projection = calculateGoalProjection({
      monthlyCashGoal: 5000,
      setupTicket: 497,
      mrrPerSale: 37.9,
      contactToLeadRate: 1,
      leadToSaleRate: 1,
      now,
    });

    expect(projection.status).toBe("ok");
    expect(projection.salesNeeded).toBe(11);
    expect(projection.cashProjected).toBe(5467);
    expect(projection.newMrrProjected).toBeCloseTo(416.9, 2);
  });

  it("calculates leads and contacts needed from adjusted rates", () => {
    const projection = calculateGoalProjection({
      monthlyCashGoal: 5000,
      setupTicket: 497,
      mrrPerSale: 37.9,
      contactToLeadRate: 0.5,
      leadToSaleRate: 0.25,
      now,
    });

    expect(projection.status).toBe("ok");
    expect(projection.salesNeeded).toBe(11);
    expect(projection.leadsNeeded).toBe(44);
    expect(projection.contactsNeeded).toBe(88);
    expect(projection.contactsPerSale).toBe(8);
  });

  it("marks projections as needing rates when conversion rates are missing", () => {
    const projection = calculateGoalProjection({
      monthlyCashGoal: 5000,
      setupTicket: 497,
      mrrPerSale: 37.9,
      contactToLeadRate: null,
      leadToSaleRate: null,
      now,
    });

    expect(projection.status).toBe("needs_rates");
    expect(projection.salesNeeded).toBe(11);
    expect(projection.leadsNeeded).toBeNull();
    expect(projection.contactsNeeded).toBeNull();
  });

  it("marks projections as unreachable when a required rate is zero", () => {
    const projection = calculateGoalProjection({
      monthlyCashGoal: 5000,
      setupTicket: 497,
      mrrPerSale: 37.9,
      contactToLeadRate: 0,
      leadToSaleRate: 0.25,
      now,
    });

    expect(projection.status).toBe("unreachable");
    expect(projection.contactsNeeded).toBeNull();
  });
});

describe("date and rate helpers", () => {
  it("counts weekdays inclusively", () => {
    expect(
      countBusinessDaysInclusive(
        new Date("2026-07-14T12:00:00-03:00"),
        new Date("2026-07-31T23:59:59-03:00"),
      ),
    ).toBe(14);
  });

  it("clamps rates between 0 and 1", () => {
    expect(clampRate(-0.2)).toBe(0);
    expect(clampRate(0.42)).toBe(0.42);
    expect(clampRate(2)).toBe(1);
  });
});
