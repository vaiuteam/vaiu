import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetCurrentSubscription = () => {
    const query = useQuery({
        queryKey: ["subscription", "current"],
        queryFn: async () => {
            const response = await client.api.v1.subscriptions.current.$get();
            if (!response.ok) {
                throw new Error("Failed to fetch subscription");
            }
            const { data } = await response.json();
            return data;
        },
    });

    return query;
};
