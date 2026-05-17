"use client";
import { useProjectId } from "@/features/projects/hooks/use-projectId";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { EditProjectForm } from "@/features/projects/components/edit-project-form";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCurrentWorkspaceMember } from "@/features/workspaces/api/use-is-member";
import { MemberRole } from "@/features/members/types";

import { Loader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";

export const ProjectIdSettingsClient = () => {
  const projectId = useProjectId();
  const workspaceId = useWorkspaceId();
  const { data: initialValues, isLoading } = useGetProject({ projectId });
  const { data: currentMember, isLoading: memberLoading } =
    useCurrentWorkspaceMember(workspaceId);
  const canManage =
    currentMember?.role === MemberRole.ADMIN ||
    currentMember?.role === MemberRole.SUPER_ADMIN;

  if (isLoading || memberLoading) return <Loader />;
  if (!initialValues) return <PageError message="Project not found" />;
  if (!canManage) {
    return <PageError message="You do not have access to project settings." />;
  }

  return (
    <div className="w-full lg:max-w-xl">
      <EditProjectForm initialValues={initialValues} />
    </div>
  );
};
