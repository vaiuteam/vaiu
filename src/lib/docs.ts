import "server-only";

const introduction = `# Vaiu Documentation

Welcome to the official documentation for **Vaiu**.

Vaiu is a GitHub-native collaboration platform designed to help teams, organizations, and developer communities structure contributions, track development progress, and collaborate more effectively.

Modern software development involves multiple contributors working across repositories, issues, and pull requests. Managing this workflow efficiently while maintaining visibility across development efforts can be challenging.

Vaiu bridges this gap by deeply integrating with GitHub and providing tools for structured collaboration, analytics, and intelligent development insights.

---

# Table of Contents

1. Introduction
2. Why Vaiu
3. Key Features
4. Workspaces
5. GitHub Integration
6. Project Management
7. AI Capabilities
8. Contribution Tracking
9. Analytics
10. Collaboration Tools

---

# Introduction

Software development today involves distributed teams, complex repositories, and multiple collaboration tools. Developers often struggle to maintain visibility into contributions, coordinate work effectively, and onboard new contributors.

Vaiu solves this by providing a unified platform that connects GitHub repositories with collaboration tools, project management features, and intelligent insights.

Whether you are an organization, startup, open-source maintainer, or developer community, Vaiu enables you to manage and track development work seamlessly.

---

# Why Vaiu

Developers and organizations frequently encounter challenges when managing development workflows.

Common problems include:

- Difficulty understanding repository structure
- Complex onboarding processes for new contributors
- Poor visibility into developer contributions
- Fragmented tooling across multiple platforms
- Limited insights into development activity

Vaiu addresses these problems by creating a structured collaboration environment that integrates directly with GitHub.

---

# Key Features

Vaiu provides a comprehensive set of tools to enhance collaboration and productivity.

## Workspaces

Workspaces allow teams and communities to organize their projects and contributors in a structured environment.

Within a workspace you can:

- Manage projects
- Invite contributors
- Track development activity
- Organize collaboration across repositories

---

## Deep GitHub Integration

Vaiu integrates directly with GitHub repositories to synchronize development activities.

This integration enables:

- Pull Request tracking
- Issue synchronization
- Repository insights
- Contributor activity monitoring

Developers can continue using GitHub while gaining additional visibility and collaboration features within Vaiu.

---

## Project Management

Vaiu includes flexible project management tools to help teams organize development work.

Projects can be viewed in multiple formats:

- **Kanban Boards** for workflow management
- **Calendar View** for planning timelines
- **Table View** for structured task tracking

This allows teams to manage both technical and non-technical tasks efficiently.

---

## AI Capabilities

Vaiu uses AI to enhance developer productivity and improve development workflows.

AI-powered features include:

- Pull Request summaries
- Issue analysis
- Code review assistance
- Automated test case generation
- Development insights

These capabilities help teams understand code changes faster and improve overall development quality.

---

## Contribution Tracking

Vaiu provides detailed visibility into developer contributions across repositories.

Teams can track:

- Pull requests created
- Issues resolved
- Code reviews performed
- Overall contribution activity

This helps organizations understand team productivity and contributor impact.

---

## Analytics Dashboard

The analytics dashboard provides insights into development activity and team performance.

Metrics include:

- Contributor activity
- Repository engagement
- Pull request trends
- Development velocity

These insights help teams make better decisions and optimize development workflows.

---

## Collaboration Tools

Vaiu includes built-in collaboration features that enable teams to communicate and coordinate effectively.

Collaboration tools include:

- Audio rooms
- Video rooms
- Shared workspaces

These features allow developers to discuss issues, review code, and collaborate in real-time.

---

# Who is Vaiu for?

Vaiu is designed for multiple types of users in the development ecosystem.

## Organizations

Organizations can use Vaiu to manage development workflows, track contributions, and gain insights into engineering productivity.

---

## Startups

Startups can leverage Vaiu to streamline collaboration, track development progress, and manage projects efficiently.

---

## Open Source Projects

Open-source maintainers can onboard contributors more easily and track contributions across repositories.

---

## Developer Communities

Communities, hackathons, and learning groups can use Vaiu to collaborate on structured projects and improve contributor engagement.

---

# Getting Started

To get started with Vaiu:

1. Create an account on Vaiu.
2. Connect your GitHub account.
3. Create a workspace.
4. Import or connect repositories.
5. Invite collaborators.
6. Start tracking and collaborating on development work.

---

# Support

If you have questions or need assistance, please reach out to the Vaiu team.

Email: contact.vaiuteam@gmail.com

Website: https://vaiu.in

---

**Built for developers who love building together.**`

const gettingStarted = `# Getting Started with Vaiu

## Overview

Vaiu is a GitHub-native collaboration platform that streamlines team coordination, project management, and development insights. This guide will walk you through setting up your first workspace and connecting your GitHub repositories.

## Prerequisites

Before getting started with Vaiu, ensure you have:

- A GitHub account with administrative access to repositories you want to integrate
- An email address for account registration
- Basic familiarity with GitHub workflows

## Creating Your Account

1. Visit the Vaiu homepage
2. Click **Sign Up** in the top navigation
3. Choose your sign-up method:
   - GitHub OAuth (recommended) - Automatically authenticates using your GitHub account
   - Email - Create a new account with your email address
4. Complete your profile information
5. Verify your email address

## Setting Up Your First Workspace

A workspace is your central hub for organizing projects, managing team members, and tracking development activity.

### Creating a Workspace

1. After signing up, navigate to the dashboard
2. Click **+** beside to workspace to create a new workspace
3. Select a workspace type that best fits your needs:
   - **Personal Workspace** - For individual use and experimentation
   - **Organization Workspace** - For teams and organizations to collaborate
4. Enter a workspace name (e.g., "My Organization", "Development Team")
5. Click **Create Workspace** to finalize setup
6. You can upload avatar for your workspace (optional)

### Workspace Settings

Once created, configure your workspace:

1. Click **Settings** under the naigation menu
2. Update workspace details if needed:
   - **Workspace Name** - Identify your workspace
   - **Avatar** - Upload a workspace logo or icon
3. Click **Save** to apply changes
4. You can **Invite Team Members** to the workspace for collaboration by sharing the invite link
5. Click **Delete Workspace** if you want to remove the workspace permanently
6. You can **Disconnect** with github account from the workspace if you want to stop syncing data

## Connecting GitHub Repositories

Vaiu integrates directly with GitHub to sync repositories, issues, and pull requests.

### Installing the GitHub App

1. Click **Connect GitHub**
2. You'll be redirected to GitHub
3. Click **Authorize Vaiu** to grant permissions
4. Select the repositories you want to integrate with Vaiu
5. Complete the authorization process

### What Vaiu Accesses

When you connect GitHub, Vaiu requests permission to:

- Read repository information (name, description, topics)
- Access pull requests and issues
- Read commit history and contributor information
- Monitor repository activity
- Sync pull request and issue updates in real-time

**Note:** Vaiu never accesses your code or commits without explicit user action.

### After connecting GitHub, Import Repositories

Let's create and manage your first project:

1. Click on **+** beside to projects to add a new project
2. Create or Connect a new project:
    - Click on **Create New Project** and name your project and click create project
    - Click on **Add Existing Project** and select the GitHub repository you want to connect and click on add project

## Inviting Team Members

Collaboration requires team participation. Invite members to your workspace:

### Managing Team Members

Once invited, team members will receive an email with a sign-up link. After they join:

- View team members in **Settings** → **Team Members**
- Modify member roles by clicking the member's entry
- Remove members by clicking the trash icon
- Track member activity in the **Members** section

### Adding Tasks

Within a project:

1. Click **Add Task** or drag tasks between columns
2. Enter task details:
   - **Title** - Clear task description
   - **Description** - Detailed explanation
   - **Assignee** - Who is responsible
   - **Status** - New, In Progress, In Review, Done
   - **Priority** - Low, Medium, High, Urgent
   - **Due Date** - When task is due
3. Save the task

## Exploring Your Dashboard

Each project has its own dashboard:

1. Go to **Home** and **select your project** for dashboard view
2. You can view project on github by clicking on **GitHub logo** button
3. Click on **Actions** to perform actions on the project such as:
   - **Upload README** - Add a README file to the project
   - **Add collaborator** - Invite a collaborator to the project
   - **User Management** - Manage users and permissions for the project
   - **Analytics** - View project-specific analytics and insights
   - **Settings** - Manage project settings such as:
      - **Project Name** - Update the name of the project
      - **Project Avatar** - Update the avatar of the project
      - **Invite Collaborators** - Invite collaborators to the project
      - **Delete Project** - Delete the project permanently
4. Projects can be viewed in the form of issues and pull requests by clicking on **Issues** and **Pull Requests** respectively:
   - **Issues** - View and manage all issues related to the project
      - **Kanban Board** - Visualize workflow stages
      - **Calendar** - See timeline and deadlines
      - **Table View** - Structured data overview
   - **Pull Requests** - View and manage all pull requests related to the project
      - **Table View** - Structured data overview
5. Below to the project details, you can view the **READEME** file of the project.

## Next Steps

Now that you've set up Vaiu:

- **Read the GitHub Integration guide** to learn about advanced repository features
- **Explore Project Management** to master workflow organization
- **Set up Analytics** to track team performance
- **Invite your team** to start collaborating
- **Configure AI Features** for enhanced productivity
`

