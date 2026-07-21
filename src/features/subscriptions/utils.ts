import { DATABASE_ID, SUBSCRIPTIONS_ID, USER_USAGE_ID, WORKSPACE_ID, PROJECTS_ID, ROOMS_ID } from "@/config";
import { ID, Query, type Databases } from "node-appwrite";
import { Subscription, UserUsage, SubscriptionPlan, SubscriptionStatus, PLAN_LIMITS, PLAN_PRICING, PlanLimits } from "./types";
import { MEMBERS_ID } from "@/config";

interface GetSubscriptionProps {
    databases: Databases;
    userId: string;
    includeInactive?: boolean;
}

// Returns the user's currently-effective subscription: ACTIVE status AND
// currentPeriodEnd in the future. Pass includeInactive=true on management
// screens that need to render historical or pending rows verbatim.
export const getUserSubscription = async ({
    databases,
    userId,
    includeInactive = false,
}: GetSubscriptionProps): Promise<Subscription | null> => {
    try {
        const queries = [
            Query.equal("userId", userId),
            Query.orderDesc("$createdAt"),
            Query.limit(includeInactive ? 1 : 10),
        ];

        const subscriptions = await databases.listDocuments<Subscription>(
            DATABASE_ID,
            SUBSCRIPTIONS_ID,
            queries
        );

        if (subscriptions.documents.length === 0) {
            return null;
        }

        if (includeInactive) {
            return subscriptions.documents[0];
        }

        const now = new Date();
        const active = subscriptions.documents.find((s) => {
            if (s.status !== SubscriptionStatus.ACTIVE) return false;
            return new Date(s.currentPeriodEnd) > now;
        });

        return active ?? null;
    } catch (error: unknown) {
        console.error("Error fetching user subscription:", error);
        return null;
    }
};

export const getUserUsage = async ({
    databases,
    userId,
}: GetSubscriptionProps): Promise<UserUsage | null> => {
    try {
        const usages = await databases.listDocuments<UserUsage>(
            DATABASE_ID,
            USER_USAGE_ID,
            [Query.equal("userId", userId), Query.limit(1)]
        );

        if (usages.documents.length === 0) {
            return null;
        }

        return usages.documents[0];
    } catch (error: unknown) {
        console.error("Error fetching user usage:", error);
        return null;
    }
};

export const getWorkspaceSubscription = async ({
    databases,
    workspaceId,
}: {
    databases: Databases;
    workspaceId: string;
}): Promise<{ plan: SubscriptionPlan; subscription: Subscription | null }> => {
    try {
        const now = new Date();

        const subs = await databases.listDocuments<Subscription>(
            DATABASE_ID,
            SUBSCRIPTIONS_ID,
            [
                Query.equal("workspaceId", workspaceId),
                Query.orderDesc("$createdAt"),
                Query.limit(10),
            ]
        );

        const activeSubs = subs.documents.filter(
            (s) => s.status === SubscriptionStatus.ACTIVE && new Date(s.currentPeriodEnd) > now
        );

        if (activeSubs.length > 0) {
            // Prefer paid plans over FREE when duplicate ACTIVE rows exist.
            const sub = activeSubs.sort((a, b) => {
                if (a.plan === SubscriptionPlan.FREE && b.plan !== SubscriptionPlan.FREE) return 1;
                if (b.plan === SubscriptionPlan.FREE && a.plan !== SubscriptionPlan.FREE) return -1;
                return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
            })[0];
            return { plan: sub.plan, subscription: sub };
        }

        return { plan: SubscriptionPlan.FREE, subscription: null };
    } catch (error: unknown) {
        console.error("[getWorkspaceSubscription] error:", error);
        return { plan: SubscriptionPlan.FREE, subscription: null };
    }
};

// Compute the start of the credit-reset window for a subscription. Monthly
// plans reset every month from the subscription start anniversary; yearly
// plans reset once at the start of each yearly period.
const getCreditWindowStart = (subscription: Subscription | null): Date => {
    if (!subscription) return new Date(0);

    const periodStart = new Date(subscription.currentPeriodStart);
    const now = new Date();

    // ONE_TIME plans (EVENT) don't reset — use full period start.
    if (subscription.billingCycle === "ONE_TIME") {
        return periodStart;
    }

    // MONTHLY and YEARLY both reset on a monthly cadence from the subscription start anniversary.
    const windowStart = new Date(periodStart);
    while (true) {
        const next = new Date(windowStart);
        next.setMonth(next.getMonth() + 1);
        if (next > now) break;
        windowStart.setTime(next.getTime());
    }
    return windowStart;
};

