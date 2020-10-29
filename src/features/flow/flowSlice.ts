import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FlowStep, TransactionKind } from "../../components/utils/types";

type FlowState = {
  kind: TransactionKind;
  step: FlowStep;
};

let initialState: FlowState = {
  kind: TransactionKind.MINT,
  step: FlowStep.INITIAL,
};

const flowSlice = createSlice({
  name: "flow",
  initialState,
  reducers: {
    setFlowKind(state, action: PayloadAction<TransactionKind>) {
      state.kind = action.payload;
    },
    setFlowStep(state, action: PayloadAction<FlowStep>) {
      state.step = action.payload;
    },
  },
});

export const { setFlowKind, setFlowStep } = flowSlice.actions;

export const flowReducer = flowSlice.reducer;
