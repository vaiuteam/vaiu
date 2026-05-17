"use client";
import { useCallback } from "react";
import { useQueryState } from "nuqs";
import { Loader, PlusIcon, RefreshCw } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { useProjectId } from "@/features/projects/hooks/use-projectId";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { useTaskFilter } from "../hooks/use-task-filter";
import { useGetIssues } from "../api/use-get-tasks";
import { useFetchIssues } from "../api/use-fetch-issues";
import { DataFilters } from "./data-filters";
import { DataKanban } from "./data-kanban";
import { DataTable } from "./data-table";
import { columns } from "./columns";

import { IssueStatus } from "../types";
import { useBulkUpdateTasks } from "../api/use-bulk-update-tasks";
import { DataCalander } from "./data-calander";
import { Button } from "@/components/ui/button";

interface TaskViewSwitcherProps {
  hideProjectFilter?: boolean;
}

export const TaskViewSwitcher = ({
  hideProjectFilter,
}: TaskViewSwitcherProps) => {
  const [{ status, dueDate, assigneeId, projectId, search }] = useTaskFilter();

  const [view, setView] = useQueryState("task-view", {
    defaultValue: "table",
  });
  const { open } = useCreateTaskModal();
  const workspaceId = useWorkspaceId();
  const paramProjectId = useProjectId();
  const { data: routeProject } = useGetProject({
    projectId: paramProjectId ?? "",
    enabled: Boolean(paramProjectId),
  });
  const showGithubSync =
    Boolean(paramProjectId) &&
    routeProject != null &&
    routeProject.projectType !== "vaiu";
  const { mutate: bulkUpdate } = useBulkUpdateTasks();
  const { mutate: syncIssues, isPending: isSyncing } = useFetchIssues();

  const { data: tasks, isLoading: tasksLoading } = useGetIssues({
    workspaceId,
    assigneeId,
    projectId: paramProjectId || projectId,
    dueDate,
    status,
    search,
  });

  const handleSyncWithGitHub = () => {
    if (paramProjectId) {
      syncIssues({ json: { projectId: paramProjectId } });
    }
  };

  const onKanbanChange = useCallback(
    (
      issues: {
        $id: string;
        status: IssueStatus;
        position: number;
      }[],
    ) => {
      bulkUpdate({
        json: { issues },
      });
    },
    [bulkUpdate],
  );
  return (
    <Tabs
      defaultValue={view}
      onValueChange={setView}
      className="w-full flex-1 rounded-lg border"
    >
      <div className="flex h-full flex-col overflow-auto p-4">
        <div className="flex flex-col justify-between gap-y-2 lg:flex-row">
          <p className="ml-1 flex items-center text-center text-xl font-bold">
            Issues
          </p>
          <div className="flex items-center gap-2">
            {showGithubSync && (
              <Button
                size={"sm"}
                onClick={handleSyncWithGitHub}
                disabled={isSyncing}
                variant="outline"
                className="w-full lg:w-auto"
              >
                <RefreshCw className={`size-4 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing..." : "Sync with GitHub"}
              </Button>
            )}
            <Button
              size={"sm"}
              onClick={open}
              className="w-full bg-slate-200 text-black hover:bg-slate-400 lg:w-auto"
            >
              <PlusIcon className="size-4" />
              New
            </Button>
          </div>
        </div>
        <div className="mt-4 flex w-full flex-col items-center justify-start gap-2 lg:flex-row">
          <TabsList className="h-8 w-full overflow-hidden rounded-md border border-gray-200 bg-transparent p-0 dark:border-gray-400 lg:w-auto">
            <TabsTrigger
              className="h-8 w-full rounded-none bg-transparent px-3 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/15 data-[state=active]:bg-slate-200 data-[state=active]:text-[#1e1e1e] dark:bg-transparent dark:text-gray-200 dark:focus-visible:outline-white/20 dark:data-[state=active]:bg-slate-200 dark:data-[state=active]:text-[#1e1e1e] lg:w-auto"
              value="table"
            >
              Table
            </TabsTrigger>
          </TabsList>
          <TabsList className="h-8 w-full overflow-hidden rounded-md border border-gray-200 bg-transparent p-0 dark:border-gray-400 lg:w-auto">
            <TabsTrigger
              className="h-8 w-full rounded-none bg-transparent px-3 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/15 data-[state=active]:bg-slate-200 data-[state=active]:text-[#1e1e1e] dark:bg-transparent dark:text-gray-200 dark:focus-visible:outline-white/20 dark:data-[state=active]:bg-slate-200 dark:data-[state=active]:text-[#1e1e1e] lg:w-auto"
              value="kanban"
            >
              Kanban
            </TabsTrigger>
          </TabsList>
          <TabsList className="h-8 w-full overflow-hidden rounded-md border border-gray-200 bg-transparent p-0 dark:border-gray-400 lg:w-auto">
            <TabsTrigger
              className="h-8 w-full rounded-none bg-transparent px-3 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/15 data-[state=active]:bg-slate-200 data-[state=active]:text-[#1e1e1e] dark:bg-transparent dark:text-gray-200 dark:focus-visible:outline-white/20 dark:data-[state=active]:bg-slate-200 dark:data-[state=active]:text-[#1e1e1e] lg:w-auto"
              value="calendar"
            >
              Calendar
            </TabsTrigger>
          </TabsList>
        </div>
        <Separator className="my-4" />
        <DataFilters hideProjectFilter={hideProjectFilter} />
        <Separator className="my-4" />
        {tasksLoading ? (
          <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-lg border">
            <Loader className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <TabsContent value="table" className="mt-0">
              <DataTable columns={columns} data={tasks?.documents ?? []} />
            </TabsContent>
            <TabsContent value="kanban" className="mt-0">
              <DataKanban
                onChange={onKanbanChange}
                data={tasks?.documents ?? []}
              />
            </TabsContent>
            <TabsContent value="calendar" className="mt-0 h-full pb-4">
              <DataCalander data={tasks?.documents ?? []} />
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};
