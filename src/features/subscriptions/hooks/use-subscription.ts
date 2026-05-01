import { type Databases } from "node-appwrite";
import { useGetCurrentSubscription } from "../api/use-get-current-subscription";
import { checkSubscriptionLimit } from "../utils";
import { SubscriptionPlan, SubscriptionStatus } from "../types";

export const useSubscription = () => {
    const { data: subscription, isLoading } = useGetCurrentSubscription();

    const isActive =
        subscription?.status === SubscriptionStatus.ACTIVE &&
        new Date(subscription.currentPeriodEnd) > new Date();

    const isFree = subscription?.plan === SubscriptionPlan.FREE;
    const isPro = subscription?.plan === SubscriptionPlan.PRO;
    const isStandard = subscription?.plan === SubscriptionPlan.STANDARD;
    const isEnterprise = subscription?.plan === SubscriptionPlan.ENTERPRISE;

    const canCreateWorkspace = async (databases: Databases, userId: string) => {
        if (!databases || !userId) return false;
        const result = await checkSubscriptionLimit({
            databases,
            userId,
            limitType: "workspaces",
        });
        return result.allowed;
    };

    const canCreateProject = async (
        databases: Databases,
        userId: string,
        workspaceId: string
    ) => {
        if (!databases || !userId || !workspaceId) return false;
        const result = await checkSubscriptionLimit({
            databases,
            userId,
            limitType: "projects",
            workspaceId,
        });
        return result.allowed;
    };

    const canCreateRoom = async (
        databases: Databases,
        userId: string,
        workspaceId: string
    ) => {
        if (!databases || !userId || !workspaceId) return false;
        const result = await checkSubscriptionLimit({
            databases,
            userId,
            limitType: "rooms",
            workspaceId,
        });
        return result.allowed;
    };

    return {
        subscription,
        isLoading,
        isActive,
        isFree,
        isPro,
        isStandard,
        isEnterprise,
        plan: subscription?.plan || SubscriptionPlan.FREE,
        status: subscription?.status,
        canCreateWorkspace,
        canCreateProject,
        canCreateRoom,
    };
};
