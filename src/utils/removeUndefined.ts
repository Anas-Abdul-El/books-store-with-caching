const removeUndefined = <T extends object>(obj: T) => {
    return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
};

export default removeUndefined;
