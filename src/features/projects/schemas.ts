import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, { message: "Required" }),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
  projectType: z.enum(["vaiu", "github"]).default("github"),
  workspaceId: z.string(),
});
export const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Minimum 1 character required" })
    .optional(),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});

export const addCollaboratorToProjectSchema = z.object({
  projectId: z.string(),
  username: z.string(),
});

export const removeCollaboratorFromProjectSchema = z.object({
  projectId: z.string(),
  memberId: z.string(),
});



export const addExistingProjectSchema = z.object({
  workspaceId: z.string(),
  // Legacy: paste GitHub URL directly
  projectLink: z.string().optional(),
  // New: pick from installation repos (format: "owner/repo")
  repoFullName: z.string().optional(),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});

export const fileUploadSchema = z.object({
  file: z.instanceof(File).nullable(),
  projectId: z.string(),
});

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
export type UpdateProjectSchema = z.infer<typeof updateProjectSchema>;
export type AddCollaboratorToProjectSchema = z.infer<
  typeof addCollaboratorToProjectSchema
>;
export type RemoveCollaboratorFromProjectSchema = z.infer<
  typeof removeCollaboratorFromProjectSchema
>;

export type AddExistingProjectSchema = z.infer<typeof addExistingProjectSchema>;
export type FileUploadSchema = z.infer<typeof fileUploadSchema>;

export const inviteCodeSchema = z.object({ code: z.string() });