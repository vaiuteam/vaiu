import { Card } from "@/components/ui/card";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { ModalFormSkeleton } from "@/components/loading-skeletons";
import { CreateTaskForm } from "./create-task-form";

interface CreateTaskFormWrapperProps {
  onCancel: () => void;
}

export const CreateTaskFormWrapper = ({
  onCancel,
}: CreateTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();
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
    projectType: project.projectType as "vaiu" | "github",
  }));
  const memberOptions = members?.documents.map((project) => ({
    id: project.$id,
    name: project.name,
  }));

  const isLoading = loadingProjects || loadingMembers;
  if (isLoading) {
    return (
      <Card className="h-[714px] w-full border-none shadow-none">
        <ModalFormSkeleton caption="Fetching projects and collaborators" />
      </Card>
    );
  }
  return (
    <CreateTaskForm
      onCancel={onCancel}
      memberOptions={memberOptions ?? []}
      projectOptions={projectOptions ?? []}
    />
  );
};
