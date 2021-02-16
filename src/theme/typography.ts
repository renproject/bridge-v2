import { TypographyOptions } from "@material-ui/core/styles/createTypography";

export const typography: TypographyOptions = {
  // fontSize: 12,
  fontFamily: ["SuisseIntl", "Helvetica", "Arial", "sans-serif"].join(),
  button: {
    textTransform: "none",
  },
  h1: {
    fontSize: 48,
    fontWeight: "bold",
  },
  h5: {
    fontSize: 22,
  },
  h6: {
    fontSize: 18,
    lineHeight: 1.4,
  },
  subtitle2: {
    fontSize: 13,
  },
};
