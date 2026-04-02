"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { RoomSchema } from "../schemas";
import { useCreateRoom } from "../api/use-create-room";
import { cn } from "@/lib/utils";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { RoomType } from "../types";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";

interface CreateRoomFormProps {
  onCancel?: () => void;
}

const CreateChannelForm = ({ onCancel }: CreateRoomFormProps) => {
  const workspaceId = useWorkspaceId();

  const router = useRouter();

  const { mutate, isPending } = useCreateRoom();

  const { data: projects } = useGetProjects({
    workspaceId: workspaceId,
  });

  const projectOptions = projects?.documents.map((project) => ({
    id: project.$id,
    name: project.name,
    imageUrl: project.imageUrl,
  }));

  const form = useForm<z.infer<typeof RoomSchema>>({
    resolver: zodResolver(RoomSchema),
    defaultValues: {
      name: "",
      roomType: RoomType.AUDIO,
      workspaceId: workspaceId,
    },
  });

  useEffect(() => {
    form.setValue("roomType", RoomType.AUDIO);
  }, [form]);

  const onSubmit = async (values: z.infer<typeof RoomSchema>) => {
    try {
      mutate(
        { json: { ...values, workspaceId } },
        {
          onSuccess: () => {
            form.reset();
            router.push(
              `/workspaces/${workspaceId}/projects/${values.projectId}`,
            );
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Card className="size-full border-none bg-card shadow-none backdrop-blur-xl dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent),hsl(var(--surface-elevated))] dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.8)]">
      <CardHeader className="flex p-5">
        <CardTitle className="text-xl font-bold">Create new Room</CardTitle>
        <CardDescription>
          Create a new room and assign it to a project
        </CardDescription>
      </CardHeader>
      <div className="px-5">
        <Separator className="bg-border/55" />
      </div>
      <CardContent className="p-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Room name <span className="ml-0.5 text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter room name"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roomType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Room Type <span className="ml-0.5 text-red-500">*</span>
                    </FormLabel>
                    <Select
                      disabled={isPending}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            className="text-muted-foreground"
                            placeholder="Select a room type"
                          />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {Object.values(RoomType).map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="cursor-pointer capitalize"
                          >
                            {type.toLowerCase()}
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
                  <FormItem>
                    <FormLabel>
                      Select a project
                      <span className="ml-0.5 text-red-500">*</span>
                    </FormLabel>
                    <Select
                      disabled={isPending}
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
                        {projectOptions?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className="flex cursor-pointer items-center gap-x-2">
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
                className="w-1/2 rounded-2xl"
                type="submit"
                size="lg"
              >
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> Creating...
                  </span>
                ) : (
                  "Create Room"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateChannelForm;
