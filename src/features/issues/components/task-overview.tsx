import { Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { MemberAvatar } from "@/features/members/components/members-avatar";
import { useEditTaskModal } from "@/features/issues/hooks/use-update-task-modal";
import { snakeCaseToTitleCase } from "@/lib/utils";

import { TaskDate } from "./task-date";
import { Issue } from "../types";

interface TaskOverviewProps {
  issue: Issue;
}

export const TaskOverview = ({ issue }: TaskOverviewProps) => {
  const { open } = useEditTaskModal();
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm dark:bg-[hsl(var(--surface-elevated))]/60">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Details</h2>
        <Button
          onClick={() => open(issue.$id)}
          size="sm"
          variant="secondary"
          className="rounded-full"
        >
          <Pencil className="mr-2 size-3.5" />
          Edit
        </Button>
      </div>
      <Separator className="my-4 bg-border/55" />
      <div className="flex flex-col gap-y-4">
        <OverviewProperty label="Assignee">
          {issue.assignee ? (
            <>
              <MemberAvatar name={issue.assignee.name} className="size-6" />
              <p className="text-sm font-medium">{issue.assignee.name}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Unassigned</p>
          )}
        </OverviewProperty>
        <OverviewProperty label="Due date">
          <TaskDate value={issue.dueDate} className="text-sm font-medium" />
        </OverviewProperty>
        <OverviewProperty label="Status">
          <Badge variant={issue.status}>
            {snakeCaseToTitleCase(issue.status)}
          </Badge>
        </OverviewProperty>
      </div>
    </div>
  );
};

interface OverviewPropertiesProps {
  label: string;
  children: React.ReactNode;
}

const OverviewProperty = ({ children, label }: OverviewPropertiesProps) => {
  return (
    <div className="flex items-start gap-x-2">
      <div className="min-w-[100px]">
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <div className="flex items-center gap-x-2">{children}</div>
    </div>
  );
};
