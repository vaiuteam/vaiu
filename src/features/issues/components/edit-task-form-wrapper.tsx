import { ModalFormSkeleton } from "@/components/loading-skeletons";
import { Card } from "@/components/ui/card";
import { useGetTask } from "@/features/issues/api/use-get-task";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { EditTaskForm } from "./edit-task-form";

interface EditTaskFormWrapperProps {
  onCancel: () => void;
  id: string;
}

export const EditTaskFormWrapper = ({
  onCancel,
  id,
}: EditTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();

  const { data: initialValues, isLoading: taskLoading } = useGetTask({
    issueId: id,
  });

  const { data: projects, isLoading: loadingProjects } = useGetProjects({
    workspaceId: workspaceId,
  });

  const { data: members, isLoading: loadingMembers } = useGetMembers({
    workspaceId: workspaceId,
  });

  const projectOptions = projects?.documents.map((project) => ({
    id: project.$id,
    name: project.name,
    imageUrl: project.imageUrl,
  }));

  const memberOptions = members?.documents.map((project) => ({
    id: project.$id,
    name: project.name,
  }));

  const isLoading = loadingProjects || loadingMembers || taskLoading;

  if (isLoading) {
    return (
      <Card className="h-[714px] w-full border-none shadow-none">
        <ModalFormSkeleton caption="Loading issue draft" />
      </Card>
    );
  }
  if (!initialValues) return null;
  return (
    <EditTaskForm
      initialValues={initialValues}
      onCancel={onCancel}
      memberOptions={memberOptions ?? []}
      projectOptions={projectOptions ?? []}
    />
  );
};
