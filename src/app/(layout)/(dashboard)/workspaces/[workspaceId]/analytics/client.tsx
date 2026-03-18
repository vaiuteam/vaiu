"use client";

import { useState, useMemo } from "react";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { useGetIssues } from "@/features/issues/api/use-get-tasks";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { AnalyticsCard } from "@/components/analytics-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  CheckSquare,
  FolderKanban,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { IssueStatus } from "@/features/issues/types";
import { Member } from "@/features/members/types";

import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";

type TabId = "overview" | "tasks" | "projects" | "members";

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ElementType;
  description: string;
}

const TABS: TabConfig[] = [
  {
    id: "overview",
    label: "Overview",
    icon: Activity,
    description: "High-level summary of workspace performance."
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: CheckSquare,
    description: "Detailed analysis of issue tracking and completion."
  },
  {
    id: "projects",
    label: "Projects",
    icon: FolderKanban,
    description: "Project-level statistics and progress."
  },
  {
    id: "members",
    label: "Members",
    icon: Users,
    description: "Team composition and activity."
  },
];

export const WorkspaceAnalyticsClient = () => {
  const workspaceId = useWorkspaceId();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <AnalyticsOverview workspaceId={workspaceId} />;
      case "tasks":
        return <AnalyticsTasks workspaceId={workspaceId} />;
      case "projects":
        return <AnalyticsProjects workspaceId={workspaceId} />;
      case "members":
        return <AnalyticsMembers workspaceId={workspaceId} />;
      default:
        return null;
    }
  };

  const activeTabConfig = TABS.find(t => t.id === activeTab);

  return (
    <div className="flex flex-col h-full space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspace Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Insights and metrics for your workspace.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-full">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <Card className="h-full border-none shadow-none bg-transparent lg:bg-card lg:border lg:shadow-sm">
            <CardHeader className="hidden lg:block px-4 py-4">
              <CardTitle className="text-lg">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="p-0 lg:p-2">
              <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                {TABS.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "secondary" : "ghost"}
                    className={cn(
                      "justify-start gap-3 w-full",
                      activeTab === tab.id && "bg-secondary font-medium"
                    )}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </Button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">{activeTabConfig?.label}</h2>
            <p className="text-muted-foreground text-sm">{activeTabConfig?.description}</p>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

interface PopulatedMember extends Member {
  name: string;
  email: string;
}

const buildProjectTaskCounts = (
  issues: { projectId: string }[] | undefined,
): Record<string, number> => {
  if (!issues) return {};

  return issues.reduce<Record<string, number>>((counts, issue) => {
    counts[issue.projectId] = (counts[issue.projectId] || 0) + 1;
    return counts;
  }, {});
};

const buildMemberTaskCounts = (
  issues:
    | {
        assigneeId: string;
        status: IssueStatus;
      }[]
    | undefined,
): Record<string, { assigned: number; completed: number }> => {
  if (!issues) return {};

  return issues.reduce<Record<string, { assigned: number; completed: number }>>(
    (counts, issue) => {
      if (!issue.assigneeId) return counts;

      if (!counts[issue.assigneeId]) {
        counts[issue.assigneeId] = { assigned: 0, completed: 0 };
      }

      counts[issue.assigneeId].assigned += 1;

      if (issue.status === IssueStatus.DONE) {
        counts[issue.assigneeId].completed += 1;
      }

      return counts;
    },
    {},
  );
};

const AnalyticsOverview = ({ workspaceId }: { workspaceId: string }) => {
  const { data: analytics, isLoading: analyticsLoading } = useGetWorkspaceAnalytics({ workspaceId });
  const { data: projects, isLoading: projectsLoading } = useGetProjects({ workspaceId });
  const { data: members, isLoading: membersLoading } = useGetMembers({ workspaceId });
  const { data: issues, isLoading: issuesLoading } = useGetIssues({ workspaceId });

  const topProjects = useMemo(() => {
    if (!projects?.documents || !issues?.documents) return [];
    const taskCounts: Record<string, number> = {};
    issues.documents.forEach(i => {
      const pid = i.projectId;
      taskCounts[pid] = (taskCounts[pid] || 0) + 1;
    });
    return projects.documents
      .map(p => ({ ...p, taskCount: taskCounts[p.$id] || 0 }))
      .sort((a, b) => b.taskCount - a.taskCount)
      .slice(0, 5);
  }, [projects, issues]);

  const isLoading = analyticsLoading || projectsLoading || membersLoading || issuesLoading;

  if (isLoading) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="h-32 animate-pulse bg-muted" />
      ))}
    </div>;
  }

  if (!analytics) return <div>No data available</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnalyticsCard
          title="Total Projects"
          value={projects?.total || 0}
          variant="up"
          increasedValue={0}
        />
        <AnalyticsCard
          title="Total Members"
          value={members?.total || 0}
          variant="up"
          increasedValue={0}
        />
        <AnalyticsCard
          title="Total Tasks"
          value={analytics.totalTaskCount}
          variant={analytics.totalTaskCount > 0 ? "up" : "down"}
          increasedValue={analytics.totalTaskCount}
        />
        <AnalyticsCard
          title="Completed Tasks"
          value={analytics.completedTaskCount}
          variant={analytics.completeTaskDiff > 0 ? "up" : "down"}
          increasedValue={analytics.completeTaskDiff}
        />
        <AnalyticsCard
          title="Overdue Tasks"
          value={analytics.overdueTaskCount}
          variant={analytics.overdueTaskDiff > 0 ? "down" : "up"}
          increasedValue={analytics.overdueTaskDiff}
        />
        <AnalyticsCard
          title="Incomplete Tasks"
          value={analytics.incompleteTaskCount}
          variant={analytics.incompleteTaskDiff > 0 ? "down" : "up"}
          increasedValue={analytics.incompleteTaskDiff}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top Active Projects</CardTitle>
            <CardDescription>Projects with the most tasks.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProjects.map((project) => (
                <div key={project.$id} className="flex items-center justify-between">
                  <div className="flex items-center gap-x-3">
                    <ProjectAvatar
                      className="h-8 w-8"
                      name={project.name}
                      image={project.imageUrl}
                    />
                    <div>
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.taskCount} tasks</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                      View
                    </Link>
                  </Button>
                </div>
              ))}
              {topProjects.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No active projects found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- Tasks Analytics ---

const AnalyticsTasks = ({ workspaceId }: { workspaceId: string }) => {
  // Fetch all issues for the workspace
  const { data, isLoading } = useGetIssues({ workspaceId });

  const processedData = useMemo(() => {
    if (!data?.documents) return null;

    const statusCounts = {
      [IssueStatus.BACKLOG]: 0,
      [IssueStatus.TODO]: 0,
      [IssueStatus.IN_PROGRESS]: 0,
      [IssueStatus.IN_REVIEW]: 0,
      [IssueStatus.DONE]: 0,
    };

    data.documents.forEach((issue) => {
      if (issue.status in statusCounts)
        statusCounts[issue.status as IssueStatus]++;
    });

    const statusData = [
      { name: "Backlog", value: statusCounts.BACKLOG, fill: "hsl(var(--chart-5))" },
      { name: "To Do", value: statusCounts.TODO, fill: "hsl(var(--chart-4))" },
      { name: "In Progress", value: statusCounts.IN_PROGRESS, fill: "hsl(var(--chart-3))" },
      { name: "In Review", value: statusCounts.IN_REVIEW, fill: "hsl(var(--chart-2))" },
      { name: "Done", value: statusCounts.DONE, fill: "hsl(var(--chart-1))" },
    ].filter((item) => item.value > 0);

    const openIssues = data.documents.filter((i) => i.status !== IssueStatus.DONE);
    const doneIssues = data.documents.filter((i) => i.status === IssueStatus.DONE);

    return { statusData, openCount: openIssues.length, doneCount: doneIssues.length };
  }, [data]);

  if (isLoading) return <div className="h-64 animate-pulse bg-muted rounded-lg" />;
  if (!processedData) return <div>No task data available.</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Open Tasks</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{processedData.openCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Completed Tasks</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{processedData.doneCount}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Status Distribution</CardTitle>
          <CardDescription>Overview of task statuses across all projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={processedData.statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {processedData.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Projects Analytics ---

const AnalyticsProjects = ({ workspaceId }: { workspaceId: string }) => {
  const { data, isLoading } = useGetProjects({ workspaceId });

  const { data: issuesData } = useGetIssues({ workspaceId });

  const projectTaskCounts = useMemo(
    () => buildProjectTaskCounts(issuesData?.documents),
    [issuesData],
  );

  const projectStats = useMemo(() => {
    if (!data?.documents) return [];

    return data.documents.map(project => ({
      id: project.$id,
      name: project.name,
      tasks: projectTaskCounts[project.$id] || 0,
    })).sort((a, b) => b.tasks - a.tasks); // Sort by most tasks

  }, [data, projectTaskCounts]);

  if (isLoading) return <div className="h-64 animate-pulse bg-muted rounded-lg" />;
  if (!data?.documents.length) return <div>No projects found.</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tasks per Project</CardTitle>
          <CardDescription>Top 10 projects by task count.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              tasks: { label: "Tasks", color: "hsl(var(--primary))" },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectStats.slice(0, 10)}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="tasks"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="Tasks"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <ScrollArea className="h-[500px] rounded-md border p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.documents.map(project => (
            <Card key={project.$id}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Avatar className="h-8 w-8 rounded-md">
                  <AvatarImage src={project.imageUrl} />
                  <AvatarFallback className="rounded-md">{project.name[0]}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-base">{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {projectTaskCounts[project.$id] || 0} tasks
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

// --- Members Analytics ---

const AnalyticsMembers = ({ workspaceId }: { workspaceId: string }) => {
  const { data: members, isLoading: membersLoading } = useGetMembers({ workspaceId });
  const { data: issues, isLoading: issuesLoading } = useGetIssues({ workspaceId });

  const memberTaskCounts = useMemo(
    () => buildMemberTaskCounts(issues?.documents),
    [issues],
  );

  const memberStats = useMemo(() => {
    if (!members?.documents) return [];

    const stats = (members.documents as unknown as PopulatedMember[]).map(member => {
      const counts = memberTaskCounts[member.$id] || {
        assigned: 0,
        completed: 0,
      };

      return {
        name: member.name || member.email,
        role: member.role,
        assigned: counts.assigned,
        completed: counts.completed,
        userId: member.userId
      };
    });

    return stats.sort((a, b) => b.assigned - a.assigned);

  }, [memberTaskCounts, members]);

  if (membersLoading || issuesLoading) return <div className="h-64 animate-pulse bg-muted rounded-lg" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Member Workload</CardTitle>
          <CardDescription>Top 10 members by assigned tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              assigned: { label: "Assigned", color: "hsl(var(--chart-1))" },
              completed: { label: "Completed", color: "hsl(var(--chart-2))" },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberStats.slice(0, 10)}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="assigned" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Assigned" />
                <Bar dataKey="completed" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <ScrollArea className="h-[500px]">
          <div className="rounded-md border">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b sticky top-0 bg-background z-10">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Member</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Assigned</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Completed</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {memberStats.map((member, i) => (
                  <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{member.name}</td>
                    <td className="p-4 align-middle capitalize">{member.role.toLowerCase()}</td>
                    <td className="p-4 align-middle text-right">{member.assigned}</td>
                    <td className="p-4 align-middle text-right">{member.completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};
