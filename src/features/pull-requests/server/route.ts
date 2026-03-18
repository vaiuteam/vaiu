import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { sessionMiddleware } from "@/lib/session-middleware";
import { getProjectAccess } from "@/features/members/utilts";
import { DATABASE_ID, PROJECTS_ID, PR_ID, AI_TESTS_ID } from "@/config";
import { Project } from "@/features/projects/types";
import { Octokit, RequestError } from "octokit";
import { PrStatus } from "../types";
import {
  getAccessToken,
  getInstallationToken,
  listPullRequests,
  createPullRequest,
  checkCollaborator,
  addIssueAssignees,
  getAuthenticatedUser,
} from "@/lib/github-api";
import { createPrSchema } from "../schemas";
import { ID, Query, type Databases } from "node-appwrite";
import { AIReview } from "../types-ai";
import { AITestGeneration, TestStatus, TestType } from "../types-tests";
import { analyzeWithGemini, PRAnalysisInput, generateTestCases } from "@/lib/ai-service";

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
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({
      workspaceId: z.string(),
      projectId: z.string(),
      status: z.nativeEnum(PrStatus).nullish(),
      search: z.string().nullish(),
    })),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId, projectId, status, search } = c.req.valid("query");

      const { project, access } = await getProjectContext({
        databases,
        userId: user.$id,
        projectId,
      });

      if (!project) {
        return c.json({ error: "Project not found" }, 404);
      }

      if (project.workspaceId !== workspaceId) {
        return c.json({ error: "Project does not belong to this workspace" }, 400);
      }

      if (!access.hasAccess) {
        return c.json({ error: "Forbidden" }, 403);
      }

      // Prefer installation token (workspace-level); fall back to user OAuth token
      const githubToken =
        (await getInstallationToken(workspaceId)) ||
        (await getAccessToken(user.$id));

      if (!githubToken) {
        return c.json({
          error: "GitHub not connected. Connect GitHub in workspace settings or sign in with GitHub.",
        }, 400);
      }

      try {
        const prsFromGit = await listPullRequests(
          githubToken,
          project.owner,
          project.name,
          "all"
        );

        let pullRequests = prsFromGit.map((pr) => {
          let prStatus = PrStatus.OPEN;
          if (pr.state === "closed") {
            prStatus = pr.merged_at ? PrStatus.MERGED : PrStatus.CLOSED;
          }

          return {
            $id: String(pr.id),
            title: pr.title,
            status: prStatus,
            author: pr.user?.login || "unknown",
            assignee: pr.assignee?.login,
            url: pr.html_url,
            number: pr.number,
            $createdAt: pr.created_at,
            $updatedAt: pr.updated_at,
            $mergedAt: pr.merged_at,
            $collectionId: "",
            $databaseId: "",
            $permissions: [],
          };
        });

        // Apply filters
        if (status) {
          pullRequests = pullRequests.filter((pr) => pr.status === status);
        }

        if (search) {
          const searchLower = search.toLowerCase();
          pullRequests = pullRequests.filter((pr) =>
            pr.title.toLowerCase().includes(searchLower) ||
            pr.author.toLowerCase().includes(searchLower) ||
            (pr.assignee && pr.assignee.toLowerCase().includes(searchLower))
          );
        }

        return c.json({
          data: {
            documents: pullRequests,
            total: pullRequests.length,
          },
        });
      } catch (error) {
        console.error("Failed to fetch pull requests:", error);
        return c.json({ error: "Failed to fetch pull requests" }, 500);
      }
    }
  )
  .post(
    "/:projectId/submit-pull-request",
    sessionMiddleware,
    zValidator("form", createPrSchema),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");

      const { projectId } = c.req.param();

      const { title, description, branch, baseBranch, githubUsername } =
        c.req.valid("form");

      if (!title || !description || !branch || !baseBranch || !githubUsername) {
        return c.json(
          {
            error:
              "Title, description, branch, base branch and GitHub username are required",
          },
          400
        );
      }

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

      // Get GitHub OAuth access token
      const githubToken = await getAccessToken(user.$id);

      if (!githubToken) {
        return c.json({
          error: "GitHub account not connected. Cannot create pull request."
        }, 400);
      }

      try {
        // Get authenticated GitHub user
        const authenticatedGithubUser = await getAuthenticatedUser(githubToken);
        if (!authenticatedGithubUser) {
          return c.json({ error: "Failed to authenticate with GitHub" }, 500);
        }

        // Check if user is a collaborator on the repository
        const isCollaborator = await checkCollaborator(
          githubToken,
          project.owner,
          project.name,
          authenticatedGithubUser.login
        );

        if (!isCollaborator) {
          return c.json({
            error: "You must be a collaborator on this repository to create pull requests"
          }, 403);
        }

        const createPR = await createPullRequest(
          githubToken,
          project.owner,
          project.name,
          title,
          branch,
          baseBranch,
          description
        );

        // Add assignee and persist to database in parallel
        await Promise.all([
          addIssueAssignees(
            githubToken,
            project.owner,
            project.name,
            createPR.number,
            [githubUsername]
          ),
          databases.createDocument(DATABASE_ID, PR_ID, ID.unique(), {
            title,
            description,
            branch,
            baseBranch,
            githubUsername,
            projectId,
          })
        ]);

        return c.json(
          {
            success: true,
            data: {
              pullRequest: createPR,
            },
          },
          200
        );
      } catch (error) {
        if (error instanceof RequestError) {
          console.error("Failed to create PR:", error);

          if (error.status === 422) {
            const response = error.response?.data as { errors?: { message?: string }[] };
            if (
              response?.errors?.[0]?.message?.includes(
                "A pull request already exists"
              )
            ) {
              return c.json(
                { error: "A pull request for this branch already exists." },
                422
              );
            }
          }

          return c.json({ error: "Failed to create PR" }, 500);
        } else {
          console.error("Unexpected error:", error);
          return c.json({ error: "An unexpected error occurred." }, 500);
        }
      }
    }
  )
  .post(
    "/:projectId/ai-review/:prNumber",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { projectId, prNumber } = c.req.param();

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

        // Get GitHub OAuth access token
        const githubToken = await getAccessToken(user.$id);

        if (!githubToken) {
          return c.json({
            error: "GitHub account not connected. Cannot generate AI review."
          }, 400);
        }

        // Start AI review analysis
        const aiReview = await generateAIReview({
          projectId,
          prNumber: parseInt(prNumber),
          project,
          githubToken,
        });

        return c.json({ success: true, review: aiReview });
      } catch (error) {
        console.error("AI Review failed:", error);
        return c.json({ error: "Failed to generate AI review" }, 500);
      }
    }
  )
  .post(
    "/:projectId/generate-tests/:prNumber",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { projectId, prNumber } = c.req.param();

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

        // Get GitHub OAuth access token
        const githubToken = await getAccessToken(user.$id);

        if (!githubToken) {
          return c.json({
            error: "GitHub account not connected. Cannot generate tests."
          }, 400);
        }

        // Check if tests were recently generated (within last 5 minutes) to prevent spamming
        const recentTests = await databases.listDocuments(
          DATABASE_ID,
          AI_TESTS_ID,
          [
            Query.equal("projectId", projectId),
            Query.equal("prNumber", parseInt(prNumber)),
            Query.orderDesc("$createdAt"),
            Query.limit(1),
          ]
        );

        if (recentTests.documents.length > 0) {
          const lastGenerated = new Date(recentTests.documents[0].$createdAt);
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

          if (lastGenerated > fiveMinutesAgo) {
            return c.json({
              error: "Tests were recently generated. Please wait 5 minutes before generating again.",
              lastGenerated: lastGenerated.toISOString()
            }, 429);
          }
        }

        // Generate AI test cases
        const testGeneration = await generateAITests({
          projectId,
          prNumber: parseInt(prNumber),
          project,
          githubToken,
        });

        // Persist the generated tests to database asynchronously (don't wait)
        persistGeneratedTests(databases, testGeneration, projectId, parseInt(prNumber))
          .catch(error => {
            console.error("Failed to persist tests to database:", error);
          });

        return c.json({ success: true, tests: testGeneration });
      } catch (error) {
        console.error("Test generation failed:", error);
        return c.json({ error: "Failed to generate test cases" }, 500);
      }
    }
  )
  .get(
    "/:projectId/tests/:prNumber",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { projectId, prNumber } = c.req.param();

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

        const tests = await databases.listDocuments(
          DATABASE_ID,
          AI_TESTS_ID,
          [
            Query.equal("projectId", projectId),
            Query.equal("prNumber", parseInt(prNumber)),
            Query.equal("isDeleted", false),
          ]
        );

        return c.json({
          data: tests.documents.map((t) => ({
            $id: t.$id,
            $createdAt: t.$createdAt,
            $updatedAt: t.$updatedAt,
            id: t.$id,
            projectId: t.projectId,
            prNumber: t.prNumber,
            scenarioId: t.scenarioId,
            title: t.title,
            description: t.description,
            type: t.type,
            prerequisites: t.prerequisites,
            priority: t.priority,
            reasoning: t.reasoning,
            edgeCases: t.edgeCases,
            isCustom: t.isCustom,
            isDeleted: t.isDeleted,
            status: t.status,
          })),
        });
      } catch (error) {
        console.error("Failed to fetch tests:", error);
        return c.json({ error: "Failed to fetch tests" }, 500);
      }
    }
  )
  .post(
    "/:projectId/tests/:prNumber",
    sessionMiddleware,
    zValidator("json", z.object({
      title: z.string(),
      description: z.string(),
      type: z.nativeEnum(TestType),
      prerequisites: z.array(z.string()),
      priority: z.enum(["low", "medium", "high", "critical"]),
      reasoning: z.string(),
      edgeCases: z.array(z.string()),
      scenarioId: z.string(),
    })),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { projectId, prNumber } = c.req.param();
      const testData = c.req.valid("json");

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

        const newTest = await databases.createDocument(
          DATABASE_ID,
          AI_TESTS_ID,
          ID.unique(),
          {
            projectId,
            prNumber: parseInt(prNumber),
            ...testData,
            isCustom: true,
            isDeleted: false,
            status: TestStatus.UNTESTED,
          }
        );

        return c.json({
          data: {
            $id: newTest.$id,
            $createdAt: newTest.$createdAt,
            $updatedAt: newTest.$updatedAt,
            id: newTest.$id,
            projectId: newTest.projectId,
            prNumber: newTest.prNumber,
            scenarioId: newTest.scenarioId,
            title: newTest.title,
            description: newTest.description,
            type: newTest.type,
            prerequisites: newTest.prerequisites,
            priority: newTest.priority,
            reasoning: newTest.reasoning,
            edgeCases: newTest.edgeCases,
            isCustom: newTest.isCustom,
            isDeleted: newTest.isDeleted,
            status: newTest.status,
          },
        });
      } catch (error) {
        console.error("Failed to create test:", error);
        return c.json({ error: "Failed to create test" }, 500);
      }
    }
  )
  .patch(
    "/:projectId/tests/:testId",
    sessionMiddleware,
    zValidator("json", z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      type: z.nativeEnum(TestType).optional(),
      prerequisites: z.array(z.string()).optional(),
      priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      reasoning: z.string().optional(),
      edgeCases: z.array(z.string()).optional(),
      status: z.nativeEnum(TestStatus).optional(),
    })),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { projectId, testId } = c.req.param();
      const updates = c.req.valid("json");

      try {
        const test = await databases.getDocument(
          DATABASE_ID,
          AI_TESTS_ID,
          testId
        );

        if (!test) {
          return c.json({ error: "Test not found" }, 404);
        }

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

        const updatedTest = await databases.updateDocument(
          DATABASE_ID,
          AI_TESTS_ID,
          testId,
          updates
        );

        return c.json({
          data: {
            $id: updatedTest.$id,
            $createdAt: updatedTest.$createdAt,
            $updatedAt: updatedTest.$updatedAt,
            id: updatedTest.$id,
            projectId: updatedTest.projectId,
            prNumber: updatedTest.prNumber,
            scenarioId: updatedTest.scenarioId,
            title: updatedTest.title,
            description: updatedTest.description,
            type: updatedTest.type,
            prerequisites: updatedTest.prerequisites,
            priority: updatedTest.priority,
            reasoning: updatedTest.reasoning,
            edgeCases: updatedTest.edgeCases,
            isCustom: updatedTest.isCustom,
            isDeleted: updatedTest.isDeleted,
            status: updatedTest.status,
          },
        });
      } catch (error) {
        console.error("Failed to update test:", error);
        return c.json({ error: "Failed to update test" }, 500);
      }
    }
  )
  .delete(
    "/:projectId/tests/:testId",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { projectId, testId } = c.req.param();

      try {
        const test = await databases.getDocument(
          DATABASE_ID,
          AI_TESTS_ID,
          testId
        );

        if (!test) {
          return c.json({ error: "Test not found" }, 404);
        }

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

        await databases.deleteDocument(
          DATABASE_ID,
          AI_TESTS_ID,
          testId
        );

        return c.json({ success: true });
      } catch (error) {
        console.error("Failed to delete test:", error);
        return c.json({ error: "Failed to delete test" }, 500);
      }
    }
  );

