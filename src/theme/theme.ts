import { createMuiTheme, responsiveFontSizes } from "@material-ui/core";
import { Shadows } from "@material-ui/core/styles/shadows";
import { overrides } from "./overrides";
import { palette } from "./palette";
import { props } from "./props";
import { shape } from "./shape";
import { typography } from './typography'

let theme = createMuiTheme({
  palette,
  props,
  overrides,
  typography,
  shape,
  shadows: Array(25).fill("none") as Shadows,
});

theme = responsiveFontSizes(theme);

export { theme };
