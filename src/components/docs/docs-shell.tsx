"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, BookOpenText, Clock3, Hash } from "lucide-react";
import remarkGfm from 'remark-gfm';

import { Button } from "@/components/ui/button";
import type { Doc, DocSummary } from "@/lib/docs";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
    h2: ({ children }) => {
        const text = getTextFromChildren(children);
        return (
            <h2 id={slugify(text)} className="mt-12 scroll-mt-28 border-t border-border/50 pt-8 text-2xl font-semibold tracking-tight">
                {children}
            </h2>
        );
    },
    h3: ({ children }) => {
        const text = getTextFromChildren(children);
        return (
            <h3 id={slugify(text)} className="mt-8 scroll-mt-28 text-xl font-semibold tracking-tight">
                {children}
            </h3>
        );
    },
    h4: ({ children }) => {
        const text = getTextFromChildren(children);
        return (
            <h4 id={slugify(text)} className="mt-6 scroll-mt-28 text-lg font-semibold tracking-tight">
                {children}
            </h4>
        );
    },
    h5: ({ children }) => {
        const text = getTextFromChildren(children);
        return (
            <h5 id={slugify(text)} className="mt-6 scroll-mt-28 text-base font-semibold tracking-tight">
                {children}
            </h5>
        );
    },
    h6: ({ children }) => {
        const text = getTextFromChildren(children);
        return (
            <h6 id={slugify(text)} className="mt-6 scroll-mt-28 text-sm font-semibold tracking-tight">
                {children}
            </h6>
        );
    },
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
    code: ({ node, children, ...props }) => {
        const isInline = node?.position?.start.line === node?.position?.end.line;
        return isInline ? (
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em]" {...props}>
                {children}
            </code>
        ) : (
            <code className="font-mono text-sm leading-6" {...props}>{children}</code>
        );
    },
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
    table: ({ children }) => (
    <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
            {children}
        </table>
    </div>
),
    thead: ({ children }) => (
        <thead className="bg-muted/80">
            {children}
        </thead>
    ),
    tbody: ({ children }) => (
        <tbody className="divide-y divide-border">
            {children}
        </tbody>
),
    tr: ({ children }) => (
        <tr className="hover:bg-muted/30">
            {children}
        </tr>
    ),
    th: ({ children }) => (
        <th className="px-4 py-3 text-left font-semibold text-foreground">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="px-4 py-3 text-foreground/90">
            {children}
        </td>
    ),
    img: ({ src, alt }) => (
    <Image
        src={src ?? ""}
        alt={alt ?? ""}
        width={800}
        height={450}
        className="mt-6 max-w-full rounded-lg border border-border/50"
    />
),
    del: ({ children }) => (
        <del className="line-through text-foreground/60">
            {children}
        </del>
    ),
    strong: ({ children }) => (
        <strong className="font-semibold">
            {children}
        </strong>
    ),
    em: ({ children }) => (
        <em className="italic">
            {children}
        </em>
    ),
    br: () => <br />,
};

const getDocHref = (slug: string) => {
    if (slug === "introduction") {
        return "/docs";
    }

    return `/docs/${slug}`;
};

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

const getTextFromChildren = (children: React.ReactNode): string =>
    Array.isArray(children)
        ? children.map(getTextFromChildren).join("")
        : typeof children === "string"
        ? children
        : children && typeof children === "object"
        ? getTextFromChildren((children as { props?: { children?: React.ReactNode } }).props?.children)
        : "";

export const DocsShell = ({ docs, activeSlug, doc }: DocsShellProps) => {
    const readingTime = Math.max(1, Math.ceil(doc.content.split(/\s+/).length / 220));
    const headings = useMemo(() => {
        const headingIds = new Map<string, number>();

        return doc.content
            .split(/\r?\n/)
            .map((line) => {
                const match = line.match(/^(##|###)\s+(.*)$/);
                if (!match) {
                    return null;
                }

                const [, levelToken, rawText] = match;
                const level = levelToken === "###" ? 3 : 2;
                const baseId = slugify(rawText);
                const count = headingIds.get(baseId) ?? 0;
                headingIds.set(baseId, count + 1);
                const id = count === 0 ? baseId : `${baseId}-${count}`;

                return {
                    id,
                    title: rawText.trim(),
                    level,
                };
            })
            .filter((heading): heading is { id: string; title: string; level: number } => Boolean(heading));
    }, [doc.content]);
    const [activeHeading, setActiveHeading] = useState<string | null>(headings[0]?.id ?? null);

    useEffect(() => {
        if (headings.length === 0) {
            setActiveHeading(null);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => Number(a.target.getAttribute("data-order")) - Number(b.target.getAttribute("data-order")));

                if (visibleEntries.length > 0) {
                    setActiveHeading(visibleEntries[0].target.id);
                }
            },
            {
                rootMargin: "-25% 0% -65% 0%",
                threshold: 0.1,
            },
        );

        headings.forEach((heading, index) => {
            const element = document.getElementById(heading.id);
            if (element) {
                element.setAttribute("data-order", String(index));
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [headings]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
            <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
                <div className="mb-4 pt-6">
                   <Button asChild variant="secondary" size="sm">
                        <Link href={`/`}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back
                        </Link>
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
                        <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
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
                                        <a
                                            key={heading.id}
                                            href={`#${heading.id}`}
                                            onClick={() => setActiveHeading(heading.id)}
                                            className={cn(
                                                "block whitespace-nowrap rounded-2xl px-3 py-2 text-sm leading-6 transition",
                                                heading.id === activeHeading
                                                    ? "text-slate-950 dark:text-slate-200 font-bold"
                                                    : "text-slate-400 hover:text-foreground",
                                            )}
                                        >
                                            {heading.title}
                                        </a>
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