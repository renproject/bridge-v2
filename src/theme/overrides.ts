import { Palette } from "@material-ui/core/styles/createPalette";
import { Overrides } from "@material-ui/core/styles/overrides";
import { textDark, textDisabled, textLighter } from "./colors";

export const overrides = (palette: Palette): Overrides => ({
  MuiButton: {
    root: {
      fontSize: 16,
    },
    containedSizeLarge: {
      padding: "13px 22px",
      fontSize: 16,
    },
  },
  MuiSelect: {
    root: {
      padding: `13px 20px`,
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
        fontWeight: 500,
      },
      "&$disabled": {
        color: textDisabled,
      },
    },
  },
  MuiTooltip: {
    arrow: {
      color: palette.common.black,
    },
    tooltip: {
      borderRadius: 4,
      textAlign: "center",
      backgroundColor: palette.common.black,
    },
  },
});
