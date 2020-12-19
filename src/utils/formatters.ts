import Numeral from "numeral";

export const toUsdFormat = (value: string | number) => {
  return Numeral(value).format("$0,0.00");
};

export const numberFormatOptions = {
  thousandSeparator: true,
  allowLeadingZeros: false,
  allowNegative: false,
  allowedDecimalSeparators: [".", ","],
};
