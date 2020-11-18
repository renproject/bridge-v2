import { RenNetwork } from '@renproject/interfaces'
import { useEffect, useState } from 'react'
import { WalletStatus } from '../../components/utils/types'
import { useSelectedChainWallet } from '../../providers/multiwallet/multiwalletHooks'
import { getBurnAndReleaseFees, getLockAndMintFees } from '../../services/rentx'
import { BridgeCurrency } from '../../utils/assetConfigs'
import { TxType } from '../transactions/transactionsUtils'
import { mockedFees } from './mockedFees'

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

// export const fetchAssetFees = (
//   currency: BridgeCurrency,
//   provider: any,
//   network: RenNetwork
// ) => {
//   return getRenJs().getFees({
//     asset: "BTC",
//     from: Bitcoin(),
//     to: Ethereum(provider, network),
//   });
// };

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
export const mapFees = (rates: any) => {
  return {
    mint: rates.mint,
    burn: rates.burn,
    lock: rates.lock ? rates.lock.toNumber() : 0,
    release: rates.release ? rates.release.toNumber() : 0,
  } as SimpleFee
}
export const useFetchFees = (
  currency: BridgeCurrency,
  txType: TxType
) => {
  const fetchFees =
    txType === TxType.MINT ? getLockAndMintFees : getBurnAndReleaseFees
  const { provider, status } = useSelectedChainWallet()
  const network = RenNetwork.Testnet //TODO: getFromSelector;
  const initialFees: SimpleFee = {
    mint: 0,
    burn: 0,
    lock: 0,
    release: 0,
  }
  const [fees, setFees] = useState(initialFees)
  const [pending, setPending] = useState(true)

  useEffect(() => {
    console.log('fetching fees')
    if (provider && status === WalletStatus.CONNECTED) {
      fetchFees(currency, provider, network).then((feeRates) => {
        setPending(false)
        setFees(feeRates)
      })
    }
  }, [currency, provider, status, network, fetchFees])

  return { fees, pending }
}
