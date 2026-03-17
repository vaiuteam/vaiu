import { notFound } from "next/navigation";

import { DocsShell } from "@/components/docs/docs-shell";
import { getAllDocs, getDocBySlug } from "@/lib/docs";

export default async function DocsPage() {
    const docs = await getAllDocs();

    if (docs.length === 0) {
        notFound();
    }

    const defaultSlug =
        docs.find((doc) => doc.slug === "introduction")?.slug ?? docs[0].slug;
    const doc = await getDocBySlug(defaultSlug);

    if (!doc) {
        notFound();
    }

    return <DocsShell docs={docs} activeSlug={doc.slug} doc={doc} />;
}
