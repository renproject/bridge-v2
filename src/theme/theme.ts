import { createTheme, responsiveFontSizes } from "@material-ui/core";
import { Palette } from "@material-ui/core/styles/createPalette";
import { Shadows } from "@material-ui/core/styles/shadows";
// import { Shadows } from "@material-ui/core/styles/shadows";
import { overrides } from "./overrides";
import { darkPalette, lightPalette } from "./palette";
import { props } from "./props";
import { shape, breakpoints } from "./other";
import { typography } from "./typography";
import * as customColors from "./colors";

const baseTheme = (palette: Palette) => ({
  breakpoints,
  props,
  overrides: overrides(palette),
  typography,
  shape,
  shadows: Array(25).fill("none") as Shadows,
});

declare module "@material-ui/core/styles" {
  interface Theme {
    customColors: typeof customColors;
  }
  // allow configuration using `createMuiTheme`
  interface ThemeOptions {
    customColors?: typeof customColors;
  }
}

export const lightTheme = responsiveFontSizes(
  createTheme({
    customColors,
    palette: lightPalette,
    ...baseTheme(lightPalette),
  })
);

export const darkTheme = responsiveFontSizes(
  createTheme({
    customColors,
    palette: darkPalette,
    ...baseTheme(darkPalette),
  })
);
