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
    verticalAlign: "middle",
    marginTop: -2,
  },
}));

type TooltipWithIconProps = Omit<TooltipProps, "children"> & {
  title: TooltipProps["title"] | any;
};

export const TooltipWithIcon: FunctionComponent<TooltipWithIconProps> = ({
  title,
  placement = "top-end",
  className,
  ...rest
}) => {
  const styles = useStyles();
  const resolvedClassName = classNames(styles.root, className);
  return (
    <Tooltip
      title={title}
      className={resolvedClassName}
      placement={placement}
      {...rest}
    >
      <span>
        <TooltipIcon fontSize="inherit" color="inherit" />
      </span>
    </Tooltip>
  );
};
