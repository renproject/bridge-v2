import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import { FlowKind, FlowStep } from "./flowTypes";

type FlowState = {
  kind: FlowKind;
  step: FlowStep;
};

let initialState: FlowState = {
  kind: FlowKind.MINT,
  step: FlowStep.INITIAL,
};

const slice = createSlice({
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

export const { setFlowKind, setFlowStep } = slice.actions;

export const flowReducer = slice.reducer;

export const $flow = (state: RootState) => state.flow;
