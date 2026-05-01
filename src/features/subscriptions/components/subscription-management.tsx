"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { Subscription, SubscriptionPlan, SubscriptionStatus } from "../types";
import { useCancelSubscription } from "../api/use-cancel-subscription";

interface SubscriptionManagementProps {
    subscription: Subscription;
}

export const SubscriptionManagement = ({ subscription }: SubscriptionManagementProps) => {
    const [ConfirmDialog, confirm] = useConfirm(
        "Cancel Subscription",
        "Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.",
        "destructive"
    );

    const { mutate: cancelSubscription, isPending } = useCancelSubscription();

    const handleCancel = async () => {
        const ok = await confirm();
        if (!ok) return;

        cancelSubscription({ cancelAtPeriodEnd: true });
    };

    const isActive = subscription.status === SubscriptionStatus.ACTIVE;
    const isFree = subscription.plan === SubscriptionPlan.FREE;
    const willCancel = subscription.cancelAtPeriodEnd;

    return (
        <>
            <ConfirmDialog />
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Current Subscription</CardTitle>
                        <Badge variant={isActive ? "default" : "secondary"}>
                            {subscription.status}
                        </Badge>
                    </div>
                    <CardDescription>
                        Manage your subscription and billing
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Plan</span>
                            <span className="text-sm">{subscription.plan}</span>
                        </div>
                        {!isFree && (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Billing Cycle</span>
                                    <span className="text-sm capitalize">
                                        {subscription.billingCycle.toLowerCase()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Current Period Ends</span>
                                    <span className="text-sm">
                                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                                    </span>
                                </div>
                            </>
                        )}
                        {isFree && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Trial Expires</span>
                                <span className="text-sm">
                                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>

                    {willCancel && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Your subscription will be cancelled at the end of the current billing period.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                {!isFree && (
                    <CardFooter>
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={isPending || willCancel}
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {willCancel ? "Cancellation Scheduled" : "Cancel Subscription"}
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </>
    );
};
