import { getRenJs } from '../../services/renJs'
import { BridgeCurrency } from '../../utils/assetConfigs'

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

export const calculateMintFees = (
  amount: number,
  currency: BridgeCurrency,
  fees: BridgeFees
) => {
  const currencyFee = fees.find((feeEntry) => feeEntry.symbol === currency);
  const feeData: CalculatedFee = {
    renVMFee: 0,
    renVMFeeAmount: 0,
    networkFee: 0,
    conversionTotal: amount,
  };
  if (currencyFee) {
    feeData.networkFee = Number(currencyFee.lock) / 10 ** 8;
    feeData.renVMFee = Number(currencyFee.ethereum.mint) / 10000; // percent value
    feeData.renVMFeeAmount = Number(Number(amount) * feeData.renVMFee);
    feeData.conversionTotal =
      Number(Number(amount) - feeData.renVMFeeAmount - feeData.networkFee) > 0
        ? Number(amount) - feeData.renVMFee - feeData.networkFee
        : 0;
  }

  return feeData;
};
