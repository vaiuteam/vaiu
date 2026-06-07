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
    createRazorpayOrder,
    cancelRazorpaySubscription,
    cancelRazorpaySubscriptionSafe,
    verifyRazorpaySignature,
    verifyRazorpayOrderSignature,
    getRazorpayErrorMessage,
} from "@/lib/razorpay";
import { sendSubscriptionConfirmationEmail } from "@/lib/emails/subscription-confirmation";
import { getUserSubscription, getWorkspaceSubscription } from "../utils";
import { listWorkspaceSubscriptions, supersedeWorkspaceSubscriptions } from "./sync";

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

            return c.json({ data: subscription ?? null });
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
            const { plan, billingCycle, workspaceId } = c.req.valid("json");

            try {

                if (plan === SubscriptionPlan.FREE) {
                    return c.json({ error: "Cannot create FREE subscription manually" }, 400);
                }

                if (plan === SubscriptionPlan.ENTERPRISE) {
                    return c.json(
                        { error: "Enterprise plans require custom pricing. Please contact sales." },
                        400
                    );
                }

                // Cancel any existing paid subscription before creating a new one.
                const currentSubscription = await getUserSubscription({ databases, userId: user.$id });
                if (
                    currentSubscription &&
                    currentSubscription.plan !== SubscriptionPlan.FREE &&
                    currentSubscription.razorpaySubscriptionId
                ) {
                    await cancelRazorpaySubscriptionSafe(currentSubscription.razorpaySubscriptionId, false);
                    await databases.updateDocument(DATABASE_ID, SUBSCRIPTIONS_ID, currentSubscription.$id, {
                        status: SubscriptionStatus.CANCELLED,
                    });
                }

                // End workspace trial / abandoned checkouts before creating a replacement.
                if (workspaceId) {
                    await supersedeWorkspaceSubscriptions(databases, workspaceId);
                }

                const planLimits = PLAN_LIMITS[plan];
                const planPricing = PLAN_PRICING[plan];
                const startDate = new Date();

                // ── EVENT plan: one-time Razorpay order ─────────────────────────────────
                if (plan === SubscriptionPlan.EVENT) {
                    const flatPrice = planPricing.monthly!;
                    const order = await createRazorpayOrder(flatPrice, planPricing.currency);

                    const endDate = new Date();
                    endDate.setDate(endDate.getDate() + 14);

                    const newSubscription = await databases.createDocument(
                        DATABASE_ID, SUBSCRIPTIONS_ID, ID.unique(),
                        {
                            userId: user.$id,
                            ...(workspaceId && { workspaceId }),
                            plan,
                            status: SubscriptionStatus.PENDING,
                            razorpayOrderId: order.id,
                            currentPeriodStart: startDate.toISOString(),
                            currentPeriodEnd: endDate.toISOString(),
                            cancelAtPeriodEnd: false,
                            billingCycle: "ONE_TIME",
                            workspaces: planLimits.workspaces,
                            projectsPerWorkspace: planLimits.projectsPerWorkspace,
                            membersPerWorkspace: planLimits.membersPerWorkspace,
                            roomsPerWorkspace: planLimits.roomsPerWorkspace,
                            aiCredits: planLimits.aiCredits,
                            aiCreditsPerUser: planLimits.aiCreditsPerUser,
                            price: flatPrice,
                            currency: planPricing.currency,
                            durationDays: planLimits.durationDays,
                        }
                    );

                    return c.json({
                        data: {
                            subscription: newSubscription,
                            razorpayOrderId: order.id,
                            razorpayKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                            amount: order.amount,
                            currency: order.currency,
                            prefill: { name: user.name, email: user.email },
                        },
                    });
                }

                // ── Per-seat recurring plans (PRO / STANDARD) ────────────────────────────
                // Start with quantity=1. Seat count is synced automatically when
                // members join or leave the workspace.
                const seats = 1;
                const pricePerSeat = billingCycle === "MONTHLY" ? planPricing.monthly! : planPricing.yearly!;

                const razorpayPlanIds: Record<string, string | undefined> = {
                    PRO_MONTHLY: process.env.RAZORPAY_PLAN_PRO_MONTHLY,
                    PRO_YEARLY: process.env.RAZORPAY_PLAN_PRO_YEARLY,
                    STANDARD_MONTHLY: process.env.RAZORPAY_PLAN_STANDARD_MONTHLY,
                    STANDARD_YEARLY: process.env.RAZORPAY_PLAN_STANDARD_YEARLY,
                };

                const planKey = `${plan}_${billingCycle}`;
                const razorpayPlanId = razorpayPlanIds[planKey];

                if (!razorpayPlanId) {
                    console.error(`Razorpay plan ID not configured for ${planKey}.`);
                    return c.json(
                        { error: `Plan not configured for ${plan}. Run "bun run setup:razorpay-plans" and update your environment.` },
                        500
                    );
                }

                const razorpaySubscription = await createRazorpaySubscription(
                    razorpayPlanId,
                    undefined,
                    billingCycle === "MONTHLY" ? 120 : 12,
                    seats,
                );

                const endDate = new Date();
                if (billingCycle === "MONTHLY") {
                    endDate.setMonth(endDate.getMonth() + 1);
                } else {
                    endDate.setFullYear(endDate.getFullYear() + 1);
                }

                const newSubscription = await databases.createDocument(
                    DATABASE_ID, SUBSCRIPTIONS_ID, ID.unique(),
                    {
                        userId: user.$id,
                        ...(workspaceId && { workspaceId }),
                        plan,
                        status: SubscriptionStatus.PENDING,
                        razorpaySubscriptionId: razorpaySubscription.id,
                        razorpayPlanId: razorpaySubscription.plan_id,
                        currentPeriodStart: startDate.toISOString(),
                        currentPeriodEnd: endDate.toISOString(),
                        cancelAtPeriodEnd: false,
                        billingCycle,
                        seatCount: seats,
                        workspaces: planLimits.workspaces,
                        projectsPerWorkspace: planLimits.projectsPerWorkspace,
                        membersPerWorkspace: -1,    // unlimited — synced via member join/leave
                        roomsPerWorkspace: planLimits.roomsPerWorkspace,
                        aiCredits: planLimits.aiCreditsPerUser, // 1 seat initially; synced on member change
                        aiCreditsPerUser: planLimits.aiCreditsPerUser,
                        price: pricePerSeat,        // per-seat rate, not a total
                        currency: planPricing.currency,
                        durationDays: planLimits.durationDays,
                    }
                );

                return c.json({
                    data: {
                        subscription: newSubscription,
                        razorpaySubscriptionId: razorpaySubscription.id,
                        razorpayKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                        prefill: { name: user.name, email: user.email },
                    },
                });
            } catch (error) {
                console.error("Error creating subscription:", error);
                const message = getRazorpayErrorMessage(error);
                const isInvalidPlan =
                    message.toLowerCase().includes("invalid") &&
                    message.toLowerCase().includes("id");

                return c.json(
                    {
                        error: isInvalidPlan
                            ? "Invalid Razorpay plan ID. Run \"bun run setup:razorpay-plans\" and restart the server."
                            : message || "Failed to create subscription",
                    },
                    500
                );
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
            const { razorpayPaymentId, razorpaySubscriptionId, razorpayOrderId, razorpaySignature } =
                c.req.valid("json");

            if (!razorpaySubscriptionId && !razorpayOrderId) {
                return c.json({ error: "razorpaySubscriptionId or razorpayOrderId is required" }, 400);
            }

            try {
                // Verify signature — order and subscription use different signing schemes.
                const isValid = razorpayOrderId
                    ? verifyRazorpayOrderSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
                    : verifyRazorpaySignature(razorpayPaymentId, razorpaySubscriptionId!, razorpaySignature);

                if (!isValid) {
                    return c.json({ error: "Invalid payment signature" }, 400);
                }

                // Locate the pending subscription record.
                const subscriptions = await databases.listDocuments<Subscription>(
                    DATABASE_ID,
                    SUBSCRIPTIONS_ID,
                    razorpayOrderId
                        ? [
                            Query.equal("userId", user.$id),
                            Query.equal("razorpayOrderId", razorpayOrderId),
                            Query.limit(1),
                        ]
                        : [
                            Query.equal("userId", user.$id),
                            Query.equal("razorpaySubscriptionId", razorpaySubscriptionId!),
                            Query.limit(1),
                        ]
                );

                if (subscriptions.documents.length === 0) {
                    return c.json({ error: "Subscription not found" }, 404);
                }

                const subscription = subscriptions.documents[0];

                if (subscription.status === SubscriptionStatus.ACTIVE) {
                    return c.json({ data: subscription });
                }

                // Update subscription status to ACTIVE
                const updatedSubscription = await databases.updateDocument(
                    DATABASE_ID,
                    SUBSCRIPTIONS_ID,
                    subscription.$id,
                    {
                        status: SubscriptionStatus.ACTIVE,
                    }
                );

                if (subscription.workspaceId) {
                    await supersedeWorkspaceSubscriptions(
                        databases,
                        subscription.workspaceId,
                        subscription.$id,
                    );
                }

                void sendSubscriptionConfirmationEmail({
                    name: user.name,
                    email: user.email,
                    plan: subscription.plan,
                    billingCycle: subscription.billingCycle,
                    price: subscription.price ?? null,
                    currency: subscription.currency,
                    periodEnd: subscription.currentPeriodEnd,
                    paymentId: razorpayPaymentId,
                });

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
            const { cancelAtPeriodEnd, workspaceId } = c.req.valid("json");

            try {
                let subscription;

                if (workspaceId) {
                    const result = await getWorkspaceSubscription({ databases, workspaceId });
                    subscription = result.subscription;
                } else {
                    subscription = await getUserSubscription({ databases, userId: user.$id });
                }

                if (!subscription) {
                    return c.json({ error: "No active subscription found" }, 404);
                }

                if (subscription.plan === SubscriptionPlan.FREE) {
                    return c.json({ error: "Cannot cancel FREE plan" }, 400);
                }

                if (subscription.billingCycle === "ONE_TIME") {
                    return c.json({ error: "One-time plans cannot be cancelled" }, 400);
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
            const workspaceId = c.req.query("workspaceId");
            let subscription;

            if (workspaceId) {
                const result = await getWorkspaceSubscription({ databases, workspaceId });
                subscription = result.subscription;
            } else {
                subscription = await getUserSubscription({ databases, userId: user.$id });
            }

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
                { cancelAtPeriodEnd: false }
            );

            return c.json({ data: updatedSubscription });
        } catch (error) {
            console.error("Error resuming subscription:", error);
            return c.json({ error: "Failed to resume subscription" }, 500);
        }
    })

    // Get subscription for a specific workspace.
    // Self-heals by creating a FREE subscription if the workspace exists but has none
    // (covers workspaces created before the subscription system was in place).
    .get("/workspace/:workspaceId", sessionMiddleware, async (c) => {
        const databases = c.get("databases");
        const workspaceId = c.req.param("workspaceId");

        try {
            const result = await getWorkspaceSubscription({ databases, workspaceId });

            if (result.subscription) {
                return c.json({ data: result.subscription });
            }

            const existingSubs = await listWorkspaceSubscriptions(databases, workspaceId);
            if (existingSubs.length > 0) {
                return c.json({ data: existingSubs[0] });
            }

            // No subscription found — create a FREE one for this workspace.
            const workspace = await databases.getDocument(DATABASE_ID, WORKSPACE_ID, workspaceId);
            const freeEnd = new Date();
            freeEnd.setDate(freeEnd.getDate() + 30);
            const freeLimits = PLAN_LIMITS[SubscriptionPlan.FREE];
            const freePricing = PLAN_PRICING[SubscriptionPlan.FREE];
            const newSub = await databases.createDocument<Subscription>(
                DATABASE_ID,
                SUBSCRIPTIONS_ID,
                ID.unique(),
                {
                    userId: workspace.userId,
                    workspaceId,
                    plan: SubscriptionPlan.FREE,
                    status: SubscriptionStatus.ACTIVE,
                    currentPeriodStart: new Date().toISOString(),
                    currentPeriodEnd: freeEnd.toISOString(),
                    cancelAtPeriodEnd: false,
                    billingCycle: "MONTHLY",
                    workspaces: freeLimits.workspaces,
                    projectsPerWorkspace: freeLimits.projectsPerWorkspace,
                    membersPerWorkspace: freeLimits.membersPerWorkspace,
                    roomsPerWorkspace: freeLimits.roomsPerWorkspace,
                    aiCredits: freeLimits.aiCredits,
                    aiCreditsPerUser: freeLimits.aiCreditsPerUser,
                    price: freePricing.monthly,
                    currency: freePricing.currency,
                    durationDays: freeLimits.durationDays,
                }
            );
            return c.json({ data: newSub });
        } catch (error) {
            console.error("Error fetching workspace subscription:", error);
            return c.json({ error: "Failed to fetch workspace subscription" }, 500);
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
