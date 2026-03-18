import { FolderIcon, ListChecksIcon, UserCog2, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useGetMembers } from "@/features/members/api/use-get-members";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { IssueStatus } from "../types";
import { useTaskFilter } from "../hooks/use-task-filter";
import { DatePicker } from "@/components/date-picker";

interface DataFiltersProps {
  hideProjectFilter?: boolean;
}

export const DataFilters = ({ hideProjectFilter }: DataFiltersProps) => {
  const workspaceId = useWorkspaceId();
  const { data: projects, isLoading: projectsLoading } = useGetProjects({
    workspaceId,
    enabled: !hideProjectFilter,
  });
  const { data: members, isLoading: membersLoading } = useGetMembers({
    workspaceId,
  });

  const isLoading = membersLoading || (!hideProjectFilter && projectsLoading);

  const projectOptions = projects?.documents.map((project) => ({
    value: project.$id,
    label: project.name,
  }));

  const memberOptions = members?.documents.map((member) => ({
    value: member.$id,
    label: member.name,
  }));

  const assigneeOptions = memberOptions || [];

  const [{ status, dueDate, assigneeId, projectId, search }, setFilters] =
    useTaskFilter();

  const [searchValue, setSearchValue] = useState(search ?? "");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchValue || null });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, setFilters]);

  const onStatusChange = (value: string) => {
    setFilters({ status: value === "all" ? null : (value as IssueStatus) });
  };

  const onAssigneeChange = (value: string) => {
    setFilters({ assigneeId: value === "all" ? null : (value as string) });
  };

  const onProjectChange = (value: string) => {
    setFilters({ projectId: value === "all" ? null : (value as string) });
  };

  if (isLoading) return null;

  return (
    <div className="flex flex-col gap-2 lg:flex-row">
      <div className="relative flex-1 lg:max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search issue name..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="h-8 pl-9"
        />
      </div>
      <Select
        defaultValue={status ?? undefined}
        onValueChange={(value) => onStatusChange(value)}
      >
        <SelectTrigger className="h-8 w-full lg:w-auto">
          <div className="flex items-center pr-2">
            <ListChecksIcon className="mr-2 size-4" />
            <SelectValue placeholder="All status" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          <SelectSeparator />
          {Object.entries(IssueStatus).map(([key, value]) => (
            <SelectItem key={value} value={value}>
              {key
                .replace("_", " ")
                .toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase())}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue={assigneeId ?? undefined}
        onValueChange={(value) => onAssigneeChange(value)}
      >
        <SelectTrigger className="h-8 w-full lg:w-auto">
          <div className="flex items-center pr-2">
            <UserCog2 className="mr-2 size-4" />
            <SelectValue placeholder="All assignee" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All assignee</SelectItem>
          <SelectSeparator />
          {assigneeOptions?.map((member) => (
            <SelectItem key={member.value} value={member.value}>
              {member.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!hideProjectFilter && (
        <Select
          defaultValue={projectId ?? undefined}
          onValueChange={(value) => onProjectChange(value)}
        >
          <SelectTrigger className="h-8 w-full lg:w-auto">
            <div className="flex items-center pr-2">
              <FolderIcon className="mr-2 size-4" />
              <SelectValue placeholder="All projects" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            <SelectSeparator />
            {projectOptions?.map((project) => (
              <SelectItem key={project.value} value={project.value}>
                {project.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <DatePicker
        placeholder="Due date"
        className="h-8 w-full lg:w-auto"
        value={dueDate ? new Date(dueDate) : undefined}
        onChange={(date) =>
          setFilters({ dueDate: date ? date.toISOString() : null })
        }
      />
    </div>
  );
};
