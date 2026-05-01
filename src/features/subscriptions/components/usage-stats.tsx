"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Subscription, UserUsage, PLAN_LIMITS, SubscriptionPlan } from "../types";

interface UsageStatsProps {
    subscription: Subscription;
    usage: UserUsage;
}

export const UsageStats = ({ subscription, usage }: UsageStatsProps) => {
    const limits = PLAN_LIMITS[subscription.plan];

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

                {/* Projects */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Projects (Total)</span>
                        <span className="text-muted-foreground">
                            {Object.values(usage.projectsCount).reduce((a, b) => a + b, 0)} across workspaces
                        </span>
                    </div>
                </div>

                {/* Rooms */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Rooms (Total)</span>
                        <span className="text-muted-foreground">
                            {usage.roomsCount ? Object.values(usage.roomsCount).reduce((a, b) => a + b, 0) : 0} across workspaces
                        </span>
                    </div>
                </div>

                {/* AI Credits */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">AI Credits Used</span>
                        <span className="text-muted-foreground">
                            {usage.aiCreditsUsed} / {limits.aiCredits}
                        </span>
                    </div>
                    <Progress
                        value={getUsagePercentage(usage.aiCreditsUsed, limits.aiCredits)}
                        className={getUsageColor(getUsagePercentage(usage.aiCreditsUsed, limits.aiCredits))}
                    />
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
