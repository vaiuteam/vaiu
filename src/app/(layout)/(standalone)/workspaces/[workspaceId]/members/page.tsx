import { getCurrent } from "@/features/auth/queries";
import { MembersList } from "@/features/members/components/members-list";
import { canManageWorkspace } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";

type MembersPageProps = {
  params: {
    workspaceId: string;
  };
};

const MembersPage = async ({ params }: MembersPageProps) => {
  const current = await getCurrent();
  if (!current) redirect("/sign-in");
  const canManage = await canManageWorkspace(params.workspaceId);
  if (!canManage) redirect(`/workspaces/${params.workspaceId}`);
  return (
    <div className="mx-auto w-full lg:max-w-xl">
      <MembersList />
    </div>
  );
};

export default MembersPage;
