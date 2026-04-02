"use client";

import { GithubTokenSettings } from "@/features/profile/components/github-token-settings";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export const UserSettingsClient = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="w-full lg:max-w-4xl">
      <div className="flex flex-col gap-y-5 rounded-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent),hsl(var(--surface))] p-5 shadow-none backdrop-blur-xl dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.75)]">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex w-fit items-center gap-2 rounded-2xl px-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold">Account Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and integrations
          </p>
        </div>
        <Separator />
        <GithubTokenSettings />
      </div>
    </div>
  );
};
