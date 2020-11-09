import { BridgeCurrency } from "../../components/utils/types";
import { getRenJs } from "../../services/renJs";

type Fees = {
  [key: string]: any;
};

export type BridgeFee = Fees & {
  lock: number;
  release: number;
  symbol: BridgeCurrency;
};

export type BridgeFees = Array<BridgeFee>;

export type CalculatedFee = {
  renVMFee: number;
  renVMFeeAmount: number;
  networkFee: number;
  conversionTotal: number;
};

const mapToFeesData: (fees: Fees) => BridgeFees = (fees) => {
  return Object.entries(fees).map(([symbol, entry]) => ({
    symbol: toCurrencySymbol(symbol),
    ...entry,
    [symbol]: entry,
  }));
};

const toCurrencySymbol = (symbol: string) =>
  symbol.toUpperCase() as BridgeCurrency;

export const fetchFees: () => Promise<BridgeFees> = () =>
  getRenJs().getFees().then(mapToFeesData);
