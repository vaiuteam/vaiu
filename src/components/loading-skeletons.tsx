import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type LoaderVariant = "workspace" | "project" | "task" | "standalone";

function CookingDots() {
  return (
    <span className="inline-flex gap-1 pl-1 align-middle" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block size-1 rounded-full bg-primary/35 motion-safe:animate-cook dark:bg-primary/45"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </span>
  );
}

export function LoadingCaption({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-1 text-center text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground/75",
        className,
      )}
    >
      {children}
      <CookingDots />
    </p>
  );
}

function AnalyticsStripSkeleton() {
  const n = 5;
  return (
    <div
      className="grid grid-cols-2 gap-3 pb-1 sm:grid-cols-3 lg:grid-cols-5"
      aria-hidden="true"
    >
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          className="flex min-h-0 flex-col rounded-xl border border-border/35 bg-card/35 p-3 backdrop-blur-sm dark:bg-card/25"
        >
          <Skeleton className="h-2.5 w-[min(72%,8rem)] rounded-full opacity-75" />
          <Skeleton className="mt-2.5 h-7 w-[min(52%,5rem)] rounded-md" />
        </div>
      ))}
    </div>
  );
}

function ListPanelSkeleton({ dense }: { dense?: boolean }) {
  const rows = 5;
  /** Same anatomy in both columns: thumb + primary + secondary lines (Issues & Projects parity). */
  return (
    <div className="rounded-[26px] border border-border/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent),hsl(var(--surface))] p-4 shadow-none backdrop-blur-xl dark:border-border/45 dark:bg-card/15 dark:shadow-none">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className={cn("rounded-lg", dense ? "h-5 w-28" : "h-6 w-[8.75rem]")} />
        <Skeleton className="size-9 rounded-lg opacity-95" />
      </div>
      <div className="my-3 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      <ul className="flex flex-col divide-y divide-border/40">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="flex items-start gap-3 py-3.5 first:pt-2">
            <Skeleton
              className={cn(
                "size-10 shrink-0 rounded-xl",
                dense && "opacity-95",
              )}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton
                className={cn(
                  "rounded-md",
                  dense ? "h-3.5 w-[92%]" : "h-4 w-[94%]",
                )}
              />
              <Skeleton
                className="h-3 max-w-[12rem] rounded-full opacity-[0.82]"
              />
            </div>
          </li>
        ))}
      </ul>
      <Skeleton className="mx-auto mt-3 h-9 w-[min(100%,20rem)] rounded-lg opacity-95" />
    </div>
  );
}

export function WorkspaceDashboardSkeleton({
  caption = "Fetching your workspace",
}: {
  caption?: string;
}) {
  return (
    <div className="flex min-h-[50vh] w-full animate-in fade-in-0 duration-300 flex-col gap-5 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2.5">
          <Skeleton className="h-10 w-[min(15rem,70vw)] max-w-xl rounded-lg" />
          <Skeleton className="h-[0.9375rem] w-[min(22rem,90vw)] max-w-xl rounded-md opacity-90" />
        </div>
        <Skeleton className="h-9 w-[min(9rem,40vw)] shrink-0 rounded-lg" />
      </div>

      <AnalyticsStripSkeleton />

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <ListPanelSkeleton />
        <ListPanelSkeleton dense />
      </div>

      <LoadingCaption>{caption}</LoadingCaption>
    </div>
  );
}

/** Skeleton for pages where the Navbar already conveys context (dashboard shell). */
export function DashboardSegmentSkeleton({
  caption = "Refreshing dashboard",
}: {
  caption?: string;
}) {
  return (
    <div className="flex min-h-[40vh] w-full animate-in fade-in-0 duration-300 flex-col gap-5 pb-12">
      <AnalyticsStripSkeleton />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ListPanelSkeleton />
        <ListPanelSkeleton dense />
      </div>
      <LoadingCaption>{caption}</LoadingCaption>
    </div>
  );
}

