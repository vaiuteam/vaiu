import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { sendEmail } from "@/lib/email";

const app = new Hono();

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactData = z.infer<typeof contactSchema>;

app.post("/", zValidator("json", contactSchema), async (c) => {
  try {
    const data: ContactData = c.req.valid("json");

    // Email to team
    const teamEmailContent = `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, "<br>")}</p>
      `;

    // Send email to team
    await sendEmail({
      to: process.env.GMAIL_USER!,
      subject: `New Contact Form: ${data.subject}`,
      html: teamEmailContent,
    });

    const userEmailContent = `
        <h2>Thank You for Contacting Us</h2>
        <p>Hi ${data.name},</p>
        <p>We've received your message and will get back to you as soon as possible.</p>
        <hr>
        <p><strong>Your Message:</strong></p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p>${data.message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p>Best regards,<br>VAIU Team</p>
      `;

    // Send confirmation email to user
    await sendEmail({
      to: data.email,
      subject: "We received your message - VAIU",
      html: userEmailContent,
    });

    return c.json(
      {
        success: true,
        message: "Thank you for your message! We'll get back to you soon.",
        data: {
          name: data.name,
          email: data.email,
          subject: data.subject,
        },
      },
      201,
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return c.json(
      {
        success: false,
        error: "Failed to submit contact form. Please try again.",
      },
      500,
    );
  }
});

export default app;
