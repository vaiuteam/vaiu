"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { cn } from "@/lib/utils";

import { createPrSchema, type CreatePrSchema } from "../schemas";
import { useCreatePr } from "../api/use-create-pr";
import { useGetPrCreateOptions } from "../api/use-get-pr-create-options";
import { Textarea } from "@/components/ui/textarea";
import { useProjectId } from "@/features/projects/hooks/use-projectId";

interface CreatePrProps {
  onCancel?: () => void;
}

export const CreatePrForm = ({ onCancel }: CreatePrProps) => {
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const router = useRouter();
  const { mutate, isPending } = useCreatePr();
  const { data: prOptions, isLoading: loadingPrOptions } =
    useGetPrCreateOptions({ projectId });
  const form = useForm<CreatePrSchema>({
    resolver: zodResolver(createPrSchema),
    defaultValues: {
      description: "",
      headOwner: "",
      headRepo: "",
      branch: "",
      baseBranch: "",
    },
  });
  const headOwner = form.watch("headOwner");
  const headRepo = form.watch("headRepo");
  const selectedHeadProject = prOptions?.headProjects.find(
    (project) => project.owner === headOwner && project.repo === headRepo,
  );

  useEffect(() => {
    if (!prOptions) return;

    const headProject = prOptions.headProjects[0];
    if (headProject && !form.getValues("headOwner")) {
      form.setValue("headOwner", headProject.owner ?? "");
      form.setValue("headRepo", headProject.repo ?? "");
    }

    if (headProject?.branches[0] && !form.getValues("branch")) {
      form.setValue("branch", headProject.branches[0]);
    }

    if (prOptions.baseProject.branches[0] && !form.getValues("baseBranch")) {
      form.setValue("baseBranch", prOptions.baseProject.branches[0]);
    }
  }, [form, prOptions]);

  const onSubmit = (values: CreatePrSchema) => {
    const finalValues = {
      ...values,
    };
    mutate(
      {
        param: { projectId },
        form: finalValues,
      },
      {
        onSuccess: () => {
          form.reset();
          router.push(`/workspaces/${workspaceId}/projects/${projectId}`);
        },
      },
    );
  };

  return (
    <Card className="size-full border-none bg-card shadow-none backdrop-blur-xl dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent),hsl(var(--surface-elevated))] dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.8)]">
      <CardHeader className="flex p-6 pb-4">
        <CardTitle className="text-2xl font-bold">Create a pull request</CardTitle>
        <CardDescription>
          Push your branch first, then describe the change here. Reviewers will see this exact text on GitHub.
        </CardDescription>
      </CardHeader>
      <div className="px-6">
        <Separator className="bg-border/55" />
      </div>
      <CardContent className="p-6 pt-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pull request description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="What changed and why. Mention related issues with #123."
                      rows={10}
                      className="min-h-[220px] resize-y rounded-2xl border border-border/70 bg-background/50 px-4 py-3 text-sm leading-relaxed shadow-none backdrop-blur-sm focus-visible:ring-1 focus-visible:ring-ring dark:border-border dark:bg-background/35"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="">
                <FormField
                  control={form.control}
                  name="headOwner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex justify-between">
                        <div className="flex items-center">Head project</div>
                      </FormLabel>
                      <Select
                        value={
                          field.value && headRepo
                            ? `${field.value}/${headRepo}`
                            : undefined
                        }
                        onValueChange={(value) => {
                          const [owner, repo] = value.split("/");
                          field.onChange(owner);
                          form.setValue("headRepo", repo);
                          form.setValue("branch", "");
                        }}
                        disabled={loadingPrOptions}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select head project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {prOptions?.headProjects.map((project) => (
                            <SelectItem
                              key={project.fullName}
                              value={project.fullName}
                            >
                              {project.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="">
                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex justify-between">
                        <div className="flex items-center">Head branch</div>
                      </FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        disabled={loadingPrOptions || !selectedHeadProject}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select head branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedHeadProject?.branches.map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              {branch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="">
                <FormField
                  control={form.control}
                  name="baseBranch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex justify-between">
                        <div className="flex items-center">
                          Base branch ({prOptions?.baseProject.fullName ?? "project"})
                        </div>
                      </FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        disabled={loadingPrOptions}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select base branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {prOptions?.baseProject.branches.map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              {branch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="mt-6 flex w-full items-center justify-between gap-4">
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
                size="lg"
                className="w-1/2 rounded-2xl"
              >
                Create Pull Request
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
