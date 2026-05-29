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
            const result = await response.json();

            if (!response.ok || "error" in result) {
                const message =
                    "error" in result && typeof result.error === "string"
                        ? result.error
                        : "Failed to verify payment";
                throw new Error(message);
            }

            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscription"] });
        },
        onError: (error) => {
            toast.error(error.message || "Failed to verify payment");
        },
    });

    return mutation;
};
