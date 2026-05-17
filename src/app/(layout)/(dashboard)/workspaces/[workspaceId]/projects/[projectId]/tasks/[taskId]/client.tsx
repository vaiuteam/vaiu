"use client";

import { Loader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";

import { useGetTask } from "@/features/issues/api/use-get-task";
import { UseTaskId } from "@/features/issues/hooks/use-task-id";
import { Separator } from "@/components/ui/separator";
import { TaskOverview } from "@/features/issues/components/task-overview";
import { TaskDescription } from "@/features/issues/components/task-description";
import { TasksBreadcrumbs } from "@/features/issues/components/tasks-breadcrumbs";
import { TaskComments } from "@/features/issues/components/task-comments";

export const TaskIdClient = () => {
  const issueId = UseTaskId();
  const { data, isLoading } = useGetTask({ issueId });

  if (isLoading) return <Loader variant="task" />;

  if (!data) return <PageError />;

  return (
    <div className="flex flex-col">
      <TasksBreadcrumbs issue={data} project={data.project} />
      <Separator className="my-6" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TaskOverview issue={data} />
        <TaskDescription issue={data} />
      </div>
      <TaskComments issueId={issueId} />
    </div>
  );
};
