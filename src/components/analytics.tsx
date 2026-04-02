import { ProjectAnalyticsResponseType } from "@/features/projects/api/use-get-project-analytics";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { AnalyticsCard } from "./analytics-card";

export const Analytics = ({ data }: ProjectAnalyticsResponseType) => {
  if (!data) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }
  return (
    <ScrollArea className="w-full shrink-0 whitespace-nowrap rounded-3xl">
      <div className="flex w-full flex-row space-x-4 pb-1">
        <div className="flex flex-1 items-center">
          <AnalyticsCard
            title="Total Issues"
            value={data.totalTaskCount}
            variant={data.taskDiff > 0 ? "up" : "down"}
            increasedValue={data.taskDiff}
          />
        </div>
        <div className="flex flex-1 items-center">
          <AnalyticsCard
            title="Assigned Issues"
            value={data.assignedTaskCount}
            variant={data.assignedTaskDiff > 0 ? "up" : "down"}
            increasedValue={data.assignedTaskDiff}
          />
        </div>
        <div className="flex flex-1 items-center">
          <AnalyticsCard
            title="Completed Issues"
            value={data.completedTaskCount}
            variant={data.completeTaskDiff > 0 ? "up" : "down"}
            increasedValue={data.completeTaskDiff}
          />
        </div>
        <div className="flex flex-1 items-center">
          <AnalyticsCard
            title="OverDue Issues"
            value={data.overdueTaskCount}
            variant={data.overdueTaskDiff > 0 ? "up" : "down"}
            increasedValue={data.overdueTaskDiff}
          />
        </div>
        <div className="flex flex-1 items-center">
          <AnalyticsCard
            title="Incomplete Issues"
            value={data.incompleteTaskCount}
            variant={data.incompleteTaskDiff > 0 ? "up" : "down"}
            increasedValue={data.incompleteTaskDiff}
          />
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
