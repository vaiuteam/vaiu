import "server-only";
import { Query, type Databases } from "node-appwrite";
import { DATABASE_ID, SUBSCRIPTIONS_ID, MEMBERS_ID } from "@/config";
import { Subscription, SubscriptionStatus, PLAN_LIMITS, PLAN_PRICING } from "../types";
import { getWorkspaceSubscription } from "../utils";
import { cancelRazorpaySubscriptionSafe, updateRazorpaySubscriptionQuantity } from "@/lib/razorpay";

export const listWorkspaceSubscriptions = async (
    databases: Databases,
    workspaceId: string,
): Promise<Subscription[]> => {
    const subs = await databases.listDocuments<Subscription>(
        DATABASE_ID,
        SUBSCRIPTIONS_ID,
        [
            Query.equal("workspaceId", workspaceId),
            Query.orderDesc("$createdAt"),
            Query.limit(100),
        ],
    );
    return subs.documents;
};

/** End ACTIVE/PENDING workspace subscriptions so upgrades don't leave stale rows. */
export const supersedeWorkspaceSubscriptions = async (
    databases: Databases,
    workspaceId: string,
    exceptId?: string,
): Promise<void> => {
    const subs = await listWorkspaceSubscriptions(databases, workspaceId);

    for (const sub of subs) {
        if (sub.$id === exceptId) continue;
        if (sub.status !== SubscriptionStatus.ACTIVE && sub.status !== SubscriptionStatus.PENDING) {
            continue;
        }

        if (sub.razorpaySubscriptionId) {
            await cancelRazorpaySubscriptionSafe(sub.razorpaySubscriptionId, false);
        }

        await databases.updateDocument(DATABASE_ID, SUBSCRIPTIONS_ID, sub.$id, {
            status:
                sub.status === SubscriptionStatus.PENDING
                    ? SubscriptionStatus.CANCELLED
                    : SubscriptionStatus.EXPIRED,
        });
    }
};

// Called after a member joins or leaves a workspace. Updates the Razorpay
// subscription quantity (takes effect next billing cycle) and keeps seatCount
// and aiCredits in sync on the subscription document.
// Errors are swallowed — member operations must never fail due to billing sync.
export const syncWorkspaceSeatCount = async (
    databases: Databases,
    workspaceId: string,
): Promise<void> => {
    try {
        const { plan, subscription } = await getWorkspaceSubscription({ databases, workspaceId });

        if (!PLAN_PRICING[plan].perSeat) return;
        if (!subscription?.razorpaySubscriptionId) return;

        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("workspaceId", workspaceId), Query.limit(1000)],
        );
        const count = members.total;

        await updateRazorpaySubscriptionQuantity(subscription.razorpaySubscriptionId, count);

        await databases.updateDocument(DATABASE_ID, SUBSCRIPTIONS_ID, subscription.$id, {
            seatCount: count,
            aiCredits: count * PLAN_LIMITS[plan].aiCreditsPerUser,
        });
    } catch (error) {
        console.warn("Seat count sync failed:", error);
    }
};
