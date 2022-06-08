import { MenuItem, Select } from "@material-ui/core";
import { RenNetwork } from "@renproject/utils";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { $network, setNetwork } from "../networkSlice";

export const RenNetworkSelector = () => {
  const dispatch = useDispatch();
  const { network } = useSelector($network);
  const handleRenNetworkChange = useCallback(
    (event: any) => {
      dispatch(setNetwork(event.target.value));
    },
    [dispatch]
  );

  return (
    <Select value={network} onChange={handleRenNetworkChange}>
      <MenuItem value={RenNetwork.Mainnet}>{RenNetwork.Mainnet}</MenuItem>
      <MenuItem value={RenNetwork.Testnet}>{RenNetwork.Testnet}</MenuItem>
    </Select>
  );
};
