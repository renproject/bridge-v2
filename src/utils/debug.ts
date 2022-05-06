export const createLabeler =
  (label: string) =>
  (strings: TemplateStringsArray | string, ...rest: any) => {
    return `${label} ${strings} ${rest}`;
  };
