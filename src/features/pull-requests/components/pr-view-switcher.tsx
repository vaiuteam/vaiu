"use client";
import { useQueryState } from "nuqs";
import { PlusIcon } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-projectId";
import { useGetPullRequests } from "../api/use-get-pull-requests";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { useCreatePrModal } from "../hooks/use-create-pr-modal";
import { IssuesPrBoardSkeleton } from "@/components/loading-skeletons";
import { usePrFilter } from "../hooks/use-pr-filter";
import { toast } from "sonner";
import { PrDataFilters } from "./pr-data-filters";

export const PrViewSwitcher = () => {
  const [{ status, search }] = usePrFilter();

  const [view, setView] = useQueryState("pr-view", {
    defaultValue: "table",
  });
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();

  const { openPr } = useCreatePrModal();

  const { data: prs, isLoading: prsLoading } = useGetPullRequests({
    workspaceId,
    projectId,
    status,
    search,
  });

  const handleCreatePr = async () => {
    try {
      await openPr();
    } catch (error) {
      console.error("Error creating pull request:", error);
      toast.error(
        typeof error === "string"
          ? error
          : "You have to push to the specified branch first.",
      );
    }
  };

  return (
    <Tabs
      defaultValue={view}
      onValueChange={setView}
      className="w-full flex-1 rounded-lg border"
    >
      <div className="flex h-full flex-col overflow-auto p-4">
        <div className="flex flex-col justify-between gap-y-2 lg:flex-row">
          <p className="flex items-center text-center text-xl font-bold">
            Pull Requests
          </p>
          <div className="flex items-center space-x-4">
            <Button
              size={"sm"}
              onClick={handleCreatePr}
              className="w-full bg-slate-200 text-black hover:bg-slate-400 lg:w-auto"
            >
              <PlusIcon className="size-4" />
              New
            </Button>
          </div>
        </div>
        <div className="mt-4 flex w-full items-center justify-start gap-y-2 lg:flex-row">
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger
              className="h-8 w-full bg-slate-200 dark:bg-gray-800 dark:text-gray-200 dark:data-[state=active]:bg-slate-200 dark:data-[state=active]:text-[#1e1e1e] lg:w-auto"
              value="table"
            >
              Table
            </TabsTrigger>
          </TabsList>
        </div>
        <Separator className="my-4" />
        <PrDataFilters />
        <Separator className="my-4" />
        {prsLoading ? (
          <IssuesPrBoardSkeleton rows={5} />
        ) : (
          <>
            <TabsContent value="table" className="mt-0">
              <DataTable columns={columns} data={prs?.documents ?? []} />
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};
