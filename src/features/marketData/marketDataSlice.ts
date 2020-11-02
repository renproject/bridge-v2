import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import { ExchangeRate } from "./marketDataUtils";

type MarketDataState = {
  rates: Array<ExchangeRate>;
};

let initialState: MarketDataState = {
  rates: [],
};

const slice = createSlice({
  name: "marketData",
  initialState,
  reducers: {
    setMarketDataRates(state, action: PayloadAction<Array<ExchangeRate>>) {
      state.rates = action.payload;
    },
  },
});

export const { setMarketDataRates } = slice.actions;

export const marketDataReducer = slice.reducer;

export const $marketData = (state: RootState) => state.marketData;

export const $rates = createSelector(
  $marketData,
  (marketData) => marketData.rates
);
