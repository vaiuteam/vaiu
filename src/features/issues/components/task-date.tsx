import { cn } from "@/lib/utils";
import {
  differenceInCalendarDays,
  format,
  isValid,
  startOfDay,
} from "date-fns";
import { CalendarIcon } from "lucide-react";

interface TaskDateProps {
  value: string;
  className?: string;
}

/**
 * Uses only UI tokens from globals.css (`destructive`, `primary`, chart scale, `foreground`, `muted-foreground`).
 * Relative to **today** at local midnight via `differenceInCalendarDays`.
 */
function textTone(diffDays: number): string {
  if (diffDays < 0) {
    const overdue = -diffDays;
    return overdue >= 14
      ? "font-semibold text-destructive"
      : "text-destructive";
  }

  if (diffDays === 0) {
    return "font-bold text-primary";
  }

  /** Due within the next calendar week (1–7 days after today): theme chart accent (consistent with dashboards). */
  if (diffDays <= 7) {
    return "text-chart-2";
  }

  if (diffDays <= 120) {
    return "text-foreground";
  }

  return "text-muted-foreground";
}

function statusHint(diffDays: number): string {
  if (diffDays < 0)
    return `${-diffDays} calendar day${(-diffDays) === 1 ? "" : "s"} overdue`;
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays <= 7) return `Due in ${diffDays} days (within the next week)`;
  if (diffDays <= 120) return `Due in ${diffDays} days`;
  return "Due far ahead";
}

export const TaskDate = ({ value, className }: TaskDateProps) => {
  const parsed = new Date(value);

  if (!isValid(parsed)) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>—</span>
    );
  }

  const today = startOfDay(new Date());
  const dueDay = startOfDay(parsed);
  const diffDays = differenceInCalendarDays(dueDay, today);
  const tone = textTone(diffDays);

  const showYear = dueDay.getFullYear() !== today.getFullYear();
  const label = showYear ? format(dueDay, "MMM d, yy") : format(dueDay, "MMM d");

  return (
    <div
      title={statusHint(diffDays)}
      className={cn(
        "inline-flex max-w-[10.5rem] shrink-0 items-center gap-1.5 tabular-nums",
        "text-[11px] font-semibold leading-none tracking-tight text-foreground",
        className,
        tone,
      )}
    >
      <CalendarIcon className="size-3 shrink-0 opacity-90" aria-hidden />
      <span className="min-w-0 truncate">{label}</span>
    </div>
  );
};
