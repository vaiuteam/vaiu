import {
  CircleDashedIcon,
  CircleDotDashedIcon,
  CircleIcon,
} from "lucide-react";

import { SourceTypeBadge } from "@/components/type-badge";
import { cn } from "@/lib/utils";

/** Forces dark dashboard styling inside landing-page cards */
function ProductPreview({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "dark h-full w-full bg-[hsl(224,47%,7%)] text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

function MiniAvatar({ name }: { name: string }) {
  return (
    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-muted text-[8px] font-semibold text-muted-foreground">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function MiniStatusBadge({
  status,
}: {
  status: "TODO" | "DONE" | "IN_PROGRESS";
}) {
  const styles = {
    TODO: "bg-rose-950 text-rose-300",
    DONE: "bg-emerald-950 text-emerald-300",
    IN_PROGRESS: "bg-yellow-950 text-yellow-300",
  };
  const labels = {
    TODO: "Todo",
    DONE: "Done",
    IN_PROGRESS: "In Progress",
  };

  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 text-[8px] font-semibold",
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  );
}

function MiniKanbanCard({
  title,
  issueType,
  assignee,
  dueLabel,
  dueTone = "neutral",
}: {
  title: string;
  issueType: "github" | "vaiu";
  assignee: string;
  dueLabel: string;
  dueTone?: "neutral" | "danger" | "success";
}) {
  const dueColors = {
    neutral: "text-muted-foreground",
    danger: "text-rose-400",
    success: "text-emerald-400",
  };

  return (
    <div className="rounded-md border border-border/60 bg-card p-2 shadow-sm">
      <p className="line-clamp-2 text-[9px] font-medium leading-snug text-foreground">
        {title}
      </p>
      <SourceTypeBadge
        type={issueType}
        kind="issue"
        showIcon={false}
        className="mt-1 scale-[0.85] origin-left px-1.5 py-0 text-[7px]"
      />
      <div className="mt-1.5 flex items-center justify-between gap-1 border-t border-border/40 pt-1.5">
        <div className="flex items-center gap-1">
          <MiniAvatar name={assignee} />
          <span className="text-[8px] text-muted-foreground">{assignee}</span>
        </div>
        <span className={cn("text-[8px]", dueColors[dueTone])}>{dueLabel}</span>
      </div>
    </div>
  );
}

function MiniKanbanColumn({
  label,
  count,
  icon,
  countClass,
  children,
  empty,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  countClass: string;
  children?: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-md border border-border/50 bg-muted/30">
      <div className="flex items-center gap-1 border-b border-border/40 px-2 py-1.5">
        {icon}
        <span className="truncate text-[8px] font-semibold text-foreground">
          {label}
        </span>
        <span
          className={cn(
            "ml-auto flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-1 text-[7px] font-semibold",
            countClass,
          )}
        >
          {count}
        </span>
      </div>
      <div className="space-y-1 p-1.5">
        {empty ? (
          <div className="flex h-10 items-center justify-center rounded border border-dashed border-muted-foreground/20 text-[7px] text-muted-foreground">
            No tasks
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function ViewSwitcher() {
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-border/50 bg-muted/20 p-0.5">
      {["Table", "Kanban", "Calendar"].map((view) => (
        <span
          key={view}
          className={cn(
            "rounded px-1.5 py-0.5 text-[7px] font-medium",
            view === "Kanban"
              ? "bg-foreground text-background"
              : "text-muted-foreground",
          )}
        >
          {view}
        </span>
      ))}
    </div>
  );
}

function MiniAnalytics({
  title,
  value,
  badge,
  tone,
}: {
  title: string;
  value: number;
  badge: string;
  tone: "total" | "assigned" | "completed";
}) {
  const strips = {
    total: "shadow-[inset_2px_0_0_0_rgba(56,189,248,0.35)]",
    assigned: "shadow-[inset_2px_0_0_0_rgba(167,139,250,0.32)]",
    completed: "shadow-[inset_2px_0_0_0_rgba(52,211,153,0.32)]",
  };
  const badgeText = {
    total: "text-sky-400/80",
    assigned: "text-violet-400/75",
    completed: "text-emerald-400/75",
  };

  return (
    <div
      className={cn(
        "flex-1 rounded-md border border-border/40 bg-card/80 px-2 py-1.5",
        strips[tone],
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="truncate text-[6px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <span
          className={cn(
            "rounded-full border border-border/50 bg-muted/35 px-1 py-0.5 text-[6px] font-medium",
            badgeText[tone],
          )}
        >
          {badge}
        </span>
      </div>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

/** Hackathon — Kanban board under time pressure */
export function HackathonVisual() {
  return (
    <ProductPreview className="flex flex-col p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold text-foreground">Sprint board</p>
          <p className="text-[8px] text-muted-foreground">NightOwl Hackathon</p>
        </div>
        <ViewSwitcher />
      </div>

      <div className="flex flex-1 gap-1.5">
        <MiniKanbanColumn
          label="Backlog"
          count={2}
          icon={<CircleDashedIcon className="size-2.5 text-pink-500" />}
          countClass="bg-pink-950 text-pink-300"
        >
          <MiniKanbanCard
            title="Brainstorm MVP features"
            issueType="vaiu"
            assignee="Kiran"
            dueLabel="May 30"
          />
        </MiniKanbanColumn>

        <MiniKanbanColumn
          label="Todo"
          count={3}
          icon={<CircleIcon className="size-2.5 text-rose-500" />}
          countClass="bg-rose-950 text-rose-300"
        >
          <MiniKanbanCard
            title="Build demo UI"
            issueType="github"
            assignee="Priya"
            dueLabel="May 31"
            dueTone="danger"
          />
        </MiniKanbanColumn>

        <MiniKanbanColumn
          label="In Progress"
          count={1}
          icon={<CircleDotDashedIcon className="size-2.5 text-yellow-500" />}
          countClass="bg-yellow-950 text-yellow-300"
        >
          <MiniKanbanCard
            title="Integrate AI API"
            issueType="github"
            assignee="Alex"
            dueLabel="May 30"
            dueTone="success"
          />
        </MiniKanbanColumn>
      </div>
    </ProductPreview>
  );
}

/** Schools — Issues table for student project teams */
export function SchoolsVisual() {
  const rows = [
    {
      name: "Research phase",
      type: "vaiu" as const,
      assignee: "Anya",
      due: "Jun 5",
      dueTone: "success" as const,
      status: "IN_PROGRESS" as const,
    },
    {
      name: "Prototype v1",
      type: "github" as const,
      assignee: "Sam",
      due: "Jun 8",
      dueTone: "neutral" as const,
      status: "TODO" as const,
    },
    {
      name: "Final presentation",
      type: "vaiu" as const,
      assignee: "Riya",
      due: "Jun 12",
      dueTone: "neutral" as const,
      status: "DONE" as const,
    },
  ];

  return (
    <ProductPreview className="flex flex-col p-3">
      <div className="mb-2">
        <p className="text-[10px] font-semibold text-foreground">Capstone Project</p>
        <p className="text-[8px] text-muted-foreground">Issues · Table view</p>
      </div>

      <div className="overflow-hidden rounded-md border border-border/50">
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-border/40 bg-muted/20 px-2 py-1">
          <span className="text-[7px] font-medium text-muted-foreground">Issue</span>
          <span className="text-[7px] font-medium text-muted-foreground">Due</span>
          <span className="text-[7px] font-medium text-muted-foreground">Status</span>
        </div>

        {rows.map((row) => (
          <div
            key={row.name}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-border/30 px-2 py-1.5 last:border-0"
          >
            <div className="min-w-0">
              <p className="truncate text-[8px] font-medium text-foreground">
                {row.name}
              </p>
              <SourceTypeBadge
                type={row.type}
                kind="issue"
                showIcon={false}
                className="mt-0.5 scale-[0.8] origin-left px-1 py-0 text-[6px]"
              />
            </div>
            <span
              className={cn(
                "text-[8px]",
                row.dueTone === "success"
                  ? "text-emerald-400"
                  : "text-muted-foreground",
              )}
            >
              {row.due}
            </span>
            <MiniStatusBadge status={row.status} />
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        {["A", "S", "R"].map((initial) => (
          <MiniAvatar key={initial} name={initial} />
        ))}
        <span className="text-[8px] text-muted-foreground">3 teammates active</span>
      </div>
    </ProductPreview>
  );
}

/** Cohorts — Workspace analytics + shared project */
export function CohortsVisual() {
  return (
    <ProductPreview className="flex flex-col p-3">
      <div className="mb-2">
        <p className="text-[10px] font-semibold text-foreground">Cohort Workspace</p>
        <p className="text-[8px] text-muted-foreground">Batch Spring &apos;25</p>
      </div>

      <div className="mb-2 flex gap-1">
        <MiniAnalytics title="Total Issues" value={35} badge="+5 this month" tone="total" />
        <MiniAnalytics title="Completed" value={14} badge="40%" tone="completed" />
        <MiniAnalytics title="Assigned" value={5} badge="14%" tone="assigned" />
      </div>

      <div className="rounded-md border border-border/50 bg-card/60 p-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold text-foreground">Startup Alpha</p>
            <SourceTypeBadge
              type="github"
              kind="project"
              showIcon={false}
              className="mt-1 scale-[0.85] origin-left px-1.5 py-0 text-[7px]"
            />
            <p className="mt-1 line-clamp-2 text-[7px] leading-snug text-muted-foreground">
              Issues, pull requests, docs, and collaboration in one place.
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1">
          {["K", "P", "A", "N"].map((initial) => (
            <MiniAvatar key={initial} name={initial} />
          ))}
          <span className="ml-1 text-[7px] text-muted-foreground">4 founders</span>
        </div>
      </div>
    </ProductPreview>
  );
}
