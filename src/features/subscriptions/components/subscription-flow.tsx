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
import { useGetCurrentSubscription } from "../api/use-get-current-subscription";

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
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

export const SubscriptionFlow = () => {
    const router = useRouter();
    const { data: subscription, isLoading } = useGetCurrentSubscription();
    const { mutate: createSubscription, isPending: isCreating } = useCreateSubscription();
    const { mutate: verifyPayment, isPending: isVerifying } = useVerifyPayment();
    const [razorpayReady, setRazorpayReady] = useState(false);

    useEffect(() => {
        loadRazorpayScript()
            .then(() => setRazorpayReady(true))
            .catch(() => toast.error("Failed to load payment gateway. Please refresh and try again."));
    }, []);

    const openRazorpayCheckout = useCallback(
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
                handler: (response: RazorpayResponse) => {
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
                prefill: {
                    name: prefill?.name ?? "",
                    email: prefill?.email ?? "",
                },
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

    const handleSelectPlan = (plan: SubscriptionPlan, billingCycle: "MONTHLY" | "YEARLY") => {
        if (!razorpayReady) {
            toast.error("Payment gateway is still loading. Please wait a moment.");
            return;
        }

        createSubscription(
            { plan, billingCycle },
            {
                onSuccess: (response) => {
                    if (!("data" in response)) {
                        toast.error("Invalid checkout response. Please contact support.");
                        return;
                    }

                    const { razorpaySubscriptionId, razorpayKey, prefill } = response.data;

                    if (!razorpayKey || !razorpaySubscriptionId) {
                        toast.error(
                            "Payment is not configured. Check Razorpay keys and plan IDs in your environment.",
                        );
                        return;
                    }

                    openRazorpayCheckout(
                        plan,
                        billingCycle,
                        razorpayKey,
                        razorpaySubscriptionId,
                        prefill,
                    );
                },
            },
        );
    };

    if (isLoading) return <PricingFlowSkeleton />;

    const isProcessing = isCreating || isVerifying;

    return (
        <>
            <PricingCards currentPlan={subscription?.plan} onSelectPlan={handleSelectPlan} />

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
        </>
    );
};