const parseWorkspaceCredits = (value: unknown): Record<string, number> => {
    if (!value) return {};
    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch {
            return {};
        }
    }
    return value as Record<string, number>;
};

interface CheckSubscriptionLimitProps {
    databases: Databases;
    userId: string;
    limitType: "workspaces" | "projects" | "members" | "rooms" | "aiCredits";
    workspaceId?: string;
    creditsNeeded?: number; // For AI credits check
}

export const checkSubscriptionLimit = async ({
    databases,
    userId,
    limitType,
    workspaceId,
}: CheckSubscriptionLimitProps): Promise<{
    allowed: boolean;
    limit: number;
    current: number;
    plan: SubscriptionPlan;
}> => {
    try {
        let plan: SubscriptionPlan;
        let limits: PlanLimits;

        if (limitType === "workspaces") {
            // For workspaces: Use user's own subscription
            const subscription = await getUserSubscription({ databases, userId });

            if (!subscription) {
                // No active subscription — apply FREE limits.
                // The workspace count check below will naturally enforce the cap.
                plan = SubscriptionPlan.FREE;
                limits = PLAN_LIMITS[plan];
            } else {
                plan = subscription.plan;
                limits = {
                    workspaces: subscription.workspaces ?? PLAN_LIMITS[plan].workspaces,
                    projectsPerWorkspace: subscription.projectsPerWorkspace ?? PLAN_LIMITS[plan].projectsPerWorkspace,
                    membersPerWorkspace: subscription.membersPerWorkspace ?? PLAN_LIMITS[plan].membersPerWorkspace,
                    roomsPerWorkspace: subscription.roomsPerWorkspace ?? PLAN_LIMITS[plan].roomsPerWorkspace,
                    aiCredits: subscription.aiCredits ?? PLAN_LIMITS[plan].aiCredits,
                    aiCreditsPerUser: subscription.aiCreditsPerUser ?? PLAN_LIMITS[plan].aiCreditsPerUser,
                    durationDays: subscription.durationDays ?? PLAN_LIMITS[plan].durationDays,
                };
            }
        } else {
            // For projects/rooms/members: Use workspace's highest admin subscription
            if (!workspaceId) {
                return {
                    allowed: false,
                    limit: 0,
                    current: 0,
                    plan: SubscriptionPlan.FREE
                };
            }

            const workspaceSubscription = await getWorkspaceSubscription({
                databases,
                workspaceId,
            });
            plan = workspaceSubscription.plan;
            const sub = workspaceSubscription.subscription;

            // Per-seat plans (PRO/STANDARD) have no member cap — billing adjusts
            // with member count automatically via Razorpay quantity sync.
            const effectiveMemberLimit = PLAN_PRICING[plan].perSeat
                ? -1
                : (sub?.membersPerWorkspace ?? PLAN_LIMITS[plan].membersPerWorkspace);

            limits = sub ? {
                workspaces: sub.workspaces ?? PLAN_LIMITS[plan].workspaces,
                projectsPerWorkspace: sub.projectsPerWorkspace ?? PLAN_LIMITS[plan].projectsPerWorkspace,
                membersPerWorkspace: effectiveMemberLimit,
                roomsPerWorkspace: sub.roomsPerWorkspace ?? PLAN_LIMITS[plan].roomsPerWorkspace,
                aiCredits: sub.aiCredits ?? PLAN_LIMITS[plan].aiCredits,
                aiCreditsPerUser: sub.aiCreditsPerUser ?? PLAN_LIMITS[plan].aiCreditsPerUser,
                durationDays: sub.durationDays ?? PLAN_LIMITS[plan].durationDays,
            } : PLAN_LIMITS[plan];

            // getWorkspaceSubscription already filters by ACTIVE+not-expired.
        }

        // Get current usage
        let current = 0;
        let limit = 0;

        switch (limitType) {
            case "workspaces":
                limit = limits.workspaces;
                if (limit === -1) {
                    return { allowed: true, limit: -1, current: 0, plan };
                }

                const workspaces = await databases.listDocuments(
                    DATABASE_ID,
                    WORKSPACE_ID,
                    [Query.equal("userId", userId)]
                );
                current = workspaces.total;
                break;

            case "projects":
                limit = limits.projectsPerWorkspace;
                if (limit === -1) {
                    return { allowed: true, limit: -1, current: 0, plan };
                }

                const projects = await databases.listDocuments(
                    DATABASE_ID,
                    PROJECTS_ID,
                    [Query.equal("workspaceId", workspaceId!)]
                );
                current = projects.total;
                break;

            case "members":
                limit = limits.membersPerWorkspace;
                if (limit === -1) {
                    return { allowed: true, limit: -1, current: 0, plan };
                }

                const members = await databases.listDocuments(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.equal("workspaceId", workspaceId!)]
                );
                current = members.total;
                break;

            case "rooms":
                limit = limits.roomsPerWorkspace;
                if (limit === -1) {
                    return { allowed: true, limit: -1, current: 0, plan };
                }

                const rooms = await databases.listDocuments(
                    DATABASE_ID,
                    ROOMS_ID,
                    [Query.equal("workspaceId", workspaceId!)]
                );
                current = rooms.total;
                break;

            case "aiCredits": {
                limit = limits.aiCredits;
                if (limit === -1) {
                    return { allowed: true, limit: -1, current: 0, plan };
                }

                if (!workspaceId) {
                    return { allowed: false, limit, current: 0, plan };
                }

                // Sum this workspace's credit usage across all member usage docs,
                // ignoring contributions from prior billing periods.
                const workspaceSubForWindow = await getWorkspaceSubscription({
                    databases,
                    workspaceId,
                });
                const windowStart = getCreditWindowStart(workspaceSubForWindow.subscription);

                const wsMembers = await databases.listDocuments(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.equal("workspaceId", workspaceId), Query.limit(200)]
                );
                const memberUserIds = wsMembers.documents.map((m) => m.userId);

                if (memberUserIds.length > 0) {
                    const memberUsages = await databases.listDocuments<UserUsage>(
                        DATABASE_ID,
                        USER_USAGE_ID,
                        [Query.equal("userId", memberUserIds), Query.limit(200)]
                    );

                    for (const usage of memberUsages.documents) {
                        const lastUpdated = new Date(usage.lastUpdated || 0);
                        if (lastUpdated < windowStart) continue;
                        const perWorkspace = parseWorkspaceCredits(usage.aiCreditsPerWorkspace);
                        current += perWorkspace[workspaceId] || 0;
                    }
                }
                break;
            }
        }

        return {
            allowed: current < limit,
            limit,
            current,
            plan,
        };
    } catch (error: unknown) {
        console.error("Error checking subscription limit:", error);
        return {
            allowed: false,
            limit: 0,
            current: 0,
            plan: SubscriptionPlan.FREE,
        };
    }
};

