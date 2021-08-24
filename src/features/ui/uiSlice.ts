import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";

export type FlowType = "mint" | "burn" | null;

export enum SystemType {
  Lightnode = "lightnode",
  Bandchain = "bandchain",
  Coingecko = "coingecko",
}

export enum SystemStatus {
  Pending = "pending",
  Operational = "operational",
  Unknown = "unknown",
  Failure = "failure",
}

type SystemData = {
  name: SystemType | string;
  status: SystemStatus;
};

type UiState = {
  paperShaking: boolean;
  systemMonitor: {
    dialogOpened: boolean;
    systems: Record<string, SystemData>;
  };
};

const getInitialSystemStatus = (
  type: SystemType,
  status = SystemStatus.Unknown
) => ({
  name: type,
  status,
});

let initialState: UiState = {
  paperShaking: false,
  systemMonitor: {
    dialogOpened: false,
    systems: {
      [SystemType.Lightnode]: getInitialSystemStatus(
        SystemType.Lightnode,
        SystemStatus.Pending
      ),
      [SystemType.Bandchain]: getInitialSystemStatus(
        SystemType.Bandchain,
        SystemStatus.Unknown
      ),
      [SystemType.Coingecko]: getInitialSystemStatus(
        SystemType.Coingecko,
        SystemStatus.Pending
      ),
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
      state.systemMonitor.systems[action.payload.type].status =
        action.payload.status;
    },
  },
});

export const {
  setPaperShaking,
  setSystemMonitorOpened,
  setSystemMonitorStatus,
} = slice.actions;

export const uiReducer = slice.reducer;

export const $ui = (state: RootState) => state.ui;

export const $systemMonitor = (state: RootState) => state.ui.systemMonitor;