async function generateAIReview({
  projectId,
  prNumber,
  project,
  githubToken,
}: {
  projectId: string;
  prNumber: number;
  project: Project;
  githubToken: string;
}): Promise<AIReview> {
  try {
    const octokit = new Octokit({ auth: githubToken });

    // Fetch all GitHub data in parallel for faster response
    const [
      { data: pr },
      { data: files },
      { data: reviews },
      { data: repo }
    ] = await Promise.all([
      octokit.rest.pulls.get({
        owner: project.owner,
        repo: project.name,
        pull_number: prNumber,
      }),
      octokit.rest.pulls.listFiles({
        owner: project.owner,
        repo: project.name,
        pull_number: prNumber,
      }),
      octokit.rest.pulls.listReviews({
        owner: project.owner,
        repo: project.name,
        pull_number: prNumber,
      }),
      octokit.rest.repos.get({
        owner: project.owner,
        repo: project.name,
      })
    ]);

    // Optimize: Sort files by changes (most changed first) and limit to top 30
    const sortedFiles = files
      .sort((a, b) => b.changes - a.changes)
      .slice(0, 30);

    const analysisInput: PRAnalysisInput = {
      prTitle: pr.title,
      prDescription: pr.body || "No description provided",
      files: sortedFiles.map(file => ({
        filename: file.filename,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch,
        status: file.status
      })),
      prUrl: pr.html_url,
      repoName: `${project.owner}/${project.name}`,
      baseBranch: pr.base.ref,
      headBranch: pr.head.ref,
      existingReviews: reviews.slice(0, 5).map(review => ({ // Limit to 5 most recent reviews
        user: review.user?.login || 'Unknown',
        state: review.state,
        body: review.body ? review.body.substring(0, 300) : '', // Limit review body to 300 chars
        submittedAt: review.submitted_at || new Date().toISOString()
      })),
      repoInfo: {
        language: repo.language,
        description: repo.description,
        topics: repo.topics || [],
        size: repo.size,
        defaultBranch: repo.default_branch
      }
    };

    const analysis = await analyzeWithGemini(analysisInput);

    const aiReview: AIReview = {
      id: ID.unique(),
      prNumber: pr.number,
      prTitle: pr.title,
      prUrl: pr.html_url,
      projectId,
      summary: analysis.summary,
      codeQuality: analysis.codeQuality,
      security: analysis.security,
      performance: analysis.performance,
      architecture: analysis.architecture,
      projectContext: analysis.projectContext,
      createdAt: new Date().toISOString(),
      analysisVersion: "1.0.0",
    };

    return aiReview;
  } catch (error) {
    console.error("Failed to generate AI review:", error);
    throw error;
  }
}