const githubIntegration = `# GitHub Integration Guide

## Overview

Vaiu's GitHub integration creates a seamless connection between your GitHub repositories and the Vaiu collaboration platform. This guide explains how to configure, manage, and maximize your GitHub integration.

## How GitHub Integration Works

Vaiu syncs data from your GitHub repositories in real-time. This includes:

- **Repositories** - Project metadata and configuration
- **Pull Requests** - Code review tracking and status
- **Issues** - Task management and discussions
- **Commits** - Contribution history and authorship
- **Comments** - Feedback and collaboration notes
- **Contributors** - Team member activity and statistics

## Installation and Setup

### Prerequisites

- GitHub account with admin or organization owner access
- At least one GitHub repository
- Vaiu workspace created and active

### Step 1: Install Vaiu GitHub App

1. Navigate to your workspace **Settings**
2. Select **Integrations** → **GitHub**
3. Click **Connect GitHub**
4. You'll be redirected to GitHub's authorization page
5. Review the requested permissions
6. Click **Authorize Vaiu** to grant access

### Step 2: Select Repositories

After authorization:

1. Choose which repositories to connect:
   - **All repositories** - Sync entire GitHub organization
   - **Selected repositories** - Choose specific repos
2. Click **Continue** to proceed
3. Wait for the initial sync (typically 1-5 minutes depending on repository size)

### Step 3: Configure Integration Settings

1. Return to **Settings** → **GitHub Integration**
2. Configure the following options:

#### Sync Settings
- **Auto-sync repositories** - Automatically update when repositories are created
- **Sync interval** - How frequently to check for updates (real-time, hourly, daily)
- **Include private repositories** - Enable if you want to track private repos
- **Sync archived repositories** - Include archived projects

#### Data Settings
- **Sync pull requests** - Enable PR tracking and status updates
- **Sync issues** - Enable issue tracking and analytics
- **Sync commits** - Track commit history and contributors
- **Sync discussions** - Include GitHub Discussions if available

3. Click **Save Configuration**

## Repository Management

### Viewing Connected Repositories

1. Go to **Projects** → **Repositories**
2. See all connected GitHub repositories with:
   - Repository name and description
   - Connection status (connected, syncing, error)
   - Last sync time
   - Number of issues and pull requests

### Repository Settings

For each repository, configure:

1. Click on the repository name
2. Access repository settings:
   - **Display Name** - How the repository appears in Vaiu
   - **Category** - Organize by type (Backend, Frontend, DevOps, etc.)
   - **Owner** - Assign primary owner
   - **Visibility** - Public or private within your workspace
   - **Description** - Additional context for team members

### Disconnecting Repositories

To stop syncing a repository:

1. Navigate to **Projects** → **Repositories**
2. Select the repository
3. Click **Disconnect** in the settings
4. Confirm the action

## Pull Request Management

### Viewing Pull Requests

Vaiu provides a unified view of all connected repositories' pull requests:

1. Go to **Pull Requests** section
2. View pull requests organized by:
   - Repository
   - Status (open, merged, closed, draft)
   - Author
   - Assigned reviewer

### PR Features

#### PR Summaries
Vaiu generates AI-powered summaries of pull requests:

- **Changes Overview** - What was changed and why
- **File Changes** - Affected files and modules
- **Test Coverage** - Whether tests were added
- **Breaking Changes** - Potential impact analysis

#### PR Tracking
- **Approval Status** - Who approved/requested changes
- **CI/CD Status** - Build and deployment status
- **Linked Issues** - Related issues and tasks
- **Discussion Thread** - All comments and conversations

#### Collaboration Features
- **Leave Comments** - Right within Vaiu
- **Request Changes** - Suggest modifications
- **Approve PRs** - Formally approve changes
- **Mark as Ready** - Prepare for merge

### PR Analytics

View metrics such as:

- **Average Review Time** - How long reviews typically take
- **Merge Frequency** - How often code is deployed
- **Rejection Rate** - Percentage of PRs with requested changes
- **Review Participants** - Who reviews most frequently

## Issue Tracking

### Viewing Issues

Access all GitHub issues from connected repositories:

1. Go to **Issues** section
2. Filter by:
   - Repository
   - Status (open, closed, in progress)
   - Assignee
   - Label or milestone
   - Priority or custom fields

### Issue Management

Within Vaiu, you can:

- **Create Issues** - Start new work items
- **Update Status** - Move between workflow stages
- **Assign Issues** - Route work to team members
- **Add Labels** - Categorize and tag issues
- **Link Related Issues** - Show dependencies
- **Add Comments** - Discuss implementation

### Advanced Issue Features

#### Issue Templates
- Create reusable issue templates for consistency
- Pre-populate fields for specific issue types
- Ensure all necessary information is captured

#### Linked PRs
Each issue can be linked to pull requests:

- See which PRs are working on an issue
- Track progress from issue to resolution
- View code changes directly from the issue

#### Custom Fields
Add custom metadata to issues:

- Priority levels (critical, high, medium, low)
- Story points for estimation
- Sprint assignment
- Epic tracking

## Contributor Insights

### Viewing Contributor Activity

Track team member contributions across all repositories:

1. Go to **Contributors** or **Team** section
2. See contributor profiles with:
   - Pull requests created
   - Issues resolved
   - Code reviews performed
   - Commits made
   - Active repositories

### Contribution Metrics

View detailed statistics:

- **Commits** - Number of commits per period
- **PR Activity** - Pull requests opened and merged
- **Code Review** - Reviews given and feedback provided
- **Issues** - Issues created and resolved
- **Collaboration Score** - Overall participation metric

### Contributors Directory

Maintain a directory of team members:

- Profile information and links
- Expertise areas and skills
- Contact information
- Contribution history
- Activity graph and trends

## Webhooks and Real-Time Sync

### How Webhooks Work

Vaiu uses GitHub webhooks for real-time updates:

- Events are instantly synced to Vaiu
- Pull requests update within seconds
- Issue changes appear immediately
- Commit history stays current

### Webhook Configuration

1. In **Settings** → **GitHub Integration**
2. View webhook status and details
3. See recent webhook events and their status
4. Troubleshoot webhook failures if needed

## Troubleshooting

### Common Issues and Solutions

#### Repositories Not Syncing

**Problem:** Repositories appear but data isn't updating

**Solution:**
1. Check GitHub App permissions in your GitHub settings
2. Verify the GitHub App is installed for your organization
3. Reconnect the GitHub integration
4. Contact support if issue persists

#### Missing Pull Requests or Issues

**Problem:** Some PRs or issues don't appear in Vaiu

**Solution:**
1. Ensure the repository is properly connected
2. Check sync settings include issues/PRs
3. Verify the data wasn't archived in GitHub
4. Manually trigger a sync from the integration settings

#### Authorization Errors

**Problem:** Getting permission errors when connecting

**Solution:**
1. Ensure you have admin access to the repositories
2. Check if your GitHub app has been revoked
3. Re-authorize the Vaiu GitHub App
4. Check for rate limiting on your GitHub account

## Best Practices

### Repository Organization

- **Use clear naming conventions** - Easy identification of repository purpose
- **Keep descriptions updated** - Help team members understand projects
- **Organize by category** - Group related repositories
- **Set owners** - Ensure accountability for each repository

### PR Workflow

- **Require code reviews** - Maintain quality standards
- **Use PR templates** - Ensure consistent information
- **Link to issues** - Maintain traceability
- **Keep descriptions clear** - Explain changes thoroughly

### Issue Management

- **Use labels effectively** - Organize and filter efficiently
- **Set priorities** - Help team focus on important work
- **Assign issues** - Ensure accountability
- **Link related work** - Show dependencies

## Privacy and Security

### Data Access

- Vaiu only accesses data you've authorized
- No access to private code or commits
- Data is encrypted in transit and at rest
- Regular security audits ensure compliance

### Revoking Access

To stop Vaiu from accessing GitHub:

1. Go to your GitHub account settings
2. Navigate to **Authorized OAuth Apps**
3. Find "Vaiu" in the list
4. Click **Revoke** to disconnect

## Next Steps

- Learn about **Project Management** to organize work
- Explore **Analytics** to track team performance
- Set up **AI Features** for enhanced insights
- Configure **Team Collaboration** tools

For more help, visit our **Help Center** or contact support@vaiuteam.com
`

const projectManagement = `# Project Management

## Overview

Vaiu's project management tools enable teams to organize, track, and execute work efficiently. This guide covers creating projects, managing tasks, using different views, and collaborating effectively.

## Core Concepts

### Workspace
Your workspace is the top-level container for all projects and team members. Each workspace can contain multiple projects and teams.

### Projects
Projects represent initiatives, products, or focused efforts. Projects contain tasks, issues, and collaborative documents.

### Tasks
Individual work items within a project. Tasks represent specific pieces of work that need to be completed.

### Milestones
Groupings of tasks that represent significant progress points. Milestones help mark phases or releases.

## Creating Projects

### Basic Setup

1. Navigate to your workspace
2. Click **New Project** or the **+** icon
3. Fill in project details:
   - **Project Name** - Clear, descriptive name (e.g., "User Authentication", "Mobile App Release")
   - **Description** - Explain the project's purpose and scope
   - **Status** - Active, Planning, On Hold, or Completed
   - **Owner** - Primary project lead
   - **Team** - Assign team members to the project
4. Click **Create** to initialize the project

### Advanced Project Settings

Access project settings to configure:

#### General Settings
- **Project Visibility** - Public (viewable by all workspace members) or private (restricted access)
- **Project Icon/Color** - Visual identification
- **Archive Settings** - Option to archive when complete

#### Integration Settings
- **GitHub Repositories** - Link connected repositories
- **Custom Fields** - Add project-specific data fields
- **Webhooks** - Connect external services

#### Permission Settings
- **Team Access** - Control who can view/edit
- **Role-Based Permissions** - Define what each role can do

## Managing Tasks

### Creating Tasks

Within a project:

1. Click **Add Task** or use the **+** button
2. Enter task information:
   - **Title** - Specific task description
   - **Description** - Detailed explanation and context
   - **Assignee** - Who is responsible (can assign to yourself or others)
   - **Status** - New, In Progress, In Review, Done
   - **Priority** - Low, Medium, High, or Urgent
   - **Due Date** - When the task should be completed
   - **Estimate** - Time/effort estimate (optional)
   - **Labels** - Tags for categorization
   - **Custom Fields** - Project-specific metadata
3. Click **Create** to add the task

### Task Lifecycle

Tasks progress through workflow states:

- **New** - Newly created or unassigned
- **In Progress** - Active work in progress
- **In Review** - Awaiting review or approval
- **Done** - Completed and closed

Move tasks between states by:
- Dragging in Kanban view
- Clicking status dropdown
- Using bulk actions

### Task Details

Open a task to view/edit:

- **Description** - Full task context
- **Attachments** - Upload files or links
- **Comments** - Discussion thread
- **Activity Log** - History of changes
- **Related Items** - Linked tasks, PRs, or issues
- **Custom Metadata** - Any project-specific fields

### Bulk Operations

Manage multiple tasks efficiently:

1. Select tasks using checkboxes
2. Use bulk action menu:
   - **Change Status** - Update multiple statuses at once
   - **Assign To** - Reassign selected tasks
   - **Add Labels** - Tag multiple items
   - **Delete** - Remove selected tasks

## Project Views

### Kanban Board

Visual workflow management with columns for each status.

**Features:**
- Drag-and-drop task management
- Quick status updates
- Column limits to prevent overload
- Color-coded by priority or assignee
- Filter by team member, label, or custom fields

**Best for:** Visual learners, workflow management, identifying bottlenecks

### Calendar View

Timeline-based view of tasks and deadlines.

**Features:**
- See tasks by due date
- Identify deadline conflicts
- Plan sprint schedules
- Drag tasks to change due dates
- Color-coded by status or assignee
- Week, month, or custom period views

**Best for:** Deadline tracking, sprint planning, capacity planning

### Table View

Structured, spreadsheet-like view of all tasks.

**Features:**
- Column customization (show/hide fields)
- Sorting and filtering
- Inline editing
- Bulk operations
- Export capabilities
- Custom column ordering

**Best for:** Detailed data review, reporting, bulk editing

### Timeline View (Gantt)

Project timeline showing task dependencies and schedule.

**Features:**
- Visual task timeline
- Dependency relationships
- Critical path identification
- Progress tracking
- Milestone markers
- Team availability overview

**Best for:** Complex projects, dependency management, resource planning

## Working with Milestones

### Creating Milestones

1. Go to **Milestones** section in your project
2. Click **New Milestone**
3. Enter milestone details:
   - **Name** - Version or phase name (e.g., "v1.0 Release", "Q2 Launch")
   - **Description** - Goals and deliverables
   - **Due Date** - Target completion date
   - **Target Tasks** - Number of tasks to complete
4. Click **Create**

### Managing Milestones

Within each milestone:

- **Add Tasks** - Assign tasks to milestone
- **Track Progress** - See completion percentage
- **View Metrics** - Tasks completed vs. total
- **Update Status** - Mark milestone complete when finished

### Milestone Timeline

View all milestones in a timeline:

1. Go to **Milestones** view
2. See all upcoming milestones
3. Identify critical milestones
4. Track historical milestones

## Collaboration Features

### Comments and Discussion

Collaborate on tasks:

1. Open a task
2. Scroll to **Comments** section
3. Type your message
4. Use **@mentions** to notify team members
5. Add **reactions** (👍, ❤️, etc.)
6. Click **Post** to publish

**Mention Syntax:**
- \`@username\` - Notify specific person
- \`@team-name\` - Notify entire team
- Links automatically embed GitHub PRs and issues

### Task Assignment

Ensure accountability:

1. Open task details
2. Click **Assignee**
3. Select team member or yourself
4. Assignee receives notification
5. Task appears in their personal tasks

**Multi-Assignment:**
- Assign multiple people to complex tasks
- Each person sees task in their list
- Track individual contribution

### Task Dependencies

Manage task relationships:

1. Open task details
2. Find **Related Items** section
3. Click **Add Relation**
4. Choose relationship type:
   - **Blocks** - This task blocks another
   - **Blocked By** - This task waits for another
   - **Related To** - General relationship
   - **Duplicates** - Marks duplicate work
5. Select the related task
6. Save relationship

### Notifications

Stay informed of task changes:

- **Mentions** - When someone tags you
- **Assignment** - When task assigned to you
- **Comments** - When people comment on your tasks
- **Status Changes** - When task status updates
- **Upcoming Deadlines** - Reminders before due date

Configure notification preferences:

1. Go to **Settings** → **Notifications**
2. Choose notification method (email, in-app, Slack)
3. Set frequency and types to receive

## Advanced Features

### Custom Fields

Add project-specific metadata:

1. Go to **Project Settings** → **Custom Fields**
2. Click **Add Field**
3. Configure field:
   - **Name** - Field label
   - **Type** - Text, Number, Date, Dropdown, Checkbox
   - **Required** - Make field mandatory
   - **Options** - For dropdown types
4. Click **Create**
5. Fields now available on all tasks

### Automation Rules

Automate repetitive workflows:

1. Go to **Project Settings** → **Automations**
2. Click **New Automation**
3. Set trigger conditions:
   - When task status changes
   - When task assigned to someone
   - When deadline approaches
   - When task is created
4. Set actions:
   - Change status automatically
   - Assign to someone
   - Add label
   - Post comment
   - Send notification
5. Save automation

**Example:** "When status changes to Done, automatically close related PRs"

### Templates

Create reusable project structures:

1. Click **Project Settings** → **Templates**
2. Create task templates with:
   - Default title format
   - Pre-filled description
   - Standard labels
   - Assigned teams
3. Use template when creating new tasks
4. Saves time on repetitive work

## Project Analytics

### Overview Dashboard

Each project includes analytics:

- **Tasks Completed** - Progress this period
- **Team Velocity** - Tasks per sprint or week
- **On-Time Delivery** - % of tasks completed by due date
- **Burndown Chart** - Remaining work vs. time

### Reports

Generate detailed reports:

1. Go to **Reports** in project
2. Select report type:
   - **Project Summary** - Overview and metrics
   - **Team Performance** - Individual contributions
   - **Timeline Report** - Schedule adherence
   - **Custom Report** - Build your own
3. Configure filters:
   - Date range
   - Team members
   - Status/priority
   - Custom fields
4. View or export results

## Best Practices

### Project Organization

- **Use consistent naming** - Clear, descriptive names
- **Maintain descriptions** - Keep context updated
- **Regular cleanup** - Archive completed projects
- **Organize by type** - Group similar projects together

### Task Management

- **Write clear titles** - Should be understandable at a glance
- **Provide context** - Detailed descriptions prevent misunderstandings
- **Set realistic deadlines** - Consider dependencies and capacity
- **Regular review** - Update statuses and progress
- **Avoid task creep** - Keep scope focused

### Team Collaboration

- **Use mentions effectively** - Only when truly necessary
- **Provide feedback promptly** - Don't let reviews stall
- **Update status regularly** - Keep team informed
- **Ask for help early** - Don't wait until blocked
- **Celebrate completion** - Recognize milestones

### Performance Optimization

- **Archive old projects** - Keeps workspace clean
- **Use templates** - For recurring work patterns
- **Automate repetitive tasks** - Saves time and reduces errors
- **Review metrics regularly** - Identify improvement areas

## Troubleshooting

### Common Issues

**Task is blocked but unclear why:**
- Check related items for dependencies
- Review comments for context
- Contact assignee for status

**Can't see certain tasks:**
- Check filter settings
- Verify you have permission to view
- Check task status and visibility

**Notifications not working:**
- Verify notification settings
- Check email preferences
- Ensure @ mention syntax is correct

## Next Steps

- Learn about **Analytics** for team performance insights
- Explore **GitHub Integration** to link tasks with code
- Set up **Automations** for workflow efficiency
- Configure **Team Collaboration** tools

For additional help, visit our Help Center or contact support.
`

