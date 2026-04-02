import React from "react";
import { useProjectId } from "../hooks/use-projectId";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAddCollaboratorToProject } from "../api/use-add-collaborator-to-project";
import { Input } from "@/components/ui/input";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

interface AddCollaboratorToProjectProps {
  onCancel?: () => void;
}
export const AddCollaboratorToProjectForm = ({
  onCancel,
}: AddCollaboratorToProjectProps) => {
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const { mutate, isPending } = useAddCollaboratorToProject();

  const router = useRouter();
  const form = useForm({
    defaultValues: {
      username: "",
    },
  });
  const onSubmit = () => {
    mutate(
      {
        json: {
          projectId,
          username: form.getValues("username"),
        },
        param: {
          projectId,
        },
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
          Add New Collaborator
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <Separator className="bg-border/55" />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Github Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter Github username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-6 flex w-full items-center justify-between gap-6">
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
                Add Collaborator
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