async function generateAITests({
  projectId,
  prNumber,
  project,
  githubToken,
}: {
  projectId: string;
  prNumber: number;
  project: Project;
  githubToken: string;
}): Promise<AITestGeneration> {
  try {
    const octokit = new Octokit({ auth: githubToken });

    // Fetch all GitHub data in parallel for faster response
    const [
      { data: pr },
      { data: files },
      { data: commits },
      { data: repo }
    ] = await Promise.all([
      octokit.rest.pulls.get({
        owner: project.owner,
        repo: project.name,
        pull_number: prNumber,
      }),
      octokit.rest.pulls.listFiles({
        owner: project.owner,
        repo: project.name,
        pull_number: prNumber,
      }),
      octokit.rest.pulls.listCommits({
        owner: project.owner,
        repo: project.name,
        pull_number: prNumber,
      }),
      octokit.rest.repos.get({
        owner: project.owner,
        repo: project.name,
      })
    ]);

    // Optimize: Limit to top 15 most changed files and truncate patches
    const sortedFiles = files
      .sort((a, b) => b.changes - a.changes)
      .slice(0, 15); // Reduced from 30 to 15 to avoid overloading

    const testGenerationInput = {
      prTitle: pr.title,
      prDescription: (pr.body || "No description provided").slice(0, 500), // Limit description
      prUrl: pr.html_url,
      files: sortedFiles.map(file => ({
        filename: file.filename,
        status: file.status as "added" | "modified" | "removed",
        additions: file.additions,
        deletions: file.deletions,
        patch: file.patch ? file.patch.slice(0, 1000) : undefined, // Limit patch size to 1000 chars
      })),
      commitMessages: commits.slice(0, 10).map(commit => commit.commit.message.slice(0, 200)), // Limit to 10 commits, 200 chars each
      author: pr.user?.login || "unknown",
      repoInfo: {
        language: repo.language,
        name: `${project.owner}/${project.name}`,
      },
    };

    const testGeneration = await generateTestCases(testGenerationInput);

    const aiTestGeneration: AITestGeneration = {
      id: ID.unique(),
      prNumber: pr.number,
      prTitle: pr.title,
      prUrl: pr.html_url,
      projectId,
      summary: testGeneration.summary,
      scenarios: testGeneration.scenarios,
      context: {
        filesChanged: files.map(file => ({
          filename: file.filename,
          status: file.status as "added" | "modified" | "removed",
          additions: file.additions,
          deletions: file.deletions,
        })),
        commitMessages: commits.map(commit => commit.commit.message),
        prDescription: pr.body || "No description provided",
        author: pr.user?.login || "unknown",
      },
      createdAt: new Date().toISOString(),
      generationVersion: "1.0.0",
    };

    return aiTestGeneration;
  } catch (error) {
    console.error("Failed to generate AI tests:", error);
    throw error;
  }
}

// Helper to persist generated tests
async function persistGeneratedTests(
  databases: Databases,
  testGeneration: AITestGeneration,
  projectId: string,
  prNumber: number
) {
  const testPromises = testGeneration.scenarios.flatMap(scenario =>
    scenario.testCases.map(testCase =>
      databases.createDocument(
        DATABASE_ID,
        AI_TESTS_ID,
        ID.unique(),
        {
          projectId,
          prNumber,
          scenarioId: scenario.id,
          title: testCase.title,
          description: testCase.description,
          type: testCase.type,
          prerequisites: testCase.prerequisites,
          priority: testCase.priority,
          reasoning: testCase.reasoning,
          edgeCases: testCase.edgeCases,
          isCustom: false,
          isDeleted: false,
        }
      )
    )
  );

  await Promise.all(testPromises);
}


export default app;