const organization = `# Are you an Organization?

Organizations can onboard their GitHub repositories to Vaiu to make their projects more structured, trackable, and accessible to contributors.

By connecting repositories to Vaiu, organizations gain deeper visibility into development activity while creating an environment that encourages meaningful contributions.

## Why onboard your repositories?

When repositories are integrated with Vaiu, organizations can:

- Track development activity across issues and pull requests
- Monitor contributor participation and engagement
- Provide structured contribution workflows for developers
- Improve repository discoverability for potential contributors
- Enable better onboarding for new contributors

Vaiu helps organizations transform their repositories into structured collaboration environments where contributors can understand the project, find relevant tasks, and start contributing faster.

## Contributor Discovery

Organizations can expose their repositories to communities, developer groups, and learning environments using Vaiu. This makes it easier for motivated contributors to discover and contribute to projects aligned with their skills and interests.

By providing structured contribution workflows, Vaiu reduces friction for both maintainers and contributors.

## Development Insights

Vaiu also provides analytics and insights for organizations to better understand development activity across their repositories, including:

- Pull request activity
- Issue resolution trends
- Contributor participation
- Development velocity

These insights help teams improve collaboration and maintain healthier development workflows.

## Getting Started for Organizations

1. Create a workspace on Vaiu.
2. Connect your GitHub organization.
3. Import your repositories.
4. Configure contribution workflows.
5. Invite contributors and start collaborating.

Once onboarded, your repositories become easier to manage, track, and contribute to within the Vaiu ecosystem.`;

const teamCollaboration: string = `# Team Collaboration

## Overview

Vaiu provides comprehensive collaboration features that enable teams to communicate, coordinate, and execute projects effectively. This guide covers all tools and practices for seamless team collaboration.

## Communication Channels

### Task Comments

The primary collaboration channel within Vaiu:

#### Creating Comments

1. Open a task or project item
2. Scroll to **Comments** section
3. Click in the comment field
4. Type your message
5. Use formatting:
   - **Bold** - \`**text**\`
   - *Italic* - \`*text*\`
   - \`Code\` - \` \`code\` \`
   - Lists - Use \`-\` or \`1.\`

6. Click **Post**

#### Mention Syntax

Tag specific people or groups:

- \`@username\` - Notify specific team member
- \`@team-name\` - Notify entire team
- Example: \`@alice Please review this approach\`

**Note:** Mentioned users receive notifications immediately

#### Comment Threads

Organize detailed discussions:

1. Post initial comment
2. Others can reply to your comment
3. Thread groups related discussion
4. Expand/collapse thread for cleaner view
5. Thread stays linked to task for context

#### Rich Editing

Enhance communication:

- **Links** - Auto-link to issues, PRs, and tasks
- **Code Blocks** - Share code snippets with syntax highlighting
- **Tables** - Display structured information
- **Checklists** - Track discussion action items
- **Reactions** - Use emoji for quick feedback (👍 ❤️ 😂 ...)

### Real-Time Notifications

Stay updated without constant checking:

#### Notification Types

- **Mentions** - When someone tags you
- **Assignment** - When task assigned to you
- **Comments** - On tasks you follow
- **Status Changes** - When task status updates
- **Deadlines** - Reminders before due date
- **Approvals** - When review action needed

#### Notification Preferences

1. Go to **Settings** → **Notifications**
2. Configure delivery:
   - **In-app** - See in Vaiu notification center
   - **Email** - Receive email alerts
   - **Slack** - Integration with Slack (if connected)
3. Set frequency:
   - **Real-time** - Instant notification
   - **Daily Digest** - Summary email once daily
   - **Weekly Digest** - Summary once weekly
   - **Off** - Disable for specific notification type
4. Save preferences

#### Do Not Disturb

Focus without interruptions:

1. Set DND schedule in notification settings
2. Configure time period (e.g., 5-9 PM weekdays)
3. Choose fallback notification level
4. Critical notifications still reach you

### Activity Feed

Team-wide activity visibility:

#### Dashboard Feed

1. From workspace dashboard, view **Activity Feed**
2. See recent actions:
   - New tasks created
   - Tasks completed
   - Comments posted
   - Files uploaded
   - Team members joined
3. Filter by:
   - Team member
   - Project
   - Activity type
   - Time period

#### Following Items

Track specific work:

1. Open task or project
2. Click **Follow** button
3. Receive notifications on any updates
4. Unfollow when no longer needed
5. View all followed items in **My Items**

## Team Management

### Creating Teams

Organize team members into groups:

1. Go to **Settings** → **Teams**
2. Click **New Team**
3. Enter team information:
   - **Team Name** - Clear identifier
   - **Description** - Team purpose
   - **Lead** - Primary team manager
4. Click **Create**

### Adding Team Members

1. Select team from list
2. Click **Add Members**
3. Select members from workspace
4. Confirm selection
5. Members see team in **My Teams**

**Bulk Add:** Upload CSV with member emails for rapid onboarding

### Team Roles and Permissions

Define team member responsibilities:

#### Role Types

- **Lead** - Manages team, assigns work, approves tasks
- **Contributor** - Completes assigned work, collaborates
- **Reviewer** - Reviews and approves work
- **Observer** - Views progress but doesn't contribute

#### Permission Matrix

| Permission | Lead | Contributor | Reviewer | Observer |
|-----------|------|-------------|----------|----------|
| View tasks | ✓ | ✓ | ✓ | ✓ |
| Create tasks | ✓ | ✓ | ✗ | ✗ |
| Assign tasks | ✓ | ✓ | ✗ | ✗ |
| Review work | ✓ | ✓ | ✓ | ✗ |
| Approve/Merge | ✓ | ✗ | ✓ | ✗ |
| Manage team | ✓ | ✗ | ✗ | ✗ |

### Team Channels (Optional)

Dedicated spaces for team discussions:

1. Go to team settings
2. Click **Add Channel**
3. Create channel with name and description
4. Add team members to channel
5. Use for focused team discussions

## Work Assignment and Tracking

### Assigning Work

Delegate tasks effectively:

1. Open task
2. Click **Assignee** field
3. Select team member
4. Add note about context (optional)
5. Assignee receives notification

**Best Practices:**
- Assign to one person when possible (clear ownership)
- Leave unassigned until ready to start
- Update assignee if circumstances change
- Discuss complex assignments before assigning

### Multi-Person Tasks

For collaborative work:

1. Add primary **Assignee**
2. Add **Collaborators** who will help
3. Each person sees task in their list
4. Use comments for coordination
5. Primary assignee drives completion

### Task Dependencies

Show how work relates:

1. Open task
2. Go to **Related Items**
3. Click **Add Relation**
4. Choose relationship:
   - **Blocks** - This task prevents another from starting
   - **Blocked By** - This task waits for another
   - **Related To** - General connection
   - **Duplicates** - Same work twice
   - **Subtask Of** - Child of larger task
5. Select related task
6. Save relationship

### Progress Tracking

Keep team informed of status:

1. Regular status updates in comments
2. Move task through workflow stages
3. Update estimates if changed
4. Flag blockers immediately
5. Celebrate progress and completions

## Code Review and Quality

### Pull Request Collaboration

When code changes need review:

1. Reviewer receives notification
2. Opens PR in Vaiu or GitHub
3. Reviews code changes
4. Leaves feedback comments
5. Approves or requests changes
6. Author addresses feedback
7. Re-review and approve

### Review Guidelines

Establish consistent code review:

1. Create review checklist template
2. Define response time SLA
3. Set approval requirements
4. Document coding standards
5. Share with team

**Template Example:**
\`\`\`
- [ ] Code follows project standards
- [ ] Tests included and passing
- [ ] Documentation updated
- [ ] No security concerns
- [ ] Performance acceptable
\`\`\`

### Feedback Delivery

Effective review feedback:

- **Be constructive** - Offer solutions, not just criticism
- **Praise good work** - Acknowledge improvements
- **Ask questions** - Don't demand changes
- **Be specific** - Point to exact lines
- **Suggest alternatives** - Offer better approaches
- **Timely response** - Review promptly

## Collaboration Best Practices

### Communication Guidelines

Establish team norms:

1. **Response Times** - How quickly to respond to messages
2. **Escalation Path** - When to involve leadership
3. **Meeting Culture** - When to meet vs. async
4. **Documentation** - What gets documented
5. **Decision Making** - How decisions are made

### Synchronous vs. Asynchronous

Balance real-time and delayed communication:

**Use Synchronous (Meetings/Chat):**
- Complex decisions needed
- High-context discussions
- Conflict resolution
- Brainstorming
- Team building

**Use Asynchronous (Comments/Email):**
- Updates and status
- Documentation
- Decisions that aren't urgent
- Feedback and reviews
- Knowledge sharing

### Document Decisions

Preserve institutional knowledge:

1. After important decision, document in task or project
2. Include:
   - What was decided
   - Why this option was chosen
   - Alternatives considered
   - Who made decision
   - When implemented
3. Link related tasks and discussions
4. Reference in future similar decisions

## Remote Team Best Practices

### Async-First Approach

When team spans time zones:

- **Write clearly** - Assume reader has no context
- **Include background** - Provide necessary history
- **Be explicit** - Don't assume understanding
- **Provide options** - Don't require immediate response
- **Set deadlines** - If response needed urgently
- **Record decisions** - Document outcomes

### Time Zone Considerations

1. Schedule meetings at rotating times
2. Record important meetings for those who can't attend
3. Use async updates for time-sensitive info
4. Respect after-hours boundaries
5. Provide sufficient advance notice

### Remote Onboarding

Help new team members succeed:

1. **Assign onboarding buddy** - Team member for questions
2. **Create checklist** - First week/month tasks
3. **Schedule pair sessions** - For complex systems
4. **Document processes** - Written guides for self-service
5. **Check-ins** - Regular touchpoints
6. **Feedback loops** - How's onboarding going?

## Workspace-Level Collaboration

### Shared Resources

Make information accessible:

1. **Documentation** - Centralized in docs section
2. **Templates** - Reusable project and task templates
3. **Processes** - Standard workflows and checklists
4. **Tools** - Links to external resources
5. **Contact Info** - Team directory with roles

### Knowledge Sharing

Build institutional knowledge:

1. **Lessons Learned** - After project completion
2. **Tech Talks** - Share technical knowledge
3. **Mentoring** - Pair experienced with new members
4. **Wikis** - Internal documentation
5. **Best Practices** - Documented processes

## Collaboration Tools Integration

### Slack Integration

Connect Vaiu with Slack for notifications:

1. Go to **Settings** → **Integrations** → **Slack**
2. Click **Connect Slack**
3. Authorize Vaiu app in Slack
4. Configure notifications:
   - Where to send (channel or direct message)
   - What events to notify
   - Notification frequency
5. Use \`/vaiu\` commands for quick access

### Email Integration

Collaborate via email:

- Receive task updates via email
- Reply to emails to comment on tasks
- Configure email frequency
- Unsubscribe from specific threads

### Custom Webhooks

Connect external tools:

1. Go to **Settings** → **Webhooks**
2. Click **Add Webhook**
3. Configure:
   - Trigger events
   - Webhook URL
   - Authentication
4. Test connection
5. Monitor webhook activity

## Collaboration Metrics

### Team Health Indicators

Monitor team collaboration:

- **Response Time** - How quickly team responds
- **Engagement** - Who participates in discussions
- **Collaboration** - Cross-team coordination
- **Knowledge Sharing** - Documentation and mentoring
- **Satisfaction** - Team morale (via surveys)

## Troubleshooting

### Communication Breakdowns

**Issue:** Messages not reaching intended recipient

**Solution:**
- Verify mention syntax (\`@username\`)
- Check notification settings
- Confirm recipient is team member
- Try direct message or email

### Assignment Confusion

**Issue:** Unclear who should do what

**Solution:**
- Clearly assign to one person
- Document in task description
- Use comments for context
- Discuss if complex

### Review Delays

**Issue:** Code reviews taking too long

**Solution:**
- Set explicit SLA (e.g., 24 hours)
- Assign to specific reviewer
- Increase reviewer resources
- Use automation for simple checks

## Team Health Checklist

Regularly assess collaboration health:

- [ ] Response times are reasonable
- [ ] Clear task ownership
- [ ] Active engagement in discussions
- [ ] Knowledge being shared
- [ ] No bottlenecks or blockers
- [ ] Team feels heard and valued
- [ ] Decisions are transparent
- [ ] Conflicts resolved respectfully

## Next Steps

- Set up **Team Automations** to reduce manual work
- Explore **Analytics** to measure collaboration
- Configure **Notifications** for optimal information flow
- Review **Best Practices** for your team context

For support, reach out to our team collaboration specialist at support@vaiuteam.com
`;

