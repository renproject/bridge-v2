import { MenuItem, Select } from "@material-ui/core";
import { RenNetwork } from "@renproject/interfaces";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { $renNetwork, setRenNetwork } from "../networkSlice";

export const RenNetworkSelector = () => {
  const dispatch = useDispatch();
  const renNetwork = useSelector($renNetwork);
  const handleRenNetworkChange = useCallback(
    (event: any) => {
      dispatch(setRenNetwork(event.target.value));
    },
    [dispatch]
  );

  return (
    <Select value={renNetwork} onChange={handleRenNetworkChange}>
      <MenuItem value={RenNetwork.Mainnet}>{RenNetwork.Mainnet}</MenuItem>
      <MenuItem value={RenNetwork.Testnet}>{RenNetwork.Testnet}</MenuItem>
      <MenuItem value={RenNetwork.MainnetVDot3}>
        {RenNetwork.MainnetVDot3}
      </MenuItem>
      <MenuItem value={RenNetwork.TestnetVDot3}>
        {RenNetwork.TestnetVDot3}
      </MenuItem>
      <MenuItem value={RenNetwork.DevnetVDot3}>
        {RenNetwork.DevnetVDot3}
      </MenuItem>
    </Select>
  );
};
