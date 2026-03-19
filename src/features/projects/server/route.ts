import { z } from "zod";
import { Hono } from "hono";
import { ID, Query, type Databases } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import { sessionMiddleware } from "@/lib/session-middleware";

import { getMember, getProjectAccess, isSuperAdmin } from "@/features/members/utilts";
import {
  DATABASE_ID,
  IMAGES_BUCKET_ID,
  PROJECTS_ID,
  ISSUES_ID,
  MEMBERS_ID,
} from "@/config";

import {
  addCollaboratorToProjectSchema,
  createProjectSchema,
  updateProjectSchema,
  addExistingProjectSchema,
  fileUploadSchema,
} from "../schemas";
import { Project } from "../types";
import { endOfMonth, startOfMonth } from "date-fns";
import { IssueStatus } from "@/features/issues/types";
import { generateInviteCode, INVITECODE_LENGTH } from "@/lib/utils";
import { MemberRole } from "@/features/members/types";
import {
  createRepository,
  getAccessToken,
  getInstallationToken,
  deleteRepository,
  getAuthenticatedUser,
  addCollaborator,
  listRepositoryIssues
} from "@/lib/github-api";
import { listInstallationRepos } from "@/lib/github-app";
import { WORKSPACE_ID } from "@/config";

const extractRepoName = (githubUrl: string): string => {
  // Split by '/' and get the last segment
  const segments = githubUrl.split("/");
  // Get the last segment and remove .git
  const repoName = segments[segments.length - 1].replace(".git", "");
  return repoName;
};

const IMPORT_ISSUE_BATCH_SIZE = 25;

const getProjectContext = async ({
  databases,
  userId,
  projectId,
}: {
  databases: Databases;
  userId: string;
  projectId: string;
}) => {
  const project = await databases.getDocument<Project>(
    DATABASE_ID,
    PROJECTS_ID,
    projectId,
  );

  const access = await getProjectAccess({
    databases,
    userId,
    workspaceId: project.workspaceId,
    projectId,
  });

  return { project, access };
};

