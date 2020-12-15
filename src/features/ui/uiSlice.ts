import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../store/rootReducer'

export type FlowType = "mint" | "burn" | null;

type UiState = {
  paperShaking: boolean;
  // flow: FlowType;
};

let initialState: UiState = {
  paperShaking: false,
  // flow: null,
};

const slice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setPaperShaking(state, action: PayloadAction<boolean>) {
      state.paperShaking = action.payload;
    },
    // setFlow(state, action: PayloadAction<FlowType>) {
    //   state.flow = action.payload;
    // },
  },
});

export const { setPaperShaking } = slice.actions;

export const uiReducer = slice.reducer;

export const $ui = (state: RootState) => state.ui;

// export const $uiFlow = createSelector($ui, (ui) => ui.flow);

