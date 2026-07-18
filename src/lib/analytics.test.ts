import { afterEach, describe, expect, it, vi } from "vitest";
import { trackEvent, trackMetaEvent, trackWhatsappClick } from "./analytics";

describe("analytics tracking", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("tracks WhatsApp clicks in GA4 and Meta as a contact signal", () => {
    const gtag = vi.fn();
    const fbq = vi.fn();
    vi.stubGlobal("window", { gtag, fbq });

    trackWhatsappClick({ source: "nutritionist_site", method: "whatsapp" });

    expect(gtag).toHaveBeenCalledWith("event", "whatsapp_click", {
      source: "nutritionist_site",
      method: "whatsapp",
    });
    expect(fbq).toHaveBeenCalledWith("track", "Contact", {
      source: "nutritionist_site",
      method: "whatsapp",
    });
  });

  it("keeps Meta Lead available as an explicit form conversion event", () => {
    const fbq = vi.fn();
    vi.stubGlobal("window", { fbq });

    trackMetaEvent("Lead", { method: "form" });

    expect(fbq).toHaveBeenCalledWith("track", "Lead", { method: "form" });
  });

  it("passes Meta Pixel event options for browser and server deduplication", () => {
    const fbq = vi.fn();
    vi.stubGlobal("window", { fbq });

    trackMetaEvent("Lead", { method: "form" }, { eventID: "lead-test-1" });

    expect(fbq).toHaveBeenCalledWith(
      "track",
      "Lead",
      { method: "form" },
      { eventID: "lead-test-1" },
    );
  });

  it("keeps custom GA4 lead generation separate from WhatsApp click observation", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag });

    trackEvent("generate_lead", { method: "form" });

    expect(gtag).toHaveBeenCalledWith("event", "generate_lead", {
      method: "form",
    });
  });
});
