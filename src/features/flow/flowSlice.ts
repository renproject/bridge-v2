import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import { FlowStep } from "./flowTypes";

type FlowState = {
  step: FlowStep;
};

let initialState: FlowState = {
  step: FlowStep.INITIAL,
};

const slice = createSlice({
  name: "flow",
  initialState,
  reducers: {
    setFlowStep(state, action: PayloadAction<FlowStep>) {
      state.step = action.payload;
    },
  },
});

export const { setFlowStep } = slice.actions;

export const flowReducer = slice.reducer;

export const $flow = (state: RootState) => state.flow;
