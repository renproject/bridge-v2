import { Fees, RenNetwork } from "@renproject/interfaces";
import RenJS from "@renproject/ren";
import { CurrencyType } from "../components/utils/types";
import { env } from "../constants/environmentVariables";

let renJs: RenJS | null = null;

const getRenJs = () => {
  if (renJs === null) {
    renJs = new RenJS(env.TARGET_NETWORK as RenNetwork);
  }
  return renJs;
};

type Fee = Fees & {
  symbol: CurrencyType;
};

const mapToFeesData: (fees: Fees) => Array<Fee> = (fees) => {
  return Object.entries(fees).map(([symbol, entry]) => ({
    symbol: toCurrencySymbol(symbol),
    ...entry,
  }));
};

const toCurrencySymbol = (symbol: string) =>
  symbol.toUpperCase() as CurrencyType;

export const fetchFees: () => Promise<Array<Fees>> = () =>
  getRenJs().getFees().then(mapToFeesData);

export const findFee: (
  symbol: CurrencyType,
  fees: Array<Fee>
) => Fee | undefined = (symbol, fees = []) =>
  fees.find((fee) => fee.symbol === symbol);
