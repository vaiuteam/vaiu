"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Subscription, UserUsage, PLAN_LIMITS, SubscriptionPlan } from "../types";

const formatLimit = (value: number) => (value === -1 ? "∞" : value.toString());

const sumPerWorkspaceCredits = (
    raw: UserUsage["aiCreditsPerWorkspace"] | string | undefined,
): number => {
    if (!raw) return 0;
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Object.values(parsed as Record<string, number>).reduce(
        (a, b) => a + Number(b || 0),
        0,
    );
};

interface UsageStatsProps {
    subscription: Subscription;
    usage: UserUsage;
}

export const UsageStats = ({ subscription, usage }: UsageStatsProps) => {
    const planDefaults = PLAN_LIMITS[subscription.plan];
    // Prefer limits stored on the subscription doc (so grandfathered plans
    // render their actual numbers), falling back to the plan defaults.
    const limits = {
        workspaces: subscription.workspaces ?? planDefaults.workspaces,
        projectsPerWorkspace: subscription.projectsPerWorkspace ?? planDefaults.projectsPerWorkspace,
        membersPerWorkspace: subscription.membersPerWorkspace ?? planDefaults.membersPerWorkspace,
        roomsPerWorkspace: subscription.roomsPerWorkspace ?? planDefaults.roomsPerWorkspace,
        aiCredits: subscription.aiCredits ?? planDefaults.aiCredits,
        aiCreditsPerUser: subscription.aiCreditsPerUser ?? planDefaults.aiCreditsPerUser,
        durationDays: subscription.durationDays ?? planDefaults.durationDays,
    };

    const getUsagePercentage = (current: number, limit: number) => {
        if (limit === -1) return 0;
        return Math.min((current / limit) * 100, 100);
    };

    const getUsageColor = (percentage: number) => {
        if (percentage >= 90) return "bg-red-500";
        if (percentage >= 70) return "bg-yellow-500";
        return "bg-primary";
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Usage Statistics</CardTitle>
                    <Badge variant="outline">{subscription.plan}</Badge>
                </div>
                <CardDescription>
                    Current usage for your {subscription.plan.toLowerCase()} plan
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Workspaces</span>
                        <span className="text-muted-foreground">
                            {usage.workspacesCount} / {limits.workspaces === -1 ? "∞" : limits.workspaces}
                        </span>
                    </div>
                    {limits.workspaces !== -1 && (
                        <Progress
                            value={getUsagePercentage(usage.workspacesCount, limits.workspaces)}
                            className={getUsageColor(getUsagePercentage(usage.workspacesCount, limits.workspaces))}
                        />
                    )}
                </div>

                {/* Projects — limit is per workspace, not a global total */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Projects</span>
                        <span className="text-muted-foreground">
                            {Object.values(usage.projectsCount).reduce((a, b) => a + b, 0)} total · limit {formatLimit(limits.projectsPerWorkspace)} per workspace
                        </span>
                    </div>
                </div>

                {/* Rooms — same per-workspace limit shape */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Rooms</span>
                        <span className="text-muted-foreground">
                            {usage.roomsCount ? Object.values(usage.roomsCount).reduce((a, b) => a + b, 0) : 0} total · limit {formatLimit(limits.roomsPerWorkspace)} per workspace
                        </span>
                    </div>
                </div>

                {/* AI Credits — show this period's per-user usage against the per-user quota */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">AI Credits This Period</span>
                        <span className="text-muted-foreground">
                            {sumPerWorkspaceCredits(usage.aiCreditsPerWorkspace)} / {formatLimit(limits.aiCreditsPerUser)} per user
                        </span>
                    </div>
                    {limits.aiCreditsPerUser !== -1 && (
                        <Progress
                            value={getUsagePercentage(sumPerWorkspaceCredits(usage.aiCreditsPerWorkspace), limits.aiCreditsPerUser)}
                            className={getUsageColor(getUsagePercentage(sumPerWorkspaceCredits(usage.aiCreditsPerWorkspace), limits.aiCreditsPerUser))}
                        />
                    )}
                    <p className="text-xs text-muted-foreground">
                        Workspace pool: {formatLimit(limits.aiCredits)} credits / month
                    </p>
                </div>

                {/* Subscription Period */}
                {subscription.plan !== SubscriptionPlan.FREE && (
                    <div className="pt-4 border-t">
                        <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Billing Cycle</span>
                                <span className="font-medium capitalize">{subscription.billingCycle.toLowerCase()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Current Period Ends</span>
                                <span className="font-medium">
                                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {subscription.plan === SubscriptionPlan.FREE && (
                    <div className="pt-4 border-t">
                        <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Free Trial Expires</span>
                                <span className="font-medium">
                                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
