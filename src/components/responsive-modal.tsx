import { PropsWithChildren } from "react";
import { useMedia } from "react-use";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Drawer, DrawerContent, DrawerOverlay } from "./ui/drawer";

export const ResponsiveModal = ({
  open,
  children,
  onOpenChange,
  title = "Modal",
}: PropsWithChildren<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}>) => {
  const isDesktop = useMedia("(min-width: 1024px)", true);
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogOverlay className="bg-slate-950/25 backdrop-blur-md dark:bg-slate-950/55" />
        <DialogContent className="hide-scrollbar max-h-[85vh] w-full overflow-y-auto border-none bg-background p-0 shadow-none dark:bg-[hsl(var(--surface-elevated))]/95 dark:shadow-[0_28px_65px_-34px_rgba(15,23,42,0.88)] sm:max-w-lg">
          <DialogTitle hidden>{title}</DialogTitle>
          <DialogDescription hidden>Modal dialog content</DialogDescription>
          {children}
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerOverlay className="bg-slate-950/25 backdrop-blur-md dark:bg-slate-950/55" />
      <DrawerContent>
        <div className="hide-scrollbar max-h-[85vh] overflow-y-auto">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
