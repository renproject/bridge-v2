import { combineReducers } from "@reduxjs/toolkit";
import { mintReducer } from "../features/mint/mintSlice";

const rootReducer = combineReducers({
  mint: mintReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
