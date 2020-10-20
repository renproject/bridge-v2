import { cartesianProps, cartesianProduct } from "./cartesian";

test("calculates cartesianProps props", () => {
  const propVariants = {
    color: ["primary", "secondary"],
    size: ["small", "large"],
  };

  const result = cartesianProps(propVariants);

  const expected = [
    { color: "primary", size: "small" },
    { color: "primary", size: "large" },
    { color: "secondary", size: "small" },
    { color: "secondary", size: "large" },
  ];
  expect(result).toEqual(expected);
});

test("calculates cartesianProps product", () => {
  const result = cartesianProduct(["outlined", "solid"], [true, false]);
  const expected = [
    ["outlined", true],
    ["outlined", false],
    ["solid", true],
    ["solid", false],
  ];
  expect(result).toEqual(expected);
});
