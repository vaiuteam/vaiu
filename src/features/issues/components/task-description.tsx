import { useEffect, useState } from "react";
import { Loader2, Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { Issue } from "../types";
import { useUpdateTask } from "../api/use-update-task";

interface TaskDescriptionProps {
  issue: Issue;
}

export const TaskDescription = ({ issue }: TaskDescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(issue.description ?? "");
  const { mutate, isPending } = useUpdateTask();

  // Keep the editor in sync if the issue changes underneath us (e.g. webhook).
  useEffect(() => {
    if (!isEditing) setValue(issue.description ?? "");
  }, [issue.description, isEditing]);

  const handleSave = () => {
    mutate(
      {
        json: { description: value },
        param: { issueId: issue.$id },
      },
      {
        onSuccess: () => setIsEditing(false),
      },
    );
  };

  const handleCancel = () => {
    setValue(issue.description ?? "");
    setIsEditing(false);
  };

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm dark:bg-[hsl(var(--surface-elevated))]/60">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="text-xs text-muted-foreground">
            Context, repro steps, expected behavior — anything that helps the assignee.
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            size="sm"
            variant="secondary"
            className="rounded-full"
          >
            <Pencil className="mr-2 size-3.5" />
            Edit
          </Button>
        )}
      </header>
      <Separator className="my-4 bg-border/55" />
      {isEditing ? (
        <div className="flex flex-col gap-y-3">
          <Textarea
            autoFocus
            placeholder="Describe the issue. Line breaks and paragraphs are preserved."
            value={value}
            rows={14}
            onChange={(e) => setValue(e.target.value)}
            disabled={isPending}
            className="min-h-[320px] resize-y rounded-xl border border-border/70 bg-background/60 px-4 py-3 text-sm leading-relaxed backdrop-blur-sm focus-visible:ring-1 focus-visible:ring-ring dark:bg-background/35"
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={isPending}
              className="rounded-full"
            >
              <X className="mr-2 size-3.5" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isPending}
              className="rounded-full"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </div>
      ) : issue.description ? (
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
          {issue.description}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="block w-full rounded-xl border border-dashed border-border/70 bg-background/30 px-4 py-6 text-left text-sm text-muted-foreground transition hover:border-border hover:bg-background/50"
        >
          No description yet — click to add one.
        </button>
      )}
    </section>
  );
};
