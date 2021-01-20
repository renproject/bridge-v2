import { ButtonProps, makeStyles, styled } from "@material-ui/core";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import {
  NavigatePrevIcon,
  NavigateNextIcon,
} from "../../../components/icons/RenIcons";

const useBigNavButtonStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.primary.main,
    fontSize: 140,
    transition: "all .4 ease-in",
    display: "inline-flex",
    border: "1px solid lightblue",
  },
  disabled: {
    opacity: 0.2,
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
  const Icon = direction === "next" ? NavigatePrevIcon : NavigateNextIcon;
  return (
    <div className={rootClassName} onClick={onClick as any}>
      <Icon fontSize="inherit" />
    </div>
  );
};

export const BigPrevButton: FunctionComponent<
  Omit<BigNavButtonProps, "direction">
> = (props) => <BigNavButton direction="prev" {...props} />;

export const BigNextButton: FunctionComponent<
  Omit<BigNavButtonProps, "direction">
> = (props) => <BigNavButton direction="next" {...props} />;

const offsetTop = 40;
const offsetHorizontal = -20;
export const DepositPrevButton = styled(BigPrevButton)({
  position: "absolute",
  top: offsetTop,
  right: offsetHorizontal,
});

export const DepositNextButton = styled(BigNextButton)({
  position: "absolute",
  top: offsetTop,
  left: offsetHorizontal,
});
