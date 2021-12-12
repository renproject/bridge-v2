import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Bitcoin } from "@renproject/chains-bitcoin";
import { RootState } from "../../store/rootReducer";
import { BridgeCurrency } from "../../utils/assetConfigs";
import { $exchangeRates } from "../marketData/marketDataSlice";
import { findExchangeRate } from "../marketData/marketDataUtils";
import { GatewayAsset } from "./gatewayUtils";

type GatewayState = {
  asset: GatewayAsset;
  amount: number;
  address: string;
};

let initialState: GatewayState = {
  asset: Bitcoin.assets.BTC,
  amount: 0,
  address: "",
};

const slice = createSlice({
  name: "gateway",
  initialState,
  reducers: {
    setGatewayAsset(state, action: PayloadAction<BridgeCurrency>) {
      state.asset = action.payload;
    },
    setGatewayAmount(state, action: PayloadAction<number>) {
      state.amount = action.payload;
    },
    setGatewayAddress(state, action: PayloadAction<string>) {
      state.address = action.payload;
    },
    resetGateway(state, action: PayloadAction<GatewayState | undefined>) {
      if (action.payload) {
        state.asset = action.payload.asset;
        state.amount = action.payload.amount;
        state.address = action.payload.address;
      } else {
        state.amount = initialState.amount;
        state.address = initialState.address;
      }
    },
  },
});

export const {
  setGatewayAsset,
  setGatewayAmount,
  setGatewayAddress,
  resetGateway,
} = slice.actions;

export const gatewayReducer = slice.reducer;

export const $gateway = (state: RootState) => state.gateway;
export const $gatewayAsset = createSelector(
  $gateway,
  (gateway) => gateway.asset
);
export const $gatewayAmount = createSelector(
  $gateway,
  (gateway) => gateway.amount
);

// export const $gatewayCurrencyUsdRate = createSelector(
//   $gatewayAsset,
//   $exchangeRates,
//   (currencySymbol, rates) => findExchangeRate(rates, currencySymbol, "USD")
// );

// export const $gatewayUsdAmount = createSelector(
//   $gatewayAmount,
//   $gatewayCurrencyUsdRate,
//   (amount, rate) => amount * rate
// );