/**
 * Check and consume AI credits for a workspace with dual limits:
 * 1. Workspace pool limit (shared by all members)
 * 2. Per-user quota (prevents one user from hogging all credits)
 */
export const consumeAICredits = async ({
    databases,
    userId,
    workspaceId,
    creditsToConsume,
    checkOnly = false,
}: {
    databases: Databases;
    userId: string;
    workspaceId: string;
    creditsToConsume: number;
    checkOnly?: boolean;
}): Promise<{
    success: boolean;
    workspaceRemaining: number;
    userRemaining: number;
    message?: string;
}> => {
    try {
        const workspaceSubscription = await getWorkspaceSubscription({ databases, workspaceId });

        const limits = workspaceSubscription.subscription ? {
            aiCredits: workspaceSubscription.subscription.aiCredits,
            aiCreditsPerUser: workspaceSubscription.subscription.aiCreditsPerUser,
        } : {
            aiCredits: PLAN_LIMITS[workspaceSubscription.plan].aiCredits,
            aiCreditsPerUser: PLAN_LIMITS[workspaceSubscription.plan].aiCreditsPerUser,
        };
        const workspacePoolLimit = limits.aiCredits ?? PLAN_LIMITS[workspaceSubscription.plan].aiCredits;
        const userQuotaLimit = limits.aiCreditsPerUser ?? PLAN_LIMITS[workspaceSubscription.plan].aiCreditsPerUser;

        const windowStart = getCreditWindowStart(workspaceSubscription.subscription);

        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("workspaceId", workspaceId), Query.limit(200)]
        );
        const memberUserIds = members.documents.map((m) => m.userId);

        let totalWorkspaceUsage = 0;
        let userWorkspaceUsage = 0;
        let usageDoc: UserUsage | null = null;
        let userWorkspaceUsageStale = false;

        if (memberUserIds.length > 0) {
            const memberUsages = await databases.listDocuments<UserUsage>(
                DATABASE_ID,
                USER_USAGE_ID,
                [Query.equal("userId", memberUserIds), Query.limit(200)]
            );

            for (const usage of memberUsages.documents) {
                const perWorkspace = parseWorkspaceCredits(usage.aiCreditsPerWorkspace);
                const lastUpdated = new Date(usage.lastUpdated || 0);
                const inCurrentWindow = lastUpdated >= windowStart;
                const credits = inCurrentWindow ? perWorkspace[workspaceId] || 0 : 0;

                totalWorkspaceUsage += credits;

                if (usage.userId === userId) {
                    userWorkspaceUsage = credits;
                    usageDoc = usage;
                    userWorkspaceUsageStale = !inCurrentWindow;
                }
            }
        }

        if (workspacePoolLimit !== -1 && totalWorkspaceUsage + creditsToConsume > workspacePoolLimit) {
            return {
                success: false,
                workspaceRemaining: Math.max(0, workspacePoolLimit - totalWorkspaceUsage),
                userRemaining: Math.max(0, userQuotaLimit - userWorkspaceUsage),
                message: `Workspace AI credit pool exhausted. Need ${creditsToConsume}, workspace has ${Math.max(0, workspacePoolLimit - totalWorkspaceUsage)} remaining.`,
            };
        }

        if (userQuotaLimit !== -1 && userWorkspaceUsage + creditsToConsume > userQuotaLimit) {
            return {
                success: false,
                workspaceRemaining: Math.max(0, workspacePoolLimit - totalWorkspaceUsage),
                userRemaining: Math.max(0, userQuotaLimit - userWorkspaceUsage),
                message: `Your personal AI credit quota reached. Need ${creditsToConsume}, you have ${Math.max(0, userQuotaLimit - userWorkspaceUsage)} remaining in this workspace.`,
            };
        }

        // Check-only mode: gate the AI call without writing anything yet.
        if (checkOnly) {
            return {
                success: true,
                workspaceRemaining: workspacePoolLimit === -1 ? -1 : workspacePoolLimit - totalWorkspaceUsage,
                userRemaining: userQuotaLimit === -1 ? -1 : userQuotaLimit - userWorkspaceUsage,
            };
        }

        // Write phase — record actual consumption after the AI call succeeded.
        if (usageDoc) {
            const aiCreditsPerWorkspace = parseWorkspaceCredits(usageDoc.aiCreditsPerWorkspace);
            if (userWorkspaceUsageStale) {
                aiCreditsPerWorkspace[workspaceId] = 0;
            }
            aiCreditsPerWorkspace[workspaceId] = (aiCreditsPerWorkspace[workspaceId] || 0) + creditsToConsume;

            await databases.updateDocument(DATABASE_ID, USER_USAGE_ID, usageDoc.$id, {
                aiCreditsUsed: (usageDoc.aiCreditsUsed || 0) + creditsToConsume,
                aiCreditsPerWorkspace: JSON.stringify(aiCreditsPerWorkspace),
                lastUpdated: new Date().toISOString(),
            });

            // Post-write re-read: detect same-user concurrent writes and revert if over quota.
            if (userQuotaLimit !== -1) {
                const fresh = await databases.getDocument<UserUsage>(DATABASE_ID, USER_USAGE_ID, usageDoc.$id);
                const freshPerWorkspace = parseWorkspaceCredits(fresh.aiCreditsPerWorkspace);
                const freshUserUsage = freshPerWorkspace[workspaceId] || 0;

                if (freshUserUsage > userQuotaLimit) {
                    const reverted = { ...freshPerWorkspace, [workspaceId]: Math.max(0, freshUserUsage - creditsToConsume) };
                    await databases.updateDocument(DATABASE_ID, USER_USAGE_ID, usageDoc.$id, {
                        aiCreditsUsed: Math.max(0, (fresh.aiCreditsUsed || 0) - creditsToConsume),
                        aiCreditsPerWorkspace: JSON.stringify(reverted),
                        lastUpdated: new Date().toISOString(),
                    });
                    return {
                        success: false,
                        workspaceRemaining: Math.max(0, workspacePoolLimit - totalWorkspaceUsage),
                        userRemaining: 0,
                        message: `Your personal AI credit quota reached. Need ${creditsToConsume}, you have ${Math.max(0, userQuotaLimit - userWorkspaceUsage)} remaining in this workspace.`,
                    };
                }
            }
        } else {
            // No usage doc exists — create one so credits are tracked from the start.
            await databases.createDocument(DATABASE_ID, USER_USAGE_ID, ID.unique(), {
                userId,
                workspacesCount: 0,
                projectsCount: "{}",
                roomsCount: "{}",
                aiCreditsUsed: creditsToConsume,
                aiCreditsPerWorkspace: JSON.stringify({ [workspaceId]: creditsToConsume }),
                lastUpdated: new Date().toISOString(),
            });
        }

        const newWorkspaceUsage = totalWorkspaceUsage + creditsToConsume;
        const newUserUsage = userWorkspaceUsage + creditsToConsume;

        return {
            success: true,
            workspaceRemaining: workspacePoolLimit === -1 ? -1 : workspacePoolLimit - newWorkspaceUsage,
            userRemaining: userQuotaLimit === -1 ? -1 : userQuotaLimit - newUserUsage,
        };
    } catch (error: unknown) {
        console.error("Error consuming AI credits:", error);
        return {
            success: false,
            workspaceRemaining: 0,
            userRemaining: 0,
            message: "Failed to consume AI credits",
        };
    }
};

