"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { CheckCircle } from "lucide-react";
import { PLAN_PRICING, SubscriptionPlan } from "@/features/subscriptions/types";
import { getPlanFeatures } from "@/features/subscriptions/utils";

const PLAN_META: {
  name: SubscriptionPlan;
  title: string;
  description: string;
  highlighted: boolean;
}[] = [
  {
    name: SubscriptionPlan.FREE,
    title: "Free",
    description: "Try Vaiu for 30 days — no card required.",
    highlighted: false,
  },
  {
    name: SubscriptionPlan.PRO,
    title: "Pro",
    description: "For individual developers and small teams.",
    highlighted: true,
  },
  {
    name: SubscriptionPlan.STANDARD,
    title: "Standard",
    description: "For growing teams that need more headroom.",
    highlighted: false,
  },
  {
    name: SubscriptionPlan.ENTERPRISE,
    title: "Enterprise",
    description: "Custom pricing for large organizations.",
    highlighted: false,
  },
];

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">(
    "MONTHLY",
  );
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );

  const formatPrice = (amount: number | null) => {
    if (amount === null) return "Custom";
    if (amount === 0) return "Free";
    return `$${amount.toLocaleString("en-US")}`;
  };

  return (
    <section className="w-full py-12 md:py-20" id="pricing">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 text-5xl font-bold text-gray-900 dark:text-white">
              Pricing
            </div>
            <h2 className="bg-gradient-to-r text-2xl tracking-wide text-gray-700 dark:text-white md:text-3xl">
              Simple, transparent pricing
            </h2>
            <p className="max-w-[900px] text-sm text-blue-600 md:text-base lg:text-base/relaxed xl:text-xl/relaxed">
              Choose the plan that&apos;s right for your team.
            </p>
          </div>

          <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1 text-sm dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setBillingCycle("MONTHLY")}
              className={`rounded-md px-4 py-1.5 font-medium transition-colors ${
                billingCycle === "MONTHLY"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-slate-300"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("YEARLY")}
              className={`rounded-md px-4 py-1.5 font-medium transition-colors ${
                billingCycle === "YEARLY"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-slate-300"
              }`}
            >
              Yearly
              <span className="ml-1.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Save ~17%
              </span>
            </button>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 py-8 md:grid-cols-2 md:py-12 lg:grid-cols-4">
          {PLAN_META.map((plan) => {
            const pricing = PLAN_PRICING[plan.name];
            const price =
              billingCycle === "MONTHLY" ? pricing.monthly : pricing.yearly;
            const features = getPlanFeatures(plan.name);
            const isSelected = selectedPlan === plan.name;

            return (
              <div
                key={plan.name}
                onClick={() => setSelectedPlan(plan.name)}
                className={`cursor-pointer rounded-xl border transition-all duration-300 ${
                  isSelected || plan.highlighted
                    ? "scale-[1.02] transform border-blue-500 bg-gradient-to-b from-blue-50 to-white ring-2 ring-blue-500 dark:from-blue-900/30 dark:to-slate-900/90"
                    : "border-slate-200 bg-white hover:ring-1 hover:ring-blue-400/50 dark:border-slate-800 dark:bg-slate-900/50"
                } p-4 shadow-lg md:p-6`}
              >
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white md:text-xl">
                      {plan.title}
                    </h3>
                    {plan.highlighted && (
                      <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
                      {formatPrice(price)}
                    </span>
                    {price !== null && price > 0 && (
                      <span className="text-xs text-slate-600 dark:text-slate-400 md:text-sm">
                        /{billingCycle === "MONTHLY" ? "month" : "year"}
                      </span>
                    )}
                  </div>
                  {billingCycle === "YEARLY" &&
                    price !== null &&
                    price > 0 && (
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        ${(price / 12).toFixed(2)} / month, billed yearly
                      </p>
                    )}
                  <p className="text-xs text-gray-600 dark:text-slate-300 md:text-sm">
                    {plan.description}
                  </p>
                  <ul className="space-y-1 text-xs md:space-y-2 md:text-sm">
                    {features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 flex-shrink-0 text-blue-600 md:h-4 md:w-4" />
                        <span className="text-gray-700 dark:text-slate-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {plan.name === SubscriptionPlan.ENTERPRISE ? (
                    <Button
                      asChild
                      className="w-full text-sm md:text-base"
                      variant={
                        isSelected || plan.highlighted ? "default" : "outline"
                      }
                    >
                      <Link href="mailto:sales@vaiu.app">Contact Sales</Link>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className={`w-full text-sm md:text-base ${
                        isSelected || plan.highlighted
                          ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:from-blue-500 hover:to-blue-500"
                          : "border-slate-300 text-gray-900 hover:bg-slate-100 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
                      }`}
                      variant={
                        isSelected || plan.highlighted ? "default" : "outline"
                      }
                    >
                      <Link href="/pricing">
                        {plan.name === SubscriptionPlan.FREE
                          ? "Start free trial"
                          : "Get Started"}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
