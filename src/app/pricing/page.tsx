import { PricingClient } from "./client";

const PricingPage = async ({ searchParams }: { searchParams: Promise<{ workspaceId?: string }> }) => {
    const { workspaceId } = await searchParams;
    return <PricingClient workspaceId={workspaceId} />;
};

export default PricingPage;