import { Hono } from "hono";
import { ID } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import { deleteCookie, setCookie } from "hono/cookie";

import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, USER_PROFILES_ID } from "@/config";
import { getAccessToken } from "@/lib/github-api";

import { AUTH_COOKIE } from "../constants";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../schemas";
import { headers } from "next/headers";

const app = new Hono()
  .get("/current", sessionMiddleware, async (c) => {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    return c.json({ data: user });
  })
  .get("/github-status", sessionMiddleware, async (c) => {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = await getAccessToken(user.$id);

    return c.json({ data: { connected: Boolean(token) } });
  })
  .post("/login", zValidator("json", loginSchema), async (c) => {
    try {
      const { email, password } = c.req.valid("json");

      if (!email || !password) {
        return c.json({ error: "Email and password are required" }, 400);
      }

      if (password.trim().length < 6) {
        return c.json(
          { error: "Password must be at least 6 characters long" },
          400,
        );
      }

      if (!email.includes("@")) {
        return c.json({ error: "Invalid email address" }, 400);
      }

      const { account } = await createAdminClient();

      try {
        const session = await account.createEmailPasswordSession(
          email,
          password,
        );
        setCookie(c, AUTH_COOKIE, session.secret, {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 30,
        });

        return c.json({ success: true });
      } catch (authError: unknown) {
        const error = authError as {
          code?: number;
          type?: string;
          message?: string;
        };
        if (error.code === 401) {
          return c.json({ error: "Invalid email or password" }, 401);
        }
        if (error.code === 404) {
          return c.json({ error: "User not found" }, 404);
        }
        if (error.code === 429) {
          return c.json(
            { error: "Too many login attempts. Please try again later" },
            429,
          );
        }
        if (error.type === "user_blocked") {
          return c.json({ error: "Account is temporarily blocked" }, 403);
        }
        if (error.type === "user_email_not_whitelisted") {
          return c.json({ error: "Email is not authorized" }, 403);
        }

        // Log the error for debugging while returning a generic message
        console.error("Login error:", error);
        return c.json({ error: error.message || "Authentication failed" }, 400);
      }
    } catch (error: unknown) {
      console.error("Unexpected login error:", error);
      return c.json(
        { error: "An unexpected error occurred during login" },
        500,
      );
    }
  })
  .post("/register", zValidator("json", registerSchema), async (c) => {
    try {
      const { name, email, password } = c.req.valid("json");
      if (!name || !email || !password) {
        return c.json({ error: "Name, email and password are required" }, 400);
      }
      if (password.trim().length < 6) {
        return c.json(
          { error: "Password must be at least 6 characters long" },
          400,
        );
      }
      if (!email.includes("@")) {
        return c.json({ error: "Invalid email address" }, 400);
      }
      const { users } = await createAdminClient();

      try {
        // Check if user with this email already exists
        const existingUsers = await users.list([]);
        const userExists = existingUsers.users.some(
          (user) => user.email === email,
        );
        if (userExists) {
          return c.json({ error: "Email already registered" }, 400);
        }
      } catch (error: unknown) {
        console.log("Error checking users:", error);
      }
      const { account, databases } = await createAdminClient();
      const user = await account.create(ID.unique(), email, password, name);

      // Create user profile in database
      try {
        await databases.createDocument(
          DATABASE_ID,
          USER_PROFILES_ID,
          user.$id,
          {
            userId: user.$id,
            email: user.email,
            name: user.name,
            githubAccessToken: "",
          },
        );
      } catch (profileError) {
        console.error("Failed to create user profile:", profileError);
      }

      const origin = headers().get("origin") ?? "";

      await account.createMagicURLToken(
        user.$id,
        email,
        `${origin}/verify-magic-link`,
      );

      return c.json({ success: true });
    } catch (error: unknown) {
      const appwriteError = error as {
        code?: number;
        type?: string;
        message?: string;
      };

      // Handle specific Appwrite errors
      if (
        appwriteError.code === 409 ||
        appwriteError.type === "user_already_exists"
      ) {
        return c.json({ error: "Email already registered" }, 409);
      }

      if (appwriteError.code === 400) {
        return c.json({ error: "Invalid user data provided" }, 400);
      }

      console.error("Registration error:", appwriteError);
      return c.json(
        {
          error: appwriteError.message || "Failed to create account",
        },
        500,
      );
    }
  })
  .post("/verify-magic-link", async (c) => {
    const { userId, secret } = await c.req.json();
    const { account } = await createAdminClient();

    try {
      const session = await account.updateMagicURLSession(userId, secret);
      setCookie(c, AUTH_COOKIE, session.secret, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30,
      });
      return c.json({ success: true });
    } catch (error: unknown) {
      const appwriteError = error as {
        code?: number;
        type?: string;
        message?: string;
      };
      if (appwriteError.code === 401) {
        return c.json({ error: "Invalid magic link or expired" }, 401);
      }
      console.error("Verification error:", appwriteError);
      return c.json({ error: "Failed to verify magic link" }, 400);
    }
  })
  .post("/logout", sessionMiddleware, async (c) => {
    const account = c.get("account");
    deleteCookie(c, AUTH_COOKIE);
    await account.deleteSession("current");
    return c.json({ success: true });
  })
  .post(
    "/forgot-password",
    zValidator("json", forgotPasswordSchema),
    async (c) => {
      const { email } = c.req.valid("json");
      const { account } = await createAdminClient();

      const origin = headers().get("origin") ?? "";

      await account.createRecovery(email, `${origin}/reset-password`);
      return c.json({ success: true });
    },
  )
  .post(
    "/update-password",
    zValidator("json", resetPasswordSchema),
    async (c) => {
      const { userId, secret, password } = c.req.valid("json");
      const { account } = await createAdminClient();

      try {
        await account.updateRecovery(userId, secret, password);
        return c.json({ success: true });
      } catch (error) {
        return c.json({ error });
      }
    },
  );
export default app;
