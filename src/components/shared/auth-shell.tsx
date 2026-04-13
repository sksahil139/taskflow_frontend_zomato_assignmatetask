import type { ReactNode } from "react";
import { ThemeToggle } from "@/features/theme/theme-toggle";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">TaskFlow</h1>
            <p className="text-sm text-muted-foreground">
              Zomato take-home project
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}