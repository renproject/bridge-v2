export const maxConfirmations = (actual: number, target: number) => {
  if (actual > target) {
    return target;
  }
  return actual;
};
