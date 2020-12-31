import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RenNetwork } from "@renproject/interfaces";
import { env } from "../../constants/environmentVariables";
import { RootState } from "../../store/rootReducer";
import { RenTargetNetwork } from "../../utils/assetConfigs";

type NetworkState = {
  targetNetwork: RenTargetNetwork; // TODO: remove
  renNetwork: RenNetwork;
};

const cachedTargetNetwork = localStorage.getItem("renTargetNetwork");

const initialNetwork =
  (((cachedTargetNetwork || env.NETWORK) as unknown) as RenTargetNetwork) ||
  RenTargetNetwork.Testnet;

let initialState: NetworkState = {
  targetNetwork: initialNetwork,
  renNetwork: initialNetwork as unknown as RenNetwork,
};

const slice = createSlice({
  name: "network",
  initialState,
  reducers: {
    setTargetNetwork(state, action: PayloadAction<RenTargetNetwork>) {
      state.targetNetwork = action.payload;
    },
    setRenNetwork(state, action: PayloadAction<RenNetwork>) {
      state.renNetwork = action.payload;
    },
  },
});

export const { setRenNetwork, setTargetNetwork } = slice.actions;

export const networkReducer = slice.reducer;

export const $networks = (state: RootState) => state.network;
export const $renNetwork = createSelector(
  $networks,
  (network) => network.renNetwork
);
export const $targetNetwork = createSelector(
  $networks,
  (network) => network.targetNetwork
);
