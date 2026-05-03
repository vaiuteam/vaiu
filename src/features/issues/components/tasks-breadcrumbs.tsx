import { Project } from "@/features/projects/types";
import { Issue } from "../types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import Link from "next/link";
import { ChevronRight, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteTask } from "../api/use-delete-task";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { SourceTypeBadge } from "@/components/type-badge";

interface TasksBreadcrumbsProps {
  project: Project;
  issue: Issue;
}

export const TasksBreadcrumbs = ({ project, issue }: TasksBreadcrumbsProps) => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const { mutate, isPending } = useDeleteTask();
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Task",
    "Are you sure you want to delete this task?",
    "destructive",
  );

  const handleDeleteTask = async () => {
    const ok = await confirm();
    if (!ok) return;
    mutate(
      { param: { issueId: issue.$id } },
      {
        onSuccess: () => {
          router.push(`/workspaces/${workspaceId}/projects/${project.$id}`);
        },
      },
    );
  };

  return (
    <div className="flex items-center gap-x-2">
      <ConfirmDialog />
      <ProjectAvatar
        name={project.name}
        image={project.imageUrl}
        className="size-6 lg:size-8"
      />

      <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
        <p className="text-sm font-semibold text-muted-foreground transition hover:opacity-75 lg:text-lg">
          {project.name}
        </p>
      </Link>
      <SourceTypeBadge
        type={project.projectType}
        kind="project"
        showIcon={false}
      />
      <ChevronRight className="size-4 text-muted-foreground lg:size-5" />
      <p className="text-xs font-semibold lg:text-lg">{issue.name}</p>
      <SourceTypeBadge
        type={issue.issueType}
        kind="issue"
        showIcon={false}
      />
      <Button
        onClick={handleDeleteTask}
        variant="destructive"
        disabled={isPending}
        className="ml-auto"
        size="sm"
      >
        <Trash className="size-4 lg:mr-2" />
        <span className="hidden lg:block">Delete Task</span>
      </Button>
    </div>
  );
};
