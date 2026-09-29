/**
 * removeUndefined strips the keys whose value is undefined from a plain
 * object, so a partial update only writes the fields the client actually sent
 * instead of overwriting the stored ones with undefined.
 * @param obj - The object to clean.
 * @returns A new object without the undefined values.
 */
const removeUndefined = <T extends object>(obj: T) => {
    return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
};

export default removeUndefined;
