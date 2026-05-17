"use client";

import { PageError } from "@/components/page-error";
import { Loader } from "@/components/page-loader";
import { JoinWorkspaceForm } from "@/features/workspaces/components/join-workspace-form";
import { useInviteCode } from "@/features/workspaces/hooks/use-invite-code";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspaceJoinInfo } from "@/features/workspaces/api/use-get-workspace-join-info";

export const WorkspaceIdJoinClient = () => {
  const workspaceId = useWorkspaceId();
  const inviteCode = useInviteCode();

  const {
    data: initialValues,
    isLoading,
    error,
  } = useGetWorkspaceJoinInfo({
    workspaceId,
  });

  if (isLoading) return <Loader variant="standalone" />;

  if (error) {
    return <PageError message={error.message || "Failed to load workspace"} />;
  }

  if (!initialValues) {
    return <PageError message="Workspace not found" />;
  }

  return (
    <div className="w-full lg:max-w-xl">
      <JoinWorkspaceForm
        initialValues={initialValues}
        workspaceId={workspaceId}
        code={inviteCode}
      />
    </div>
  );
};
