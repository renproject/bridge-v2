import createPalette, { Palette } from '@material-ui/core/styles/createPalette'
import {
  blue,
  blueDark,
  blueLight,
  graphite,
  graphiteDark,
  graphiteLight,
  strokeDefault,
  textDark,
  textDisabled,
  textLighter,
  white,
} from './colors'

const basePalette = {
  primary: {
    light: blueLight,
    main: blue,
    dark: blueDark,
    contrastText: white,
  },
  secondary: {
    light: graphiteLight,
    main: graphite,
    dark: graphiteDark,
    contrastText: white,
  },
  text: {
    primary: textDark,
    secondary: textLighter,
    disabled: textDisabled,
    hint: textDisabled,
  },
  divider: strokeDefault,
  error: {
    light: "#e57373",
    main: "#f44336",
    dark: "#d32f2f",
    contrastText: "#fff",
  },
  warning: {
    light: "#ffb74d",
    main: "#ff9800",
    dark: "#f57c00",
    contrastText: "rgba(0, 0, 0, 0.87)",
  },
  info: {
    light: "#64b5f6",
    main: "#2196f3",
    dark: "#1976d2",
    contrastText: "#fff",
  },
  success: {
    light: "#81c784",
    main: "#4caf50",
    dark: "#388e3c",
    contrastText: "rgba(0, 0, 0, 0.87)",
  },
  grey: {
    // "300": grayLight,
    "600": "#737478",
    "700": "#61616A"
  },
};

export const lightPalette: Palette = createPalette({
  type: "light",
  ...basePalette,
});

export const darkPalette: Palette = createPalette({
  type: "dark",
  ...basePalette,
});
