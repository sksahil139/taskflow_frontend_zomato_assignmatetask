import { ThemeToggle } from "@/features/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { getStoredUser, clearStoredAuth } from "@/features/auth/auth-storage";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const navigate = useNavigate();
  const user = getStoredUser();

  function handleLogout() {
    clearStoredAuth();
    navigate("/login");
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold">TaskFlow</h1>
          {user ? (
            <p className="truncate text-sm text-muted-foreground">{user.name}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ThemeToggle />
          {user ? (
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}