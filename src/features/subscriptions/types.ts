import { Models } from "node-appwrite";

export enum SubscriptionPlan {
    FREE = "FREE",
    PRO = "PRO",
    STANDARD = "STANDARD",
    ENTERPRISE = "ENTERPRISE",
    EVENT = "EVENT",
}

export enum SubscriptionStatus {
    ACTIVE = "ACTIVE",
    CANCELLED = "CANCELLED",
    EXPIRED = "EXPIRED",
    PENDING = "PENDING",
}

export enum AIFeatureCost {
    SUMMARY = 2,
    CODE_REVIEW = 5,
    TEST_GENERATION = 10,
}

export interface PlanLimits {
    workspaces: number;
    projectsPerWorkspace: number;
    membersPerWorkspace: number;
    roomsPerWorkspace: number;
    aiCredits: number;
    aiCreditsPerUser: number;
    durationDays: number | null;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
    [SubscriptionPlan.FREE]: {
        workspaces: 1,
        projectsPerWorkspace: 1,
        membersPerWorkspace: 5,
        roomsPerWorkspace: 2,
        aiCredits: 100,
        aiCreditsPerUser: 100,
        durationDays: 30,
    },
    [SubscriptionPlan.PRO]: {
        workspaces: 5,
        projectsPerWorkspace: 10,
        // Per-seat plan: actual member limit = seatCount stored on subscription doc.
        // -1 here so the default falls through to seatCount at check time.
        membersPerWorkspace: -1,
        roomsPerWorkspace: 10,
        // AI credit pool scales with seats (seatCount × aiCreditsPerUser at create time).
        aiCredits: -1,
        aiCreditsPerUser: 200,
        durationDays: null,
    },
    [SubscriptionPlan.STANDARD]: {
        workspaces: 15,
        projectsPerWorkspace: 50,
        membersPerWorkspace: -1,
        roomsPerWorkspace: 50,
        aiCredits: -1,
        aiCreditsPerUser: 500,
        durationDays: null,
    },
    [SubscriptionPlan.ENTERPRISE]: {
        workspaces: -1,
        projectsPerWorkspace: -1,
        membersPerWorkspace: -1,
        roomsPerWorkspace: -1,
        aiCredits: -1,
        aiCreditsPerUser: 1000,
        durationDays: null,
    },
    [SubscriptionPlan.EVENT]: {
        workspaces: 1,
        projectsPerWorkspace: 10,
        membersPerWorkspace: 150,
        roomsPerWorkspace: 10,
        aiCredits: 1000,
        aiCreditsPerUser: 100,
        durationDays: 14,
    },
};

export interface PlanPricing {
    monthly: number | null;
    yearly: number | null;
    currency: string;
    perSeat: boolean;
}

export const PLAN_PRICING: Record<SubscriptionPlan, PlanPricing> = {
    [SubscriptionPlan.FREE]: {
        monthly: 0,
        yearly: 0,
        currency: "USD",
        perSeat: false,
    },
    [SubscriptionPlan.PRO]: {
        monthly: 8,    // per seat / month
        yearly: 80,    // per seat / year (~17% off)
        currency: "USD",
        perSeat: true,
    },
    [SubscriptionPlan.STANDARD]: {
        monthly: 14,   // per seat / month
        yearly: 140,   // per seat / year (~17% off)
        currency: "USD",
        perSeat: true,
    },
    [SubscriptionPlan.ENTERPRISE]: {
        monthly: null,
        yearly: null,
        currency: "USD",
        perSeat: false,
    },
    [SubscriptionPlan.EVENT]: {
        monthly: 49,   // flat one-time fee for 14-day event access
        yearly: null,
        currency: "USD",
        perSeat: false,
    },
};

export type Subscription = Models.Document & {
    userId: string;
    workspaceId?: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    razorpaySubscriptionId?: string;
    razorpayOrderId?: string;
    razorpayCustomerId?: string;
    razorpayPlanId?: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    billingCycle: "MONTHLY" | "YEARLY" | "ONE_TIME";
    seatCount?: number;
    // Plan limits
    workspaces?: number;
    projectsPerWorkspace?: number;
    membersPerWorkspace?: number;
    roomsPerWorkspace?: number;
    aiCredits?: number;
    aiCreditsPerUser?: number;
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
