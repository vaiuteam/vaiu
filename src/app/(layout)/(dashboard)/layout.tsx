import { PropsWithChildren } from "react";
import { Navbar } from "@/components/navbar";
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";
import { CreateTaskModal } from "@/features/issues/components/create-task-modal";
import { EditTaskModal } from "@/features/issues/components/edit-task-modal";
import { AddCollaboratorToProjectModal } from "@/features/projects/components/add-collaborator-to-project-modal";
import { CreateRoomModal } from "@/features/channels/components/create-channel-modal";
import { CreatePrModal } from "@/features/pull-requests/components/create-pr-modal";
import { FileUploaderModal } from "@/features/projects/components/file-uploader-modal";

const DashboardLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-screen">
      <AddCollaboratorToProjectModal />
      <CreateWorkspaceModal />
      <CreateProjectModal />
      <CreateRoomModal />
      <CreateTaskModal />
      <CreatePrModal />
      <EditTaskModal />
      <FileUploaderModal />
      <div className="flex h-full w-full flex-col">
        <Navbar />
        <div className="flex-1 overflow-auto px-1 pb-8 md:px-3">
          <div className="flex w-full flex-col gap-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
