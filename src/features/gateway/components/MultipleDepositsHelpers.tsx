import {
  Fade,
  lighten,
  Typography,
  useMediaQuery,
  useTheme,
  withStyles,
} from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import {
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupProps,
  ToggleButtonProps,
} from "@material-ui/lab";
import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import BigNumber from "bignumber.js";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import {
  CompletedIcon,
  EmptyIcon,
  GatewayIcon,
} from "../../../components/icons/RenIcons";
import { depositNavigationBreakpoint } from "../../../components/layout/Paper";
import {
  ProgressWithContent,
  ProgressWithContentProps,
  PulseIndicator,
} from "../../../components/progress/ProgressHelpers";
import { Debug } from "../../../components/utils/Debug";
import { ChainConfig, getChainConfig } from "../../../utils/chainsConfig";
import { getAssetConfig } from "../../../utils/tokensConfig";
import { HMSCountdown } from "../../transactions/components/TransactionsHelpers";
import { useChainAssetDecimals } from "../gatewayHooks";
import { getRemainingGatewayTime } from "../gatewayUtils";
import { depositSorter, useDepositTransactionMeta } from "../mintHooks";

export enum DepositPhase {
  LOCK = "lock",
  MINT = "mint",
  NONE = "",
}

export enum DepositEntryStatus {
  PENDING = "pending",
  ACTION_REQUIRED = "action_required",
  COMPLETING = "completing",
  COMPLETED = "completed",
  EXPIRED = "expired",
}

type GetDepositStatusIconFnParams = {
  depositStatus: DepositEntryStatus;
  depositPhase: DepositPhase;
  lockChainConfig: ChainConfig;
  mintChainConfig: ChainConfig;
};

const transition = "all 1s ease-out, border 0.5s ease-out";

const StyledToggleButtonGroup = withStyles((theme) => ({
  root: {
    transition,
    [theme.breakpoints.up(depositNavigationBreakpoint)]: {
      background: theme.customColors.whiteDarker,
      borderRadius: 20,
    },
  },
  grouped: {
    transition,
    [theme.breakpoints.up(depositNavigationBreakpoint)]: {
      border: "none",
      "&:first-child": {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      },
      "&:only-child": {
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
      },
      "&:not(:first-child)": {
        borderRadius: 46,
        marginLeft: 12,
        marginRight: 12,
        marginTop: 12,
      },
      "&:last-child:not(:only-child)": {
        marginBottom: 12,
      },
    },
  },
}))(ToggleButtonGroup);

const useResponsiveDepositNavigationStyles = makeStyles((theme) => ({
  root: {
    transition,
    position: "absolute",
    left: 0,
    right: 0,
    top: -152,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    [theme.breakpoints.up(depositNavigationBreakpoint)]: {
      display: "block",
      top: -72,
      left: 390,
    },
  },
}));

const useMoreInfoStyles = makeStyles((theme) => ({
  root: {
    display: "none",
    marginLeft: 12,
    [theme.breakpoints.up(depositNavigationBreakpoint)]: {
      display: "flex",
    },
  },
  gateway: {
    marginLeft: 23,
  },
}));

type MoreInfoProps = {
  gateway?: boolean;
};

const MoreInfo: FunctionComponent<MoreInfoProps> = ({ gateway, children }) => {
  const styles = useMoreInfoStyles();
  const className = classNames(styles.root, {
    [styles.gateway]: gateway,
  });
  return <div className={className}>{children}</div>;
};

type DepositNavigationProps = ToggleButtonGroupProps & {
  gateway: Gateway;
  transactions: Array<GatewayTransaction>;
  expiryTime: number;
};
export const DepositNavigationResolver: FunctionComponent<
  DepositNavigationProps
> = (props) => {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  return (
    <Fade in={desktop}>
      <ResponsiveDepositNavigation {...props} />
    </Fade>
  );
};

type DepositNavigationToggleButton = ToggleButtonProps & {
  gateway: Gateway;
  transaction: GatewayTransaction;
};

