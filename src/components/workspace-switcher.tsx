"use client";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { WorkspaceAvatar } from "@/features/workspaces/components/workspace-avatar";
import { useSidebar } from "./ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";

export const WorkspaceSwitcher = () => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const { data: wokspaces } = useGetWorkspaces();

  const onSelect = (id: string) => {
    router.push(`/workspaces/${id}`);
  };

  const currentWorkspace = wokspaces?.documents.find(
    (workspace) => workspace.$id === workspaceId,
  );

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12"
              onClick={() => {
                if (currentWorkspace) {
                  onSelect(currentWorkspace.$id);
                }
              }}
            >
              <WorkspaceAvatar
                name={currentWorkspace?.name || "W"}
                image={currentWorkspace?.imageUrl}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            <p>{currentWorkspace?.name || "Select workspace"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex flex-col gap-y-2">
      <Select onValueChange={onSelect} value={workspaceId}>
        <SelectTrigger className="h-11 w-full rounded-2xl border-transparent bg-background/45 p-1 font-medium shadow-sm backdrop-blur-sm">
          <SelectValue placeholder="No workspace selected" />
        </SelectTrigger>
        <SelectContent className="">
          {wokspaces?.documents.map((workspace) => (
            <SelectItem
              value={workspace.$id}
              key={workspace.$id}
              className="rounded-xl py-2"
            >
              <div className="flex items-center justify-start gap-3 font-medium">
                <WorkspaceAvatar
                  name={workspace.name}
                  image={workspace.imageUrl}
                />
                <span className="truncate">{workspace.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
