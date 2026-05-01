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

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
    [SubscriptionPlan.FREE]: {
        workspaces: 1,
        projectsPerWorkspace: 1,
        membersPerWorkspace: 3,
        roomsPerWorkspace: 2,
        aiCredits: 10, // Total pool
        aiCreditsPerUser: 5, // Per-user quota
        durationDays: 30,
    },
    [SubscriptionPlan.PRO]: {
        workspaces: 5,
        projectsPerWorkspace: 10,
        membersPerWorkspace: 15,
        roomsPerWorkspace: 10,
        aiCredits: 500, // Total pool
        aiCreditsPerUser: 100, // Per-user quota
        durationDays: null,
    },
    [SubscriptionPlan.STANDARD]: {
        workspaces: 15,
        projectsPerWorkspace: 50,
        membersPerWorkspace: 50,
        roomsPerWorkspace: 50,
        aiCredits: 2000, // Total pool
        aiCreditsPerUser: 200, // Per-user quota
        durationDays: null,
    },
    [SubscriptionPlan.ENTERPRISE]: {
        workspaces: -1, // unlimited
        projectsPerWorkspace: -1, // unlimited
        membersPerWorkspace: -1, // unlimited
        roomsPerWorkspace: -1, // unlimited
        aiCredits: 10000, // Total pool
        aiCreditsPerUser: 1000, // Per-user quota
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
        currency: "INR",
    },
    [SubscriptionPlan.PRO]: {
        monthly: 999,
        yearly: 9999,
        currency: "INR",
    },
    [SubscriptionPlan.STANDARD]: {
        monthly: 2999,
        yearly: 29999,
        currency: "INR",
    },
    [SubscriptionPlan.ENTERPRISE]: {
        monthly: null, // Contact sales
        yearly: null,  // Contact sales
        currency: "INR",
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
    monthlyPrice: number | null;
    yearlyPrice: number | null;
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
