import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import { ExchangeRate, GasPrice } from "./marketDataUtils";

type MarketDataState = {
  exchangeRates: Array<ExchangeRate>;
  gasPrices: Array<GasPrice>; // consider Record<EVMChain|GasChain, number>
};

let initialState: MarketDataState = {
  exchangeRates: [],
  gasPrices: [],
};

const slice = createSlice({
  name: "marketData",
  initialState,
  reducers: {
    setExchangeRates(state, action: PayloadAction<Array<ExchangeRate>>) {
      state.exchangeRates = action.payload;
    },
    setGasPrices(state, action: PayloadAction<Array<GasPrice>>) {
      state.gasPrices = action.payload;
    },
  },
});

export const { setExchangeRates, setGasPrices } = slice.actions;

export const marketDataReducer = slice.reducer;

export const $marketData = (state: RootState) => state.marketData;
export const $exchangeRates = createSelector(
  $marketData,
  (marketData) => marketData.exchangeRates
);
export const $gasPrices = createSelector(
  $marketData,
  (marketData) => marketData.gasPrices
);
