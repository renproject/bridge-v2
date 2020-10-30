import { combineReducers } from "@reduxjs/toolkit";
import { renDataReducer } from "../features/renData/renDataSlice";
import { flowReducer } from "../features/flow/flowSlice";
import { marketDataReducer } from "../features/marketData/marketDataSlice";
import { mintReducer } from "../features/mint/mintSlice";
import { walletReducer } from "../features/wallet/walletSlice";

const rootReducer = combineReducers({
  mint: mintReducer,
  flow: flowReducer,
  renData: renDataReducer,
  marketData: marketDataReducer,
  wallet: walletReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
