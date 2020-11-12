import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import { BridgeChain } from '../../utils/assetConfigs'
import { bridgeChainToMultiwalletChain } from "./walletUtils";

type WalletState = {
  chain: BridgeChain;
  pickerOpened: boolean;
};

let initialState: WalletState = {
  chain: BridgeChain.ETHC,
  pickerOpened: false,
};

const slice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setChain(state, action: PayloadAction<BridgeChain>) {
      state.chain = action.payload;
    },
    setWalletPickerOpened(state, action: PayloadAction<boolean>) {
      state.pickerOpened = action.payload;
    },
  },
});

export const { setChain, setWalletPickerOpened } = slice.actions;

export const walletReducer = slice.reducer;

export const $wallet = (state: RootState) => state.wallet;
export const $chain = createSelector($wallet, (wallet) => wallet.chain);
export const $walletPickerOpened = createSelector(
  $wallet,
  (wallet) => wallet.pickerOpened
);
export const $multiwalletChain = createSelector($chain, (chain) =>
  bridgeChainToMultiwalletChain(chain)
);
