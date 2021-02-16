import { Tooltip, TooltipProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import { TooltipIcon } from "../icons/RenIcons";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "inline-flex",
    fontSize: 13,
    color: theme.palette.grey[600],
    verticalAlign: "middle"
  },
}));

type TooltipWithIconProps = Omit<TooltipProps, "children">;

export const TooltipWithIcon: FunctionComponent<TooltipWithIconProps> = ({
  placement = "top-end",
  className,
  ...rest
}) => {
  const styles = useStyles();
  const resolvedClassName = classNames(styles.root, className);
  return (
    <Tooltip className={resolvedClassName} placement={placement} {...rest}>
      <span>
        <TooltipIcon fontSize="inherit" color="inherit" />
      </span>
    </Tooltip>
  );
};
