import { ComponentsProps } from "@material-ui/core/styles/props";

export const props: ComponentsProps = {
  MuiButtonBase: {
    // The properties to apply
    disableRipple: true, // No more ripple, on the whole application 💣!
  },
  MuiIconButton: {
    size: 'small'
  },
  MuiTextField: {
    autoComplete: "off",
    fullWidth: true,
  },
  MuiTooltip: {
    arrow: true,
    placement: "top-start",
  },
  MuiLink: {
    color: "inherit",
    underline: "always",
  },
};
