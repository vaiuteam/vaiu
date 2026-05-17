"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { FaGithub } from "react-icons/fa";

import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
// import { DatePicker } from "@/components/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-projectId";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { MemberAvatar } from "@/features/members/components/members-avatar";
import {
  type CreateTaskSchema,
  createTaskSchema,
} from "@/features/issues/schemas";

import { IssueStatus } from "../types";
import { useCreateTask } from "../api/use-create-task";

/** Select sentinel for "no assignee" (Radix Select needs a non-empty value). */
const UNASSIGNED = "__none__";

interface CreateTaskFormProps {
  onCancel?: () => void;
  projectOptions: {
    id: string;
    name: string;
    imageUrl: string;
    projectType: "vaiu" | "github";
  }[];
  memberOptions: {
    id: string;
    name: string;
  }[];
}

export const CreateTaskForm = ({
  onCancel,
  memberOptions,
  projectOptions,
}: CreateTaskFormProps) => {
  const workspaceId = useWorkspaceId();
  const routeProjectId = useProjectId();
  const { mutate, isPending } = useCreateTask();
  const form = useForm<CreateTaskSchema>({
    resolver: zodResolver(createTaskSchema.omit({ workspaceId: true })),
    defaultValues: {
      workspaceId,
      issueType: "github",
    },
  });

  const selectedProjectId = useWatch({ control: form.control, name: "projectId" });
  const selectedProject = projectOptions.find((p) => p.id === selectedProjectId);
  const showGithubIssueOption =
    !selectedProject || selectedProject.projectType !== "vaiu";

  useEffect(() => {
    if (!routeProjectId) return;
    const exists = projectOptions.some((p) => p.id === routeProjectId);
    if (!exists) return;
    if (form.getValues("projectId") !== routeProjectId) {
      form.setValue("projectId", routeProjectId);
    }
  }, [routeProjectId, projectOptions, form]);

  useEffect(() => {
    if (selectedProject?.projectType !== "vaiu") return;
    if (form.getValues("issueType") === "github") {
      form.setValue("issueType", "vaiu");
    }
  }, [selectedProject?.projectType, selectedProjectId, form]);

  const onSubmit = (values: CreateTaskSchema) => {
    mutate(
      { json: { ...values, workspaceId } },
      {
        onSuccess: () => {
          form.reset();
          onCancel?.();
          // TODO: redirect to new task
        },
      },
    );
  };

  return (
    <Card className="size-full border-none bg-card shadow-none backdrop-blur-xl dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent),hsl(var(--surface-elevated))] dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.8)]">
      <CardHeader className="flex p-6 pb-4">
        <CardTitle className="text-2xl font-bold">Create new issue</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add the details below. Description supports multiple paragraphs and code blocks.
        </p>
      </CardHeader>
      <div className="px-6">
        <Separator className="bg-border/55" />
      </div>
      <CardContent className="p-6 pt-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {showGithubIssueOption && (
                <FormField
                  control={form.control}
                  name="issueType"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>
                        Issue type <span className="ml-0.5 text-red-500">*</span>
                      </FormLabel>
                      <Select
                        value={field.value ?? "github"}
                        onValueChange={field.onChange}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose issue type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="github">
                            <span className="inline-flex items-center gap-2">
                              <FaGithub className="h-4 w-4" />
                              GitHub issue
                            </span>
                          </SelectItem>
                          <SelectItem value="vaiu">
                            <span className="inline-flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              Vaiu issue
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {field.value === "vaiu"
                          ? "A Vaiu issue is tracked only in this workspace and isn’t synced to GitHub."
                          : "A GitHub issue will be created on the linked repository and stays in sync with GitHub."}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>
                      Issue name <span className="ml-0.5 text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter issue title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>
                      Issue Description{" "}
                      <span className="ml-0.5 text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe what needs to be done. Add steps to reproduce, expected behavior, or any context. Markdown-style line breaks are preserved."
                        rows={10}
                        className="min-h-[220px] resize-y rounded-2xl border border-border/70 bg-background/50 px-4 py-3 text-sm leading-relaxed shadow-none backdrop-blur-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-border dark:bg-background/35"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        placeholder="Select due date"
                        className="text-muted-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>
                      Due Date <span className="ml-0.5 text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <input
                        type="date"
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? new Date(e.target.value)
                              : undefined,
                          )
                        }
                        className="flex h-12 w-full rounded-2xl border border-border/70 bg-background/50 px-3 py-2 text-sm backdrop-blur-sm dark:border-border dark:bg-background/35"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>Assignee (optional)</FormLabel>
                    <Select
                      value={field.value ?? UNASSIGNED}
                      onValueChange={(v) =>
                        field.onChange(v === UNASSIGNED ? undefined : v)
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            className="text-muted-foreground"
                            placeholder="Select an assignee"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                        {memberOptions.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-x-2">
                              <MemberAvatar
                                className="size-6"
                                name={member.name}
                              />
                              {member.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>
                      Status <span className="ml-0.5 text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            className="text-muted-foreground"
                            placeholder="Select status"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(IssueStatus).map(([key, value]) => (
                          <SelectItem key={value} value={value.toUpperCase()}>
                            {key
                              .replace("_", " ")
                              .toLowerCase()
                              .replace(/\b\w/g, (char) => char.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>
                      Project <span className="ml-0.5 text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            className="text-muted-foreground"
                            placeholder="Select a project"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projectOptions.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className="flex items-center gap-x-2">
                              <ProjectAvatar
                                image={project.imageUrl}
                                className="size-6"
                                name={project.name}
                              />
                              {project.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Separator className="my-4 bg-border/55" />
            <div className="mt-4 flex w-full items-center justify-between gap-4">
              <Button
                type="button"
                size="lg"
                variant="destructive"
                onClick={onCancel}
                disabled={isPending}
                className={cn(!onCancel && "invisible", "w-1/2 rounded-2xl")}
              >
                Cancel
              </Button>
              <Button
                disabled={isPending}
                type="submit"
                className="w-1/2 rounded-2xl"
                size="lg"
              >
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> Creating...
                  </span>
                ) : (
                  "Create Issue"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
