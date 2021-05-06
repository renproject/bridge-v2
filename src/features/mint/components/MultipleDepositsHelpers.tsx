import {
  ButtonBase,
  ButtonProps,
  lighten,
  makeStyles,
  styled,
  Theme,
  useTheme,
} from "@material-ui/core";
import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupProps,
  ToggleButtonProps,
} from "@material-ui/lab";
import { GatewaySession } from "@renproject/ren-tx";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import {
  CompletedIcon,
  EmptyIcon,
  GatewayIcon,
  NavigateNextIcon,
  NavigatePrevIcon,
} from "../../../components/icons/RenIcons";
import {
  ProgressWithContent,
  ProgressWithContentProps,
  PulseIndicator,
} from "../../../components/progress/ProgressHelpers";
import { BridgeChainConfig } from "../../../utils/assetConfigs";
import {
  DepositEntryStatus,
  DepositPhase,
} from "../../transactions/transactionsUtils";
import {
  depositSorter,
  getDepositParams,
  getLockAndMintBasicParams,
} from "../mintUtils";

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
      opacity !== 1 ? lighten(background, 1 - opacity) : background,
    color: ({ color = "inherit" }) => color,
  },
}));

export const CircledIconContainer: FunctionComponent<CircledIconContainerProps> = ({
  background,
  color,
  size = 54,
  opacity,
  className,
  children,
}) => {
  const styles = useCircledIconContainerStyles({
    size,
    background,
    color,
    opacity,
  });

  return <div className={classNames(styles.root, className)}>{children}</div>;
};

const useDepositToggleButtonStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.common.white,
    padding: `2px 15px 2px 15px`,
    "&:first-child": {
      paddingLeft: 2,
      marginRight: 1,
    },
    "&:last-child": {
      paddingRight: 2,
    },
  },
}));

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
      <GatewayIcon fontSize="large" color="inherit" />
    </CircledIconContainer>
  );
};

const useCircledProgressWithContentStyles = makeStyles({
  container: {
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: "8%",
    right: "8%",
  },
});

type CircledProgressWithContentProps = ProgressWithContentProps & {
  indicator?: boolean;
};

export const CircledProgressWithContent: FunctionComponent<CircledProgressWithContentProps> = ({
  color,
  size = 42,
  indicator = false,
  ...rest
}) => {
  const styles = useCircledProgressWithContentStyles();
  return (
    <CircledIconContainer
      background={color}
      opacity={0.1}
      size={Math.floor(1.28 * size)}
      className={styles.container}
    >
      <ProgressWithContent color={color} size={size} {...rest} />
      {indicator && <PulseIndicator className={styles.indicator} pulsing />}
    </CircledIconContainer>
  );
};

const useDepositNavigationStyles = makeStyles({
  root: {
    position: "absolute",
    left: 0,
    right: 0,
    top: -152,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

type DepositNavigationProps = ToggleButtonGroupProps & {
  tx: GatewaySession<any>;
};

export const DepositNavigation: FunctionComponent<DepositNavigationProps> = ({
  value,
  onChange,
  tx,
}) => {
  const styles = useDepositNavigationStyles();
  const theme = useTheme();
  const sortedDeposits = Object.values(tx.transactions).sort(depositSorter);

  const {
    lockChainConfig,
    mintChainConfig,
    lockCurrencyConfig,
  } = getLockAndMintBasicParams(tx);

  return (
    <div className={styles.root}>
      <ToggleButtonGroup
        exclusive
        size="large"
        onChange={onChange}
        value={value}
      >
        <DepositToggleButton value="gateway">
          <CircledIconContainer>
            <DepositIndicator />
          </CircledIconContainer>
        </DepositToggleButton>
        {sortedDeposits.map((deposit) => {
          const hash = deposit.sourceTxHash;
          const {
            lockConfirmations,
            lockTargetConfirmations,
            depositStatus,
            depositPhase,
          } = getDepositParams(tx, deposit);
          const StatusIcon = getDepositStatusIcon({
            depositStatus,
            depositPhase,
            mintChainConfig,
            lockChainConfig,
          });
          const isProcessing = depositPhase === DepositPhase.NONE;
          const requiresAction =
            depositStatus === DepositEntryStatus.ACTION_REQUIRED;
          const completed = depositStatus === DepositEntryStatus.COMPLETED;
          const confirmationProps = completed
            ? {}
            : {
                confirmations: lockConfirmations,
                targetConfirmations: lockTargetConfirmations,
              };
          return (
            <DepositToggleButton key={hash} value={hash}>
              <CircledProgressWithContent
                color={
                  completed ? theme.customColors.blue : lockCurrencyConfig.color
                }
                {...confirmationProps}
                processing={isProcessing}
                indicator={requiresAction}
              >
                <StatusIcon fontSize="large" />
              </CircledProgressWithContent>
            </DepositToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </div>
  );
};

type GetDepositStatusIconFnParams = {
  depositStatus: DepositEntryStatus;
  depositPhase: DepositPhase;
  lockChainConfig: BridgeChainConfig;
  mintChainConfig: BridgeChainConfig;
};

export const getDepositStatusIcon = ({
  depositStatus,
  depositPhase,
  lockChainConfig,
  mintChainConfig,
}: GetDepositStatusIconFnParams) => {
  let StatusIcon = EmptyIcon;
  if (depositStatus === DepositEntryStatus.COMPLETED) {
    StatusIcon = CompletedIcon;
  } else if (depositPhase === DepositPhase.LOCK) {
    StatusIcon = lockChainConfig.Icon;
  } else if (depositPhase === DepositPhase.MINT) {
    StatusIcon = mintChainConfig.Icon;
  }
  return StatusIcon;
};
