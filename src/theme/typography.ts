import { TypographyOptions } from "@material-ui/core/styles/createTypography";

export const typography: TypographyOptions = {
  // fontSize: 12,
  fontFamily: ["SuisseIntl", "Helvetica", "Arial", "sans-serif"].join(),
  button: {
    textTransform: "none",
  },
  h1: {
    fontSize: 48,
    fontWeight: "bold"
  },
  h6: {
    fontSize: 18
  }
};