export function ProjectDashboardSkeleton({
  caption = "Loading project workspace",
}: {
  caption?: string;
}) {
  return (
    <div className="flex min-h-[50vh] w-full animate-in fade-in-0 duration-300 flex-col gap-6 pb-12">
      <div className="flex flex-col justify-between gap-4 rounded-[30px] border border-border/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent),hsl(var(--surface))] p-5 backdrop-blur-xl dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.75)] md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <Skeleton className="size-14 shrink-0 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48 max-w-[70vw] rounded-lg" />
            <Skeleton className="h-3 w-72 max-w-full rounded-full opacity-75" />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex -space-x-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="size-9 shrink-0 rounded-full ring-2 ring-background"
              />
            ))}
          </div>
          <Skeleton className="h-10 min-w-[7rem] rounded-2xl" />
        </div>
      </div>

      <AnalyticsStripSkeleton />

      <div className="space-y-3">
        <Skeleton className="h-11 w-full max-w-xl rounded-2xl" />
        <IssuesPrBoardSkeleton rows={7} />
      </div>

      <div className="rounded-xl border border-border/40 bg-card/30">
        <div className="flex flex-row items-center justify-between border-b border-border/40 p-5">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
        <div className="space-y-3 p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(
                "h-4 rounded-full",
                i % 2 ? "w-[92%]" : "w-full",
              )}
            />
          ))}
        </div>
      </div>

      <LoadingCaption>{caption}</LoadingCaption>
    </div>
  );
}

export function TaskDetailSkeleton({
  caption = "Pulling issue context",
}: {
  caption?: string;
}) {
  return (
    <article className="flex w-full flex-col gap-4 pb-8">
      <nav className="flex flex-wrap items-center gap-2" aria-label="Breadcrumb skeleton">
        <Skeleton className="h-6 w-20" />
        <span className="text-muted-foreground/35">/</span>
        <Skeleton className="h-6 w-24" />
        <span className="text-muted-foreground/35">/</span>
        <Skeleton className="h-6 w-40 max-w-[min(360px,80vw)]" />
      </nav>
      <Skeleton className="h-28 w-full max-w-2xl rounded-lg" />
      <div className="h-px w-full bg-border/60" />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {[0, 1].map((col) => (
          <section
            key={col}
            className="rounded-lg border border-border/50 p-4"
          >
            <Skeleton className="mb-4 h-4 w-28" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between gap-3">
                  <Skeleton className="h-3 w-[30%]" />
                  <Skeleton className="h-3 flex-1" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <section className="rounded-lg border border-border/50 p-4">
        <Skeleton className="mb-3 h-4 w-28" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <Skeleton className="h-14 flex-1 rounded-md" />
            </div>
          ))}
        </div>
      </section>
      <LoadingCaption>{caption}</LoadingCaption>
    </article>
  );
}

export function StandaloneFormSkeleton({
  caption = "Preparing workspace settings",
  narrow,
}: {
  caption?: string;
  narrow?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 py-3",
        narrow ? "max-w-lg" : "max-w-xl",
      )}
    >
      <div className="flex flex-col gap-4 rounded-lg border border-border/50 p-5">
        <div className="space-y-2">
          <Skeleton className="h-9 max-w-xs" />
          <Skeleton className="h-3 w-44" />
        </div>
        <div className="h-px bg-border/50" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
      <LoadingCaption>{caption}</LoadingCaption>
    </div>
  );
}

export function IssuesPrBoardSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="flex min-h-[280px] w-full flex-col gap-4 rounded-lg border border-border/50 bg-muted/15 p-4 dark:bg-muted/10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
        <Skeleton className="h-8 w-[min(260px,50%)] rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-[4.75rem]" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 md:justify-start">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-8 flex-1 rounded-md md:flex-none md:min-w-[5.75rem]"
          />
        ))}
      </div>
      <div className="my-3 h-px bg-border/50" />
      <IssueFiltersSkeleton />
      <div className="my-3 h-px bg-border/50" />
      <div className="grid grid-cols-12 gap-2 border-b border-border/40 pb-2">
        <Skeleton className="col-span-4 h-4 rounded-full opacity-60" />
        <Skeleton className="col-span-2 h-4 rounded-full opacity-60" />
        <Skeleton className="col-span-2 h-4 rounded-full opacity-60" />
        <Skeleton className="col-span-2 h-4 rounded-full opacity-60" />
        <Skeleton className="col-span-2 h-4 rounded-full opacity-60" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-12 items-center gap-2 rounded-lg px-2 py-2"
          >
            <Skeleton className="col-span-4 h-5" />
            <Skeleton className="col-span-2 h-6 w-full rounded-full" />
            <Skeleton className="col-span-2 h-4 rounded-full opacity-85" />
            <Skeleton className="col-span-2 h-4 rounded-full opacity-85" />
            <Skeleton className="col-span-2 h-4 rounded-full opacity-85" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function IssueFiltersSkeleton() {
  return (
    <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:gap-2">
      <Skeleton className="h-8 flex-1 rounded-md lg:max-w-xs" />
      <Skeleton className="h-8 w-full rounded-md lg:w-36 lg:max-w-none" />
      <Skeleton className="h-8 w-full rounded-md lg:w-36 lg:max-w-none" />
      <Skeleton className="h-8 w-full rounded-md lg:w-36 lg:max-w-none" />
      <Skeleton className="h-8 w-full rounded-md lg:w-36 lg:flex-none lg:max-w-none" />
    </div>
  );
}

