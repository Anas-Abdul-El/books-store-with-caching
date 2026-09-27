import { connectRedis } from "../libs/redis";

/**
 * clearCacheByPattern drops every Redis key matching the given pattern.
 * It is used after a write operation (create/update/delete) so the next read
 * does not serve a stale cached collection.
 * @param pattern - The Redis key pattern, e.g. "cartItems:*".
 * @returns A Promise that resolves once the matching keys are deleted.
 */
const clearCacheByPattern = async (pattern: string): Promise<void> => {
    const redis = await connectRedis();

    const keys = await redis.keys(pattern);

    if (keys.length === 0) return;

    await redis.del(keys);
};

export default clearCacheByPattern;
