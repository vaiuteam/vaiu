import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  title: string;
  value: number;
  variant: "up" | "down";
  increasedValue: number;
}

export const AnalyticsCard = ({
  increasedValue,
  title,
  value,
  variant,
}: AnalyticsCardProps) => {
  const iconColor = variant === "up" ? "text-emerald-500" : "text-red-500";
  const increaseValueColor =
    variant === "up" ? "text-emerald-500" : "text-red-500";
  const Icon = variant === "up" ? FaCaretUp : FaCaretDown;

  return (
    <Card className="w-full overflow-hidden border-none bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent),hsl(var(--card))] shadow-none dark:shadow-[0_22px_55px_-32px_rgba(15,23,42,0.75)]">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between gap-3">
          <CardDescription className="flex items-center gap-x-2 overflow-hidden font-medium">
            <span className="truncate text-sm uppercase tracking-[0.16em] text-muted-foreground">
              {title}
            </span>
          </CardDescription>
          <div className="flex items-center gap-x-1 rounded-full bg-background/45 px-2 py-1 backdrop-blur-sm">
            <Icon className={cn(iconColor, "size-4")} />
            <span
              className={cn(
                "truncate text-base font-medium",
                increaseValueColor,
              )}
            >
              {increasedValue}
            </span>
          </div>
        </div>
        <CardTitle className="text-3xl font-semibold tracking-tight">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
};
