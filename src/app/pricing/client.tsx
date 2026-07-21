"use client";

import { SubscriptionFlow } from "@/features/subscriptions/components/subscription-flow";
import { MarketingPageLayout } from "@/components/marketing-page-layout";

interface PricingClientProps {
    workspaceId?: string;
}

export const PricingClient = ({ workspaceId }: PricingClientProps) => {
    return (
        <MarketingPageLayout>
            <div className="mx-auto w-full max-w-7xl space-y-10">
                <section className="text-center">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
                        Pricing
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                        Choose the plan that fits your team
                    </h1>
                    <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                        Start free, then upgrade when you need more workspaces, members, and AI
                        credits. Cancel anytime at the end of your billing period.
                    </p>
                </section>

                <SubscriptionFlow workspaceId={workspaceId} />
            </div>
        </MarketingPageLayout>
    );
};
