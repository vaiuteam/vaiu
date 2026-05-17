"use client";

import { ArrowLeft } from "lucide-react";
import { SubscriptionManagement } from "@/features/subscriptions/components/subscription-management";
import { UsageStats } from "@/features/subscriptions/components/usage-stats";
import { useGetCurrentSubscription } from "@/features/subscriptions/api/use-get-current-subscription";
import { useGetUsage } from "@/features/subscriptions/api/use-get-usage";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Subscription, UserUsage } from "@/features/subscriptions/types";
import { BillingPageSkeleton } from "@/components/loading-skeletons";

export default function BillingPage() {
    const router = useRouter();
    const { data: subscription, isLoading: loadingSubscription } = useGetCurrentSubscription();
    const { data: usage, isLoading: loadingUsage } = useGetUsage();

    if (loadingSubscription || loadingUsage) {
        return <BillingPageSkeleton />;
    }

    if (!subscription || !usage) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Failed to load subscription data</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/")}
                    className="mb-8"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go to Home
                </Button>

                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your subscription and view usage statistics
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SubscriptionManagement subscription={subscription as Subscription} />
                        <UsageStats subscription={subscription as Subscription} usage={usage as UserUsage} />
                    </div>

                    {/* <div className="flex justify-center">
                        <Button onClick={() => router.push("/pricing")} size="lg">
                            Upgrade Plan
                        </Button>
                    </div> */}
                </div>
            </div>
        </div>
    );
}
