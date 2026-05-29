import { sendEmail } from "@/lib/email";

function welcomeEmailHtml(name: string): string {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
            <h2 style="color: #3399cc;">Welcome to Vaiu!</h2>
            <p>Hi ${name},</p>
            <p>Thanks for signing up. Vaiu helps your team manage GitHub repositories, track issues, and collaborate in one place.</p>
            <p><strong>Your free trial includes:</strong></p>
            <ul>
                <li>1 workspace</li>
                <li>1 project per workspace</li>
                <li>Up to 5 team members</li>
                <li>25 AI credits for 30 days</li>
            </ul>
            <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://vaiu.app"}"
                   style="display: inline-block; background: #3399cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                    Go to Dashboard
                </a>
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 32px;">
                Need help? Reply to this email or contact us at contact@vaiu.com.
            </p>
            <p>Best regards,<br>The Vaiu Team</p>
        </div>
    `;
}

export async function sendWelcomeEmail({
    name,
    email,
}: {
    name: string;
    email: string;
}): Promise<boolean> {
    return sendEmail({
        to: email,
        subject: "Welcome to Vaiu!",
        html: welcomeEmailHtml(name),
    });
}
