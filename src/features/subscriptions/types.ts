import { Models } from "node-appwrite";

export enum SubscriptionPlan {
    FREE = "FREE",
    PRO = "PRO",
    STANDARD = "STANDARD",
    ENTERPRISE = "ENTERPRISE",
}

export enum SubscriptionStatus {
    ACTIVE = "ACTIVE",
    CANCELLED = "CANCELLED",
    EXPIRED = "EXPIRED",
    PENDING = "PENDING",
}

export enum AIFeatureCost {
    SUMMARY = 2,        // AI summary generation: 2 credits
    CODE_REVIEW = 5,    // AI code review: 5 credits
    TEST_GENERATION = 10, // AI test generation: 10 credits
}

export interface PlanLimits {
    workspaces: number;
    projectsPerWorkspace: number;
    membersPerWorkspace: number;
    roomsPerWorkspace: number;
    aiCredits: number; // Total workspace pool
    aiCreditsPerUser: number; // Per-user monthly quota
    durationDays: number | null; // null for unlimited
}

// Invariant: aiCredits (workspace pool) >= membersPerWorkspace * aiCreditsPerUser
// so every member can actually reach their advertised per-user quota.
// For ENTERPRISE (unlimited members), the pool is set to unlimited too.
export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
    [SubscriptionPlan.FREE]: {
        workspaces: 1,
        projectsPerWorkspace: 1,
        membersPerWorkspace: 5,
        roomsPerWorkspace: 2,
        aiCredits: 25, // 5 members × 5 per-user
        aiCreditsPerUser: 5,
        durationDays: 30,
    },
    [SubscriptionPlan.PRO]: {
        workspaces: 5,
        projectsPerWorkspace: 5,
        membersPerWorkspace: 15,
        roomsPerWorkspace: 10,
        aiCredits: 1500, // 15 members × 100 per-user
        aiCreditsPerUser: 100,
        durationDays: null,
    },
    [SubscriptionPlan.STANDARD]: {
        workspaces: 15,
        projectsPerWorkspace: 50,
        membersPerWorkspace: 50,
        roomsPerWorkspace: 50,
        aiCredits: 10000, // 50 members × 200 per-user
        aiCreditsPerUser: 200,
        durationDays: null,
    },
    [SubscriptionPlan.ENTERPRISE]: {
        workspaces: -1, // unlimited
        projectsPerWorkspace: -1, // unlimited
        membersPerWorkspace: -1, // unlimited
        roomsPerWorkspace: -1, // unlimited
        aiCredits: -1, // unlimited (members are unlimited)
        aiCreditsPerUser: 1000,
        durationDays: null,
    },
};

export interface PlanPricing {
    monthly: number | null; // null for custom pricing (Enterprise)
    yearly: number | null;  // null for custom pricing (Enterprise)
    currency: string;
}

export const PLAN_PRICING: Record<SubscriptionPlan, PlanPricing> = {
    [SubscriptionPlan.FREE]: {
        monthly: 0,
        yearly: 0,
        currency: "USD",
    },
    [SubscriptionPlan.PRO]: {
        monthly: 12,
        yearly: 120, // ~17% off vs 12 * 12
        currency: "USD",
    },
    [SubscriptionPlan.STANDARD]: {
        monthly: 30,
        yearly: 300, // ~17% off vs 30 * 12
        currency: "USD",
    },
    [SubscriptionPlan.ENTERPRISE]: {
        monthly: null, // Contact sales
        yearly: null,  // Contact sales
        currency: "USD",
    },
};

export type Subscription = Models.Document & {
    userId: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    razorpaySubscriptionId?: string;
    razorpayCustomerId?: string;
    razorpayPlanId?: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    billingCycle: "MONTHLY" | "YEARLY";
    // Plan limits
    workspaces?: number;
    projectsPerWorkspace?: number;
    membersPerWorkspace?: number;
    roomsPerWorkspace?: number;
    aiCredits?: number;
    aiCreditsPerUser?: number;
    // The amount actually charged for this subscription per `billingCycle`,
    // in the smallest unit-equivalent of `currency`. null for FREE / Enterprise.
    price: number | null;
    currency: string;
    durationDays: number | null;
};

export type UserUsage = Models.Document & {
    userId: string;
    workspacesCount: number;
    projectsCount: Record<string, number>; // workspaceId -> count
    roomsCount: Record<string, number>; // workspaceId -> count
    aiCreditsUsed: number; // Total credits used across all workspaces
    aiCreditsPerWorkspace: Record<string, number>; // workspaceId -> credits used
    lastUpdated: string;
};
