import type { Redis as RedisType } from "ioredis";
import Redis from "ioredis";

let redis: RedisType;

declare global {
  var __redis: RedisType | undefined;
}

const getRedisUrl = (): string => {
  const url = process.env.REDIS_URL;
  if (typeof url === "string") return url;
  throw new Error("REDIS_URL must be defined as an env var");
};

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the Redis with every change either.
if (process.env.NODE_ENV === "production") {
  const redisUrl = getRedisUrl();
  redis = new Redis(redisUrl);
} else {
  if (!global.__redis) {
    if (process.env.NODE_ENV === "development") {
      const redisUrl = getRedisUrl();
      global.__redis = new Redis(redisUrl);
    } else {
      global.__redis = new Redis();
    }
  }
  redis = global.__redis;
}

const expiry = 7200;

const redisSet = async (key: string, value: string) => {
  await redis.multi().set(key, value).expire(key, expiry).exec();
};

const redisHSet = async (key: string, field: string, value: string) => {
  await redis.multi().hset(key, field, value).expire(key, expiry).exec();
};

export { redis, redisSet, redisHSet };
