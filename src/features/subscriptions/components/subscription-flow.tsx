"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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

declare global {
    interface Window {
        Razorpay: new (options: unknown) => { open: () => void };
    }
}

export const SubscriptionFlow = () => {
    const router = useRouter();
    const { data: subscription, isLoading } = useGetCurrentSubscription();
    const { mutate: createSubscription, isPending: isCreating } = useCreateSubscription();
    const { mutate: verifyPayment } = useVerifyPayment();

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleSelectPlan = async (plan: SubscriptionPlan, billingCycle: "MONTHLY" | "YEARLY") => {
        createSubscription(
            { plan, billingCycle },
            {
                onSuccess: (response) => {
                    if ("data" in response) {
                        const { razorpaySubscriptionId, razorpayKey } = response.data;

                        const options = {
                            key: razorpayKey,
                            subscription_id: razorpaySubscriptionId,
                            name: "Vaiu",
                            description: `${plan} ${billingCycle} Subscription`,
                            handler: function (response: RazorpayResponse) {
                                verifyPayment(
                                    {
                                        razorpayPaymentId: response.razorpay_payment_id,
                                        razorpaySubscriptionId: response.razorpay_subscription_id,
                                        razorpaySignature: response.razorpay_signature,
                                    },
                                    {
                                        onSuccess: () => {
                                            toast.success("Subscription activated successfully!");
                                            router.push("/billing");
                                        },
                                    }
                                );
                            },
                            prefill: {
                                name: "",
                                email: "",
                            },
                            theme: {
                                color: "#3399cc",
                            },
                        };

                        const razorpay = new window.Razorpay(options);
                        razorpay.open();
                    }
                },
            }
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="container py-8">
            <PricingCards
                currentPlan={subscription?.plan}
                onSelectPlan={handleSelectPlan}
            />
            {isCreating && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="text-sm text-muted-foreground">Processing your subscription...</p>
                    </div>
                </div>
            )}
        </div>
    );
};
