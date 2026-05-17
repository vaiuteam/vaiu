"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";

import "@livekit/components-styles";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingCaption } from "@/components/loading-skeletons";
import { useCurrent } from "@/features/auth/api/use-curent";
import { useRouter } from "next/navigation";

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
}

export const MediaRoom: React.FC<MediaRoomProps> = ({
  chatId,
  video,
  audio,
}) => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const { data: user } = useCurrent();

  useEffect(() => {
    if (!user?.name) return;

    const name = `${user.name}`;

    (async () => {
      try {
        const response = await fetch(
          `/api/livekit?room=${chatId}&username=${name}`
        );

        const data = await response.json();
        setToken(data.token);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    })();
  }, [chatId, user?.name]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-12">
        <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-xl border border-border/40 bg-muted/20">
          <div className="flex h-full flex-col justify-center gap-3 p-6">
            <Skeleton className="h-8 w-2/5 max-w-xs" />
            <Skeleton className="h-[12rem] w-full rounded-md" />
          </div>
        </div>
        <LoadingCaption>Connecting to room</LoadingCaption>
      </div>
    );
  }

  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      audio={audio}
      video={video}
      onDisconnected={() => router.push("/")}
    >
      <VideoConference />
    </LiveKitRoom>
  );
};
