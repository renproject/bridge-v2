import { RenNetwork } from "@renproject/utils";
import queryString from "query-string";
import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { getDefaultChains } from "../chain/chainUtils";
import { setNetwork } from "./networkSlice";

const supportedParamNetworks = [RenNetwork.Mainnet, RenNetwork.Testnet];

export const useSetNetworkFromParam = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const parsed = queryString.parse(location.search);

  useEffect(() => {
    const network = parsed.network as RenNetwork;
    if (network) {
      if (supportedParamNetworks.indexOf(network) > -1)
        dispatch(setNetwork(parsed.network as RenNetwork));
    }
  }, [dispatch, parsed.network]);
};

export const useChains = (network: RenNetwork) => {
  return useMemo(() => {
    return getDefaultChains(network);
  }, [network]);
};
