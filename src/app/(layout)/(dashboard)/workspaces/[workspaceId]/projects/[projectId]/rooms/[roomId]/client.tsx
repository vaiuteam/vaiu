// "use client";

// import { MediaRoom } from "@/components/media-room";
// import { useCurrent } from "@/features/auth/api/use-curent";
// import { useGetRoom } from "@/features/channels/api/use-get-room";
// import { useRoomId } from "@/features/channels/hooks/use-roomId";
// import { useProjectId } from "@/features/projects/hooks/use-projectId";
// import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";
// import { toast } from "sonner";

// export const RoomId = () => {
//   const workspaceId = useWorkspaceId();
//   const projectId = useProjectId();
//   const roomId = useRoomId();
//   const { data: current } = useCurrent();

//   const router = useRouter();

//   if (!current) {
//     return redirect("/sign-in");
//   }

//   if (projectId === "undefined" || projectId === null) {
//     toast.error("Please select your project to join the room");
//     return redirect(`/workspaces/${workspaceId}`);
//   }

//   const { data: room } = useGetRoom({ roomId });

//   if (!room) router.push(`/workspaces/${workspaceId}/projects/${projectId}`);

//   return (
//     <div className="bg-white dark:bg-[#14171A] flex flex-col h-[80vh]">

//       {room?.roomType === "AUDIO" && (
//         <MediaRoom audio={true} video={false} chatId={room.$id} />
//       )}

//       {room?.roomType === "VIDEO" && (
//         <MediaRoom audio={true} video={true} chatId={room.$id} />
//       )}
//     </div>
//   );
// };


"use client";

import { MediaRoom } from "@/components/media-room";
import { useCurrent } from "@/features/auth/api/use-curent";
import { useGetRoom } from "@/features/channels/api/use-get-room";
import { useRoomId } from "@/features/channels/hooks/use-roomId";
import { useProjectId } from "@/features/projects/hooks/use-projectId";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export const RoomId = () => {
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const roomId = useRoomId();
  const { data: current } = useCurrent();
  const { data: room, isFetched } = useGetRoom({ roomId: roomId || "" });
  const router = useRouter();

  useEffect(() => {
    if (current === null) {
      router.push("/sign-in");
    }
  }, [current, router]);

  useEffect(() => {
    if (!projectId.trim() || projectId === "undefined") {
      toast.error("Please select your project to join the room");
      router.push(`/workspaces/${workspaceId}`);
    }
  }, [projectId, workspaceId, router]);

  // Only redirect once the query has actually resolved with no room.
  // Otherwise the loading state (`room === undefined`) would bounce the
  // user back to the project page on the very first click.
  useEffect(() => {
    if (isFetched && !room && roomId) {
      router.push(`/workspaces/${workspaceId}/projects/${projectId}`);
    }
  }, [isFetched, room, roomId, router, workspaceId, projectId]);

  if (!roomId || !room) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-[#14171A] flex flex-col h-[80vh]">
      {room.roomType === "AUDIO" && (
        <MediaRoom audio={true} video={false} chatId={room.$id} />
      )}
      {room.roomType === "VIDEO" && (
        <MediaRoom audio={true} video={true} chatId={room.$id} />
      )}
    </div>
  );
};