const app = new Hono()
  .post(
    "/",
    sessionMiddleware,
    zValidator("form", createProjectSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { name, image, workspaceId } = c.req.valid("form");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Get GitHub OAuth access token from user profile
      const githubToken = await getAccessToken(user.$id);

      if (!githubToken) {
        return c.json({
          error: "GitHub account not connected. Please sign in with GitHub to create projects."
        }, 400);
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
      }

      const existingProject = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.orderDesc("$createdAt"),
          Query.equal("name", name),
          Query.limit(1),
        ],
      );

      const correctedName = name.replace(/\s+/g, "-").toLowerCase();

      if (existingProject.total !== 0) {
        return c.json({ error: "Project with this name already exists" }, 400);
      } else {
        const repo = await createRepository(githubToken, name);

        if (!repo) {
          return c.json({ error: "Failed to create repository" }, 500);
        }

        const project = await databases.createDocument(
          DATABASE_ID,
          PROJECTS_ID,
          ID.unique(),
          {
            name: correctedName,
            imageUrl: uploadedImage,
            workspaceId,
            projectAdmin: member.$id,
            inviteCode: generateInviteCode(INVITECODE_LENGTH),
            owner: repo.owner.login,
          },
        );

        // Update member's projectId array (keep existing workspace role)
        const currentProjectIds = member.projectId || [];
        await databases.updateDocument(DATABASE_ID, MEMBERS_ID, member.$id, {
          projectId: [...currentProjectIds, project.$id],
        });

        return c.json({ data: project, repo });
      }
    },
  )
  .post(
    "/add-existing-project",
    sessionMiddleware,
    zValidator("form", addExistingProjectSchema),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");

      const { projectLink, repoFullName, workspaceId } = c.req.valid("form");

      if (!projectLink && !repoFullName) {
        return c.json({ error: "Please provide a project link or select a repository" }, 400);
      }

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      let repoName: string;
      let repoOwner: string;

      if (repoFullName) {
        // GitHub App flow: "owner/repo"
        const [ownerPart, namePart] = repoFullName.split("/");
        if (!ownerPart || !namePart) {
          return c.json({ error: "Invalid repository format. Expected owner/repo" }, 400);
        }
        repoOwner = ownerPart;
        repoName = namePart;
      } else {
        // Legacy PAT flow: full GitHub URL
        const githubToken = await getAccessToken(user.$id);

        if (!githubToken) {
          // Try installation token as fallback
          const installToken = await getInstallationToken(workspaceId);
          if (!installToken) {
            return c.json({
              error: "GitHub account not connected. Please connect GitHub in workspace settings or sign in with GitHub.",
            }, 400);
          }
        }

        repoName = extractRepoName(projectLink!);

        const githubToken2 = await getAccessToken(user.$id);
        if (githubToken2) {
          const githubUser = await getAuthenticatedUser(githubToken2);
          if (!githubUser) {
            return c.json({ error: "Failed to authenticate with GitHub" }, 500);
          }
          repoOwner = githubUser.login;
        } else {
          // Extract owner from URL
          const segments = projectLink!.split("/");
          repoOwner = segments[segments.length - 2] || "";
          if (!repoOwner) {
            return c.json({ error: "Could not determine repository owner from URL" }, 400);
          }
        }
      }

      const project = await databases.createDocument(
        DATABASE_ID,
        PROJECTS_ID,
        ID.unique(),
        {
          name: repoName,
          workspaceId,
          projectAdmin: member.$id,
          inviteCode: generateInviteCode(INVITECODE_LENGTH),
          owner: repoOwner,
        },
      );

      // Use installation token if available, otherwise fall back to user token
      const tokenForSync =
        (await getInstallationToken(workspaceId)) ||
        (await getAccessToken(user.$id));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any[] = [];
      if (tokenForSync) {
        try {
          data = await listRepositoryIssues(tokenForSync, repoOwner, repoName);
        } catch {
          // Non-fatal: project was created, just couldn't sync initial issues
        }
      }

      const status = IssueStatus.TODO;

      const highestPositionTask = await databases.listDocuments(
        DATABASE_ID,
        ISSUES_ID,
        [
          Query.equal("status", status),
          Query.equal("workspaceId", workspaceId),
          Query.orderDesc("position"),
          Query.limit(1),
        ],
      );

      const newPosition =
        highestPositionTask.documents.length > 0
          ? highestPositionTask.documents[0].position + 1000
          : 1000;

      for (let i = 0; i < data.length; i += IMPORT_ISSUE_BATCH_SIZE) {
        const batch = data.slice(i, i + IMPORT_ISSUE_BATCH_SIZE);

        await Promise.all(
          batch.map((issue, batchIndex) =>
            databases.createDocument(DATABASE_ID, ISSUES_ID, ID.unique(), {
              name: issue.title,
              description: issue.body || "",
              status,
              dueDate: new Date().toISOString(),
              workspaceId,
              projectId: project.$id,
              assigneeId: issue?.assignee?.login,
              position: newPosition + (i + batchIndex) * 1000,
              number: issue.number,
            }),
          ),
        );
      }

      // Update member's projectId array (keep existing workspace role)
      const currentProjectIds = member.projectId || [];
      await databases.updateDocument(DATABASE_ID, MEMBERS_ID, member.$id, {
        projectId: [...currentProjectIds, project.$id],
      });

      return c.json({ data: project, issues: data });
    },
  )
  // ── List repos accessible to the workspace GitHub App installation ──────────
  .get(
    "/repos",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId } = c.req.valid("query");

      const member = await getMember({ databases, workspaceId, userId: user.$id });
      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const workspace = await databases.getDocument(
          DATABASE_ID,
          WORKSPACE_ID,
          workspaceId,
        );

        if (!workspace.githubInstallationId) {
          return c.json({
            error: "GitHub App not connected to this workspace",
          }, 400);
        }

        const repos = await listInstallationRepos(workspace.githubInstallationId);

        return c.json({
          data: repos.map((r) => ({
            id: r.id,
            name: r.name,
            full_name: r.full_name,
            private: r.private,
            owner: r.owner.login,
          })),
        });
      } catch (error) {
        console.error("Failed to list repos:", error);
        return c.json({ error: "Failed to list repositories" }, 500);
      }
    },
  )
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      try {
        const user = c.get("user");
        const databases = c.get("databases");

        const { workspaceId } = c.req.valid("query");
        if (!workspaceId) {
          return c.json({ error: "Missing workspaceId" }, 400);
        }

        // Check if user is a super admin
        const isSuper = await isSuperAdmin({ databases, userId: user.$id });

        if (isSuper) {
          // Super admins can see all projects
          const projects = await databases.listDocuments<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            [
              Query.equal("workspaceId", workspaceId),
              Query.orderDesc("$createdAt"),
            ],
          );
          return c.json({ data: projects });
        }

        const member = await getMember({
          databases,
          workspaceId,
          userId: user.$id,
        });

        if (!member) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        // Workspace admins can see all projects in the workspace
        if (member.role === MemberRole.ADMIN) {
          const projects = await databases.listDocuments<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            [
              Query.equal("workspaceId", workspaceId),
              Query.orderDesc("$createdAt"),
            ],
          );
          return c.json({ data: projects });
        }

        // Regular members can only see projects they're assigned to
        const projectIds = member.projectId || [];

        if (projectIds.length === 0) {
          return c.json({ data: { documents: [], total: 0 } });
        }

        // Fetch all projects in workspace and filter by member's projectIds
        const allProjects = await databases.listDocuments<Project>(
          DATABASE_ID,
          PROJECTS_ID,
          [
            Query.equal("workspaceId", workspaceId),
            Query.orderDesc("$createdAt"),
          ],
        );

        const filteredProjects = allProjects.documents.filter((project) =>
          projectIds.includes(project.$id),
        );

        return c.json({
          data: {
            documents: filteredProjects,
            total: filteredProjects.length,
          },
        });
      } catch (error) {
        console.error("Error fetching projects:", error);
        return c.json({ error: "Failed to fetch projects" }, 500);
      }
    },
  )
  .get("/:projectId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { projectId } = c.req.param();

    const { project, access } = await getProjectContext({
      databases,
      userId: user.$id,
      projectId,
    });

    if (!access.hasAccess) {
      return c.json({ error: "Forbidden" }, 403);
    }

    return c.json({ data: project });
  })
  .get("/:projectId/analytics", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { projectId } = c.req.param();

    const { project, access } = await getProjectContext({
      databases,
      userId: user.$id,
      projectId,
    });

    let member = null;

    if (!access.hasAccess) {
      return c.json({ error: "Forbidden" }, 403);
    }

    if (!access.isSuperAdmin) {
      member = access.member;
    } else {
      // For super admins, we need to get a member record for analytics
      // We'll use the first member record we can find for this user
      const memberRecords = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("userId", user.$id), Query.limit(1)],
      );
      member = memberRecords.documents[0];
    }

    if (!member) {
      return c.json({ error: "Unable to resolve analytics member context" }, 403);
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);

    const thisMonthTasks = await databases.listDocuments(
      DATABASE_ID,
      ISSUES_ID,
      [
        Query.equal("projectId", projectId),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ],
    );

    const totalTasks = await databases.listDocuments(DATABASE_ID, ISSUES_ID, [
      Query.equal("projectId", projectId),
    ]);

    const totalTaskCount = totalTasks.total;
    const taskDiff = thisMonthTasks.total;

    const thisMonthAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      ISSUES_ID,
      [
        Query.equal("projectId", projectId),
        Query.equal("assigneeId", member.$id),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ],
    );
    const totalAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      ISSUES_ID,
      [
        Query.equal("projectId", projectId),
        Query.equal("assigneeId", member.$id),
      ],
    );

    const assignedTaskCount = totalAssignedTasks.total;
    const assignedTaskDiff = thisMonthAssignedTasks.total;

    const thisMonthIncompleteTasks = await databases.listDocuments(
      DATABASE_ID,
      ISSUES_ID,
      [
        Query.equal("projectId", projectId),
        Query.notEqual("status", IssueStatus.DONE),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ],
    );
    const totalIncompleteTasks = await databases.listDocuments(
      DATABASE_ID,
      ISSUES_ID,
      [
        Query.equal("projectId", projectId),
        Query.notEqual("status", IssueStatus.DONE),
      ],
    );

    const incompleteTaskCount = totalIncompleteTasks.total;
    const incompleteTaskDiff = thisMonthIncompleteTasks.total;

    const thisMonthCompletedTasks = await databases.listDocuments(
      DATABASE_ID,
      ISSUES_ID,
      [
        Query.equal("projectId", projectId),
        Query.equal("status", IssueStatus.DONE),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ],
    );
    const totalCompletedTasks = await databases.listDocuments(
      DATABASE_ID,
      ISSUES_ID,
      [
        Query.equal("projectId", projectId),
        Query.equal("status", IssueStatus.DONE),
      ],
    );

    const completedTaskCount = totalCompletedTasks.total;
    const completeTaskDiff = thisMonthCompletedTasks.total;

    const thisMonthOverDueTasks = await databases.listDocuments(
      DATABASE_ID,
      ISSUES_ID,
      [
        Query.equal("projectId", projectId),
        Query.notEqual("status", IssueStatus.DONE),
        Query.lessThan("dueDate", now.toISOString()),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ],
    );
    const totalOverDueTasks = await databases.listDocuments(
      DATABASE_ID,
      ISSUES_ID,
      [
        Query.equal("projectId", projectId),
        Query.notEqual("status", IssueStatus.DONE),
        Query.lessThan("dueDate", now.toISOString()),
      ],
    );

    const overdueTaskCount = totalOverDueTasks.total;
    const overdueTaskDiff = thisMonthOverDueTasks.total;

    return c.json({
      data: {
        totalTaskCount,
        taskCount: thisMonthTasks.total,
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
  .patch(
    "/:projectId",
    sessionMiddleware,
    zValidator("form", updateProjectSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { projectId } = c.req.param();
      const { name, image } = c.req.valid("form");

      const { project: existingProject, access } = await getProjectContext({
        databases,
        userId: user.$id,
        projectId,
      });

      if (!access.hasAccess) {
        return c.json({ error: "Forbidden" }, 403);
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
      const updatedProject = await databases.updateDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
        {
          name,
          imageUrl: uploadedImage,
        },
      );

      return c.json({ data: updatedProject });
    },
  )
  .delete("/:projectId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { projectId } = c.req.param();

    const { project: existingProject, access } = await getProjectContext({
      databases,
      userId: user.$id,
      projectId,
    });

    if (!access.isSuperAdmin) {
      // Regular users need to be workspace admins or project admins
      const member = access.member;

      if (!member) {
        return c.json({ error: "Unauthorized access to workspace" }, 401);
      }

      const canDelete =
        member.role === MemberRole.ADMIN || // Workspace admin
        existingProject.projectAdmin === member.$id; // Project admin

      if (!canDelete) {
        return c.json(
          {
            error:
              "Only workspace admins or project admins can delete projects",
          },
          403,
        );
      }
    }

    // Check if project has any members
    const projectMembers = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [
        Query.equal("workspaceId", existingProject.workspaceId),
        Query.contains("projectId", projectId),
      ],
    );

    if (projectMembers.total > 0) {
      // Allow workspace admin, project admin, or super admin to delete project with members
      // This removes all member associations automatically
      if (!access.isSuperAdmin) {
        const member = access.member;

        const canDeleteWithMembers =
          member?.role === MemberRole.ADMIN || // Workspace admin
          existingProject.projectAdmin === member?.$id; // Project admin

        if (!canDeleteWithMembers) {
          return c.json(
            {
              error:
                "You must be a workspace admin, project admin, or super admin to delete a project with members",
            },
            400,
          );
        }
      }

      // If super admin, workspace admin, or project admin is deleting, remove all members from project first
      for (const member of projectMembers.documents) {
        const updatedProjectIds = member.projectId.filter(
          (id: string) => id !== projectId,
        );
        await databases.updateDocument(DATABASE_ID, MEMBERS_ID, member.$id, {
          projectId: updatedProjectIds,
        });
      }
    }

    // Check if project has any issues
    const projectIssues = await databases.listDocuments(
      DATABASE_ID,
      ISSUES_ID,
      [Query.equal("projectId", projectId)],
    );

    if (projectIssues.total > 0) {
      return c.json(
        {
          error:
            "Cannot delete project that has issues. Please delete all issues first.",
        },
        400,
      );
    }

    // Get GitHub OAuth access token from user profile
    const githubToken = await getAccessToken(user.$id);

    if (!githubToken) {
      return c.json({
        error: "GitHub account not connected. Cannot delete repository."
      }, 400);
    }

    // Delete the GitHub repository
    const githubUser = await getAuthenticatedUser(githubToken);
    if (!githubUser) {
      return c.json({ error: "Failed to authenticate with GitHub" }, 500);
    }

    // TODO: delete  tasks
    await deleteRepository(githubToken, githubUser.login, existingProject.name);
    await databases.deleteDocument(DATABASE_ID, PROJECTS_ID, projectId);
    return c.json({ data: { $id: existingProject.$id } });
  })
  .post(
    "/:projectId/addCollaborator",
    sessionMiddleware,
    zValidator("json", addCollaboratorToProjectSchema),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { projectId } = c.req.param();

      const { username } = c.req.valid("json");

      const { project: existingProject, access } = await getProjectContext({
        databases,
        userId: user.$id,
        projectId,
      });
      const member = access.member;

      if (!member || existingProject.projectAdmin !== member.$id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (existingProject.projectCollaborators.includes(username)) {
        return c.json({ error: "Collaborator already exists" }, 400);
      }

      // Get GitHub OAuth access token from user profile
      const githubToken = await getAccessToken(user.$id);

      if (!githubToken) {
        return c.json({
          error: "GitHub account not connected. Cannot add collaborator."
        }, 400);
      }

      const githubUser = await getAuthenticatedUser(githubToken);
      if (!githubUser) {
        return c.json({ error: "Failed to authenticate with GitHub" }, 500);
      }

      try {
        await addCollaborator(
          githubToken,
          githubUser.login,
          existingProject.name,
          username,
          "push"
        );

        const projectCollaborators = Array.isArray(
          existingProject.projectCollaborators,
        )
          ? existingProject.projectCollaborators
          : [];

        const updatedCollaborators = [...projectCollaborators, username];

        await databases.updateDocument(DATABASE_ID, PROJECTS_ID, projectId, {
          projectCollaborators: updatedCollaborators,
        });

        return c.json({ data: { updatedCollaborators } });
      } catch (error) {
        console.error("Failed to add collaborator:", error);
        return c.json({ error: "Failed to add collaborator" }, 500);
      }
    },
  )
  .post(
    "/upload-file",
    sessionMiddleware,
    zValidator("form", fileUploadSchema),
    async (c) => {
      const storage = c.get("storage");
      const databases = c.get("databases");
      const user = c.get("user");
      const { file, projectId } = c.req.valid("form");

      if (!file) {
        return c.json({ error: "File is required" }, 400);
      }

      try {
        const { project, access } = await getProjectContext({
          databases,
          userId: user.$id,
          projectId,
        });

        if (!project) {
          return c.json({ error: "Project not found" }, 404);
        }

        if (!access.hasAccess) {
          return c.json({ error: "Forbidden" }, 403);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        return c.json({ error: "Project not found" }, 404);
      }

      let uploadedFile;

      if (file instanceof File) {
        uploadedFile = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          file,
        );

        if (
          file.name.toLowerCase().endsWith(".md") ||
          file.name.toLowerCase().endsWith(".txt")
        ) {
          try {
            // Get the file content as a buffer
            const fileBuffer = await storage.getFileDownload(
              IMAGES_BUCKET_ID,
              uploadedFile.$id,
            );

            // Convert buffer to string to get the actual text content
            const fileContent = Buffer.from(fileBuffer).toString("utf-8");

            // Update the project with the actual README content
            await databases.updateDocument(
              DATABASE_ID,
              PROJECTS_ID,
              projectId,
              {
                readme: fileContent,
              },
            );

            return c.json({
              data: {
                file: uploadedFile,
                readmeContent: fileContent,
              },
            });
          } catch (error) {
            console.error("Error processing README file:", error);
          }
        }
      } else {
        return c.json({ error: "Invalid file type" }, 400);
      }
      return c.json({
        data: {
          file: uploadedFile,
        },
      });
    },
  )
  .get("/:projectId/info", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { projectId } = c.req.param();

    const { project, access } = await getProjectContext({
      databases,
      userId: user.$id,
      projectId,
    });

    if (!access.hasAccess) {
      return c.json({ error: "Forbidden" }, 403);
    }

    return c.json({
      data: {
        $id: project.$id,
        name: project.name,
        imageUrl: project.imageUrl,
        projectAdmin: project.projectAdmin,
        inviteCode: project.inviteCode,
        workspaceId: project.workspaceId,
      },
    });
  })
  .post(
    "/:workspaceId/projects/:projectId/reset-invite-code",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId } = c.req.param();
      const { projectId } = c.req.param();

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      const existingProject = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
      );

      if (
        !member ||
        (member.role !== MemberRole.ADMIN &&
          existingProject.projectAdmin !== member.$id)
      ) {
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
      return c.json({ data: project });
    },
  )
  .delete("/:projectId/members/:memberId", sessionMiddleware, async (c) => {
    try {
      const { projectId, memberId } = c.req.param();
      const databases = c.get("databases");
      const user = c.get("user");

      // Check if user is super admin first
      const isSuper = await isSuperAdmin({ databases, userId: user.$id });

      if (!isSuper) {
        // Get the member to remove
        const memberToRemove = await databases.getDocument(
          DATABASE_ID,
          MEMBERS_ID,
          memberId,
        );

        // Check if current user has permission (workspace admin or project admin)
        const currentMember = await getMember({
          databases,
          workspaceId: memberToRemove.workspaceId,
          userId: user.$id,
        });

        if (!currentMember) {
          return c.json({ error: "Unauthorized access to workspace" }, 401);
        }

        // Get the project to check if user is project admin
        const project = await databases.getDocument(
          DATABASE_ID,
          PROJECTS_ID,
          projectId,
        );

        const canRemove =
          currentMember.role === MemberRole.ADMIN || // Workspace admin
          project.projectAdmin === currentMember.$id; // Project admin

        if (!canRemove) {
          return c.json(
            {
              error:
                "Only workspace admins or project admins can remove members",
            },
            403,
          );
        }
      }

      // Get the member to check their current projects
      const memberToRemove = await databases.getDocument(
        DATABASE_ID,
        MEMBERS_ID,
        memberId,
      );

      // Check if member is part of this project
      if (
        !memberToRemove.projectId ||
        !memberToRemove.projectId.includes(projectId)
      ) {
        return c.json({ error: "Member is not part of this project" }, 400);
      }

      // Get the project to check if we're removing the project admin
      const project = await databases.getDocument(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
      );

      // Prevent removing the project admin - they must transfer admin role first
      if (project.projectAdmin === memberId) {
        return c.json(
          {
            error:
              "Cannot remove the project admin. Please transfer admin role to another member first or delete the entire project.",
          },
          400,
        );
      }

      // Remove the project from member's projectId array
      const updatedProjectIds = memberToRemove.projectId.filter(
        (id: string) => id !== projectId,
      );

      // Update member with new project list
      await databases.updateDocument(DATABASE_ID, MEMBERS_ID, memberId, {
        projectId: updatedProjectIds,
      });

      return c.json({
        data: {
          message: "Member removed from project successfully",
          memberId,
          projectId,
        },
      });
    } catch (error) {
      console.error("Failed to remove member from project:", error);
      return c.json({ error: "Failed to remove member from project" }, 500);
    }
  });

export default app;