export function BillingPageSkeleton() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-5 px-4 py-6">
      <Skeleton className="h-8 w-36" />
      <header className="space-y-2">
        <Skeleton className="h-9 max-w-xs" />
        <Skeleton className="h-3 max-w-xl" />
      </header>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border/50 p-5">
            <Skeleton className="mb-4 h-5 w-36" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-6 h-10 w-full rounded-md md:w-44" />
          </div>
        ))}
      </div>
      <LoadingCaption>Fetching billing snapshot</LoadingCaption>
    </div>
  );
}

export function PricingFlowSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="container mx-auto flex min-h-[260px] flex-col gap-4 py-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-lg border border-border/50 p-5"
          >
            <Skeleton className="mx-auto size-11 rounded-lg" />
            <Skeleton className="mx-auto h-5 w-28" />
            <Skeleton className="mx-auto h-8 w-20 rounded-full" />
            <div className="space-y-2 border-t border-border/40 pt-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="mx-auto h-3 w-[88%]" />
              ))}
            </div>
            <Skeleton className="mt-auto h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
      <LoadingCaption>Checking subscription status</LoadingCaption>
    </div>
  );
}

export function AuthCardSkeleton({
  caption = "Authenticating securely",
}: {
  caption?: string;
}) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4 py-8">
      <div className="w-full rounded-lg border border-border/50 p-6">
        <Skeleton className="mx-auto mb-6 h-8 w-32" />
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-11 w-full rounded-md" />
            </div>
          ))}
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
        <Skeleton className="mx-auto mt-6 h-3 max-w-[14rem]" />
      </div>
      <LoadingCaption>{caption}</LoadingCaption>
    </div>
  );
}

export function LayoutOutletSkeleton({
  inset = "default",
}: {
  inset?: "default" | "tight";
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-5",
        inset === "tight" ? "pb-12 pt-4" : "pb-16 pt-6",
      )}
    >
      <Skeleton
        className={cn("w-full rounded-lg", inset === "tight" ? "h-10" : "h-11")}
      />
      <WorkspaceDashboardSkeleton caption="Refreshing your cockpit" />
    </div>
  );
}

/** Docs: nav indentation suggests hierarchy */
export function DocsLoadingSkeleton() {
  const navWidths = ["w-[92%]", "w-[76%]", "w-[82%]", "w-[56%]", "w-[72%]"];
  const bodyWidths = ["w-full", "w-[96%]", "w-full", "w-[94%]", "w-[88%]", "w-full"];
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="flex flex-1 gap-8">
        <aside className="hidden w-52 shrink-0 flex-col gap-2 lg:flex" aria-hidden="true">
          {navWidths.map((w, i) => (
            <Skeleton
              key={i}
              className={cn("h-3", w, i === 3 ? "ml-3" : i === 4 ? "ml-3" : "")}
            />
          ))}
        </aside>
        <div className="min-w-0 flex-1 space-y-4">
          <Skeleton className="h-10 max-w-[min(420px,100%)]" />
          <div className="space-y-2.5">
            {bodyWidths.map((w, i) => (
              <Skeleton key={i} className={cn("h-4", w)} />
            ))}
          </div>
        </div>
      </div>
      <LoadingCaption>Gathering documentation pages</LoadingCaption>
      <p className="sr-only">Documentation is loading.</p>
    </div>
  );
}

export function ProfileGithubAnalyticsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-6">
      <Skeleton className="h-9 max-w-xs" />
      <div className="rounded-lg border border-border/50 bg-muted/20 p-5 dark:bg-muted/10">
        <div className="flex flex-wrap items-start gap-4">
          <Skeleton className="size-20 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-3 py-0.5">
            <Skeleton className="h-8 max-w-sm" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 max-w-xl" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border/50 p-4">
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="mt-2 h-2 w-[55%]" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-lg border border-border/50 p-4">
            <Skeleton className="mb-5 h-5 w-44" />
            <div className="space-y-5">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-6 w-[60%]" />
                  <Skeleton className="h-2 w-full max-w-none rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <LoadingCaption>Loading GitHub activity</LoadingCaption>
    </div>
  );
}

export function WorkspaceAnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border/50 p-3">
            <Skeleton className="mb-2 h-2 w-[60%]" />
            <Skeleton className="h-8 w-14" />
            <Skeleton className="mt-2 h-2 w-[38%]" />
          </div>
        ))}
        <div className="rounded-lg border border-border/50 p-3 sm:col-span-2 lg:col-span-4">
          <Skeleton className="mb-3 h-2 w-[32%]" />
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex min-w-[10rem] flex-1 items-center gap-2">
                <Skeleton className="size-9 rounded-md" />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3 w-[52%]" />
                  <Skeleton className="h-2 w-[36%]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-border/40 p-4 lg:grid-cols-[1fr,minmax(220px,0.38fr)]">
        <Skeleton className="min-h-[220px] w-full rounded-md lg:min-h-[280px]" />
        <div className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-md" />
          ))}
        </div>
      </div>

      <LoadingCaption>Computing workspace charts</LoadingCaption>
    </div>
  );
}

export function ModalFormSkeleton({
  caption = "Resolving lookups",
}: {
  caption?: string;
}) {
  return (
    <div className="flex min-h-[min(340px,52vh)] w-full flex-col justify-between gap-4 p-5">
      <div className="flex-1 space-y-4 pt-1">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[min(200px,60%)]" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-[4.75rem] w-full rounded-md" />
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-border/40 pt-3">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
      <LoadingCaption className="mt-2">{caption}</LoadingCaption>
    </div>
  );
}

export function WorkspaceAnalyticsTabSkeleton({
  showCaption = true,
}: {
  showCaption?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border/35 p-3">
            <Skeleton className="mb-3 h-2 w-1/2" />
            <Skeleton className="h-14 w-full" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border/40 p-4">
        <Skeleton className="mb-4 h-3 max-w-[12rem]" />
        <Skeleton className="h-[200px] w-full rounded-md md:h-[240px]" />
      </div>
      {showCaption ? (
        <LoadingCaption>Aggregating telemetry</LoadingCaption>
      ) : null}
    </div>
  );
}

export function WorkspaceAnalyticsMembersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/40 p-4">
        <Skeleton className="mb-4 h-3 max-w-[12rem]" />
        <Skeleton className="h-[200px] w-full rounded-md" />
      </div>
      <div className="rounded-lg border border-border/40 p-4">
        <Skeleton className="mb-3 h-3 w-36" />
        <Skeleton className="h-[240px] w-full rounded-md" />
      </div>
      <LoadingCaption>Mapping collaboration insights</LoadingCaption>
    </div>
  );
}

export function ProjectAnalyticsDashboardSkeleton({
  caption = "Preparing sprint insights",
}: {
  caption?: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-11 rounded-lg" />
          <Skeleton className="h-9 max-w-[min(260px,55vw)]" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-9 min-w-[5.75rem]" />
          ))}
        </div>
      </header>

      <Skeleton className="h-[10.5rem] w-full rounded-lg lg:h-44" />

      <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="min-h-[4.25rem] rounded-lg border border-border/50 p-3">
            <Skeleton className="mb-2 h-2 w-[45%]" />
            <Skeleton className="h-5 w-[40%]" />
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="min-h-[11rem] w-full rounded-lg" />
        ))}
      </div>

      <LoadingCaption>{caption}</LoadingCaption>
    </div>
  );
}
