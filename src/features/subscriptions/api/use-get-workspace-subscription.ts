import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetWorkspaceSubscription = (workspaceId: string | undefined) => {
    const query = useQuery({
        queryKey: ["subscription", "workspace", workspaceId],
        queryFn: async () => {
            const response = await client.api.v1.subscriptions.workspace[":workspaceId"].$get({
                param: { workspaceId: workspaceId! },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch workspace subscription");
            }
            const { data } = await response.json();
            return data;
        },
        enabled: !!workspaceId,
    });

    return query;
};
