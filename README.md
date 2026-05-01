# Vaiu

Vaiu is a collaborative platform for managing GitHub repositories, tracking issues, and facilitating team collaboration. It allows users to create workspaces, add existing GitHub projects or create new ones, manage pull requests, and track issues in a user-friendly interface.

## Features

### Subscription Management

- **4 Flexible Plans**: Free, Pro, Standard, and Enterprise tiers
- **Usage Tracking**: Monitor workspaces, projects, storage, and AI credits
- **Razorpay Integration**: Secure payment processing with support for monthly and yearly billing
- **Automatic Limits**: Enforced limits based on subscription tier
- **Easy Upgrades**: Simple in-app upgrade flow with immediate activation

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
- **Payments**: Razorpay for subscription management
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

1. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required environment variables in `.env.local`:
   - Appwrite credentials (endpoint, project ID, API key, collection IDs)
   - Razorpay credentials (key ID, key secret, webhook secret)
   - Google Gemini API key
   - GitHub OAuth credentials (if using GitHub login)
   - LiveKit credentials (for real-time collaboration)

For detailed setup instructions on the subscription system, see [SUBSCRIPTION_SETUP.md](SUBSCRIPTION_SETUP.md)

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
