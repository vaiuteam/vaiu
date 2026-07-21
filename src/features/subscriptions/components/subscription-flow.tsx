"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PricingFlowSkeleton } from "@/components/loading-skeletons";
import { toast } from "sonner";
import { PricingCards } from "./pricing-cards";
import { SubscriptionPlan } from "../types";
import { useCreateSubscription } from "../api/use-create-subscription";
import { useVerifyPayment } from "../api/use-verify-payment";
import { useGetWorkspaceSubscription } from "../api/use-get-workspace-subscription";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface RazorpaySubscriptionResponse {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
}

interface RazorpayOrderResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface RazorpayInstance {
    open: () => void;
    on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
}

declare global {
    interface Window {
        Razorpay: new (options: unknown) => RazorpayInstance;
    }
}

function loadRazorpayScript(): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();
    if (window.Razorpay) return Promise.resolve();

    return new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
        );

        if (existing) {
            existing.addEventListener("load", () => resolve());
            existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay")));
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Razorpay"));
        document.body.appendChild(script);
    });
}

interface SubscriptionFlowProps {
    workspaceId?: string;
}

export const SubscriptionFlow = ({ workspaceId: initialWorkspaceId }: SubscriptionFlowProps) => {
    const router = useRouter();
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | undefined>(initialWorkspaceId);

    const { data: workspacesData, isLoading: loadingWorkspaces } = useGetWorkspaces();
    const { data: subscription, isLoading: loadingSubscription } = useGetWorkspaceSubscription(selectedWorkspaceId);
    const { mutate: createSubscription, isPending: isCreating } = useCreateSubscription();
    const { mutate: verifyPayment, isPending: isVerifying } = useVerifyPayment();
    const [razorpayReady, setRazorpayReady] = useState(false);

    useEffect(() => {
        loadRazorpayScript()
            .then(() => setRazorpayReady(true))
            .catch(() => toast.error("Failed to load payment gateway. Please refresh and try again."));
    }, []);

    const openSubscriptionCheckout = useCallback(
        (
            plan: SubscriptionPlan,
            billingCycle: "MONTHLY" | "YEARLY",
            razorpayKey: string,
            razorpaySubscriptionId: string,
            prefill?: { name?: string; email?: string },
        ) => {
            if (!window.Razorpay) {
                toast.error("Payment gateway is not ready yet. Please try again.");
                return;
            }

            const options = {
                key: razorpayKey,
                subscription_id: razorpaySubscriptionId,
                name: "Vaiu",
                description: `${plan} ${billingCycle.toLowerCase()} subscription`,
                handler: (response: RazorpaySubscriptionResponse) => {
                    verifyPayment(
                        {
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySubscriptionId: response.razorpay_subscription_id,
                            razorpaySignature: response.razorpay_signature,
                        },
                        {
                            onSuccess: () => {
                                toast.success("Payment successful — your plan is now active!");
                                router.push("/billing");
                            },
                        },
                    );
                },
                prefill: { name: prefill?.name ?? "", email: prefill?.email ?? "" },
                theme: { color: "#2563eb" },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on("payment.failed", (response) => {
                toast.error(response.error?.description ?? "Payment failed. Please try again.");
            });
            razorpay.open();
        },
        [router, verifyPayment],
    );

    const openOrderCheckout = useCallback(
        (
            razorpayKey: string,
            razorpayOrderId: string,
            amount: number,
            currency: string,
            prefill?: { name?: string; email?: string },
        ) => {
            if (!window.Razorpay) {
                toast.error("Payment gateway is not ready yet. Please try again.");
                return;
            }

            const options = {
                key: razorpayKey,
                order_id: razorpayOrderId,
                amount,
                currency,
                name: "Vaiu",
                description: "Vaiu Event Plan",
                handler: (response: RazorpayOrderResponse) => {
                    verifyPayment(
                        {
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature,
                        },
                        {
                            onSuccess: () => {
                                toast.success("Payment successful — Event plan is now active!");
                                router.push("/billing");
                            },
                        },
                    );
                },
                prefill: { name: prefill?.name ?? "", email: prefill?.email ?? "" },
                theme: { color: "#2563eb" },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on("payment.failed", (response) => {
                toast.error(response.error?.description ?? "Payment failed. Please try again.");
            });
            razorpay.open();
        },
        [router, verifyPayment],
    );

    const handleSelectPlan = (
        plan: SubscriptionPlan,
        billingCycle: "MONTHLY" | "YEARLY" | "ONE_TIME",
    ) => {
        if (!razorpayReady) {
            toast.error("Payment gateway is still loading. Please wait a moment.");
            return;
        }

        createSubscription(
            { plan, billingCycle, workspaceId: selectedWorkspaceId },
            {
                onSuccess: (response) => {
                    if (!("data" in response)) {
                        toast.error("Invalid checkout response. Please contact support.");
                        return;
                    }

                    const { razorpayKey, prefill } = response.data;

                    if (!razorpayKey) {
                        toast.error("Payment is not configured. Check Razorpay keys in your environment.");
                        return;
                    }

                    if ("razorpayOrderId" in response.data && response.data.razorpayOrderId) {
                        openOrderCheckout(
                            razorpayKey,
                            response.data.razorpayOrderId,
                            response.data.amount,
                            response.data.currency,
                            prefill,
                        );
                        return;
                    }

                    if ("razorpaySubscriptionId" in response.data && response.data.razorpaySubscriptionId) {
                        openSubscriptionCheckout(
                            plan,
                            billingCycle as "MONTHLY" | "YEARLY",
                            razorpayKey,
                            response.data.razorpaySubscriptionId,
                            prefill,
                        );
                        return;
                    }

                    toast.error("Missing payment details. Please contact support.");
                },
            },
        );
    };

    const workspaces = workspacesData?.documents ?? [];
    const isLoading = loadingWorkspaces || (!!selectedWorkspaceId && loadingSubscription);

    if (isLoading) return <PricingFlowSkeleton />;

    const isProcessing = isCreating || isVerifying;

    return (
        <div className="space-y-8">
            <div className="mx-auto max-w-xs space-y-2">
                <p className="text-center text-sm font-medium text-muted-foreground">
                    Subscribing for workspace
                </p>
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

            <PricingCards
                currentPlan={subscription?.plan}
                onSelectPlan={handleSelectPlan}
            />

            {isProcessing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-8 py-6 shadow-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-sm font-medium">
                            {isCreating ? "Opening secure checkout…" : "Confirming your payment…"}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
