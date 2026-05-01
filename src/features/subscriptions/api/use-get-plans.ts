import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetPlans = () => {
    const query = useQuery({
        queryKey: ["subscription", "plans"],
        queryFn: async () => {
            const response = await client.api.v1.subscriptions.plans.$get();
            if (!response.ok) {
                throw new Error("Failed to fetch plans");
            }
            const { data } = await response.json();
            return data;
        },
    });

    return query;
};
