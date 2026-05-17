"use client";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { GithubWorkspaceSettings } from "@/features/workspaces/components/github-workspace-settings";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Workspace } from "@/features/workspaces/types";

import { PageError } from "@/components/page-error";
import { Loader } from "@/components/page-loader";
import { useCurrentWorkspaceMember } from "@/features/workspaces/api/use-is-member";
import { MemberRole } from "@/features/members/types";

export const WorkspaceIdSettingsClient = () => {
  const workspaceId = useWorkspaceId();
  const { data: initialValues, isLoading } = useGetWorkspace({ workspaceId });
  const { data: currentWorkspaceMember, isLoading: memberLoading } =
    useCurrentWorkspaceMember(workspaceId);
  const isWorkspaceAdmin =
    currentWorkspaceMember?.role === MemberRole.ADMIN ||
    currentWorkspaceMember?.role === MemberRole.SUPER_ADMIN;

  if (isLoading || memberLoading) return <Loader />;
  if (!initialValues) return <PageError message="Workspace not found" />;
  if (!isWorkspaceAdmin) {
    return <PageError message="You do not have access to workspace settings." />;
  }

  return (
    <div className="flex w-full flex-col gap-6 lg:max-w-xl">
      <EditWorkspaceForm initialValues={initialValues} />
      <GithubWorkspaceSettings workspace={initialValues as Workspace} />
    </div>
  );
};
