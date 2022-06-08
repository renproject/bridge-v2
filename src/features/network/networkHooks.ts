import { Chain } from "@renproject/chains";
import { RenNetwork } from "@renproject/utils";
import queryString from "query-string";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { ChainInstanceMap, getDefaultChains } from "../chain/chainUtils";
import { $network, setNetwork } from "./networkSlice";

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

const chainsCache: Partial<Record<RenNetwork, ChainInstanceMap>> = {};
(window as any).chainsCache = chainsCache;

export const useChains = (network: RenNetwork) => {
  if (!chainsCache[network]) {
    chainsCache[network] = getDefaultChains(network);
  }
  return chainsCache[network] as ChainInstanceMap;
};

export const useCurrentNetworkChains = () => {
  const { network } = useSelector($network);
  const chains = useChains(network);
  return chains;
};

export const useRenVMExplorerLink = () => {
  const { network } = useSelector($network);
  const getRenVmExplorerLink = useCallback(
    (renVmHash: string) => {
      const base = `https://explorer${
        network !== "mainnet" ? `-${network}` : ""
      }.renproject.io/`;
      if (renVmHash) {
        return base + `#/tx/${renVmHash}`;
      }
      return base;
    },
    [network]
  );
  return { getRenVmExplorerLink };
};

export const useAddressExplorerLink = (chain: Chain | string) => {
  const chains = useCurrentNetworkChains();
  const getAddressExplorerLink = useCallback(
    (address: string) => {
      return chains[chain as Chain]?.chain.addressExplorerLink(address);
    },
    [chains, chain]
  );
  return { getAddressExplorerLink };
};

// export const useAssetDecimals = (chain: Chain | string) => {
//   const chains = useCurrentNetworkChains();
//   const getAddressExplorerLink = useCallback(
//     (address: string) => {
//       return chains[chain as Chain].chain.assetDecimals(address);
//     },
//     [chains, chain]
//   );
//   return { getAddressExplorerLink };
// };
