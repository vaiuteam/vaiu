import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";

export type WorkspaceIsMemberResponseType = InferResponseType<
  (typeof client.api.v1.workspaces)[":workspaceId"]["isworkspacemember"]["$get"],
  200
>;

export const useIsMember = (workspaceId: string) => {
  const query = useQuery({
    queryKey: ["is-workspace-member", workspaceId],
    queryFn: async () => {
      const response = await client.api.v1.workspaces[":workspaceId"]["isworkspacemember"].$get({
        param: { workspaceId },
      });

      if (!response.ok) throw new Error("Failed to check membership");
      const { data } = await response.json();
      return data.isMember;
    },
    enabled: !!workspaceId,
  });

  return query;
};

export const useCurrentWorkspaceMember = (workspaceId: string) => {
  const query = useQuery({
    queryKey: ["current-workspace-member", workspaceId],
    queryFn: async () => {
      const response = await client.api.v1.workspaces[":workspaceId"][
        "isworkspacemember"
      ].$get({
        param: { workspaceId },
      });

      if (!response.ok) throw new Error("Failed to fetch current workspace member");
      const { data } = await response.json();
      return data.member;
    },
    enabled: !!workspaceId,
  });

  return query;
};