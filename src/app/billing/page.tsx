"use client";

import { SubscriptionManagement } from "@/features/subscriptions/components/subscription-management";
import { UsageStats } from "@/features/subscriptions/components/usage-stats";
import { useGetCurrentSubscription } from "@/features/subscriptions/api/use-get-current-subscription";
import { useGetUsage } from "@/features/subscriptions/api/use-get-usage";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Subscription, UserUsage } from "@/features/subscriptions/types";
import { BillingPageSkeleton } from "@/components/loading-skeletons";
import { MarketingPageLayout } from "@/components/marketing-page-layout";

export default function BillingPage() {
    const router = useRouter();
    const { data: subscription, isLoading: loadingSubscription } = useGetCurrentSubscription();
    const { data: usage, isLoading: loadingUsage } = useGetUsage();

    if (loadingSubscription || loadingUsage) {
        return (
            <MarketingPageLayout>
                <BillingPageSkeleton />
            </MarketingPageLayout>
        );
    }

    if (!subscription || !usage) {
        return (
            <MarketingPageLayout>
                <div className="flex min-h-[50vh] items-center justify-center">
                    <p className="text-muted-foreground">Failed to load subscription data</p>
                </div>
            </MarketingPageLayout>
        );
    }

    return (
        <MarketingPageLayout>
            <div className="mx-auto max-w-7xl space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
                        <p className="mt-2 text-muted-foreground">
                            Manage your subscription and view usage statistics
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push("/pricing")}
                        className="bg-blue-600 font-semibold hover:bg-blue-700"
                    >
                        Upgrade Plan
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <SubscriptionManagement subscription={subscription as Subscription} />
                    <UsageStats subscription={subscription as Subscription} usage={usage as UserUsage} />
                </div>
            </div>
        </MarketingPageLayout>
    );
}
