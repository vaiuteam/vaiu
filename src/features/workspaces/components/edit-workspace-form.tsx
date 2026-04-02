"use client";
import { useRef } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CopyIcon, ImageIcon } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useConfirm } from "@/hooks/use-confirm";

import { type UpdateWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { useUpdateWorkspace } from "../api/use-update-workspace";
import { useDeleteWorkspace } from "../api/use-delete-workspace";
import { useResetInviteCode } from "../api/use-reset-invite-code";
import { type Workspace } from "../types";
import { toast } from "sonner";

interface EditWorkspaceFormProps {
  onCancel?: () => void;
  initialValues: Workspace;
}

export const EditWorkspaceForm = ({
  onCancel,
  initialValues,
}: EditWorkspaceFormProps) => {
  const router = useRouter();
  const { mutate, isPending } = useUpdateWorkspace();
  const { mutate: deleteWorkspace, isPending: deletingWorkspace } =
    useDeleteWorkspace();

  const [DeleteWorkspaceDialog, confirmDelete] = useConfirm(
    "Delte workspace",
    "Are you sure you want to delete this workspace?",
    "destructive",
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const absoluteInviteLink = `${window.location.origin}/workspaces/${initialValues.$id}/join/${initialValues.inviteCode}`;

  const { mutate: resetInviteCode, isPending: resetingInviteCode } =
    useResetInviteCode();

  const [ResetDialog, confirmReset] = useConfirm(
    "Reset invite link",
    "This will invalidate the current invite link",
    "destructive",
  );

  const form = useForm<UpdateWorkspaceSchema>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      ...initialValues,
      image: initialValues.imageUrl ?? "",
    },
  });
  const onSumbit = (values: UpdateWorkspaceSchema) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : "",
    };
    mutate({
      form: finalValues,
      param: { workspaceId: initialValues.$id },
    });
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
    }
  };

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteWorkspace(
      {
        param: { workspaceId: initialValues.$id },
      },
      {
        onSuccess: () => {
          // Hard refresh to clear cache
          window.location.href = "/";
        },
      },
    );
  };

  const handleResetInviteCode = async () => {
    const ok = await confirmReset();
    if (!ok) return;
    resetInviteCode({
      param: {
        workspaceId: initialValues.$id,
      },
    });
  };

  return (
    <div className="flex flex-col gap-y-4">
      <DeleteWorkspaceDialog />
      <ResetDialog />
      <Card className="size-full border-none bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent),hsl(var(--card))] shadow-none dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.75)]">
        <CardHeader className="flex flex-row items-center gap-x-4 space-y-0">
          <Button
            variant="secondary"
            onClick={
              onCancel
                ? onCancel
                : () => router.push(`/workspaces/${initialValues.$id}`)
            }
          >
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
          <CardTitle className="text-xl font-bold">
            {initialValues.name}
          </CardTitle>
        </CardHeader>
        <div className="px-7">
          <Separator />
        </div>
        <CardContent className="p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSumbit)}>
              <div className="flex flex-col gap-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workspace name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter workspace name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
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
                              alt="Workspace Icon"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <Avatar className="size-[72px]">
                            <AvatarFallback>
                              <ImageIcon className="size-[36px] text-neutral-400" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex flex-col">
                          <p className="text-sm">Workspace Icon</p>
                          <p className="text-sm text-muted-foreground">
                            JPEG, PNG, SVG, or JPEG, max 1 mb
                          </p>
                          <input
                            hidden
                            type="file"
                            ref={inputRef}
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
                                if (inputRef.current)
                                  inputRef.current.value = "";
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
                              onClick={() => inputRef.current?.click()}
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
              <div className="mt-6 flex w-full items-center justify-center">
                <Button
                  disabled={isPending}
                  className="w-full"
                  type="submit"
                  size="lg"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card className="size-full border-none bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent),hsl(var(--card))] shadow-none dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.75)]">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Invite Members</h3>
            <p className="text-sm text-muted-foreground">
              Use the invite link to add members to your workspace
            </p>
            <div className="mt-4">
              <div className="flex items-center gap-x-2">
                <Input value={absoluteInviteLink} readOnly />
                <Button
                  onClick={() => {
                    navigator.clipboard
                      .writeText(absoluteInviteLink)
                      .then(() =>
                        toast.success("Invite Link Copied to clipboard"),
                      );
                  }}
                  variant="secondary"
                  className="size-12"
                >
                  <CopyIcon className="size-5" />
                </Button>
              </div>
            </div>
            <Button
              className="ml-auto mt-6 w-full"
              size="lg"
              variant="destructive"
              disabled={isPending || resetingInviteCode}
              onClick={handleResetInviteCode}
            >
              Reset invite link
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="size-full border-none bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent),hsl(var(--card))] shadow-none dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.75)]">
        <CardContent className="">
          <div className="flex flex-col">
            <h3 className="font-bold">Delete Workspace</h3>
            <p className="text-sm text-muted-foreground">
              Deleting a workspace is irreversible and will remove all
              associated data
            </p>
            <Button
              className="ml-auto mt-6 w-full"
              size="lg"
              variant="destructive"
              disabled={isPending || deletingWorkspace}
              onClick={handleDelete}
            >
              Delete workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
