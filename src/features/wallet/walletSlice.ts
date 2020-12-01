import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import {
  BridgeChain,
  BridgeCurrency,
  getChainConfig,
} from "../../utils/assetConfigs";

export type AssetBalance = {
  symbol: BridgeCurrency;
  balance: number;
};

type WalletState = {
  chain: BridgeChain;
  pickerOpened: boolean;
  balances: Array<AssetBalance>;
  signatures: { signature: string; rawSignature: string };
};

let initialState: WalletState = {
  chain: BridgeChain.ETHC,
  pickerOpened: false,
  balances: [],
  signatures: {
    signature: "",
    rawSignature: "",
  },
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
    addOrUpdateBalance(state, action: PayloadAction<AssetBalance>) {
      const index = state.balances.findIndex(
        (entry) => entry.symbol === action.payload.symbol
      );
      if (index > -1) {
        state.balances[index] = action.payload;
      } else {
        state.balances.push(action.payload);
      }
    },
    setSignatures(
      state,
      action: PayloadAction<{ signature: string; rawSignature: string }>
    ) {
      state.signatures = action.payload;
    },
  },
});

export const {
  setChain,
  setWalletPickerOpened,
  addOrUpdateBalance,
  setSignatures,
} = slice.actions;

export const walletReducer = slice.reducer;

export const $wallet = (state: RootState) => state.wallet;
export const $chain = createSelector($wallet, (wallet) => wallet.chain);
export const $walletPickerOpened = createSelector(
  $wallet,
  (wallet) => wallet.pickerOpened
);
export const $multiwalletChain = createSelector($chain, (chain) => {
  const chainConfig = getChainConfig(chain);
  return chainConfig.rentxName;
});
export const $walletSignatures = createSelector(
  $wallet,
  (wallet) => wallet.signatures
);
