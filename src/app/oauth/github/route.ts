import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Octokit } from "octokit";
import { createAdminClient } from "@/lib/appwrite";
import { AUTH_COOKIE } from "@/features/auth/constants";
import { DATABASE_ID, USER_PROFILES_ID } from "@/config";
import { sendWelcomeEmail } from "@/lib/emails/welcome";
import { ID, Query } from "node-appwrite";

/**
 * Custom GitHub OAuth implementation
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
        console.error("GitHub OAuth error:", error);
        return NextResponse.redirect(`${request.nextUrl.origin}/sign-in?error=oauth_${error}`);
    }

    // Step 1: If no code, initiate OAuth flow by redirecting to GitHub
    if (!code) {
        const githubClientId = process.env.GITHUB_CLIENT_ID!;
        const redirectUri = `${request.nextUrl.origin}/oauth/github`;
        const scope = "read:user user:email repo";

        // Generate random state for CSRF protection
        const state = Math.random().toString(36).substring(7);

        const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
        githubAuthUrl.searchParams.set("client_id", githubClientId);
        githubAuthUrl.searchParams.set("redirect_uri", redirectUri);
        githubAuthUrl.searchParams.set("scope", scope);
        githubAuthUrl.searchParams.set("state", state);

        return NextResponse.redirect(githubAuthUrl.toString());
    }

    // Step 2: Exchange authorization code for access token
    try {
        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID!,
                client_secret: process.env.GITHUB_CLIENT_SECRET!,
                code,
                redirect_uri: `${request.nextUrl.origin}/oauth/github`,
            }),
        });

        const tokenData = await tokenResponse.json() as {
            access_token?: string;
            error?: string;
            error_description?: string;
        };

        if (tokenData.error) {
            console.error("GitHub token exchange error:", tokenData);
            return NextResponse.redirect(`${request.nextUrl.origin}/sign-in?error=token_exchange_failed`);
        }

        const accessToken = tokenData.access_token;

        // Step 3: Get user info from GitHub using the access token
        const octokit = new Octokit({ auth: accessToken });
        const { data: githubUser } = await octokit.rest.users.getAuthenticated();

        // Get user's primary email if not public
        let userEmail = githubUser.email;
        if (!userEmail) {
            const { data: emails } = await octokit.rest.users.listEmailsForAuthenticatedUser();
            const primaryEmail = emails.find(e => e.primary);
            userEmail = primaryEmail?.email || `${githubUser.login}@users.noreply.github.com`;
        }

        // Step 4: Create or get user in Appwrite
        const { users, databases, account } = await createAdminClient();

        let userId: string;
        let isNewUser = false;

        try {
            // Try to find existing user by email
            const usersList = await users.list([
                Query.equal("email", [userEmail])
            ]);

            if (usersList.users.length > 0) {
                userId = usersList.users[0].$id;
            } else {
                // Create new user in Appwrite
                const newUser = await users.create(
                    ID.unique(),
                    userEmail,
                    undefined, // phone
                    undefined, // password - OAuth users don't have passwords
                    githubUser.name || githubUser.login
                );
                userId = newUser.$id;
                isNewUser = true;

                // Mark email as verified since GitHub has already verified it
                await users.updateEmailVerification(userId, true);
            }
        } catch (error) {
            console.error("Error managing Appwrite user:", error);
            return NextResponse.redirect(`${request.nextUrl.origin}/sign-in?error=user_creation_failed`);
        }

        // Step 5: Create Appwrite session
        try {
            // Create a token for session creation
            const token = await users.createToken(userId);

            // Create session using the token
            const session = await account.createSession(userId, token.secret);

            // Set session cookie
            (await cookies()).set(AUTH_COOKIE, session.secret, {
                path: "/",
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24 * 30, // 30 days
            });
        } catch (error) {
            console.error("Error creating Appwrite session:", error);
            return NextResponse.redirect(`${request.nextUrl.origin}/sign-in?error=session_creation_failed`);
        }

        // Step 6: Store GitHub access token and user profile in database
        try {
            const profileData = {
                userId: userId,
                email: userEmail,
                name: githubUser.name || githubUser.login,
                githubUsername: githubUser.login,
                githubId: githubUser.id.toString(),
                avatarUrl: githubUser.avatar_url,
                publicRepos: githubUser.public_repos,
                githubAccessToken: accessToken,
            };

            if (isNewUser) {
                await databases.createDocument(
                    DATABASE_ID,
                    USER_PROFILES_ID,
                    userId,
                    profileData
                );

                void sendWelcomeEmail({
                    name: githubUser.name || githubUser.login,
                    email: userEmail,
                });
            } else {
                await databases.updateDocument(
                    DATABASE_ID,
                    USER_PROFILES_ID,
                    userId,
                    profileData
                );
            }
        } catch (error) {
            // If document doesn't exist (for existing users), create it
            if (error && typeof error === 'object' && 'code' in error && error.code === 404) {
                try {
                    await databases.createDocument(
                        DATABASE_ID,
                        USER_PROFILES_ID,
                        userId,
                        {
                            userId: userId,
                            email: userEmail,
                            name: githubUser.name || githubUser.login,
                            githubUsername: githubUser.login,
                            githubId: githubUser.id.toString(),
                            avatarUrl: githubUser.avatar_url,
                            publicRepos: githubUser.public_repos,
                            githubAccessToken: accessToken,
                        }
                    );
                } catch (createError) {
                    console.error("Failed to create user profile:", createError);
                }
            } else {
                console.error("Failed to store user profile:", error);
            }
        }

        return NextResponse.redirect(`${request.nextUrl.origin}/`);

    } catch (error) {
        console.error("GitHub OAuth flow error:", error);
        return NextResponse.redirect(`${request.nextUrl.origin}/sign-in?error=oauth_failed`);
    }
}
