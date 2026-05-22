import { Hono } from "hono";
import { createHmac, timingSafeEqual } from "crypto";
import { type Databases as DatabasesType } from "node-appwrite";
import { Query, ID } from "node-appwrite";

import { createAdminClient } from "@/lib/appwrite";
import { DATABASE_ID, WORKSPACE_ID, PROJECTS_ID, ISSUES_ID, PR_ID } from "@/config";
import { IssueStatus } from "@/features/issues/types";
import { PrStatus } from "@/features/pull-requests/types";
import { getInstallation } from "@/lib/github-app";

const app = new Hono()
  // ── GitHub App installation callback ──────────────────────────────────────
  // Uses admin client because the auth cookie (SameSite=Strict) is not sent
  // on cross-site redirects from github.com
  .get("/app/callback", async (c) => {
    const installationId = c.req.query("installation_id");
    const setupAction = c.req.query("setup_action");
    const workspaceId = c.req.query("state");

    if (setupAction !== "install" && setupAction !== "update") {
      return c.redirect("/");
    }

    if (!installationId || !workspaceId) {
      return c.redirect("/?error=missing_params");
    }

    const { databases } = await createAdminClient();

    try {
      // Verify workspace exists
      await databases.getDocument(DATABASE_ID, WORKSPACE_ID, workspaceId);

      // Fetch installation details from GitHub
      const installation = await getInstallation(parseInt(installationId, 10));

      const accountLogin =
        installation.account && "login" in installation.account
          ? installation.account.login
          : null;

      const accountType =
        installation.account && "type" in installation.account
          ? installation.account.type
          : null;

      // Save to workspace
      await databases.updateDocument(DATABASE_ID, WORKSPACE_ID, workspaceId, {
        githubInstallationId: String(installationId),
        githubAccountLogin: accountLogin,
        githubAccountType: accountType,
      });

      return c.redirect(`/workspaces/${workspaceId}?github=connected`);
    } catch (error) {
      console.error("GitHub App callback error:", error);
      return c.redirect("/?error=github_callback_failed");
    }
  })
  // ── GitHub webhook handler ─────────────────────────────────────────────────
  // Uses admin client because this is called by GitHub's servers, not a browser
  .post("/webhooks", async (c) => {
    const rawBody = await c.req.text();
    const signature = c.req.header("x-hub-signature-256");

    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret || !signature) {
      return c.json({ error: "Invalid signature" }, 401);
    }

    const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
    let valid = false;
    try {
      valid = timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      valid = false;
    }
    if (!valid) {
      return c.json({ error: "Invalid signature" }, 401);
    }

    const event = c.req.header("x-github-event");
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return c.json({ error: "Invalid JSON" }, 400);
    }

    const installationId = (payload.installation as { id?: number })?.id;
    if (!installationId) return c.json({ ok: true });

    const { databases } = await createAdminClient();

    try {
      // Find workspace by installation ID
      const workspaces = await databases.listDocuments(DATABASE_ID, WORKSPACE_ID, [
        Query.equal("githubInstallationId", String(installationId)),
        Query.limit(1),
      ]);
      const workspace = workspaces.documents[0];
      if (!workspace) return c.json({ ok: true });

      // Find the repo in the payload
      const repo = payload.repository as { name?: string; owner?: { login?: string } } | undefined;
      if (!repo?.name || !repo?.owner?.login) return c.json({ ok: true });

      // Find the matching project
      const projects = await databases.listDocuments(DATABASE_ID, PROJECTS_ID, [
        Query.equal("workspaceId", workspace.$id),
        Query.equal("name", repo.name),
        Query.equal("owner", repo.owner.login),
        Query.limit(1),
      ]);
      const project = projects.documents[0];
      if (!project) return c.json({ ok: true });

      if (event === "issues") {
        await handleIssueEvent(databases, payload, workspace.$id, project.$id);
      } else if (event === "pull_request") {
        await handlePullRequestEvent(databases, payload, workspace.$id, project.$id);
      }

      return c.json({ ok: true });
    } catch (error) {
      console.error("Webhook processing error:", error);
      return c.json({ error: "Webhook processing failed" }, 500);
    }
  });

// ── Issue event ────────────────────────────────────────────────────────────

async function handleIssueEvent(
  databases: DatabasesType,
  payload: Record<string, unknown>,
  workspaceId: string,
  projectId: string,
) {
  const action = payload.action as string;
  const issue = payload.issue as {
    number: number;
    title: string;
    body?: string;
    state: "open" | "closed";
  };

  if (!["opened", "closed", "reopened", "edited"].includes(action)) return;

  const status: IssueStatus = issue.state === "closed" ? IssueStatus.DONE : IssueStatus.BACKLOG;

  const existing = await databases.listDocuments(DATABASE_ID, ISSUES_ID, [
    Query.equal("projectId", projectId),
    Query.equal("number", issue.number),
    Query.limit(1),
  ]);

  if (existing.documents.length > 0) {
    await databases.updateDocument(DATABASE_ID, ISSUES_ID, existing.documents[0].$id, {
      name: issue.title,
      status,
    });
  } else if (action === "opened") {
    const highest = await databases.listDocuments(DATABASE_ID, ISSUES_ID, [
      Query.equal("status", IssueStatus.BACKLOG),
      Query.equal("workspaceId", workspaceId),
      Query.orderDesc("position"),
      Query.limit(1),
    ]);
    const position = highest.documents.length > 0
      ? highest.documents[0].position + 1000
      : 1000;

    await databases.createDocument(DATABASE_ID, ISSUES_ID, ID.unique(), {
      name: issue.title,
      issueType: "github",
      status,
      workspaceId,
      projectId,
      number: issue.number,
      position,
      dueDate: null,
    });
  }
}

// ── Pull request event ─────────────────────────────────────────────────────

async function handlePullRequestEvent(
  databases: DatabasesType,
  payload: Record<string, unknown>,
  workspaceId: string,
  projectId: string,
) {
  const action = payload.action as string;
  const pr = payload.pull_request as {
    number: number;
    title: string;
    state: "open" | "closed";
    merged_at?: string | null;
    html_url: string;
    user?: { login?: string };
  };

  if (!["opened", "closed", "reopened"].includes(action)) return;

  let status: PrStatus;
  if (pr.state === "closed") {
    status = pr.merged_at ? PrStatus.MERGED : PrStatus.CLOSED;
  } else {
    status = PrStatus.OPEN;
  }

  const existing = await databases.listDocuments(DATABASE_ID, PR_ID, [
    Query.equal("projectId", projectId),
    Query.equal("number", pr.number),
    Query.limit(1),
  ]);

  if (existing.documents.length > 0) {
    await databases.updateDocument(DATABASE_ID, PR_ID, existing.documents[0].$id, {
      title: pr.title,
      status,
    });
  } else if (action === "opened") {
    await databases.createDocument(DATABASE_ID, PR_ID, ID.unique(), {
      title: pr.title,
      status,
      workspaceId,
      projectId,
      number: pr.number,
      author: pr.user?.login ?? "unknown",
      url: pr.html_url,
    });
  }
}

export default app;
