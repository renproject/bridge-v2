import { createMuiTheme, responsiveFontSizes } from "@material-ui/core";
import { Palette } from "@material-ui/core/styles/createPalette";
// import { Shadows } from "@material-ui/core/styles/shadows";
import { overrides } from "./overrides";
import { darkPalette, lightPalette } from "./palette";
import { props } from "./props";
import { shape } from "./shape";
import { typography } from "./typography";

const baseTheme = (palette: Palette) => ({
  props,
  overrides: overrides(palette),
  typography,
  shape,
  // shadows: Array(25).fill("none") as Shadows,
});

export const lightTheme = responsiveFontSizes(
  createMuiTheme({
    palette: lightPalette,
    ...baseTheme(lightPalette),
  })
);

export const darkTheme = responsiveFontSizes(
  createMuiTheme({
    palette: darkPalette,
    ...baseTheme(darkPalette),
  })
);
