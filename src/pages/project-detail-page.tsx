import { useParams } from "react-router-dom";

export default function ProjectDetailPage() {
  const { projectId } = useParams();

  return (
    <div className="rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Project Detail</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Project ID: {projectId}
      </p>
    </div>
  );
}