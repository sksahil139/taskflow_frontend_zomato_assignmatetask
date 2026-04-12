import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="rounded-lg border p-6 text-center">
      <h2 className="text-lg font-semibold">Page not found</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        The page you requested does not exist.
      </p>
      <Button asChild className="mt-4">
        <Link to="/projects">Go to projects</Link>
      </Button>
    </div>
  );
}