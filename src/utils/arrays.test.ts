import { uniqueArray } from "./arrays";

test("uniqueArray works", () => {
  expect(uniqueArray(["one", "one", "two"])).toEqual(["one", "two"]);
});
