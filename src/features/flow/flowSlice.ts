import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FlowStep, FlowKind } from "../../components/utils/types";

type FlowState = {
  kind: FlowKind;
  step: FlowStep;
};

let initialState: FlowState = {
  kind: FlowKind.MINT,
  step: FlowStep.INITIAL,
};

const flowSlice = createSlice({
  name: "flow",
  initialState,
  reducers: {
    setFlowKind(state, action: PayloadAction<FlowKind>) {
      state.kind = action.payload;
    },
    setFlowStep(state, action: PayloadAction<FlowStep>) {
      state.step = action.payload;
    },
  },
});

export const { setFlowKind, setFlowStep } = flowSlice.actions;

export const flowReducer = flowSlice.reducer;
