"use client";

import { Navigation } from "./navigation";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { Logo } from "./Logo";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import Link from "next/link";
import { ProjectSwitcher } from "./project-switcher";
import { Logo2 } from "./Logo2";
import {
  SidebarContent,
  Sidebar,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  useSidebar,
} from "./ui/sidebar";
import { RiAddCircleFill } from "react-icons/ri";
import { useCreateWorkspaceModal } from "@/features/workspaces/hooks/use-create-workspace-modal";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useCreateRoomModal } from "@/features/channels/hooks/use-create-room-modal";
import { RoomSwitcher } from "./room-switcher";
import { useProjectId } from "@/features/projects/hooks/use-projectId";
import { useMemo, useCallback } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

/**
 * AddButton Component - Reusable button for adding items
 */
interface AddButtonProps {
  onClick: () => void;
  label: string;
  isCollapsed?: boolean;
}

const AddButton = ({ onClick, label, isCollapsed }: AddButtonProps) => {
  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClick}
              className="h-8 w-8 shrink-0 hover:bg-muted"
              aria-label={label}
            >
              <RiAddCircleFill className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="h-5 w-5 shrink-0 hover:bg-muted"
      aria-label={label}
    >
      <RiAddCircleFill className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
    </Button>
  );
};

/**
 * SidebarSection Component - Reusable section with header
 */
interface SidebarSectionProps {
  title: string;
  onAdd?: () => void;
  addLabel?: string;
  children: React.ReactNode;
  className?: string;
  isCollapsed?: boolean;
}

const SidebarSection = ({
  title,
  onAdd,
  addLabel,
  children,
  className,
  isCollapsed,
}: SidebarSectionProps) => {
  if (isCollapsed) {
    return (
      <SidebarGroup
        className={cn(
          "rounded-2xl bg-sidebar/55 px-1.5 py-2 shadow-none backdrop-blur-xl dark:shadow-sm",
          className,
        )}
      >
        <SidebarGroupContent className="flex flex-col items-center gap-2">
          {children}
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup
      className={cn(
        "rounded-2xl bg-sidebar/55 px-1.5 py-2 shadow-none backdrop-blur-xl dark:shadow-sm",
        className,
      )}
    >
      <SidebarGroupLabel>
        <div className="flex w-full items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/55">
            {title}
          </span>
          {onAdd && addLabel && (
            <AddButton onClick={onAdd} label={addLabel} isCollapsed={false} />
          )}
        </div>
      </SidebarGroupLabel>
      <SidebarGroupContent>{children}</SidebarGroupContent>
    </SidebarGroup>
  );
};

export const SidebarComponent = () => {
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const { open: openWorkspace } = useCreateWorkspaceModal();
  const { open: openProject } = useCreateProjectModal();
  const { open: openRoom } = useCreateRoomModal();
  const { state } = useSidebar();

  const isCollapsed = state === "collapsed";

  // Memoize the home link to prevent unnecessary re-renders
  const homeLink = useMemo(() => {
    return workspaceId ? `/workspaces/${workspaceId}` : "/";
  }, [workspaceId]);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleOpenWorkspace = useCallback(() => {
    openWorkspace();
  }, [openWorkspace]);

  const handleOpenProject = useCallback(() => {
    openProject();
  }, [openProject]);

  const handleOpenRoom = useCallback(() => {
    openRoom();
  }, [openRoom]);

  // Check if rooms should be shown
  const showRooms = workspaceId && projectId;

  return (
    <Sidebar collapsible="icon" side="left" variant="floating">
      <SidebarContent className="flex flex-col gap-4 p-3">
        {/* Logo Header */}
        <SidebarGroup className="rounded-2xl bg-sidebar/55 px-1.5 py-2 shadow-none backdrop-blur-xl dark:shadow-sm">
          <SidebarHeader className="gap-0 p-0">
            {isCollapsed ? (
              <div className="group/logo relative flex items-center justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={homeLink}
                        className="flex items-center justify-center rounded-lg p-1.5 transition-all duration-200 hover:bg-accent/50"
                        aria-label="Home"
                      >
                        <Logo className="h-14 w-14 transition-opacity duration-200 group-hover/logo:opacity-0 dark:hidden" />
                        <Logo2 className="hidden h-14 w-14 transition-opacity duration-200 group-hover/logo:opacity-0 dark:block" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Home</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover/logo:opacity-100">
                  <SidebarTrigger
                    aria-label="Toggle sidebar"
                    className="h-16 w-16"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between px-1">
                <Link
                  href={homeLink}
                  className="flex items-center justify-between transition-opacity hover:opacity-80"
                  aria-label="Home"
                >
                  <div className="">
                    <Logo className="dark:hidden" />
                    <Logo2 className="hidden dark:block" />
                  </div>
                </Link>
                <div className="">
                  <SidebarTrigger aria-label="Toggle sidebar" />
                </div>
              </div>
            )}
          </SidebarHeader>
        </SidebarGroup>

        {/* Workspaces Section */}
        <SidebarSection
          title="Workspaces"
          onAdd={handleOpenWorkspace}
          addLabel="Add workspace"
          isCollapsed={isCollapsed}
        >
          <WorkspaceSwitcher />
        </SidebarSection>

        {/* Navigation Section */}
        <SidebarSection title="Navigation" isCollapsed={isCollapsed}>
          <Navigation />
        </SidebarSection>

        {/* Projects Section */}
        <SidebarSection
          title="Projects"
          onAdd={handleOpenProject}
          addLabel="Add project"
          isCollapsed={isCollapsed}
        >
          <ProjectSwitcher />
        </SidebarSection>

        {/* Rooms Section */}
        <SidebarSection
          title="Rooms"
          onAdd={handleOpenRoom}
          addLabel="Add room"
          className="flex-1"
          isCollapsed={isCollapsed}
        >
          <div className={isCollapsed ? "" : "min-h-[60px]"}>
            {showRooms ? (
              <RoomSwitcher workspaceId={workspaceId} projectId={projectId} />
            ) : (
              !isCollapsed && (
                <div className="flex h-full items-center justify-center rounded-lg bg-background/25 px-3 py-4">
                  <p className="text-center text-xs text-muted-foreground">
                    Select a project to view rooms
                  </p>
                </div>
              )
            )}
          </div>
        </SidebarSection>
      </SidebarContent>
    </Sidebar>
  );
};
