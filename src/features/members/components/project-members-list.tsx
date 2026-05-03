"use client";

import Link from "next/link";
import { Fragment } from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MemberRole } from "@/features/members/types";
import { useRemoveProjectMember } from "@/features/members/api/use-remove-project-member";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { MemberAvatar } from "@/features/members/components/members-avatar";
import { useConfirm } from "@/hooks/use-confirm";
import { useProjectId } from "@/features/projects/hooks/use-projectId";
import { useGetProjectMembers } from "../api/use-get-project-members";
import { useGetProject } from "@/features/projects/api/use-get-project";

export const ProjectMembersList = () => {
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const [ConfirmDialog, confirm] = useConfirm(
    "Remove Member",
    "This member will be removed from this project only",
    "destructive",
  );

  const { data, isPending, isError } = useGetProjectMembers({
    workspaceId,
    projectId,
  });
  const { data: project } = useGetProject({ projectId });

  const members = data?.documents ?? [];

  const { mutate: removeProjectMember, isPending: removingMember } =
    useRemoveProjectMember();
  const { mutate: updateMember, isPending: updatingMember } = useUpdateMember();

  const handleUpdateMember = (memberId: string, role: MemberRole) => {
    updateMember({ param: { memberId }, json: { role } });
  };

  const handleRemoveFromProject = async (memberId: string) => {
    const ok = await confirm();
    if (!ok) return;
    removeProjectMember({ param: { projectId, memberId } });
  };
  return (
    <Card className="size-full border-none shadow-none">
      <ConfirmDialog />
      <CardHeader className="flex flex-row items-center gap-x-4 space-y-0 p-7">
        <Button asChild variant="secondary" size="sm">
          <Link href={`/workspaces/${workspaceId}/projects/${projectId}`}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Link>
        </Button>
        <CardTitle className="text-xl font-bold">
          Project Members List
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7">
        {isPending ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : isError ? (
          <p className="text-sm text-destructive">Could not load members.</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members for this project.</p>
        ) : (
          members.map((member, idx) => {
          const isProjectAdmin = project?.projectAdmin === member.$id;

          return (
            <Fragment key={member.$id}>
              <div className="flex items-center gap-2">
                <MemberAvatar
                  className="size-10"
                  fallbackClassName="text-lg"
                  name={member.name}
                />
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs font-medium">{member.email}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-destructive">
                      {member.role}
                    </p>
                    {isProjectAdmin && (
                      <p className="rounded-md bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Project Admin
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="ml-auto" variant="secondary" size="icon">
                      <MoreVertical className="size-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom" align="end">
                    <DropdownMenuItem
                      className={`font-medium ${
                        member.role === MemberRole.ADMIN && "hidden"
                      }`}
                      onClick={() =>
                        handleUpdateMember(member.$id, MemberRole.ADMIN)
                      }
                      disabled={updatingMember}
                    >
                      Set as Administrator
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="font-medium"
                      onClick={() =>
                        handleUpdateMember(member.$id, MemberRole.MEMBER)
                      }
                      disabled={updatingMember}
                    >
                      Set as Member
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="font-medium text-amber-700"
                      onClick={() => handleRemoveFromProject(member.$id)}
                      disabled={removingMember}
                    >
                      Remove {member.name}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {idx < members.length - 1 && (
                <Separator className="my-2.5 bg-neutral-400/40" />
              )}
            </Fragment>
          );
        })
        )}
      </CardContent>
    </Card>
  );
};
