import { z } from "zod";
import { Hono } from "hono";

import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import { getMember, isSuperAdmin } from "@/features/members/utilts";
import { sessionMiddleware } from "@/lib/session-middleware";

import {
  DATABASE_ID,
  MEMBERS_ID,
  PROJECTS_ID,
  ISSUES_ID,
  COMMENTS_ID,
  IMAGES_BUCKET_ID,
} from "@/config";
import { createAdminClient } from "@/lib/appwrite";

import { createCommentSchema, createTaskSchema } from "../schemas";
import { Issue, IssueStatus } from "../types";
import { Project } from "@/features/projects/types";
import { Member, MemberRole } from "@/features/members/types";
import {
  getAccessToken,
  getInstallationToken,
  getAuthenticatedUser,
  listRepositoryIssues,
  updateIssue,
  createIssue,
} from "@/lib/github-api";

const app = new Hono()
  .delete("/:issueId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { issueId } = c.req.param();

    // Check if issue exists first
    let issuesFromDb: Issue;
    try {
      issuesFromDb = await databases.getDocument<Issue>(
        DATABASE_ID,
        ISSUES_ID,
        issueId,
      );
    } catch {
      return c.json({ error: "Issue not found" }, 404);
    }

    const projectId = issuesFromDb.projectId;
    const existingProject = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      projectId,
    );

    if (!existingProject) {
      return c.json({ error: "Project not found" }, 404);
    }

    // Check if user is a super admin
    const isSuper = await isSuperAdmin({ databases, userId: user.$id });

    if (!isSuper) {
      // Regular user: check member permissions
      const member = await getMember({
        databases,
        workspaceId: issuesFromDb.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const userProjectIds = member.projectId || [];
      const isWorkspaceAdmin = member.role === MemberRole.ADMIN;
      const isProjectAdmin = existingProject.projectAdmin === member.$id;
      const isProjectMember = userProjectIds.includes(projectId);

      if (!isWorkspaceAdmin && !isProjectAdmin && !isProjectMember) {
        return c.json({ error: "Unauthorized to delete this issue" }, 403);
      }
    }

    // Only close on GitHub if this is a GitHub issue backed by a linked repo
    if (
      issuesFromDb.issueType === "github" &&
      existingProject.owner &&
      issuesFromDb.number
    ) {
      const githubToken = await getAccessToken(user.$id);
      if (!githubToken) {
        return c.json(
          {
            error: "GitHub account not connected. Cannot delete GitHub issue.",
          },
          400,
        );
      }

      await Promise.all([
        updateIssue(
          githubToken,
          existingProject.owner,
          existingProject.name,
          issuesFromDb.number,
          { state: "closed" },
        ),
        databases.deleteDocument(DATABASE_ID, ISSUES_ID, issueId),
      ]);
    } else {
      await databases.deleteDocument(DATABASE_ID, ISSUES_ID, issueId);
    }

    return c.json({
      success: true,
      data: {
        $id: issueId,
      },
    });
  })
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        projectId: z.string().nullish(),
        assigneeId: z.string().nullish(),
        search: z.string().nullish(),
        dueDate: z.string().nullish(),
        status: z.nativeEnum(IssueStatus).nullish(),
        page: z.string().nullish(),
        limit: z.string().nullish(),
      }),
    ),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId, projectId, assigneeId, status, search, dueDate, page, limit } =
        c.req.valid("query");

      const pageSize = Math.min(parseInt(limit || "20"), 100);
      const pageIndex = Math.max(parseInt(page || "0"), 0);

      // Check if user is a super admin
      const isSuper = await isSuperAdmin({ databases, userId: user.$id });

      let accessibleProjectIds: string[] = [];

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

        // Workspace admins can access all projects in the workspace.
        if (member.role === "ADMIN") {
          const allProjects = await databases.listDocuments(
            DATABASE_ID,
            PROJECTS_ID,
            [Query.equal("workspaceId", workspaceId)],
          );
          accessibleProjectIds = allProjects.documents.map((project) => project.$id);
        } else {
          // Regular members can access only projects they are assigned to.
          accessibleProjectIds = member.projectId || [];
        }
      } else {
        // Super admins can see all projects in the workspace
        const allProjects = await databases.listDocuments(
          DATABASE_ID,
          PROJECTS_ID,
          [Query.equal("workspaceId", workspaceId)],
        );
        accessibleProjectIds = allProjects.documents.map((project) => project.$id);
      }

      // If user is not a member of any projects, return empty result
      if (accessibleProjectIds.length === 0) {
        return c.json({
          data: {
            total: 0,
            documents: [],
          },
        });
      }

      const query = [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt"),
      ];

      // Filter by projects the user is a member of
      if (projectId) {
        // Check if user is a member of the requested project
        if (!accessibleProjectIds.includes(projectId)) {
          return c.json({ error: "Unauthorized access to this project" }, 403);
        }
        query.push(Query.equal("projectId", projectId));
      } else {
        // Only show issues from projects the user is a member of
        query.push(Query.equal("projectId", accessibleProjectIds));
      }

      if (status) {
        query.push(Query.equal("status", status));
      }
      if (assigneeId) {
        query.push(Query.equal("assigneeId", assigneeId));
      }
      if (dueDate) {
        query.push(Query.equal("dueDate", dueDate));
      }
      if (search) {
        query.push(Query.search("name", search));
      }

      query.push(Query.limit(pageSize));
      query.push(Query.offset(pageIndex * pageSize));

      const issues = await databases.listDocuments<Issue>(
        DATABASE_ID,
        ISSUES_ID,
        query,
      );

      const projectIds = issues.documents.map((issue) => issue.projectId);
      const assigneeIds = [
        ...new Set(
          issues.documents
            .map((issue) => issue.assigneeId)
            .filter(
              (id): id is string => typeof id === "string" && id.length > 0,
            ),
        ),
      ];

      /* TODO: Need to be checked and verified the correct way to update the issues storing in the projects */
      // const projects = await databases.listDocuments<Project>(
      //   DATABASE_ID,
      //   PROJECTS_ID,
      //   projectIds.length > 0 ? [Query.contains("$id", projectIds)] : [],
      // );

      // const members = await databases.listDocuments(
      //   DATABASE_ID,
      //   MEMBERS_ID,
      //   assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : [],
      // );

      let allProjects: (Project | null)[] = [];
      if (projectIds.length > 0) {
        const projectPromises = projectIds.map((id) =>
          databases.getDocument<Project>(DATABASE_ID, PROJECTS_ID, id),
        );
        allProjects = await Promise.all(
          projectPromises.map((p) => p.catch(() => null)),
        );
      }
      const projects = {
        documents: allProjects.filter(Boolean),
      };

      let allMembers: (Member | null)[] = [];
      if (assigneeIds.length > 0) {
        const memberPromises = assigneeIds.map((id) =>
          databases.getDocument<Member>(DATABASE_ID, MEMBERS_ID, id),
        );
        allMembers = await Promise.all(
          memberPromises.map((p) => p.catch(() => null)),
        );
      }
      const members = {
        documents: allMembers.filter(Boolean),
      };

      // Batch fetch all users in parallel instead of one-by-one
      const userIds = members.documents.map(member => member!.userId);
      const usersPromises = userIds.map(userId =>
        users.get(userId).catch(error => {
          console.warn(`Failed to fetch user ${userId}:`, error);
          return { $id: userId, name: "Unknown User", email: "unknown@example.com" };
        })
      );
      const usersData = await Promise.all(usersPromises);
      const usersMap = new Map(usersData.map(user => [user.$id, user]));

      const assignees = members.documents.map((member) => {
        if (!member) {
          throw new Error("Member not found");
        }
        const user = usersMap.get(member.userId);
        return {
          ...member,
          name: user?.name || user?.email || "Unknown User",
          email: user?.email || "unknown@example.com",
        };
      });

      const populatedTask = issues.documents.map((issue) => {
        const project = projects.documents.find(
          (project) => project && project.$id === issue.projectId,
        );
        const assignee = issue.assigneeId
          ? assignees.find((a) => a.$id === issue.assigneeId)
          : undefined;
        return {
          ...issue,
          project,
          assignee,
        };
      });

      return c.json({
        data: {
          ...issues,
          documents: populatedTask,
        },
      });
    },
  )
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createTaskSchema),
    async (c) => {
      try {
        const databases = c.get("databases");
        const user = c.get("user");
        const {
          name,
          description,
          status,
          dueDate,
          projectId,
          assigneeId,
          workspaceId,
          issueType,
        } = c.req.valid("json");

        const projects = await databases.listDocuments(
          DATABASE_ID,
          PROJECTS_ID,
          [
            Query.equal("$id", projectId),
            Query.equal("workspaceId", workspaceId),
          ],
        );

        if (projects.documents.length === 0) {
          return c.json({ error: "Project not found" }, 404);
        }

        const targetProject = projects.documents[0];
        if (targetProject.projectType === "vaiu" && issueType === "github") {
          return c.json(
            {
              error:
                "GitHub issues are not available for Vaiu projects. Create a Vaiu issue instead.",
            },
            400,
          );
        }

        const assigneeMemberId = assigneeId?.trim();
        if (assigneeMemberId) {
          try {
            await databases.getDocument(
              DATABASE_ID,
              MEMBERS_ID,
              assigneeMemberId,
            );
          } catch {
            return c.json({ error: "Assignee not found" }, 404);
          }
        }

        // Check if user is a super admin
        const isSuper = await isSuperAdmin({ databases, userId: user.$id });

        if (!isSuper) {
          const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
          });

          if (!member) {
            return c.json({ error: "Unauthorized" }, 401);
          }

          // Check if user is a member of the project they're trying to create an issue for
          const userProjectIds = member.projectId || [];
          if (!userProjectIds.includes(projectId)) {
            return c.json(
              { error: "Unauthorized access to this project" },
              403,
            );
          }
        }

        const highestPositionTask = await databases.listDocuments(
          DATABASE_ID,
          ISSUES_ID,
          [
            Query.equal("status", status),
            Query.equal("workspaceId", workspaceId),
            Query.orderAsc("position"),
            Query.limit(1),
          ],
        );
        const newPosition =
          highestPositionTask.documents.length > 0
            ? highestPositionTask.documents[0].position + 1000
            : 1000;

        let issueInGit;
        let githubNumber;

        // Only interact with GitHub if issueType is "github"
        if (issueType === "github") {
          // Get GitHub OAuth access token
          const githubToken = await getAccessToken(user.$id);
          if (!githubToken) {
            return c.json(
              {
                error: "GitHub account not connected. Cannot create GitHub issue.",
              },
              400,
            );
          }

          // Get authenticated GitHub user
          const authenticatedGithubUser = await getAuthenticatedUser(githubToken);
          if (!authenticatedGithubUser) {
            return c.json({ error: "Failed to authenticate with GitHub" }, 500);
          }

          issueInGit = await createIssue(
            githubToken,
            authenticatedGithubUser.login,
            projects.documents[0].name,
            name,
            description || "",
          );

          githubNumber = issueInGit.number;

          // Idempotency guard: if an issue with the same GitHub number already exists for this project, return it
          const existingByNumber = await databases
            .listDocuments<Issue>(DATABASE_ID, ISSUES_ID, [
              Query.equal("projectId", projectId),
              Query.equal("number", githubNumber),
            ])
            .catch(() => ({ documents: [] as Issue[] }));

          if (existingByNumber.documents.length > 0) {
            return c.json({
              data: existingByNumber.documents[0],
              issue: issueInGit,
            });
          }
        }

        const issue = await databases.createDocument<Issue>(
          DATABASE_ID,
          ISSUES_ID,
          ID.unique(),
          {
            name,
            description,
            status,
            dueDate,
            workspaceId,
            projectId,
            assigneeId: assigneeMemberId ?? null,
            position: newPosition,
            number: githubNumber,
            issueType,
          },
        );

        return c.json({ data: issue, issue: issueInGit });
      } catch (error) {
        console.error("Error:", error);
        if (error instanceof Error) {
          return c.json({ error: error.message }, 500);
        }
        return c.json({ error: "An unexpected error occurred" }, 500);
      }
    },
  )
  .patch(
    "/:issueId",
    sessionMiddleware,
    zValidator("json", createTaskSchema.partial()),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const {
        name,
        status,
        dueDate,
        projectId,
        assigneeId,
        description,
        comment,
      } = c.req.valid("json");
      const { issueId } = c.req.param();

      const exisistingTask = await databases.getDocument<Issue>(
        DATABASE_ID,
        ISSUES_ID,
        issueId,
      );

      // Check if user is a super admin
      const isSuper = await isSuperAdmin({ databases, userId: user.$id });

      if (!isSuper) {
        const member = await getMember({
          databases,
          workspaceId: exisistingTask.workspaceId,
          userId: user.$id,
        });

        if (!member) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        // Check if user is a member of the project that this issue belongs to
        const userProjectIds = member.projectId || [];
        if (!userProjectIds.includes(exisistingTask.projectId)) {
          return c.json(
            { error: "Unauthorized access to this project's issue" },
            403,
          );
        }

        // If projectId is being changed, ensure user is also a member of the new project
        if (
          projectId &&
          projectId !== exisistingTask.projectId &&
          !userProjectIds.includes(projectId)
        ) {
          return c.json(
            { error: "Unauthorized access to the target project" },
            403,
          );
        }
      }

      if (
        status === "DONE" &&
        !(typeof comment === "string" && comment.trim().length > 0)
      ) {
        return c.json(
          { error: "Comment is required when moving issue to Done" },
          400,
        );
      }

      // Create comment when moving to IN_REVIEW or DONE
      if (
        (status === "IN_REVIEW" || status === "DONE") &&
        typeof comment === "string" &&
        comment.trim().length > 0
      ) {
        await databases.createDocument(DATABASE_ID, COMMENTS_ID, ID.unique(), {
          text: comment.trim(),
          issueId,
          userId: user.$id,
        });
      }

      if (assigneeId !== undefined) {
        const next =
          assigneeId === null || String(assigneeId).trim() === ""
            ? null
            : String(assigneeId).trim();
        if (next) {
          try {
            await databases.getDocument(DATABASE_ID, MEMBERS_ID, next);
          } catch {
            return c.json({ error: "Assignee not found" }, 404);
          }
        }
      }

      const issue = await databases.updateDocument<Issue>(
        DATABASE_ID,
        ISSUES_ID,
        issueId,
        {
          ...(name !== undefined && { name }),
          ...(status !== undefined && { status }),
          ...(dueDate !== undefined && { dueDate }),
          ...(projectId !== undefined && { projectId }),
          ...(description !== undefined && { description }),
          ...(assigneeId !== undefined && {
            assigneeId:
              assigneeId === null || String(assigneeId).trim() === ""
                ? null
                : String(assigneeId).trim(),
          }),
        },
      );

      // Sync status changes to GitHub (only if status changed and issue is GitHub type)
      if (status && issue.number && issue.issueType === "github") {
        try {
          const project = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            issue.projectId,
          );

          // Write operation: use user OAuth token for proper attribution
          const githubToken = await getAccessToken(user.$id);

          if (githubToken && project.owner) {
            const newState = status === "DONE" ? "closed" : "open";

            await updateIssue(
              githubToken,
              project.owner,
              project.name,
              issue.number,
              { state: newState },
            );
          }
        } catch (error) {
          console.error("Error syncing to GitHub:", error);
        }
      }

      return c.json({ data: issue });
    },
  )
  .get("/:issueId", sessionMiddleware, async (c) => {
    const { users } = await createAdminClient();
    const currentUser = c.get("user");
    const { issueId } = c.req.param();
    const databases = c.get("databases");

    const issue = await databases.getDocument<Issue>(
      DATABASE_ID,
      ISSUES_ID,
      issueId,
    );

    // Check if user is a super admin
    const isSuper = await isSuperAdmin({ databases, userId: currentUser.$id });

    if (!isSuper) {
      const currentMember = await getMember({
        databases,
        workspaceId: issue.workspaceId,
        userId: currentUser.$id,
      });
      if (!currentMember) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Check if user is a member of the project that this issue belongs to
      const userProjectIds = currentMember.projectId || [];
      if (!userProjectIds.includes(issue.projectId)) {
        return c.json(
          { error: "Unauthorized access to this project's issue" },
          403,
        );
      }
    }

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      issue.projectId,
    );

    let assignee;
    // Check if assigneeId exists before trying to fetch
    if (!issue.assigneeId) {
      assignee = null;
    } else {
      try {
        const member = await databases.getDocument(
          DATABASE_ID,
          MEMBERS_ID,
          issue.assigneeId,
        );

        try {
          const user = await users.get(member.userId);
          assignee = {
            $id: member.$id,
            $createdAt: member.$createdAt,
            $updatedAt: member.$updatedAt,
            workspaceId: member.workspaceId,
            projectId: member.projectId,
            userId: member.userId,
            role: member.role,
            name: user.name || user.email,
            email: user.email,
          };
        } catch (userError) {
          if (
            typeof userError === "object" &&
            userError &&
            "code" in userError &&
            userError.code === 404
          ) {
            // User not found in Appwrite
            assignee = {
              $id: member.$id,
              $createdAt: member.$createdAt,
              $updatedAt: member.$updatedAt,
              workspaceId: member.workspaceId,
              projectId: member.projectId,
              userId: member.userId,
              role: member.role,
              name: "Unknown User",
              email: "user-not-found@example.com",
            };
          } else {
            console.error(`Error fetching user ${member.userId}:`, userError);
            assignee = {
              $id: member.$id,
              $createdAt: member.$createdAt,
              $updatedAt: member.$updatedAt,
              workspaceId: member.workspaceId,
              projectId: member.projectId,
              userId: member.userId,
              role: member.role,
              name: "Error Fetching User",
              email: "error@example.com",
            };
          }
        }
      } catch {
        // If member not found by ID, it might be a GitHub username from fetched issues
        console.log(
          `Member not found by ID ${issue.assigneeId}, treating as GitHub username`,
        );

        // Create a fallback assignee object for GitHub usernames
        assignee = {
          $id: issue.assigneeId || "unknown",
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString(),
          userId: issue.assigneeId || "unknown",
          workspaceId: issue.workspaceId,
          projectId: [],
          role: null,
          name: issue.assigneeId || "Unassigned",
          email: `${issue.assigneeId}@github.local`,
        };
      }
    }

    return c.json({
      data: {
        ...issue,
        project,
        assignee,
      },
    });
  })
  .post(
    "/bulk-update",
    sessionMiddleware,
    zValidator(
      "json",
      z.object({
        issues: z.array(
          z.object({
            $id: z.string(),
            status: z.nativeEnum(IssueStatus),
            position: z.number().int().positive().min(1000).max(1_000_000),
          }),
        ),
      }),
    ),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { issues } = c.req.valid("json");

      // const issueToUpdate = await databases.listDocuments<Task>(
      //   DATABASE_ID,
      //   ISSUES_ID,
      //   [
      //     Query.contains(
      //       "$id",
      //       issues.map((issue) => issue.$id),
      //     ),
      //   ],
      // );

      const issuePromises = issues.map((issue) =>
        databases.getDocument<Issue>(DATABASE_ID, ISSUES_ID, issue.$id),
      );
      const issueToUpdate = {
        documents: (
          await Promise.all(issuePromises.map((p) => p.catch(() => null)))
        ).filter(Boolean),
      };
      const workspaceIds = new Set(
        issueToUpdate.documents.map((issue) => issue?.workspaceId),
      );

      if (workspaceIds.size !== 1) {
        return c.json(
          {
            error: "All issues must belong to the same workspace",
          },
          400,
        );
      }
      const workspaceId = workspaceIds.values().next().value;
      if (!workspaceId) {
        return c.json({ error: "Workspace Id is required" }, 400);
      }

      // Check if user is a super admin
      const isSuper = await isSuperAdmin({ databases, userId: user.$id });
      let member = null;

      if (!isSuper) {
        member = await getMember({
          databases,
          workspaceId,
          userId: user.$id,
        });
        if (!member) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        // Check if user is a member of all projects that contain the issues being updated
        const userProjectIds = member.projectId || [];
        const issueProjectIds = new Set(
          issueToUpdate.documents
            .map((issue) => issue?.projectId)
            .filter(Boolean),
        );

        const unauthorizedProjects = Array.from(issueProjectIds).filter(
          (projectId) => projectId && !userProjectIds.includes(projectId),
        );

        if (unauthorizedProjects.length > 0) {
          return c.json(
            {
              error: "Unauthorized access to some project issues",
              unauthorizedProjects,
            },
            403,
          );
        }
      }

      for (const update of issues) {
        const existing = issueToUpdate.documents.find(
          (i) => i && i.$id === update.$id,
        );
        if (!existing) {
          continue;
        }

        const isMovingToDone =
          update.status === "DONE" && existing.status !== "DONE";

        // Check permissions for moving to DONE (only super admin or admin can do this)
        if (isMovingToDone && !isSuper && member?.role !== "ADMIN") {
          return c.json({ error: "Only Admin can move issue to Done" }, 403);
        }

        if (isMovingToDone && (isSuper || member?.role === "ADMIN") && existing.issueType === "github") {
          const project = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            existing.projectId,
          );

          // Use installation token for the read; user token for the write
          const readToken =
            (await getInstallationToken(workspaceId)) ||
            (await getAccessToken(user.$id));
          const writeToken = await getAccessToken(user.$id);

          if (readToken && project.owner) {
            const issuesFromGit = await listRepositoryIssues(
              readToken,
              project.owner,
              project.name,
            );

            const currentIssue = issuesFromGit.find(
              (issue) => issue.title === existing.name,
            );

            if (currentIssue && writeToken) {
              await updateIssue(
                writeToken,
                project.owner,
                project.name,
                currentIssue.number,
                { state: "closed" },
              );
            }
          }
        }
      }

      const updatedTasks = await Promise.all(
        issues.map(async (issue) => {
          const { $id, position, status } = issue;
          return databases.updateDocument<Issue>(DATABASE_ID, ISSUES_ID, $id, {
            status,
            position,
          });
        }),
      );

      return c.json({ data: updatedTasks });
    },
  )
  .post(
    "/fetch-issues",
    sessionMiddleware,
    zValidator("json", z.object({ projectId: z.string().nullish() })),
    async (c) => {
      try {
        const { projectId } = c.req.valid("json");
        const databases = c.get("databases");
        const user = c.get("user");
        if (!projectId) {
          return c.json({ error: "Project ID is required" }, 400);
        }

        const project = await databases.getDocument<Project>(
          DATABASE_ID,
          PROJECTS_ID,
          projectId,
        );

        if (project.projectType === "vaiu" || !project.owner) {
          return c.json(
            {
              error:
                "GitHub sync is only available for GitHub-linked projects.",
            },
            400,
          );
        }

        // Check if user is a super admin
        const isSuper = await isSuperAdmin({ databases, userId: user.$id });

        if (!isSuper) {
          // Check if user is a member of the workspace and project
          const member = await getMember({
            databases,
            workspaceId: project.workspaceId,
            userId: user.$id,
          });

          if (!member) {
            return c.json({ error: "Unauthorized" }, 401);
          }

          // Check if user is a member of the project
          const userProjectIds = member.projectId || [];
          if (!userProjectIds.includes(projectId)) {
            return c.json(
              { error: "Unauthorized access to this project" },
              403,
            );
          }
        }

        // Prefer installation token for reads; fall back to user OAuth token
        const githubToken =
          (await getInstallationToken(project.workspaceId)) ||
          (await getAccessToken(user.$id));

        if (!githubToken) {
          return c.json(
            {
              error: "GitHub not connected. Connect GitHub in workspace settings or sign in with GitHub.",
            },
            400,
          );
        }

        const issuesFromGit = await listRepositoryIssues(
          githubToken,
          project.owner,
          project.name,
          "all", // Get both open and closed issues for sync
        );

        const issuesFromDb = await databases.listDocuments<Issue>(
          DATABASE_ID,
          ISSUES_ID,
          [Query.equal("projectId", projectId)],
        );

        // Check for new issues to create (only open issues)
        const openIssuesFromGit = issuesFromGit.filter(
          (issue) => issue.state === "open",
        );

        const issuesToCreate = openIssuesFromGit.filter((gitIssue) => {
          return !issuesFromDb.documents.some(
            (dbIssue) =>
              dbIssue.number === gitIssue.number ||
              dbIssue.name === gitIssue.title,
          );
        });

        // Check for status updates (GitHub issues that were closed should be marked as DONE)
        const issuesToUpdate = issuesFromDb.documents.filter((dbIssue) => {
          const gitIssue = issuesFromGit.find(
            (issue) =>
              issue.number === dbIssue.number || issue.title === dbIssue.name,
          );

          if (gitIssue) {
            // Only update if GitHub issue is closed but DB issue is not DONE
            if (
              gitIssue.state === "closed" &&
              dbIssue.status !== IssueStatus.DONE
            ) {
              return true;
            }
            // Only update if GitHub issue is reopened AND the DB issue was marked as DONE
            // This prevents overwriting IN_PROGRESS, IN_REVIEW, etc.
            if (
              gitIssue.state === "open" &&
              dbIssue.status === IssueStatus.DONE
            ) {
              return true;
            }
            // If DB issue is missing the number, update it (metadata only)
            if (!dbIssue.number && gitIssue.number) {
              return true;
            }
          }
          return false;
        });

        // Update existing issues with status changes in batches
        const UPDATE_BATCH_SIZE = 50;
        const updatedIssues = [];

        for (let i = 0; i < issuesToUpdate.length; i += UPDATE_BATCH_SIZE) {
          const batch = issuesToUpdate.slice(i, i + UPDATE_BATCH_SIZE);

          const batchResults = await Promise.all(
            batch.map(async (dbIssue) => {
              try {
                const gitIssue = issuesFromGit.find(
                  (issue) =>
                    issue.number === dbIssue.number || issue.title === dbIssue.name,
                );

                if (gitIssue) {
                  const updates: Partial<Issue> = {};

                  // Only update status if GitHub is closed (DB → DONE)
                  // OR if DB is DONE but GitHub reopened (DONE → TODO)
                  if (
                    gitIssue.state === "closed" &&
                    dbIssue.status !== IssueStatus.DONE
                  ) {
                    updates.status = IssueStatus.DONE;
                  } else if (
                    gitIssue.state === "open" &&
                    dbIssue.status === IssueStatus.DONE
                  ) {
                    // Reopened issue: revert from DONE to TODO only
                    updates.status = IssueStatus.TODO;
                  }

                  // Update number if missing
                  if (!dbIssue.number && gitIssue.number) {
                    updates.number = gitIssue.number;
                  }

                  // Only update if there are changes
                  if (Object.keys(updates).length > 0) {
                    return databases.updateDocument(
                      DATABASE_ID,
                      ISSUES_ID,
                      dbIssue.$id,
                      updates,
                    );
                  }
                }
                return null;
              } catch (error) {
                console.error(`Failed to update issue ${dbIssue.$id}:`, error);
                return null;
              }
            }),
          );

          updatedIssues.push(...batchResults.filter(Boolean));
        }

        // Helper function to find member by GitHub username
        const findMemberByGithubUsername = async (githubUsername: string) => {
          // For now, we'll just use the GitHub username as assigneeId
          // In the future, this could be enhanced to match against user profiles
          // that have GitHub usernames stored
          return githubUsername;
        };

        // Create new issues in batches to avoid overwhelming the database
        const CREATE_BATCH_SIZE = 50; // Process 50 issues at a time
        const newIssues = [];

        for (let i = 0; i < issuesToCreate.length; i += CREATE_BATCH_SIZE) {
          const batch = issuesToCreate.slice(i, i + CREATE_BATCH_SIZE);

          const batchResults = await Promise.all(
            batch.map(async (issue) => {
              try {
                let assigneeId = null;
                if (issue.assignee?.login) {
                  assigneeId = await findMemberByGithubUsername(
                    issue.assignee.login,
                  );
                }

                // Re-check existence by projectId + number to avoid race duplicates
                const existingWithNumber = await databases
                  .listDocuments<Issue>(DATABASE_ID, ISSUES_ID, [
                    Query.equal("projectId", projectId),
                    Query.equal("number", issue.number),
                  ])
                  .catch(() => ({ documents: [] as Issue[] }));

                if (existingWithNumber.documents.length > 0) {
                  return existingWithNumber.documents[0];
                }

                // Set due date to 2 weeks from today for imported issues
                const twoWeeksFromNow = new Date();
                twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

                return databases.createDocument(
                  DATABASE_ID,
                  ISSUES_ID,
                  ID.unique(),
                  {
                    name: issue.title,
                    description: issue.body || "",
                    status: IssueStatus.TODO,
                    dueDate: twoWeeksFromNow.toISOString(),
                    workspaceId: project.workspaceId,
                    projectId: projectId,
                    assigneeId: assigneeId,
                    position: 1000,
                    number: issue.number,
                  },
                );
              } catch (error) {
                console.error(`Failed to create issue ${issue.number}:`, error);
                return null; // Continue with other issues even if one fails
              }
            }),
          );

          newIssues.push(...batchResults.filter(Boolean));
        }

        return c.json({
          data: issuesFromGit,
          created: newIssues.length,
          updated: updatedIssues.filter(Boolean).length,
          summary: {
            newIssues: newIssues.length,
            updatedIssues: updatedIssues.filter(Boolean).length,
            totalGitHubIssues: issuesFromGit.length,
          },
        });
      } catch (error) {
        console.log("Error:", error);
        return c.json({ error: "An unexpected error occurred" }, 500);
      }
    },
  )
  .get("/:issueId/comments", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const { issueId } = c.req.param();

    const comments = await databases.listDocuments(DATABASE_ID, COMMENTS_ID, [
      Query.equal("issueId", issueId),
      Query.orderDesc("$createdAt"),
    ]);

    return c.json({ data: comments });
  })
  .post(
    "/:issueId/comments",
    sessionMiddleware,
    zValidator("json", createCommentSchema),
    async (c) => {
      try {
        const databases = c.get("databases");
        const user = c.get("user");
        const storage = c.get("storage");

        const { issueId } = c.req.param();
        const { text, attachment } = c.req.valid("json");

        let uploadedImage: string | undefined;

        if (attachment instanceof File) {
          const file = await storage.createFile(
            IMAGES_BUCKET_ID,
            ID.unique(),
            attachment,
          );

          const buffer: ArrayBuffer = await storage.getFilePreview(
            IMAGES_BUCKET_ID,
            file.$id,
          );

          uploadedImage = `data:image/png;base64,${Buffer.from(buffer).toString(
            "base64",
          )}`;
        }

        const comment = await databases.createDocument(
          DATABASE_ID,
          COMMENTS_ID,
          ID.unique(),
          {
            text,
            issueId,
            userId: user.$id,
            username: user.name,
            attachment: uploadedImage,
          },
        );

        return c.json({ data: comment });
      } catch (error) {
        console.error("Error creating comment:", error);
        return c.json({ error: "Failed to create comment" }, 500);
      }
    },
  );

export default app;
