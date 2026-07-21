"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./ui/ModeToggle";
import Link from "next/link";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Logo2 } from "./Logo2";
import { usePathname } from "next/navigation";
import { useCurrent } from "@/features/auth/api/use-curent";

const navLinkClass =
    "font-medium text-muted-foreground hover:text-foreground transition-colors";

export function Navbar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { data: user } = useCurrent();
    const isSignIn = pathname === "/sign-in";
    const isBilling = pathname === "/billing";
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < lastScrollY || currentScrollY < 10) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
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
                "wrapper sticky top-0 z-50 mx-auto flex w-full items-center gap-2 py-4 transition-transform duration-300 md:py-6",
                isVisible ? "translate-y-0" : "-translate-y-full",
                className,
            )}
        >
            <div className="mx-auto flex w-full items-center justify-between gap-4 rounded-full bg-background/80 px-4 py-3 shadow-sm backdrop-blur-lg dark:shadow-[0_18px_45px_-30px_rgba(15,23,42,0.65)] sm:px-6 md:max-w-6xl">
                <Link href="/" className="flex shrink-0 items-center">
                    <Logo className="dark:hidden" />
                    <Logo2 className="hidden dark:block" />
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    <Link href="/docs" className={cn(navLinkClass, "px-3 py-2 text-sm")}>
                        Docs
                    </Link>
                    <Link href="/faq" className={cn(navLinkClass, "px-3 py-2 text-sm")}>
                        FAQ
                    </Link>
                </nav>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                        asChild
                        size="sm"
                        className="bg-blue-600 font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                        <Link href="/pricing">Pricing</Link>
                    </Button>

                    {user ? (
                        <>
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className={cn(
                                    "font-semibold",
                                    isBilling && "border-blue-600 text-blue-600",
                                )}
                            >
                                <Link href="/billing">Billing</Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="font-semibold">
                                <Link href="/">Dashboard</Link>
                            </Button>
                        </>
                    ) : (
                        <Button asChild variant="outline" size="sm" className="font-semibold">
                            <Link href={isSignIn ? "/sign-up" : "/sign-in"}>
                                {isSignIn ? "Sign Up" : "Sign In"}
                            </Link>
                        </Button>
                    )}

                    <ModeToggle />
                </div>
            </div>
        </div>
    );
}
