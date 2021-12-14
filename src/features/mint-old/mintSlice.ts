import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import { BridgeCurrency } from "../../utils/assetConfigs";

type MintState = {
  currency: BridgeCurrency;
};

let initialState: MintState = {
  currency: BridgeCurrency.BTC,
};

const slice = createSlice({
  name: "mint",
  initialState,
  reducers: {
    setMintCurrency(state, action: PayloadAction<BridgeCurrency>) {
      state.currency = action.payload;
    },
    resetMint(state, action: PayloadAction<MintState | undefined>) {
      if (action.payload) {
        state.currency = action.payload.currency;
      } else {
        state.currency = initialState.currency;
      }
    },
  },
});

export const { setMintCurrency, resetMint } = slice.actions;

export const mintReducer = slice.reducer;

export const $mint = (state: RootState) => state.mint;
export const $mintCurrency = createSelector($mint, (mint) => mint.currency);
