import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "@/config";

// Initialize Gemini AI
const client = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

// Model fallback chain: try each model in order if previous one fails
const MODEL_FALLBACK_CHAIN = [
  "gemini-2.5-flash",          // Primary: Latest fast model
  "gemini-2.5-flash-lite",     // Fallback 1: Lighter/faster version
  "gemini-2.5-pro",            // Fallback 2: Most capable model
];

export interface PRAnalysisInput {
  prTitle: string;
  prDescription: string;
  files: Array<{
    filename: string;
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
    status: string;
  }>;
  prUrl: string;
  repoName: string;
  baseBranch: string;
  headBranch: string;
  existingReviews: Array<{
    user: string;
    state: string;
    body: string;
    submittedAt: string;
  }>;
  repoInfo: {
    language: string | null;
    description: string | null;
    topics: string[];
    size: number;
    defaultBranch: string;
  };
}

// AI Summary Types
export interface SummaryInput {
  title: string;
  description: string;
  type: 'pr' | 'issue';
  context: {
    repoName: string;
    assignee?: string;
    labels?: string[];
    comments?: Array<{
      user: string;
      body: string;
      createdAt: string;
    }>;
  };
}

export interface SummaryOutput {
  executiveSummary: string;
  keyPoints: string[];
  impactLevel: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  recommendations: string[];
  estimatedEffort?: string;
  affectedAreas: string[];
}

export async function generateAISummary(input: SummaryInput): Promise<SummaryOutput> {
  const prompt = createSummaryPrompt(input);

  // Try each model in the fallback chain
  for (let i = 0; i < MODEL_FALLBACK_CHAIN.length; i++) {
    const modelName = MODEL_FALLBACK_CHAIN[i];

    try {
      const result = await client.models.generateContent({
        model: modelName,
        contents: prompt
      });

      const text = result.text;

      if (!text) {
        throw new Error('No response text from Gemini API');
      }

      // Clean the response text to extract JSON from markdown code blocks
      let cleanedText = text.trim();

      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const summary = JSON.parse(cleanedText);
      return summary;
    } catch (error) {
      console.error(`AI summary failed with model ${modelName}:`, error);

      // Check if it's a rate limit or overload error
      const errorObj = error as { status?: number; message?: string };
      const isRateLimit = errorObj?.status === 429 || errorObj?.message?.includes('rate limit') ||
        errorObj?.message?.includes('quota') || errorObj?.message?.includes('overloaded');

      // If it's the last model or not a rate limit error, return fallback
      if (i === MODEL_FALLBACK_CHAIN.length - 1 || !isRateLimit) {
        console.error("All models failed or non-recoverable error, using fallback summary");
        return createFallbackSummary(input);
      }
    }
  }

  return createFallbackSummary(input);
}

function createSummaryPrompt(input: SummaryInput): string {
  const contextInfo = input.context;

  return `
You are an expert technical project manager specializing in summarizing GitHub ${input.type === 'pr' ? 'Pull Requests' : 'Issues'} for development teams.

## Context:
- **Repository**: ${contextInfo.repoName}
- **Type**: ${input.type.toUpperCase()}
- **Title**: ${input.title}
- **Description**: ${input.description}
- **Assignee**: ${contextInfo.assignee || 'Unassigned'}
- **Labels**: ${contextInfo.labels?.join(', ') || 'None'}

${contextInfo.comments && contextInfo.comments.length > 0 ? `
## Recent Comments:
${contextInfo.comments.map(comment =>
    `**${comment.user}** (${comment.createdAt}): ${comment.body.substring(0, 200)}${comment.body.length > 200 ? '...' : ''}`
  ).join('\n')}
` : ''}

Please analyze this ${input.type} and provide a comprehensive summary that helps team members quickly understand:
1. What this ${input.type} is about
2. The impact and urgency level
3. Key action items and recommendations
4. Estimated effort (if applicable)
5. Areas of the codebase/project that might be affected

Return a JSON response with this exact structure:

{
  "executiveSummary": "<2-3 sentence high-level summary>",
  "keyPoints": ["<key point 1>", "<key point 2>", "<key point 3>"],
  "impactLevel": "<low|medium|high>",
  "urgency": "<low|medium|high>",
  "recommendations": ["<recommendation 1>", "<recommendation 2>"],
  "estimatedEffort": "<effort estimate or null>",
  "affectedAreas": ["<area 1>", "<area 2>"]
}

## Guidelines:
1. **Executive Summary**: Concise overview that executives/managers can understand
2. **Key Points**: Most important technical or business aspects
3. **Impact Level**: How much this affects the project (consider scope, complexity, dependencies)
4. **Urgency**: How quickly this needs attention (consider deadlines, blocking issues, security)
5. **Recommendations**: Actionable next steps for the team
6. **Estimated Effort**: For PRs, review time; for Issues, implementation time
7. **Affected Areas**: Parts of the system/codebase that might be impacted

**IMPORTANT**: Return ONLY the raw JSON object, no markdown formatting, no code blocks. Start directly with { and end with }.
`;
}

