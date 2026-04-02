"use client";

import { useState } from "react";
import { Github, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDisconnectGithub } from "../api/use-disconnect-github";
import { Workspace } from "../types";

interface GithubWorkspaceSettingsProps {
  workspace: Workspace;
}

export const GithubWorkspaceSettings = ({
  workspace,
}: GithubWorkspaceSettingsProps) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const isConnected = !!workspace.githubInstallationId;

  const { mutate: disconnect, isPending: isDisconnecting } =
    useDisconnectGithub(workspace.$id);

  const handleConnect = () => {
    setIsConnecting(true);
    window.location.href = `/api/v1/workspaces/${workspace.$id}/github/install`;
  };

  return (
    <Card className="border-none bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent),hsl(var(--card))] shadow-none dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.75)]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          <CardTitle>GitHub Integration</CardTitle>
        </div>
        <CardDescription>
          Connect a GitHub App installation to enable repository syncing,
          real-time webhooks, and the repository picker for all projects in this
          workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="flex items-center justify-between rounded-2xl bg-green-500/10 px-4 py-3 text-green-700 dark:text-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">
                Connected
                {workspace.githubAccountLogin && (
                  <span className="ml-1 font-normal text-green-600 dark:text-green-300">
                    ({workspace.githubAccountLogin})
                  </span>
                )}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => disconnect()}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <XCircle className="mr-1 h-4 w-4" />
                  Disconnect
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              No GitHub installation connected. Click below to install the
              GitHub App on your account or organization and grant access to
              repositories.
            </p>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-fit"
            >
              {isConnecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Github className="mr-2 h-4 w-4" />
              )}
              Connect GitHub
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
