"use client";
import { usePathname } from "next/navigation";

import { UserButton } from "@/features/auth/components/user-button";

// import { MobileSidebar } from "./mobile-sidebar";
import { ModeToggle } from "./ui/ModeToggle";
import { SidebarTrigger } from "./ui/sidebar";

// import { NotificationBell } from "@/features/notifications/components/notification-bell";

const pathnameMap = {
  tasks: {
    title: "Issues",
    description: "View all of your issues here",
  },
  projects: {
    title: "My Projects",
    description: "View issues of your project here",
  },
};
const defaultMap = {
  title: "Hey there!",
  description: "Track all your projects and issues here",
};
export const Navbar = () => {
  const pathname = usePathname();
  const parts = pathname.split("/");
  const pathnameKey = parts[3] as keyof typeof pathnameMap;

  const { description, title } = pathnameMap[pathnameKey] || defaultMap;
  return (
    <nav className="sticky top-3 z-20 mb-6 flex items-center justify-between rounded-[28px] bg-background/55 px-4 py-3 shadow-none backdrop-blur-xl dark:shadow-[0_22px_50px_-30px_rgba(15,23,42,0.75)]">
      <div className="flex items-center gap-x-4">
        <SidebarTrigger className="h-11 w-11 rounded-2xl bg-card/55 hover:bg-accent md:hidden" />
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
          <p className="hidden text-sm text-muted-foreground md:block">
            {description}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-x-4">
        {/* <NotificationBell /> */}
        <UserButton />
        <ModeToggle />
      </div>
    </nav>
  );
};
