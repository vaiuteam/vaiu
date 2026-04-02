"use client";
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

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { cn } from "@/lib/utils";

import { createPrSchema, type CreatePrSchema } from "../schemas";
import { useCreatePr } from "../api/use-create-pr";
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
  const form = useForm<CreatePrSchema>({
    resolver: zodResolver(createPrSchema),
    defaultValues: {
      description: "",
      branch: "",
      baseBranch: "",
      githubUsername: "",
    },
  });
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
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">
          Create a pull request
        </CardTitle>
        <CardDescription className="">
          To create a PR you need to push the changes first to your branch.
        </CardDescription>
      </CardHeader>
      <div className="px-7">
        <Separator className="bg-border/55" />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex justify-between">
                      <div className="flex items-center">Title</div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pull request description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter pull request description"
                        className="rounded-2xl border border-border/70 bg-background/50 shadow-none backdrop-blur-sm dark:border-border dark:bg-background/35"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="">
                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex justify-between">
                        <div className="flex items-center">Branch name</div>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter branch name"
                        />
                      </FormControl>
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
                          Base Branch name
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter base branch"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="">
                <FormField
                  control={form.control}
                  name="githubUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex justify-between">
                        <div className="flex items-center">GitHub Username</div>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your GitHub username"
                        />
                      </FormControl>
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
