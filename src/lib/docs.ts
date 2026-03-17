import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

export type DocSummary = {
    slug: string;
    title: string;
};

export type Doc = DocSummary & {
    content: string;
};

const DOCS_DIRECTORY = path.join(process.cwd(), "docs");
const MARKDOWN_EXTENSION = ".md";
const INTRODUCTION_SLUG = "introduction";

const isMarkdownFile = (fileName: string) =>
    fileName.toLowerCase().endsWith(MARKDOWN_EXTENSION);

const fileNameToSlug = (fileName: string) =>
    fileName.slice(0, -MARKDOWN_EXTENSION.length).toLowerCase();

const slugToFileName = (slug: string) => `${slug}${MARKDOWN_EXTENSION}`;

const slugToTitle = (slug: string) =>
    slug
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

const extractTitle = (content: string, fallbackTitle: string) => {
    const firstHeading = content
        .split(/\r?\n/)
        .find((line) => line.trim().startsWith("# "));

    if (!firstHeading) {
        return fallbackTitle;
    }

    return firstHeading.replace(/^#\s+/, "").trim() || fallbackTitle;
};

const isMissingFileError = (error: unknown) => {
    return (
        error instanceof Error &&
        "code" in error &&
        (error as NodeJS.ErrnoException).code === "ENOENT"
    );
};

const byPreferredOrder = (a: DocSummary, b: DocSummary) => {
    if (a.slug === INTRODUCTION_SLUG && b.slug !== INTRODUCTION_SLUG) {
        return -1;
    }

    if (b.slug === INTRODUCTION_SLUG && a.slug !== INTRODUCTION_SLUG) {
        return 1;
    }

    return a.title.localeCompare(b.title);
};

const readDocsDirectory = async () => {
    try {
        return await fs.readdir(DOCS_DIRECTORY);
    } catch (error) {
        if (isMissingFileError(error)) {
            return [];
        }

        throw error;
    }
};

export const getAllDocs = async (): Promise<DocSummary[]> => {
    const fileNames = await readDocsDirectory();
    const markdownFiles = fileNames.filter(isMarkdownFile);

    const docs = await Promise.all(
        markdownFiles.map(async (fileName) => {
            const slug = fileNameToSlug(fileName);
            const content = await fs.readFile(
                path.join(DOCS_DIRECTORY, fileName),
                "utf8",
            );

            return {
                slug,
                title: extractTitle(content, slugToTitle(slug)),
            };
        }),
    );

    return docs.sort(byPreferredOrder);
};

export const getDocBySlug = async (slug: string): Promise<Doc | null> => {
    const normalizedSlug = slug.trim().toLowerCase();

    // Restrict slugs to file-name safe characters.
    if (!/^[a-z0-9-_]+$/.test(normalizedSlug)) {
        return null;
    }

    const filePath = path.join(DOCS_DIRECTORY, slugToFileName(normalizedSlug));

    try {
        const content = await fs.readFile(filePath, "utf8");

        return {
            slug: normalizedSlug,
            title: extractTitle(content, slugToTitle(normalizedSlug)),
            content,
        };
    } catch (error) {
        if (isMissingFileError(error)) {
            return null;
        }

        throw error;
    }
};

export const getDefaultDocSlug = async (): Promise<string | null> => {
    const docs = await getAllDocs();

    if (docs.length === 0) {
        return null;
    }

    return (
        docs.find((doc) => doc.slug === INTRODUCTION_SLUG)?.slug ?? docs[0].slug
    );
};
