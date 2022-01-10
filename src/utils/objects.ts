/**
 * isDefined returns true if the parameter is defined and not null.
 */
export const isDefined = <T>(x: T | null | undefined): x is T =>
  x !== undefined;
