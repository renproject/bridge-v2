import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Asset, Chain } from "@renproject/chains";
import { RootState } from "../../store/rootReducer";

type GatewayState = {
  asset: Asset;
  from: Chain;
  to: Chain;
  amount: string; //maybe string?
  toAddress: string;
};

let initialState: GatewayState = {
  asset: Asset.BTC,
  from: Chain.Ethereum,
  to: Chain.BinanceSmartChain,
  amount: "",
  toAddress: "",
};

const slice = createSlice({
  name: "gateway",
  initialState,
  reducers: {
    setAsset(state, action: PayloadAction<Asset>) {
      state.asset = action.payload;
    },
    setFrom(state, action: PayloadAction<Chain>) {
      state.from = action.payload;
    },
    setTo(state, action: PayloadAction<Chain>) {
      state.to = action.payload;
    },
    setFromTo(state, action: PayloadAction<{ from: Chain; to: Chain }>) {
      state.from = action.payload.from;
      state.to = action.payload.to;
    },
    setAmount(state, action: PayloadAction<string>) {
      state.amount = action.payload;
    },
    setToAddress(state, action: PayloadAction<string>) {
      state.toAddress = action.payload;
    },
    resetGateway(state, action: PayloadAction<GatewayState | undefined>) {
      if (action.payload) {
        state.asset = action.payload.asset;
        state.from = action.payload.from;
        state.to = action.payload.to;
        state.amount = action.payload.amount;
        state.toAddress = action.payload.toAddress;
      } else {
        state.asset = initialState.asset;
        state.from = initialState.from;
        state.to = initialState.to;
        state.amount = initialState.amount;
        state.toAddress = initialState.toAddress;
      }
    },
  },
});

export const {
  setAsset,
  setFrom,
  setTo,
  setFromTo,
  setAmount,
  setToAddress,
  resetGateway,
} = slice.actions;

export const gatewayReducer = slice.reducer;

export const $gateway = (state: RootState) => state.gateway;
