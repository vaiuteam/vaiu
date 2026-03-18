import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

interface useGetProjectsProps {
  workspaceId: string;
  enabled?: boolean;
}
export const useGetProjects = ({
  workspaceId,
  enabled = true,
}: useGetProjectsProps) => {
  const query = useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      const response = await client.api.v1.projects.$get({
        query: { workspaceId },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          "error" in errorData ? errorData.error : "Failed to fetch projects",
        );
      }
      const { data } = await response.json();
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - projects change more often
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
    enabled,
  });

  return query;
};
