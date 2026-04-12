import { ThemeToggle } from "@/features/theme/theme-toggle";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold">TaskFlow</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-medium">Frontend setup complete</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Next step: app structure, routing, and auth flow.
          </p>
        </div>
      </main>
    </div>
  );
}
