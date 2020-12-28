import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RenNetwork } from "@renproject/interfaces";
import { env } from "../../constants/environmentVariables";
import { RootState } from "../../store/rootReducer";

type NetworkState = {
  renNetwork: RenNetwork;
};

const cachedTargetNetwork = localStorage.getItem("renNetwork");

let initialState: NetworkState = {
  renNetwork:
    ((cachedTargetNetwork || env.NETWORK) as RenNetwork) || RenNetwork.Testnet,
};

const slice = createSlice({
  name: "network",
  initialState,
  reducers: {
    setNetwork(state, action: PayloadAction<RenNetwork>) {
      state.renNetwork = action.payload;
    },
  },
});

export const { setNetwork } = slice.actions;

export const networkReducer = slice.reducer;

export const $networkData = (state: RootState) => state.network;
export const $renNetwork = createSelector(
  $networkData,
  (network) => network.renNetwork
);
