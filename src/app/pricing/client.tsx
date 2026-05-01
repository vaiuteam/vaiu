"use client";

import { SubscriptionFlow } from "@/features/subscriptions/components/subscription-flow";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export const PricingClient = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/")}
                    className="mb-8"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go to Home
                </Button>
                <div className="flex justify-center">
                    <div className="w-full max-w-7xl">
                        <SubscriptionFlow />
                    </div>
                </div>
            </div>
        </div>
    );
};
