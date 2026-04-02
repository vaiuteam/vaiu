"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, BookOpenText, Clock3, Hash } from "lucide-react";
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
        <h2 className="mt-12 border-t border-border/50 pt-8 text-2xl font-semibold tracking-tight">
            {children}
        </h2>
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
    hr: () => <hr className="my-10 border-border/60" />,
    blockquote: ({ children }) => (
        <blockquote className="mt-6 rounded-2xl bg-muted/50 px-4 py-3 text-sm italic text-foreground/85">
            {children}
        </blockquote>
    ),
    code: ({ inline, children }) =>
        inline ? (
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">
                {children}
            </code>
        ) : (
            <code className="font-mono text-sm leading-6">{children}</code>
        ),
    pre: ({ children }) => (
        <pre className="mt-6 overflow-x-auto rounded-2xl bg-muted/65 p-4 font-mono text-sm">
            {children}
        </pre>
    ),
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
    const readingTime = Math.max(1, Math.ceil(doc.content.split(/\s+/).length / 220));
    const headings = useMemo(
        () =>
            doc.content
                .split(/\r?\n/)
                .filter((line) => line.startsWith("## "))
                .map((line) => line.replace(/^##\s+/, "").trim())
                .filter(Boolean),
        [doc.content],
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
            <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
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

                <section className="mb-8 rounded-[32px] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent),hsl(var(--surface))] px-6 py-7 shadow-none backdrop-blur-xl dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.8)] sm:px-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                Documentation
                            </p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                                {doc.title}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                                Learn how Vaiu structures collaboration, GitHub workflows,
                                analytics, and team coordination.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2 rounded-2xl bg-background/45 px-3 py-2 backdrop-blur-sm">
                                <BookOpenText className="h-4 w-4" />
                                <span>{docs.length} docs</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-2xl bg-background/45 px-3 py-2 backdrop-blur-sm">
                                <Clock3 className="h-4 w-4" />
                                <span>{readingTime} min read</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-8 pb-14 xl:grid-cols-[260px_minmax(0,1fr)_220px]">
                    <aside className="xl:sticky xl:top-28 xl:self-start">
                        <div className="rounded-[28px] bg-card/70 p-4 shadow-none backdrop-blur-xl dark:shadow-[0_22px_50px_-35px_rgba(15,23,42,0.75)]">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Documentation
                            </p>
                            <nav className="space-y-1.5">
                                {docs.map((item) => (
                                    <Link
                                        key={item.slug}
                                        href={getDocHref(item.slug)}
                                        className={cn(
                                            "block rounded-2xl px-3 py-2.5 text-sm transition",
                                            item.slug === activeSlug
                                                ? "bg-foreground text-background"
                                                : "text-muted-foreground hover:bg-muted/65 hover:text-foreground",
                                        )}
                                    >
                                        {item.title}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    <article className="rounded-[32px] bg-card/72 p-6 shadow-none backdrop-blur-xl dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.8)] sm:p-8">
                        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <div className="rounded-full bg-muted/60 px-3 py-1.5">
                                {doc.slug === "introduction" ? "Start here" : doc.slug}
                            </div>
                            <div className="rounded-full bg-muted/60 px-3 py-1.5">
                                Updated in docs
                            </div>
                        </div>
                        <ReactMarkdown components={markdownComponents}>
                            {doc.content}
                        </ReactMarkdown>
                    </article>

                    <aside className="hidden xl:sticky xl:top-28 xl:block xl:self-start">
                        <div className="rounded-[28px] bg-card/70 p-4 shadow-none backdrop-blur-xl dark:shadow-[0_22px_50px_-35px_rgba(15,23,42,0.75)]">
                            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                <Hash className="h-3.5 w-3.5" />
                                On This Page
                            </p>
                            <div className="space-y-2">
                                {headings.length > 0 ? (
                                    headings.map((heading) => (
                                        <p
                                            key={heading}
                                            className="text-sm leading-6 text-muted-foreground"
                                        >
                                            {heading}
                                        </p>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        This page is a short overview.
                                    </p>
                                )}
                            </div>
                        </div>
                    </aside>
                </section>
            </div>
        </div>
    );
};
