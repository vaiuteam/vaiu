"use client";

import { useState, useMemo } from "react";
import {
  FlaskConical,
  Plus,
  Edit,
  Trash2,
  Layers,
  TrendingUp,
  Zap,
  Shield,
  Eye,
  Server,
  FileCode,
  ChevronDown,
  ChevronRight,
  Save,
  X,
  Code2,
  Search,
  GitPullRequest,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  useGetProjectTests,
  useCreateTest,
  useUpdateTest,
  useDeleteTest,
} from "../api/use-test-management";
import { PersistedTestCase, TestType, TestStatus } from "../types-tests";

const getTestTypeIcon = (type: TestType) => {
  switch (type) {
    case TestType.UNIT: return <Code2 className="h-3.5 w-3.5" />;
    case TestType.INTEGRATION: return <Layers className="h-3.5 w-3.5" />;
    case TestType.E2E: return <TrendingUp className="h-3.5 w-3.5" />;
    case TestType.PERFORMANCE: return <Zap className="h-3.5 w-3.5" />;
    case TestType.SECURITY: return <Shield className="h-3.5 w-3.5" />;
    case TestType.ACCESSIBILITY: return <Eye className="h-3.5 w-3.5" />;
    case TestType.API: return <Server className="h-3.5 w-3.5" />;
    case TestType.COMPONENT: return <Layers className="h-3.5 w-3.5" />;
    default: return <FileCode className="h-3.5 w-3.5" />;
  }
};

const getPriorityVariant = (
  priority: string,
): "destructive" | "default" | "secondary" | "outline" => {
  switch (priority) {
    case "critical": return "destructive";
    case "high": return "default";
    case "medium": return "secondary";
    default: return "outline";
  }
};

