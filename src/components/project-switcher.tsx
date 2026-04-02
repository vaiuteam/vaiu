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
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useProjectId } from "@/features/projects/hooks/use-projectId";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Project } from "@/features/projects/types";
import { cn } from "@/lib/utils";
import { useSidebar } from "./ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";

export const ProjectSwitcher = () => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const projectId = useProjectId();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { data: projects } = useGetProjects({ workspaceId });

  const onSelect = (id: string) => {
    router.push(`/workspaces/${workspaceId}/projects/${id}`);
  };

  const currentProject =
    projects &&
      typeof projects === "object" &&
      "documents" in projects &&
      Array.isArray(projects.documents)
      ? projects.documents.find((p: Project) => p.$id === projectId)
      : null;

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
                if (currentProject) {
                  onSelect(currentProject.$id);
                }
              }}
            >
              <ProjectAvatar
                name={currentProject?.name || "P"}
                image={currentProject?.imageUrl}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            <p className="capitalize">
              {currentProject?.name || "Select project"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex flex-col gap-y-2">
      <Select onValueChange={onSelect} value={projectId}>
        <SelectTrigger className="h-11 w-full rounded-2xl border-transparent bg-background/45 p-1 pl-3 font-medium shadow-sm backdrop-blur-sm">
          <SelectValue placeholder="Select a project" className="font-bold" />
        </SelectTrigger>
        <SelectContent position="popper" className="">
          {projects && projects?.total > 0 ? (
            typeof projects === "object" &&
            "documents" in projects &&
            Array.isArray(projects.documents) &&
            projects.documents.map((project: Project) => (
              <SelectItem
                className={cn(
                  "m-0.5 rounded-xl py-2 hover:bg-accent",
                  projectId === project.$id && "bg-accent",
                )}
                value={project.$id}
                key={project.$id}
              >
                <div className="flex items-center justify-start gap-3 font-medium">
                  <ProjectAvatar name={project.name} image={project.imageUrl} />
                  <span className="truncate capitalize">{project.name}</span>
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="flex pl-3 pb-2 font-sm">
              No projects
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
