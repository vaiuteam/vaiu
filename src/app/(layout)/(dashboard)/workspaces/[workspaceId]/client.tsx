"use client";

import { CalendarIcon, PlusIcon, Github } from "lucide-react";
import Link from "next/link";
import { Issue } from "@/features/issues/types";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Analytics } from "@/components/analytics";
import { Project } from "@/features/projects/types";
import { PageError } from "@/components/page-error";
import { Loader } from "@/components/page-loader";
import { useGetIssues } from "@/features/issues/api/use-get-tasks";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useCreateTaskModal } from "@/features/issues/hooks/use-create-task-modal";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { Separator } from "@/components/ui/separator";

export const WorkspaceIdClient = () => {
  const workspaceId = useWorkspaceId();

  const { data: workspace } = useGetWorkspace({ workspaceId });
  const { data: analytics, isLoading: analyticsLoading } =
    useGetWorkspaceAnalytics({ workspaceId });
  const { data: tasks, isLoading: tasksLoading } = useGetIssues({
    workspaceId,
  });
  const { data: projects, isLoading: projectsLoading } = useGetProjects({
    workspaceId,
  });

  const isLoading = analyticsLoading || tasksLoading || projectsLoading;

  if (isLoading) return <Loader />;

  if (!analytics || !tasks || !projects)
    return <PageError message="Failed to load workspace data" />;

  const githubConnected = !!(workspace as { githubInstallationId?: string } | undefined)
    ?.githubInstallationId;

  return (
    <div className="flex h-full flex-col space-y-6">
      {!githubConnected && (
        <div className="flex items-center justify-between rounded-[28px] bg-blue-500/10 px-5 py-4 shadow-none backdrop-blur-sm dark:shadow-[0_20px_50px_-35px_rgba(59,130,246,0.8)]">
          <div className="flex items-center gap-3">
            <Github className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-blue-700 dark:text-blue-200">
              Connect GitHub to sync repos, issues &amp; PRs automatically
            </span>
          </div>
          <Button size="sm" asChild>
            <Link href={`/api/v1/workspaces/${workspaceId}/github/install`}>
              Connect GitHub
            </Link>
          </Button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track what needs attention across your workspace at a glance.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/workspaces/${workspaceId}/analytics`}>
            View Analytics
          </Link>
        </Button>
      </div>
      <Analytics data={analytics} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TaskList data={tasks.documents} total={tasks.total} />
        <ProjectList data={projects.documents} total={projects.total} />
      </div>
    </div>
  );
};

interface TaskListProps {
  data: Issue[];
  total: number;
}
export const TaskList = ({ data, total }: TaskListProps) => {
  const { open: createTask } = useCreateTaskModal();
  const workspaceId = useWorkspaceId();

  return (
    <div className="col-span-1 flex flex-col gap-y-4">
      <div className="rounded-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent),hsl(var(--surface))] p-5 shadow-none backdrop-blur-xl dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.75)]">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Issues ({total})</p>
          <Button variant="secondary" size="icon" onClick={createTask}>
            <PlusIcon className="size-4 text-muted-foreground" />
          </Button>
        </div>
        <Separator className="my-4 bg-gradient-to-r from-transparent via-border/70 to-transparent" />
        <ul className="flex flex-col divide-y divide-border/60">
          {data.map((issue) => (
            <li key={issue.$id}>
              <Link
                href={`/workspaces/${workspaceId}/projects/${issue.projectId}/tasks/${issue.$id}`}
                className="block rounded-2xl px-1 py-4 transition hover:bg-background/25"
              >
                <p className="truncate text-lg font-medium">{issue.name}</p>
                <div className="flex items-center gap-x-2">
                  <p>{issue.project?.name}</p>
                  <div className="dot" />
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="mr-1 size-3" />
                    <span className="truncate">
                      {formatDistanceToNow(new Date(issue.dueDate))}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
          <li className="hidden text-center text-sm text-muted-foreground first-of-type:block">
            No issues found
          </li>
        </ul>
        <Button
          variant="outline"
          className="mt-4 w-full rounded-2xl bg-background/50 transition-all duration-300 ease-in-out hover:bg-accent"
          asChild
        >
          <Link href={`/workspaces/${workspaceId}/tasks`}>Show All</Link>
        </Button>
      </div>
    </div>
  );
};

interface ProjectListProps {
  data: Project[];
  total: number;
}
export const ProjectList = ({ data, total }: ProjectListProps) => {
  const { open: createProject } = useCreateProjectModal();
  const workspaceId = useWorkspaceId();

  return (
    <div className="col-span-1 flex flex-col gap-y-4">
      <div className="rounded-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent),hsl(var(--surface))] p-5 shadow-none backdrop-blur-xl dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.75)]">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Projects ({total})</p>
          <Button variant="secondary" size="icon" onClick={createProject}>
            <PlusIcon className="size-4 text-muted-foreground" />
          </Button>
        </div>
        <Separator className="my-4 bg-gradient-to-r from-transparent via-border/70 to-transparent" />
        <ul className="grid grid-cols-1 gap-x-6 gap-y-0 lg:grid-cols-2">
          {data.map((project) => (
            <li key={project.$id} className="border-b border-border/60 py-4">
              <Link
                href={`/workspaces/${workspaceId}/projects/${project.$id}`}
                className="flex items-center gap-x-2.5 rounded-2xl px-1 py-1 transition hover:bg-background/25"
              >
                <ProjectAvatar
                  className="size-12"
                  fallbackClassName="text-lg"
                  name={project.name}
                  image={project.imageUrl}
                />
                <p className="truncate text-lg font-medium">
                  {project.name}
                </p>
              </Link>
            </li>
          ))}
          <li className="hidden text-center text-sm text-muted-foreground first-of-type:block">
            No projects found
          </li>
        </ul>
      </div>
    </div>
  );
};
