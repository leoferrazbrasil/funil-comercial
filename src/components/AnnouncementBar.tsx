import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function AnnouncementBar() {
  return (
    <div className="bg-primary px-4 py-2.5 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-primary-foreground">
        <span className="md:hidden">
          Conheça nossa Consultoria Comercial!
        </span>
        <span className="hidden md:inline">
          Novidade: Conheça nossa Consultoria Comercial Estratégica para escalar suas vendas.
        </span>
        <Link
          to="/consultoria"
          className="ml-2 inline-flex items-center font-bold underline decoration-primary-foreground/50 underline-offset-2 hover:decoration-primary-foreground transition-all"
        >
          Saber mais
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </p>
    </div>
  );
}
