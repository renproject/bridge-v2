import { GatewaySession } from "@renproject/rentx";
import queryString from "query-string";
import { useLocation } from "react-router-dom";

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
