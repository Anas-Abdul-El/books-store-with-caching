import { config } from "dotenv";
import { createClient, type RedisClientType } from "redis";

config();

/**
 * redisClient is the shared Redis client of the process. It is created once
 * here and only opened by connectRedis, so the caching layer never opens a new
 * connection per request.
 */
const redisClient: RedisClientType = createClient({
    url: process.env.REDIS_URL!,
});

// Without a listener the client throws unhandled "error" events, which would
// crash the process instead of just logging the failure.
redisClient.on("error", err => {
    console.error(err);
});

/**
 * connectRedis returns the shared client, opening the connection on the first
 * call and reusing it afterwards. Every service goes through it instead of
 * touching redisClient directly, so the connection is only established once.
 * @returns A Promise resolving to the connected Redis client.
 */
export const connectRedis = async (): Promise<RedisClientType> => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
    return redisClient;
};

export { redisClient };
