import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api-client";
import { createTask, updateTask } from "./task-api";
import { taskSchema, type TaskSchema } from "./task-schema";
import type { Task } from "./task-types";

interface TaskDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  trigger?: React.ReactNode;
  task?: Task | null;
  assigneeOptions: Array<{ value: string; label: string }>;
}

export function TaskDialog({
  projectId,
  open,
  onOpenChange,
  mode,
  trigger,
  task,
  assigneeOptions,
}: TaskDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<TaskSchema>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      assignee_id: "unassigned",
      due_date: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" && task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        assignee_id: task.assignee_id || "unassigned",
        due_date: task.due_date || "",
      });
      return;
    }

    form.reset({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      assignee_id: "unassigned",
      due_date: "",
    });
  }, [form, mode, task, open]);

  const mutation = useMutation({
    mutationFn: async (values: TaskSchema) => {
      const payload = {
        title: values.title,
        description: values.description || "",
        status: values.status,
        priority: values.priority,
        assignee_id:
          values.assignee_id && values.assignee_id !== "unassigned"
            ? values.assignee_id
            : null,
        due_date: values.due_date || null,
      };

      if (mode === "edit" && task) {
        return updateTask(task.id, payload);
      }

      return createTask(projectId, payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] }),
      ]);

      onOpenChange(false);
    },
  });

  const rootError =
    mutation.error instanceof ApiError ? mutation.error.message : null;

  const title = mode === "edit" ? "Edit task" : "Create task";
  const actionText =
    mode === "edit"
      ? mutation.isPending
        ? "Saving..."
        : "Save changes"
      : mutation.isPending
        ? "Creating..."
        : "Create task";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} />
            {form.formState.errors.description ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) =>
                  form.setValue("status", value as TaskSchema["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To do</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(value) =>
                  form.setValue("priority", value as TaskSchema["priority"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select
                value={form.watch("assignee_id") || "unassigned"}
                onValueChange={(value) => form.setValue("assignee_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {assigneeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due date</Label>
              <Input id="due_date" type="date" {...form.register("due_date")} />
            </div>
          </div>

          {rootError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {rootError}
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {actionText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}