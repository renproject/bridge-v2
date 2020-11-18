import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import { BridgeCurrency } from "../../utils/assetConfigs";
import { $exchangeRates } from "../marketData/marketDataSlice";
import { findExchangeRate } from "../marketData/marketDataUtils";

type ReleaseState = {
  currency: BridgeCurrency;
  amount: number;
  address: string;
};

let initialState: ReleaseState = {
  currency: BridgeCurrency.RENBTC,
  amount: 0.01, // TODO: CRIT: change to 0
  address: "mzseycKNBVKFW1PjzisnPER226bJsGfnUh", // TODO: CRIT: reset
};

const slice = createSlice({
  name: "release",
  initialState,
  reducers: {
    setReleaseCurrency(state, action: PayloadAction<BridgeCurrency>) {
      state.currency = action.payload;
    },
    setReleaseAmount(state, action: PayloadAction<number>) {
      state.amount = action.payload;
    },
    setReleaseAddress(state, action: PayloadAction<string>) {
      state.address = action.payload;
    },
    reset(state, action: PayloadAction<ReleaseState | undefined>) {
      state = action.payload || initialState;
    },
  },
});

export const {
  setReleaseCurrency,
  setReleaseAmount,
  setReleaseAddress,
} = slice.actions;

export const releaseReducer = slice.reducer;

export const $release = (state: RootState) => state.release;
export const $releaseCurrency = createSelector(
  $release,
  (release) => release.currency
);
export const $releaseAmount = createSelector(
  $release,
  (release) => release.amount
);
export const $releaseCurrencyUsdRate = createSelector(
  $releaseCurrency,
  $exchangeRates,
  (currencySymbol, rates) => findExchangeRate(rates, currencySymbol, "USD")
);
export const $releaseUsdAmount = createSelector(
  $releaseAmount,
  $releaseCurrencyUsdRate,
  (amount, rate) => amount * rate
);
