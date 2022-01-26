export const undefinedForNull = (prop: any) => {
  if (prop === null) {
    return undefined;
  }
  return prop;
};
