import { DATABASE_ID, SUBSCRIPTIONS_ID, USER_USAGE_ID, WORKSPACE_ID, PROJECTS_ID, ROOMS_ID } from "@/config";
import { Query, type Databases } from "node-appwrite";
import { Subscription, UserUsage, SubscriptionPlan, SubscriptionStatus, PLAN_LIMITS, PlanLimits } from "./types";
import { MemberRole } from "@/features/members/types";
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

/**
 * Get the highest subscription plan among workspace admins
 * This allows workspaces to inherit the best plan from any admin
 */
export const getWorkspaceSubscription = async ({
    databases,
    workspaceId,
}: {
    databases: Databases;
    workspaceId: string;
}): Promise<{ plan: SubscriptionPlan; subscription: Subscription | null }> => {
    try {
        const admins = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [
                Query.equal("workspaceId", workspaceId),
                Query.equal("role", [MemberRole.ADMIN, MemberRole.SUPER_ADMIN]),
            ]
        );

        if (admins.documents.length === 0) {
            return { plan: SubscriptionPlan.FREE, subscription: null };
        }

        const adminUserIds = admins.documents.map((m) => m.userId);
        const now = new Date();

        const subs = await databases.listDocuments<Subscription>(
            DATABASE_ID,
            SUBSCRIPTIONS_ID,
            [
                Query.equal("userId", adminUserIds),
                Query.equal("status", SubscriptionStatus.ACTIVE),
                Query.orderDesc("$createdAt"),
                Query.limit(100),
            ]
        );

        const planRanking = {
            [SubscriptionPlan.FREE]: 0,
            [SubscriptionPlan.PRO]: 1,
            [SubscriptionPlan.STANDARD]: 2,
            [SubscriptionPlan.ENTERPRISE]: 3,
        };

        let highestPlan = SubscriptionPlan.FREE;
        let highestSubscription: Subscription | null = null;

        for (const sub of subs.documents) {
            if (new Date(sub.currentPeriodEnd) <= now) continue;
            if (planRanking[sub.plan] > planRanking[highestPlan]) {
                highestPlan = sub.plan;
                highestSubscription = sub;
            }
        }

        return { plan: highestPlan, subscription: highestSubscription };
    } catch (error: unknown) {
        console.error("Error fetching workspace subscription:", error);
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

    if (subscription.billingCycle !== "MONTHLY") {
        return periodStart;
    }

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
                // Either a brand-new user (no row) or a user whose previous
                // subscription has lapsed. Look for any historical row to
                // distinguish the two — lapsed users must upgrade to continue.
                const latest = await getUserSubscription({
                    databases,
                    userId,
                    includeInactive: true,
                });
                if (latest) {
                    return {
                        allowed: false,
                        limit: 0,
                        current: 0,
                        plan: latest.plan,
                    };
                }
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

            // Use subscription fields if available
            limits = workspaceSubscription.subscription ? {
                workspaces: workspaceSubscription.subscription.workspaces ?? PLAN_LIMITS[plan].workspaces,
                projectsPerWorkspace: workspaceSubscription.subscription.projectsPerWorkspace ?? PLAN_LIMITS[plan].projectsPerWorkspace,
                membersPerWorkspace: workspaceSubscription.subscription.membersPerWorkspace ?? PLAN_LIMITS[plan].membersPerWorkspace,
                roomsPerWorkspace: workspaceSubscription.subscription.roomsPerWorkspace ?? PLAN_LIMITS[plan].roomsPerWorkspace,
                aiCredits: workspaceSubscription.subscription.aiCredits ?? PLAN_LIMITS[plan].aiCredits,
                aiCreditsPerUser: workspaceSubscription.subscription.aiCreditsPerUser ?? PLAN_LIMITS[plan].aiCreditsPerUser,
                durationDays: workspaceSubscription.subscription.durationDays ?? PLAN_LIMITS[plan].durationDays,
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
}: {
    databases: Databases;
    userId: string;
    workspaceId: string;
    creditsToConsume: number;
}): Promise<{
    success: boolean;
    workspaceRemaining: number;
    userRemaining: number;
    message?: string;
}> => {
    try {
        // Get workspace subscription to determine credit pool
        const workspaceSubscription = await getWorkspaceSubscription({
            databases,
            workspaceId,
        });

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

        // Single batched query for all member usage docs
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

        // Check workspace pool limit
        if (workspacePoolLimit !== -1 && totalWorkspaceUsage + creditsToConsume > workspacePoolLimit) {
            return {
                success: false,
                workspaceRemaining: Math.max(0, workspacePoolLimit - totalWorkspaceUsage),
                userRemaining: Math.max(0, userQuotaLimit - userWorkspaceUsage),
                message: `Workspace AI credit pool exhausted. Need ${creditsToConsume}, workspace has ${Math.max(0, workspacePoolLimit - totalWorkspaceUsage)} remaining.`,
            };
        }

        // Check per-user quota limit
        if (userQuotaLimit !== -1 && userWorkspaceUsage + creditsToConsume > userQuotaLimit) {
            return {
                success: false,
                workspaceRemaining: Math.max(0, workspacePoolLimit - totalWorkspaceUsage),
                userRemaining: Math.max(0, userQuotaLimit - userWorkspaceUsage),
                message: `Your personal AI credit quota reached. Need ${creditsToConsume}, you have ${Math.max(0, userQuotaLimit - userWorkspaceUsage)} remaining in this workspace.`,
            };
        }

        // Consume credits
        if (usageDoc) {
            const aiCreditsPerWorkspace = parseWorkspaceCredits(usageDoc.aiCreditsPerWorkspace);

            // Reset this workspace's bucket if it carries credits from a prior period.
            if (userWorkspaceUsageStale) {
                aiCreditsPerWorkspace[workspaceId] = 0;
            }

            aiCreditsPerWorkspace[workspaceId] = (aiCreditsPerWorkspace[workspaceId] || 0) + creditsToConsume;

            // aiCreditsUsed is a lifetime/usage counter; keep accumulating but
            // ignore for limit checks (per-period scoping handled above).
            await databases.updateDocument(
                DATABASE_ID,
                USER_USAGE_ID,
                usageDoc.$id,
                {
                    aiCreditsUsed: (usageDoc.aiCreditsUsed || 0) + creditsToConsume,
                    aiCreditsPerWorkspace: JSON.stringify(aiCreditsPerWorkspace),
                    lastUpdated: new Date().toISOString(),
                }
            );
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
    const limits = subscription ? {
        workspaces: subscription.workspaces ?? PLAN_LIMITS[plan].workspaces,
        projectsPerWorkspace: subscription.projectsPerWorkspace ?? PLAN_LIMITS[plan].projectsPerWorkspace,
        membersPerWorkspace: subscription.membersPerWorkspace ?? PLAN_LIMITS[plan].membersPerWorkspace,
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

    if (limits.membersPerWorkspace === -1) {
        features.push("Unlimited members per workspace");
    } else {
        features.push(`${limits.membersPerWorkspace} member${limits.membersPerWorkspace > 1 ? 's' : ''} per workspace`);
    }

    if (limits.roomsPerWorkspace === -1) {
        features.push("Unlimited rooms");
    } else {
        features.push(`${limits.roomsPerWorkspace} room${limits.roomsPerWorkspace > 1 ? 's' : ''} per workspace`);
    }

    if (limits.aiCredits === -1) {
        features.push("Unlimited AI credits (shared workspace pool)");
    } else {
        features.push(`${limits.aiCredits} AI credits per month (shared workspace pool)`);
    }

    if (limits.aiCreditsPerUser === -1) {
        features.push("Unlimited AI credits per user per month");
    } else {
        features.push(`${limits.aiCreditsPerUser} AI credits per user per month`);
    }

    if (limits.durationDays) {
        features.push(`Valid for ${limits.durationDays} days`);
    }

    return features;
};
