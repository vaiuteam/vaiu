# Vaiu

Vaiu is a collaborative platform for managing GitHub repositories, tracking issues, and facilitating team collaboration. It allows users to create workspaces, add existing GitHub projects or create new ones, manage pull requests, and track issues in a user-friendly interface.

## Features

### Project Management

- Create new GitHub repositories directly from the platform
- Import existing GitHub repositories
- Upload and display README files
- Project analytics dashboard with activity metrics
- Project settings management

### Collaboration

- Add collaborators to GitHub repositories
- Create and manage pull requests
- View project activity and contributions
- Workspace organization for team management

### Issue Tracking

- Create and manage GitHub issues
- View issues in kanban, table, or calendar views
- Filter and sort issues by different criteria
- Bulk update issue status

### AI-Powered Code Review

- **Smart PR Analysis**: AI-powered pull request review using Google Gemini
- **Comprehensive Assessment**: Code quality, security, performance, and architecture analysis
- **Actionable Insights**: Detailed suggestions and recommendations for improvements
- **Risk Assessment**: Automatic risk level evaluation and merge recommendations
- **Context-Aware**: Analysis considers project patterns and team conventions

### AI-Powered Test Generation

- **Automated Test Creation**: AI generates comprehensive test cases based on PR changes
- **Multiple Test Types**: Unit, integration, E2E, security, performance, accessibility, API, and component tests
- **Smart Analysis**: Considers changed files, commit messages, PR description, and code context
- **Ready-to-Use Code**: Copy-paste test code with proper syntax and framework recommendations
- **Prioritized Testing**: Tests marked as critical, high, medium, or low priority
- **Coverage Insights**: Identifies testing focus areas and provides testing strategy recommendations

### Communication

- Audio and video rooms for team collaboration
- Real-time chat functionality

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS, shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Authentication**: Appwrite
- **Database**: Appwrite Database
- **Storage**: Appwrite Storage
- **API**: Hono.js API routes
- **GitHub Integration**: Octokit
- **AI Integration**: Google Gemini API for intelligent code review
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or bun
- GitHub account with personal access token
- Appwrite account and project setup

### Environment Setup

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=your_appwrite_endpoint
NEXT_PUBLIC_APPWRITE_PROJECT=your_appwrite_project_id
APPWRITE_API_KEY=your_appwrite_api_key
GITHUB_TOKEN=your_github_personal_access_token
GEMINI_API_KEY=your_gemini_api_key
REDIS_URL=redis://localhost:6379
```

Replace the placeholder values with your actual credentials:
- `your_appwrite_endpoint`, `your_appwrite_project_id`, `your_appwrite_api_key`: Your Appwrite configuration
- `your_github_personal_access_token`: Your GitHub personal access token
- `your_gemini_api_key`: Your Google AI API key for Gemini (get it from [Google AI Studio](https://aistudio.google.com/))
- `REDIS_URL`: Redis connection URL used for backend API caching (optional but recommended for faster loads)

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/yourusername/Vaiu.git
cd Vaiu
npm install
```

### Running the Development Server

Start the development server with the following command:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000` to see Vaiu in action.

## Contributing

We welcome contributions to Vaiu! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) guide for more information on how to get involved.

## License

Vaiu is [MIT licensed](LICENSE).
