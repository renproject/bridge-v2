import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import { AnyBlockGasPrices, ExchangeRate } from "./marketDataUtils";

type MarketDataState = {
  rates: Array<ExchangeRate>;
  gasPrices: AnyBlockGasPrices | null;
};

let initialState: MarketDataState = {
  rates: [],
  gasPrices: null,
};

const slice = createSlice({
  name: "marketData",
  initialState,
  reducers: {
    setMarketDataRates(state, action: PayloadAction<Array<ExchangeRate>>) {
      state.rates = action.payload;
    },
    setMarketDataGasPrices(state, action: PayloadAction<AnyBlockGasPrices>) {
      state.gasPrices = action.payload;
    },
  },
});

export const { setMarketDataRates, setMarketDataGasPrices } = slice.actions;

export const marketDataReducer = slice.reducer;

export const $marketData = (state: RootState) => state.marketData;

export const $rates = createSelector(
  $marketData,
  (marketData) => marketData.rates
);
export const $gasPrices = createSelector(
  $marketData,
  (marketData) => marketData.gasPrices
);
