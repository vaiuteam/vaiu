"use client";

import Link from "next/link";
// import { Code2, Loader2 } from "lucide-react";
import { BookOpen } from "lucide-react";
import {
  GoCheckCircle,
  GoCheckCircleFill,
  GoHome,
  GoHomeFill,
} from "react-icons/go";
import { cn } from "@/lib/utils";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { usePathname } from "next/navigation";
// import { useIsMember } from "@/features/workspaces/api/use-is-member";
// import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";
import { RiSettings2Fill, RiSettings2Line } from "react-icons/ri";
import { FaRegUserCircle, FaUserCircle } from "react-icons/fa";
import { HiOutlineUserGroup, HiUserGroup } from "react-icons/hi2";
import { useSidebar } from "./ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: GoHome,
    activeIcon: GoHomeFill,
  },
  {
    label: "Issues",
    href: "/tasks",
    icon: GoCheckCircle,
    activeIcon: GoCheckCircleFill,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: RiSettings2Line,
    activeIcon: RiSettings2Fill,
  },
  {
    label: "Account",
    href: "/account",
    icon: FaRegUserCircle,
    activeIcon: FaUserCircle,
  },
  {
    label: "Members",
    href: "/members",
    icon: HiOutlineUserGroup,
    activeIcon: HiUserGroup,
  },
  {
    label: "Docs",
    href: "/docs",
    icon: BookOpen,
    activeIcon: BookOpen,
    scope: "global",
  },
  // {
  //   label: "Contributions",
  //   icon: Code2,
  //   activeIcon: Code2,
  //   dynamicRedirect: true,
  // },
];

type NavItem = (typeof navItems)[number];

const getResolvedHref = (workspaceId: string, item: NavItem) => {
  if (item.scope === "global") {
    return item.href;
  }

  if (item.href === "/") {
    return `/workspaces/${workspaceId}`;
  }

  return `/workspaces/${workspaceId}${item.href ?? ""}`;
};

const isItemActive = (pathname: string, resolvedHref: string, label: string) => {
  if (label === "Home") {
    return (
      pathname === resolvedHref ||
      pathname === `${resolvedHref}/`
    );
  }

  return pathname === resolvedHref || pathname.startsWith(`${resolvedHref}/`);
};

export const Navigation = () => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // const OPEN_CONTRIBUTION_WORKSPACE_ID = process.env.OPEN_CONTRIBUTION_WORKSPACE_ID || "";

  // TODO: Remove this
  // const OPEN_CONTRIBUTION_WORKSPACE_ID = "683e4f3900212432e9d6";

  // const {
  //   data: isOpenContributionMember,
  //   isLoading: isOpenContributionMemberLoading,
  // } = useIsMember(OPEN_CONTRIBUTION_WORKSPACE_ID);
  // const { data: openContributionInfo, isLoading: openContributionInfoLoading } =
  //   useGetWorkspaceInfo({ workspaceId: OPEN_CONTRIBUTION_WORKSPACE_ID });

  // const isLoading =
  //   isOpenContributionMemberLoading || openContributionInfoLoading;

  // Don't render navigation if workspaceId is not available
  if (!workspaceId) {
    return null;
  }

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const { activeIcon, icon, label } = item;
            const resolvedHref = getResolvedHref(workspaceId, item);
            const isActive = isItemActive(pathname, resolvedHref, label);
            const Icon = isActive ? activeIcon : icon;

            return (
              <li key={`${label}-${resolvedHref}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-12 w-12 rounded-2xl",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm hover:bg-sidebar-accent"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                      )}
                      asChild
                    >
                      <Link href={resolvedHref}>
                        <Icon className="size-12" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{label}</p>
                  </TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </TooltipProvider>
    );
  }

  return (
    <ul className="flex flex-col">
      {navItems.map((item) => {
        const { activeIcon, icon, label } = item;
        const resolvedHref = getResolvedHref(workspaceId, item);
        const isActive = isItemActive(pathname, resolvedHref, label);
        const Icon = isActive ? activeIcon : icon;

        // Commented out Contributions dynamic redirect logic
        // if (dynamicRedirect) {
        //   const contributionHref = isOpenContributionMember
        //     ? `/workspaces/${OPEN_CONTRIBUTION_WORKSPACE_ID}`
        //     : openContributionInfo?.inviteCode
        //       ? `/workspaces/${OPEN_CONTRIBUTION_WORKSPACE_ID}/join/${openContributionInfo?.inviteCode}`
        //       : `/workspaces/${OPEN_CONTRIBUTION_WORKSPACE_ID}`;
        //
        //   return (
        //     <li key={label}>
        //       {isLoading ? (
        //         <div
        //           className={cn(
        //             "m-0.5 flex w-full items-center gap-2.5 rounded-md p-2.5 font-medium text-slate-600 dark:text-slate-200",
        //             "cursor-not-allowed opacity-60",
        //           )}
        //         >
        //           <Loader2 className="size-5 animate-spin" />
        //           {label}
        //         </div>
        //       ) : (
        //         <Link
        //           href={contributionHref}
        //           className={cn(
        //             "m-0.5 flex w-full items-center gap-2.5 rounded-md p-2.5 text-left font-medium transition",
        //             isActive
        //               ? "bg-slate-200 text-primary hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
        //               : "text-slate-600 hover:bg-slate-100 hover:text-primary dark:text-slate-200 hover:dark:bg-slate-700/50",
        //           )}
        //         >
        //           <Icon className="size-5" />
        //           {label}
        //         </Link>
        //       )}
        //     </li>
        //   );
        // }

        return (
          <li key={`${label}-${resolvedHref}`}>
            <Link
              href={resolvedHref}
              className={cn(
                "m-0.5 flex items-center gap-2.5 rounded-2xl px-3 py-2.5 font-medium transition",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm hover:bg-sidebar-accent"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
