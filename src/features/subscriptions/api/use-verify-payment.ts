import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.v1.subscriptions.verify.$post>;
type RequestType = InferRequestType<typeof client.api.v1.subscriptions.verify.$post>["json"];

export const useVerifyPayment = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.v1.subscriptions.verify.$post({ json });
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Payment verified successfully");
            queryClient.invalidateQueries({ queryKey: ["subscription"] });
        },
        onError: () => {
            toast.error("Failed to verify payment");
        },
    });

    return mutation;
};
