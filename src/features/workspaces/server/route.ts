import { ID, Query } from "node-appwrite";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { sessionMiddleware } from "@/lib/session-middleware";
import {
  DATABASE_ID,
  IMAGES_BUCKET_ID,
  MEMBERS_ID,
  ISSUES_ID,
  WORKSPACE_ID,
  PROJECTS_ID,
} from "@/config";

import {
  createWorkspaceSchema,
  inviteCodeSchema,
  updateWorkspaceSchema,
} from "../schemas";
import { MemberRole } from "@/features/members/types";
import { generateInviteCode, INVITECODE_LENGTH } from "@/lib/utils";
import {
  getMember,
  getProjectMember,
  isSuperAdmin,
} from "@/features/members/utilts";
import { Workspace } from "../types";
import { deleteInstallation } from "@/lib/github-app";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { IssueStatus } from "@/features/issues/types";
import { Project } from "@/features/projects/types";
import { cacheRemember, invalidateCacheGroups } from "@/lib/redis-cache";

const app = new Hono()
  .get("/", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const cachedData = await cacheRemember(
      `cache:workspaces:list:user:${user.$id}`,
      45,
      async () => {
        const isSuper = await isSuperAdmin({ databases, userId: user.$id });

        if (isSuper) {
          const workspaces = await databases.listDocuments<Workspace>(
            DATABASE_ID,
            WORKSPACE_ID,
            [Query.orderDesc("$createdAt")],
          );
          return {
            total: workspaces.total,
            documents: workspaces.documents.map((w) => ({
              $id: w.$id,
              $createdAt: w.$createdAt,
              $updatedAt: w.$updatedAt,
              name: w.name,
              imageUrl: w.imageUrl,
              inviteCode: w.inviteCode,
              userId: w.userId,
              type: w.type,
              githubInstallationId: w.githubInstallationId,
              githubAccountLogin: w.githubAccountLogin,
              githubAccountType: w.githubAccountType,
            })),
          };
        }

        const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
          Query.equal("userId", user.$id),
        ]);

        if (members.total === 0) {
          return { documents: [], total: 0 };
        }

        const workspaceIds = members.documents.map((member) => member.workspaceId);
        return databases.listDocuments<Workspace>(DATABASE_ID, WORKSPACE_ID, [
          Query.orderDesc("$createdAt"),
          Query.contains("$id", workspaceIds),
        ]);
      },
      [`user:${user.$id}`],
    );

    return c.json({ data: cachedData });
  })
  .get("/:workspaceId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { workspaceId } = c.req.param();

    try {
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

      const workspace = await cacheRemember(
        `cache:workspaces:detail:${workspaceId}`,
        45,
        () =>
          databases.getDocument<Workspace>(
            DATABASE_ID,
            WORKSPACE_ID,
            workspaceId,
          ),
        [`workspace:${workspaceId}`],
      );

      return c.json({ data: workspace });
    } catch (error: unknown) {
      const appwriteError = error as {
        code?: number;
        type?: string;
        message?: string;
      };
      if (appwriteError.code === 404) {
        return c.json({ error: "Workspace not found" }, 404);
      }
      console.error("Error fetching workspace:", error);
      return c.json({ error: "Failed to fetch workspace" }, 500);
    }
  })
  .get("/:workspaceId/info", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    try {
      // First check if user is a member of this workspace
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const workspace = await cacheRemember(
        `cache:workspaces:info:${workspaceId}`,
        45,
        () =>
          databases.getDocument<Workspace>(
            DATABASE_ID,
            WORKSPACE_ID,
            workspaceId,
          ),
        [`workspace:${workspaceId}`],
      );

      return c.json({
        data: {
          $id: workspace.$id,
          name: workspace.name,
          imageUrl: workspace.imageUrl,
          inviteCode: workspace.inviteCode,
        },
      });
    } catch (error: unknown) {
      const appwriteError = error as {
        code?: number;
        type?: string;
        message?: string;
      };
      if (appwriteError.code === 404) {
        return c.json({ error: "Workspace not found" }, 404);
      }
      console.error("Error fetching workspace info:", error);
      return c.json({ error: "Failed to fetch workspace info" }, 500);
    }
  })
  .get("/:workspaceId/join", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const { workspaceId } = c.req.param();

    try {
      const workspace = await cacheRemember(
        `cache:workspaces:join:${workspaceId}`,
        45,
        () =>
          databases.getDocument<Workspace>(
            DATABASE_ID,
            WORKSPACE_ID,
            workspaceId,
          ),
        [`workspace:${workspaceId}`],
      );

      // Return only public information (no invite code)
      return c.json({
        data: {
          $id: workspace.$id,
          name: workspace.name,
          imageUrl: workspace.imageUrl,
        },
      });
    } catch (error: unknown) {
      const appwriteError = error as {
        code?: number;
        type?: string;
        message?: string;
      };
      if (appwriteError.code === 404) {
        return c.json({ error: "Workspace not found" }, 404);
      }
      console.error("Error fetching workspace join info:", error);
      return c.json({ error: "Failed to fetch workspace info" }, 500);
    }
  })
  .post(
    "/",
    zValidator("form", createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      try {
        const databases = c.get("databases");
        const storage = c.get("storage");
        const user = c.get("user");

        const { name, image, type } = c.req.valid("form");

        let uploadedImage: string | undefined;
        if (image instanceof File) {
          const file = await storage.createFile(
            IMAGES_BUCKET_ID,
            ID.unique(),
            image,
          );
          const buffer: ArrayBuffer = await storage.getFilePreview(
            IMAGES_BUCKET_ID,
            file.$id,
          );
          uploadedImage = `data:image/png;base64,${Buffer.from(buffer).toString(
            "base64",
          )}`;
        }

        const existingWorkspace = await databases.listDocuments(
          DATABASE_ID,
          WORKSPACE_ID,
          [
            Query.equal("name", name),
            Query.equal("userId", user.$id),
            Query.limit(1),
          ],
        );

        if (existingWorkspace.total !== 0) {
          return c.json({ error: "Workspace already exists" }, 400);
        } else {
          const workspace = await databases.createDocument(
            DATABASE_ID,
            WORKSPACE_ID,
            ID.unique(),
            {
              name,
              userId: user.$id,
              imageUrl: uploadedImage,
              inviteCode: generateInviteCode(INVITECODE_LENGTH),
              type: type ?? "personal",
            },
          );

          await databases.createDocument(DATABASE_ID, MEMBERS_ID, ID.unique(), {
            userId: user.$id,
            workspaceId: workspace.$id,
            projectId: [],
            role: MemberRole.ADMIN,
          });
          await invalidateCacheGroups(`user:${user.$id}`, `workspace:${workspace.$id}`);
          return c.json({
            data: {
              $id: workspace.$id,
              $createdAt: workspace.$createdAt,
              $updatedAt: workspace.$updatedAt,
              name: workspace.name,
              imageUrl: workspace.imageUrl,
              inviteCode: workspace.inviteCode,
              userId: workspace.userId,
              type: workspace.type,
              githubInstallationId: workspace.githubInstallationId,
              githubAccountLogin: workspace.githubAccountLogin,
              githubAccountType: workspace.githubAccountType,
            },
          });
        }
      } catch (error) {
        console.log(error);
      }
    },
  )
  .patch(
    "/:workspaceId",
    sessionMiddleware,
    zValidator("form", updateWorkspaceSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { workspaceId } = c.req.param();
      const { name, image } = c.req.valid("form");
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      let uploadedImage: string | undefined;
      if (image instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image,
        );
        const buffer: ArrayBuffer = await storage.getFilePreview(
          IMAGES_BUCKET_ID,
          file.$id,
        );
        uploadedImage = `data:image/png;base64,${Buffer.from(buffer).toString(
          "base64",
        )}`;
      } else {
        uploadedImage = image;
      }
      const updatedWorkspace = await databases.updateDocument<Workspace>(
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId,
        {
          name,
          imageUrl: uploadedImage,
        },
      );
      await invalidateCacheGroups(`workspace:${workspaceId}`, `user:${user.$id}`);

      return c.json({
        data: {
          $id: updatedWorkspace.$id,
          $createdAt: updatedWorkspace.$createdAt,
          $updatedAt: updatedWorkspace.$updatedAt,
          name: updatedWorkspace.name,
          imageUrl: updatedWorkspace.imageUrl,
          inviteCode: updatedWorkspace.inviteCode,
          userId: updatedWorkspace.userId,
          type: updatedWorkspace.type,
          githubInstallationId: updatedWorkspace.githubInstallationId,
          githubAccountLogin: updatedWorkspace.githubAccountLogin,
          githubAccountType: updatedWorkspace.githubAccountType,
        },
      });
    },
  )
  .delete("/:workspaceId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    // Check if user is a super admin
    const isSuper = await isSuperAdmin({ databases, userId: user.$id });

    if (!isSuper) {
      // Regular users need to be workspace admins
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });
      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }
    }

    // Check if workspace has members (super admins can delete regardless of membership)
    const workspaceMembers = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal("workspaceId", workspaceId)],
    );

    if (!isSuper) {
      // For regular users, allow deletion if only the current user is a member
      const otherMembers = workspaceMembers.documents.filter(
        (member) => member.userId !== user.$id,
      );

      if (otherMembers.length > 0) {
        return c.json(
          {
            error:
              "Cannot delete workspace that has other members. Please remove all other members first.",
          },
          400,
        );
      }
    }

    // Check if workspace has any projects
    const workspaceProjects = await databases.listDocuments(
      DATABASE_ID,
      PROJECTS_ID,
      [Query.equal("workspaceId", workspaceId)],
    );

    if (workspaceProjects.total > 0) {
      return c.json(
        {
          error:
            "Cannot delete workspace that has projects. Please delete all projects first.",
        },
        400,
      );
    }

    if (isSuper) {
      // Super admin: delete all memberships
      await Promise.all(
        workspaceMembers.documents.map((member) =>
          databases.deleteDocument(DATABASE_ID, MEMBERS_ID, member.$id),
        ),
      );
    } else {
      // Regular user: delete only their own membership
      const currentUserMembership = workspaceMembers.documents.find(
        (member) => member.userId === user.$id,
      );

      if (currentUserMembership) {
        await databases.deleteDocument(
          DATABASE_ID,
          MEMBERS_ID,
          currentUserMembership.$id,
        );
      }
    }

    await databases.deleteDocument(DATABASE_ID, WORKSPACE_ID, workspaceId);
    await invalidateCacheGroups(`workspace:${workspaceId}`, `user:${user.$id}`);
    return c.json({ data: { $id: workspaceId } });
  })
  .post("/:workspaceId/reset-invite-code", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { workspaceId } = c.req.param();
    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });
    if (!member || member.role !== MemberRole.ADMIN) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const workspace = await databases.updateDocument<Workspace>(
      DATABASE_ID,
      WORKSPACE_ID,
      workspaceId,
      {
        inviteCode: generateInviteCode(INVITECODE_LENGTH),
      },
    );
    await invalidateCacheGroups(`workspace:${workspaceId}`, `user:${user.$id}`);
    return c.json({ data: workspace });
  })
  .get("/:workspaceId/analytics", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    // Check if user is a super admin
    const isSuper = await isSuperAdmin({ databases, userId: user.$id });

    let userProjectIds: string[] = [];
    let member = null;

    if (!isSuper) {
      // Regular users need to be members of the workspace
      member = await getMember({
        databases,
        workspaceId: workspaceId,
        userId: user.$id,
      });
      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      userProjectIds = member.projectId || [];
    } else {
      // Super admins can see all projects in the workspace
      const allProjects = await databases.listDocuments(
        DATABASE_ID,
        PROJECTS_ID,
        [Query.equal("workspaceId", workspaceId)],
      );
      userProjectIds = allProjects.documents.map((project) => project.$id);

      // For super admins, we need a member record for analytics
      const memberRecords = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("userId", user.$id), Query.limit(1)],
      );
      member = memberRecords.documents[0];
    }

    // If user is not a member of any projects, return zero analytics
    if (userProjectIds.length === 0) {
      return c.json({
        data: {
          totalTaskCount: 0,
          taskCount: 0,
          taskDiff: 0,
          assignedTaskCount: 0,
          assignedTaskDiff: 0,
          incompleteTaskCount: 0,
          incompleteTaskDiff: 0,
          completedTaskCount: 0,
          completeTaskDiff: 0,
          overdueTaskCount: 0,
          overdueTaskDiff: 0,
        },
      });
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const [
      thisMonthTasks,
      lastMonthTasks,
      totalTasks,
      thisMonthAssignedTasks,
      lastMonthAssignedTasks,
      thisMonthIncompleteTasks,
      lastMonthIncompleteTasks,
      thisMonthCompletedTasks,
      lastMonthCompletedTasks,
      thisMonthOverDueTasks,
      lastMonthOverDueTasks,
    ] = await Promise.all([
      // This month's tasks
      databases.listDocuments(DATABASE_ID, ISSUES_ID, [
        Query.equal("workspaceId", workspaceId),
        Query.contains("projectId", userProjectIds),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]),
      // Last month's tasks
      databases.listDocuments(DATABASE_ID, ISSUES_ID, [
        Query.equal("workspaceId", workspaceId),
        Query.contains("projectId", userProjectIds),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]),
      // Total tasks (all time)
      databases.listDocuments(DATABASE_ID, ISSUES_ID, [
        Query.equal("workspaceId", workspaceId),
        Query.contains("projectId", userProjectIds),
      ]),
      // This month's assigned tasks
      databases.listDocuments(DATABASE_ID, ISSUES_ID, [
        Query.equal("workspaceId", workspaceId),
        Query.contains("projectId", userProjectIds),
        Query.equal("assigneeId", member.$id),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]),
      // Last month's assigned tasks
      databases.listDocuments(DATABASE_ID, ISSUES_ID, [
        Query.equal("workspaceId", workspaceId),
        Query.contains("projectId", userProjectIds),
        Query.equal("assigneeId", member.$id),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]),
      // This month's incomplete tasks
      databases.listDocuments(DATABASE_ID, ISSUES_ID, [
        Query.equal("workspaceId", workspaceId),
        Query.contains("projectId", userProjectIds),
        Query.notEqual("status", IssueStatus.DONE),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]),
      // Last month's incomplete tasks
      databases.listDocuments(DATABASE_ID, ISSUES_ID, [
        Query.equal("workspaceId", workspaceId),
        Query.contains("projectId", userProjectIds),
        Query.notEqual("status", IssueStatus.DONE),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]),
      // This month's completed tasks
      databases.listDocuments(DATABASE_ID, ISSUES_ID, [
        Query.equal("workspaceId", workspaceId),
        Query.contains("projectId", userProjectIds),
        Query.equal("status", IssueStatus.DONE),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]),
      // Last month's completed tasks
      databases.listDocuments(DATABASE_ID, ISSUES_ID, [
        Query.equal("workspaceId", workspaceId),
        Query.contains("projectId", userProjectIds),
        Query.equal("status", IssueStatus.DONE),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]),
      // This month's overdue tasks
      databases.listDocuments(DATABASE_ID, ISSUES_ID, [
        Query.equal("workspaceId", workspaceId),
        Query.contains("projectId", userProjectIds),
        Query.notEqual("status", IssueStatus.DONE),
        Query.lessThan("dueDate", now.toISOString()),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]),
      // Last month's overdue tasks
      databases.listDocuments(DATABASE_ID, ISSUES_ID, [
        Query.equal("workspaceId", workspaceId),
        Query.contains("projectId", userProjectIds),
        Query.notEqual("status", IssueStatus.DONE),
        Query.lessThan("dueDate", now.toISOString()),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]),
    ]);

    // Calculate analytics from the parallel query results
    const totalTaskCount = totalTasks.total;
    const taskCount = thisMonthTasks.total;
    const taskDiff = taskCount - lastMonthTasks.total;

    const assignedTaskCount = thisMonthAssignedTasks.total;
    const assignedTaskDiff = assignedTaskCount - lastMonthAssignedTasks.total;

    const incompleteTaskCount = thisMonthIncompleteTasks.total;
    const incompleteTaskDiff =
      incompleteTaskCount - lastMonthIncompleteTasks.total;

    const completedTaskCount = thisMonthCompletedTasks.total;
    const completeTaskDiff = completedTaskCount - lastMonthCompletedTasks.total;

    const overdueTaskCount = thisMonthOverDueTasks.total;
    const overdueTaskDiff = overdueTaskCount - lastMonthOverDueTasks.total;

    return c.json({
      data: {
        totalTaskCount,
        taskCount,
        taskDiff,
        assignedTaskCount,
        assignedTaskDiff,
        incompleteTaskCount,
        incompleteTaskDiff,
        completedTaskCount,
        completeTaskDiff,
        overdueTaskCount,
        overdueTaskDiff,
      },
    });
  })
  .get("/:workspaceId/isworkspacemember", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { workspaceId } = c.req.param();

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    return c.json({
      data: {
        isMember: !!member,
        member: member
          ? {
              $id: member.$id,
              $createdAt: member.$createdAt,
              $updatedAt: member.$updatedAt,
              workspaceId: member.workspaceId,
              projectId: member.projectId,
              userId: member.userId,
              role: member.role,
            }
          : null,
      },
    });
  })
  .post(
    "/:workspaceId/projects/:projectId/join",
    sessionMiddleware,
    zValidator("json", inviteCodeSchema),
    async (c) => {
      const { workspaceId } = c.req.param();
      const { projectId } = c.req.param();
      const { code } = c.req.valid("json");

      const databases = c.get("databases");
      const user = c.get("user");

      // Check if user is already a member of this project
      const existingMember = await getProjectMember({
        databases,
        workspaceId,
        projectId,
        userId: user.$id,
      });

      if (existingMember) {
        return c.json({ error: "Already a member of this project" }, 400);
      }

      const project = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
      );

      if (project.inviteCode !== code) {
        return c.json({ error: "Invalid invite code" }, 400);
      }

      // Check if user has an existing member document for this workspace
      const workspaceMember = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (workspaceMember) {
        // Update existing member document to include this project
        const currentProjectIds = workspaceMember.projectId || [];
        if (!currentProjectIds.includes(projectId)) {
          await databases.updateDocument(
            DATABASE_ID,
            MEMBERS_ID,
            workspaceMember.$id,
            {
              projectId: [...currentProjectIds, projectId],
            },
          );
        }
      } else {
        // Create new member document with projectId as array
        await databases.createDocument(DATABASE_ID, MEMBERS_ID, ID.unique(), {
          workspaceId,
          projectId: [projectId],
          userId: user.$id,
          role: MemberRole.MEMBER,
        });

        await databases.updateDocument(DATABASE_ID, PROJECTS_ID, projectId, {
          projectCollaborators: [user.$id],
        });
      }

      return c.json({
        data: {
          $id: project.$id,
          $createdAt: project.$createdAt,
          $updatedAt: project.$updatedAt,
          name: project.name,
          imageUrl: project.imageUrl,
          workspaceId: project.workspaceId,
          inviteCode: project.inviteCode,
          owner: project.owner,
          projectAdmin: project.projectAdmin,
          projectCollaborators: project.projectCollaborators,
        },
      });
    },
  )
  .post(
    "/:workspaceId/projects/:projectId/reset-invite-code",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId } = c.req.param();
      const { projectId } = c.req.param();

      const member = await getProjectMember({
        databases,
        workspaceId,
        projectId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const project = await databases.updateDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
        {
          inviteCode: generateInviteCode(INVITECODE_LENGTH),
        },
      );
      return c.json({
        data: {
          $id: project.$id,
          $createdAt: project.$createdAt,
          $updatedAt: project.$updatedAt,
          name: project.name,
          imageUrl: project.imageUrl,
          workspaceId: project.workspaceId,
          inviteCode: project.inviteCode,
          owner: project.owner,
          projectAdmin: project.projectAdmin,
          projectCollaborators: project.projectCollaborators,
        },
      });
    },
  )
  // ── GitHub App: initiate installation ─────────────────────────────────────
  .get("/:workspaceId/github/install", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    const member = await getMember({ databases, workspaceId, userId: user.$id });

    if (!member || (member.role !== MemberRole.ADMIN && member.role !== "SUPER_ADMIN")) {
      return c.json({ error: "Only workspace admins can connect GitHub" }, 403);
    }

    const installUrl = process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL;
    if (!installUrl) {
      return c.json({ error: "GitHub App install URL not configured" }, 500);
    }

    // workspaceId is passed as state — GitHub echoes it back in the callback
    const redirectUrl = `${installUrl}?state=${encodeURIComponent(workspaceId)}`;
    return c.redirect(redirectUrl, 302);
  })
  // ── GitHub App: disconnect installation ────────────────────────────────────
  .delete("/:workspaceId/github/disconnect", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    const member = await getMember({ databases, workspaceId, userId: user.$id });

    if (!member || (member.role !== MemberRole.ADMIN && member.role !== "SUPER_ADMIN")) {
      return c.json({ error: "Only workspace admins can disconnect GitHub" }, 403);
    }

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACE_ID,
      workspaceId,
    );

    // Uninstall the GitHub App from the user's account
    if (workspace.githubInstallationId) {
      try {
        await deleteInstallation(parseInt(workspace.githubInstallationId, 10));
      } catch (error) {
        // Non-fatal: app may already be uninstalled on GitHub's side
        console.error("Failed to delete GitHub installation:", error);
      }
    }

    await databases.updateDocument(DATABASE_ID, WORKSPACE_ID, workspaceId, {
      githubInstallationId: null,
      githubAccountLogin: null,
      githubAccountType: null,
    });
    await invalidateCacheGroups(`workspace:${workspaceId}`, `user:${user.$id}`);

    return c.json({ data: { $id: workspaceId } });
  })
  .post(
    "/:workspaceId/join",
    sessionMiddleware,
    zValidator("json", inviteCodeSchema),
    async (c) => {
      const { workspaceId } = c.req.param();
      const { code } = c.req.valid("json");

      const databases = c.get("databases");
      const user = c.get("user");

      // Get the workspace to verify invite code
      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId,
      );

      if (workspace.inviteCode !== code) {
        return c.json({ error: "Invalid invite code" }, 400);
      }

      // Check if user is already a member of this workspace
      const existingMember = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (existingMember) {
        return c.json({ error: "Already a member of this workspace" }, 400);
      }

      // Create new member document for the workspace
      await databases.createDocument(DATABASE_ID, MEMBERS_ID, ID.unique(), {
        workspaceId,
        projectId: [],
        userId: user.$id,
        role: MemberRole.MEMBER,
      });
      await invalidateCacheGroups(`workspace:${workspaceId}`, `user:${user.$id}`);

      return c.json({
        data: {
          $id: workspace.$id,
          $createdAt: workspace.$createdAt,
          $updatedAt: workspace.$updatedAt,
          name: workspace.name,
          imageUrl: workspace.imageUrl,
          inviteCode: workspace.inviteCode,
          userId: workspace.userId,
          type: workspace.type,
          githubInstallationId: workspace.githubInstallationId,
          githubAccountLogin: workspace.githubAccountLogin,
          githubAccountType: workspace.githubAccountType,
        },
      });
    },
  );

export default app;
