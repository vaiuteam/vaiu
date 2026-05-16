import { PropsWithChildren } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Single Radix Dialog for all breakpoints — avoids swapping to Vaul Drawer when
 * viewport / `useMedia` updates, which could unmount dialogs mid-lifecycle and leave
 * Radix body scroll/pointer lock stuck until a full refresh.
 *
 * `size` controls desktop max-width. Defaults to "md" (the previous behavior).
 * Use "xl" for form-heavy dialogs that need breathing room, "2xl" / "3xl" for
 * content-heavy dialogs (e.g. AI results) that need a wide reading column.
 */
export type ResponsiveModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

const SIZE_CLASS: Record<ResponsiveModalSize, string> = {
  sm: "lg:max-w-md",
  md: "lg:max-w-lg",
  lg: "lg:max-w-2xl",
  xl: "lg:max-w-3xl",
  "2xl": "lg:max-w-5xl",
  "3xl": "lg:max-w-6xl",
};

export const ResponsiveModal = ({
  open,
  children,
  onOpenChange,
  title = "Modal",
  size = "md",
}: PropsWithChildren<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  size?: ResponsiveModalSize;
}>) => {
  const modalOverlayClass =
    "bg-slate-950/25 backdrop-blur-md dark:bg-slate-950/55";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName={modalOverlayClass}
        className={cn(
          "hide-scrollbar gap-0 overflow-y-auto border-none bg-background p-0 shadow-none",
          "dark:bg-[hsl(var(--surface-elevated))]/95 dark:shadow-[0_28px_65px_-34px_rgba(15,23,42,0.88)]",
          "max-h-[min(90vh,92dvh)] w-full max-w-[calc(100vw-2rem)]",
          // Desktop: centered modal
          "lg:left-1/2 lg:top-1/2 lg:translate-x-[-50%] lg:translate-y-[-50%] lg:rounded-[28px]",
          SIZE_CLASS[size],
          // Mobile / tablet: bottom sheet (matches previous <lg Drawer behavior)
          "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:left-0 max-lg:right-0 max-lg:top-auto max-lg:translate-x-0 max-lg:translate-y-0 max-lg:max-h-[92dvh] max-lg:w-full max-lg:max-w-none max-lg:rounded-b-none max-lg:rounded-t-[28px]",
        )}
      >
        <DialogTitle hidden>{title}</DialogTitle>
        <DialogDescription hidden>Modal dialog content</DialogDescription>
        <div
          className="mx-auto mt-3 hidden h-2 w-[100px] shrink-0 rounded-full bg-muted max-lg:block"
          aria-hidden
        />
        {children}
      </DialogContent>
    </Dialog>
  );
};
