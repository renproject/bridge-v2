import { ComponentsProps } from "@material-ui/core/styles/props";
import React from "react";
import { SuccessIcon } from "../components/icons/RenIcons";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";

export const props: ComponentsProps = {
  MuiAlert: {
    iconMapping: {
      success: <SuccessIcon color="inherit" />,
    },
  },
  MuiCheckbox: {
    icon: <CheckBoxOutlineBlankIcon fontSize="small" />,
    checkedIcon: <CheckBoxIcon fontSize="small" />,
  },
  MuiInput: {
    disableUnderline: true,
  },
  MuiButtonBase: {
    // The properties to apply
    disableRipple: true, // No more ripple, on the whole application 💣!
  },
  MuiIconButton: {
    size: "small",
  },
  MuiInputLabel: {
    shrink: true,
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
