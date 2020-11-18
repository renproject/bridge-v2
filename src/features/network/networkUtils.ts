import { RenNetwork } from "@renproject/interfaces";
import queryString from "query-string";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { setNetwork } from "./networkSlice";

export const useSetNetworkFromParam = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const parsed = queryString.parse(location.search);
  if (!parsed) {
    return null;
  }
  useEffect(() => {
    if (parsed.network) {
      dispatch(setNetwork(parsed.network as RenNetwork));
    }
  }, [dispatch, parsed.network]);
};
