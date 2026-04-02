import Link from "next/link";
import { PropsWithChildren } from "react";
import { UserButton } from "@/features/auth/components/user-button";
import { Logo } from "@/components/Logo";
import { Logo2 } from "@/components/Logo2";
import { ModeToggle } from "@/components/ui/ModeToggle";

const StandaloneLayout = async ({ children }: PropsWithChildren) => {
  return (
    <main className="app-shell min-h-screen">
      <div className="mx-auto max-w-screen-2xl px-3 py-3 md:px-6 md:py-5">
        <nav className="flex h-[73px] items-center justify-between rounded-3xl bg-background/55 px-4 shadow-none backdrop-blur-xl dark:shadow-[0_18px_45px_-28px_rgba(15,23,42,0.55)]">
          <Link href="/">
            <Logo className="dark:hidden" />
            <Logo2 className="hidden dark:block" />
          </Link>
          <div className="flex items-center justify-center gap-x-4">
            <UserButton />
            <ModeToggle />
          </div>
        </nav>
        <div className="flex flex-col items-center justify-center py-6">
          {children}
        </div>
      </div>
    </main>
  );
};

export default StandaloneLayout;
