import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Asset, Chain } from "@renproject/chains";
import { RootState } from "../../store/rootReducer";

type GatewayState = {
  asset: Asset;
  from: Chain;
  to: Chain;
  amount: number; //maybe string?
  address: string;
};

let initialState: GatewayState = {
  asset: Asset.BTC,
  from: Chain.Bitcoin,
  to: Chain.Ethereum,
  amount: 0,
  address: "",
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
    setAmount(state, action: PayloadAction<number>) {
      state.amount = action.payload;
    },
    setAddress(state, action: PayloadAction<string>) {
      state.address = action.payload;
    },
    resetGateway(state, action: PayloadAction<GatewayState | undefined>) {
      if (action.payload) {
        state.asset = action.payload.asset;
        state.from = action.payload.from;
        state.to = action.payload.to;
        state.amount = action.payload.amount;
        state.address = action.payload.address;
      } else {
        state.asset = initialState.asset;
        state.from = initialState.from;
        state.to = initialState.to;
        state.amount = initialState.amount;
        state.address = initialState.address;
      }
    },
  },
});

export const {
  setAsset,
  setFrom,
  setTo,
  setAmount,
  setAddress,
  resetGateway,
} = slice.actions;

export const gatewayReducer = slice.reducer;

export const $gateway = (state: RootState) => state.gateway;
