import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { PricingClient } from "./client";

const PricingPage = async () => {
    const current = await getCurrent();
    if (!current) redirect("/sign-in");
    return <PricingClient />;
};

export default PricingPage;