const workspaceManagement: string = `# Workspace Management and Administration

## Overview

This guide covers workspace administration, team management, security, billing, and best practices for maintaining a productive Vaiu workspace.

## Workspace Fundamentals

### What is a Workspace?

A workspace is your organization's hub in Vaiu:

- **Container** - Holds all projects, teams, and resources
- **Boundary** - Defines who has access to what
- **Billing Unit** - Charges applied at workspace level
- **Collaboration Hub** - Central point for team coordination

### Workspace Tiers

| Feature | Free | Professional | Enterprise |
|---------|------|--------------|-----------|
| Projects | Up to 3 | Unlimited | Unlimited |
| Team Members | 5 | 25 | Custom |
| GitHub Repos | 5 | Unlimited | Unlimited |
| Storage | 1 GB | 100 GB | 1 TB |
| Analytics | Basic | Advanced | Custom |
| Support | Community | Email | Priority |
| Custom Domain | ✗ | ✗ | ✓ |
| SSO | ✗ | ✗ | ✓ |

## Workspace Settings

### Basic Configuration

1. Go to **Settings** → **Workspace Settings**
2. Configure:
   - **Workspace Name** - Display name
   - **Description** - Purpose of workspace
   - **Avatar** - Logo or icon
   - **Slug** - URL identifier
   - **Time Zone** - For deadline calculations
   - **Language** - Default language
3. Click **Save**

### Workspace Visibility

Control who can discover your workspace:

1. Go to **Settings** → **Privacy & Visibility**
2. Set visibility:
   - **Private** - Only invited members
   - **Public** - Anyone can discover
   - **Internal** - Organization members only
3. Configure listing:
   - Show in workspace directory
   - Include in search results
   - Add workspace description
4. Save settings

### Custom Branding

Professional appearance:

1. Upload workspace logo (recommended 200x200px)
2. Set primary color scheme
3. Upload banner image for workspace header
4. Customize workspace URL (if available)
5. Add custom CSS for advanced styling (Enterprise)

## Team and Member Management

### Workspace Roles

Define permissions at workspace level:

#### Owner
- Full administrative access
- Manage team members and roles
- Access billing and payment
- Configure workspace settings
- Delete workspace
- **Limit** - Up to 3 owners

#### Admin
- Manage projects and teams
- Invite/remove members
- Configure integrations
- View analytics and reports
- Cannot modify billing
- **Limit** - No limit

#### Member
- View and participate in projects
- Create tasks and collaborations
- Access personal settings
- Cannot modify workspace settings

#### Guest
- Limited access to specific projects
- Read-only access to shared items
- Cannot create new content
- Temporary access option

### Inviting Members

Add people to your workspace:

1. Go to **Settings** → **Team Members**
2. Click **Invite Members**
3. Enter email addresses (comma or line-separated)
4. Select role for each person
5. Customize invitation message (optional)
6. Click **Send Invitations**

**Bulk Invite:** Upload CSV file with emails and roles

### Managing Members

Control team access:

1. View all members in **Settings** → **Team Members**
2. For each member:
   - **Edit** - Change role or permissions
   - **Remove** - Revoke access (confirm action)
   - **Deactivate** - Temporarily suspend (keeps data)
   - **Reactivate** - Restore access
3. Export member list for records

### Member Lifecycle

#### Onboarding
1. Send invitation with clear instructions
2. Schedule onboarding call
3. Assign buddy for questions
4. Provide documentation access
5. Monitor activity first week

#### Active Membership
- Regular check-ins
- Clear communication
- Opportunity for growth
- Feedback channels

#### Offboarding
1. Document their knowledge/projects
2. Transfer ownership of projects
3. Remove access to sensitive areas
4. Schedule exit interview
5. Archive their contributions
6. Remove access on final day

## Security and Access Control

### Access Levels

Granular permission control:

#### Workspace Level
- Can access workspace and projects
- Can modify own profile
- Cannot access workspace settings

#### Project Level
- Can view project (if granted)
- Can edit tasks and comments
- Cannot modify project settings (unless admin)

#### Document Level
- Can view/comment specific items
- Fine-grained visibility control
- Limited to assigned items

### Two-Factor Authentication (2FA)

Enhance security:

#### Enable 2FA
1. Go to **Settings** → **Security**
2. Click **Enable Two-Factor Authentication**
3. Choose authentication method:
   - Authenticator app (Google Authenticator, Authy)
   - SMS text message
4. Complete setup process
5. Save recovery codes in safe location

#### Require 2FA for Workspace
1. Go to **Settings** → **Security** (Admin only)
2. Check **Require 2FA for all members**
3. Set grace period (days to comply)
4. Members prompted to enable
5. Non-compliance results in restricted access

### Session Management

Control active sessions:

1. Go to **Settings** → **Sessions**
2. View active sessions:
   - Device and browser
   - Location
   - Last activity
   - Session duration
3. **Sign Out** - End specific session
4. **Sign Out All** - End all sessions except current

### Activity Audit Log

Track workspace actions:

1. Go to **Settings** → **Audit Log** (Admin only)
2. View all workspace actions:
   - User actions
   - Project changes
   - Member management
   - Settings modifications
   - Access changes
3. Filter by:
   - Date range
   - User
   - Action type
   - Resource
4. Export log for compliance

## Billing and Subscription

### Viewing Subscription

See current plan and usage:

1. Go to **Settings** → **Billing**
2. View:
   - Current plan name
   - Monthly cost
   - Renewal date
   - Usage vs. limits
3. Billing contact information

### Upgrading Plan

Move to higher tier:

1. Go to **Settings** → **Billing** → **Plans**
2. Click **Upgrade** on desired plan
3. Review changes and costs
4. Confirm upgrade
5. Plan activates immediately
6. Prorated charges applied

### Payment Methods

Manage payment information:

1. Go to **Settings** → **Billing** → **Payment Method**
2. Add credit card:
   - Cardholder name
   - Card number (PCI compliant)
   - Expiration date
   - CVV
   - Billing address
3. Set primary card
4. Add backup payment method
5. Remove old cards

### Invoices and Receipts

Access billing history:

1. Go to **Settings** → **Billing** → **Invoices**
2. View invoice list:
   - Date
   - Amount
   - Plan
   - Status
3. Click invoice for details
4. Download PDF copy
5. Export for accounting

### Billing Notifications

Configure billing alerts:

1. Go to **Settings** → **Billing** → **Notifications**
2. Set alerts for:
   - Upcoming renewal
   - Payment failed
   - Usage exceeding limits
   - Subscription changes
3. Choose notification method (email)
4. Save preferences

## Integrations and Automation

### Third-Party Integrations

Extend workspace functionality:

1. Go to **Settings** → **Integrations**
2. Browse available integrations:
   - **GitHub** - Repository sync
   - **Slack** - Notifications
   - **Microsoft Teams** - Collaboration
   - **Jira** - Issue tracking sync
   - **Zapier** - Workflow automation
3. Click integration to configure
4. Authorize and set permissions
5. Save configuration

### Webhooks

Custom integrations via webhooks:

1. Go to **Settings** → **Webhooks**
2. Click **Add Webhook**
3. Configure:
   - **URL** - Where to send events
   - **Events** - Which actions trigger webhook
   - **Headers** - Custom authentication
4. Test webhook
5. Monitor webhook activity and logs

### API Access

Programmatic workspace access:

1. Go to **Settings** → **API Keys**
2. Click **Generate New Key**
3. Name the key
4. Select scopes (what API can access)
5. Copy key to safe location
6. Use in applications/scripts

**Security:** Treat API keys like passwords; never share

## Data Management

### Data Backup

Protect your workspace data:

1. Go to **Settings** → **Data**
2. View backup status
3. Configure backup frequency:
   - **Daily** - Once per day
   - **Weekly** - Every Sunday
   - **Monthly** - First of month
4. Download manual backup anytime
5. Automatic backups retained for 30 days

### Data Export

Export all workspace data:

1. Go to **Settings** → **Data** → **Export**
2. Select what to export:
   - Projects and tasks
   - Team members
   - Analytics data
   - Comments and discussions
3. Choose format (JSON, CSV, or ZIP)
4. Confirm export
5. Download when ready

### Data Retention

Configure data handling:

1. Go to **Settings** → **Data Retention**
2. Set policies:
   - How long to keep deleted items
   - Archive old projects after inactivity
   - Remove inactive user data
3. Specify retention periods
4. Save policies

### GDPR and Privacy Compliance

1. View **Data Privacy** section
2. Configure:
   - Right to be forgotten (deletion)
   - Data portability
   - Consent management
3. Generate compliance reports
4. Export required documentation

## Workspace Maintenance

### Performance Optimization

Keep workspace running smoothly:

1. **Archive old projects** - Move inactive projects to archive
2. **Delete unnecessary data** - Remove test content
3. **Optimize integrations** - Disable unused integrations
4. **Review permissions** - Ensure no unnecessary access
5. **Clean up templates** - Remove outdated templates

### Regular Health Checks

Monthly maintenance:

1. Review team member access
2. Check active projects
3. Monitor storage usage
4. Verify integrations working
5. Review security audit log
6. Check billing accuracy
7. Update workspace documentation

### Workspace Scaling

As workspace grows:

1. **Larger team** - Move to Professional/Enterprise plan
2. **More projects** - Implement project naming conventions
3. **More data** - Archive historical projects
4. **Complex workflows** - Create automation rules
5. **Compliance needs** - Enable advanced security features

## Troubleshooting

### Member Can't Access

**Issue:** Team member unable to log in or see projects

**Solution:**
1. Verify membership status in **Team Members**
2. Check if account is deactivated
3. Confirm they accepted invitation
4. Verify role has necessary permissions
5. Check project-level permissions
6. Ask them to clear browser cache

### Billing Issues

**Issue:** Charged incorrectly or payment failed

**Solution:**
1. Review invoice details
2. Check for overage charges
3. Verify payment method is current
4. Contact billing support with invoice number
5. Request refund if necessary

### Integration Not Working

**Issue:** GitHub/Slack integration stopped syncing

**Solution:**
1. Go to **Settings** → **Integrations**
2. Check connection status
3. Re-authorize if needed
4. Check webhook activity log
5. Verify API key is valid
6. Test with small action first

## Best Practices

### Workspace Organization

- **Clear naming** - Descriptive workspace name
- **Consistent structure** - Logical project organization
- **Regular maintenance** - Archive completed projects
- **Documentation** - Document processes and standards
- **Team size** - Keep teams manageable (<50 members)

### Security

- **Enable 2FA** - Protect all accounts
- **Regular audits** - Review access logs
- **Principle of least privilege** - Give minimum necessary access
- **Strong passwords** - Enforce in security settings
- **Rotate API keys** - Regularly update credentials

### Team Management

- **Clear roles** - Everyone understands responsibilities
- **Regular communication** - Keep team aligned
- **Feedback loops** - Regular check-ins and surveys
- **Career development** - Support growth opportunities
- **Work-life balance** - Monitor workload and burnout risk

### Compliance and Governance

- **Document decisions** - Record important choices
- **Audit trails** - Maintain activity logs
- **Data governance** - Clear policies on data handling
- **Vendor management** - Evaluate third-party integrations
- **Regular reviews** - Quarterly compliance checks

## Support and Help

### Getting Support

1. **Help Center** - Self-service documentation
2. **Support Email** - support@vaiuteam.com
3. **Community Forum** - Peer support
4. **Slack Channel** - Direct support (Premium)
5. **Priority Support** - Enterprise customers

### Reporting Issues

When reporting problems:

1. Describe the issue clearly
2. Include steps to reproduce
3. Provide error messages
4. Screenshot if visual issue
5. Include browser/device info
6. Mention workspace name

## Next Steps

- Configure **Security Settings** for your team
- Set up **Integrations** with tools you use
- Establish **Team Roles and Permissions**
- Schedule regular **Maintenance Reviews**

For detailed workspace setup, schedule a consultation with our onboarding team.
`;

