import { Fees } from "@renproject/interfaces";
import { CurrencyType } from "../../components/utils/types";
import { getRenJs } from "../../services/renJs";

export type BridgeFee = Fees & {
  symbol: CurrencyType;
};

export type BridgeFees = Array<BridgeFee>;

const mapToFeesData: (fees: Fees) => BridgeFees = (fees) => {
  return Object.entries(fees).map(([symbol, entry]) => ({
    symbol: toCurrencySymbol(symbol),
    ...entry,
  }));
};

const toCurrencySymbol = (symbol: string) =>
  symbol.toUpperCase() as CurrencyType;

export const fetchFees: () => Promise<BridgeFees> = () =>
  getRenJs().getFees().then(mapToFeesData);