function createFallbackSummary(input: SummaryInput): SummaryOutput {
  return {
    executiveSummary: `${input.type === 'pr' ? 'Pull Request' : 'Issue'} requires manual review as AI analysis is unavailable.`,
    keyPoints: [
      `${input.type === 'pr' ? 'Code changes' : 'Issue'} need manual review`,
      "AI summary generation failed",
      "Please review manually for details"
    ],
    impactLevel: "medium",
    urgency: "medium",
    recommendations: [
      "Conduct manual review",
      "Check with team lead if needed"
    ],
    estimatedEffort: input.type === 'pr' ? "Manual review needed" : "Assessment required",
    affectedAreas: ["Unknown - manual review needed"]
  };
}

export async function analyzeWithGemini(input: PRAnalysisInput) {
  const prompt = createAnalysisPrompt(input);

  for (let i = 0; i < MODEL_FALLBACK_CHAIN.length; i++) {
    const modelName = MODEL_FALLBACK_CHAIN[i];

    try {
      const result = await client.models.generateContent({
        model: modelName,
        contents: prompt
      });

      const text = result.text;

      if (!text) {
        throw new Error('No response text from Gemini API');
      }

      // Clean the response text to extract JSON from markdown code blocks
      let cleanedText = text.trim();

      // Remove markdown code blocks if present
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Parse the JSON response from Gemini
      const analysis = JSON.parse(cleanedText);
      return analysis;
    } catch (error) {
      // Check if it's a rate limit or overload error
      const errorObj = error as { status?: number; message?: string };
      const isRateLimit = errorObj?.status === 429 || errorObj?.message?.includes('rate limit') ||
        errorObj?.message?.includes('quota') || errorObj?.message?.includes('overloaded');

      // If it's the last model or not a rate limit error, return fallback
      if (i === MODEL_FALLBACK_CHAIN.length - 1 || !isRateLimit) {
        console.error("All models failed or non-recoverable error, using fallback analysis");
        return createFallbackAnalysis(input);
      }
    }
  }

  return createFallbackAnalysis(input);
}

function createAnalysisPrompt(input: PRAnalysisInput): string {
  const filesInfo = input.files.map(file => ({
    name: file.filename,
    additions: file.additions,
    deletions: file.deletions,
    changes: file.changes,
    patch: file.patch?.substring(0, 1000), // Limit patch size
    status: file.status
  }));

  return `
You are a senior code reviewer with expertise in software engineering best practices, security, performance, and architecture. Analyze this GitHub Pull Request and provide a comprehensive review.

## Repository Context:
- **Repository**: ${input.repoName}
- **Primary Language**: ${input.repoInfo.language || 'Mixed'}
- **Description**: ${input.repoInfo.description || 'No description'}
- **Topics**: ${input.repoInfo.topics.length > 0 ? input.repoInfo.topics.join(', ') : 'None'}
- **Repository Size**: ${Math.round(input.repoInfo.size / 1024)}MB
- **Default Branch**: ${input.repoInfo.defaultBranch}

## Pull Request Details:
- **Title**: ${input.prTitle}
- **Description**: ${input.prDescription}
- **Base Branch**: ${input.baseBranch}
- **Head Branch**: ${input.headBranch}
- **Files Changed**: ${input.files.length}

## Files and Changes:
${JSON.stringify(filesInfo, null, 2)}

## Existing Reviews:
${input.existingReviews.length > 0 ?
      input.existingReviews.map(review =>
        `### ${review.user} (${review.state}) - ${review.submittedAt}\n${review.body || 'No comment'}`
      ).join('\n\n')
      : 'No existing reviews'}

