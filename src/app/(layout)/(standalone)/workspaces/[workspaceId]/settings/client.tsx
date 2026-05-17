"use client";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { GithubWorkspaceSettings } from "@/features/workspaces/components/github-workspace-settings";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Workspace } from "@/features/workspaces/types";

import { PageError } from "@/components/page-error";
import { Loader } from "@/components/page-loader";

export const WorkspaceIdSettingsClient = () => {
  const workspaceId = useWorkspaceId();
  const { data: initialValues, isLoading } = useGetWorkspace({ workspaceId });

  if (isLoading) return <Loader variant="standalone" />;
  if (!initialValues) return <PageError message="Workspace not found" />;

  return (
    <div className="flex w-full flex-col gap-6 lg:max-w-xl">
      <EditWorkspaceForm initialValues={initialValues} />
      <GithubWorkspaceSettings workspace={initialValues as Workspace} />
    </div>
  );
};
