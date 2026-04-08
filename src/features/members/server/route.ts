import { z } from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { cacheRemember } from "@/lib/redis-cache";

import { getMember, getProjectMember, isSuperAdmin } from "../utilts";
import { Member, MemberRole } from "../types";

const populateMembersWithUsers = async (
  members: Member[],
  users: Awaited<ReturnType<typeof createAdminClient>>["users"],
) => {
  const userIds = [...new Set(members.map((member) => member.userId))];
  const usersPromises = userIds.map((userId) =>
    users.get(userId).catch((error) => {
      console.warn(`Failed to fetch user ${userId}:`, error);
      return {
        $id: userId,
        name: "Unknown User",
        email: "unknown@example.com",
      };
    }),
  );

  const usersData = await Promise.all(usersPromises);
  const usersMap = new Map(usersData.map((user) => [user.$id, user]));

  return members.map((member) => {
    const user = usersMap.get(member.userId);
    return {
      ...member,
      name: user?.name || user?.email || "Unknown User",
      email: user?.email || "unknown@example.com",
    };
  });
};

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string().min(1, "Workspace ID is required"),
      }),
    ),
    async (c) => {
      try {
        const { users } = await createAdminClient();
        const databases = c.get("databases");
        const user = c.get("user");
        const { workspaceId } = c.req.valid("query");

        // Check if user is a super admin
        const isSuper = await isSuperAdmin({ databases, userId: user.$id });

        if (!isSuper) {
          // Regular users need to be members of the workspace
          const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
          });

          if (!member) {
            return c.json({ error: "Unauthorized" }, 401);
          }
        }
        const members = await cacheRemember(
          `cache:members:list:workspace:${workspaceId}`,
          30,
          () =>
            databases.listDocuments<Member>(DATABASE_ID, MEMBERS_ID, [
              Query.equal("workspaceId", workspaceId),
            ]),
          [`workspace:${workspaceId}`],
        );

        const populatedMembers = await populateMembersWithUsers(
          members.documents,
          users,
        );
        return c.json({
          data: {
            ...members,
            documents: populatedMembers,
          },
        });
      } catch (error) {
        console.error("Error fetching members:", error);
        return c.json({ error: "Failed to fetch members" }, 500);
      }
    },
  )
  .get(
    "/projectMembers",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string().min(1, "Workspace ID is required"),
        projectId: z.string(),
      }),
    ),
    async (c) => {
      try {
        const { users } = await createAdminClient();
        const databases = c.get("databases");
        const user = c.get("user");
        const { workspaceId, projectId } = c.req.valid("query");

        // Check if user is a super admin first
        const isSuper = await isSuperAdmin({ databases, userId: user.$id });

        if (!isSuper) {
          const member = await getProjectMember({
            databases,
            workspaceId,
            projectId,
            userId: user.$id,
          });

          // If not a project member, check if user is workspace admin
          if (!member) {
            const workspaceMember = await getMember({
              databases,
              workspaceId,
              userId: user.$id,
            });

            if (!workspaceMember || workspaceMember.role !== MemberRole.ADMIN) {
              return c.json({ error: "Unauthorized" }, 401);
            }
          }
        }

        const members = await cacheRemember(
          `cache:members:list:workspace:${workspaceId}:project:${projectId}`,
          30,
          () =>
            databases.listDocuments<Member>(DATABASE_ID, MEMBERS_ID, [
              Query.equal("workspaceId", workspaceId),
              Query.contains("projectId", [projectId]),
            ]),
          [`workspace:${workspaceId}`, `project:${projectId}`],
        );

        const populatedMembers = await populateMembersWithUsers(
          members.documents,
          users,
        );

        return c.json({
          data: {
            ...members,
            documents: populatedMembers,
          },
        });
      } catch (error) {
        console.error("Error fetching members:", error);
        return c.json({ error: "Failed to fetch members" }, 500);
      }
    },
  )
  .delete("/:memberId", sessionMiddleware, async (c) => {
    try {
      const { memberId } = c.req.param();
      const user = c.get("user");
      const databases = c.get("databases");

      const memberToDelete = await databases.getDocument(
        DATABASE_ID,
        MEMBERS_ID,
        memberId,
      );

      // Check if user is a super admin
      const isSuper = await isSuperAdmin({ databases, userId: user.$id });

      if (!isSuper) {
        // Regular users need proper permissions
        const requestingMember = await getMember({
          databases,
          workspaceId: memberToDelete.workspaceId,
          userId: user.$id,
        });

        if (!requestingMember) {
          return c.json({ error: "Unauthorized access to workspace" }, 401);
        }

        // Only allow deletion if:
        // 1. User is deleting themselves, OR
        // 2. User is an admin
        const canDelete =
          requestingMember.$id === memberToDelete.$id ||
          requestingMember.role === MemberRole.ADMIN;

        if (!canDelete) {
          return c.json(
            { error: "Insufficient permissions to delete member" },
            403,
          );
        }
      }

      // Check if this is the last admin in the workspace
      if (memberToDelete.role === MemberRole.ADMIN) {
        const allAdminsInWorkspace = await databases.listDocuments(
          DATABASE_ID,
          MEMBERS_ID,
          [
            Query.equal("workspaceId", memberToDelete.workspaceId),
            Query.equal("role", MemberRole.ADMIN),
          ],
        );

        if (allAdminsInWorkspace.total === 1) {
          return c.json(
            { error: "Cannot delete the last admin of the workspace. At least one admin must remain." },
            400,
          );
        }
      }

      // Check if this is the last member in the workspace
      const allMembersInWorkspace = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("workspaceId", memberToDelete.workspaceId)],
      );

      if (allMembersInWorkspace.total === 1) {
        return c.json(
          { error: "Cannot delete the only member of the workspace" },
          400,
        );
      }

      // If deleting from a specific project, check project-level constraints
      if (memberToDelete.projectId && memberToDelete.projectId.length > 0) {
        const projectMembers = await databases.listDocuments(
          DATABASE_ID,
          MEMBERS_ID,
          [
            Query.equal("workspaceId", memberToDelete.workspaceId),
            Query.contains("projectId", memberToDelete.projectId),
          ],
        );

        // Check if this is the last member of any project
        const isLastMemberOfAnyProject = memberToDelete.projectId.some((projectId: string) => {
          const membersOfThisProject = projectMembers.documents.filter(member =>
            member.projectId && member.projectId.includes(projectId)
          );
          return membersOfThisProject.length === 1;
        });

        if (isLastMemberOfAnyProject) {
          return c.json(
            { error: "Cannot delete the only member of a project" },
            400,
          );
        }
      }

      await databases.deleteDocument(DATABASE_ID, MEMBERS_ID, memberId);

      return c.json({
        data: {
          $id: memberToDelete.$id,
          message: "Member deleted successfully",
        },
      });
    } catch (error) {
      console.error("Error deleting member:", error);
      return c.json({ error: "Failed to delete member" }, 500);
    }
  })
  .patch(
    "/:memberId",
    sessionMiddleware,
    zValidator(
      "json",
      z.object({
        role: z.nativeEnum(MemberRole, {
          errorMap: () => ({
            message: "Invalid role. Must be ADMIN or MEMBER",
          }),
        }),
      }),
    ),
    async (c) => {
      try {
        const { memberId } = c.req.param();
        const { role } = c.req.valid("json");
        const user = c.get("user");
        const databases = c.get("databases");

        const memberToUpdate = await databases.getDocument(
          DATABASE_ID,
          MEMBERS_ID,
          memberId,
        );

        // Check if user is a super admin
        const isSuper = await isSuperAdmin({ databases, userId: user.$id });

        if (!isSuper) {
          // Regular users need admin permissions
          const requestingMember = await getMember({
            databases,
            workspaceId: memberToUpdate.workspaceId,
            userId: user.$id,
          });

          if (!requestingMember) {
            return c.json({ error: "Unauthorized access to workspace" }, 401);
          }

          if (requestingMember.role !== MemberRole.ADMIN) {
            return c.json({ error: "Only admins can update member roles" }, 403);
          }
        }

        // Prevent demoting the only admin
        if (
          memberToUpdate.role === MemberRole.ADMIN &&
          role === MemberRole.MEMBER
        ) {
          const queryFilters = [
            Query.equal("workspaceId", memberToUpdate.workspaceId),
            Query.equal("role", MemberRole.ADMIN),
          ];
          if (memberToUpdate.projectId) {
            queryFilters.push(
              Query.contains("projectId", memberToUpdate.projectId),
            );
          }

          const adminMembers = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            queryFilters,
          );

          if (adminMembers.total === 1) {
            const scopeType = memberToUpdate.projectId
              ? "project"
              : "workspace";
            return c.json(
              {
                error: `Cannot demote the only admin of the ${scopeType}`,
              },
              400,
            );
          }
        }

        // Update the member role
        const updatedMember = await databases.updateDocument(
          DATABASE_ID,
          MEMBERS_ID,
          memberId,
          { role },
        );

        return c.json({
          data: {
            ...updatedMember,
            message: "Member role updated successfully",
          },
        });
      } catch (error) {
        console.error("Error updating member:", error);
        return c.json({ error: "Failed to update member role" }, 500);
      }
    },
  )
  .post(
    "/assign-super-admin",
    sessionMiddleware,
    zValidator(
      "json",
      z.object({
        userId: z.string().min(1, "User ID is required"),
        workspaceId: z.string().min(1, "Workspace ID is required"),
      }),
    ),
    async (c) => {
      try {
        const { userId, workspaceId } = c.req.valid("json");
        const databases = c.get("databases");
        const currentUser = c.get("user");

        // Only existing super admins can assign super admin role
        const isCurrentUserSuper = await isSuperAdmin({
          databases,
          userId: currentUser.$id
        });

        if (!isCurrentUserSuper) {
          return c.json({ error: "Only super admins can assign super admin role" }, 403);
        }

        // Check if user is already a member of the workspace
        const existingMember = await getMember({
          databases,
          workspaceId,
          userId,
        });

        if (existingMember) {
          // Update existing member to super admin
          const updatedMember = await databases.updateDocument(
            DATABASE_ID,
            MEMBERS_ID,
            existingMember.$id,
            { role: MemberRole.SUPER_ADMIN },
          );

          return c.json({
            data: {
              ...updatedMember,
              message: "User promoted to super admin successfully",
            },
          });
        } else {
          // Create new super admin member
          const newMember = await databases.createDocument(
            DATABASE_ID,
            MEMBERS_ID,
            ID.unique(),
            {
              userId,
              workspaceId,
              projectId: [],
              role: MemberRole.SUPER_ADMIN,
            },
          );

          return c.json({
            data: {
              ...newMember,
              message: "User assigned super admin role successfully",
            },
          });
        }
      } catch (error) {
        console.error("Error assigning super admin:", error);
        return c.json({ error: "Failed to assign super admin role" }, 500);
      }
    },
  )
  .delete(
    "/remove-super-admin/:memberId",
    sessionMiddleware,
    async (c) => {
      try {
        const { memberId } = c.req.param();
        const databases = c.get("databases");
        const currentUser = c.get("user");

        // Only existing super admins can remove super admin role
        const isCurrentUserSuper = await isSuperAdmin({
          databases,
          userId: currentUser.$id
        });

        if (!isCurrentUserSuper) {
          return c.json({ error: "Only super admins can remove super admin role" }, 403);
        }

        const memberToUpdate = await databases.getDocument(
          DATABASE_ID,
          MEMBERS_ID,
          memberId,
        );

        if (!memberToUpdate) {
          return c.json({ error: "Member not found" }, 404);
        }

        if (memberToUpdate.role !== MemberRole.SUPER_ADMIN) {
          return c.json({ error: "Member is not a super admin" }, 400);
        }

        // Prevent removing the last super admin
        const allSuperAdmins = await databases.listDocuments(
          DATABASE_ID,
          MEMBERS_ID,
          [Query.equal("role", MemberRole.SUPER_ADMIN)],
        );

        if (allSuperAdmins.total <= 1) {
          return c.json({
            error: "Cannot remove the last super admin. At least one super admin must remain."
          }, 400);
        }

        // Demote to regular member
        const updatedMember = await databases.updateDocument(
          DATABASE_ID,
          MEMBERS_ID,
          memberId,
          { role: MemberRole.MEMBER },
        );

        return c.json({
          data: {
            ...updatedMember,
            message: "Super admin role removed successfully",
          },
        });
      } catch (error) {
        console.error("Error removing super admin:", error);
        return c.json({ error: "Failed to remove super admin role" }, 500);
      }
    },
  )
  .get(
    "/super-admins",
    sessionMiddleware,
    async (c) => {
      try {
        const databases = c.get("databases");
        const currentUser = c.get("user");
        const { users } = await createAdminClient();

        // Only existing super admins can view super admin list
        const isCurrentUserSuper = await isSuperAdmin({
          databases,
          userId: currentUser.$id
        });

        if (!isCurrentUserSuper) {
          return c.json({ error: "Only super admins can view super admin list" }, 403);
        }

        const superAdmins = await databases.listDocuments<Member>(
          DATABASE_ID,
          MEMBERS_ID,
          [Query.equal("role", MemberRole.SUPER_ADMIN)],
        );

        const populatedSuperAdmins = await populateMembersWithUsers(
          superAdmins.documents,
          users,
        );

        return c.json({
          data: {
            documents: populatedSuperAdmins,
            total: superAdmins.total,
          },
        });
      } catch (error) {
        console.error("Error fetching super admins:", error);
        return c.json({ error: "Failed to fetch super admins" }, 500);
      }
    },
  );
export default app;
