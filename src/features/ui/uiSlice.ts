import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";

type WalletState = {
  paperShaking: boolean;
};

let initialState: WalletState = {
  paperShaking: false,
};

const slice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setPaperShaking(state, action: PayloadAction<boolean>) {
      state.paperShaking = action.payload;
    },
  },
});

export const { setPaperShaking } = slice.actions;

export const uiReducer = slice.reducer;

export const $ui = (state: RootState) => state.ui;
