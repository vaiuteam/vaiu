import React from "react";
import { useRouter } from "next/navigation";

import { Member } from "@/features/members/types";
import { Project } from "@/features/projects/types";
import { MemberAvatar } from "@/features/members/components/members-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { cn } from "@/lib/utils";

import { IssueStatus } from "../types";
interface EventCardProps {
  id: string;
  title: string;
  project: Project;
  status: IssueStatus;
  assignee?: Member | null;
}
const statusColorMap: Record<IssueStatus, string> = {
  [IssueStatus.BACKLOG]: "border-l-pink-500",
  [IssueStatus.TODO]: "border-l-red-500",
  [IssueStatus.DONE]: "border-l-emerald-500",
  [IssueStatus.IN_PROGRESS]: "border-l-yellow-500",
  [IssueStatus.IN_REVIEW]: "border-l-neutral-500",
};

export const EventCard = ({
  assignee,
  id,
  project,
  status,
  title,
}: EventCardProps) => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    router.push(`/workspaces/${workspaceId}/tasks/${id}`);
  };

  return (
    <div className="px-2">
      <div
        onClick={onClick}
        className={cn(
          "flex cursor-pointer flex-col gap-y-1.5 rounded-md border border-l-4 bg-white dark:bg-gray-900 p-1.5 text-xs text-primary transition hover:opacity-75",
          statusColorMap[status],
        )}
      >
        <p>{title}</p>
        <div className="flex items-center gap-x-1">
          <MemberAvatar name={assignee?.name ?? "Unassigned"} />
          <div className="dot" />
          <ProjectAvatar name={project?.name} image={project?.imageUrl} />
        </div>
      </div>
    </div>
  );
};
