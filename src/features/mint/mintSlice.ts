import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CurrencySymbols, CurrencyType, } from '../../components/utils/types'
import { RootState } from '../../store/rootReducer'

type MintState = {
  currency: CurrencyType;
  amount: number;
};

let initialState: MintState = {
  currency: CurrencySymbols.BTC,
  amount: 0,
};

const slice = createSlice({
  name: "mint",
  initialState,
  reducers: {
    setMintCurrency(state, action: PayloadAction<CurrencyType>) {
      state.currency = action.payload;
    },
    setMintAmount(state, action: PayloadAction<number>) {
      state.amount = action.payload;
    },
    reset(state, action: PayloadAction<MintState | undefined>) {
      state = action.payload || initialState;
    },
  },
});

export const { setMintCurrency, setMintAmount } = slice.actions;

export const mintReducer = slice.reducer;

export const $mint = (state: RootState) => state.mint;
export const $mintCurrency = createSelector($mint, (mint) => mint.currency);
export const $mintAmount = createSelector($mint, (mint) => mint.amount);
