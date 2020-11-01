import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CurrencySymbols, CurrencyType } from "../../components/utils/types";
import { RootState } from "../../store/rootReducer";
import { $fees } from "../renData/renDataSlice";
import { CalculatedFee } from "../renData/renDataUtils";

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

// /**
//  * Calculate Fees for a Transaction
//  */
// export const gatherFeeData = async function () {
//   const amount = 100;
//   const selectedAsset = store.get("selectedAsset");
//   const selectedDirection = store.get("convert.selectedDirection");
//   const fixedFeeKey = selectedDirection ? "release" : "lock";
//   const dynamicFeeKey = selectedDirection ? "burn" : "mint";
//
//   if (!amount) {
//     return;
//   }
//
//   const renVMFee = Number(
//     Number(amount) * Number(fees[selectedAsset].ethereum[dynamicFeeKey] / 10000)
//   ).toFixed(6);
//   const networkFee = Number(fees[selectedAsset][fixedFeeKey] / 10 ** 8);
//   const total =
//     Number(amount - Number(renVMFee) - networkFee) > 0
//       ? Number(amount - Number(renVMFee) - networkFee).toFixed(6)
//       : "0.000000";
//
//   store.set("convert.renVMFee", renVMFee);
//   store.set("convert.networkFee", networkFee);
//   store.set("convert.conversionTotal", total);
// };
//

export const $mintFees = createSelector(
  [$mintAmount, $mintCurrency, $fees],
  (amount, currency, fees) => {
    const currencyFee = fees.find((feeEntry) => feeEntry.symbol === currency);
    const feeData: CalculatedFee = {
      renVMFee: 0,
      networkFee: 0,
      conversionTotal: amount,
    };
    if (currencyFee) {
      feeData.networkFee = Number(currencyFee.lock) / 10 ** 8;
      feeData.renVMFee = Number(
        Number(amount) * Number(Number(currencyFee.ethereum.mint) / 10000)
      );
      feeData.conversionTotal =
        Number(Number(amount) - Number(feeData.renVMFee) - feeData.networkFee) >
        0
          ? Number(amount - Number(feeData.renVMFee) - feeData.networkFee)
          : 0;
    }

    return feeData;
  }
);
