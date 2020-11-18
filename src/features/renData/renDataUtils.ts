import { RenNetwork } from "@renproject/interfaces";
import { useEffect, useState } from "react";
import { WalletStatus } from "../../components/utils/types";
import { useSelectedChainWallet } from "../../providers/multiwallet/multiwalletHooks";
import {
  getBurnAndReleaseFees,
  getLockAndMintFees,
} from "../../services/rentx";
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

export const fetchFees: () => Promise<BridgeFees> = () => {
  // TODO: refactor fees to new version
  return Promise.resolve(mockedFees as BridgeFees);
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
  const feeData: CalculatedFee = {
    renVMFee: 0,
    renVMFeeAmount: 0,
    networkFee: 0,
    conversionTotal: amount,
  };
  if (fees) {
    const renTxTypeFee = type === TxType.MINT ? fees.mint : fees.burn;
    const networkFee = type === TxType.MINT ? fees.lock : fees.release;
    feeData.networkFee = Number(networkFee) / 1e8;
    feeData.renVMFee = Number(renTxTypeFee) / 10000; // percent value
    feeData.renVMFeeAmount = Number(Number(amount) * feeData.renVMFee);
    feeData.conversionTotal =
      Number(Number(amount) - feeData.renVMFeeAmount - feeData.networkFee) > 0
        ? Number(amount) - feeData.renVMFee - feeData.networkFee
        : 0;
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

const feesCache: Record<string, SimpleFee> = {};
export const useFetchFees = (currency: BridgeCurrency, txType: TxType) => {
  const { provider, status } = useSelectedChainWallet();
  const network = RenNetwork.Testnet; //TODO: getFromSelector;
  const initialFees: SimpleFee = {
    mint: 0,
    burn: 0,
    lock: 0,
    release: 0,
  };
  const [fees, setFees] = useState(initialFees);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    const cacheKey = `${currency}-${txType}`;
    if (provider && status === WalletStatus.CONNECTED) {
      if (feesCache[cacheKey]) {
        setFees(feesCache[cacheKey]);
        setPending(false);
      } else {
        const fetchFees =
          txType === TxType.MINT ? getLockAndMintFees : getBurnAndReleaseFees;
        fetchFees(currency, provider, network).then((feeRates) => {
          setPending(false);
          feesCache[cacheKey] = feeRates;
          setFees(feeRates);
        });
      }
    }
  }, [currency, provider, status, network, txType]);

  return { fees, pending };
};
