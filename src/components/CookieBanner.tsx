import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const hasConsented = localStorage.getItem("funil_cookie_consent");
    if (!hasConsented) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("funil_cookie_consent", "true");
    setIsVisible(false);
    
    // Attempt to update Google Consent Mode if gtag is loaded
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag('consent', 'update', {
        'ad_storage': 'granted',
        'analytics_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
      });
    }
  };

  const handleDecline = () => {
    // Even if declined, we store it so the banner doesn't keep showing up.
    // In a strict compliance scenario, we would also update gtag consent to 'denied'
    // but default state should be denied anyway in the head tags.
    localStorage.setItem("funil_cookie_consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
      <div className="max-w-5xl mx-auto bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pointer-events-auto">
        
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl hidden sm:block shrink-0">
            <Cookie className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-base mb-1">
              Privacidade e Cookies
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Utilizamos cookies e tecnologias similares, incluindo dados fornecidos por você (de forma anônima e criptografada), para medir a performance do site e personalizar anúncios através de parceiros como o Google. Ao aceitar, você concorda com a nossa{" "}
              <Link to="/privacidade" className="text-primary hover:underline font-medium">
                Política de Privacidade
              </Link>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 mt-2 md:mt-0">
          <button
            onClick={handleDecline}
            className="flex-1 md:flex-none px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors border border-transparent"
          >
            Recusar
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 md:flex-none px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            Aceitar Cookies
          </button>
        </div>

      </div>
    </div>
  );
}
