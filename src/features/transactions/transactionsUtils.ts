import { GatewaySession } from "@renproject/rentx";
import queryString from "query-string";
import { useLocation } from "react-router-dom";
import { BridgeChain, BridgeNetwork } from "../../components/utils/types";

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

const sochainTestnet = "https://sochain.com/tx/BTCTEST/";
const sochain = "https://sochain.com/tx/BTC/";
const etherscanTestnet = "https://kovan.etherscan.io/tx/";
const etherscan = "https://etherscan.io/tx/";

export const getChainExplorerLink = (
  chain: BridgeChain,
  network: BridgeNetwork,
  txId: string
) => {
  if (network === BridgeNetwork.TESTNET) {
    switch (chain) {
      case BridgeChain.BTCC:
        return sochainTestnet + txId;
      case BridgeChain.ETHC:
        return etherscanTestnet + txId;
    }
  } else if (network === BridgeNetwork.MAINNET) {
    switch (chain) {
      case BridgeChain.BTCC:
        return sochain + txId;
      case BridgeChain.ETHC:
        return etherscan + txId;
    }
  }
};
