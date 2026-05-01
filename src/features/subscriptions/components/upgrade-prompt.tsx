"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface UpgradePromptProps {
    title?: string;
    message: string;
    limit?: number;
    current?: number;
}

export const UpgradePrompt = ({
    title = "Upgrade Required",
    message,
    limit,
    current,
}: UpgradePromptProps) => {
    const router = useRouter();

    return (
        <Alert className="border-primary/50 bg-primary/5">
            <Sparkles className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">{title}</AlertTitle>
            <AlertDescription className="space-y-3">
                <div className="text-sm">
                    <p>{message}</p>
                    {limit !== undefined && current !== undefined && (
                        <p className="mt-2 text-muted-foreground">
                            You&apos;re using {current} of {limit === -1 ? "unlimited" : limit} available.
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => router.push("/pricing")}>
                        View Plans
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => router.push("/settings/billing")}>
                        Manage Subscription
                    </Button>
                </div>
            </AlertDescription>
        </Alert>
    );
};
