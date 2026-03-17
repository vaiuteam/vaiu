import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocsShell } from "@/components/docs/docs-shell";
import { getAllDocs, getDocBySlug } from "@/lib/docs";

type DocsSlugPageProps = {
    params: {
        slug: string;
    };
};

export async function generateStaticParams() {
    const docs = await getAllDocs();

    return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
    params,
}: DocsSlugPageProps): Promise<Metadata> {
    const doc = await getDocBySlug(params.slug);

    if (!doc) {
        return {
            title: "Docs | Vaiu",
        };
    }

    return {
        title: `${doc.title} | Vaiu Docs`,
    };
}

export default async function DocsSlugPage({ params }: DocsSlugPageProps) {
    const [docs, doc] = await Promise.all([
        getAllDocs(),
        getDocBySlug(params.slug),
    ]);

    if (!doc || docs.length === 0) {
        notFound();
    }

    return <DocsShell docs={docs} activeSlug={doc.slug} doc={doc} />;
}
