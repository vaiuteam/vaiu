"use client";

import Link from "next/link";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { Doc, DocSummary } from "@/lib/docs";
import { cn } from "@/lib/utils";

type DocsShellProps = {
    docs: DocSummary[];
    activeSlug: string;
    doc: Doc;
};

const markdownComponents: Components = {
    h1: ({ children }) => (
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {children}
        </h1>
    ),
    h2: ({ children }) => (
        <h2 className="mt-12 text-2xl font-semibold tracking-tight">{children}</h2>
    ),
    h3: ({ children }) => (
        <h3 className="mt-8 text-xl font-semibold tracking-tight">{children}</h3>
    ),
    p: ({ children }) => (
        <p className="mt-4 text-sm leading-7 text-foreground/90 sm:text-base">
            {children}
        </p>
    ),
    ul: ({ children }) => (
        <ul className="mt-4 list-disc space-y-2 pl-6 text-sm sm:text-base">
            {children}
        </ul>
    ),
    ol: ({ children }) => (
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-sm sm:text-base">
            {children}
        </ol>
    ),
    li: ({ children }) => <li className="leading-7 text-foreground/90">{children}</li>,
    hr: () => <hr className="my-10 border-border" />,
    a: ({ href, children }) => {
        const isExternalLink = href?.startsWith("http");

        return (
            <a
                href={href}
                target={isExternalLink ? "_blank" : undefined}
                rel={isExternalLink ? "noreferrer" : undefined}
                className="font-medium text-blue-600 underline underline-offset-4 transition hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
                {children}
            </a>
        );
    },
};

const getDocHref = (slug: string) => {
    if (slug === "introduction") {
        return "/docs";
    }

    return `/docs/${slug}`;
};

export const DocsShell = ({ docs, activeSlug, doc }: DocsShellProps) => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
            <div className="container mx-auto w-full px-4 sm:px-6 lg:px-8">
                <div className="mb-4 pt-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="w-fit gap-2 px-2 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>

                <section className="grid gap-8 pb-14 md:grid-cols-[260px_minmax(0,1fr)]">
                    <aside className="md:sticky md:top-28 md:self-start">
                        <div className="rounded-2xl border bg-card/80 p-4 shadow-sm backdrop-blur">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Documentation
                            </p>
                            <nav className="space-y-1">
                                {docs.map((item) => (
                                    <Link
                                        key={item.slug}
                                        href={getDocHref(item.slug)}
                                        className={cn(
                                            "block rounded-lg px-3 py-2 text-sm transition",
                                            item.slug === activeSlug
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                        )}
                                    >
                                        {item.title}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    <article className="rounded-2xl border bg-card/80 p-6 shadow-sm backdrop-blur sm:p-8">
                        <ReactMarkdown components={markdownComponents}>
                            {doc.content}
                        </ReactMarkdown>
                    </article>
                </section>
            </div>
        </div>
    );
};
