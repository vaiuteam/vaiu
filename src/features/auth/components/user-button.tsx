"use client";
import { LogOut, Navigation } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

import { Separator } from "@/components/dotted-separator";

import { useCurrent } from "../api/use-curent";
import { useLogout } from "../api/use-logout";
import { useRouter } from "next/navigation";

export const UserButton = () => {
  const { mutate: logout } = useLogout();
  const { data: user, isLoading } = useCurrent();

  const router = useRouter();

  if (isLoading) {
    return (
      <Skeleton
        className="size-10 shrink-0 rounded-full"
        aria-busy="true"
        aria-label="Loading profile"
      />
    );
  }
  if (!user) return null;
  const { name, email } = user;
  const avatarFallback = name
    ? name.charAt(0).toUpperCase()
    : (email.charAt(0).toUpperCase() ?? "U");

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="relative outline-none">
        <Avatar className="size-10 border border-gray-300 transition hover:opacity-75 dark:border-gray-700">
          <AvatarFallback className="flex items-center justify-center bg-slate-200 font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        className="w-60"
        sideOffset={10}
      >
        <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
          <Avatar className="size-[52px] border border-gray-300 dark:border-gray-700">
            <AvatarFallback className="flex items-center justify-center bg-gray-300 text-xl font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {name || "User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{email}</p>
          </div>
        </div>
        <Separator className="mb-1" />
        <div className="flex">
          <DropdownMenuItem onClick={() => {
            router.push(`/profile/${user.name}`); 
          }} className="h-10 flex items-center justify-center text-gray-900 dark:text-gray-100 font-medium cursor-pointer">
            <Navigation className="size-4 mr-2" />
            View Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => logout()}
            className="h-10 flex items-center justify-center text-amber-700 font-medium cursor-pointer"
          >
            <LogOut className="size-4 mr-2" />
            Log Out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
