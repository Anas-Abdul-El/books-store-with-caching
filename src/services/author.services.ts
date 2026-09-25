import type { Author } from "../generated/prisma/browser";
import { connectRedis, redisClient } from "../libs/redis";
import { authorRepo } from "../repo";
import AppError from "../utils/AppErr";
import createAuthorsCacheKey from "../utils/authorCacheKey";
import type { AddAuthorSchemaType, AuthorsSchemaType, UpdateAuthorsBodySchemaType } from "../validation/author.schema";

// A cached author stays in Redis for 1.5 hours (60 * 90 seconds) after being cached.
const AUTHOR_CACHE_TTL_SECONDS = 60 * 90;

/**
 * getAuthorById retrieves a single author by their unique ID, using a Redis hash
 * (key: "authors", field: "author:<authorId>") as a cache in front of the
 * database so repeated reads avoid hitting PostgreSQL.
 *
 * Flow:
 *  1. Ensure the Redis client is connected.
 *  2. Try to read the author from the "authors" hash (cache hit path).
 *  3. On a hit, parse the stored JSON string and return it — no DB query.
 *  4. On a miss, fetch the author from the DB with authorRepo.getAuthor.
 *  5. If the author does not exist, throw a 404 AppError.
 *  6. Otherwise cache the DB result as a JSON string in the hash, then return it.
 *
 * @param authorId - The unique ID of the author to load.
 * @returns A Promise resolving to the author (from cache or database).
 * @throws {AppError} With a 404 status when the author is not found.
 */
const getAuthorById = async (authorId: number): Promise<Author> => {
    const redis = await connectRedis();

    const authorKey = `author:${authorId}`;

    const cachedAuthor = await redis.hGet("authors", authorKey);

    if (cachedAuthor) {
        const parsedAuthor = JSON.parse(cachedAuthor) as Author;

        if (parsedAuthor.authorId !== authorId) {
            throw new AppError("Invalid cached author data", 500);
        }

        return parsedAuthor;
    }

    const author = await authorRepo.getAuthor(authorId);

    if (!author) throw new AppError("Author not found", 404);

    await redis.hSet("authors", { [authorKey]: JSON.stringify(author) });
    await redisClient.hExpire("authors", authorKey, AUTHOR_CACHE_TTL_SECONDS);

    return author;
};

/**
 * getAllAuthors retrieves all authors matching the given query, using a Redis
 * string key (built from the query via createAuthorsCacheKey) as a cache in
 * front of the database so repeated identical requests avoid hitting PostgreSQL.
 *
 * Flow:
 *  1. Ensure the Redis client is connected.
 *  2. Build a deterministic cache key from the query.
 *  3. Try to read the cached JSON string (cache hit path).
 *  4. On a hit, parse the stored JSON string back into authors and return it.
 *  5. On a miss, fetch the authors from the DB with authorRepo.getAllAuthors.
 *  6. If no authors match the query, throw a 204 AppError.
 *  7. Otherwise cache the result as a JSON string with a TTL, then return it.
 *
 * @param query - The sort/pagination query used to select the authors.
 * @returns A Promise resolving to the matching authors (from cache or database).
 * @throws {AppError} With a 204 status when no authors are found.
 */
const getAllAuthors = async (query: AuthorsSchemaType): Promise<Array<Author>> => {
    const redis = await connectRedis();

    const cachedAuthorsKey = createAuthorsCacheKey(query);

    const cachedAuthors = await redis.get(cachedAuthorsKey);

    if (cachedAuthors) return JSON.parse(cachedAuthors);

    const authors = await authorRepo.getAllAuthors(query);

    if (!authors) throw new AppError("Empty", 204);

    await redis.set(cachedAuthorsKey, JSON.stringify(authors), { EX: AUTHOR_CACHE_TTL_SECONDS });

    return authors;
};

/**
 * addAuthor creates a new author in the database.
 *
 * Flow:
 *  1. Delegate the insert to the author repository (authorRepo.addAuthor).
 *  2. Return the newly created author.
 *
 * @param author - The validated author data to insert.
 * @returns A Promise resolving to the newly created author.
 */
const addAuthor = async (author: AddAuthorSchemaType): Promise<Author> => {
    // The insert operation is delegated to the repository layer.
    return await authorRepo.addAuthor(author);
};

/**
 * updateAuthor updates an existing author's editable fields.
 *
 * Flow:
 *  1. Verify the author exists via authorRepo.getAuthor.
 *  2. If it does not exist, throw a 404 AppError.
 *  3. Otherwise apply the partial update via authorRepo.updateAuthor and return it.
 *
 * @param id - The ID of the author to update.
 * @param author - An object with the author fields to change (all optional).
 * @returns A Promise resolving to the updated author.
 * @throws {AppError} With a 404 status when the author is not found.
 */
const updateAuthor = async (id: number, author: UpdateAuthorsBodySchemaType): Promise<Author> => {
    const authorSelected = await authorRepo.getAuthor(id);

    if (!authorSelected) throw new AppError("Author not found", 404);

    return await authorRepo.updateAuthor(id, author);
};

/**
 * deleteAuthor removes an existing author from the database.
 *
 * Flow:
 *  1. Verify the author exists via authorRepo.getAuthor.
 *  2. If it does not exist, throw a 404 AppError.
 *  3. Otherwise delete it via authorRepo.deleteAuthor.
 *
 * @param id - The ID of the author to delete.
 * @returns A Promise that resolves once the author is deleted.
 * @throws {AppError} With a 404 status when the author is not found.
 */
const deleteAuthor = async (id: number): Promise<void> => {
    const author = await authorRepo.getAuthor(id);

    if (!author) throw new AppError("Author not found", 404);

    await authorRepo.deleteAuthor(id);
};

export { addAuthor, deleteAuthor, getAllAuthors, getAuthorById, updateAuthor };
