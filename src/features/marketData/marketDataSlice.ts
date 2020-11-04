import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BridgeCurrency } from "../../components/utils/types";
import { RootState } from "../../store/rootReducer";
import {
  AnyBlockGasPrices,
  ExchangeRate,
  findExchangeRate,
} from "./marketDataUtils";

type MarketDataState = {
  exchangeRates: Array<ExchangeRate>;
  gasPrices: AnyBlockGasPrices;
};

const initialGasPrices: AnyBlockGasPrices = {
  health: false,
  blockNumber: 0,
  blockTime: 0,
  fast: 0,
  instant: 0,
  slow: 0,
  standard: 0,
};

let initialState: MarketDataState = {
  exchangeRates: [],
  gasPrices: initialGasPrices,
};

const slice = createSlice({
  name: "marketData",
  initialState,
  reducers: {
    setExchangeRates(state, action: PayloadAction<Array<ExchangeRate>>) {
      state.exchangeRates = action.payload;
    },
    setGasPrices(state, action: PayloadAction<AnyBlockGasPrices>) {
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

export const $ethUsdExchangeRate = createSelector(
  $exchangeRates,
  (exchangeRates) => {
    return findExchangeRate(exchangeRates, BridgeCurrency.ETH, "USD");
  }
);

export const $gasPrices = createSelector(
  $marketData,
  (marketData) => marketData.gasPrices
);
