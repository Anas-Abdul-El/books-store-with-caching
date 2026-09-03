import bcrypt from "bcrypt";

/**
 * Creates a hash of the given data using bcrypt.
 * @param data - The data to be hashed.
 * @returns A promise that resolves to the hashed string.
 */
export const createHash = async (data: string): Promise<string> => {
    const saltRounds = 10;
    const hashedData = await bcrypt.hash(data, saltRounds);
    return hashedData;
};

/**
 * Compares the given data with the hashed data using bcrypt.
 * @param data - The data to be compared.
 * @param hashedData - The hashed data to compare against.
 * @returns A promise that resolves to a boolean indicating whether the data matches the hash.
 */
export const compareHash = async (data: string, hashedData: string): Promise<boolean> => {
    const isMatch = await bcrypt.compare(data, hashedData);
    return isMatch;
};
