import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import { BridgeCurrency } from "../../utils/assetConfigs";
import { $exchangeRates } from "../marketData/marketDataSlice";
import { findExchangeRate } from "../marketData/marketDataUtils";

type MintState = {
  currency: BridgeCurrency;
  amount: number;
};

let initialState: MintState = {
  currency: BridgeCurrency.BTC,
  amount: 0, // 0.01
};

const slice = createSlice({
  name: "mint",
  initialState,
  reducers: {
    setMintCurrency(state, action: PayloadAction<BridgeCurrency>) {
      state.currency = action.payload;
    },
    setMintAmount(state, action: PayloadAction<number>) {
      state.amount = action.payload;
    },
    resetMint(state, action: PayloadAction<MintState | undefined>) {
      if (action.payload) {
        state.currency = action.payload.currency;
        state.amount = action.payload.amount;
      } else {
        state = initialState;
      }
    },
  },
});

export const { setMintCurrency, setMintAmount, resetMint } = slice.actions;

export const mintReducer = slice.reducer;

export const $mint = (state: RootState) => state.mint;
export const $mintCurrency = createSelector($mint, (mint) => mint.currency);
export const $mintAmount = createSelector($mint, (mint) => mint.amount);

export const $mintCurrencyUsdRate = createSelector(
  $mintCurrency,
  $exchangeRates,
  (currencySymbol, rates) => findExchangeRate(rates, currencySymbol, "USD")
);

export const $mintUsdAmount = createSelector(
  $mintAmount,
  $mintCurrencyUsdRate,
  (amount, rate) => amount * rate
);
