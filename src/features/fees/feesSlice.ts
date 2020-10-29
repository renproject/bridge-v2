import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../store/rootReducer'
import { BridgeFees } from './feesUtils'

type FeesState = BridgeFees;

let initialState: FeesState = [];

const slice = createSlice({
  name: "fees",
  initialState,
  reducers: {
    setFees(state, action: PayloadAction<BridgeFees>) {
      return action.payload;
    },
  },
});

export const { setFees } = slice.actions;

export const feesReducer = slice.reducer;

export const $fees = (state: RootState) => state.fees;
