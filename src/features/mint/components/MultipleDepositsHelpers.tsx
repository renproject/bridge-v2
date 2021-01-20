import { ButtonBase, ButtonProps, makeStyles, styled } from "@material-ui/core";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import {
  NavigatePrevIcon,
  NavigateNextIcon,
} from "../../../components/icons/RenIcons";

const useBigNavButtonStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.primary.main,
    fontSize: 90,
    transition: "all 1s",
    display: "inline-flex",
    cursor: "pointer",
    "&:hover": {
      color: theme.palette.primary.dark,
    },
  },
  disabled: {
    opacity: 0.2,
    cursor: "default",
  },
  hidden: {
    display: "none",
    opacity: 0,
  },
}));

type BigNavButtonProps = ButtonProps & {
  direction: "next" | "prev";
};
export const BigNavButton: FunctionComponent<BigNavButtonProps> = ({
  direction,
  disabled,
  hidden,
  className,
  onClick,
}) => {
  const styles = useBigNavButtonStyles();
  const rootClassName = classNames(styles.root, className, {
    [styles.disabled]: disabled,
    [styles.hidden]: hidden,
  });
  const Icon = direction === "prev" ? NavigatePrevIcon : NavigateNextIcon;
  return (
    <ButtonBase className={rootClassName} disabled={disabled} onClick={onClick}>
      <Icon fontSize="inherit" />
    </ButtonBase>
  );
};

export const BigPrevButton: FunctionComponent<ButtonProps> = (props) => (
  <BigNavButton direction="prev" {...props} />
);

export const BigNextButton: FunctionComponent<ButtonProps> = (props) => (
  <BigNavButton direction="next" {...props} />
);

const offsetTop = 38;
const offsetHorizontal = -42;
export const DepositPrevButton = styled(BigPrevButton)({
  position: "absolute",
  top: offsetTop,
  left: offsetHorizontal,
});

export const DepositNextButton = styled(BigNextButton)({
  position: "absolute",
  top: offsetTop,
  right: offsetHorizontal,
});
