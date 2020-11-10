import { GatewaySession } from "@renproject/rentx";
import queryString from "query-string";
import { useLocation } from "react-router-dom";
import { BridgeChain, BridgeNetwork } from "../../components/utils/types";

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
  const tx = parseTxQueryString(location.search);
  const locationState = location.state as LocationTxState;

  return { tx, txState: locationState?.txState };
};

export const createTxQueryString = (tx: GatewaySession) =>
  queryString.stringify({
    tx: JSON.stringify(tx),
  });

export const parseTxQueryString: (query: string) => GatewaySession | null = (
  query: string
) => {
  const queryParams = queryString.parse(query);
  const serializedTx = queryParams.tx;
  return serializedTx ? JSON.parse(serializedTx as string) : null;
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
