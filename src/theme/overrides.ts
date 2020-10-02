import { Palette } from "@material-ui/core/styles/createPalette";
import { Overrides } from "@material-ui/core/styles/overrides";
import {
  alertError,
  alertErrorBackground,
  alertInfo,
  alertInfoBackground,
  alertSuccess,
  alertSuccessBackground,
  alertWarning,
  alertWarningBackground,
  textDark,
  textDisabled,
  textLighter,
} from "./colors";

export const overrides = (palette: Palette): Overrides =>
  ({
    MuiAlert: {
      action: {
        alignItems: "flex-start",
        paddingTop: 4,
      },
      standardSuccess: {
        color: alertSuccess,
        backgroundColor: alertSuccessBackground,
        boxShadow: `1px 1px 2px 0 ${alertSuccessBackground}`,
        "& $icon": {
          color: alertSuccess,
        },
      },
      standardInfo: {
        color: alertInfo,
        backgroundColor: alertInfoBackground,
        boxShadow: `1px 1px 2px 0 ${alertInfoBackground}`,
        "& $icon": {
          color: alertInfo,
        },
      },
      standardWarning: {
        color: alertWarning,
        backgroundColor: alertWarningBackground,
        boxShadow: `1px 1px 2px 0 ${alertWarningBackground}`,
        "& $icon": {
          color: alertWarning,
        },
      },
      standardError: {
        color: alertError,
        backgroundColor: alertErrorBackground,
        boxShadow: `1px 1px 2px 0 ${alertErrorBackground}`,
        "& $icon": {
          color: alertError,
        },
      },
    },
    MuiButton: {
      root: {
        fontSize: 16,
      },
      containedSizeLarge: {
        padding: "13px 22px",
        fontSize: 16,
      },
    },
    MuiDrawer: {
      paper: {
        padding: 20,
      },
      paperAnchorRight: {
        borderBottomLeftRadius: 20,
        borderTopLeftRadius: 20,
      },
    },
    MuiPaper: {
      elevation1: {
        boxShadow: "0px 1px 20px rgba(0, 27, 58, 0.05)",
      },
      elevation8: {
        boxShadow: "0px 1px 20px rgba(0, 27, 58, 0.05)",
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
  } as Overrides);
