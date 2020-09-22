import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent } from "react";
import { Tooltip as MuiTooltip, TooltipProps } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
  },
}));

type RenTooltipProps = TooltipProps;
export const Tooltip: FunctionComponent<RenTooltipProps> = (props) => {
  const classes = useStyles();
  return <MuiTooltip arrow placement="top" classes={classes} {...props} />;
};