Please analyze this PR and return a JSON response with the following exact structure:

{
  "summary": {
    "overallScore": <number 1-10>,
    "riskLevel": "<low|medium|high>",
    "recommendation": "<approve|request_changes|needs_discussion>",
    "keyFindings": ["<finding1>", "<finding2>", "<finding3>"],
    "estimatedReviewTime": "<time estimate>"
  },
  "codeQuality": {
    "score": <number 1-10>,
    "issues": [
      {
        "type": "<complexity|maintainability|style|performance>",
        "severity": "<low|medium|high>",
        "file": "<filename>",
        "line": <line_number>,
        "message": "<issue description>",
        "suggestion": "<improvement suggestion>"
      }
    ],
    "suggestions": ["<general suggestion 1>", "<general suggestion 2>"]
  },
  "security": {
    "score": <number 1-10>,
    "vulnerabilities": [
      {
        "type": "<authentication|authorization|input_validation|data_exposure|crypto>",
        "severity": "<low|medium|high|critical>",
        "file": "<filename>",
        "line": <line_number>,
        "description": "<vulnerability description>",
        "recommendation": "<how to fix>"
      }
    ],
    "recommendations": ["<security recommendation 1>", "<security recommendation 2>"]
  },
  "performance": {
    "score": <number 1-10>,
    "issues": [
      {
        "type": "<database|memory|cpu|network|algorithm>",
        "severity": "<low|medium|high>",
        "file": "<filename>",
        "line": <line_number>,
        "description": "<performance issue>",
        "optimization": "<optimization suggestion>"
      }
    ],
    "optimizations": ["<optimization 1>", "<optimization 2>"]
  },
  "architecture": {
    "score": <number 1-10>,
    "insights": [
      {
        "type": "<pattern|dependency|consistency|design>",
        "level": "<suggestion|warning|error>",
        "description": "<architectural insight>",
        "impact": "<impact description>",
        "recommendation": "<architectural recommendation>"
      }
    ],
    "consistencyScore": <number 1-10>
  },
  "projectContext": {
    "relatedIssues": [],
    "impactedFeatures": ["<feature1>", "<feature2>"],
    "teamNotifications": ["<notification1>"],
    "conventionViolations": ["<violation1>"]
  }
}

## Analysis Guidelines:
1. **Code Quality**: Look for complexity, maintainability, coding standards, naming conventions appropriate for the repository's primary language
2. **Security**: Check for vulnerabilities, authentication issues, input validation, data exposure relevant to the technology stack
3. **Performance**: Identify potential bottlenecks, inefficient algorithms, resource usage considering the repository size and purpose
4. **Architecture**: Evaluate design patterns, code organization, dependency management that align with repository topics and description
5. **Best Practices**: Consider testing, documentation, error handling standards for the project's domain
6. **Existing Reviews**: Build upon previous feedback, avoid repeating already identified issues, acknowledge resolved concerns
7. **Repository Context**: Consider the project's purpose, scale, and technology choices when making recommendations

## Scoring Guidelines:
- **9-10**: Excellent, production-ready code with best practices
- **7-8**: Good code with minor improvements needed  
- **5-6**: Acceptable but needs attention in several areas
- **3-4**: Poor quality, significant issues that need addressing
- **1-2**: Major problems, should not be merged

