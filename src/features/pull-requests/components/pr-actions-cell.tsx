 "use client";

import { useState } from "react";
import { MoreHorizontal, Bot, ExternalLink, Loader2, Brain, FlaskConical, FileText } from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { PullRequest } from "../types";
import { useGenerateAIReview } from "../api/use-ai-review";
import { AIReviewResults } from "./ai-review-results";
import { useProjectId } from "@/features/projects/hooks/use-projectId";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGenerateAISummary } from "@/features/ai-summaries/api/use-generate-ai-summary";
import { AISummaryCard } from "@/features/ai-summaries/components/ai-summary-card";
import { useGenerateTestCases } from "../api/use-generate-tests";
import { TestGenerationResults } from "./test-generation-results";
import { TestManagementTab } from "./test-management-tab";

interface PRActionsCellProps {
  pr: PullRequest;
}

export function PRActionsCell({ pr }: PRActionsCellProps) {
  const [showAIReview, setShowAIReview] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [showTestGeneration, setShowTestGeneration] = useState(false);
  const [showTestManagement, setShowTestManagement] = useState(false);
  const projectId = useProjectId();
  const workspaceId = useWorkspaceId();
  
  const closeAllDialogs = () => {
    setShowAIReview(false);
    setShowAISummary(false);
    setShowTestGeneration(false);
    setShowTestManagement(false);
  };

  const {
    generateReview,
    isLoading,
    data: reviewData,
    reset,
  } = useGenerateAIReview();

  const handleAIReview = async () => {
    try {
      reset(); // Clear any previous data/errors
      closeAllDialogs();
      setTimeout(() => setShowAIReview(true), 50);
      await generateReview({
        projectId,
        prNumber: pr.number,
      });
    } catch (error) {
      console.error("Failed to generate AI review:", error);
    }
  };

  const handleCloseReview = () => {
    setShowAIReview(false);
    setTimeout(() => reset(), 100); // Delay cleanup to allow dialog to fully close
  };

  const { isPending: isSummaryPending } = useGenerateAISummary();

  const handleAISummary = () => {
    closeAllDialogs();
    setTimeout(() => setShowAISummary(true), 50);
  };

  const {
    generateTests,
    isLoading: isTestsLoading,
    data: testsData,
    reset: resetTests,
  } = useGenerateTestCases();

  const handleGenerateTests = async () => {
    try {
      resetTests();
      closeAllDialogs();
      setTimeout(() => setShowTestGeneration(true), 50);
      await generateTests({
        projectId,
        prNumber: pr.number,
      });
    } catch (error) {
      console.error("Failed to generate tests:", error);
    }
  };

  const handleCloseTests = () => {
    setShowTestGeneration(false);
    setTimeout(() => resetTests(), 100);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on GitHub
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleAIReview}
            disabled={isLoading}
            className="flex items-center"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bot className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Analyzing..." : "AI Review"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleAISummary}
            disabled={isSummaryPending}
            className="flex items-center"
          >
            {isSummaryPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Brain className="mr-2 h-4 w-4" />
            )}
            {isSummaryPending ? "Analyzing..." : "AI Summary"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleGenerateTests}
            disabled={isTestsLoading}
            className="flex items-center"
          >
            {isTestsLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FlaskConical className="mr-2 h-4 w-4" />
            )}
            {isTestsLoading ? "Generating..." : "Generate Tests"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              closeAllDialogs();
              setTimeout(() => setShowTestManagement(true), 50);
            }}
            className="flex items-center"
          >
            <FileText className="mr-2 h-4 w-4" />
            View Tests
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* AI Review Dialog */}
      <Dialog open={showAIReview} onOpenChange={setShowAIReview}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>AI Review</DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-4 text-sm text-muted-foreground">Analyzing pull request…</span>
            </div>
          ) : reviewData?.review ? (
            <AIReviewResults
              review={reviewData.review}
              onClose={handleCloseReview}
            />
          ) : (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No review data available.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Summary Dialog */}
      <Dialog open={showAISummary} onOpenChange={setShowAISummary}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">AI Summary</DialogTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">{pr.title}</p>
          </DialogHeader>
          <div className="mt-2">
            <AISummaryCard
              workspaceId={workspaceId}
              projectId={projectId}
              type="pr"
              identifier={pr.number}
              title={pr.title}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Generation Dialog */}
      <Dialog open={showTestGeneration} onOpenChange={setShowTestGeneration}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>AI Test Generation</DialogTitle>
          </DialogHeader>
          {isTestsLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-4 text-sm text-muted-foreground">Generating tests…</span>
            </div>
          ) : testsData?.tests ? (
            <TestGenerationResults
              testGeneration={testsData.tests}
              projectId={projectId}
              prNumber={pr.number}
              onClose={handleCloseTests}
            />
          ) : (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No test data available.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Test Management Dialog */}
      <Dialog open={showTestManagement} onOpenChange={setShowTestManagement}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Test Management</DialogTitle>
          </DialogHeader>
          <TestManagementTab projectId={projectId} prNumber={pr.number} />
        </DialogContent>
      </Dialog>
    </>
  );
}
