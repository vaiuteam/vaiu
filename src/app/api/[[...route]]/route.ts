import { Hono } from "hono";
import { handle } from "hono/vercel";

import auth from "@/features/auth/server/route";
import members from "@/features/members/server/route";
import workspaces from "@/features/workspaces/server/route";
import projects from "@/features/projects/server/route";
import issues from "@/features/issues/server/route";
import rooms from "@/features/channels/server/route";
import pullRequests from "@/features/pull-requests/server/route";
import notifications from "@/features/notifications/server/route";
import aiSummaries from "@/features/ai-summaries/server/route";
import profileAnalytics from "@/features/profile-analytics/server/route";
import profile from "@/features/profile/server/route";
import subscriptions from "@/features/subscriptions/server/route";
import contact from "@/features/contact/server/route";
import github from "@/features/github/server/route";

const app = new Hono().basePath("/api/v1");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route("/auth", auth)
  .route("/members", members)
  .route("/workspaces", workspaces)
  .route("/projects", projects)
  .route("/issues", issues)
  .route("/rooms", rooms)
  .route("/pull-requests", pullRequests)
  .route("/notifications", notifications)
  .route("/ai-summaries", aiSummaries)
  .route("/profile-analytics", profileAnalytics)
  .route("/profile", profile)
  .route("/subscriptions", subscriptions)
  .route("/contact", contact)
  .route("/github", github);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
