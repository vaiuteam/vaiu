import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { canManageWorkspace } from "@/features/workspaces/queries";

import { WorkspaceIdSettingsClient } from "./client";

type WorkspaceIdSettingsPageProps = {
  params: {
    workspaceId: string;
  };
};

const WorkspaceIdSettingsPage = async ({
  params,
}: WorkspaceIdSettingsPageProps) => {
  const current = await getCurrent();
  if (!current) redirect("/sign-in");
  const canManage = await canManageWorkspace(params.workspaceId);
  if (!canManage) redirect(`/workspaces/${params.workspaceId}`);

  return <WorkspaceIdSettingsClient />;
};

export default WorkspaceIdSettingsPage;