const aiFeatures: string = `# AI Features and Capabilities

## Overview

Vaiu integrates advanced AI capabilities to enhance productivity, improve code quality, and provide intelligent insights. This guide explains how to use and maximize AI features in your workflow.

## AI-Powered Features

### Pull Request Summaries

AI automatically generates comprehensive summaries of pull requests:

#### What Gets Summarized

- **Overview** - What was changed and why
- **Files Modified** - Which files and what changed
- **Key Changes** - Most important modifications
- **Test Coverage** - Whether tests were added
- **Breaking Changes** - Potential impact analysis
- **Dependencies** - New or updated dependencies
- **Performance Impact** - Any speed improvements/regressions

#### How to Use PR Summaries

1. Open a pull request in Vaiu
2. Scroll to **AI Summary** section
3. Read generated summary for quick understanding
4. Click **Details** for more information
5. Use summary to inform code review decision

#### Customizing Summaries

1. Go to **Settings** → **AI Preferences**
2. Configure summary details:
   - **Include dependencies** - Yes/No
   - **Include performance** - Yes/No
   - **Include breaking changes** - Yes/No
   - **Summary length** - Brief, Normal, Detailed
3. Save preferences

### Issue Analysis

AI analyzes GitHub issues to provide context and suggestions:

#### Issue Summaries

Automatically generated for new issues:

- **Description Clarity** - How well the issue is described
- **Priority Assessment** - Suggested priority level
- **Complexity Estimate** - Estimated effort to resolve
- **Related Issues** - Potentially connected issues
- **Suggested Labels** - Recommended tags/categories
- **Estimated Time** - Effort estimate

#### Accessing Issue Analysis

1. Open an issue in Vaiu
2. View **AI Analysis** section
3. See recommendations
4. Apply suggestions or use as reference
5. Feedback helps improve AI

### Code Review Assistance

AI supports code review process:

#### Automated Code Review

AI reviewer checks for:

- **Code Quality** - Style, naming, structure
- **Security Issues** - Potential vulnerabilities
- **Performance** - Optimization opportunities
- **Best Practices** - Following conventions
- **Documentation** - Is code well-documented?
- **Test Coverage** - Are tests adequate?

#### How to Use

1. Open pull request
2. Look for **AI Review** comments
3. Review suggestions alongside human reviews
4. Use to identify common issues
5. React to comments to provide feedback

#### Limitations

AI review:
- Complements but doesn't replace human review
- May miss context-specific logic
- Focuses on common patterns
- Requires human judgment for business logic

### Development Insights

AI generates insights from development patterns:

#### Contributor Insights

Analysis of team members' contributions:

- **Expertise Areas** - Strongest skills and knowledge
- **Collaboration Style** - How they work with others
- **Specialization** - Which areas they focus on
- **Growth Areas** - Skills to develop
- **Impact** - Contribution to team success

#### Repository Insights

Automated analysis of repositories:

- **Code Health** - Overall quality assessment
- **Hotspots** - Most frequently changed files
- **Complexity** - Complicated areas needing attention
- **Test Coverage** - Adequacy of testing
- **Maintenance Burden** - Technical debt assessment
- **Velocity Trends** - Development speed over time

#### Project Insights

Analysis of project progress:

- **Trend Analysis** - Direction and velocity
- **Risk Assessment** - Potential issues ahead
- **Resource Needs** - Adequate team capacity?
- **Timeline Forecast** - Estimated completion
- **Quality Trajectory** - Code quality trends

### Automated Test Case Generation

AI can suggest or generate test cases:

#### Test Case Suggestions

When reviewing PR:

1. AI analyzes code changes
2. Suggests potential test scenarios
3. Identifies edge cases
4. Recommends coverage improvements
5. Shows example test structure

#### Using Test Suggestions

1. Open PR in Vaiu
2. View **Suggested Tests** section
3. Review suggested scenarios
4. Use as template for real tests
5. Implement as needed

**Note:** Always verify AI-generated tests work correctly

### Analytics Prediction

AI forecasts team and project metrics:

#### Velocity Forecasting

Predicts future team velocity:

1. Analyzes historical velocity
2. Factors in trends and seasonality
3. Accounts for team changes
4. Provides confidence range
5. Shows on charts with confidence interval

#### Timeline Estimation

Projects future project completion:

1. Analyzes current pace
2. Estimates work remaining
3. Factors in dependencies
4. Predicts completion date
5. Shows risk factors

#### Performance Trends

Forecasts quality and productivity:

1. Current trend direction
2. Projected trajectory
3. Recommended actions
4. Risk areas to address

## Configuring AI Features

### AI Preferences

Customize AI behavior:

1. Go to **Settings** → **AI Preferences**
2. Configure each feature:
   - Enable/disable specific features
   - Set detail levels
   - Adjust sensitivity
   - Choose notification preferences
3. Save preferences

### Privacy and Data

Understand AI data usage:

#### What AI Accesses

AI uses the following to generate insights:

- Public pull request content
- Commit messages and metadata
- Issue descriptions and comments
- Code changes (if analysis enabled)
- Publicly available repository info

#### What AI Doesn't Access

- Private code repositories
- Password or secrets
- Personally identifiable information
- Private communications
- Files marked as private

#### Data Retention

- AI analysis stored temporarily
- Historical insights kept for trends
- User can delete analysis history
- Data follows workspace retention policy
- Compliant with privacy regulations

### Opting Out

Disable AI features:

1. Go to **Settings** → **AI Preferences**
2. Toggle features off individually
3. Or disable all AI features at once
4. Changes apply immediately
5. Can re-enable anytime

## AI Best Practices

### Using AI Effectively

#### Trust but Verify

- AI provides suggestions, not directives
- Human judgment remains critical
- Always review AI recommendations
- Context matters; AI lacks full understanding
- Use AI to enhance, not replace, decision-making

#### Feedback Improves AI

- React to AI suggestions (helpful/not helpful)
- Provide corrections when AI is wrong
- Explicit feedback trains AI model
- More feedback = better recommendations
- Your feedback helps entire community

#### Starting Simple

1. Enable one AI feature first
2. Learn how it works
3. Evaluate usefulness
4. Gradually enable more features
5. Refine preferences over time

### When to Use AI

#### Good Use Cases

- Initial code review pass for common issues
- Identifying potential problems to investigate
- Understanding PR changes quickly
- Generating test case ideas
- Spotting performance opportunities
- Automating routine analysis

#### Poor Use Cases

- Final code quality judgment
- Architecture decisions
- Business logic validation
- Security-critical code review
- Performance optimization without testing
- Replacing developer expertise

## AI Feature Details

### PR Summary Accuracy

**Accuracy Rate:** 92% for factual changes
**Limitations:**
- May miss subtle logic changes
- Context-dependent logic needs human review
- Cannot assess "why" decisions
- Doesn't judge code quality
- May misunderstand complex algorithms

### Issue Analysis

**Accuracy Factors:**
- Well-written issues = Better analysis
- Clear requirements = More precise estimates
- Complete information = Stronger insights
- Vague issues = Less accurate analysis

**Improvement Tips:**
- Include specific details in issue description
- Provide examples and expected behavior
- Link related issues and PRs
- Specify acceptance criteria
- Include error messages if relevant

### Code Review Suggestions

**Coverage:**
- General code quality: 85% accuracy
- Security issues: 78% accuracy
- Performance: 65% accuracy
- Best practices: 88% accuracy

**Human Review Required:**
- Business logic validation
- Architectural decisions
- Context-specific exceptions
- Final approval authority

## Common AI Questions

### "Can AI review my code?"

AI can assist with code review by identifying common issues, but human review is essential. Use AI as first pass to catch obvious problems.

### "Does AI see my private repositories?"

No. AI only accesses repositories you've explicitly connected to Vaiu, and respects all privacy settings. Private repositories remain private.

### "How accurate are AI estimates?"

Estimates improve with historical data. Early projects have wider confidence ranges. As team patterns emerge, accuracy increases.

### "Can I customize AI behavior?"

Yes. Configure detail levels, enable/disable features, and provide feedback to train AI for your team's specific patterns.

### "What if AI makes incorrect suggestions?"

Provide negative feedback so AI learns. No harm in incorrect suggestions if humans verify. Use feedback to improve AI over time.

## Advanced AI Configuration

### Workspace-Level Settings

Configure AI for entire workspace:

1. Go to **Settings** → **AI Configuration** (Admin only)
2. Set workspace defaults:
   - AI feature availability
   - Data privacy levels
   - Notification preferences
   - Required human review gates
3. Individual users can override (if allowed)

### Team-Specific AI Profiles

Customize AI by team:

1. Go to team settings
2. Configure AI behavior:
   - Which features enabled
   - Detail levels
   - Specific analysis focus
3. Team members inherit settings
4. Can be overridden individually

## Troubleshooting AI Features

### AI Not Working

**Issue:** AI features not providing suggestions

**Solution:**
1. Verify AI features are enabled
2. Check workspace plan supports AI
3. Ensure sufficient data for analysis
4. Refresh page or restart browser
5. Contact support with workspace name

### Incorrect AI Suggestions

**Issue:** AI providing bad recommendations

**Solution:**
1. Provide feedback (incorrect suggestion)
2. Add more context if possible
3. Check privacy settings
4. Verify correct repository connected
5. AI learns from feedback

### Performance Issues

**Issue:** AI analysis taking too long

**Solution:**
1. Check browser performance
2. Reduce number of AI features enabled
3. Check internet connection
4. Clear browser cache
5. Try different browser

## AI Roadmap

Planned AI features:

- **Commit Message Improvement** - Suggest better commit messages
- **Deployment Risk** - Predict deployment success
- **Refactoring Suggestions** - AI-suggested code improvements
- **Documentation Generation** - Auto-generate API docs
- **Training Recommendations** - Suggest learning resources
- **Incident Prevention** - Warn of potential issues

## Best Practices Summary

### For Development Teams

1. **Start simple** - Enable one feature, learn it well
2. **Provide feedback** - React to suggestions
3. **Verify AI suggestions** - Don't trust blindly
4. **Use for efficiency** - Save time on routine analysis
5. **Keep humans in charge** - AI supports, doesn't decide

### For Team Leads

1. **Educate team** - Explain AI capabilities
2. **Set expectations** - AI has limitations
3. **Establish guidelines** - How to use AI in reviews
4. **Monitor quality** - Ensure standards maintained
5. **Gather feedback** - How team finds AI useful

### For Organization

1. **Privacy first** - Understand data usage
2. **Security conscious** - AI doesn't compromise security
3. **Compliance aware** - AI follows regulations
4. **Continuous improvement** - Provide feedback
5. **Responsible use** - AI augments, doesn't replace humans

## Support and Resources

### Learning More

- **Help Center** - Detailed guides on each feature
- **Video Tutorials** - See AI features in action
- **Blog Posts** - Use cases and success stories
- **Community Forum** - Ask questions, share experiences
- **Support Chat** - Direct help from AI team

### Feedback and Improvement

Have suggestions?

1. Use **Send Feedback** in app
2. Vote on feature requests
3. Participate in beta testing
4. Join AI focus groups
5. Email ideas to: ai-feedback@vaiuteam.com

## Next Steps

1. **Explore AI Features** - Try each one
2. **Configure Preferences** - Customize for your needs
3. **Provide Feedback** - Help us improve
4. **Integrate into Workflow** - Make AI part of process
5. **Measure Impact** - Track time saved and quality improvements

Welcome to AI-enhanced development! 🚀
`;

