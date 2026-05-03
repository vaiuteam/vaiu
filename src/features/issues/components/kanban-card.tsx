import { MoreHorizontalIcon } from "lucide-react";
import { Issue } from "../types";
import { TaskActions } from "./task-actions";
import { Separator } from "@/components/ui/separator";
import { MemberAvatar } from "@/features/members/components/members-avatar";
import { TaskDate } from "./task-date";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { SourceTypeBadge } from "@/components/type-badge";

interface KanbanCardProps {
  issue: Issue;
  isDragging?: boolean;
}

export const KanbanCard = ({ issue, isDragging }: KanbanCardProps) => {
  return (
    <div
      className={`group cursor-grab space-y-2.5 rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md active:cursor-grabbing ${
        isDragging ? "rotate-2 scale-105 shadow-lg" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-x-2">
        <div className="flex flex-col gap-1">
          <p className="line-clamp-2 text-sm font-medium leading-snug">
            {issue.name}
          </p>
          <SourceTypeBadge
            type={issue.issueType}
            kind="issue"
            showIcon={false}
            className="self-start"
          />
        </div>
        <TaskActions id={issue.$id} projectId={issue.projectId}>
          <MoreHorizontalIcon className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </TaskActions>
      </div>
      <Separator className="my-2" />
      <div className="flex items-center justify-between gap-x-2">
        <div className="flex items-center gap-x-1.5">
          <MemberAvatar
            name={issue?.assignee?.name || "Unassigned"}
            fallbackClassName="text-[10px]"
          />
          <span className="text-xs text-muted-foreground">
            {issue?.assignee?.name?.split(" ")[0] || "Unassigned"}
          </span>
        </div>
        <TaskDate value={issue.dueDate} className="text-xs" />
      </div>
      <div className="flex items-center gap-x-1.5">
        <ProjectAvatar
          name={issue.project.name}
          image={issue.project.imageUrl}
          fallbackClassName="text-[10px]"
        />
        <span className="truncate text-xs font-medium text-muted-foreground">
          {issue.project.name}
        </span>
      </div>
    </div>
  );
};
