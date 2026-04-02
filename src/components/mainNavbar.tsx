"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./ui/ModeToggle";
import Link from "next/link";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Logo2 } from "./Logo2";
import { usePathname } from "next/navigation";
// import { NotificationPopover } from "@/features/notifications/components/notification-popover";

export function Navbar({ className }: { className?: string }) {
  const pathname = usePathname();
  const isSignIn = pathname === "/sign-in";
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      }
      // Hide navbar when scrolling down
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={cn(
        "wrapper sticky top-0 z-50 mx-auto flex w-full items-center gap-2 py-6 transition-transform duration-300",
        isVisible ? "translate-y-0" : "-translate-y-full",
        className,
      )}
    >
      <div className="mx-auto flex w-full items-center justify-between rounded-full bg-background/55 px-8 py-4 shadow-none backdrop-blur-lg dark:shadow-[0_18px_45px_-30px_rgba(15,23,42,0.65)] md:max-w-4xl">
        <Link href="/" className="flex items-center">
          <Logo className="dark:hidden" />
          <Logo2 className="hidden dark:block" />
        </Link>
        <div className="flex items-center gap-x-4">
          <Button asChild variant="ghost" className="font-semibold">
            <Link href="/docs">Docs</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            <Link href={isSignIn ? "/sign-up" : "/sign-in"}>
              {isSignIn ? "Sign Up" : "Sign In"}
            </Link>
          </Button>
          <ModeToggle />
          {/* <NotificationPopover /> */}
        </div>
      </div>
    </div>
  );
}
