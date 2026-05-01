import { ID, Query } from "node-appwrite";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, ROOMS_ID } from "@/config";
import { RoomSchema } from "../schemas";
import { z } from "zod";
import { getMember } from "@/features/members/utilts";
import { Room } from "../types";

import { checkSubscriptionLimit } from "@/features/subscriptions/utils";

const app = new Hono()
  .post("/", zValidator("json", RoomSchema), sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const { name, roomType, workspaceId, projectId } = c.req.valid("json");

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member) return c.json({ error: "Unauthorized" }, 401);

    // Check room limit
    const limitCheck = await checkSubscriptionLimit({
      databases,
      userId: user.$id,
      limitType: "rooms",
      workspaceId,
    });

    if (!limitCheck.allowed) {
      return c.json(
        {
          error: "Room limit reached",
          details: {
            limit: limitCheck.limit,
            current: limitCheck.current,
            plan: limitCheck.plan,
            message: `You have reached the maximum number of rooms (${limitCheck.limit}) for your ${limitCheck.plan} plan in this workspace. Please upgrade to create more rooms.`,
          },
        },
        403
      );
    }

    try {
      const room = await databases.createDocument(
        DATABASE_ID,
        ROOMS_ID,
        ID.unique(),
        {
          name,
          roomType,
          workspaceId,
          projectId,
        },
      );

      return c.json({ data: room });
    } catch (error) {
      console.error("Error creating room:", error);
      return c.json({ error: "Failed to create room" }, 500);
    }
  })
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        projectId: z.string().optional(),
      }),
    ),
    async (c) => {
      const databases = c.get("databases");

      const { workspaceId, projectId } = c.req.valid("query");

      if (!workspaceId) {
        return c.json({ error: "Missing workspaceId" }, 400);
      }

      // Build query parameters
      const queryParams = [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt"),
      ];

      // Add projectId filter only if provided
      if (projectId) {
        queryParams.push(Query.equal("projectId", projectId));
      }

      const rooms = await databases.listDocuments(
        DATABASE_ID,
        ROOMS_ID,
        queryParams,
      );

      return c.json({ data: rooms });
    },
  )
  .get("/:roomId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { roomId } = c.req.param();

    const room = await databases.getDocument<Room>(
      DATABASE_ID,
      ROOMS_ID,
      roomId,
    );

    const member = await getMember({
      databases,
      workspaceId: room.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    return c.json({ data: room });
  })
  .delete("/:roomId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { roomId } = c.req.param();

    const existingRoom = await databases.getDocument<Room>(
      DATABASE_ID,
      ROOMS_ID,
      roomId,
    );

    const member = await getMember({
      databases,
      workspaceId: existingRoom.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // TODO: delete  tasks
    await databases.deleteDocument(DATABASE_ID, ROOMS_ID, roomId);

    return c.json({ data: { $id: existingRoom.$id } });
  });

export default app;