Be thorough but practical. Focus on actionable feedback that will help improve the code quality and maintainability.

**IMPORTANT**: Return ONLY the raw JSON object, no markdown formatting, no code blocks, no additional text. Start directly with { and end with }.
`;
}

function createFallbackAnalysis(input: PRAnalysisInput) {
  // Fallback analysis when AI fails
  return {
    summary: {
      overallScore: 7,
      riskLevel: "low" as const,
      recommendation: "approve" as const,
      keyFindings: [
        "AI analysis unavailable - manual review recommended",
        `${input.files.length} files changed`,
        "Please review the changes manually"
      ],
      estimatedReviewTime: "30 minutes"
    },
    codeQuality: {
      score: 7,
      issues: [],
      suggestions: ["Please review the code manually as AI analysis failed"]
    },
    security: {
      score: 8,
      vulnerabilities: [],
      recommendations: ["Manual security review recommended"]
    },
    performance: {
      score: 7,
      issues: [],
      optimizations: ["Performance review needed"]
    },
    architecture: {
      score: 7,
      insights: [],
      consistencyScore: 7
    },
    projectContext: {
      relatedIssues: [],
      impactedFeatures: [],
      teamNotifications: ["AI analysis failed - manual review needed"],
      conventionViolations: []
    }
  };
}

// Test Generation Types
export interface TestGenerationInput {
  prTitle: string;
  prDescription: string;
  prUrl: string;
  files: Array<{
    filename: string;
    status: "added" | "modified" | "removed";
    additions: number;
    deletions: number;
    patch?: string;
  }>;
  commitMessages: string[];
  author: string;
  repoInfo: {
    language: string | null;
    name: string;
  };
}

export async function generateTestCases(input: TestGenerationInput) {
  const prompt = createTestGenerationPrompt(input);

  // Try each model in the fallback chain
  for (let i = 0; i < MODEL_FALLBACK_CHAIN.length; i++) {
    const modelName = MODEL_FALLBACK_CHAIN[i];

    try {

      const result = await client.models.generateContent({
        model: modelName,
        contents: prompt
      });

      const text = result.text;

      if (!text) {
        throw new Error('No response text from Gemini API');
      }

      // Clean the response text to extract JSON from markdown code blocks
      let cleanedText = text.trim();

      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const testGeneration = JSON.parse(cleanedText);
      return testGeneration;
    } catch (error) {
      console.error(`Test generation failed with model ${modelName}:`, error);

      // Check if it's a rate limit or overload error
      const errorObj = error as { status?: number; message?: string };
      const isRateLimit = errorObj?.status === 429 || errorObj?.message?.includes('rate limit') ||
        errorObj?.message?.includes('quota') || errorObj?.message?.includes('overloaded');

      // If it's the last model or not a rate limit error, return fallback
      if (i === MODEL_FALLBACK_CHAIN.length - 1 || !isRateLimit) {
        console.error("All models failed or non-recoverable error, using fallback generation");
        return createFallbackTestGeneration(input);
      }
    }
  }

  return createFallbackTestGeneration(input);
}

function createTestGenerationPrompt(input: TestGenerationInput): string {
  const filesInfo = input.files.map(file => {
    const patchPreview = file.patch ? file.patch.substring(0, 500) : 'No patch available';
    return `- **${file.filename}** (${file.status}): +${file.additions} -${file.deletions}\n  ${patchPreview}${file.patch && file.patch.length > 500 ? '...' : ''}`;
  }).join('\n');

  const commitInfo = input.commitMessages.map(msg => `  - ${msg}`).join('\n');

  return `
You are an expert software testing engineer specializing in automated test case generation.

## Pull Request Context:
- **Repository**: ${input.repoInfo.name}
- **Language**: ${input.repoInfo.language || 'Unknown'}
- **PR Title**: ${input.prTitle}
- **PR Description**: ${input.prDescription}
- **Author**: ${input.author}
- **PR URL**: ${input.prUrl}

## Files Changed (${input.files.length} files):
${filesInfo}

