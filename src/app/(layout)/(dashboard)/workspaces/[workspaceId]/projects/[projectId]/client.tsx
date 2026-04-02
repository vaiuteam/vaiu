"use client";
import {
  UserPlus2,
  EllipsisVertical,
  Settings,
  UploadIcon,
  Copy,
  CheckIcon,
  BarChartHorizontal,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState, useEffect, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";

import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { PrViewSwitcher } from "@/features/pull-requests/components/pr-view-switcher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskViewSwitcher } from "@/features/issues/components/task-view-switcher";
import { Button } from "@/components/ui/button";
import { useProjectId } from "@/features/projects/hooks/use-projectId";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { Loader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { useGetProjectAnalytics } from "@/features/projects/api/use-get-project-analytics";
import { Analytics } from "@/components/analytics";
import { useAddCollaboratorToProjectModal } from "@/features/projects/hooks/use-add-collaborator-to-project-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFileUploadModal } from "@/features/projects/hooks/use-file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaGithub } from "react-icons/fa";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { MemberAvatar } from "@/features/members/components/members-avatar";
import { Member } from "@/features/members/types";
import { HoverCard } from "@/components/ui/hover-card";
import { HoverCardContent, HoverCardTrigger } from "@radix-ui/react-hover-card";
import Image from "next/image";
import { useGetProjectMembers } from "@/features/members/api/use-get-project-members";

export const ProjectIdClient = () => {
  const projectId = useProjectId();
  const workspaceId = useWorkspaceId();
  const { data: project, isLoading: projectsLoading } = useGetProject({
    projectId,
  });

  const { data: analytics, isLoading: analyticsLoading } =
    useGetProjectAnalytics({ projectId });

  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const { open: openCollaboratorModal } = useAddCollaboratorToProjectModal();
  const { openFileUploader } = useFileUploadModal();
  const { data: members, isLoading: membersLoading } = useGetProjectMembers({
    workspaceId,
    projectId,
  });

  const isLoading = projectsLoading || analyticsLoading || membersLoading;

  const settingsUrl = useMemo(() => {
    if (!project) return "";
    return `/workspaces/${project.workspaceId}/projects/${project.$id}/settings`;
  }, [project]);

  const userManagementUrl = useMemo(() => {
    if (!project) return "";
    return `/workspaces/${project.workspaceId}/projects/${project.$id}/members`;
  }, [project]);

  const analyticsUrl = useMemo(() => {
    if (!project) return "";
    return `/workspaces/${project.workspaceId}/projects/${project.$id}/analytics`;
  }, [project]);

  const navigateTo = (url: string) => {
    if (!url) return;
    window.location.assign(url);
  };

  const handleFileUpload = async () => {
    try {
      const result = await openFileUploader();
      if (result && result.get("success") === "true") {
        toast.success("README uploaded successfully");
      }
    } catch (error) {
      console.error("Error opening file uploader:", error);
      toast.error("Failed to open file uploader");
    }
  };

  const scrollPositionRef = useRef(0);

  // Process README content to handle any inconsistencies
  const processReadmeContent = (content: string | null) => {
    if (!content) return null;

    // Remove any duplicate heading markers that might cause rendering issues
    const processedContent = content
      .replace(/#{3,}/g, "### ") // Normalize headings with more than 3 #'s
      .replace(/\n#{1,2}\s*$/gm, "\n") // Remove empty h1 and h2 headings at end of lines
      .replace(/^#{1,2}\s*$/gm, "") // Remove standalone h1 and h2 headers
      .trim();

    return processedContent;
  };

  const handleCopyText = (text: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      // Store current scroll position
      scrollPositionRef.current = window.scrollY;
    }

    // Use the clipboard API with try/catch for better error handling
    try {
      navigator.clipboard.writeText(text);
      setCopiedText(text);

      // Use requestAnimationFrame for smoother scroll restoration
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: "auto", // Use 'auto' instead of smooth to prevent visible scrolling
        });
      });

      setTimeout(() => {
        setCopiedText(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  useEffect(() => {
    if (project && project.readme) {
      setReadmeContent(processReadmeContent(project.readme));
    } else {
      setReadmeContent(null);
    }
  }, [project]);

  if (isLoading) return <Loader />;
  if (!project) return <PageError message="Project not found" />;

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent),hsl(var(--surface))] p-5 shadow-none backdrop-blur-xl dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.75)] md:flex-row md:items-center">
        <div className="flex items-center gap-x-3">
          <ProjectAvatar
            name={project.name}
            image={project.imageUrl}
            className="size-10"
          />
          <div>
            <p className="text-xl font-semibold capitalize">{project.name}</p>
            <p className="text-sm text-muted-foreground">
              Issues, pull requests, docs, and collaboration in one place.
            </p>
          </div>
          <Link
            href={`https://github.com/${project.owner}/${project.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-muted-foreground transition hover:text-foreground"
            title="View on GitHub"
          >
            <FaGithub className="size-5" />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <MembersList data={members?.documents || []} />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="ml-2" asChild>
              <Button variant="outline" size="default" className="items-center rounded-2xl border-transparent bg-background/45">
                <p className="text-sm">Actions</p>
                <EllipsisVertical className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleFileUpload} className="gap-2">
                <UploadIcon className="h-4 w-4" />
                Upload README
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={openCollaboratorModal}
                className="gap-2"
              >
                <UserPlus2 className="h-4 w-4" />
                Add collaborator
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => navigateTo(userManagementUrl)}
                className="gap-2"
              >
                <UserPlus2 className="h-4 w-4" />
                User management
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => navigateTo(analyticsUrl)}
                className="gap-2"
              >
                <BarChartHorizontal className="h-4 w-4" />
                Analytics
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => navigateTo(settingsUrl)}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {analytics && <Analytics data={analytics} />}

      <Tabs defaultValue="issues" className="w-full">
        <TabsList className="h-11 w-full overflow-hidden rounded-2xl bg-background/45 p-1 backdrop-blur-sm lg:w-auto">
          <TabsTrigger
            value="issues"
            className="h-9 w-full rounded-xl bg-transparent px-4 text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:shadow-sm lg:w-auto"
          >
            Issues
          </TabsTrigger>
          <TabsTrigger
            value="pull-requests"
            className="h-9 w-full rounded-xl bg-transparent px-4 text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:shadow-sm lg:w-auto"
          >
            Pull Requests
          </TabsTrigger>
        </TabsList>
        <TabsContent value="issues">
          <TaskViewSwitcher hideProjectFilter />
        </TabsContent>
        <TabsContent value="pull-requests">
          <PrViewSwitcher />
        </TabsContent>
      </Tabs>

      {/* Readme Display */}
      {isLoading ? (
        <div className="mt-4">
          <Loader />
        </div>
      ) : readmeContent ? (
        <Card className="mt-2 overflow-hidden border-none bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent),hsl(var(--card))] shadow-none dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.75)]">
          <CardHeader className="flex flex-row items-center justify-between bg-background/10">
            <CardTitle>README</CardTitle>
            {/* Update the README copy button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleCopyText(readmeContent, e)}
              className="h-8 px-2 text-muted-foreground"
            >
              {copiedText === readmeContent ? (
                <CheckIcon className="mr-2 size-4 text-green-500" />
              ) : (
                <Copy className="mr-2 size-4" />
              )}
              {copiedText === readmeContent ? "Copied" : "Copy"}
            </Button>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none overflow-hidden p-6 font-sans">
            <div className="markdown-container text-base">
              <ReactMarkdown
                components={{
                  h1: ({ ...props }) => (
                    <h2
                      className="mb-4 font-sans text-xl font-bold"
                      {...props}
                    />
                  ),
                  h2: ({ ...props }) => (
                    <h3
                      className="mb-3 mt-6 font-sans text-lg font-bold"
                      {...props}
                    />
                  ),
                  h3: ({ ...props }) => (
                    <h4
                      className="mb-2 mt-5 font-sans text-base font-semibold"
                      {...props}
                    />
                  ),
                  p: ({ ...props }) => (
                    <p
                      className="my-3 font-sans text-base leading-relaxed"
                      {...props}
                    />
                  ),
                  ul: ({ ...props }) => (
                    <ul className="my-3 list-disc pl-6 font-sans" {...props} />
                  ),
                  ol: ({ ...props }) => (
                    <ol
                      className="my-3 list-decimal pl-6 font-sans"
                      {...props}
                    />
                  ),
                  li: ({ ...props }) => (
                    <li className="mb-1 font-sans" {...props} />
                  ),
                  blockquote: ({ ...props }) => (
                    <blockquote
                      className="my-3 border-l-2 border-border/50 py-1 pl-4 font-sans italic"
                      {...props}
                    />
                  ),
                  code: ({
                    inline,
                    className,
                    children,
                    ...props
                  }: React.ComponentPropsWithoutRef<"code"> & {
                    inline?: boolean;
                    className?: string;
                  }) => {
                    if (!children) return null;

                    const match = /language-(\w+)/.exec(className || "");
                    const codeText = String(children).replace(/\n$/, "");

                    return inline ? (
                      <code
                        className="max-w-7xl rounded-md bg-muted/80 px-1.5 py-0.5 font-mono text-sm"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <div className="relative my-3 max-w-4xl overflow-hidden rounded-xl bg-muted/45 shadow-none dark:shadow-sm">
                        <div className="flex items-center justify-between bg-muted/70 px-3 py-1.5 text-xs font-semibold">
                          <span>
                            {match && match[1]
                              ? match[1].toUpperCase()
                              : "CODE"}
                          </span>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyText(codeText, e);
                            }}
                            className="text-muted-foreground transition hover:text-foreground focus:outline-none"
                            aria-label="Copy code"
                          >
                            {copiedText === codeText ? (
                              <CheckIcon className="size-3.5 text-green-500" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                        </div>
                        <pre className="m-0 overflow-x-auto bg-background/60 p-3">
                          <code
                            className={`language-${match ? match[1] : ""} font-mono text-sm`}
                            {...props}
                          >
                            {children}
                          </code>
                        </pre>
                      </div>
                    );
                  },
                  pre: ({ children }) => <>{children}</>,
                  a: ({ href, ...props }) => (
                    <a
                      className="font-sans text-blue-500 hover:underline"
                      href={href}
                      target={href?.startsWith("http") ? "_blank" : undefined}
                      rel={
                        href?.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      {...props}
                    />
                  ),
                  img: ({ src, alt, height, width, ...props }) => {
                    // Parse height and width to numbers or use defaults
                    const parsedHeight = height ? Number(height) : 600;
                    const parsedWidth = width ? Number(width) : 800;

                    return (
                      <Image
                        width={parsedWidth}
                        height={parsedHeight}
                        src={src || ""}
                        alt={alt || ""}
                        className="my-4 h-auto max-w-full rounded"
                        loading="lazy"
                        {...props}
                      />
                    );
                  },
                  table: ({ ...props }) => (
                    <div className="my-3 overflow-x-auto">
                      <table
                        className="min-w-full divide-y divide-border font-sans"
                        {...props}
                      />
                    </div>
                  ),
                  thead: ({ ...props }) => (
                    <thead
                      className="bg-muted/70 font-sans"
                      {...props}
                    />
                  ),
                  th: ({ ...props }) => (
                    <th
                      className="px-4 py-3 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      {...props}
                    />
                  ),
                  td: ({ ...props }) => (
                    <td className="px-4 py-3 font-sans text-sm" {...props} />
                  ),
                }}
                remarkPlugins={[]}
              >
                {readmeContent || ""}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-2 border-none bg-card/70 p-6 text-center shadow-none">
          <p className="font-sans text-muted-foreground">
            No README file found. Upload one to display project information.
          </p>
          <Button
            onClick={handleFileUpload}
            variant="outline"
            size="sm"
            className="mt-3"
          >
            <UploadIcon className="mr-2 size-4" />
            Upload README
          </Button>
        </Card>
      )}
    </div>
  );
};

interface MembersListProps {
  data: Member[];
}
export const MembersList = ({ data }: MembersListProps) => {
  return (
    <div className="col-span-1 flex flex-col gap-y-4">
      <ul className="flex -space-x-2">
        {data && data.length > 0 ? (
          <>
            {data.map((member) => (
              <li key={member.$id} className="flex w-fit gap-4">
                <HoverCard>
                  <HoverCardTrigger>
                    <MemberAvatar className="size-8" name={member.name} />
                  </HoverCardTrigger>
                  <HoverCardContent
                    side="top"
                    className="flex flex-col items-center gap-x-2 p-2"
                  >
                    <div className="flex flex-col items-center overflow-hidden p-2">
                      <p className="line-clamp-1 max-w-36 text-sm font-medium">
                        {member.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.role}
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </li>
            ))}
          </>
        ) : (
          <li className="hidden text-center text-sm text-muted-foreground first-of-type:block"></li>
        )}
      </ul>
    </div>
  );
};
