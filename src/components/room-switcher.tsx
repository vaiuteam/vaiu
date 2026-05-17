"use client";

import Link from "next/link";
import { PhoneCall, Video } from "lucide-react";
import { useGetRooms } from "@/features/channels/api/use-get-rooms";
import { useCreateRoomModal } from "@/features/channels/hooks/use-create-room-modal";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingCaption } from "@/components/loading-skeletons";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSidebar } from "./ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface RoomSwitcherProps {
  projectId: string;
  workspaceId: string;
}

const roomHref = (
  workspaceId: string,
  projectId: string,
  roomId: string,
) =>
  `/workspaces/${workspaceId}/projects/${projectId}/rooms/${roomId}`;

export const RoomSwitcher = ({ projectId, workspaceId }: RoomSwitcherProps) => {
  const pathname = usePathname();
  const { open } = useCreateRoomModal();
  const { data: rooms, isLoading } = useGetRooms({ workspaceId, projectId });
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const currentRoomId = pathname.includes("/rooms/")
    ? pathname.split("/rooms/")[1]?.split("/")[0]?.split("?")[0]
    : undefined;

  const audioRooms = rooms?.documents.filter(
    (room) => room.roomType === "AUDIO",
  );
  const videoRooms = rooms?.documents.filter(
    (room) => room.roomType === "VIDEO",
  );

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <ScrollArea className="h-[200px]">
          <div className="flex flex-col gap-1">
            {isLoading ? (
              <div className="flex flex-col gap-2 py-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="mx-auto size-10 rounded-lg" />
                ))}
                <LoadingCaption className="pt-3 text-[11px]">
                  Loading rooms
                </LoadingCaption>
              </div>
            ) : (
              <>
                {videoRooms?.map((room) => (
                  <Tooltip key={room.$id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-12 w-12 rounded-2xl",
                          currentRoomId === room.$id &&
                          "bg-sidebar-accent text-sidebar-accent-foreground",
                        )}
                        asChild
                      >
                        <Link
                          href={roomHref(workspaceId, projectId, room.$id)}
                          prefetch={false}
                          aria-current={
                            currentRoomId === room.$id ? "page" : undefined
                          }
                        >
                          <Video className="h-6 w-6" />
                          <span className="sr-only">{room.name} (video)</span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{room.name} (Video)</p>
                    </TooltipContent>
                  </Tooltip>
                ))}

                {audioRooms?.map((room) => (
                  <Tooltip key={room.$id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-12 w-12 rounded-2xl",
                          currentRoomId === room.$id &&
                          "bg-sidebar-accent text-sidebar-accent-foreground",
                        )}
                        asChild
                      >
                        <Link
                          href={roomHref(workspaceId, projectId, room.$id)}
                          prefetch={false}
                          aria-current={
                            currentRoomId === room.$id ? "page" : undefined
                          }
                        >
                          <PhoneCall className="h-6 w-6" />
                          <span className="sr-only">{room.name} (audio)</span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{room.name} (Audio)</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex flex-col gap-y-2">
      {isLoading ? (
        <div className="flex flex-col gap-2 py-3">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-2 w-20" />
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          ))}
          <LoadingCaption className="text-[11px]">Loading rooms</LoadingCaption>
        </div>
      ) : (
        <ScrollArea className="h-[200px] pr-2">
          {videoRooms && videoRooms.length > 0 && (
            <div className="mb-2 space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-sidebar-foreground/55">
                Video Rooms
              </p>
              {videoRooms.map((room) => (
                <Button
                  key={room.$id}
                  variant="ghost"
                  className={cn(
                    "h-9 w-full justify-start rounded-xl px-2.5 text-sm",
                    currentRoomId === room.$id &&
                    "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                  asChild
                >
                  <Link
                    href={roomHref(workspaceId, projectId, room.$id)}
                    prefetch={false}
                    aria-current={
                      currentRoomId === room.$id ? "page" : undefined
                    }
                  >
                    <Video className="mr-2 h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{room.name}</span>
                  </Link>
                </Button>
              ))}
            </div>
          )}

          {audioRooms && audioRooms.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-sidebar-foreground/55">
                Audio Rooms
              </p>
              {audioRooms.map((room) => (
                <Button
                  key={room.$id}
                  variant="ghost"
                  className={cn(
                    "h-9 w-full justify-start rounded-xl px-2.5 text-sm",
                    currentRoomId === room.$id &&
                    "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                  asChild
                >
                  <Link
                    href={roomHref(workspaceId, projectId, room.$id)}
                    prefetch={false}
                    aria-current={
                      currentRoomId === room.$id ? "page" : undefined
                    }
                  >
                    <PhoneCall className="mr-2 h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{room.name}</span>
                  </Link>
                </Button>
              ))}
            </div>
          )}

          {(!audioRooms || audioRooms.length === 0) &&
            (!videoRooms || videoRooms.length === 0) && (
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No rooms available
                </p>
                <Button
                  type="button"
                  onClick={open}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Create a room
                </Button>
              </div>
            )}
        </ScrollArea>
      )}
    </div>
  );
};
