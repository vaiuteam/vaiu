import { Github, Sparkles, User, Users } from "lucide-react";

import { cn } from "@/lib/utils";

type SourceVariant = "vaiu" | "github";
type WorkspaceVariant = "personal" | "organization";

const baseClasses =
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide";

const sourceVariantClasses: Record<SourceVariant, string> = {
  vaiu:
    "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-200",
  github:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-200",
};

const workspaceVariantClasses: Record<WorkspaceVariant, string> = {
  personal:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
  organization:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200",
};

interface SourceTypeBadgeProps {
  type?: SourceVariant | null;
  kind?: "issue" | "project";
  className?: string;
  showIcon?: boolean;
}

export const SourceTypeBadge = ({
  type,
  kind = "project",
  className,
  showIcon = true,
}: SourceTypeBadgeProps) => {
  const resolved: SourceVariant = type === "vaiu" ? "vaiu" : "github";
  const label =
    resolved === "vaiu"
      ? kind === "issue"
        ? "Vaiu issue"
        : "Vaiu project"
      : kind === "issue"
        ? "GitHub issue"
        : "GitHub project";

  const Icon = resolved === "vaiu" ? Sparkles : Github;

  return (
    <span className={cn(baseClasses, sourceVariantClasses[resolved], className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {label}
    </span>
  );
};

interface WorkspaceTypeBadgeProps {
  type?: WorkspaceVariant | null;
  className?: string;
  showIcon?: boolean;
}

export const WorkspaceTypeBadge = ({
  type,
  className,
  showIcon = true,
}: WorkspaceTypeBadgeProps) => {
  const resolved: WorkspaceVariant =
    type === "personal" ? "personal" : "organization";
  const label = resolved === "personal" ? "Personal" : "Organization";
  const Icon = resolved === "personal" ? User : Users;

  return (
    <span
      className={cn(baseClasses, workspaceVariantClasses[resolved], className)}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {label}
    </span>
  );
};
