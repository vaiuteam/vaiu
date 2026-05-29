import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { razorpay } from "./razorpay";

export type RazorpayPlanKey =
    | "PRO_MONTHLY"
    | "PRO_YEARLY"
    | "STANDARD_MONTHLY"
    | "STANDARD_YEARLY";

const PLAN_ENV_KEYS: Record<RazorpayPlanKey, string> = {
    PRO_MONTHLY: "RAZORPAY_PLAN_PRO_MONTHLY",
    PRO_YEARLY: "RAZORPAY_PLAN_PRO_YEARLY",
    STANDARD_MONTHLY: "RAZORPAY_PLAN_STANDARD_MONTHLY",
    STANDARD_YEARLY: "RAZORPAY_PLAN_STANDARD_YEARLY",
};

const LOCAL_PLANS_FILE = join(process.cwd(), "razorpay-plans.local.json");

function readLocalPlansFile(): Partial<Record<RazorpayPlanKey, string>> {
    if (!existsSync(LOCAL_PLANS_FILE)) {
        return {};
    }

    try {
        const parsed = JSON.parse(readFileSync(LOCAL_PLANS_FILE, "utf8")) as Partial<
            Record<RazorpayPlanKey, string>
        >;
        return parsed;
    } catch (error) {
        console.error("Failed to read razorpay-plans.local.json:", error);
        return {};
    }
}

/** Read plan IDs at request time — local JSON overrides env (no server restart needed). */
export function getRazorpayPlanIds(): Record<RazorpayPlanKey, string | undefined> {
    const fromFile = readLocalPlansFile();

    return {
        PRO_MONTHLY:
            fromFile.PRO_MONTHLY?.trim() ||
            process.env.RAZORPAY_PLAN_PRO_MONTHLY?.trim(),
        PRO_YEARLY:
            fromFile.PRO_YEARLY?.trim() || process.env.RAZORPAY_PLAN_PRO_YEARLY?.trim(),
        STANDARD_MONTHLY:
            fromFile.STANDARD_MONTHLY?.trim() ||
            process.env.RAZORPAY_PLAN_STANDARD_MONTHLY?.trim(),
        STANDARD_YEARLY:
            fromFile.STANDARD_YEARLY?.trim() ||
            process.env.RAZORPAY_PLAN_STANDARD_YEARLY?.trim(),
    };
}

export function getRazorpayPlanId(planKey: RazorpayPlanKey): string | undefined {
    return getRazorpayPlanIds()[planKey];
}

export async function assertRazorpayPlanExists(
    planId: string,
    planKey: RazorpayPlanKey
): Promise<void> {
    try {
        await razorpay.plans.fetch(planId);
    } catch {
        throw new Error(
            `Razorpay plan "${planKey}" (${planId}) is invalid for your API keys. ` +
                `Run "bun run setup:razorpay-plans" and retry.`
        );
    }
}

export function writeLocalRazorpayPlans(plans: Record<RazorpayPlanKey, string>): void {
    writeFileSync(LOCAL_PLANS_FILE, JSON.stringify(plans, null, 2) + "\n", "utf8");
}

export { PLAN_ENV_KEYS };
