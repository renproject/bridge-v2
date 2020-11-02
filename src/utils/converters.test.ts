import { fromGwei, toPercent } from "./converters";

test("calculates ETH from Gwei", () => {
  expect(fromGwei(200)).toEqual(0.0000002);
});

test("calculates percent from value", () => {
  expect(toPercent(1)).toEqual(100);
  expect(toPercent(0.2)).toEqual(20);
  expect(toPercent(0.03)).toEqual(3);
});
