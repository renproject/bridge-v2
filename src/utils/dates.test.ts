import { getFormattedDateTime } from "./dates";

const timestamp = 1606945696428;

test("formats time and date", () => {
  const result = getFormattedDateTime(timestamp);
  expect(result.date).toEqual("12/2/2020");
  expect(result.time).toEqual("21:48:16 UTC");
});

test("formats to UTC string", () => {
  const result = new Date(timestamp).toUTCString();
  expect(result).toEqual("Wed, 02 Dec 2020 21:48:16 GMT");
});
