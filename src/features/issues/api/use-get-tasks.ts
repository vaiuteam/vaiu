import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { IssueStatus } from "../types";

interface useGetIssuesProps {
  workspaceId: string;
  projectId?: string | null;
  status?: IssueStatus | null;
  assigneeId?: string | null;
  dueDate?: string | null;
  search?: string | null;
  enabled?: boolean;
  page?: number;
  limit?: number;
}
export const useGetIssues = ({
  workspaceId,
  assigneeId,
  projectId,
  dueDate,
  search,
  status,
  enabled = true,
  page = 0,
  limit = 20,
}: useGetIssuesProps) => {
  const query = useQuery({
    queryKey: [
      "issues",
      workspaceId,
      projectId,
      status,
      search,
      assigneeId,
      dueDate,
      page,
      limit,
    ],
    queryFn: async () => {
      const response = await client.api.v1.issues.$get({
        query: {
          workspaceId,
          projectId: projectId ?? undefined,
          status: status ?? undefined,
          search: search ?? undefined,
          assigneeId: assigneeId ?? undefined,
          dueDate: dueDate ?? undefined,
          page: String(page),
          limit: String(limit),
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          "error" in errorData ? errorData.error : "Failed to fetch issues",
        );
      }
      const { data } = await response.json();

      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - list can be slightly fresher
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
    refetchOnWindowFocus: false, // Don't refetch on window focus
    enabled,
  });

  return query;
};
