import { createMuiTheme, responsiveFontSizes } from "@material-ui/core";
import { Shadows } from "@material-ui/core/styles/shadows";
import { overrides } from "./overrides";
import { palette } from "./palette";
import { props } from "./props";
import { shape } from "./shape";

let theme = createMuiTheme({
  palette,
  props,
  overrides,
  shape,
  shadows: Array(25).fill("none") as Shadows,
});

theme = responsiveFontSizes(theme);

export { theme };
