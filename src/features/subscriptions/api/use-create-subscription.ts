import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.v1.subscriptions.create.$post>;
type RequestType = InferRequestType<typeof client.api.v1.subscriptions.create.$post>["json"];

export const useCreateSubscription = () => {
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.v1.subscriptions.create.$post({ json });
            const result = await response.json();

            if (!response.ok || "error" in result) {
                const message =
                    "error" in result && typeof result.error === "string"
                        ? result.error
                        : "Failed to start checkout";
                throw new Error(message);
            }

            return result;
        },
        onError: (error) => {
            toast.error(error.message || "Failed to start checkout");
        },
    });

    return mutation;
};
