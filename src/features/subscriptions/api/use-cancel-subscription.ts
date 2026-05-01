import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.v1.subscriptions.cancel.$post>;
type RequestType = InferRequestType<typeof client.api.v1.subscriptions.cancel.$post>["json"];

export const useCancelSubscription = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.v1.subscriptions.cancel.$post({ json });
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Subscription cancelled successfully");
            queryClient.invalidateQueries({ queryKey: ["subscription"] });
        },
        onError: () => {
            toast.error("Failed to cancel subscription");
        },
    });

    return mutation;
};
