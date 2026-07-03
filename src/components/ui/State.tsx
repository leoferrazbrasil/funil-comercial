import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Plus } from "lucide-react";

type StateTone = "empty" | "loading" | "success" | "error";

const icons = {
  empty: Plus,
  loading: Loader2,
  success: CheckCircle2,
  error: AlertTriangle,
};

export function State({
  action,
  children,
  description,
  onAction,
  title,
  tone = "empty",
}: {
  action?: string;
  children?: ReactNode;
  description: string;
  onAction?: () => void;
  title?: string;
  tone?: StateTone;
}) {
  const Icon = icons[tone];

  return (
    <section className={`ui-state ui-state-${tone}`}>
      <Icon size={22} />
      <div>
        {title ? <strong>{title}</strong> : null}
        <p>{description}</p>
        {children}
      </div>
      {action && onAction ? (
        <button className="secondary-button" onClick={onAction} type="button">
          {action}
        </button>
      ) : null}
    </section>
  );
}
