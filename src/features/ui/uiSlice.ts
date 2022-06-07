import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";

export enum SystemType {
  Lightnode = "Lightnode",
  Coingecko = "Coingecko",
  Anyblock = "Anyblock",
  MaticGasStation = "MaticGasStation",
}

export enum SystemStatus {
  Pending = "pending",
  Operational = "operational",
  Unknown = "unknown",
  Failure = "failure",
}

type UiState = {
  paperShaking: boolean;
  walletButtonHoisted: boolean;
  systemMonitor: {
    dialogOpened: boolean;
    systems: Record<SystemType, SystemStatus>;
  };
};

let initialState: UiState = {
  paperShaking: false,
  walletButtonHoisted: false,
  systemMonitor: {
    dialogOpened: false,
    systems: {
      [SystemType.Lightnode]: SystemStatus.Unknown,
      [SystemType.Coingecko]: SystemStatus.Pending,
      [SystemType.Anyblock]: SystemStatus.Pending,
      [SystemType.MaticGasStation]: SystemStatus.Pending,
    },
  },
};

const slice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setPaperShaking(state, action: PayloadAction<boolean>) {
      state.paperShaking = action.payload;
    },
    setWalletButtonHoisted(state, action: PayloadAction<boolean>) {
      state.walletButtonHoisted = action.payload;
    },
    setSystemMonitorOpened(state, action: PayloadAction<boolean>) {
      state.systemMonitor.dialogOpened = action.payload;
    },
    setSystemMonitorStatus(
      state,
      action: PayloadAction<{
        type: SystemType;
        status: SystemStatus;
      }>
    ) {
      state.systemMonitor.systems[action.payload.type] = action.payload.status;
    },
  },
});

export const {
  setPaperShaking,
  setWalletButtonHoisted,
  setSystemMonitorOpened,
  setSystemMonitorStatus,
} = slice.actions;

export const uiReducer = slice.reducer;

export const $ui = (state: RootState) => state.ui;

export const $systemMonitor = (state: RootState) => state.ui.systemMonitor;
