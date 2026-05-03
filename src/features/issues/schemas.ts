import { z } from "zod";
import { IssueStatus } from "./types";

export const createTaskSchema = z.object({
  name: z.string().trim().min(1, { message: "Required" }),
  status: z.nativeEnum(IssueStatus, { required_error: "Required" }),
  workspaceId: z.string().trim().min(1, { message: "Required" }),
  projectId: z.string().trim().min(1, { message: "Required" }),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.coerce.date(),
  description: z.string().optional(),
  comment: z.string().optional(),
  issueType: z.enum(["vaiu", "github"]).default("github"),
});

export const commentSchema = z.object({
  $id: z.string(),
  text: z.string(),
  issueId: z.string(),
  userId: z.string(),
  $createdAt: z.string(),
  attachment: z.string().optional(),
});

export const createCommentSchema = z.object({
  text: z.string(),
  attachment: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
export type Comment = z.infer<typeof commentSchema>;
export type CreateCommentSchema = z.infer<typeof createCommentSchema>;
