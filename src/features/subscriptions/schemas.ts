import { z } from "zod";
import { SubscriptionPlan, SubscriptionStatus } from "./types";

export const createSubscriptionSchema = z.object({
    plan: z.nativeEnum(SubscriptionPlan),
    billingCycle: z.enum(["MONTHLY", "YEARLY", "ONE_TIME"]),
    seatCount: z.number().int().min(1).max(10000).optional(), // internal only — not user-facing
    workspaceId: z.string().optional(),
});

export const updateSubscriptionSchema = z.object({
    plan: z.nativeEnum(SubscriptionPlan).optional(),
    status: z.nativeEnum(SubscriptionStatus).optional(),
    cancelAtPeriodEnd: z.boolean().optional(),
});

export const verifyPaymentSchema = z.object({
    razorpayPaymentId: z.string(),
    razorpaySubscriptionId: z.string().optional(),
    razorpayOrderId: z.string().optional(),
    razorpaySignature: z.string(),
});

export const cancelSubscriptionSchema = z.object({
    cancelAtPeriodEnd: z.boolean().default(true),
    workspaceId: z.string().optional(),
});

export type CreateSubscriptionSchema = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionSchema = z.infer<typeof updateSubscriptionSchema>;
export type VerifyPaymentSchema = z.infer<typeof verifyPaymentSchema>;
export type CancelSubscriptionSchema = z.infer<typeof cancelSubscriptionSchema>;
