"use client";

import { useState, useEffect, useMemo } from "react";
import { SubscriptionManagement } from "@/features/subscriptions/components/subscription-management";
import { UsageStats } from "@/features/subscriptions/components/usage-stats";
import { useGetWorkspaceSubscription } from "@/features/subscriptions/api/use-get-workspace-subscription";
import { useGetUsage } from "@/features/subscriptions/api/use-get-usage";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Subscription, SubscriptionPlan, UserUsage } from "@/features/subscriptions/types";
import { BillingPageSkeleton } from "@/components/loading-skeletons";
import { MarketingPageLayout } from "@/components/marketing-page-layout";

export default function BillingPage() {
    const router = useRouter();
    const { data: workspacesData, isLoading: loadingWorkspaces } = useGetWorkspaces();
    const workspaces = useMemo(
        () => workspacesData?.documents ?? [],
        [workspacesData?.documents],
    );

    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!selectedWorkspaceId && workspaces.length > 0) {
            setSelectedWorkspaceId(workspaces[0].$id);
        }
    }, [workspaces, selectedWorkspaceId]);

    const { data: subscription, isLoading: loadingSubscription } =
        useGetWorkspaceSubscription(selectedWorkspaceId);
    const { data: usage, isLoading: loadingUsage } = useGetUsage();

    if (loadingWorkspaces || loadingSubscription || loadingUsage) {
        return (
            <MarketingPageLayout>
                <BillingPageSkeleton />
            </MarketingPageLayout>
        );
    }

    return (
        <MarketingPageLayout>
            <div className="mx-auto max-w-7xl space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
                        <p className="text-muted-foreground">
                            Manage your workspace subscription and view usage statistics
                        </p>
                    </div>
                    <Button
                        onClick={() =>
                            router.push(
                                selectedWorkspaceId
                                    ? `/pricing?workspaceId=${selectedWorkspaceId}`
                                    : "/pricing"
                            )
                        }
                        className="bg-blue-600 font-semibold hover:bg-blue-700"
                    >
                        {subscription && subscription.plan !== SubscriptionPlan.FREE ? "Change Plan" : "Upgrade Plan"}
                    </Button>
                </div>

                <div className="max-w-xs space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Workspace</p>
                    <Select
                        value={selectedWorkspaceId ?? ""}
                        onValueChange={setSelectedWorkspaceId}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a workspace" />
                        </SelectTrigger>
                        <SelectContent>
                            {workspaces.map((ws: { $id: string; name: string }) => (
                                <SelectItem key={ws.$id} value={ws.$id}>
                                    {ws.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {!selectedWorkspaceId ? (
                    <p className="text-muted-foreground">Select a workspace to view its subscription.</p>
                ) : !subscription || !usage ? (
                    <p className="text-muted-foreground">
                        No active subscription for this workspace.{" "}
                        <button
                            className="text-blue-600 underline"
                            onClick={() => router.push(`/pricing?workspaceId=${selectedWorkspaceId}`)}
                        >
                            Upgrade now
                        </button>
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <SubscriptionManagement
                            subscription={subscription as Subscription}
                            workspaceId={selectedWorkspaceId}
                        />
                        <UsageStats
                            subscription={subscription as Subscription}
                            usage={usage as UserUsage}
                        />
                    </div>
                )}
            </div>
        </MarketingPageLayout>
    );
}
