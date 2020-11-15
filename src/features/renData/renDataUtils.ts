import { BridgeCurrency } from "../../utils/assetConfigs";
import { TxType } from "../transactions/transactionsUtils";
import { mockedFees } from "./mockedFees";

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

// const mapToFeesData: (fees: Fees) => BridgeFees = (fees) => {
//   return Object.entries(fees).map(([symbol, entry]) => ({
//     symbol: toCurrencySymbol(symbol),
//     ...entry,
//     [symbol]: entry,
//   }));
// };

// const toCurrencySymbol = (symbol: string) =>
//   symbol.toUpperCase() as BridgeCurrency;

export const fetchFees: () => Promise<BridgeFees> = () => {
  // TODO: refactor fees to new version
  return Promise.resolve(mockedFees as BridgeFees);
};

type CalculateTransactionsFeesArgs = {
  amount: number;
  currency: BridgeCurrency;
  fees: BridgeFees;
  type: TxType;
};

export const calculateTransactionFees = ({
  amount,
  currency,
  fees,
  type,
}: CalculateTransactionsFeesArgs) => {
  let currencyFee = fees.find((feeEntry) => feeEntry.symbol === currency);
  if (!currencyFee) {
    //TODO: CRIT: dirty hack until fetching fees flow ready
    currencyFee = fees.find(
      (feeEntry) => feeEntry.symbol === currency.replace("REN", "")
    );
  }
  const feeData: CalculatedFee = {
    renVMFee: 0,
    renVMFeeAmount: 0,
    networkFee: 0,
    conversionTotal: amount,
  };
  if (currencyFee) {
    const renTxTypeFee =
      type === TxType.MINT
        ? currencyFee.ethereum.mint
        : currencyFee.ethereum.burn;
    feeData.networkFee = Number(currencyFee.lock) / 10 ** 8;
    feeData.renVMFee = Number(renTxTypeFee) / 10000; // percent value
    feeData.renVMFeeAmount = Number(Number(amount) * feeData.renVMFee);
    feeData.conversionTotal =
      Number(Number(amount) - feeData.renVMFeeAmount - feeData.networkFee) > 0
        ? Number(amount) - feeData.renVMFee - feeData.networkFee
        : 0;
  }

  return feeData;
};
