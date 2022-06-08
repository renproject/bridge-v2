import {
  ButtonBase,
  ClickAwayListener,
  Tooltip,
  TooltipProps,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import { TooltipIcon } from "../icons/RenIcons";

const useTooltipWithIconStyles = makeStyles((theme) => ({
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
  placement = "top",
  className,
  ...rest
}) => {
  const styles = useTooltipWithIconStyles();
  const resolvedClassName = classNames(styles.root, className);
  const [open, setOpen] = React.useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipToggle = (event: any) => {
    event.stopPropagation();
    setOpen((prevOpen) => !prevOpen);
    return false;
  };

  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <Tooltip
        title={title}
        className={resolvedClassName}
        placement={placement}
        PopperProps={{
          disablePortal: true,
        }}
        onClose={handleTooltipClose}
        open={open}
        disableFocusListener
        disableHoverListener
        disableTouchListener
      >
        <ButtonBase onClick={handleTooltipToggle}>
          <TooltipIcon fontSize="inherit" color="primary" />
        </ButtonBase>
      </Tooltip>
    </ClickAwayListener>
  );
};

type MessageWithTooltipProps = {
  message: string;
  tooltip: string;
};

export const MessageWithTooltip: FunctionComponent<MessageWithTooltipProps> = ({
  message = "",
  tooltip = "",
}) => {
  return (
    <span>
      {message} <TooltipWithIcon title={<span>{tooltip}</span>} />
    </span>
  );
};
