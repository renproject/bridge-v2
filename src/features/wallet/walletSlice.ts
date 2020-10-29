import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BridgeChain } from "../../components/utils/types";
import { RootState } from "../../store/rootReducer";

type MintState = {
  chain: BridgeChain;
};

let initialState: MintState = {
  chain: BridgeChain.ETHC,
};

const slice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setChain(state, action: PayloadAction<BridgeChain>) {
      state.chain = action.payload;
    },
    reset(state, action: PayloadAction<MintState | undefined>) {
      state = action.payload || initialState;
    },
  },
});

export const { setChain } = slice.actions;

export const walletReducer = slice.reducer;

export const $wallet = (state: RootState) => state.wallet;
export const $chain = createSelector($wallet, (wallet) => wallet.chain);
