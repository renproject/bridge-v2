import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";

export type FlowType = "mint" | "burn" | null;

export enum SystemType {
  Bandchain = "bandchain",
  Coingecko = "coingecko",
  Lightnode = "lightnode",
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
    dialogOpened: true,
    systems: {
      [SystemType.Bandchain]: getInitialSystemStatus(SystemType.Bandchain),
      [SystemType.Coingecko]: getInitialSystemStatus(SystemType.Coingecko),
      [SystemType.Lightnode]: getInitialSystemStatus(SystemType.Lightnode),
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

export const { setPaperShaking, setSystemMonitorOpened } = slice.actions;

export const uiReducer = slice.reducer;

export const $ui = (state: RootState) => state.ui;

export const $systemMonitor = (state: RootState) => state.ui.systemMonitor;
