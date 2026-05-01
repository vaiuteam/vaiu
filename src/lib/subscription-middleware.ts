import { Context, Next } from "hono";
import { checkSubscriptionLimit } from "@/features/subscriptions/utils";

export const checkWorkspaceLimit = async (c: Context, next: Next) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const limitCheck = await checkSubscriptionLimit({
        databases,
        userId: user.$id,
        limitType: "workspaces",
    });

    if (!limitCheck.allowed) {
        return c.json(
            {
                error: "Workspace limit reached",
                details: {
                    limit: limitCheck.limit,
                    current: limitCheck.current,
                    plan: limitCheck.plan,
                    message: `You have reached the maximum number of workspaces (${limitCheck.limit}) for your ${limitCheck.plan} plan. Please upgrade to create more workspaces.`,
                },
            },
            403
        );
    }

    await next();
};

export const checkProjectLimit = async (c: Context, next: Next) => {
    const databases = c.get("databases");
    const user = c.get("user");

    // Get workspaceId from the request
    let workspaceId: string | undefined;

    try {
        const body = await c.req.json();
        workspaceId = body.workspaceId;
    } catch {
        // If JSON parsing fails, might be form data
        try {
            const formData = await c.req.formData();
            workspaceId = formData.get("workspaceId") as string;
        } catch {
            // No workspace ID found
        }
    }

    if (!workspaceId) {
        return c.json({ error: "Workspace ID is required" }, 400);
    }

    const limitCheck = await checkSubscriptionLimit({
        databases,
        userId: user.$id,
        limitType: "projects",
        workspaceId,
    });

    if (!limitCheck.allowed) {
        return c.json(
            {
                error: "Project limit reached",
                details: {
                    limit: limitCheck.limit,
                    current: limitCheck.current,
                    plan: limitCheck.plan,
                    message: `You have reached the maximum number of projects (${limitCheck.limit}) for your ${limitCheck.plan} plan in this workspace. Please upgrade to create more projects.`,
                },
            },
            403
        );
    }

    await next();
};
