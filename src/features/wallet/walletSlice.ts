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

export type AuthUser = null | {
  uid: string;
};

type WalletState = {
  chain: BridgeChain;
  pickerOpened: boolean;
  balances: Array<AssetBalance>;
  authDialogOpened: boolean;
  signatures: { signature: string; rawSignature: string };
  user: AuthUser;
};

let initialState: WalletState = {
  chain: BridgeChain.ETHC,
  pickerOpened: false,
  balances: [],
  authDialogOpened: false,
  signatures: {
    signature: "",
    rawSignature: "",
  },
  user: null,
};

const slice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
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
    resetBalances(state) {
      state.balances = [];
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
  setUser,
  setChain,
  setWalletPickerOpened,
  addOrUpdateBalance,
  resetBalances,
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
export const $walletUser = createSelector($wallet, (wallet) => wallet.user);
