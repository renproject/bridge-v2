import { toUsdFormat } from "./formatters";

test("formats small USD value", () => {
  expect(toUsdFormat(10)).toEqual("$10.00");
});

test("formats medium USD value", () => {
  expect(toUsdFormat(12345)).toEqual("$12,345.00");
});

test("formats big USD value", () => {
  expect(toUsdFormat(1234567890)).toEqual("$1,234,567,890.00");
});
