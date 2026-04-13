import type { ReactNode } from "react";

interface PageStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageState({ title, description, action }: PageStateProps) {
  return (
    <div className="rounded-xl border bg-card p-6 text-center sm:p-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}