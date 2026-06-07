"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SubscriptionPlan, PLAN_PRICING } from "../types";
import { getPlanFeatures } from "../utils";

const PLAN_RANK: Record<SubscriptionPlan, number> = {
    [SubscriptionPlan.FREE]: 0,
    [SubscriptionPlan.EVENT]: 1,
    [SubscriptionPlan.PRO]: 2,
    [SubscriptionPlan.STANDARD]: 3,
    [SubscriptionPlan.ENTERPRISE]: 4,
};

interface PricingCardsProps {
    currentPlan?: SubscriptionPlan;
    onSelectPlan: (plan: SubscriptionPlan, billingCycle: "MONTHLY" | "YEARLY" | "ONE_TIME") => void;
}

export const PricingCards = ({ currentPlan, onSelectPlan }: PricingCardsProps) => {
    const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

    const plans = [
        {
            name: SubscriptionPlan.FREE,
            title: "Free",
            description: "Try Vaiu for 30 days — no card required.",
            popular: false,
        },
        {
            name: SubscriptionPlan.PRO,
            title: "Pro",
            description: "For teams. Scales with your headcount.",
            popular: true,
        },
        {
            name: SubscriptionPlan.STANDARD,
            title: "Standard",
            description: "More projects, rooms, and AI credits per seat.",
            popular: false,
        },
        {
            name: SubscriptionPlan.EVENT,
            title: "Event",
            description: "Flat fee for hackathons & sprints. Up to 150 members, 14 days.",
            popular: false,
        },
        {
            name: SubscriptionPlan.ENTERPRISE,
            title: "Enterprise",
            description: "Custom pricing for large organizations.",
            popular: false,
        },
    ];

    const getButtonLabel = (plan: SubscriptionPlan, isCurrentPlan: boolean) => {
        if (isCurrentPlan) return "Current Plan";
        if (plan === SubscriptionPlan.FREE) return "Included on signup";
        if (plan === SubscriptionPlan.ENTERPRISE) return "Contact Sales";
        if (currentPlan && PLAN_RANK[plan] > PLAN_RANK[currentPlan]) {
            return `Upgrade to ${plan.charAt(0) + plan.slice(1).toLowerCase()}`;
        }
        return "Get Started";
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-center">
                <Tabs
                    value={billingCycle}
                    onValueChange={(value) => setBillingCycle(value as "MONTHLY" | "YEARLY")}
                >
                    <TabsList className="h-11">
                        <TabsTrigger value="MONTHLY" className="px-6">
                            Monthly
                        </TabsTrigger>
                        <TabsTrigger value="YEARLY" className="gap-2 px-6">
                            Yearly
                            <Badge variant="secondary" className="text-[10px]">
                                Save ~17%
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
                {plans.map((plan) => {
                    const pricing = PLAN_PRICING[plan.name];
                    const features = getPlanFeatures(plan.name);
                    const isCurrentPlan = currentPlan === plan.name;
                    const isUpgrade =
                        currentPlan !== undefined && PLAN_RANK[plan.name] > PLAN_RANK[currentPlan];
                    const isPerSeat = pricing.perSeat;
                    const isEventPlan = plan.name === SubscriptionPlan.EVENT;

                    const basePrice = isEventPlan
                        ? pricing.monthly
                        : billingCycle === "MONTHLY"
                          ? pricing.monthly
                          : pricing.yearly;

                    return (
                        <Card
                            key={plan.name}
                            className={`relative flex flex-col ${
                                plan.popular
                                    ? "border-blue-500 shadow-lg ring-1 ring-blue-500/30"
                                    : ""
                            } ${isCurrentPlan ? "border-emerald-500/50 bg-emerald-500/5" : ""}`}
                        >
                            {plan.popular && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-600">
                                    Most Popular
                                </Badge>
                            )}
                            {isCurrentPlan && (
                                <Badge
                                    variant="outline"
                                    className="absolute -top-3 right-4 border-emerald-500/50 text-emerald-600"
                                >
                                    Current
                                </Badge>
                            )}
                            <CardHeader className="pb-4">
                                <CardTitle>{plan.title}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col space-y-4">
                                <div className="space-y-1">
                                    <div className="flex items-baseline gap-1 text-3xl font-bold tracking-tight">
                                        {basePrice === null ? (
                                            <span>Custom</span>
                                        ) : basePrice === 0 ? (
                                            <span>Free</span>
                                        ) : (
                                            <>
                                                <span>${basePrice}</span>
                                                <span className="text-sm font-normal text-muted-foreground">
                                                    {isPerSeat
                                                        ? `/ seat / ${billingCycle === "MONTHLY" ? "mo" : "yr"}`
                                                        : isEventPlan
                                                          ? " flat"
                                                          : `/ ${billingCycle === "MONTHLY" ? "mo" : "yr"}`}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {billingCycle === "YEARLY" && isPerSeat && basePrice !== null && (
                                        <p className="text-sm text-muted-foreground">
                                            ${(basePrice / 12).toFixed(2)} / seat / mo billed yearly
                                        </p>
                                    )}

                                    {isEventPlan && (
                                        <p className="text-xs text-muted-foreground">
                                            One-time · 14 days · up to 150 members
                                        </p>
                                    )}
                                </div>

                                <ul className="flex-1 space-y-2.5">
                                    {features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                                            <span className="text-sm text-muted-foreground">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <Button
                                    className="w-full"
                                    variant={
                                        isCurrentPlan
                                            ? "secondary"
                                            : isUpgrade || plan.popular
                                              ? "default"
                                              : "outline"
                                    }
                                    disabled={
                                        isCurrentPlan ||
                                        plan.name === SubscriptionPlan.FREE
                                    }
                                    onClick={() => {
                                        if (plan.name === SubscriptionPlan.ENTERPRISE) {
                                            toast.info("Contact Sales", {
                                                description:
                                                    "Please reach out to our sales team for Enterprise pricing.",
                                            });
                                            return;
                                        }
                                        if (isEventPlan) {
                                            onSelectPlan(plan.name, "ONE_TIME");
                                            return;
                                        }
                                        onSelectPlan(plan.name, billingCycle);
                                    }}
                                >
                                    {getButtonLabel(plan.name, isCurrentPlan)}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
