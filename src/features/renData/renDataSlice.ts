import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import { BridgeFees } from "./renDataUtils";

type RenDataState = { fees: BridgeFees };

let initialState: RenDataState = {
  fees: [],
};

const slice = createSlice({
  name: "renData",
  initialState,
  reducers: {
    setFees(state, action: PayloadAction<BridgeFees>) {
      state.fees = action.payload;
    },
  },
});

export const { setFees } = slice.actions;

export const renDataReducer = slice.reducer;

export const $fees = (state: RootState) => state.renData;
