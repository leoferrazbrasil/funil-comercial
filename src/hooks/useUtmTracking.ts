import { useEffect } from 'react';

const TRACKING_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid'
];

export function getStoredTrackingData(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const data: Record<string, string> = {};
  TRACKING_KEYS.forEach((key) => {
    const value = sessionStorage.getItem(`fc_track_${key}`);
    if (value) {
      data[key] = value;
    }
  });

  return data;
}

export function appendTrackingToWhatsappMessage(baseMessage: string): string {
  const tracking = getStoredTrackingData();
  
  if (Object.keys(tracking).length === 0) {
    return baseMessage;
  }

  let tagString = "\n\n*(Ref:";
  if (tracking.utm_source) tagString += ` src=${tracking.utm_source}`;
  if (tracking.utm_campaign) tagString += ` cmp=${tracking.utm_campaign}`;
  if (tracking.gclid) tagString += ` gclid`;
  if (tracking.fbclid) tagString += ` fbclid`;
  tagString += ")*";

  if (tagString === "\n\n*(Ref:)*") return baseMessage;

  return baseMessage + tagString;
}

export function useUtmTracking() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Interceptar e guardar UTMs da URL (se existirem)
    const searchParams = new URLSearchParams(window.location.search);
    let updated = false;

    TRACKING_KEYS.forEach((key) => {
      const value = searchParams.get(key);
      if (value) {
        sessionStorage.setItem(`fc_track_${key}`, value);
        updated = true;
      }
    });

    if (updated) {
      console.log('[Analytics] Origin tracking parameters captured.');
    }

    // 2. Interceptar cliques em links do WhatsApp GLOBALMENTE para injetar as UTMs
    const handleWaClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const a = target.closest('a');
      
      if (a && a.href && a.href.includes('wa.me/')) {
        try {
          const url = new URL(a.href);
          const text = url.searchParams.get('text');
          if (text) {
            const newText = appendTrackingToWhatsappMessage(text);
            if (newText !== text) {
              url.searchParams.set('text', newText);
              a.href = url.toString();
            }
          }
        } catch (err) {
          console.error('[Analytics] Error intercepting WhatsApp link', err);
        }
      }
    };

    // Usa capture phase (true) para interceptar ANTES da navegação real
    document.addEventListener('click', handleWaClick, true);
    
    return () => {
      document.removeEventListener('click', handleWaClick, true);
    };
  }, []);
}
