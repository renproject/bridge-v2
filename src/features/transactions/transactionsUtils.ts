import { GatewaySession } from "@renproject/rentx";
import queryString from "query-string";
import { useLocation } from "react-router-dom";
import { BridgeChain, BridgeNetwork } from '../../utils/assetConfigs'

export enum TxConfigurationStep {
  INITIAL = "initial",
  FEES = "fees",
}
export type TxConfigurationStepProps = {
  onPrev?: () => void;
  onNext?: () => void;
};

export type LocationTxState = {
  txState?: {
    newTx?: boolean;
  };
};

export const useTxParam = () => {
  const location = useLocation();
  console.log(location.search);
  const tx = parseTxQueryString(location.search);
  const locationState = location.state as LocationTxState;

  return { tx, txState: locationState?.txState };
};

export const createTxQueryString = (tx: GatewaySession) => {
  const { customParams, transactions, ...sanitized } = tx;

  return queryString.stringify(sanitized as any);
};

const parseNumber = (value: any) => {
  if (typeof value === "undefined") {
    return undefined;
  }
  return Number(value);
};

export const parseTxQueryString: (
  query: string
) => Partial<GatewaySession> | null = (query: string) => {
  const parsed = queryString.parse(query);
  if (!parsed) {
    return null;
  }
  const { expiryTime, suggestedAmount, targetAmount, ...rest } = parsed;
  return {
    ...rest,
    expiryTime: parseNumber(expiryTime),
    suggestedAmount: parseNumber(suggestedAmount),
    targetAmount: parseNumber(targetAmount),
  };
};

const sochainTestnet = "https://sochain.com/tx/";
const sochain = "https://sochain.com/tx/";
const etherscanTestnet = "https://kovan.etherscan.io/tx/";
const etherscan = "https://etherscan.io/tx/";

export const getChainExplorerLink = (
  chain: BridgeChain,
  network: BridgeNetwork,
  txId: string
) => {
  if (network === BridgeNetwork.TESTNET) {
    switch (chain) {
      case BridgeChain.ETHC:
        return etherscanTestnet + txId;
      case BridgeChain.BTCC:
        return sochainTestnet + "BTCTEST/" + txId;
      case BridgeChain.ZECC:
        return sochainTestnet + "ZECTEST/" + txId;
    }
  } else if (network === BridgeNetwork.MAINNET) {
    switch (chain) {
      case BridgeChain.ETHC:
        return etherscan + txId;
      case BridgeChain.BTCC:
        return sochain + "BTC/" + txId;
      case BridgeChain.ZECC:
        return sochain + "ZEC/" + txId;
    }
  }
};
