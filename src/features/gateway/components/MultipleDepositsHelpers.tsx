import {
  Box,
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
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { GatewayIcon } from "../../../components/icons/RenIcons";
import { depositNavigationBreakpoint } from "../../../components/layout/Paper";
import {
  ProgressWithContent,
  ProgressWithContentProps,
  PulseIndicator,
} from "../../../components/progress/ProgressHelpers";
import { getRemainingTime } from "../../../utils/time";
import {
  HMSCountdown,
  ProgressStatus,
  ProgressStatusProps,
} from "../../transactions/components/TransactionsHelpers";
import { depositSorter } from "../mintHooks";
import { DepositNavigationButton } from "../steps/flows/MintStandard";

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

export const MoreInfo: FunctionComponent<MoreInfoProps> = ({
  gateway,
  children,
}) => {
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
                  <HMSCountdown milliseconds={getRemainingTime(expiryTime)} />
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

export const DepositToggleButton: FunctionComponent<
  DepositToggleButtonProps
> = ({ gateway, ...props }) => {
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

export const DepositLoaderStatus: FunctionComponent<ProgressStatusProps> = ({
  reason = "Loading Deposit...",
  processing,
}) => {
  return (
    <>
      <ProgressStatus reason={reason} processing={processing} />
      <Box mb={2} display="flex" justifyContent="center">
        <Skeleton width={200} />
      </Box>
      <Box>
        <Skeleton width={320} height={72} />
      </Box>
      <Box>
        <Skeleton width={320} height={54} />
      </Box>
    </>
  );
};
