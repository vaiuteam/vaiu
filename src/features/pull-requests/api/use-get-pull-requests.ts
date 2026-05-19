import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { PrStatus } from "../types";

interface useGetPullRequestsProps {
  workspaceId: string;
  projectId: string;
  status?: PrStatus | null;
  search?: string | null;
  enabled?: boolean;
  page?: number;
}
export const useGetPullRequests = ({
  workspaceId,
  projectId,
  status,
  search,
  enabled = true,
  page = 1,
}: useGetPullRequestsProps) => {
  const query = useQuery({
    queryKey: [
      "pull-requests",
      workspaceId,
      projectId,
      status,
      search,
      page,
    ],
    queryFn: async () => {
      const response = await client.api.v1["pull-requests"].$get({
        query: {
          workspaceId,
          projectId,
          status: status ?? undefined,
          search: search ?? undefined,
          page: String(page),
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          "error" in errorData ? errorData.error : "Failed to fetch pull requests",
        );
      }
      const { data } = await response.json();
      return data;
    },
    enabled,
  });

  return query;
};
