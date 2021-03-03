import {
  ButtonBase,
  ButtonProps,
  fade,
  makeStyles,
  styled,
  Theme,
  useTheme,
} from '@material-ui/core'
import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupProps,
  ToggleButtonProps,
} from '@material-ui/lab'
import classNames from 'classnames'
import React, { FunctionComponent, useCallback, useState } from 'react'
import {
  BitcoinIcon,
  NavigateNextIcon,
  NavigatePrevIcon,
  QrCodeIcon,
} from '../../../components/icons/RenIcons'
import { ProgressWithContent } from '../../../components/progress/ProgressHelpers'

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

type CircledIconContainerProps = {
  background?: string;
  color?: string;
  opacity?: number;
  size?: number;
  className?: string;
};

const useCircledIconContainerStyles = makeStyles<
  Theme,
  CircledIconContainerProps
>((theme) => ({
  root: {
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: ({ size }) => size,
    width: ({ size }) => size,
    backgroundColor: ({ background = theme.palette.grey[400], opacity = 1 }) =>
      opacity !== 1 ? fade(background, opacity) : background,
    color: ({ color = "inherit" }) => color,
  },
}));

export const CircledIconContainer: FunctionComponent<CircledIconContainerProps> = ({
  background,
  color,
  size = 54,
  opacity,
  children,
}) => {
  const styles = useCircledIconContainerStyles({
    size,
    background,
    color,
    opacity,
  });

  return <div className={styles.root}>{children}</div>;
};

const useDepositToggleButtonStyles = makeStyles({
  root: {
    padding: `2px 15px 2px 15px`,
    "&:first-child": {
      paddingLeft: 2,
    },
    "&:last-child": {
      paddingRight: 2,
    },
  },
});

export const DepositToggleButton: FunctionComponent<ToggleButtonProps> = ({
  value,
  className,
  ...rest
}) => {
  const styles = useDepositToggleButtonStyles();
  return (
    <ToggleButton
      className={classNames(styles.root, className)}
      value={value}
      {...rest}
    />
  );
};

export const DepositIndicator: FunctionComponent = () => {
  const theme = useTheme();
  return (
    <CircledIconContainer
      size={42}
      background={theme.palette.common.black}
      color={theme.palette.grey[200]}
    >
      <QrCodeIcon fontSize="large" color="inherit" />
    </CircledIconContainer>
  );
};
export const DepositToggleButtonGroup: FunctionComponent<ToggleButtonGroupProps> = ({
  exclusive = true,
  size = "large",
  ...props
}) => {
  const [value, setValue] = useState("");
  const handleValueChange = useCallback(
    (event: React.MouseEvent<HTMLElement>, newValue: string) => {
      setValue(newValue);
    },
    []
  );
  const theme = useTheme();
  return (
    <ToggleButtonGroup
      exclusive={exclusive}
      size={size}
      onChange={handleValueChange}
      value={value}
      {...props}
    >
      <DepositToggleButton value="deposit">
        <CircledIconContainer>
          <DepositIndicator />
        </CircledIconContainer>
      </DepositToggleButton>
      <DepositToggleButton value="btc">
        <CircledIconContainer
          background={theme.customColors.orange}
          opacity={0.1}
        >
          <ProgressWithContent
            color={theme.customColors.orange}
            confirmations={2}
            targetConfirmations={6}
            size={42}
          >
            <BitcoinIcon fontSize="large" />
          </ProgressWithContent>
        </CircledIconContainer>
      </DepositToggleButton>
      <DepositToggleButton value="done">
        <CircledIconContainer
          background={theme.customColors.blue}
          opacity={0.1}
        >
          <ProgressWithContent
            color={theme.customColors.blue}
            confirmations={6}
            targetConfirmations={6}
            size={42}
          >
            <BitcoinIcon fontSize="large" />
          </ProgressWithContent>
        </CircledIconContainer>
      </DepositToggleButton>
    </ToggleButtonGroup>
  );
};
