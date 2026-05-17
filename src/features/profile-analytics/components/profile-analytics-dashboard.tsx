"use client";

import {
  GitBranch,
  Star,
  GitFork,
  Calendar,
  Users,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ProfileGithubAnalyticsSkeleton } from "@/components/loading-skeletons";
import { useGetProfileAnalytics } from "../api/use-get-profile-analytics";

interface ProfileAnalyticsDashboardProps {
  username: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const ProfileAnalyticsDashboard = ({ username }: ProfileAnalyticsDashboardProps) => {
  const { data: analytics, isLoading, error } = useGetProfileAnalytics({
    username: username || "",
  });

  if (!username || username === 'undefined') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Invalid Username
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please provide a valid GitHub username to view analytics.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <ProfileGithubAnalyticsSkeleton />;
  }

  if (error || !analytics) {
    return <ProfileAnalyticsError onRetry={() => { }} />;
  }

  if ('error' in analytics) {
    return <ProfileAnalyticsError onRetry={() => { }} />;
  }

  const profile = analytics.data;

  const languageChartData = Object.entries(profile.languageStats)
    .sort((a, b) => b[1].percentage - a[1].percentage)
    .slice(0, 8)
    .map(([language, stats]) => ({
      name: language,
      percentage: Math.round(stats.percentage),
      count: stats.count,
    }));

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Developer Analytics
          </h1>
        </div>

        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-8">
            <div className="flex items-center space-x-6">
              <Avatar className="w-24 h-24 border-4 border-white">
                <AvatarImage src={profile.user.avatar_url} alt={profile.user.name} />
                <AvatarFallback className="text-2xl">
                  {profile.user.name?.charAt(0) || profile.user.login.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-3xl font-bold">{profile.user.name || profile.user.login}</h2>
                <p className="text-blue-100 text-lg">@{profile.user.login}</p>
                {profile.user.bio && (
                  <p className="text-blue-100 mt-2 max-w-2xl">{profile.user.bio}</p>
                )}
                <div className="flex items-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(profile.user.created_at).getFullYear()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.user.public_repos}</div>
              <p className="text-xs text-muted-foreground">
                Public repositories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile.repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all repositories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.user.followers}</div>
              <p className="text-xs text-muted-foreground">
                Following {profile.user.following}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contributions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.repositories.length}</div>
              <p className="text-xs text-muted-foreground">
                Total Repositories
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Top Repositories
                  </CardTitle>
                  <CardDescription>Most starred repositories</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.topRepositories.mostStarred.slice(0, 5).map((repo) => (
                    <div key={repo.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{repo.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {repo.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          {repo.language && <span>{repo.language}</span>}
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {repo.stargazers_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="h-3 w-3" />
                            {repo.forks_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Collaboration
                  </CardTitle>
                  <CardDescription>Working with others</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {profile.collaborationStats.totalCollaborators}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Collaborators</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {profile.collaborationStats.organizationsCount}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Organizations</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {profile.collaborationStats.forksOfOthers}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Forks Created</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {profile.collaborationStats.contributedTo}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Contributed To</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="languages" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Language Distribution</CardTitle>
                  <CardDescription>Languages used across repositories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={languageChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="percentage"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {languageChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Language Breakdown</CardTitle>
                  <CardDescription>Detailed language statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(profile.languageStats)
                    .sort((a, b) => b[1].percentage - a[1].percentage)
                    .slice(0, 6)
                    .map(([language, stats]) => (
                      <div key={language} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{language}</span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {Math.round(stats.percentage)}%
                          </span>
                        </div>
                        <Progress value={stats.percentage} className="h-2" />
                        <div className="text-xs text-gray-500">
                          Used in {stats.count} repositories
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const ProfileAnalyticsError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex items-center justify-center min-h-96">
    <Card className="p-8 max-w-md">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Failed to load profile</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Could not fetch profile analytics. Please check the username and try again.
        </p>
        <Button onClick={onRetry}>Try Again</Button>
      </div>
    </Card>
  </div>
);