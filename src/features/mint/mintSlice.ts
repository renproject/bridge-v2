import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import { BridgeCurrency } from "../../utils/assetConfigs";
import { $exchangeRates } from "../marketData/marketDataSlice";
import { findExchangeRate } from "../marketData/marketDataUtils";
import { $fees } from "../renData/renDataSlice";
import { calculateTransactionFees } from "../renData/renDataUtils";
import { TxType } from "../transactions/transactionsUtils";

type MintState = {
  currency: BridgeCurrency;
  amount: number;
};

let initialState: MintState = {
  currency: BridgeCurrency.BTC,
  amount: 0.01, // TODO: CRIT: change to 0
};

const slice = createSlice({
  name: "mint",
  initialState,
  reducers: {
    setMintCurrency(state, action: PayloadAction<BridgeCurrency>) {
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

export const $mintCurrencyUsdRate = createSelector(
  $mintCurrency,
  $exchangeRates,
  (currencySymbol, rates) => findExchangeRate(rates, currencySymbol, "USD")
);

export const $mintUsdAmount = createSelector(
  $mintAmount,
  $mintCurrencyUsdRate,
  (amount, rate) => amount * rate
);

export const $mintFees = createSelector(
  [$mintAmount, $mintCurrency, $fees],
  (amount, currency, fees) =>
    calculateTransactionFees({ amount, currency, fees, type: TxType.MINT })
);
