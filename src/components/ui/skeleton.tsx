import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-gradient-to-r from-primary/[0.03] via-primary/[0.07] to-primary/[0.03] bg-[length:200%_100%] animate-skeleton-shimmer",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
