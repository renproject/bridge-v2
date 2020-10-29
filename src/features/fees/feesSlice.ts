import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import { BridgeFees } from "./feesUtils";

type FeesState = BridgeFees;

let initialState: FeesState = [];

const feesSlice = createSlice({
  name: "fees",
  initialState,
  reducers: {
    setFees(state, action: PayloadAction<BridgeFees>) {
      return action.payload;
    },
  },
});

export const { setFees } = feesSlice.actions;

export const feesReducer = feesSlice.reducer;

export const $fees = (state: RootState) => state.fees;
