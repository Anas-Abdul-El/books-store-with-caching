import type { Prisma } from "../generated/prisma/browser";
import { prisma } from "../libs/prisma";
import authorSortFunc from "../utils/authorSort";
import removeUndefined from "../utils/removeUndefined";
import type { AddAuthorSchemaType, AuthorsSchemaType, UpdateAuthorsBodySchemaType } from "../validation/author.schema";

/**
 * getAuthor fetches a single author and their books from the database by id.
 * @param authorId - The id of the author to retrieve.
 * @returns A Promise resolving to the author (with books) or null.
 */
const getAuthor = async (authorId: number) => {
    return await prisma.author.findUnique({
        where: { authorId },
        include: {
            books: true,
        },
    });
};

/**
 * getAllAuthors fetches every author from the database, applying the requested
 * sort and limit.
 * @param query - The sort/pagination query.
 * @returns A Promise resolving to the matching authors.
 */
const getAllAuthors = async (query: AuthorsSchemaType) => {
    const { sort, sortOrder, limit } = query;

    return await prisma.author.findMany({
        orderBy: authorSortFunc({ sort, sortOrder }),
        ...(limit !== undefined && { take: limit }),
    });
};

/**
 * addAuthor creates a new author in the database.
 * @param author - The validated author data to insert.
 * @returns A Promise resolving to the created author.
 */
const addAuthor = (author: AddAuthorSchemaType) => {
    const { name, description } = author;

    return prisma.author.create({
        data: {
            name,
            description: description ?? null,
        },
    });
};

/**
 * updateAuthor updates an existing author's name and/or description.
 * @param id - The id of the author to update.
 * @param author - Partial author data with only the fields to change.
 * @returns A Promise resolving to the updated author.
 */
const updateAuthor = async (id: number, author: UpdateAuthorsBodySchemaType) => {
    const data: Prisma.AuthorUpdateInput = removeUndefined(author);

    return await prisma.author.update({
        where: { authorId: id },
        data,
    });
};

/**
 * deleteAuthor removes an author from the database by id.
 * @param id - The id of the author to delete.
 * @returns A Promise that resolves once the author is deleted.
 */
const deleteAuthor = async (id: number): Promise<void> => {
    await prisma.author.delete({
        where: { authorId: id },
    });
};

export { addAuthor, deleteAuthor, getAllAuthors, getAuthor, updateAuthor };
