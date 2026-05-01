"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { SubscriptionPlan, PLAN_LIMITS } from "../types";

interface UpgradeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    currentPlan: SubscriptionPlan;
    feature: string;
}

export const UpgradeDialog = ({
    open,
    onOpenChange,
    title = "Upgrade to Continue",
    description,
    currentPlan,
    feature,
}: UpgradeDialogProps) => {
    const router = useRouter();

    const handleUpgrade = () => {
        onOpenChange(false);
        router.push("/pricing");
    };

    const limits = PLAN_LIMITS[currentPlan];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center">{title}</DialogTitle>
                    <DialogDescription className="text-center">
                        {description ||
                            `You've reached the limit for ${feature} on your ${currentPlan} plan. Upgrade to access more features and increase your limits.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="rounded-lg border p-4 space-y-2">
                        <h4 className="font-medium">Current Plan: {currentPlan}</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• {limits.workspaces === -1 ? "Unlimited" : limits.workspaces} workspace(s)</li>
                            <li>
                                • {limits.projectsPerWorkspace === -1 ? "Unlimited" : limits.projectsPerWorkspace}{" "}
                                project(s) per workspace
                            </li>
                            <li>• {limits.aiCredits} AI credits/month</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                        Maybe Later
                    </Button>
                    <Button onClick={handleUpgrade} className="w-full sm:w-auto">
                        <Sparkles className="mr-2 h-4 w-4" />
                        View Plans
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
