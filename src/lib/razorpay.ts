import "server-only";
import crypto from "crypto";
import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials are not configured");
}

export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayPlan = async (
    amount: number,
    currency: string,
    interval: "monthly" | "yearly"
) => {
    try {
        const plan = await razorpay.plans.create({
            period: interval === "monthly" ? "monthly" : "yearly",
            interval: 1,
            item: {
                name: `Vaiu ${interval === "monthly" ? "Monthly" : "Yearly"} Subscription`,
                amount: amount * 100, // Amount in paise
                currency: currency,
            },
        });
        return plan;
    } catch (error) {
        console.error("Error creating Razorpay plan:", error);
        throw error;
    }
};

export const createRazorpaySubscription = async (
    planId: string,
    customerId?: string,
    totalCount?: number
) => {
    try {
        const subscriptionData = {
            plan_id: planId,
            total_count: totalCount || 12,
            quantity: 1,
            customer_notify: 1 as const,
            ...(customerId && { customer_id: customerId }),
        };

        const subscription = await razorpay.subscriptions.create(subscriptionData);
        return subscription;
    } catch (error) {
        console.error("Error creating Razorpay subscription:", error);
        throw error;
    }
};

export const cancelRazorpaySubscription = async (
    subscriptionId: string,
    cancelAtCycleEnd: boolean = true
) => {
    try {
        const subscription = await razorpay.subscriptions.cancel(subscriptionId, cancelAtCycleEnd);
        return subscription;
    } catch (error) {
        console.error("Error canceling Razorpay subscription:", error);
        throw error;
    }
};

export const fetchRazorpaySubscription = async (subscriptionId: string) => {
    try {
        const subscription = await razorpay.subscriptions.fetch(subscriptionId);
        return subscription;
    } catch (error) {
        console.error("Error fetching Razorpay subscription:", error);
        throw error;
    }
};

export const verifyRazorpaySignature = (
    razorpayPaymentId: string,
    razorpaySubscriptionId: string,
    razorpaySignature: string
): boolean => {
    try {
        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(`${razorpayPaymentId}|${razorpaySubscriptionId}`)
            .digest("hex");

        return generated_signature === razorpaySignature;
    } catch (error) {
        console.error("Error verifying Razorpay signature:", error);
        return false;
    }
};
