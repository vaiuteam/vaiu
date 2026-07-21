/**
 * Creates all Vaiu Razorpay subscription plans and prints env vars to copy.
 *
 * Usage:
 *   bun run setup:razorpay-plans
 *
 * Requires in .env.local:
 *   RAZORPAY_KEY_ID
 *   RAZORPAY_KEY_SECRET
 */

import Razorpay from "razorpay";
import { PLAN_PRICING, SubscriptionPlan } from "../src/features/subscriptions/types";

// Per-seat plans: the Razorpay plan price is per unit (one seat).
// Subscriptions are created with `quantity = seatCount`, so Razorpay
// charges price × quantity automatically each billing cycle.
const PAID_PLANS = [
    {
        envKey: "RAZORPAY_PLAN_PRO_MONTHLY",
        plan: SubscriptionPlan.PRO,
        billingCycle: "MONTHLY" as const,
        interval: "monthly" as const,
        title: "Vaiu Pro Monthly (per seat)",
        description: "Pro plan — $8 per seat per month. 5 workspaces, 10 projects, 100 AI credits/seat/month.",
    },
    {
        envKey: "RAZORPAY_PLAN_PRO_YEARLY",
        plan: SubscriptionPlan.PRO,
        billingCycle: "YEARLY" as const,
        interval: "yearly" as const,
        title: "Vaiu Pro Yearly (per seat)",
        description: "Pro plan billed annually — $80 per seat per year (~17% off).",
    },
    {
        envKey: "RAZORPAY_PLAN_STANDARD_MONTHLY",
        plan: SubscriptionPlan.STANDARD,
        billingCycle: "MONTHLY" as const,
        interval: "monthly" as const,
        title: "Vaiu Standard Monthly (per seat)",
        description: "Standard plan — $14 per seat per month. 15 workspaces, 50 projects, 200 AI credits/seat/month.",
    },
    {
        envKey: "RAZORPAY_PLAN_STANDARD_YEARLY",
        plan: SubscriptionPlan.STANDARD,
        billingCycle: "YEARLY" as const,
        interval: "yearly" as const,
        title: "Vaiu Standard Yearly (per seat)",
        description: "Standard plan billed annually — $140 per seat per year (~17% off).",
    },
];

async function main() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        console.error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in environment.");
        process.exit(1);
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const envLines: string[] = [];

    console.log("Creating Razorpay plans...\n");

    for (const entry of PAID_PLANS) {
        const pricing = PLAN_PRICING[entry.plan];
        const amount =
            entry.billingCycle === "MONTHLY" ? pricing.monthly : pricing.yearly;

        if (amount === null) {
            console.warn(`Skipping ${entry.envKey} — no fixed price for ${entry.plan}`);
            continue;
        }

        const plan = await razorpay.plans.create({
            period: entry.interval,
            interval: 1,
            item: {
                name: entry.title,
                description: entry.description,
                amount: amount * 100,
                currency: pricing.currency,
            },
        });

        console.log(`✓ ${entry.title}`);
        console.log(`  Plan ID: ${plan.id}`);
        console.log(`  Amount:  ${pricing.currency} ${amount} / ${entry.interval}\n`);

        envLines.push(`${entry.envKey}=${plan.id}`);
    }

    console.log("Add these to your .env.local:\n");
    console.log(envLines.join("\n"));
}

main().catch((error) => {
    console.error("Failed to create Razorpay plans:", error);
    process.exit(1);
});
