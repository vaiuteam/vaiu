"use client";

import { PropsWithChildren } from "react";
import { Navbar } from "@/components/mainNavbar";
import Footer from "@/components/Footer";

export function MarketingPageLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <div className="container mx-auto px-4 pt-4 md:px-6">
                <Navbar />
            </div>
            <div className="container mx-auto flex-1 px-4 py-8 md:px-6">{children}</div>
            <Footer />
        </div>
    );
}
