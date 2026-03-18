import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { Query, type Databases } from "node-appwrite";
import { Member, MemberRole } from "./types";

interface GetMemberProps {
  databases: Databases;
  workspaceId: string;
  userId: string;
}
export const getMember = async ({
  databases,
  userId,
  workspaceId,
}: GetMemberProps): Promise<Member | null> => {
  try {
    const members = await databases.listDocuments<Member>(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal("workspaceId", workspaceId), Query.equal("userId", userId)],
    );
    return members.documents[0];
  } catch (error: unknown) {
    console.error("Error fetching member:", error);
    return null;
  }
};

interface GetProjectMemberProps {
  databases: Databases;
  workspaceId: string;
  projectId: string;
  userId: string;
}

type ProjectAccessResult = {
  isSuperAdmin: boolean;
  isWorkspaceAdmin: boolean;
  hasAccess: boolean;
  member: Member | null;
};

export const getProjectMember = async ({
  databases,
  userId,
  workspaceId,
  projectId,
}: GetProjectMemberProps): Promise<Member | null> => {
  try {
    const members = await databases.listDocuments<Member>(
      DATABASE_ID,
      MEMBERS_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.contains("projectId", projectId),
        Query.equal("userId", userId),
      ],
    );
    return members.documents[0];
  } catch (error: unknown) {
    console.error("Error fetching project member:", error);
    return null;
  }
};

interface CheckSuperAdminProps {
  databases: Databases;
  userId: string;
}

/**
 * Checks if a user has super admin privileges by looking for any member record
 * with SUPER_ADMIN role across all workspaces
 */
export const isSuperAdmin = async ({
  databases,
  userId,
}: CheckSuperAdminProps): Promise<boolean> => {
  try {
    const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
      Query.equal("userId", userId),
      Query.equal("role", MemberRole.SUPER_ADMIN),
      Query.limit(1),
    ]);

    return members.documents.length > 0;
  } catch (error: unknown) {
    console.error("Error checking super admin status:", error);
    return false;
  }
};

/**
 * Checks if a user has access to a workspace (either as a member or as a super admin)
 */
export const hasWorkspaceAccess = async ({
  databases,
  userId,
  workspaceId,
}: GetMemberProps): Promise<boolean> => {
  try {
    // First check if user is a super admin
    const isSuper = await isSuperAdmin({ databases, userId });
    if (isSuper) {
      return true;
    }

    // Then check if user is a regular member of the workspace
    const member = await getMember({ databases, userId, workspaceId });
    return member !== null;
  } catch (error: unknown) {
    console.error("Error checking workspace access:", error);
    return false;
  }
};

/**
 * Checks if a user has access to a project (either as a member or as a super admin)
 */
export const hasProjectAccess = async ({
  databases,
  userId,
  workspaceId,
  projectId,
}: GetProjectMemberProps): Promise<boolean> => {
  try {
    // First check if user is a super admin
    const isSuper = await isSuperAdmin({ databases, userId });
    if (isSuper) {
      return true;
    }

    // Then check if user is a regular member of the project
    const member = await getProjectMember({ databases, userId, workspaceId, projectId });
    return member !== null;
  } catch (error: unknown) {
    console.error("Error checking project access:", error);
    return false;
  }
};

export const getProjectAccess = async ({
  databases,
  userId,
  workspaceId,
  projectId,
}: GetProjectMemberProps): Promise<ProjectAccessResult> => {
  try {
    const isSuper = await isSuperAdmin({ databases, userId });
    if (isSuper) {
      return {
        isSuperAdmin: true,
        isWorkspaceAdmin: false,
        hasAccess: true,
        member: null,
      };
    }

    const member = await getMember({ databases, userId, workspaceId });
    if (!member) {
      return {
        isSuperAdmin: false,
        isWorkspaceAdmin: false,
        hasAccess: false,
        member: null,
      };
    }

    const isWorkspaceAdmin = member.role === MemberRole.ADMIN;
    const isProjectMember = (member.projectId || []).includes(projectId);

    return {
      isSuperAdmin: false,
      isWorkspaceAdmin,
      hasAccess: isWorkspaceAdmin || isProjectMember,
      member,
    };
  } catch (error: unknown) {
    console.error("Error checking project access:", error);
    return {
      isSuperAdmin: false,
      isWorkspaceAdmin: false,
      hasAccess: false,
      member: null,
    };
  }
};
