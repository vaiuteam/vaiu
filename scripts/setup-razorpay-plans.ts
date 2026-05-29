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

const PAID_PLANS = [
    {
        envKey: "RAZORPAY_PLAN_PRO_MONTHLY",
        plan: SubscriptionPlan.PRO,
        billingCycle: "MONTHLY" as const,
        interval: "monthly" as const,
        title: "Vaiu Pro Monthly",
        description:
            "Pro plan for individual developers and small teams. 5 workspaces, 15 members, 1,500 AI credits/month.",
    },
    {
        envKey: "RAZORPAY_PLAN_PRO_YEARLY",
        plan: SubscriptionPlan.PRO,
        billingCycle: "YEARLY" as const,
        interval: "yearly" as const,
        title: "Vaiu Pro Yearly",
        description:
            "Pro plan billed annually (~17% off). 5 workspaces, 15 members, 1,500 AI credits/month.",
    },
    {
        envKey: "RAZORPAY_PLAN_STANDARD_MONTHLY",
        plan: SubscriptionPlan.STANDARD,
        billingCycle: "MONTHLY" as const,
        interval: "monthly" as const,
        title: "Vaiu Standard Monthly",
        description:
            "Standard plan for growing teams. 15 workspaces, 50 members, 10,000 AI credits/month.",
    },
    {
        envKey: "RAZORPAY_PLAN_STANDARD_YEARLY",
        plan: SubscriptionPlan.STANDARD,
        billingCycle: "YEARLY" as const,
        interval: "yearly" as const,
        title: "Vaiu Standard Yearly",
        description:
            "Standard plan billed annually (~17% off). 15 workspaces, 50 members, 10,000 AI credits/month.",
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
