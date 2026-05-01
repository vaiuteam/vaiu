import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, SUBSCRIPTIONS_ID, USER_USAGE_ID, WORKSPACE_ID, PROJECTS_ID, ROOMS_ID } from "@/config";
import {
    createSubscriptionSchema,
    cancelSubscriptionSchema,
    verifyPaymentSchema,
} from "../schemas";
import {
    SubscriptionPlan,
    SubscriptionStatus,
    PLAN_PRICING,
    PLAN_LIMITS,
    Subscription,
} from "../types";
import {
    createRazorpaySubscription,
    cancelRazorpaySubscription,
    verifyRazorpaySignature,
} from "@/lib/razorpay";
import { getUserSubscription } from "../utils";

const app = new Hono()
    // Get current user's subscription
    .get("/current", sessionMiddleware, async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");

        try {
            const subscription = await getUserSubscription({
                databases,
                userId: user.$id,
            });

            // If no subscription exists, create a default FREE subscription
            if (!subscription) {
                const freeEndDate = new Date();
                freeEndDate.setDate(freeEndDate.getDate() + 30);

                const freeLimits = PLAN_LIMITS[SubscriptionPlan.FREE];
                const freePricing = PLAN_PRICING[SubscriptionPlan.FREE];

                const newSubscription = await databases.createDocument(
                    DATABASE_ID,
                    SUBSCRIPTIONS_ID,
                    ID.unique(),
                    {
                        userId: user.$id,
                        plan: SubscriptionPlan.FREE,
                        status: SubscriptionStatus.ACTIVE,
                        currentPeriodStart: new Date().toISOString(),
                        currentPeriodEnd: freeEndDate.toISOString(),
                        cancelAtPeriodEnd: false,
                        billingCycle: "MONTHLY",
                        workspaces: freeLimits.workspaces,
                        projectsPerWorkspace: freeLimits.projectsPerWorkspace,
                        membersPerWorkspace: freeLimits.membersPerWorkspace,
                        roomsPerWorkspace: freeLimits.roomsPerWorkspace,
                        aiCredits: freeLimits.aiCredits,
                        aiCreditsPerUser: freeLimits.aiCreditsPerUser,
                        monthlyPrice: freePricing.monthly,
                        yearlyPrice: freePricing.yearly,
                        durationDays: freeLimits.durationDays,
                    }
                );

                // Create initial usage tracking
                await databases.createDocument(DATABASE_ID, USER_USAGE_ID, ID.unique(), {
                    userId: user.$id,
                    workspacesCount: 1,
                    projectsCount: "{}",
                    roomsCount: "{}",
                    aiCreditsUsed: 0,
                    aiCreditsPerWorkspace: "{}",
                    lastUpdated: new Date().toISOString(),
                });

                return c.json({ data: newSubscription });
            }

            return c.json({ data: subscription });
        } catch (error) {
            console.error("Error fetching subscription:", error);
            return c.json({ error: "Failed to fetch subscription" }, 500);
        }
    })

    // Get available plans
    .get("/plans", async (c) => {
        const plans = Object.entries(PLAN_LIMITS).map(([planName, limits]) => ({
            name: planName,
            limits,
            pricing: PLAN_PRICING[planName as SubscriptionPlan],
        }));

        return c.json({ data: plans });
    })

    // Create a new subscription (upgrade/change plan)
    .post(
        "/create",
        sessionMiddleware,
        zValidator("json", createSubscriptionSchema),
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");
            const { plan, billingCycle } = c.req.valid("json");

            try {
                // Cannot create FREE subscription manually
                if (plan === SubscriptionPlan.FREE) {
                    return c.json(
                        { error: "Cannot create FREE subscription manually" },
                        400
                    );
                }

                // Enterprise requires custom pricing - contact sales
                if (plan === SubscriptionPlan.ENTERPRISE) {
                    return c.json(
                        { error: "Enterprise plans require custom pricing. Please contact sales." },
                        400
                    );
                }

                // Get current subscription
                const currentSubscription = await getUserSubscription({
                    databases,
                    userId: user.$id,
                });

                const razorpayPlanIds: Record<string, string> = {
                    "PRO_MONTHLY": process.env.RAZORPAY_PLAN_PRO_MONTHLY || "plan_PRO_MONTHLY",
                    "PRO_YEARLY": process.env.RAZORPAY_PLAN_PRO_YEARLY || "plan_PRO_YEARLY",
                    "STANDARD_MONTHLY": process.env.RAZORPAY_PLAN_STANDARD_MONTHLY || "plan_STANDARD_MONTHLY",
                    "STANDARD_YEARLY": process.env.RAZORPAY_PLAN_STANDARD_YEARLY || "plan_STANDARD_YEARLY",
                };

                const planKey = `${plan}_${billingCycle}`;
                const razorpayPlanId = razorpayPlanIds[planKey];

                if (!razorpayPlanId) {
                    return c.json({ error: "Invalid plan selected" }, 400);
                }

                // Create Razorpay subscription
                const razorpaySubscription = await createRazorpaySubscription(
                    razorpayPlanId,
                    undefined,
                    billingCycle === "MONTHLY" ? 12 : 1
                );                // Calculate period dates
                const startDate = new Date();
                const endDate = new Date();
                if (billingCycle === "MONTHLY") {
                    endDate.setMonth(endDate.getMonth() + 1);
                } else {
                    endDate.setFullYear(endDate.getFullYear() + 1);
                }

                // Cancel current subscription if exists and is not FREE
                if (
                    currentSubscription &&
                    currentSubscription.plan !== SubscriptionPlan.FREE &&
                    currentSubscription.razorpaySubscriptionId
                ) {
                    await cancelRazorpaySubscription(
                        currentSubscription.razorpaySubscriptionId,
                        false
                    );
                    await databases.updateDocument(
                        DATABASE_ID,
                        SUBSCRIPTIONS_ID,
                        currentSubscription.$id,
                        {
                            status: SubscriptionStatus.CANCELLED,
                        }
                    );
                }

                // Create new subscription record
                const planLimits = PLAN_LIMITS[plan];
                const planPricing = PLAN_PRICING[plan];

                const newSubscription = await databases.createDocument(
                    DATABASE_ID,
                    SUBSCRIPTIONS_ID,
                    ID.unique(),
                    {
                        userId: user.$id,
                        plan,
                        status: SubscriptionStatus.PENDING,
                        razorpaySubscriptionId: razorpaySubscription.id,
                        razorpayPlanId: razorpaySubscription.plan_id,
                        currentPeriodStart: startDate.toISOString(),
                        currentPeriodEnd: endDate.toISOString(),
                        cancelAtPeriodEnd: false,
                        billingCycle,
                        workspaces: planLimits.workspaces,
                        projectsPerWorkspace: planLimits.projectsPerWorkspace,
                        membersPerWorkspace: planLimits.membersPerWorkspace,
                        roomsPerWorkspace: planLimits.roomsPerWorkspace,
                        aiCredits: planLimits.aiCredits,
                        aiCreditsPerUser: planLimits.aiCreditsPerUser,
                        monthlyPrice: planPricing.monthly,
                        yearlyPrice: planPricing.yearly,
                        durationDays: planLimits.durationDays,
                    }
                );

                return c.json({
                    data: {
                        subscription: newSubscription,
                        razorpaySubscriptionId: razorpaySubscription.id,
                        razorpayKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    },
                });
            } catch (error) {
                console.error("Error creating subscription:", error);
                return c.json({ error: "Failed to create subscription" }, 500);
            }
        }
    )

    // Verify payment
    .post(
        "/verify",
        sessionMiddleware,
        zValidator("json", verifyPaymentSchema),
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");
            const { razorpayPaymentId, razorpaySubscriptionId, razorpaySignature } =
                c.req.valid("json");

            try {
                // Verify signature
                const isValid = verifyRazorpaySignature(
                    razorpayPaymentId,
                    razorpaySubscriptionId,
                    razorpaySignature
                );

                if (!isValid) {
                    return c.json({ error: "Invalid payment signature" }, 400);
                }

                // Find subscription by Razorpay subscription ID
                const subscriptions = await databases.listDocuments<Subscription>(
                    DATABASE_ID,
                    SUBSCRIPTIONS_ID,
                    [
                        Query.equal("userId", user.$id),
                        Query.equal("razorpaySubscriptionId", razorpaySubscriptionId),
                        Query.limit(1),
                    ]
                );

                if (subscriptions.documents.length === 0) {
                    return c.json({ error: "Subscription not found" }, 404);
                }

                const subscription = subscriptions.documents[0];

                // Update subscription status to ACTIVE
                const updatedSubscription = await databases.updateDocument(
                    DATABASE_ID,
                    SUBSCRIPTIONS_ID,
                    subscription.$id,
                    {
                        status: SubscriptionStatus.ACTIVE,
                    }
                );

                return c.json({ data: updatedSubscription });
            } catch (error) {
                console.error("Error verifying payment:", error);
                return c.json({ error: "Failed to verify payment" }, 500);
            }
        }
    )

    // Cancel subscription
    .post(
        "/cancel",
        sessionMiddleware,
        zValidator("json", cancelSubscriptionSchema),
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");
            const { cancelAtPeriodEnd } = c.req.valid("json");

            try {
                const subscription = await getUserSubscription({
                    databases,
                    userId: user.$id,
                });

                if (!subscription) {
                    return c.json({ error: "No active subscription found" }, 404);
                }

                if (subscription.plan === SubscriptionPlan.FREE) {
                    return c.json({ error: "Cannot cancel FREE plan" }, 400);
                }

                if (subscription.razorpaySubscriptionId) {
                    await cancelRazorpaySubscription(
                        subscription.razorpaySubscriptionId,
                        cancelAtPeriodEnd
                    );
                }

                const updatedSubscription = await databases.updateDocument(
                    DATABASE_ID,
                    SUBSCRIPTIONS_ID,
                    subscription.$id,
                    {
                        status: cancelAtPeriodEnd
                            ? SubscriptionStatus.ACTIVE
                            : SubscriptionStatus.CANCELLED,
                        cancelAtPeriodEnd,
                    }
                );

                return c.json({ data: updatedSubscription });
            } catch (error) {
                console.error("Error canceling subscription:", error);
                return c.json({ error: "Failed to cancel subscription" }, 500);
            }
        }
    )

    // Resume subscription
    .post("/resume", sessionMiddleware, async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");

        try {
            const subscription = await getUserSubscription({
                databases,
                userId: user.$id,
            });

            if (!subscription) {
                return c.json({ error: "No subscription found" }, 404);
            }

            if (!subscription.cancelAtPeriodEnd) {
                return c.json({ error: "Subscription is not set to cancel" }, 400);
            }

            const updatedSubscription = await databases.updateDocument(
                DATABASE_ID,
                SUBSCRIPTIONS_ID,
                subscription.$id,
                {
                    cancelAtPeriodEnd: false,
                }
            );

            return c.json({ data: updatedSubscription });
        } catch (error) {
            console.error("Error resuming subscription:", error);
            return c.json({ error: "Failed to resume subscription" }, 500);
        }
    })

    // Get usage stats
    .get("/usage", sessionMiddleware, async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");

        try {
            const usages = await databases.listDocuments(
                DATABASE_ID,
                USER_USAGE_ID,
                [Query.equal("userId", user.$id), Query.limit(1)]
            );

            let usageDoc;
            if (usages.documents.length === 0) {
                usageDoc = await databases.createDocument(
                    DATABASE_ID,
                    USER_USAGE_ID,
                    ID.unique(),
                    {
                        userId: user.$id,
                        workspacesCount: 1,
                        projectsCount: "{}",
                        roomsCount: "{}",
                        aiCreditsUsed: 0,
                        aiCreditsPerWorkspace: "{}",
                        lastUpdated: new Date().toISOString(),
                    }
                );
            } else {
                usageDoc = usages.documents[0];
            }

            // 1. Count workspaces created by user
            const workspaces = await databases.listDocuments(
                DATABASE_ID,
                WORKSPACE_ID,
                [Query.equal("userId", user.$id)]
            );
            const realWorkspacesCount = workspaces.total;

            // 2. Count projects per workspace
            const projectsCount: Record<string, number> = {};
            for (const workspace of workspaces.documents) {
                const projects = await databases.listDocuments(
                    DATABASE_ID,
                    PROJECTS_ID,
                    [Query.equal("workspaceId", workspace.$id)]
                );
                projectsCount[workspace.$id] = projects.total;
            }

            // 3. Count rooms per workspace
            const roomsCount: Record<string, number> = {};
            for (const workspace of workspaces.documents) {
                const rooms = await databases.listDocuments(
                    DATABASE_ID,
                    ROOMS_ID,
                    [Query.equal("workspaceId", workspace.$id)]
                );
                roomsCount[workspace.$id] = rooms.total;
            }

            return c.json({
                data: {
                    ...usageDoc,
                    workspacesCount: realWorkspacesCount, // Real-time count
                    projectsCount: projectsCount, // Real-time counts per workspace
                    roomsCount: roomsCount, // Real-time counts per workspace
                }
            });
        } catch (error) {
            console.error("Error fetching usage:", error);
            return c.json({ error: "Failed to fetch usage" }, 500);
        }
    });

export default app;