const DepositNavigationButton: FunctionComponent<
  DepositNavigationToggleButton
> = ({ transaction, gateway, ...rest }) => {
  const { t } = useTranslation();
  const { decimals: lockAssetDecimals } = useChainAssetDecimals(
    gateway.fromChain,
    gateway.params.asset
  );

  const lockAssetConfig = getAssetConfig(transaction.params.asset);
  // const lockChainConfig = getChainConfig(transaction.fromChain.chain);
  // const mintChainConfig = getChainConfig(transaction.toChain.chain);

  // TODO: crit finish
  const txMeta = useDepositTransactionMeta(transaction);
  const { lockConfirmations, lockAmount, lockTargetConfirmations } = txMeta;

  const lockTxAmount =
    lockAssetDecimals !== null && lockAmount !== null
      ? new BigNumber(lockAmount).shiftedBy(-lockAssetDecimals).toString()
      : null;
  //TODO: remove

  let Content: any = null;
  let Progress: any = null;

  const { lockStatus, mintStatus } = txMeta;
  // const lockStatus = ChainTransactionStatus.Confirming;
  // const mintStatus = null;

  if (lockStatus !== ChainTransactionStatus.Done) {
    switch (lockStatus) {
      case ChainTransactionStatus.Confirming:
        const Icon = lockAssetConfig.Icon;
        Progress = (
          <CircledProgressWithContent
            color={lockAssetConfig.color}
            confirmations={
              lockConfirmations !== null ? lockConfirmations : undefined
            }
            targetConfirmations={
              lockTargetConfirmations !== null
                ? lockTargetConfirmations
                : undefined
            }
          >
            <Icon fontSize="large" />
          </CircledProgressWithContent>
        );
        Content = (
          <div>
            <Typography variant="body1" color="textPrimary">
              {lockTxAmount} {lockAssetConfig.shortName}
            </Typography>
            {lockTargetConfirmations !== 0 ? (
              <Typography variant="body2" color="textSecondary">
                {t("mint.deposit-navigation-confirmations-label", {
                  confirmations: lockConfirmations,
                  targetConfirmations: lockTargetConfirmations,
                })}
              </Typography>
            ) : (
              <Skeleton variant="text" width={100} height={14} />
            )}
          </div>
        );
    }
  } else if (
    mintStatus === null &&
    lockStatus === ChainTransactionStatus.Done
  ) {
    const Icon = lockAssetConfig.Icon;
    Progress = (
      <CircledProgressWithContent
        color={lockAssetConfig.color}
        confirmations={lockConfirmations || undefined}
        targetConfirmations={lockTargetConfirmations || undefined}
        indicator={true}
      >
        <Icon fontSize="large" />
      </CircledProgressWithContent>
    );
    Content = (
      <div>
        <Typography variant="body1" color="textPrimary">
          {lockTxAmount !== null ? (
            lockTxAmount
          ) : (
            <Skeleton variant="text" width={70} height={14} />
          )}{" "}
          {lockAssetConfig.shortName}
        </Typography>
        <Typography variant="body2" color="primary">
          {t("mint.deposit-navigation-ready-to-mint-label")}
        </Typography>
      </div>
    );
  } else {
    switch (mintStatus) {
      case ChainTransactionStatus.Done:
        Progress = (
          <CircledProgressWithContent>
            <CompletedIcon fontSize="large" />
          </CircledProgressWithContent>
        );
        Content = (
          <div>
            <Typography variant="body1" color="textPrimary">
              {lockTxAmount} {lockAssetConfig.shortName}
            </Typography>
            <Typography variant="body2" color="primary">
              {t("mint.deposit-navigation-completed-label")}
            </Typography>
          </div>
        );
    }
  }

  return (
    <DepositToggleButton {...rest}>
      {Progress}
      <MoreInfo>{Content}</MoreInfo>
      <Debug it={txMeta} />
    </DepositToggleButton>
  );
};

export const ResponsiveDepositNavigation: FunctionComponent<
  DepositNavigationProps
