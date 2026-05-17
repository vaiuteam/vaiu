import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { canManageWorkspace } from "@/features/workspaces/queries";
import { WorkspaceAnalyticsClient } from "./client";

type WorkspaceAnalyticsPageProps = {
  params: {
    workspaceId: string;
  };
};

export default async function WorkspaceAnalyticsPage({
  params,
}: WorkspaceAnalyticsPageProps) {
  const current = await getCurrent();
  if (!current) redirect("/sign-in");
  const canManage = await canManageWorkspace(params.workspaceId);
  if (!canManage) redirect(`/workspaces/${params.workspaceId}`);

  return <WorkspaceAnalyticsClient />;
}
