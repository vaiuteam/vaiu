import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

const FAQPage = () => {
  const faqItems = [
    {
      id: "getting-started",
      question: "How do I get started with Vaiu?",
      answer:
        "Getting started is simple! Sign up with your email, create your first workspace, and invite your team members. You can start collaborating immediately by creating projects and channels for your team to communicate and share work.",
    },
    {
      id: "teams-collaboration",
      question: "How can my team collaborate effectively on Vaiu?",
      answer:
        "Vaiu provides multiple collaboration features including real-time channels, project management, issue tracking, and pull request reviews. You can organize work by projects, create channels for different topics, and use mentions to keep your team in the loop.",
    },
    {
      id: "pricing",
      question: "What are your pricing plans?",
      answer:
        "Vaiu offers flexible pricing options for teams of all sizes. We have free and paid plans depending on your workspace needs. Visit our pricing page to see detailed plans, or contact our sales team for enterprise solutions.",
    },
    {
      id: "security",
      question: "Is my data secure on Vaiu?",
      answer:
        "Yes, security is a top priority. We use industry-standard encryption for data in transit and at rest. All user data is securely stored and we comply with major data protection regulations. For more details, check our privacy policy.",
    },
    {
      id: "permissions",
      question: "How do I manage team permissions and roles?",
      answer:
        "You can set granular permissions for team members through workspace settings. Assign different roles (admin, member, viewer) to control what users can access. Channel-specific permissions allow fine-tuned control over who can view and modify content.",
    },
    {
      id: "integrations",
      question: "Can I integrate Vaiu with other tools?",
      answer:
        "Vaiu supports various integrations with popular development and productivity tools. We offer GitHub integration for pull requests and issues, and more integrations are coming. Check our documentation for available integrations.",
    },
    {
      id: "notifications",
      question: "How do I manage notifications?",
      answer:
        "You can customize notification settings in your profile preferences. Choose which activities trigger notifications and how you want to be notified. Mention specific team members to ensure they see important updates.",
    },
    {
      id: "support",
      question: "How can I get help or report issues?",
      answer:
        "Our support team is here to help! Visit our contact page, email us at contact.vaiuteam@gmail.com, or check our documentation and blog for answers. For bug reports, you can also open an issue on our GitHub repository.",
    },
    {
      id: "mobile",
      question: "Is there a mobile app for Vaiu?",
      answer:
        "Vaiu is fully responsive and works great on mobile browsers. For native mobile app support, check our documentation for the latest updates on mobile app availability.",
    },
    {
      id: "export-data",
      question: "Can I export my data from Vaiu?",
      answer:
        "Yes, we believe your data is yours. You can export your workspace data in standard formats. Contact our support team for help with data export or migration needs.",
    },
  ];

  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Find answers to common questions about Vaiu. Can&apos;t find what you&apos;re looking for?{" "}
            <Link href="/contact" className="text-primary hover:underline font-semibold">
              Contact us
            </Link>
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="rounded-lg border border-blue-200/70 dark:border-blue-900/40 bg-background px-6 shadow-sm transition-colors data-[state=open]:border-blue-500/50 data-[state=open]:bg-blue-50/50 dark:data-[state=open]:bg-blue-950/20"
              >
                <AccordionTrigger className="py-4 text-left text-base font-semibold text-foreground hover:no-underline data-[state=open]:text-blue-600 dark:data-[state=open]:text-blue-400">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-lg border border-border bg-muted/30 p-8 text-center md:p-12">
          <h2 className="mb-4 text-2xl font-bold">Still have questions?</h2>
          <p className="mb-6 text-muted-foreground">
            Reach out to our team and we&apos;ll be happy to help you get the most out of Vaiu.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </Link>
            <a
              href="https://medium.com/@prathyarti/vaiu-d9e33ef48464"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-border px-8 py-3 font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Read Our Blog
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
