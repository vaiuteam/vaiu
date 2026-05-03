"use client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreVerticalIcon } from "lucide-react";
import Link from "next/link";

import { snakeCaseToTitleCase } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Issue } from "@/features/issues/types";

import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { MemberAvatar } from "@/features/members/components/members-avatar";
import { SourceTypeBadge } from "@/components/type-badge";

import { TaskDate } from "./task-date";
import { TaskActions } from "./task-actions";

export const columns: ColumnDef<Issue>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Issue Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.original.name;
      const number = row.original.number;
      const project = row.original.project;
      const issueType = row.original.issueType;

      const titleNode =
        number && project?.owner && project?.name && issueType !== "vaiu" ? (
          <Link
            href={`https://github.com/${project.owner}/${project.name}/issues/${number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            <p className="line-clamp-1">#{number} {name}</p>
          </Link>
        ) : (
          <p className="line-clamp-1">{name}</p>
        );

      return (
        <div className="flex items-center gap-2">
          {titleNode}
          <SourceTypeBadge type={issueType} kind="issue" showIcon={false} />
        </div>
      );
    },
  },
  {
    accessorKey: "project",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const project = row.original.project;

      if (!project) {
        return (
          <div className="flex items-center gap-x-2 font-medium">
            <p className="text-muted-foreground">No project</p>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-x-2 font-medium">
          <ProjectAvatar
            image={project.imageUrl}
            className="size-6"
            name={project.name}
          />
          <p className="line-clamp-1">{project.name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "assignee",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Assignee
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const assignee = row.original.assignee || row.original.assigneeId;

      return (
        <div className="flex items-center gap-x-2 font-medium">
          <MemberAvatar
            fallbackClassName="text-xs"
            className="size-6"
            name={assignee?.name || assignee || "No Assignee"}
          />
          <p className="line-clamp-1">
            {assignee?.name || assignee || "No Assignee"}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Due Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dueDate = row.original.dueDate;
      return <TaskDate value={dueDate} />;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status;
      return <Badge variant={status}>{snakeCaseToTitleCase(status)}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.$id;
      const project = row.original.project;

      if (!project) {
        return (
          <Button
            variant="ghost"
            className="size-8 p-0"
            disabled
            title="No project associated"
          >
            <MoreVerticalIcon className="size-4" />
          </Button>
        );
      }

      return (
        <TaskActions id={id} projectId={project.$id}>
          <Button variant="ghost" className="size-8 p-0">
            <MoreVerticalIcon className="size-4" />
          </Button>
        </TaskActions>
      );
    },
  },
];
