import "server-only";

import { createClient, type RedisClientType } from "redis";

type RedisValue = string | number | Buffer;
type CacheGroup = `user:${string}` | `workspace:${string}` | `project:${string}`;

let redisClientPromise: Promise<RedisClientType> | null = null;

const getRedisUrl = () => process.env.REDIS_URL;

const getRedisClient = async () => {
  const redisUrl = getRedisUrl();

  if (!redisUrl) {
    return null;
  }

  if (!redisClientPromise) {
    const client = createClient({ url: redisUrl });
    client.on("error", (error) => {
      console.error("Redis error:", error);
    });
    redisClientPromise = client.connect().then(() => client);
  }

  try {
    return await redisClientPromise;
  } catch (error) {
    console.error("Redis connection failed:", error);
    redisClientPromise = null;
    return null;
  }
};

const groupKey = (group: CacheGroup) => `cache:group:${group}`;

export const cacheRemember = async <T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
  groups: CacheGroup[] = [],
): Promise<T> => {
  const client = await getRedisClient();

  if (!client) {
    return fetcher();
  }

  try {
    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (error) {
    console.error("Redis read failed:", error);
  }

  const fresh = await fetcher();

  try {
    await client.set(key, JSON.stringify(fresh), { EX: ttlSeconds });
    if (groups.length > 0) {
      await Promise.all(
        groups.map(async (group) => {
          const keyForGroup = groupKey(group);
          await client.sAdd(keyForGroup, key as RedisValue);
          await client.expire(keyForGroup, Math.max(ttlSeconds, 300));
        }),
      );
    }
  } catch (error) {
    console.error("Redis write failed:", error);
  }

  return fresh;
};

export const invalidateCacheGroups = async (...groups: CacheGroup[]) => {
  const client = await getRedisClient();
  if (!client || groups.length === 0) {
    return;
  }

  try {
    for (const group of groups) {
      const currentGroupKey = groupKey(group);
      const keys = await client.sMembers(currentGroupKey);

      if (keys.length > 0) {
        await client.del(keys);
      }

      await client.del(currentGroupKey);
    }
  } catch (error) {
    console.error("Redis invalidation failed:", error);
  }
};
