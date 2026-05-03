import { z } from "zod";
import { PrStatus } from "./types";

export const pullRequestSchema = z.object({
  title: z.string(),
  status: z.nativeEnum(PrStatus),
  author: z.string(),
  assignee: z.string().optional(),
});

export const createPrSchema = z.object({
  title: z.string().trim().min(1, { message: "Required" }),
  description: z.string().trim().min(1, { message: "Required" }),
  headOwner: z.string().trim().min(1, { message: "Required" }),
  headRepo: z.string().trim().min(1, { message: "Required" }),
  branch: z.string().trim().min(1, { message: "Required" }),
  baseBranch: z.string().trim().min(1, { message: "Required" }),
});

export type PullRequestSchema = z.infer<typeof pullRequestSchema>;
export type CreatePrSchema = z.infer<typeof createPrSchema>;