> = ({ value, onChange, gateway, transactions, expiryTime }) => {
  const { t } = useTranslation();
  const styles = useResponsiveDepositNavigationStyles();
  const theme = useTheme();
  const mobile = !useMediaQuery(
    theme.breakpoints.up(depositNavigationBreakpoint)
  );
  const sortedTransactions = transactions.sort(depositSorter);
  return (
    <div className={styles.root}>
      <StyledToggleButtonGroup
        exclusive
        size="large"
        onChange={onChange}
        value={value}
        orientation={mobile ? "horizontal" : "vertical"}
      >
        <DepositToggleButton gateway value="gateway">
          <CircledIconContainer>
            <DepositIndicator />
          </CircledIconContainer>
          <MoreInfo gateway>
            <div>
              <Typography variant="body1" color="textPrimary">
                {t("mint.deposit-navigation-gateway-address-label")}
              </Typography>
              <Typography variant="body2">
                {t("mint.deposit-navigation-active-for-label")}:{" "}
                <Typography variant="body2" component="span" color="primary">
                  <HMSCountdown
                    milliseconds={getRemainingGatewayTime(expiryTime)}
                  />
                </Typography>
              </Typography>
            </div>
          </MoreInfo>
        </DepositToggleButton>
        {sortedTransactions.map((transaction) => (
          <DepositNavigationButton
            key={transaction.hash}
            value={transaction.hash}
            transaction={transaction}
            gateway={gateway}
          />
        ))}
      </StyledToggleButtonGroup>
    </div>
  );
};

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

export const CircledIconContainer: FunctionComponent<
  CircledIconContainerProps
> = ({ background, color, size = 54, opacity, className, children }) => {
  const styles = useCircledIconContainerStyles({
    size,
    background,
    color,
    opacity,
  });

  return <div className={classNames(styles.root, className)}>{children}</div>;
};

export const useDepositToggleButtonStyles = makeStyles<
  Theme,
  DepositToggleButtonProps
>((theme) => ({
  root: {
    transition,
    background: theme.palette.common.white,
    padding: `2px 15px 2px 15px`,
    [theme.breakpoints.up(depositNavigationBreakpoint)]: {
      padding: 12,
      minWidth: 240,
      textAlign: "left",
      boxShadow: `0px 1px 3px rgba(0, 27, 58, 0.05)`,
      border: `2px solid ${theme.palette.common.white}!important`,
      "&:hover": {
        background: theme.palette.common.white,
        border: (props) =>
          props.gateway
            ? "2px solid transparent"
            : `2px solid ${theme.palette.primary.main}!important`,
      },
    },
    [theme.breakpoints.up("lg")]: {
      minWidth: 280,
    },
    "&:first-child": {
      paddingLeft: 2,
      marginRight: 1,
      [theme.breakpoints.up(depositNavigationBreakpoint)]: {
        paddingLeft: 12,
        marginRight: 0,
      },
    },
    "&:last-child": {
      paddingRight: 2,
      [theme.breakpoints.up(depositNavigationBreakpoint)]: {
        paddingRight: 12,
      },
    },
  },
  selected: {
    [theme.breakpoints.up(depositNavigationBreakpoint)]: {
      background: `${theme.palette.common.white}!important`,
      border: (props) =>
        props.gateway
          ? "2px solid transparent"
          : `2px solid ${theme.palette.primary.main}!important`,
    },
  },
  label: {
    [theme.breakpoints.up(depositNavigationBreakpoint)]: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
    },
  },
}));

type DepositToggleButtonProps = ToggleButtonProps & {
  gateway?: boolean;
};

const DepositToggleButton: FunctionComponent<DepositToggleButtonProps> = ({
  gateway,
  ...props
}) => {
  const classes = useDepositToggleButtonStyles({ gateway });
  return <ToggleButton classes={classes} {...props} />;
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

export const CircledProgressWithContent: FunctionComponent<
  CircledProgressWithContentProps
> = ({ color, size = 42, indicator = false, ...rest }) => {
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
