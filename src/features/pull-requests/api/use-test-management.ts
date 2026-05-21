import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type GetTestsResponseType = InferResponseType<
    (typeof client.api.v1)["pull-requests"][":projectId"]["tests"][":prNumber"]["$get"],
    200
>;

type GetProjectTestsResponseType = InferResponseType<
    (typeof client.api.v1)["pull-requests"][":projectId"]["tests"]["$get"],
    200
>;

export const useGetPRTests = (projectId: string, prNumber: number) => {
    return useQuery<GetTestsResponseType>({
        queryKey: ["pr-tests", projectId, prNumber],
        queryFn: async () => {
            const response = await client.api.v1["pull-requests"][":projectId"]["tests"][":prNumber"].$get({
                param: { projectId, prNumber: prNumber.toString() },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch tests");
            }

            return await response.json();
        },
    });
};

export const useGetProjectTests = (projectId: string) => {
    return useQuery<GetProjectTestsResponseType>({
        queryKey: ["project-tests", projectId],
        queryFn: async () => {
            const response = await client.api.v1["pull-requests"][":projectId"]["tests"].$get({
                param: { projectId },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch project tests");
            }

            return await response.json();
        },
        enabled: Boolean(projectId),
    });
};

type CreateTestResponseType = InferResponseType<
    (typeof client.api.v1)["pull-requests"][":projectId"]["tests"][":prNumber"]["$post"],
    200
>;
type CreateTestRequestType = InferRequestType<
    (typeof client.api.v1)["pull-requests"][":projectId"]["tests"][":prNumber"]["$post"]
>;

export const useCreateTest = () => {
    const queryClient = useQueryClient();

    return useMutation<CreateTestResponseType, Error, CreateTestRequestType>({
        mutationFn: async ({ param, json }) => {
            const response = await client.api.v1["pull-requests"][":projectId"]["tests"][":prNumber"].$post({
                param,
                json,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    "error" in errorData ? errorData.error : "Failed to create test"
                );
            }

            return await response.json();
        },
        onSuccess: (_, variables) => {
            toast.success("Test created successfully");
            queryClient.invalidateQueries({
                queryKey: ["pr-tests", variables.param.projectId, parseInt(variables.param.prNumber)],
            });
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create test");
        },
    });
};

type UpdateTestResponseType = InferResponseType<
    (typeof client.api.v1)["pull-requests"][":projectId"]["tests"][":testId"]["$patch"],
    200
>;
type UpdateTestRequestType = InferRequestType<
    (typeof client.api.v1)["pull-requests"][":projectId"]["tests"][":testId"]["$patch"]
>;

export const useUpdateTest = () => {
    const queryClient = useQueryClient();

    return useMutation<UpdateTestResponseType, Error, UpdateTestRequestType>({
        mutationFn: async ({ param, json }) => {
            const response = await client.api.v1["pull-requests"][":projectId"]["tests"][":testId"].$patch({
                param,
                json,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    "error" in errorData ? errorData.error : "Failed to update test"
                );
            }

            return await response.json();
        },
        onSuccess: (_, variables) => {
            toast.success("Test updated successfully");
            queryClient.invalidateQueries({ queryKey: ["pr-tests"] });
            queryClient.invalidateQueries({ queryKey: ["project-tests", variables.param.projectId] });
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update test");
        },
    });
};

type DeleteTestResponseType = InferResponseType<
    (typeof client.api.v1)["pull-requests"][":projectId"]["tests"][":testId"]["$delete"],
    200
>;
type DeleteTestRequestType = InferRequestType<
    (typeof client.api.v1)["pull-requests"][":projectId"]["tests"][":testId"]["$delete"]
>;

export const useDeleteTest = () => {
    const queryClient = useQueryClient();

    return useMutation<DeleteTestResponseType, Error, DeleteTestRequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.v1["pull-requests"][":projectId"]["tests"][":testId"].$delete({
                param,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    "error" in errorData ? errorData.error : "Failed to delete test"
                );
            }

            return await response.json();
        },
        onSuccess: (_, variables) => {
            toast.success("Test deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["pr-tests"] });
            queryClient.invalidateQueries({ queryKey: ["project-tests", variables.param.projectId] });
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete test");
        },
    });
};
