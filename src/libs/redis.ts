import { config } from "dotenv";
import { createClient, type RedisClientType } from "redis";

config();

const redisClient: RedisClientType = createClient({
    url: process.env.REDIS_URL!,
});

redisClient.on("error", err => {
    console.error(err);
});

export const connectRedis = async (): Promise<RedisClientType> => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
    return redisClient;
};

export { redisClient };
