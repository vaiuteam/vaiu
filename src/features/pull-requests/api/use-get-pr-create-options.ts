import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

interface UseGetPrCreateOptionsProps {
  projectId: string;
}

export const useGetPrCreateOptions = ({
  projectId,
}: UseGetPrCreateOptionsProps) => {
  return useQuery({
    queryKey: ["pull-request-create-options", projectId],
    queryFn: async () => {
      const response = await client.api.v1["pull-requests"][":projectId"][
        "create-options"
      ].$get({
        param: { projectId },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          "error" in errorData
            ? errorData.error
            : "Failed to fetch pull request options",
        );
      }

      const { data } = await response.json();
      return data;
    },
    enabled: !!projectId,
  });
};
