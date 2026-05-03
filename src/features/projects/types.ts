import { Models } from "node-appwrite";

export type Project = Models.Document & {
  name: string;
  imageUrl: string;
  projectId: string;
  inviteCode: string;
  workspaceId: string;
  owner: string | null;
  projectType: "vaiu" | "github";
  projectAdmin: string;
  projectCollaborators: string[];
};