const STATUS_CLASSES: Record<TestStatus, string> = {
  [TestStatus.PASSED]: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  [TestStatus.FAILED]: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  [TestStatus.IN_PROGRESS]: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  [TestStatus.BLOCKED]: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  [TestStatus.SKIPPED]: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  [TestStatus.UNTESTED]: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const STATUS_LABELS: Record<TestStatus, string> = {
  [TestStatus.UNTESTED]: "Untested",
  [TestStatus.IN_PROGRESS]: "In Progress",
  [TestStatus.PASSED]: "Passed",
  [TestStatus.FAILED]: "Failed",
  [TestStatus.BLOCKED]: "Blocked",
  [TestStatus.SKIPPED]: "Skipped",
};

interface TestsViewProps {
  projectId: string;
}

type GroupBy = "pr" | "suite";

export function TestsView({ projectId }: TestsViewProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TestType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<TestStatus | "all">("all");
  const [groupBy, setGroupBy] = useState<GroupBy>("pr");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTest, setEditingTest] = useState<PersistedTestCase | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [createPrNumber, setCreatePrNumber] = useState<number | null>(null);

  const { data, isLoading } = useGetProjectTests(projectId);
  const updateMutation = useUpdateTest();
  const deleteMutation = useDeleteTest();
  const createMutation = useCreateTest();

  const allTests: PersistedTestCase[] = (data?.data ?? []) as PersistedTestCase[];

  const filtered = useMemo(() => {
    return allTests.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !t.description?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allTests, typeFilter, statusFilter, search]);

  // Summary counts (from all tests, not filtered)
  const passed = allTests.filter((t) => t.status === TestStatus.PASSED).length;
  const failed = allTests.filter((t) => t.status === TestStatus.FAILED).length;
  const inProgress = allTests.filter((t) => t.status === TestStatus.IN_PROGRESS).length;
  const blocked = allTests.filter((t) => t.status === TestStatus.BLOCKED).length;
  const untested = allTests.filter((t) => t.status === TestStatus.UNTESTED).length;
  const passRate = allTests.length > 0 ? Math.round((passed / allTests.length) * 100) : 0;

  // Group the filtered tests
  const groups = useMemo(() => {
    if (groupBy === "pr") {
      const map = new Map<number, PersistedTestCase[]>();
      for (const t of filtered) {
        const list = map.get(t.prNumber) ?? [];
        list.push(t);
        map.set(t.prNumber, list);
      }
      return Array.from(map.entries())
        .sort(([a], [b]) => b - a)
        .map(([key, tests]) => ({ key: String(key), label: `PR #${key}`, tests }));
    } else {
      const map = new Map<string, PersistedTestCase[]>();
      for (const t of filtered) {
        const suite = t.scenarioId || "custom";
        const list = map.get(suite) ?? [];
        list.push(t);
        map.set(suite, list);
      }
      return Array.from(map.entries())
        .map(([key, tests]) => ({ key, label: key === "custom" ? "Custom Tests" : key, tests }));
    }
  }, [filtered, groupBy]);

  const toggleGroup = (key: string) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const isGroupOpen = (key: string) => openGroups[key] !== false; // open by default

  const handleStatusChange = (testId: string, status: TestStatus) => {
    updateMutation.mutate({ param: { projectId, testId }, json: { status } });
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    await deleteMutation.mutateAsync({ param: { projectId, testId: deleteConfirmId } });
    setDeleteConfirmId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 pt-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="col-span-2 sm:col-span-3 lg:col-span-2">
          <CardContent className="flex flex-col justify-center gap-2 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pass rate</span>
              <span className="font-semibold">{passRate}%</span>
            </div>
            <Progress value={passRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {passed} passed of {allTests.length} total
            </p>
          </CardContent>
        </Card>
        {[
          { label: "Passed", value: passed, cls: "text-green-600" },
          { label: "Failed", value: failed, cls: "text-red-600" },
          { label: "In Progress", value: inProgress, cls: "text-blue-600" },
          { label: "Blocked", value: blocked, cls: "text-orange-500" },
          { label: "Untested", value: untested, cls: "text-muted-foreground" },
        ].map(({ label, value, cls }) => (
          <Card key={label}>
            <CardContent className="flex flex-col items-center justify-center p-4">
              <span className={`text-2xl font-bold ${cls}`}>{value}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>

        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TestType | "all")}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {Object.values(TestType).map((t) => (
              <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TestStatus | "all")}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.values(TestStatus).map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pr">Group by PR</SelectItem>
            <SelectItem value="suite">Group by Suite</SelectItem>
          </SelectContent>
        </Select>

        <Button
          size="sm"
          className="ml-auto gap-2"
          onClick={() => { setEditingTest(null); setCreatePrNumber(null); setShowCreateDialog(true); }}
        >
          <Plus className="h-4 w-4" />
          Add Test
        </Button>
      </div>

      {allTests.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-3">
            <FlaskConical className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No tests yet.</p>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Generate tests from a Pull Request using the <strong>Generate Tests</strong> button in the Pull Requests tab.
            </p>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[120px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No tests match the current filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {groups.map(({ key, label, tests }) => (
            <Collapsible
              key={key}
              open={isGroupOpen(key)}
              onOpenChange={() => toggleGroup(key)}
            >
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between py-3 px-4 hover:bg-muted/40 rounded-t-lg transition-colors">
                    <div className="flex items-center gap-2">
                      {isGroupOpen(key) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-semibold">{label}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{tests.length} test{tests.length !== 1 ? "s" : ""}</Badge>
                      <Badge variant="outline" className="text-green-600">
                        {tests.filter((t) => t.status === TestStatus.PASSED).length} passed
                      </Badge>
                      {tests.filter((t) => t.status === TestStatus.FAILED).length > 0 && (
                        <Badge variant="destructive">
                          {tests.filter((t) => t.status === TestStatus.FAILED).length} failed
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="space-y-2 px-4 pb-4 pt-1">
                    {tests.map((test) => (
                      <TestRow
                        key={test.$id}
                        test={test}
                        onEdit={(t) => { setEditingTest(t); setShowCreateDialog(true); }}
                        onDelete={(id) => setDeleteConfirmId(id)}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-1 text-muted-foreground hover:text-foreground gap-2"
                      onClick={() => {
                        setEditingTest(null);
                        setCreatePrNumber(groupBy === "pr" ? parseInt(key) : null);
                        setShowCreateDialog(true);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add test to {label}
                    </Button>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}

      {showCreateDialog && (
        <TestFormDialog
          key={editingTest?.$id ?? "new"}
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          test={editingTest}
          defaultPrNumber={createPrNumber ?? undefined}
          onSubmit={async (data, prNumber) => {
            if (editingTest) {
              await updateMutation.mutateAsync({
                param: { projectId, testId: editingTest.$id },
                json: data,
              });
            } else {
              if (!prNumber) return;
              await createMutation.mutateAsync({
                param: { projectId, prNumber: String(prNumber) },
                json: data,
              });
            }
            setShowCreateDialog(false);
          }}
        />
      )}

      <Dialog open={!!deleteConfirmId} onOpenChange={(o) => !o && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete test?</DialogTitle>
            <DialogDescription>
              This test will be hidden from all views. You can restore it later if needed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TestRowProps {
  test: PersistedTestCase;
  onEdit: (test: PersistedTestCase) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TestStatus) => void;
}

function TestRow({ test, onEdit, onDelete, onStatusChange }: TestRowProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              {open ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              )}
              <span className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                {getTestTypeIcon(test.type)}
              </span>
              <span className="text-sm font-medium truncate">{test.title}</span>
            </div>
            <div className="flex items-center gap-2 ml-3 shrink-0" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[test.status ?? TestStatus.UNTESTED]}`}
                  >
                    {STATUS_LABELS[test.status ?? TestStatus.UNTESTED]}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.values(TestStatus).map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => onStatusChange(test.$id, s)}
                      className={test.status === s ? "font-semibold" : ""}
                    >
                      {STATUS_LABELS[s]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Badge variant={getPriorityVariant(test.priority)} className="text-xs">
                {test.priority}
              </Badge>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-3 border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">{test.description}</p>

            {test.reasoning && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reasoning</p>
                <p className="text-sm text-muted-foreground">{test.reasoning}</p>
              </div>
            )}

            {test.prerequisites?.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Prerequisites</p>
                <div className="flex flex-wrap gap-1.5">
                  {test.prerequisites.map((p, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                  ))}
                </div>
              </div>
            )}

            {test.edgeCases?.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Edge Cases</p>
                <ul className="space-y-1">
                  {test.edgeCases.map((ec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {ec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-border pt-3">
              <Button variant="outline" size="sm" onClick={() => onEdit(test)} className="gap-1.5">
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(test.$id)} className="gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

interface TestFormData {
  title: string;
  description: string;
  type: TestType;
  status: TestStatus;
  prerequisites: string[];
  priority: "low" | "medium" | "high" | "critical";
  reasoning: string;
  edgeCases: string[];
  scenarioId: string;
}

interface TestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: PersistedTestCase | null;
  defaultPrNumber?: number;
  onSubmit: (data: TestFormData, prNumber?: number) => Promise<void>;
}

function TestFormDialog({ open, onOpenChange, test, defaultPrNumber, onSubmit }: TestFormDialogProps) {
  const [formData, setFormData] = useState({
    title: test?.title ?? "",
    description: test?.description ?? "",
    type: test?.type ?? TestType.UNIT,
    status: test?.status ?? TestStatus.UNTESTED,
    prerequisites: test?.prerequisites?.join(", ") ?? "",
    priority: test?.priority ?? "medium",
    reasoning: test?.reasoning ?? "",
    edgeCases: test?.edgeCases?.join(", ") ?? "",
    prNumber: defaultPrNumber ? String(defaultPrNumber) : "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(
        {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          status: formData.status,
          prerequisites: formData.prerequisites.split(",").map((p) => p.trim()).filter(Boolean),
          priority: formData.priority as "low" | "medium" | "high" | "critical",
          reasoning: formData.reasoning,
          edgeCases: formData.edgeCases.split(",").map((e) => e.trim()).filter(Boolean),
          scenarioId: test?.scenarioId ?? "custom",
        },
        test ? undefined : parseInt(formData.prNumber),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{test ? "Edit Test" : "Add Test"}</DialogTitle>
          <DialogDescription>
            {test ? "Update the test case details." : "Add a new manual test case."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!test && (
            <div className="space-y-2">
              <Label htmlFor="prNumber">PR Number *</Label>
              <Input
                id="prNumber"
                type="number"
                value={formData.prNumber}
                onChange={(e) => setFormData({ ...formData, prNumber: e.target.value })}
                placeholder="e.g. 42"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. User can log in with GitHub"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does this test verify?"
              rows={3}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as TestType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.values(TestType).map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as "low" | "medium" | "high" | "critical" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["low", "medium", "high", "critical"].map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as TestStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.values(TestStatus).map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reasoning">Reasoning</Label>
            <Textarea
              id="reasoning"
              value={formData.reasoning}
              onChange={(e) => setFormData({ ...formData, reasoning: e.target.value })}
              placeholder="Why is this test important?"
              rows={2}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prerequisites">Prerequisites (comma-separated)</Label>
              <Input
                id="prerequisites"
                value={formData.prerequisites}
                onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                placeholder="setup, mocks, config"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edgeCases">Edge Cases (comma-separated)</Label>
              <Input
                id="edgeCases"
                value={formData.edgeCases}
                onChange={(e) => setFormData({ ...formData, edgeCases: e.target.value })}
                placeholder="null input, empty array"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : test ? "Update" : "Add Test"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
