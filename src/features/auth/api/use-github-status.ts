import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetGithubStatus = () => {
  const query = useQuery({
    queryKey: ["github-status"],
    queryFn: async () => {
      const response = await client.api.v1.auth["github-status"].$get();
      if (!response.ok) {
        return { connected: false };
      }
      const { data } = await response.json();
      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return query;
};
