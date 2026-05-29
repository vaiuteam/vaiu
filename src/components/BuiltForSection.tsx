"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot, GraduationCap, Rocket } from "lucide-react";
import Link from "next/link";

import {
  CohortsVisual,
  HackathonVisual,
  SchoolsVisual,
} from "@/components/built-for-visuals";
import { cn } from "@/lib/utils";

const markets = [
  {
    id: "hackathons",
    title: "Hackathons",
    description:
      "Collaborate, brainstorm, organize tasks, and ship faster during high-pressure builds.",
    tags: ["24-Hour Builds", "AI Collaboration", "Team Workflows"],
    icon: Rocket,
    visual: HackathonVisual,
  },
  {
    id: "schools",
    title: "Schools & Student Builders",
    description:
      "Help students learn, create projects, and collaborate with AI-powered workflows.",
    tags: ["Student Innovation", "AI Learning", "Project Collaboration"],
    icon: GraduationCap,
    visual: SchoolsVisual,
  },
  {
    id: "cohorts",
    title: "Cohorts & Startup Communities",
    description:
      "Bring founders, builders, and communities into one collaborative AI workspace.",
    tags: ["Startup Teams", "Builder Communities", "Shared AI Workspaces"],
    icon: Bot,
    visual: CohortsVisual,
  },
] as const;

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
};

const BuiltForSection = () => {
  return (
    <section
      id="built-for"
      className="relative mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32"
    >
      <div className="mb-16 space-y-5 text-center md:mb-20">
        <motion.h2
          {...fadeUp}
          className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl md:text-5xl"
        >
          Built for{" "}
          <span className="text-blue-500">Modern Builders</span>
        </motion.h2>
        <motion.p
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.08 }}
          className="mx-auto max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 md:text-lg"
        >
          Designed for hackathon teams, student innovators, schools, and
          collaborative startup communities using AI to build faster together.
        </motion.p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        {markets.map((market, index) => {
          const Visual = market.visual;
          const Icon = market.icon;

          return (
            <motion.article
              key={market.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className={cn(
                "group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm",
                "transition-all duration-300 ease-out",
                "hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_20px_50px_-20px_rgba(15,23,42,0.15)]",
                "dark:border-neutral-800 dark:bg-neutral-900/50",
                "dark:hover:border-neutral-700 dark:hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)]",
              )}
            >
              <div className="relative h-52 overflow-hidden border-b border-neutral-200/80 dark:border-neutral-800">
                <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.08),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <Visual />
              </div>

              <div className="flex flex-1 flex-col p-6 md:p-7">
                <div className="mb-4 flex size-9 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-50 text-neutral-700 transition-colors duration-300 group-hover:border-neutral-300 group-hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-200 dark:group-hover:border-neutral-700 dark:group-hover:bg-neutral-800">
                  <Icon className="size-4" />
                </div>

                <h3 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
                  {market.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {market.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {market.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-neutral-200/80 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-medium text-neutral-500 transition-colors duration-300 group-hover:border-neutral-300 group-hover:text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/40 dark:text-neutral-400 dark:group-hover:border-neutral-700 dark:group-hover:text-neutral-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.2 }}
        className="mt-14 text-center md:mt-16"
      >
        <Link
          href="/sign-up"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-900 transition-colors duration-300 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
        >
          Start Building with Your Team
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </motion.div>
    </section>
  );
};

export default BuiltForSection;
