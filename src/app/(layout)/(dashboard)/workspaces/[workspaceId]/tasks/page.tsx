import { getCurrent } from "@/features/auth/queries";
import { TaskViewSwitcher } from "@/features/issues/components/task-view-switcher";
import { canManageWorkspace } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";

type TasksPageProps = {
  params: {
    workspaceId: string;
  };
};

const TasksPage = async ({ params }: TasksPageProps) => {
  const current = await getCurrent();
  if (!current) redirect("/sign-in");
  const canManage = await canManageWorkspace(params.workspaceId);
  if (!canManage) redirect(`/workspaces/${params.workspaceId}`);

  return (
    <div className="flex h-full flex-col">
      <TaskViewSwitcher />
    </div>
  );
};

export default TasksPage;
