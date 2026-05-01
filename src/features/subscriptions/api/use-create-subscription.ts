import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.v1.subscriptions.create.$post>;
type RequestType = InferRequestType<typeof client.api.v1.subscriptions.create.$post>["json"];

export const useCreateSubscription = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.v1.subscriptions.create.$post({ json });
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Subscription created successfully");
            queryClient.invalidateQueries({ queryKey: ["subscription"] });
        },
        onError: () => {
            toast.error("Failed to create subscription");
        },
    });

    return mutation;
};
