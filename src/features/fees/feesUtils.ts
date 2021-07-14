import { BridgeCurrency } from "../../utils/assetConfigs";
import { TxType } from "../transactions/transactionsUtils";

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

export type SimpleFee = {
  lock: number;
  release: number;
  mint: number;
  burn: number;
};

type GetTransactionsFeesArgs = {
  amount: number;
  fees: SimpleFee | null;
  type: TxType;
};

export const getTransactionFees = ({
  amount,
  type,
  fees,
}: GetTransactionsFeesArgs) => {
  const amountNumber = Number(amount);
  const feeData: CalculatedFee = {
    renVMFee: 0,
    renVMFeeAmount: 0,
    networkFee: 0,
    conversionTotal: amountNumber,
  };
  if (fees) {
    const renTxTypeFee = type === TxType.MINT ? fees.mint : fees.burn;
    const networkFee = type === TxType.MINT ? fees.lock : fees.release;
    feeData.networkFee = Number(networkFee);
    feeData.renVMFee = Number(renTxTypeFee) / 10000; // percent value
    feeData.renVMFeeAmount = Number(amountNumber * feeData.renVMFee);
    const total = Number(
      Number(
        amountNumber - feeData.renVMFeeAmount - feeData.networkFee
      ).toFixed(6)
    );
    feeData.conversionTotal = total > 0 ? total : 0;
  }

  return feeData;
};

export const mapFees = (rates: any) => {
  return {
    mint: rates.mint,
    burn: rates.burn,
    lock: rates.lock ? rates.lock.toNumber() : 0,
    release: rates.release ? rates.release.toNumber() : 0,
  } as SimpleFee;
};
