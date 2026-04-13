import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getProjects, createProject } from "@/features/projects/project-api";
import {
  createProjectSchema,
  type CreateProjectSchema,
} from "@/features/projects/project-schema";
import { ApiError } from "@/lib/api-client";
import { PageState } from "@/components/shared/page-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ProjectsPage() {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const form = useForm<CreateProjectSchema>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const rootError =
    createMutation.error instanceof ApiError
      ? createMutation.error.message
      : null;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 rounded-xl border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Projects</h2>
          <p className="text-sm text-muted-foreground">
            View your accessible projects and create a new one.
          </p>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Create project</h3>
          <p className="text-sm text-muted-foreground">
            Add a new project to start managing tasks.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) =>
            createMutation.mutate(values),
          )}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Project name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Website Redesign"
            />
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Optional project description"
            />
            {form.formState.errors.description ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>

          {rootError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {rootError}
            </div>
          ) : null}

          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create project"}
          </Button>
        </form>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Your projects</h3>
          <p className="text-sm text-muted-foreground">
            Projects you own or have tasks assigned in.
          </p>
        </div>

        {projectsQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-xl border bg-card p-6">
                <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
                <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="mt-6 h-9 w-24 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : null}

        {projectsQuery.isError ? (
          <PageState
            title="Unable to load projects"
            description="Something went wrong while fetching your projects. Please refresh and try again."
          />
        ) : null}

        {projectsQuery.isSuccess && projectsQuery.data.projects.length === 0 ? (
          <PageState
            title="No projects yet"
            description="Create your first project to get started."
          />
        ) : null}

        {projectsQuery.isSuccess && projectsQuery.data.projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projectsQuery.data.projects.map((project) => (
              <Card
                key={project.id}
                className="flex h-full flex-col rounded-xl"
              >
                <CardHeader>
                  <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-3 min-h-[3.75rem]">
                    {project.description || "No description provided."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="mt-auto space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </p>

                  <Button asChild className="w-full sm:w-auto">
                    <Link to={`/projects/${project.id}`}>Open project</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