const analytics: string = `# Analytics and Insights

## Overview

Vaiu's analytics platform provides comprehensive insights into team performance, development velocity, contributor activity, and project progress. This guide helps you leverage data to make informed decisions and optimize workflows.

## Accessing Analytics

### Analytics Dashboard

1. From your workspace, click **Analytics** in the main navigation
2. View the default dashboard with key metrics
3. Customize your view or create new dashboards

### Project Analytics

For specific project insights:

1. Open a project
2. Click **Analytics** tab
3. See project-specific metrics and trends

## Key Metrics

### Team Performance Metrics

#### Team Velocity

Measure how many tasks your team completes per sprint or time period.

- **Definition** - Tasks completed divided by time period
- **Calculation** - Sum of completed tasks per sprint
- **Interpretation** - Higher velocity indicates productivity
- **Trends** - Shows improvement over time

**Use:** Estimate future sprint capacity, identify productivity trends

#### On-Time Delivery Rate

Percentage of tasks completed by their due date.

- **Formula** - (Tasks completed on time / Total completed tasks) × 100
- **Target** - Aim for 80%+ on-time delivery
- **Tracking** - Monitor improvement over time
- **Impact** - Indicates reliability and predictability

**Use:** Assess time management, adjust estimation practices

#### Average Cycle Time

Average duration from task creation to completion.

- **Calculation** - Total time in progress ÷ Number of completed tasks
- **Factors** - Complexity, dependencies, resource availability
- **Trends** - Should decrease with experience
- **Optimization** - Identify long-running tasks

**Use:** Understand workflow efficiency, spot bottlenecks

### Contributor Metrics

#### Contribution Volume

Track individual and team contributions:

- **Pull Requests** - Code changes submitted
- **Issues Resolved** - Problems fixed or features completed
- **Code Reviews** - Feedback provided to team
- **Commits** - Code modifications made
- **Comments** - Discussions and collaboration

#### Contribution Patterns

Analyze how team members work:

- **Most Active Hours** - When people contribute most
- **Most Active Days** - Day of week patterns
- **Collaboration Frequency** - How often people work together
- **Communication Style** - Length and tone of comments

#### Expertise Areas

Identify team strengths:

- **Repository Expertise** - Who knows each area best
- **Technology Stack** - Skills by programming language
- **Feature Ownership** - Who maintains key features
- **Mentorship** - Who helps new team members

### Project Metrics

#### Project Status

Real-time project health indicators:

- **Completion Rate** - % of tasks completed
- **On-Schedule Status** - Ahead, on-time, or behind
- **Blocker Count** - Tasks waiting on others
- **At-Risk Items** - Tasks approaching deadline
- **Unassigned Tasks** - Work without owner

#### Release Metrics

For release or milestone-based projects:

- **Scope** - Total items in release
- **Progress** - Items completed vs. remaining
- **Timeline** - Estimated vs. actual completion
- **Quality** - Defects or rework items
- **Velocity** - Completion rate vs. time

#### Quality Metrics

Code and process quality indicators:

- **PR Review Time** - Average time to review code
- **Defect Rate** - Bugs per 1000 lines of code
- **Test Coverage** - % of code covered by tests
- **Build Success Rate** - % of builds passing
- **Merge Frequency** - How often code ships

## Analytics Views

### Dashboard View

Customizable view of key metrics:

1. **Add Widgets** - Click **+** to add metric cards
2. **Rearrange** - Drag widgets to reorder
3. **Filter** - Set date ranges and team filters
4. **Export** - Download dashboard snapshot
5. **Share** - Share dashboard with team

### Trend Analysis

View metrics over time:

1. Select a metric
2. Choose time period (week, month, quarter)
3. View trend graph showing progress
4. Identify patterns and anomalies
5. Export trend data

### Comparison Views

Compare metrics across projects or teams:

1. Go to **Comparative Analytics**
2. Select comparison type:
   - **Project vs Project** - Compare project performance
   - **Team Member vs Team Member** - Compare contributors
   - **Time Period vs Time Period** - Compare growth
3. View comparison charts
4. Analyze differences

### Custom Reports

Build tailored reports for stakeholders:

1. Click **Create Report**
2. Select metrics to include
3. Choose report format:
   - Summary report
   - Detailed analysis
   - Executive overview
4. Set filters and date ranges
5. Generate and share

## GitHub Integration Metrics

### Pull Request Analytics

Comprehensive PR metrics from connected repositories:

#### PR Volume
- **PRs Created** - New pull requests per time period
- **PRs Merged** - Successfully merged changes
- **PRs Declined** - Rejected or closed PRs
- **Merge Rate** - % of PRs successfully merged

#### Review Metrics
- **Average Review Time** - Time from creation to first review
- **Approval Time** - Time to get required approvals
- **Requested Changes** - How often changes are requested
- **Review Participants** - Who participates most

#### Code Change Metrics
- **Files Changed** - Average files per PR
- **Lines Added/Removed** - Code volume changes
- **Complexity** - Simple vs. complex changes
- **Merge Conflicts** - Frequency of merge issues

### Issue Analytics

#### Issue Volume
- **Created** - New issues opened
- **Resolved** - Issues closed
- **Active Issues** - Currently open
- **Resolution Rate** - % of issues resolved

#### Issue Lifecycle
- **Time to Resolution** - Average time from open to close
- **Time to First Response** - How quickly issues get attention
- **Average Reopens** - How often issues reopen
- **Aging Issues** - Long-open issues

#### Issue Distribution
- **By Repository** - Which repos have most issues
- **By Type** - Bug vs. feature vs. enhancement
- **By Label** - Issues by category
- **By Assignee** - Who handles which issues

### Contributor Analytics

#### Activity Summary
- **Commits** - Code changes by contributor
- **PR Participation** - PRs authored and reviewed
- **Issue Resolution** - Problems fixed
- **Communication** - Comments and discussions

#### Expertise Indicators
- **Repository Specialization** - Where they contribute most
- **Technology Expertise** - Languages and tools used
- **Collaboration** - How they work with others
- **Leadership** - Mentoring and code review

## Team Performance Insights

### Team Capacity Planning

Use metrics to estimate team capacity:

1. Review historical velocity (tasks/sprint)
2. Factor in planned time off
3. Account for quality assurance time
4. Add buffer for unexpected issues
5. Set realistic sprint goals

**Formula:** Baseline Velocity × (1 - Vacation %) × (1 - Buffer %) = Sprint Capacity

### Performance Trends

Identify patterns and improvements:

- **Velocity Trends** - Is team getting faster or slower?
- **Quality Trends** - Is code quality improving?
- **Collaboration Trends** - Is team communication improving?
- **Cycle Time Trends** - Are we completing work faster?

**Action:** Address negative trends, reinforce positive changes

### Workload Distribution

Ensure balanced team workload:

1. Review task assignment by team member
2. Identify overloaded team members
3. Redistribute work as needed
4. Monitor balance over time
5. Adjust based on capacity

## Advanced Analytics

### Forecasting

Predict future performance:

1. Historical data analysis
2. Trend extrapolation
3. Capacity modeling
4. Timeline forecasting

**Use:** Estimate project completion, plan resource allocation

### Burndown Charts

Visual representation of work remaining:

- **Ideal Burndown** - Perfect pace to complete sprint
- **Actual Burndown** - Real progress
- **Scope Creep** - When more work is added
- **Velocity Dips** - When productivity slows

**Interpretation:** Line should follow ideal burndown; gaps indicate issues

### Bottleneck Analysis

Identify workflow obstacles:

1. Find tasks with longest cycle times
2. Analyze why they take longer
3. Identify common reasons:
   - Waiting for review
   - Blocked by dependencies
   - Complexity
   - Resource constraints
4. Implement improvements

### Team Health Scoring

Composite health indicator (0-100):

- **Velocity** - Productivity level
- **Quality** - Code quality and defect rate
- **Collaboration** - Team communication
- **Predictability** - On-time delivery
- **Burnout Risk** - Workload and pace

**Interpretation:** 80-100 = Healthy, 60-80 = Needs attention, <60 = Critical

## Sharing and Exporting

### Sharing Reports

Make data accessible to stakeholders:

1. Create or open report
2. Click **Share**
3. Choose sharing method:
   - **Link** - Generate shareable link
   - **Email** - Send report to specific people
   - **Schedule** - Automatic email delivery
4. Set permissions (view only or edit)
5. Configure sharing options

### Exporting Data

Export analytics for external use:

1. Select report or dashboard
2. Click **Export**
3. Choose format:
   - **PDF** - For presentations and printing
   - **CSV** - For spreadsheet analysis
   - **JSON** - For custom analysis
4. Download file
5. Share as needed

## Best Practices

### Metric Selection

- **Choose meaningful metrics** - Align with team goals
- **Avoid vanity metrics** - Focus on actionable data
- **Track actionable items** - Can team actually influence them?
- **Keep it simple** - Too many metrics confuse
- **Regular review** - Adjust metrics as priorities change

### Data Interpretation

- **Context matters** - Always understand the why
- **Correlation vs. causation** - Don't assume cause
- **Trends over snapshots** - Single data points mislead
- **Outliers need investigation** - Understand exceptions
- **Communicate findings** - Share insights with team

### Using Insights

- **Set realistic baselines** - Know current state
- **Make incremental improvements** - Don't expect overnight changes
- **Track improvements** - Verify changes had impact
- **Celebrate wins** - Recognize progress
- **Adjust as needed** - Refine strategies based on results

## Common Analysis Scenarios

### Velocity Declining

**Problem:** Team completing fewer tasks each sprint

**Investigation:**
- Are tasks more complex now?
- Is team smaller or taking more time off?
- Are there more blockers?
- Is estimation changing?

**Actions:**
- Re-estimate tasks for accuracy
- Identify and remove blockers
- Consider team capacity changes
- Review process for inefficiencies

### On-Time Delivery Dropping

**Problem:** Missing more deadlines

**Investigation:**
- Are estimates accurate?
- Are dependencies blocking progress?
- Is scope creeping?
- Are unexpected issues arising?

**Actions:**
- Improve estimation practices
- Better dependency management
- Control scope more strictly
- Build in buffer time

### Review Times Increasing

**Problem:** Code reviews taking longer

**Investigation:**
- Are reviews more complex?
- Is reviewer availability limited?
- Are PRs getting larger?
- Are communication channels breaking down?

**Actions:**
- Encourage smaller, focused PRs
- Increase reviewer availability
- Improve PR descriptions
- Use code review tools effectively

## Troubleshooting

### Missing Data

**Issue:** Metrics not updating or showing incomplete data

**Solutions:**
- Verify GitHub integration is active
- Check data sync status
- Allow time for initial data processing
- Check date filters on view

### Inaccurate Metrics

**Issue:** Numbers don't match manual count

**Solutions:**
- Verify filtering isn't hiding data
- Check date range included
- Confirm team member selection
- Review metric definition

## Next Steps

- Explore **Project Management** for task execution
- Review **GitHub Integration** for source data
- Set up **Automations** based on insights
- Share results with **Team Collaboration** tools

For detailed support, contact our analytics team at support@vaiuteam.com
`;

