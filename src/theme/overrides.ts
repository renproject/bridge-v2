import { textDark, textDisabled, textLighter } from "./colors";

export const overrides = {
  MuiButton: {
    root: {
      fontSize: 16,
    },
    containedSizeLarge: {
      padding: "13px 22px",
      fontSize: 16,
    },
  },
  MuiTabs: {
    indicator: {
      display: "none",
    },
  },
  MuiTab: {
    textColorInherit: {
      color: textLighter,
      opacity: 1,
      fontWeight: 600,
      "&$selected": {
        color: textDark,
      },
      "&$disabled": {
        color: textDisabled,
      },
    },
  },
};
