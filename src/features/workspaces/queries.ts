import { Query } from "node-appwrite";

import { DATABASE_ID, MEMBERS_ID, WORKSPACE_ID } from "@/config";
import { createSessionClient } from "@/lib/appwrite";
import { getMember, isSuperAdmin } from "@/features/members/utilts";
import { MemberRole } from "@/features/members/types";

export const getWorkspaces = async () => {
  const { account, databases } = await createSessionClient();
  const user = await account.get();

  // Check if user is a super admin
  const isSuper = await isSuperAdmin({ databases, userId: user.$id });

  if (isSuper) {
    // Super admins can see all workspaces
    const workspaces = await databases.listDocuments(DATABASE_ID, WORKSPACE_ID, [
      Query.orderDesc("$createdAt"),
    ]);
    return workspaces;
  }

  // Regular users can only see workspaces they're members of
  const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
    Query.equal("userId", user.$id),
  ]);

  if (members.total == 0) {
    return { documents: [], total: 0 };
  }
  const workspaceIds = members.documents.map((member) => member.workspaceId);
  const workspaces = await databases.listDocuments(DATABASE_ID, WORKSPACE_ID, [
    Query.orderDesc("$createdAt"),
    Query.contains("$id", workspaceIds),
  ]);

  return workspaces;
};

export const canManageWorkspace = async (workspaceId: string) => {
  const { account, databases } = await createSessionClient();
  const user = await account.get();

  const isSuper = await isSuperAdmin({ databases, userId: user.$id });
  if (isSuper) return true;

  const member = await getMember({ databases, workspaceId, userId: user.$id });
  return member?.role === MemberRole.ADMIN;
};
