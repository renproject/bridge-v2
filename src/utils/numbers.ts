import BigNumber from "bignumber.js";

export const feesDecimalImpact = (
  value: string | number | null,
  decimalImpact = 2
) => {
  if (value === null) {
    return decimalImpact;
  }
  const num = value.toString();
  const decimalPosition = num.indexOf(".");
  if (decimalPosition > -1) {
    //number has decimals, like 2.002
    const decimalDigits = num.length - decimalPosition;
    return decimalDigits + decimalImpact;
  }
  return decimalImpact;
};

export const decimalsAmount = (
  amount: string | number | null,
  decimals: string | number | null
) => {
  return amount !== null && decimals !== null
    ? new BigNumber(amount).shiftedBy(-decimals).toString()
    : null;
};
