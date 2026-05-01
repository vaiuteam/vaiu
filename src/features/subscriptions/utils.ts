import { DATABASE_ID, SUBSCRIPTIONS_ID, USER_USAGE_ID, WORKSPACE_ID, PROJECTS_ID, ROOMS_ID } from "@/config";
import { Query, type Databases } from "node-appwrite";
import { Subscription, UserUsage, SubscriptionPlan, SubscriptionStatus, PLAN_LIMITS, PlanLimits } from "./types";
import { MemberRole } from "@/features/members/types";
import { MEMBERS_ID } from "@/config";

interface GetSubscriptionProps {
    databases: Databases;
    userId: string;
}

export const getUserSubscription = async ({
    databases,
    userId,
}: GetSubscriptionProps): Promise<Subscription | null> => {
    try {
        const subscriptions = await databases.listDocuments<Subscription>(
            DATABASE_ID,
            SUBSCRIPTIONS_ID,
            [Query.equal("userId", userId), Query.orderDesc("$createdAt"), Query.limit(1)]
        );

        if (subscriptions.documents.length === 0) {
            return null;
        }

        return subscriptions.documents[0];
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
        // Get all admins of the workspace
        const admins = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("workspaceId", workspaceId), Query.equal("role", MemberRole.ADMIN)]
        );

        if (admins.documents.length === 0) {
            return { plan: SubscriptionPlan.FREE, subscription: null };
        }

        // Get subscriptions for all admins
        let highestPlan = SubscriptionPlan.FREE;
        let highestSubscription: Subscription | null = null;

        const planRanking = {
            [SubscriptionPlan.FREE]: 0,
            [SubscriptionPlan.PRO]: 1,
            [SubscriptionPlan.STANDARD]: 2,
            [SubscriptionPlan.ENTERPRISE]: 3,
        };

        for (const admin of admins.documents) {
            const subscription = await getUserSubscription({
                databases,
                userId: admin.userId,
            });

            if (subscription && subscription.status === SubscriptionStatus.ACTIVE) {
                const currentRank = planRanking[subscription.plan];
                const highestRank = planRanking[highestPlan];

                if (currentRank > highestRank) {
                    highestPlan = subscription.plan;
                    highestSubscription = subscription;
                }
            }
        }

        return { plan: highestPlan, subscription: highestSubscription };
    } catch (error: unknown) {
        console.error("Error fetching workspace subscription:", error);
        return { plan: SubscriptionPlan.FREE, subscription: null };
    }
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
            plan = subscription?.plan || SubscriptionPlan.FREE;

            // Use subscription fields
            limits = subscription ? {
                workspaces: subscription.workspaces ?? PLAN_LIMITS[plan].workspaces,
                projectsPerWorkspace: subscription.projectsPerWorkspace ?? PLAN_LIMITS[plan].projectsPerWorkspace,
                membersPerWorkspace: subscription.membersPerWorkspace ?? PLAN_LIMITS[plan].membersPerWorkspace,
                roomsPerWorkspace: subscription.roomsPerWorkspace ?? PLAN_LIMITS[plan].roomsPerWorkspace,
                aiCredits: subscription.aiCredits ?? PLAN_LIMITS[plan].aiCredits,
                aiCreditsPerUser: subscription.aiCreditsPerUser ?? PLAN_LIMITS[plan].aiCreditsPerUser,
                durationDays: subscription.durationDays ?? PLAN_LIMITS[plan].durationDays,
            } : PLAN_LIMITS[plan];

            // Check if subscription is expired for FREE plan
            if (plan === SubscriptionPlan.FREE && subscription) {
                const endDate = new Date(subscription.currentPeriodEnd);
                if (endDate < new Date()) {
                    return {
                        allowed: false,
                        limit: 0,
                        current: 0,
                        plan,
                    };
                }
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

            // Check if subscription is expired
            if (workspaceSubscription.subscription) {
                const endDate = new Date(workspaceSubscription.subscription.currentPeriodEnd);
                if (endDate < new Date()) {
                    return {
                        allowed: false,
                        limit: 0,
                        current: 0,
                        plan,
                    };
                }
            }
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

            case "aiCredits":
                limit = limits.aiCredits;
                if (limit === -1) {
                    return { allowed: true, limit: -1, current: 0, plan };
                }

                // Get workspace-level AI credits usage
                const usages = await databases.listDocuments<UserUsage>(
                    DATABASE_ID,
                    USER_USAGE_ID,
                    [Query.equal("userId", userId), Query.limit(1)]
                );

                if (usages.documents.length > 0) {
                    current = usages.documents[0].aiCreditsUsed;
                } else {
                    current = 0;
                }
                break;
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

        // Use subscription fields
        const limits = workspaceSubscription.subscription ? {
            aiCredits: workspaceSubscription.subscription.aiCredits,
            aiCreditsPerUser: workspaceSubscription.subscription.aiCreditsPerUser,
        } : {
            aiCredits: PLAN_LIMITS[workspaceSubscription.plan].aiCredits,
            aiCreditsPerUser: PLAN_LIMITS[workspaceSubscription.plan].aiCreditsPerUser,
        };
        const workspacePoolLimit = limits.aiCredits ?? PLAN_LIMITS[workspaceSubscription.plan].aiCredits;
        const userQuotaLimit = limits.aiCreditsPerUser ?? PLAN_LIMITS[workspaceSubscription.plan].aiCreditsPerUser;

        // Get all workspace members' usage for pool calculation
        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("workspaceId", workspaceId)]
        );

        let totalWorkspaceUsage = 0;
        let userWorkspaceUsage = 0;
        let usageDoc: UserUsage | null = null;

        // Calculate total workspace usage and user's usage in this workspace
        for (const member of members.documents) {
            const memberUsages = await databases.listDocuments<UserUsage>(
                DATABASE_ID,
                USER_USAGE_ID,
                [Query.equal("userId", member.userId), Query.limit(1)]
            );

            if (memberUsages.documents.length > 0) {
                const usage = memberUsages.documents[0];
                const aiCreditsPerWorkspace = typeof usage.aiCreditsPerWorkspace === 'string'
                    ? JSON.parse(usage.aiCreditsPerWorkspace)
                    : usage.aiCreditsPerWorkspace;

                const workspaceCredits = aiCreditsPerWorkspace[workspaceId] || 0;
                totalWorkspaceUsage += workspaceCredits;

                if (member.userId === userId) {
                    userWorkspaceUsage = workspaceCredits;
                    usageDoc = usage;
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
            const aiCreditsPerWorkspace = typeof usageDoc.aiCreditsPerWorkspace === 'string'
                ? JSON.parse(usageDoc.aiCreditsPerWorkspace)
                : usageDoc.aiCreditsPerWorkspace;

            aiCreditsPerWorkspace[workspaceId] = (aiCreditsPerWorkspace[workspaceId] || 0) + creditsToConsume;

            await databases.updateDocument(
                DATABASE_ID,
                USER_USAGE_ID,
                usageDoc.$id,
                {
                    aiCreditsUsed: usageDoc.aiCreditsUsed + creditsToConsume,
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

    if (limits.roomsPerWorkspace === -1) {
        features.push("Unlimited rooms");
    } else {
        features.push(`${limits.roomsPerWorkspace} room${limits.roomsPerWorkspace > 1 ? 's' : ''} per workspace`);
    }

    features.push(`${limits.aiCredits} AI credits per month`);

    if (limits.durationDays) {
        features.push(`Valid for ${limits.durationDays} days`);
    }

    return features;
};
