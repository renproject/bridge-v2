import { GatewaySession } from "@renproject/rentx";
import queryString from "query-string";
import { useLocation } from "react-router-dom";

export const useTxParam = () => {
  const location = useLocation();
  const tx = parseTxQueryString(location.search);
  return { tx };
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
