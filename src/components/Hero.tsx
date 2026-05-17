"use client";

import React, { useEffect, useRef } from "react";
import { Spotlight } from "./ui/spotlight";
import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const Hero = () => {
  const imageRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const imageElement = imageRef.current;
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;
      if (scrollPosition > scrollThreshold) {
        imageElement?.classList.add("scrolled");
      } else {
        imageElement?.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const imageSrc =
    resolvedTheme === "light" ? "/onboardinglight.png" : "/onboardingPage.png";

  return (
    <div className="relative mx-auto min-h-screen">
      {" "}
      <Spotlight
        className="left-0 top-44 sm:-top-40 md:left-60 md:top-10"
        fill="blue"
      />
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 1,
          ease: "easeInOut",
          type: "spring",
          damping: 5,
        }}
        className="mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center leading-8">
          <h1 className="relative bg-gradient-to-b from-neutral-400 to-neutral-800 bg-clip-text text-[40px] font-bold leading-[150%] tracking-wide text-transparent dark:from-neutral-200 dark:to-neutral-500 sm:text-5xl md:text-7xl">
            Transform your learning with <br />
            <span className="bg-gradient-to-b from-blue-400 to-blue-700 bg-clip-text text-center text-[54px] font-semibold tracking-wide text-transparent sm:text-7xl md:text-9xl">
              Contributions
            </span>
          </h1>
          <p className="text-sm text-gray-400 sm:text-lg">
            {/* A platform where you can contribute to{" "}
            <br className="block md:hidden" /> real-world projects in a closed
            environment. */}
            Make any project trackable and AI-powered with Vaiu.
          </p>
        </div>
        <div className="mt-10">
          <Link href={"/sign-in"}>
            <Button
              className="rounded-full font-bold text-slate-900 outline outline-blue-600 hover:text-slate-800 dark:text-slate-100 dark:hover:text-slate-200"
              variant={"outline"}
              size={"lg"}
            >
              Get Started
            </Button>
          </Link>
        </div>
      </motion.div>
      <motion.div
        initial={{ y: 40, opacity: 1 }}
        animate={{
          y: [0, 10, 0],
          opacity: 1,
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
        }}
        className="-mt-8 flex items-center justify-center"
      >
        <ArrowDown className="size-8" />
      </motion.div>
      <div className="hero-image-wrapper mt-5 md:mt-10">
        <div ref={imageRef} className="hero-image relative overflow-hidden">
          <Image
            src={imageSrc}
            alt={"Onboarding Page"}
            width={1100}
            height={620}
            className="mx-auto rounded-lg drop-shadow-2xl transition-all duration-300 dark:border-2"
            priority
          />
          <div className="absolute bg-blue-600" />
          <div className="absolute -inset-x-64 bottom-0 bg-gradient-to-t from-white/100 to-transparent pt-[800px] dark:bg-gradient-to-t dark:from-background dark:to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
