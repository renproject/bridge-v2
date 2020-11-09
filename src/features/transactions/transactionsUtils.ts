import { GatewaySession } from '@renproject/rentx'
import queryString from 'query-string'
import { useLocation } from 'react-router-dom'

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
  chain: string,
  network: string,
  txId: string
) => {
  if (network === "testnet") {
    switch (chain) {
      case "bitcoin":
        return sochainTestnet + txId;
      case "ethereum":
        return etherscanTestnet + txId;
    }
  } else if (network === "mainnet") {
    switch (chain) {
      case "bitcoin":
        return sochain + txId;
      case "ethereum":
        return etherscan + txId;
    }
  }
};