const faqTroubleshooting: string = `# Troubleshooting and FAQ

## Common Issues and Solutions

### Account and Authentication

#### Can't Log In

**Problem:** Unable to log in despite correct credentials

**Steps to resolve:**
1. Clear browser cookies and cache
2. Try incognito/private mode
3. Verify email is correct
4. Reset password via "Forgot Password"
5. Check if account is deactivated
6. Try different browser
7. Disable VPN temporarily
8. Contact support with email and error

#### Two-Factor Authentication Issues

**Problem:** Can't complete 2FA verification

**Solutions:**
- Check authenticator app time is synced
- Use backup codes if app unavailable
- Re-register authenticator app
- Verify phone number for SMS
- Check email for authentication codes
- Request password reset to bypass 2FA
- Contact support with account details

#### OAuth Connection Issues

**Problem:** Can't connect GitHub via OAuth

**Steps:**
1. Verify you have GitHub admin access
2. Check GitHub App is installed
3. Review permission warnings
4. Try disconnecting and reconnecting
5. Clear browser cache
6. Allow popups for GitHub
7. Try different browser
8. Verify GitHub account isn't suspended

### Workspace and Projects

#### Can't Create or Access Workspace

**Problem:** Workspace creation fails or can't access workspace

**Possible causes and solutions:**
- **Plan limit reached** - Upgrade to Professional plan
- **Workspace deleted** - Contact support for recovery
- **Access revoked** - Check with workspace admin
- **Browser issue** - Clear cache and try again
- **Network issue** - Check internet connection

#### Projects Not Showing

**Problem:** Projects appear and disappear or don't load

**Troubleshooting:**
1. Refresh the page
2. Check project filters
3. Verify permissions to view project
4. Check if project was archived
5. Restart browser
6. Clear browser cache
7. Try different browser
8. Check internet connection

#### Can't Edit or Delete Projects

**Problem:** Edit/delete buttons not available

**Solutions:**
1. Verify you have editor or admin role
2. Check if project is read-only
3. Confirm project not archived
4. Contact project owner for permissions
5. Try accessing from different browser

### GitHub Integration

#### Repositories Not Syncing

**Problem:** Connected repositories not updating

**Troubleshooting steps:**
1. Check GitHub integration status:
   - Go to **Settings** → **Integrations** → **GitHub**
   - Verify "Connected" status
2. Verify permissions:
   - In GitHub, check Vaiu app has access
   - Confirm OAuth authorization
3. Check sync settings:
   - Are correct repositories selected?
   - Is auto-sync enabled?
4. Manual sync:
   - Click "Sync Now" in integration settings
5. Check data:
   - Wait 5-10 minutes for sync
   - Refresh Vaiu page
   - Check GitHub for recent activity
6. Re-authorize if needed:
   - Disconnect GitHub integration
   - Wait 1 minute
   - Reconnect GitHub
7. Contact support if still not working

#### Missing Pull Requests or Issues

**Problem:** PRs and issues visible in GitHub but not Vaiu

**Investigation:**
1. Verify repository is connected
2. Check sync settings include PRs/issues
3. Confirm data hasn't been filtered
4. Wait for sync to complete (watch status)
5. Try manual sync
6. Check if filtering is hiding items

**Solutions:**
1. Ensure GitHub repo connected properly
2. Verify connection permissions
3. Re-sync from integration settings
4. Check Vaiu filter settings
5. Wait longer for data to populate

#### Authorization Errors

**Problem:** "Access Denied" or permission errors

**Causes and fixes:**
- **Not admin** - Need admin/owner access to repositories
- **App not authorized** - Authorize Vaiu in GitHub
- **Permissions changed** - Re-authorize integration
- **Organization restrictions** - Talk to org admin
- **Rate limiting** - Wait or contact support

**Steps to fix:**
1. Go to GitHub settings
2. Check "Authorized OAuth Apps"
3. Find Vaiu and click it
4. Verify permissions granted
5. If revoked, re-authorize in Vaiu
6. Test with small action first

### Tasks and Projects

#### Task Not Updating

**Problem:** Changes to tasks not saving or appearing

**Troubleshooting:**
1. Check for error messages
2. Verify you have edit permissions
3. Try refreshing page
4. Check if task is locked
5. Verify internet connection
6. Try different browser
7. Clear browser cache
8. Restart browser and try again

#### Can't Assign Tasks

**Problem:** Task assignment failing

**Solutions:**
1. Verify person is team member
2. Check person's role allows assignment
3. Verify email spelling is correct
4. Try assigning to different person
5. Check if person account is active
6. Contact workspace admin

#### Tasks Disappearing

**Problem:** Completed or deleted tasks show back up

**Possible causes:**
- Task status set to wrong stage
- Auto-refresh showing old data
- Task archived but not deleted
- Browser cache issue
- Sync issue with backend

**Solutions:**
1. Refresh the page
2. Clear browser cache
3. Check task filters
4. Verify task status
5. Contact support if persists

### Notifications

#### Not Receiving Notifications

**Problem:** Missing notifications for important events

**Troubleshooting:**
1. **Check preferences:**
   - Go to **Settings** → **Notifications**
   - Verify notifications enabled
   - Check notification type is enabled
2. **Verify mentions:**
   - Correct @username syntax used?
   - Check spelling of username
   - Verify person exists in workspace
3. **Check quiet hours:**
   - Is "Do Not Disturb" enabled?
   - Check DND schedule
   - Disable temporarily to test
4. **Email settings:**
   - Check email not going to spam
   - Verify email address is correct
   - Check email client filters
5. **Browser settings:**
   - Allow notifications in browser
   - Check browser notification permissions
   - Clear browser notifications cache

#### Too Many Notifications

**Problem:** Being overwhelmed with notifications

**Solutions:**
1. Reduce notification frequency
2. Disable non-essential notification types
3. Mute specific projects or tasks
4. Set Do Not Disturb schedule
5. Use digest format (daily/weekly)
6. Unfollow non-critical items

#### Spam Notifications

**Problem:** Receiving irrelevant notifications

**Fixes:**
1. Review notification preferences
2. Unfollow unnecessary items
3. Turn off notifications for specific projects
4. Contact workspace admin about auto-notifications
5. Check if automation rules creating spam

### Performance and Loading

#### Slow Performance

**Problem:** Vaiu running slowly or freezing

**Troubleshooting:**
1. **Browser optimization:**
   - Close unused tabs
   - Clear browser cache
   - Update browser to latest version
   - Disable browser extensions
2. **Network:**
   - Check internet connection speed
   - Close bandwidth-heavy apps
   - Try wired connection
   - Check for network latency
3. **Device:**
   - Close resource-heavy applications
   - Check available disk space
   - Restart computer
   - Check RAM availability
4. **Vaiu specific:**
   - Close extra workspace tabs
   - Reduce number of open projects
   - Archive old completed projects
   - Clear app cache: Settings → Developer Options
5. **Different browser:**
   - Try Chrome, Firefox, or Safari
   - Some browsers perform better

#### Pages Not Loading

**Problem:** Blank pages or eternal loading spinners

**Steps to fix:**
1. Refresh the page (F5 or Cmd+R)
2. Hard refresh to clear cache (Ctrl+Shift+R)
3. Clear browser cache entirely
4. Disable browser extensions
5. Try incognito/private mode
6. Try different browser
7. Check internet connection
8. Wait a few minutes and retry
9. Contact support if still failing

#### Timeout Errors

**Problem:** Getting timeout or "Request Timeout" errors

**Solutions:**
1. Check internet connection
2. Close bandwidth-heavy apps
3. Disable VPN if using
4. Try from different network
5. Wait and retry
6. Try different browser
7. Contact support with error details

### Data and Backup

#### Can't Export Data

**Problem:** Export function not working or producing empty files

**Troubleshooting:**
1. Verify you have export permissions
2. Check if data exists to export
3. Try different export format
4. Clear browser cache
5. Try different browser
6. Check available disk space
7. Contact support with workspace name

#### Missing Data

**Problem:** Can't find tasks or projects that existed

**Investigation steps:**
1. Check filters aren't hiding items
2. Search for item by name
3. Check if item was archived
4. Look in archive section
5. Check deletion timeline
6. Verify permissions to view
7. Contact admin for recovery options

#### Backup Issues

**Problem:** Can't access or download backups

**Solutions:**
1. Verify backup exists
2. Check backup status (might be in progress)
3. Wait if backup recently requested
4. Try different browser
5. Check available disk space
6. Contact support for older backups

### Security Issues

#### Suspicious Activity

**Problem:** Seeing unexpected activity or changes

**Immediate steps:**
1. **Change password** immediately
2. **Enable 2FA** if not enabled
3. **Check active sessions:**
   - Go to Settings → Sessions
   - Sign out suspicious sessions
4. **Review audit log:**
   - See unauthorized actions
   - Note timestamps and IPs
5. **Contact support:**
   - Report suspicious activity
   - Provide details and screenshots
   - Request security review

#### Account Compromised

**If you think account is compromised:**

1. **Secure account:**
   - Change password immediately
   - Enable 2FA
   - Update recovery email
   - Sign out all sessions
2. **Notify admin:**
   - Inform workspace owner
   - Request account audit
   - Check for unauthorized actions
3. **Review access:**
   - Check if permissions changed
   - Review connected apps
   - Disconnect suspicious integrations
4. **Contact support:**
   - Email: security@vaiuteam.com
   - Provide incident details
   - Request investigation

#### Lost 2FA Device

**If you've lost authenticator device:**

1. **Use backup codes:**
   - Enter saved backup code
   - Continue to account
2. **Reset 2FA:**
   - Go to Settings → Security
   - Click "Can't access your authenticator?"
   - Verify identity with email
   - Set up new authentication method
3. **Contact support if blocked:**
   - Email with account details
   - Verify identity
   - Get account access restored

## Frequently Asked Questions

### General Questions

**Q: How much does Vaiu cost?**

A: Vaiu offers three plans:
- **Free** - $0/month for individuals
- **Professional** - $20/month for teams
- **Enterprise** - Custom pricing for organizations

See pricing page for current rates and features.

**Q: Can I use Vaiu for free forever?**

A: Yes, the Free plan is always available. It includes basic features for individuals and small teams. Upgrade to Professional or Enterprise for advanced capabilities.

**Q: What payment methods do you accept?**

A: We accept all major credit cards (Visa, Mastercard, American Express, Discover). Invoiced billing available for Enterprise customers.

**Q: Can I cancel anytime?**

A: Yes. You can cancel your subscription anytime from Settings → Billing. Refunds available for unused portion of prepaid subscriptions.

### Data and Privacy

**Q: Is my data secure?**

A: Yes. Vaiu uses military-grade encryption (AES-256) for data in transit and at rest. Regular security audits ensure compliance with industry standards.

**Q: Where is my data stored?**

A: Data is stored in secure data centers. Geographic location depends on your region setting. Enterprise customers can request specific locations.

**Q: How long do you keep my data?**

A: Data retention follows your workspace retention policy. Deleted items can be recovered within 30 days. After that, permanent deletion occurs. Enterprise has custom retention options.

**Q: Do you comply with GDPR?**

A: Yes. Vaiu is fully GDPR compliant. Users can request data deletion (right to be forgotten) via Settings → Privacy.

**Q: Can I export my data?**

A: Yes. Export all workspace data anytime from Settings → Data → Export. Choose JSON, CSV, or ZIP formats.

### Features and Usage

**Q: Can I use Vaiu with multiple GitHub accounts?**

A: Yes. You can connect multiple GitHub accounts to the same Vaiu workspace if you have admin access.

**Q: How often does Vaiu sync with GitHub?**

A: Vaiu syncs in real-time via webhooks. Data appears within seconds of updates in GitHub.

**Q: Can I use Vaiu offline?**

A: Vaiu is web-based and requires internet connection. Consider it a cloud-only tool at this time.

**Q: How many projects can I have?**

A: Depends on your plan:
- Free: 3 projects
- Professional: Unlimited
- Enterprise: Unlimited

**Q: Can I share a project with someone outside my workspace?**

A: Yes, with guest access. You can invite non-members as guest users with read-only or limited permissions.

**Q: How do I delete a project?**

A: Open project → Settings → Danger Zone → Delete Project. Note: Deletion is permanent; backup data first if needed.

### Technical Questions

**Q: What browsers does Vaiu support?**

A: Vaiu works best with:
- Chrome/Chromium (recommended)
- Firefox (recent versions)
- Safari (MacOS 12+)
- Edge (recent versions)

**Q: Is there a Vaiu mobile app?**

A: Mobile-responsive web version available now. Native iOS/Android apps in development.

**Q: Can I use Vaiu API?**

A: Yes. API available for Professional and Enterprise plans. Get API key from Settings → API Keys.

**Q: What's your API rate limit?**

A: 1000 requests per hour for Professional, 10000 for Enterprise. Contact support for rate limit increases.

**Q: Can I embed Vaiu in another site?**

A: Limited embedding available. Contact support for custom integration requirements.

### Integration Questions

**Q: Can I integrate Vaiu with Jira?**

A: Integration available through Zapier. Direct Jira integration planned for future releases.

**Q: Does Vaiu work with Azure Repos?**

A: Currently GitHub only. Azure Repos support planned for 2024.

**Q: Can I integrate Slack?**

A: Yes. Set up in Settings → Integrations → Slack. Get notifications in Slack about important events.

**Q: Can I use webhooks?**

A: Yes. Create custom webhooks in Settings → Webhooks. Send data to any webhook-compatible service.

### Team and Collaboration

**Q: How many team members can I invite?**

A: Depends on plan:
- Free: 5 members
- Professional: 25 members
- Enterprise: Unlimited

**Q: Can team members be in multiple workspaces?**

A: Yes. Users can be part of multiple workspaces simultaneously.

**Q: What happens when I remove a team member?**

A: They lose access to workspace and all projects. Their content remains but becomes unassigned. Audit logs retain activity record.

**Q: Can I bulk import team members?**

A: Yes. Go to Settings → Team Members → Bulk Import. Upload CSV with emails and roles.

**Q: How do I manage team permissions?**

A: Set roles at workspace level (Owner, Admin, Member, Guest). Additionally, set project-level permissions for fine-grained control.

## Getting Additional Help

### Support Channels

1. **Email:** support@vaiuteam.com
2. **Help Center:** help.vaiu.com
3. **Community Forum:** community.vaiu.com
4. **Live Chat:** In-app chat (Premium)
5. **Video Tutorials:** youtube.com/@VaiuOfficial

### Reporting Bugs

Found a bug? Help us fix it:

1. **Describe the issue** clearly
2. **Steps to reproduce** - How to trigger the bug
3. **Expected behavior** - What should happen
4. **Actual behavior** - What actually happened
5. **Screenshots** - Visual evidence
6. **Browser/Device** - Your setup
7. **Frequency** - Always, sometimes, rarely?
8. **Email to:** bugs@vaiuteam.com

### Requesting Features

Have an idea? Share it:

1. Visit **Feature Requests** in community forum
2. Search if feature already suggested
3. Add your vote and comment
4. Describe use case and benefit
5. Suggest implementation if possible
6. Community votes guide development

### Professional Support

**Enterprise Support Options:**

- Dedicated support engineer
- Priority ticket handling (1 hour response)
- Custom SLA terms
- Architecture consulting
- Training and onboarding

Contact sales@vaiuteam.com for enterprise support.

## Tips and Tricks

### Keyboard Shortcuts

Make Vaiu faster with shortcuts:

| Shortcut | Action |
|----------|--------|
| \`Cmd/Ctrl + K\` | Quick search |
| \`Cmd/Ctrl + /\` | Command palette |
| \`Cmd/Ctrl + B\` | Bold text |
| \`Cmd/Ctrl + I\` | Italic text |
| \`Cmd/Ctrl + Shift + C\` | Code block |
| \`@\` | Mention someone |
| \`/\` | Slash commands |

### Productivity Hacks

1. **Use templates** - Create templates for recurring tasks
2. **Automate workflows** - Set up automation rules
3. **Bulk actions** - Edit multiple tasks at once
4. **Keyboard shortcuts** - Speed up navigation
5. **Custom fields** - Track what matters to you
6. **Smart filters** - Find what you need quickly
7. **Saved views** - Quick access to filtered lists

### Advanced Workflows

1. **Milestone-based planning** - Group work into milestones
2. **Dependency tracking** - Manage task relationships
3. **Capacity planning** - Balance team workload
4. **Regular retrospectives** - Learn and improve
5. **Automated quality checks** - AI-assisted review

## Documentation Resources

- **Help Center** - Comprehensive guides
- **Blog** - Tips, tricks, and case studies
- **Video Tutorials** - Visual learning
- **API Documentation** - Developer reference
- **Community Forum** - Peer support and discussions
- **Webinars** - Live training sessions

## Still Need Help?

If you can't find what you need:

1. **Search documentation** - Most answers there
2. **Check FAQ** - Common issues covered
3. **Visit community forum** - Ask other users
4. **Contact support** - Professional assistance
5. **Schedule consultation** - For complex issues

We're here to help! 🙌

---

**Last Updated:** May 4, 2026
**Version:** 1.0
**Feedback:** Have suggestions? Contact us at feedback@vaiuteam.com
`;

