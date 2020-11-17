import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { env } from "../../constants/environmentVariables";
import { RootState } from "../../store/rootReducer";
import {
  BridgeChain,
  BridgeCurrency,
  BridgeNetwork,
} from "../../utils/assetConfigs";
import { bridgeChainToMultiwalletChain } from "./walletUtils";

export type AssetBalance = {
  symbol: BridgeCurrency;
  balance: number;
};

type WalletState = {
  network: BridgeNetwork;
  chain: BridgeChain;
  pickerOpened: boolean;
  balances: Array<AssetBalance>;
};

let initialState: WalletState = {
  network: env.NETWORK as BridgeNetwork,
  chain: BridgeChain.ETHC,
  pickerOpened: false,
  balances: [],
};

const slice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setNetwork(state, action: PayloadAction<BridgeNetwork>) {
      state.network = action.payload;
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
  },
});

export const {
  setChain,
  setWalletPickerOpened,
  addOrUpdateBalance,
} = slice.actions;

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