## Commit Messages:
${commitInfo}

Your task is to generate comprehensive test cases for this pull request. Analyze the code changes and generate test scenarios that cover:
1. **Unit Tests**: Test individual functions, methods, and components
2. **Integration Tests**: Test how components work together
3. **End-to-End Tests**: Test complete user workflows
4. **Edge Cases**: Test boundary conditions, error handling, and unusual inputs
5. **Security Tests**: Test for potential security vulnerabilities
6. **Performance Tests**: Test for performance regressions (if applicable)
7. **Accessibility Tests**: Test for accessibility compliance (for UI changes)
8. **API Tests**: Test API endpoints (for backend changes)

Return a JSON response with this exact structure:

{
  "summary": {
    "totalTestsGenerated": <number>,
    "testsByType": {
      "unit": <number>,
      "integration": <number>,
      "e2e": <number>,
      "performance": <number>,
      "security": <number>,
      "accessibility": <number>,
      "api": <number>,
      "component": <number>
    },
    "criticalTests": <number>,
    "filesWithTests": <number>,
    "estimatedTestingTime": "<time estimate>",
    "coverageAreas": ["<area1>", "<area2>"],
    "recommendations": ["<recommendation1>", "<recommendation2>"]
  },
  "scenarios": [
    {
      "id": "<unique-id>",
      "feature": "<feature name>",
      "description": "<scenario description>",
      "affectedFiles": ["<file1>", "<file2>"],
      "riskLevel": "<low|medium|high>",
      "testCases": [
        {
          "id": "<unique-id>",
          "title": "<test title>",
          "description": "<what this test verifies and how>",
          "type": "<unit|integration|e2e|performance|security|accessibility|api|component>",
          "prerequisites": ["<dependency1>", "<setup requirement1>"],
          "priority": "<low|medium|high|critical>",
          "reasoning": "<why this test is important>",
          "edgeCases": ["<edge case 1>", "<edge case 2>"]
        }
      ]
    }
  ]
}

## Guidelines:
1. **Be Specific**: Clearly describe what each test should verify, inputs, and expected outcomes
2. **Be Practical**: Focus on tests that catch real bugs and regressions
3. **Be Comprehensive**: Cover happy paths, edge cases, and error conditions
4. **Prioritize**: Mark critical tests that must pass before merging
5. **Context-Aware**: Consider the file changes and commit messages
6. **Actionable**: Write descriptions detailed enough that a developer knows exactly what to test

**IMPORTANT**:
- Return ONLY the raw JSON object, no markdown formatting, no code blocks.
- Start directly with { and end with }.
- Generate no more than 20 test cases total across all scenarios.
- Focus on the most impactful tests first.
`;
}

function createFallbackTestGeneration(input: TestGenerationInput) {
  return {
    summary: {
      totalTestsGenerated: 0,
      testsByType: {
        unit: 0,
        integration: 0,
        e2e: 0,
        performance: 0,
        security: 0,
        accessibility: 0,
        api: 0,
        component: 0,
      },
      criticalTests: 0,
      filesWithTests: 0,
      estimatedTestingTime: "Unknown",
      coverageAreas: ["Manual test generation needed"],
      recommendations: [
        "AI test generation failed",
        "Please manually create test cases",
        "Review the changed files and write appropriate tests"
      ]
    },
    scenarios: [
      {
        id: "fallback-1",
        feature: "Manual Testing Required",
        description: "AI-powered test generation is unavailable. Please manually review the PR and create appropriate test cases.",
        affectedFiles: input.files.map(f => f.filename),
        riskLevel: "high" as const,
        testCases: [
          {
            id: "fallback-test-1",
            title: "Manual test creation needed",
            description: "Review the code changes and create appropriate tests manually",
            type: "unit" as const,
            prerequisites: ["Testing framework"],
            priority: "high" as const,
            reasoning: "AI test generation is unavailable",
            edgeCases: ["Manual review required"]
          }
        ]
      }
    ]
  };
}