export type DocSummary = {
    slug: string;
    title: string;
};

export type Doc = DocSummary & {
    content: string;
};

const slugToTitle = (slug: string) =>
    slug
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

const extractTitle = (content: string, fallbackTitle: string) => {
    const firstHeading = content
        .split(/\r?\n/)
        .find((line) => line.trim().startsWith("# "));

    if (!firstHeading) {
        return fallbackTitle;
    }

    return firstHeading.replace(/^#\s+/, "").trim() || fallbackTitle;
};

const docsData: Doc[] = [
    {
        slug: "introduction",
        title: extractTitle(introduction, slugToTitle("introduction")),
        content: introduction,
    },
    {
        slug: "getting-started",
        title: extractTitle(gettingStarted, slugToTitle("getting-started")),
        content: gettingStarted,
    },
    {
        slug: "github-integration",
        title: extractTitle(githubIntegration, slugToTitle("github-integration")),
        content: githubIntegration,
    },
    {
        slug: "project-management",
        title: extractTitle(projectManagement, slugToTitle("project-management")),
        content: projectManagement,
    },
    {
        slug: "organization",
        title: extractTitle(organization, slugToTitle("organization")),
        content: organization,
    },
    {
        slug: "team-collaboration",
        title: extractTitle(teamCollaboration, slugToTitle("team-collaboration")),
        content: teamCollaboration,
    },
    {
        slug: "workspace-management",
        title: extractTitle(workspaceManagement, slugToTitle("workspace-management")),
        content: workspaceManagement,
    },
    {
        slug: "ai-features",
        title: extractTitle(aiFeatures, slugToTitle("ai-features")),
        content: aiFeatures,
    },
    {
        slug: "analytics",
        title: extractTitle(analytics, slugToTitle("analytics")),
        content: analytics,
    },
    {
        slug: "faq-troubleshooting",
        title: extractTitle(faqTroubleshooting, slugToTitle("faq-troubleshooting")),
        content: faqTroubleshooting,
    },
];

export const getAllDocs = async (): Promise<DocSummary[]> => {
    return docsData.map(({ slug, title }) => ({ slug, title }));
};

export const getDocBySlug = async (slug: string): Promise<Doc | null> => {
    const normalizedSlug = slug.trim().toLowerCase();

    if (!/^[a-z0-9-_]+$/.test(normalizedSlug)) {
        return null;
    }

    return docsData.find((doc) => doc.slug === normalizedSlug) ?? null;
};

export const getDefaultDocSlug = async (): Promise<string | null> => {
    if (docsData.length === 0) {
        return null;
    }

    return docsData[0].slug;
};
