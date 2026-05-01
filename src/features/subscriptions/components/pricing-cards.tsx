"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SubscriptionPlan, PLAN_PRICING } from "../types";
import { getPlanFeatures } from "../utils";

interface PricingCardsProps {
    currentPlan?: SubscriptionPlan;
    onSelectPlan: (plan: SubscriptionPlan, billingCycle: "MONTHLY" | "YEARLY") => void;
}

export const PricingCards = ({ currentPlan, onSelectPlan }: PricingCardsProps) => {
    const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

    const plans = [
        {
            name: SubscriptionPlan.FREE,
            title: "Free",
            description: "Perfect for trying out Vaiu",
            popular: false,
        },
        {
            name: SubscriptionPlan.PRO,
            title: "Pro",
            description: "For professional developers",
            popular: true,
        },
        {
            name: SubscriptionPlan.STANDARD,
            title: "Standard",
            description: "For growing teams",
            popular: false,
        },
        {
            name: SubscriptionPlan.ENTERPRISE,
            title: "Enterprise",
            description: "For large organizations",
            popular: false,
        },
    ];

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">Choose Your Plan</h2>
                <p className="text-muted-foreground">
                    Select the plan that best fits your needs
                </p>
                <Tabs
                    value={billingCycle}
                    onValueChange={(value) => setBillingCycle(value as "MONTHLY" | "YEARLY")}
                    className="w-fit mx-auto"
                >
                    <TabsList>
                        <TabsTrigger value="MONTHLY">Monthly</TabsTrigger>
                        <TabsTrigger value="YEARLY">
                            Yearly
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan) => {
                    const pricing = PLAN_PRICING[plan.name];
                    const features = getPlanFeatures(plan.name);
                    const isCurrentPlan = currentPlan === plan.name;
                    const price = billingCycle === "MONTHLY" ? pricing.monthly : pricing.yearly;

                    return (
                        <Card
                            key={plan.name}
                            className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}
                        >
                            {plan.popular && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    Most Popular
                                </Badge>
                            )}
                            <CardHeader>
                                <CardTitle>{plan.title}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <div className="text-3xl font-bold">
                                        {price === null ? (
                                            "Contact Sales"
                                        ) : (
                                            <>
                                                ₹{price}
                                                {plan.name !== SubscriptionPlan.FREE && (
                                                    <span className="text-sm font-normal text-muted-foreground">
                                                        /{billingCycle === "MONTHLY" ? "month" : "year"}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    {billingCycle === "YEARLY" && plan.name !== SubscriptionPlan.FREE && price !== null && (
                                        <p className="text-sm text-muted-foreground">
                                            ₹{Math.round(price / 12)}/month billed yearly
                                        </p>
                                    )}
                                </div>

                                <ul className="space-y-2">
                                    {features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={plan.popular ? "default" : "outline"}
                                    disabled={isCurrentPlan || plan.name === SubscriptionPlan.FREE}
                                    onClick={() => {
                                        if (plan.name === SubscriptionPlan.ENTERPRISE) {
                                            toast.info("Contact Sales", {
                                                description: "Please reach out to our sales team for Enterprise pricing and custom solutions.",
                                            });
                                        } else {
                                            onSelectPlan(plan.name, billingCycle);
                                        }
                                    }}
                                >
                                    {isCurrentPlan
                                        ? "Current Plan"
                                        : plan.name === SubscriptionPlan.FREE
                                            ? "Free Forever"
                                            : plan.name === SubscriptionPlan.ENTERPRISE
                                                ? "Contact Sales"
                                                : "Get Started"}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
