import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RenNetwork } from "@renproject/interfaces";
import { env } from "../../constants/environmentVariables";
import { RootState } from "../../store/rootReducer";

type WalletState = {
  renNetwork: RenNetwork;
};

const cachedTargetNetwork = localStorage.getItem("renNetwork");

let initialState: WalletState = {
  renNetwork: RenNetwork.Testnet || (cachedTargetNetwork || env.NETWORK) as RenNetwork,
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
export const $network = createSelector(
  $networkData,
  (network) => network.renNetwork
);
