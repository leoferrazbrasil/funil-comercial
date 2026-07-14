declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
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
