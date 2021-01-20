import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RenNetwork } from "@renproject/interfaces";
import { env } from "../../constants/environmentVariables";
import { RootState } from "../../store/rootReducer";

type NetworkState = {
  renNetwork: RenNetwork;
};

const cachedTargetNetwork = localStorage.getItem("renTargetNetwork");

const initialNetwork =
  (((cachedTargetNetwork || env.NETWORK) as unknown) as RenNetwork) ||
  RenNetwork.Testnet;

let initialState: NetworkState = {
  renNetwork: (initialNetwork as unknown) as RenNetwork,
};

const slice = createSlice({
  name: "network",
  initialState,
  reducers: {
    setRenNetwork(state, action: PayloadAction<RenNetwork>) {
      state.renNetwork = action.payload;
    },
  },
});

export const { setRenNetwork } = slice.actions;

export const networkReducer = slice.reducer;

const $networkData = (state: RootState) => state.network;
export const $renNetwork = createSelector(
  $networkData,
  (network) => network.renNetwork
);