export const isSubscriptionActive = (subscription: Subscription | null): boolean => {
    if (!subscription) return false;

    if (subscription.status !== SubscriptionStatus.ACTIVE) return false;

    const endDate = new Date(subscription.currentPeriodEnd);
    return endDate > new Date();
};

export const getPlanFeatures = (plan: SubscriptionPlan, subscription?: Subscription): string[] => {
    const isPerSeat = plan === SubscriptionPlan.PRO || plan === SubscriptionPlan.STANDARD;

    const limits = subscription ? {
        workspaces: subscription.workspaces ?? PLAN_LIMITS[plan].workspaces,
        projectsPerWorkspace: subscription.projectsPerWorkspace ?? PLAN_LIMITS[plan].projectsPerWorkspace,
        membersPerWorkspace: subscription.seatCount ?? subscription.membersPerWorkspace ?? PLAN_LIMITS[plan].membersPerWorkspace,
        roomsPerWorkspace: subscription.roomsPerWorkspace ?? PLAN_LIMITS[plan].roomsPerWorkspace,
        aiCredits: subscription.aiCredits ?? PLAN_LIMITS[plan].aiCredits,
        aiCreditsPerUser: subscription.aiCreditsPerUser ?? PLAN_LIMITS[plan].aiCreditsPerUser,
        durationDays: subscription.durationDays,
    } : PLAN_LIMITS[plan];

    const features: string[] = [];

    if (limits.workspaces === -1) {
        features.push("Unlimited workspaces");
    } else {
        features.push(`${limits.workspaces} workspace${limits.workspaces > 1 ? 's' : ''}`);
    }

    if (limits.projectsPerWorkspace === -1) {
        features.push("Unlimited projects per workspace");
    } else {
        features.push(`${limits.projectsPerWorkspace} project${limits.projectsPerWorkspace > 1 ? 's' : ''} per workspace`);
    }

    if (isPerSeat) {
        features.push("Members scale with seats purchased");
    } else if (limits.membersPerWorkspace === -1) {
        features.push("Unlimited members per workspace");
    } else {
        features.push(`Up to ${limits.membersPerWorkspace} member${limits.membersPerWorkspace > 1 ? 's' : ''} per workspace`);
    }

    if (limits.roomsPerWorkspace === -1) {
        features.push("Unlimited rooms");
    } else {
        features.push(`${limits.roomsPerWorkspace} room${limits.roomsPerWorkspace > 1 ? 's' : ''} per workspace`);
    }

    if (isPerSeat) {
        features.push(`${limits.aiCreditsPerUser} AI credits per seat per month`);
    } else if (limits.aiCredits === -1) {
        features.push("Unlimited AI credits");
    } else {
        features.push(`${limits.aiCredits} AI credits / month (shared pool)`);
    }

    if (plan === SubscriptionPlan.EVENT) {
        features.push("Valid for 14 days");
        features.push("Ideal for hackathons & sprints");
    }

    return features;
};
