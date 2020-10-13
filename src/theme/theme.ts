import { createMuiTheme, responsiveFontSizes } from "@material-ui/core";
import { Palette } from "@material-ui/core/styles/createPalette";
import { Shadows } from "@material-ui/core/styles/shadows";
// import { Shadows } from "@material-ui/core/styles/shadows";
import { overrides } from "./overrides";
import { darkPalette, lightPalette } from "./palette";
import { props } from "./props";
import { shape } from "./shape";
import { typography } from "./typography";
import * as customColors from "./colors";

const baseTheme = (palette: Palette) => ({
  props,
  overrides: overrides(palette),
  typography,
  shape,
  shadows: Array(25).fill("none") as Shadows,
});

declare module "@material-ui/core/styles/createMuiTheme" {
  interface Theme {
    customColors: typeof customColors;
  }
  // allow configuration using `createMuiTheme`
  interface ThemeOptions {
    customColors?: typeof customColors;
  }
}

export const lightTheme = responsiveFontSizes(
  createMuiTheme({
    customColors,
    palette: lightPalette,
    ...baseTheme(lightPalette),
  })
);

export const darkTheme = responsiveFontSizes(
  createMuiTheme({
    customColors,
    palette: darkPalette,
    ...baseTheme(darkPalette),
  })
);
