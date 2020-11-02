import { gweiToEth } from "./converters";

test("calculates ETH from Gwei", () => {
  expect(gweiToEth(200)).toEqual(0.0000002);
});
