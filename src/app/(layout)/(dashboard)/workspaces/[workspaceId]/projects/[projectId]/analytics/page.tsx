import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import AnalyticsDashboard from "./analytics-client-page";

export default async function Page() {
  const current = await getCurrent();
  if (!current) redirect("/sign-in");

  return <AnalyticsDashboard />;
}
