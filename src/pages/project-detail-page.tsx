import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getProject } from "@/features/projects/project-api";
import {
  deleteTask,
  getProjectTasks,
  updateTask,
} from "@/features/tasks/task-api";
import { getStoredUser } from "@/features/auth/auth-storage";
import {
  taskPriorityLabel,
  taskStatusLabel,
  taskStatusOptions,
} from "@/features/tasks/task-utils";
import { TaskDialog } from "@/features/tasks/task-dialog";
import type { Task, TaskListResponse } from "@/features/tasks/task-types";
import type { ProjectDetail } from "@/features/projects/projects-types";
import { PageState } from "@/components/shared/page-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const currentUser = getStoredUser();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId as string),
    enabled: Boolean(projectId),
  });

  const tasksQuery = useQuery({
    queryKey: ["project-tasks", projectId, statusFilter, assigneeFilter],
    queryFn: () =>
      getProjectTasks({
        projectId: projectId as string,
        status: statusFilter === "all" ? undefined : statusFilter,
        assignee: assigneeFilter === "all" ? undefined : assigneeFilter,
      }),
    enabled: Boolean(projectId),
  });

  const assigneeOptions = useMemo(() => {
    const baseTasks = projectQuery.data?.tasks ?? [];
    const uniqueAssigneeIds = Array.from(
      new Set(baseTasks.map((task) => task.assignee_id).filter(Boolean)),
    ) as string[];

    return uniqueAssigneeIds.map((id) => ({
      value: id,
      label: id === currentUser?.id ? "Me" : id,
    }));
  }, [projectQuery.data?.tasks, currentUser?.id]);

  const statusMutation = useMutation({
    mutationFn: ({
      taskId,
      status,
    }: {
      taskId: string;
      status: Task["status"];
    }) => updateTask(taskId, { status }),

    onMutate: async ({ taskId, status }) => {
      const taskQueryKey = [
        "project-tasks",
        projectId,
        statusFilter,
        assigneeFilter,
      ];
      const projectQueryKey = ["project", projectId];

      await queryClient.cancelQueries({ queryKey: taskQueryKey });
      await queryClient.cancelQueries({ queryKey: projectQueryKey });

      const previousTasks =
        queryClient.getQueryData<TaskListResponse>(taskQueryKey);
      const previousProject =
        queryClient.getQueryData<ProjectDetail>(projectQueryKey);

      queryClient.setQueryData<TaskListResponse>(taskQueryKey, (old) => {
        if (!old) return old;

        return {
          ...old,
          tasks: old.tasks.map((task) =>
            task.id === taskId
              ? { ...task, status, updated_at: new Date().toISOString() }
              : task,
          ),
        };
      });

      queryClient.setQueryData<ProjectDetail>(projectQueryKey, (old) => {
        if (!old) return old;

        return {
          ...old,
          tasks: old.tasks.map((task) =>
            task.id === taskId
              ? { ...task, status, updated_at: new Date().toISOString() }
              : task,
          ),
        };
      });

      return { previousTasks, previousProject, taskQueryKey, projectQueryKey };
    },

    onError: (_error, _variables, context) => {
      if (!context) return;

      queryClient.setQueryData(context.taskQueryKey, context.previousTasks);
      queryClient.setQueryData(
        context.projectQueryKey,
        context.previousProject,
      );
    },

    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
        queryClient.invalidateQueries({
          queryKey: ["project-tasks", projectId],
        }),
      ]);
    },
  });

  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      setDeletingTaskId(taskId);
      return deleteTask(taskId);
    },

    onSettled: async () => {
      setDeletingTaskId(null);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
        queryClient.invalidateQueries({
          queryKey: ["project-tasks", projectId],
        }),
      ]);
    },
  });

  if (!projectId) {
    return (
      <PageState
        title="Project not found"
        description="The requested project id is missing."
      />
    );
  }

  if (projectQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6">
          <div className="h-7 w-1/3 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-xl border bg-card p-6">
              <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <PageState
        title="Unable to load project"
        description="Something went wrong while fetching project details."
      />
    );
  }

  const project = projectQuery.data;
  const tasks = tasksQuery.data?.tasks ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{project.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {project.description || "No description provided."}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Created {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>

          <TaskDialog
            projectId={projectId}
            open={createOpen}
            onOpenChange={setCreateOpen}
            mode="create"
            assigneeOptions={assigneeOptions}
            trigger={<Button>Create task</Button>}
          />
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Filters</h3>
          <p className="text-sm text-muted-foreground">
            Filter tasks by status and assignee.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {taskStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Assignee</label>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignees</SelectItem>
                {assigneeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Tasks</h3>
          <p className="text-sm text-muted-foreground">
            Track task status, priority, and ownership.
          </p>
        </div>

        {tasksQuery.isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl border bg-card p-6">
                <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
                <div className="mt-3 h-4 w-4/5 animate-pulse rounded bg-muted" />
                <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : null}

        {tasksQuery.isError ? (
          <PageState
            title="Unable to load tasks"
            description="Something went wrong while fetching tasks for this project."
          />
        ) : null}

        {tasksQuery.isSuccess && tasks.length === 0 ? (
          <PageState
            title="No tasks found"
            description="No tasks match the selected filters."
          />
        ) : null}

        {tasksQuery.isSuccess && tasks.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {tasks.map((task) => (
              <Card key={task.id} className="rounded-xl">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="line-clamp-1">
                        {task.title}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {task.description || "No description provided."}
                      </CardDescription>
                    </div>

                    <Badge variant="secondary">
                      {taskStatusLabel[task.status]}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {taskPriorityLabel[task.priority]} priority
                    </Badge>
                    <Badge variant="outline">
                      {task.assignee_id === currentUser?.id
                        ? "Assigned to me"
                        : task.assignee_id
                          ? `Assignee: ${task.assignee_id}`
                          : "Unassigned"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Quick status update
                    </label>
                    <Select
                      value={task.status}
                      onValueChange={(value) =>
                        statusMutation.mutate({
                          taskId: task.id,
                          status: value as Task["status"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To do</SelectItem>
                        <SelectItem value="in_progress">In progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <p className="text-muted-foreground">
                    Due date:{" "}
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString()
                      : "No due date"}
                  </p>

                  <p className="text-muted-foreground">
                    Updated {new Date(task.updated_at).toLocaleDateString()}
                  </p>

                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditingTask(task)}
                    >
                      Edit task
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => {
                        const confirmed = window.confirm(
                          "Are you sure you want to delete this task?",
                        );
                        if (confirmed) {
                          deleteMutation.mutate(task.id);
                        }
                      }}
                      disabled={deletingTaskId === task.id}
                    >
                      {deletingTaskId === task.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </section>

      <TaskDialog
        projectId={projectId}
        open={Boolean(editingTask)}
        onOpenChange={(open) => {
          if (!open) setEditingTask(null);
        }}
        mode="edit"
        task={editingTask}
        assigneeOptions={assigneeOptions}
      />
    </div>
  );
}
