"use client";
import { useRef } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Github } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCreateProject } from "../api/use-create-project";
import {
  addExistingProjectSchema,
  AddExistingProjectSchema,
  type CreateProjectSchema,
  createProjectSchema,
} from "../schemas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAddExistingProject } from "../api/use-add-existing-project";
import { useGetRepos } from "../api/use-get-repos";

interface CreateProjectFormProps {
  onCancel?: () => void;
}

export const CreateProjectForm = ({ onCancel }: CreateProjectFormProps) => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const { mutate, isPending } = useCreateProject();
  const { mutate: mutateEP, isPending: isPendingEP } = useAddExistingProject();
  const { data: repos, isLoading: isLoadingRepos, error: reposError } = useGetRepos({ workspaceId });
  const newIconInputRef = useRef<HTMLInputElement>(null);
  const existingIconInputRef = useRef<HTMLInputElement>(null);
  const form1 = useForm<CreateProjectSchema>({
    resolver: zodResolver(createProjectSchema.omit({ workspaceId: true })),
    defaultValues: {
      name: "",
      image: "",
    },
  });

  const form2 = useForm<AddExistingProjectSchema>({
    resolver: zodResolver(addExistingProjectSchema.omit({ workspaceId: true })),
    defaultValues: {
      image: "",
      projectLink: "",
      repoFullName: "",
    },
  });

  const onSubmit = (values: CreateProjectSchema) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : "",
      workspaceId,
    };
    mutate(
      { form: finalValues },
      {
        onSuccess: ({ data }) => {
          form1.reset();
          onCancel?.();
          router.push(`/workspaces/${workspaceId}/projects/${data.$id}`);
        },
      },
    );
  };
  const onSubmitEp = (values: AddExistingProjectSchema) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : "",
      workspaceId,
    };
    mutateEP(
      { form: finalValues },
      {
        onSuccess: ({ data }) => {
          form2.reset();
          onCancel?.();
          router.push(`/workspaces/${workspaceId}/projects/${data.$id}`);
        },
      },
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form1.setValue("image", file);
    }
  };
  const handleImageChangeForEp = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form2.setValue("image", file);
    }
  };

  return (
    <Tabs defaultValue="create-new-project" className="w-full px-6 py-8">
      <TabsList className="grid grid-cols-2 gap-2">
        <TabsTrigger
          className="h-9 w-full lg:w-auto"
          value="create-new-project"
        >
          Create New Project
        </TabsTrigger>
        <TabsTrigger
          className="h-9 w-full lg:w-auto"
          value="add-existing-project"
        >
          Add Existing Project
        </TabsTrigger>
      </TabsList>
      <TabsContent value="create-new-project">
        <Card className="size-full border-none bg-card shadow-none backdrop-blur-xl dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent),hsl(var(--surface-elevated))] dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.8)]">
          <CardHeader className="flex p-7">
            <CardTitle className="text-xl font-bold">
              Create new project
            </CardTitle>
            <CardDescription>
              Create a new project and connect it to your workspace
            </CardDescription>
          </CardHeader>
          <div className="px-7">
            <Separator className="bg-border/55" />
          </div>
          <CardContent className="p-7">
            <Form {...form1}>
              <form onSubmit={form1.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-y-4">
                  <FormField
                    control={form1.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter project name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form1.control}
                    name="image"
                    render={({ field }) => (
                      <div className="flex flex-col gap-y-2">
                        <div className="flex items-center gap-x-5">
                          {field.value ? (
                            <div className="relative size-[72px] overflow-hidden rounded-md">
                              <Image
                                fill
                                src={
                                  field.value instanceof File
                                    ? URL.createObjectURL(field.value)
                                    : field.value
                                }
                                alt="Project Icon"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                              <Avatar className="size-[72px]">
                              <AvatarFallback className="bg-muted/70">
                                <ImageIcon className="size-[36px] text-neutral-400" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex flex-col">
                            <p className="text-sm">Project Icon</p>
                            <p className="text-sm text-muted-foreground">
                              PNG, JPG, JPEG, or SVG, max 1MB
                            </p>
                            <input
                              hidden
                              type="file"
                              ref={newIconInputRef}
                              disabled={isPending}
                              onChange={handleImageChange}
                              accept=".jpg, .jpeg, .png, .svg"
                            />
                            {field.value ? (
                              <Button
                                size="sm"
                                type="button"
                                variant="destructive"
                                className="mt-2 w-fit"
                                disabled={isPending}
                                onClick={() => {
                                  field.onChange(null);
                                  if (newIconInputRef.current)
                                    newIconInputRef.current.value = "";
                                }}
                              >
                                Remove Icon
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                type="button"
                                variant="secondary"
                                className="mt-2 w-fit"
                                disabled={isPending}
                                onClick={() => newIconInputRef.current?.click()}
                              >
                                Upload Icon
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  />
                </div>

                <Separator className="my-7 bg-border/55" />

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
                    size="lg"
                    className="w-1/2 rounded-2xl"
                    type="submit"
                  >
                    {isPending ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" /> Creating...
                      </span>
                    ) : (
                      "Create project"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="add-existing-project">
        <Card className="size-full border-none bg-card shadow-none backdrop-blur-xl dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent),hsl(var(--surface-elevated))] dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.8)]">
          <CardHeader className="flex p-7">
            <CardTitle className="text-xl font-bold">
              Add existing project
            </CardTitle>
            <CardDescription>
              Add your existing github repository here as project
            </CardDescription>
          </CardHeader>
          <div className="px-7">
            <Separator className="bg-border/55" />
          </div>
          <CardContent className="p-7">
            <Form {...form2}>
              <form onSubmit={form2.handleSubmit(onSubmitEp)}>
                <div className="flex flex-col gap-y-4">
                  {repos && repos.length > 0 ? (
                    <FormField
                      control={form2.control}
                      name="repoFullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Github className="h-4 w-4" />
                            Select Repository
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pick a repository..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {repos.map((repo) => (
                                <SelectItem key={repo.id} value={repo.full_name}>
                                  {repo.full_name}
                                  {repo.private && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      private
                                    </span>
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      control={form2.control}
                      name="projectLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {isLoadingRepos ? (
                              <span className="inline-flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" /> Loading repositories...
                              </span>
                            ) : reposError ? (
                              "GitHub link (connect GitHub in workspace settings for repo picker)"
                            ) : (
                              "GitHub link"
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Paste your GitHub link here"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <div className="">
                    <FormField
                      control={form2.control}
                      name="image"
                      render={({ field }) => (
                        <div className="flex flex-col gap-y-2">
                          <div className="flex items-center gap-x-5">
                            {field.value ? (
                              <div className="relative size-[72px] overflow-hidden rounded-md">
                                <Image
                                  fill
                                  src={
                                    field.value instanceof File
                                      ? URL.createObjectURL(field.value)
                                      : field.value
                                  }
                                  alt="Project Icon"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <Avatar className="size-[72px]">
                                <AvatarFallback className="bg-muted/70">
                                  <ImageIcon className="size-[36px] text-neutral-400" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex flex-col">
                              <p className="text-sm">Project Icon</p>
                              <p className="text-sm text-muted-foreground">
                                PNG, JPG, JPEG, or SVG, max 1MB
                              </p>
                              <input
                                hidden
                                type="file"
                                ref={existingIconInputRef}
                                disabled={isPendingEP}
                                onChange={handleImageChangeForEp}
                                accept=".jpg, .jpeg, .png, .svg"
                              />
                              {field.value ? (
                                <Button
                                  size="sm"
                                  type="button"
                                  variant="destructive"
                                  className="mt-2 w-fit"
                                  disabled={isPendingEP}
                                  onClick={() => {
                                    field.onChange(null);
                                    if (existingIconInputRef.current)
                                      existingIconInputRef.current.value = "";
                                  }}
                                >
                                  Remove Icon
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  type="button"
                                  variant="secondary"
                                  className="mt-2 w-fit"
                                  disabled={isPendingEP}
                                  onClick={() =>
                                    existingIconInputRef.current?.click()
                                  }
                                >
                                  Upload Icon
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </div>
                <Separator className="my-7 bg-border/55" />
                <div className="mt-6 flex w-full items-center justify-between gap-4">
                  <Button
                    type="button"
                    size="lg"
                    variant="destructive"
                    onClick={onCancel}
                    disabled={isPendingEP}
                    className={cn(!onCancel && "invisible", "w-1/2 rounded-2xl")}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="lg"
                    disabled={isPendingEP}
                    className="w-1/2 rounded-2xl"
                    type="submit"
                  >
                    {isPendingEP ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" /> Adding...
                      </span>
                    ) : (
                      "Add project"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
