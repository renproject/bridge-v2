import { Palette } from "@material-ui/core/styles/createPalette";
import {
  blue,
  blueDark,
  blueLight, graphite, graphiteDark, graphiteLight, strokeDefault, textDark, textDisabled, textLighter, white,
} from './colors'

export const palette: Partial<Palette> = {
  type: "light",
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
    hint: textDisabled
  },
  divider: strokeDefault,
};
