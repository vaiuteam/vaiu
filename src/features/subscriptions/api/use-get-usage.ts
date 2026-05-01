import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetUsage = () => {
    const query = useQuery({
        queryKey: ["subscription", "usage"],
        queryFn: async () => {
            const response = await client.api.v1.subscriptions.usage.$get();
            if (!response.ok) {
                throw new Error("Failed to fetch usage");
            }
            const { data } = await response.json();
            return data;
        },
    });

    return query;
};
