import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Asset, Chain } from "@renproject/chains";
import { RootState } from "../../store/rootReducer";

export type AssetBalance = {
  symbol: Asset;
  balance: number;
};

type WalletState = {
  chain: Chain;
  pickerOpened: boolean;
  balances: Array<AssetBalance>;
};

let initialState: WalletState = {
  chain: Chain.Ethereum,
  pickerOpened: false,
  balances: [],
};

const slice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setChain(state, action: PayloadAction<Chain>) {
      state.chain = action.payload;
    },
    setPickerOpened(state, action: PayloadAction<boolean>) {
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
  },
});

export const { setChain, setPickerOpened, addOrUpdateBalance, resetBalances } =
  slice.actions;

export const walletReducer = slice.reducer;

export const $wallet = (state: RootState) => state.wallet;
