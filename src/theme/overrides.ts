import { fade } from "@material-ui/core";
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
  grayPlaceholder,
  textDark,
  textDisabled,
  textLighter,
} from "./colors";

export const overrides = (palette: Palette): Overrides => {
  const placeholder = {
    color: grayPlaceholder,
  };

  return {
    MuiAlert: {
      action: {
        alignItems: "flex-start",
        paddingTop: 4,
      },
      standardSuccess: {
        color: alertSuccess,
        backgroundColor: alertSuccessBackground,
        boxShadow: `1px 1px 2px 0 ${fade(alertSuccess, 0.15)}`,
        "& $icon": {
          color: alertSuccess,
        },
      },
      standardInfo: {
        color: alertInfo,
        backgroundColor: alertInfoBackground,
        boxShadow: `1px 1px 2px 0 ${fade(alertInfo, 0.15)}`,
        "& $icon": {
          color: alertInfo,
        },
      },
      standardWarning: {
        color: alertWarning,
        backgroundColor: alertWarningBackground,
        boxShadow: `1px 1px 2px 0 ${fade(alertWarning, 0.15)}`,
        "& $icon": {
          color: alertWarning,
        },
      },
      standardError: {
        color: alertError,
        backgroundColor: alertErrorBackground,
        boxShadow: `1px 1px 2px 0 ${fade(alertError, 0.15)}`,
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
    MuiInputBase: {
      input: {
        "&::-webkit-input-placeholder": placeholder,
        "&::-moz-placeholder": placeholder, // Firefox 19+
        "&:-ms-input-placeholder": placeholder, // IE 11
        "&::-ms-input-placeholder": placeholder, // Edge
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
    MuiSvgIcon: {
      root: {
        pointerEvents: "none",
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
  } as Overrides;
};
