import { ComponentsProps } from "@material-ui/core/styles/props";
import React from "react";
import { SuccessIcon } from "../components/icons/RenIcons";

export const props: ComponentsProps = {
  MuiAlert: {
    iconMapping: {
      success: <SuccessIcon color="inherit" />,
    },
  },
  MuiButtonBase: {
    // The properties to apply
    disableRipple: true, // No more ripple, on the whole application 💣!
  },
  MuiIconButton: {
    size: "small",
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
} as ComponentsProps;
