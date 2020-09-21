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
    root: {
      fontSize: 16,
    },
    textColorInherit: {
      color: textLighter,
      opacity: 1,
      "&$selected": {
        color: textDark,
        fontWeight: 600
      },
      "&$disabled": {
        color: textDisabled,
      },
    },
  },
};
