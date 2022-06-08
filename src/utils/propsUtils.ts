export const undefinedForNull = (prop: any) => {
  if (prop === null) {
    return undefined;
  }
  return prop;
};

export const undefinedForEmptyString = (prop: string) => {
  if (prop === "") {
    return undefined;
  }
  return prop;
};
