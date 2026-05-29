import { sendEmail } from "@/lib/email";
import { SubscriptionPlan } from "@/features/subscriptions/types";
import { getPlanFeatures } from "@/features/subscriptions/utils";

function formatPrice(amount: number | null, currency: string): string {
    if (amount === null) return "Custom";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(amount);
}

function subscriptionConfirmationHtml({
    name,
    plan,
    billingCycle,
    price,
    currency,
    periodEnd,
    paymentId,
}: {
    name: string;
    plan: SubscriptionPlan;
    billingCycle: "MONTHLY" | "YEARLY";
    price: number | null;
    currency: string;
    periodEnd: string;
    paymentId?: string;
}): string {
    const features = getPlanFeatures(plan);
    const billingLabel = billingCycle === "MONTHLY" ? "Monthly" : "Yearly";
    const periodEndDate = new Date(periodEnd).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
            <h2 style="color: #3399cc;">Payment confirmed — thank you!</h2>
            <p>Hi ${name},</p>
            <p>Your Vaiu <strong>${plan}</strong> subscription is now active. Here are your payment details:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                    <td style="padding: 8px 0; color: #666;">Plan</td>
                    <td style="padding: 8px 0; text-align: right;"><strong>${plan} (${billingLabel})</strong></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;">Amount paid</td>
                    <td style="padding: 8px 0; text-align: right;"><strong>${formatPrice(price, currency)}</strong></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;">Current period ends</td>
                    <td style="padding: 8px 0; text-align: right;">${periodEndDate}</td>
                </tr>
                ${paymentId ? `
                <tr>
                    <td style="padding: 8px 0; color: #666;">Payment ID</td>
                    <td style="padding: 8px 0; text-align: right; font-size: 12px;">${paymentId}</td>
                </tr>` : ""}
            </table>
            <p><strong>What's included in your plan:</strong></p>
            <ul>
                ${features.map((f) => `<li>${f}</li>`).join("")}
            </ul>
            <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://vaiu.app"}/billing"
                   style="display: inline-block; background: #3399cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                    View Billing
                </a>
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 32px;">
                Questions about your subscription? Contact us at contact@vaiu.com.
            </p>
            <p>Best regards,<br>The Vaiu Team</p>
        </div>
    `;
}

export async function sendSubscriptionConfirmationEmail({
    name,
    email,
    plan,
    billingCycle,
    price,
    currency,
    periodEnd,
    paymentId,
}: {
    name: string;
    email: string;
    plan: SubscriptionPlan;
    billingCycle: "MONTHLY" | "YEARLY";
    price: number | null;
    currency: string;
    periodEnd: string;
    paymentId?: string;
}): Promise<boolean> {
    return sendEmail({
        to: email,
        subject: `Your Vaiu ${plan} subscription is active`,
        html: subscriptionConfirmationHtml({
            name,
            plan,
            billingCycle,
            price,
            currency,
            periodEnd,
            paymentId,
        }),
    });
}
