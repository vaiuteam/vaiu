import {
  WorkspaceDashboardSkeleton,
  ProjectDashboardSkeleton,
  TaskDetailSkeleton,
  StandaloneFormSkeleton,
  type LoaderVariant,
} from "@/components/loading-skeletons";

export type { LoaderVariant };

/** Layout-aware skeleton placeholders for full-page suspense / query hydration. */
export function Loader({ variant = "workspace" }: { variant?: LoaderVariant }) {
  switch (variant) {
    case "project":
      return <ProjectDashboardSkeleton />;
    case "task":
      return <TaskDetailSkeleton />;
    case "standalone":
      return <StandaloneFormSkeleton />;
    default:
      return <WorkspaceDashboardSkeleton />;
  }
}
