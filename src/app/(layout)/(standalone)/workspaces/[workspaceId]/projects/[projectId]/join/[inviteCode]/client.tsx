"use client";

import { PageError } from "@/components/page-error";
import { Loader } from "@/components/page-loader";
import { JoinProjectForm } from "@/features/projects/components/join-project-form";
import { useInviteCode } from "@/features/workspaces/hooks/use-invite-code";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-projectId";
import { useGetProjectInfo } from "@/features/projects/api/use-get-project-info";

export const ProjectIdJoinClient = () => {
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const inviteCode = useInviteCode();

  const { data: initialValues, isLoading } = useGetProjectInfo({
    projectId,
  });

  if (isLoading) return <Loader variant="standalone" />;
  if (!initialValues) return <PageError message="Project not found" />;

  return (
    <div className="w-full lg:max-w-xl">
      <JoinProjectForm
        initialValues={initialValues}
        workspaceId={workspaceId}
        projectId={projectId}
        code={inviteCode}
      />
    </div>
  );
};
