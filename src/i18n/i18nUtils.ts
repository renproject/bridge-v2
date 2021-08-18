import { isFirstVowel } from "../utils/strings";

export const getVariationOfAOrAn = (value: string, capitalize: boolean) => {
  let firstLetter = value.substring(0, 1);
  let correctWordForm = "";
  if (isFirstVowel(firstLetter)) {
    correctWordForm = capitalize ? "An" : "an";
  } else {
    correctWordForm = capitalize ? "A" : "a";
  }

  return correctWordForm;
};
