const flatten = (arr: Array<any>) => [].concat.apply([], arr);

export const cartesianProduct = (...sets: Array<any>) => {
  return sets.reduce(
    (acc, set) => {
      return flatten(
        acc.map((x: any) => {
          return set.map((y: any) => {
            return [...x, y];
          });
        })
      );
    },
    [[]]
  );
};

export type PropVariants = Record<string, Array<any>>;

export const cartesianProps = (propVariants: PropVariants) => {
  const propNames = Object.keys(propVariants);
  const propValues = Object.values(propVariants);
  const valueCombinations = cartesianProduct(...propValues);
  return valueCombinations.map((combination: Array<any>) => {
    const propCombination: any = {};
    propNames.forEach((propName, index) => {
      propCombination[propName] = combination[index];
    });
    return propCombination;
  });
};
