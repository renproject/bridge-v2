import { Palette } from "@material-ui/core/styles/createPalette";
import {
  blue,
  blueDark,
  blueLight,
  grey,
  greyContrastText,
  greyDark,
  greyLight,
  white,
} from "./colors";

export const palette: Partial<Palette> = {
  type: "light",
  primary: {
    light: blueLight,
    main: blue,
    dark: blueDark,
    contrastText: white,
  },
  secondary: {
    light: greyLight,
    main: grey,
    dark: greyDark,
    contrastText: greyContrastText,
  },
  divider: "#DBE0E8",
};
