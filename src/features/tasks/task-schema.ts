import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  assignee_id: z.string().optional(),
  due_date: z.string().optional(),
});

export type TaskSchema = z.infer<typeof taskSchema>;