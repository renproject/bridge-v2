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

export type AuthSignatures = {
  signature: string;
  rawSignature: string;
};

type WalletState = {
  chain: BridgeChain;
  pickerOpened: boolean;
  balances: Array<AssetBalance>;
  signatures: AuthSignatures;
  user: AuthUser;
  settingUser: boolean;
  authRequired: boolean;
};

let initialState: WalletState = {
  chain: BridgeChain.ETHC,
  pickerOpened: false,
  balances: [],
  signatures: {
    signature: "",
    rawSignature: "",
  },
  user: null,
  settingUser: false,
  authRequired: false,
};

const slice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    settingUser(state) {
      state.settingUser = true;
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.settingUser = false;
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
    setSignatures(state, action: PayloadAction<AuthSignatures>) {
      state.signatures = action.payload;
    },
    setAuthRequired(state, action: PayloadAction<boolean>) {
      state.authRequired = action.payload;
    },
  },
});

export const {
  setUser,
  settingUser,
  setChain,
  setWalletPickerOpened,
  addOrUpdateBalance,
  resetBalances,
  setSignatures,
  setAuthRequired,
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
export const $isAuthenticating = createSelector(
  $wallet,
  (wallet) => wallet.settingUser
);
export const $authRequired = createSelector(
  $wallet,
  (wallet) => wallet.authRequired
);
