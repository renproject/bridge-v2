import { isFirstVowel, trimAddress } from "./strings";

const address = "0x1234567890abcdef";
const shortAddress = "1234567890";

test("trims address", () => {
  expect(trimAddress(address)).toEqual("0x12...cdef");
});

test("trims address in non standard way", () => {
  expect(trimAddress(address, 5)).toEqual("0x123...bcdef");
});

test("not trims non stanard address", () => {
  expect(trimAddress(shortAddress, 5)).toEqual(shortAddress);
});

test("detects first vowel", () => {
  expect(isFirstVowel("")).toEqual(false);
  expect(isFirstVowel("Ethereum")).toEqual(true);
  expect(isFirstVowel("Binance")).toEqual(false);
});
