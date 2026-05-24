import { ID, Query, type Databases } from "node-appwrite";

import { DATABASE_ID, ISSUES_ID } from "@/config";
import { listRepositoryIssuesPage } from "@/lib/github-api";
import { Issue, IssueStatus } from "../types";

const GITHUB_PAGE_SIZE = 100;
const POSITION_STEP = 1000;
const WRITE_DELAY_MS = 250;
const WRITE_CONCURRENCY = 5;
const MAX_RETRY_ATTEMPTS = 8;
const MAX_RETRY_DELAY_MS = 30_000;

type GitHubIssue = Awaited<ReturnType<typeof listRepositoryIssuesPage>>["issues"][number];

interface SyncGithubIssueMetadataParams {
  databases: Databases;
  githubToken: string | null;
  owner: string;
  repo: string;
  workspaceId: string;
  projectId: string;
  state?: "open" | "closed" | "all";
}

interface SyncGithubIssueMetadataResult {
  created: number;
  updated: number;
  skipped: number;
  processed: number;
  totalGitHubIssues: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRateLimitError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as {
    code?: number;
    type?: string;
    response?: { code?: number; type?: string };
  };

  return (
    maybeError.code === 429 ||
    maybeError.response?.code === 429 ||
    maybeError.type?.includes("rate_limit") ||
    maybeError.response?.type?.includes("rate_limit")
  );
};

const retryDelay = (attempt: number) =>
  Math.min(MAX_RETRY_DELAY_MS, 1000 * 2 ** attempt);

async function withRateLimitRetry<T>(
  operation: () => Promise<T>,
  context: string,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isRateLimitError(error) || attempt === MAX_RETRY_ATTEMPTS - 1) {
        throw error;
      }

      const delay = retryDelay(attempt);
      console.warn(
        `${context} hit Appwrite rate limit. Retrying in ${delay}ms (attempt ${attempt + 1
        }/${MAX_RETRY_ATTEMPTS}).`,
      );
      await sleep(delay);
    }
  }

  throw lastError;
}

async function processWithConcurrency<T>(
  items: T[],
  concurrency: number,
  handler: (item: T) => Promise<void>,
) {
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    await Promise.all(chunk.map((item) => handler(item)));
  }
}

async function getNextPosition(
  databases: Databases,
  workspaceId: string,
  status: IssueStatus,
) {
  const highest = await withRateLimitRetry(
    () =>
      databases.listDocuments<Issue>(DATABASE_ID, ISSUES_ID, [
        Query.equal("workspaceId", workspaceId),
        Query.equal("status", status),
        Query.orderDesc("position"),
        Query.limit(1),
        Query.select(["position"]),
      ]),
    "Fetching highest issue position",
  );

  return highest.documents.length > 0
    ? highest.documents[0].position + POSITION_STEP
    : POSITION_STEP;
}

async function listExistingIssuesByNumber(
  databases: Databases,
  projectId: string,
  numbers: number[],
) {
  if (numbers.length === 0) return new Map<number, Issue>();

  const existing = await withRateLimitRetry(
    () =>
      databases.listDocuments<Issue>(DATABASE_ID, ISSUES_ID, [
        Query.equal("projectId", projectId),
        Query.equal("number", numbers),
        Query.limit(numbers.length),
      ]),
    "Fetching existing imported issues",
  );

  return new Map(
    existing.documents
      .filter((issue): issue is Issue & { number: number } => typeof issue.number === "number")
      .map((issue) => [issue.number, issue]),
  );
}

function nextStatusForExistingIssue(issue: Issue, gitIssue: GitHubIssue) {
  if (gitIssue.state === "closed" && issue.status !== IssueStatus.DONE) {
    return IssueStatus.DONE;
  }

  if (gitIssue.state === "open" && issue.status === IssueStatus.DONE) {
    return IssueStatus.BACKLOG;
  }

  return undefined;
}

function buildIssueCreatePayload({
  gitIssue,
  workspaceId,
  projectId,
  position,
}: {
  gitIssue: GitHubIssue;
  workspaceId: string;
  projectId: string;
  position: number;
}) {
  return {
    name: gitIssue.title,
    issueType: "github" as const,
    status: gitIssue.state === "closed" ? IssueStatus.DONE : IssueStatus.BACKLOG,
    dueDate: null,
    workspaceId,
    projectId,
    assigneeId: gitIssue.assignee?.login ?? null,
    position,
    number: gitIssue.number,
  };
}

export async function syncGithubIssueMetadata({
  databases,
  githubToken,
  owner,
  repo,
  workspaceId,
  projectId,
  state = "open",
}: SyncGithubIssueMetadataParams): Promise<SyncGithubIssueMetadataResult> {
  let page = 1;
  let nextPosition = await getNextPosition(databases, workspaceId, IssueStatus.BACKLOG);

  const summary: SyncGithubIssueMetadataResult = {
    created: 0,
    updated: 0,
    skipped: 0,
    processed: 0,
    totalGitHubIssues: 0,
  };

  while (true) {
    const { issues, hasNextPage } = await listRepositoryIssuesPage(
      githubToken,
      owner,
      repo,
      state,
      page,
      GITHUB_PAGE_SIZE,
    );

    if (issues.length === 0 && !hasNextPage) break;

    const existingByNumber = await listExistingIssuesByNumber(
      databases,
      projectId,
      issues.map((issue) => issue.number),
    );

    await processWithConcurrency(issues, WRITE_CONCURRENCY, async (gitIssue) => {
      summary.processed += 1;
      summary.totalGitHubIssues += 1;

      const existing = existingByNumber.get(gitIssue.number);

      if (existing) {
        const updates: Partial<Issue> = {};
        const nextStatus = nextStatusForExistingIssue(existing, gitIssue);

        if (existing.name !== gitIssue.title) {
          updates.name = gitIssue.title;
        }
        if (existing.issueType !== "github") {
          updates.issueType = "github";
        }
        if (nextStatus) {
          updates.status = nextStatus;
        }

        if (Object.keys(updates).length > 0) {
          await withRateLimitRetry(
            () =>
              databases.updateDocument(DATABASE_ID, ISSUES_ID, existing.$id, updates),
            `Updating imported issue #${gitIssue.number}`,
          );
          summary.updated += 1;
          await sleep(WRITE_DELAY_MS);
        } else {
          summary.skipped += 1;
        }

        return;
      }

      // Manual sync fetches all states, but we only create local metadata rows
      // for open issues. Closed issues are created later if GitHub reopens them.
      if (gitIssue.state !== "open") {
        summary.skipped += 1;
        return;
      }

      const position = nextPosition;
      nextPosition += POSITION_STEP;

      await withRateLimitRetry(
        () =>
          databases.createDocument<Issue>(
            DATABASE_ID,
            ISSUES_ID,
            ID.unique(),
            buildIssueCreatePayload({
              gitIssue,
              workspaceId,
              projectId,
              position,
            }),
          ),
        `Creating imported issue #${gitIssue.number}`,
      );
      summary.created += 1;
      await sleep(WRITE_DELAY_MS);
    });

    if (!hasNextPage) break;
    page += 1;
  }

  return summary;
}
