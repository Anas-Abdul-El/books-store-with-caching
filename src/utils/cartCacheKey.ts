import type { Prisma } from "../generated/prisma/browser";

// Every cart cache key starts with this prefix, so the whole namespace can be
// found (and dropped) with a single Redis pattern scan.
const CART_CACHE_PREFIX = "cart";

/**
 * createCartCacheKey builds the Redis key holding the cart of one user.
 * The userId is part of the key, so two users never share a cached entry.
 * @param userId - The id of the authenticated owner of the cart.
 * @returns The Redis cache key string.
 */
const createCartCacheKey = (userId: string): string => `${CART_CACHE_PREFIX}:${userId}`;

/**
 * The Redis pattern matching every cart cache key.
 */
const CART_CACHE_PATTERN = `${CART_CACHE_PREFIX}:*`;

export { CART_CACHE_PATTERN, CART_CACHE_PREFIX, createCartCacheKey };
