"use client";

import { useState } from "react";
import Image from "next/image";
import { Github, Loader2, Eye, EyeOff, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetGithubToken } from "@/features/profile/api/use-get-github-token";
import { useSaveGithubToken } from "@/features/profile/api/use-save-github-token";
import { useDeleteGithubToken } from "@/features/profile/api/use-delete-github-token";

export const GithubTokenSettings = () => {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);

  const { data, isLoading } = useGetGithubToken();
  const { mutate: saveToken, isPending: isSaving } = useSaveGithubToken();
  const { mutate: deleteToken, isPending: isDeleting } = useDeleteGithubToken();

  const hasToken = data?.hasToken || false;
  const maskedToken = data?.maskedToken;

  const handleSave = () => {
    if (!token.trim()) return;
    saveToken(
      { json: { token: token.trim() } },
      {
        onSuccess: () => {
          setToken("");
          setShowToken(false);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteToken();
  };

  if (isLoading) {
    return (
      <Card className="border-none bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent),hsl(var(--card))] shadow-none dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.75)]">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent),hsl(var(--card))] shadow-none dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.75)]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          <CardTitle>GitHub Personal Access Token</CardTitle>
        </div>
        <CardDescription>
          Connect your GitHub account using a Personal Access Token to sync
          issues and pull requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasToken && (
          <Alert>
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">
                <span className="font-medium">Connected:</span> {maskedToken}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Disconnect
                  </>
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="github-token" className="flex items-center justify-between">
            <div className="flex items-center">
              {hasToken ? "Update Token" : "Enter Token"}
              <Info size={16} className="ml-2 text-muted-foreground" />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <button className="text-sm text-blue-500 underline underline-offset-4">
                  Steps to generate personal access token
                </button>
              </DialogTrigger>
              <DialogContent className="size-[400px] overflow-y-auto sm:size-[600px]">
                <DialogTitle>
                  Steps to generate personal access token from Github
                </DialogTitle>
                <DialogDescription>
                  <p className="text-lg">
                    Step 1. Navigate to your Github account settings.
                  </p>
                  <Image
                    src="/step1.png"
                    alt="Github Token"
                    width={600}
                    height={400}
                  />
                  <br />
                  <p className="text-lg">
                    Step 2. Scroll to the bottom and Click on &quot;Developer
                    settings&quot;.
                  </p>
                  <Image
                    src="/step2.png"
                    alt="Github Token"
                    width={600}
                    height={400}
                  />
                  <br />
                  <p className="text-lg">
                    Step 3. Click on &quot;Personal access tokens&quot;. Choose
                    Tokens(Classic)
                  </p>
                  <Image
                    src="/step3.png"
                    alt="Github Token"
                    width={600}
                    height={400}
                  />
                  <br />
                  <p className="text-lg">
                    Step 4. Click on &quot;Generate new token&quot;. Enter the
                    required information.
                  </p>
                  <Image
                    src="/step4.png"
                    alt="Github Token"
                    width={600}
                    height={400}
                  />
                  <br />
                  <p className="text-lg">
                    Step 5. Define the scopes as shown in the image below.
                  </p>
                  <Image
                    src="/scope1.png"
                    alt="Github Token"
                    width={600}
                    height={400}
                  />
                  <Image
                    src="/scope2.png"
                    alt="Github Token"
                    width={600}
                    height={400}
                  />
                  <Image
                    src="/scope3.png"
                    alt="github token"
                    width={600}
                    height={400}
                  />
                  <br />
                  <p className="text-lg">
                    Step 6. Copy the generated token and paste it here.
                  </p>
                  <Image
                    src="/step6.png"
                    alt="Github Token"
                    width={600}
                    height={400}
                  />
                </DialogDescription>
              </DialogContent>
            </Dialog>
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="github-token"
                type={showToken ? "text" : "password"}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={isSaving}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button onClick={handleSave} disabled={isSaving || !token.trim()}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                hasToken ? "Update" : "Save"
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl bg-blue-500/10 p-3 text-xs text-blue-700 dark:text-blue-200">
          <strong>Tip:</strong> For better security, connect GitHub at the workspace
          level via <strong>Workspace Settings → Connect GitHub</strong>. The GitHub App
          integration automatically manages tokens and is required for real-time webhook sync.
          This personal token is still used when you create or comment on issues/PRs.
        </div>
      </CardContent>
    </Card>
  );
};
