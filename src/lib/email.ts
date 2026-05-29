import nodemailer from "nodemailer";

const FROM_NAME = "Vaiu";

function getTransporter() {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
    });
}

export function isEmailConfigured(): boolean {
    return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}): Promise<boolean> {
    const transporter = getTransporter();

    if (!transporter || !process.env.GMAIL_USER) {
        console.warn(`Email not configured — skipped sending "${subject}" to ${to}`);
        return false;
    }

    try {
        await transporter.sendMail({
            from: `"${FROM_NAME}" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html,
        });
        return true;
    } catch (error) {
        console.error(`Failed to send email "${subject}" to ${to}:`, error);
        return false;
    }
}
