import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Chain } from "@renproject/interfaces";
import { CurrencySymbols, CurrencyType } from "../../components/utils/types";
import { RootState } from "../../store/rootReducer";

type MintState = {
  currency: CurrencyType;
  amount: number;
  chain: Chain;
};

let initialState: MintState = {
  currency: CurrencySymbols.BTC,
  amount: 0,
  chain: Chain.Ethereum,
};

const mintSlice = createSlice({
  name: "mint",
  initialState,
  reducers: {
    setMintCurrency(state, action: PayloadAction<CurrencyType>) {
      state.currency = action.payload;
    },
    setMintAmount(state, action: PayloadAction<number>) {
      state.amount = action.payload;
    },
    setMintChain(state, action: PayloadAction<Chain>) {
      state.chain = action.payload;
    },
    reset(state, action: PayloadAction<MintState | undefined>) {
      state = action.payload || initialState;
    },
  },
});

export const {
  setMintCurrency,
  setMintAmount,
  setMintChain,
} = mintSlice.actions;

export const mintReducer = mintSlice.reducer;

export const $mint = (state: RootState) => state.mint;
export const $mintCurrency = createSelector($mint, (mint) => mint.currency);
export const $mintAmount = createSelector($mint, (mint) => mint.amount);
export const $mintChain = createSelector($mint, (mint) => mint.chain);
