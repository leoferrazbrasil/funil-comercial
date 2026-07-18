declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

/**
 * Tracks a custom event in Google Analytics (GA4).
 * Safely handles environments where AdBlock might block gtag.
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && window.gtag) {
    try {
      window.gtag("event", eventName, eventParams);
    } catch (e) {
      console.warn("Analytics event failed", e);
    }
  }
}

/**
 * Tracks a standard/custom event in the Meta Pixel (fbq).
 * Safely handles environments where AdBlock might block fbq.
 */
export function trackMetaEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && window.fbq) {
    try {
      window.fbq("track", eventName, eventParams);
    } catch (e) {
      console.warn("Meta Pixel event failed", e);
    }
  }
}

export function trackWhatsappClick(
  eventParams?: Record<string, string | number | boolean>
) {
  const params = { method: "whatsapp", ...eventParams };

  trackEvent("whatsapp_click", params);
  trackMetaEvent("Contact", params);
}
