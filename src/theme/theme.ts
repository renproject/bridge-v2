import { createMuiTheme, responsiveFontSizes } from "@material-ui/core";
import { Shadows } from "@material-ui/core/styles/shadows";
import { overrides } from "./overrides";
import { palette } from "./palette";
import { props } from "./props";
import { shape } from "./shape";
import { typography } from "./typography";

const themeInvariant = {
  props,
  overrides,
  typography,
  shape,
  shadows: Array(25).fill("none") as Shadows,
};

export const lightTheme = responsiveFontSizes(
  createMuiTheme({
    palette: {
      type: "light",
      ...palette,
    },
    ...themeInvariant,
  })
);

export const darkTheme = responsiveFontSizes(
  createMuiTheme({
    palette: {
      type: "dark",
      ...palette,
    },
    ...themeInvariant,
  })
);
