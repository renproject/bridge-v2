import { RenNetwork } from "@renproject/interfaces";
import queryString from "query-string";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { supportedRenNetworks } from "../../utils/assetConfigs";
import { setRenNetwork } from "./networkSlice";

export const useSetNetworkFromParam = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const parsed = queryString.parse(location.search);

  useEffect(() => {
    const network = parsed.network as RenNetwork;
    if (network) {
      if (supportedRenNetworks.indexOf(network) > -1)
        dispatch(setRenNetwork(parsed.network as RenNetwork));
    }
  }, [dispatch, parsed.network]);
};
