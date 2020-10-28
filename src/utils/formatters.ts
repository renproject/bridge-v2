import Numeral from "numeral";

export const toUsdFormat = (value: string | number) => {
  return Numeral(value).format("$0,0.00");
};
