import { Button, ButtonProps, Typography, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import { WalletPickerProps } from "@renproject/multiwallet-ui";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import { useTimeout } from "react-use";
import { defaultShadow } from "../../theme/other";
import { createPulseAnimation } from "../../theme/themeUtils";
import {
  BridgeChainConfig,
  BridgeWallet,
  BridgeWalletConfig,
  getChainConfigByRentxName,
  getNetworkConfigByRentxName,
  getWalletConfig,
  getWalletConfigByRentxName,
} from "../../utils/assetConfigs";
import { trimAddress } from "../../utils/strings";
import { WalletIcon } from "../icons/RenIcons";
import { PaperContent } from "../layout/Paper";
import { BridgeModalTitle } from "../modals/BridgeModal";
import {
  ProgressWithContent,
  ProgressWrapper,
} from "../progress/ProgressHelpers";
import { Debug } from "../utils/Debug";
import { WalletConnectionStatusType, WalletStatus } from "../utils/types";

export const useWalletPickerStyles = makeStyles((theme) => ({
  root: {
    width: 400,
    minHeight: 441,
  },
  body: {
    padding: 24,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "stretch",
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: `16px 16px 14px`,
  },
  headerTitle: {
    flexGrow: 2,
    paddingLeft: 16,
    textAlign: "center",
    lineHeight: 2,
  },
  headerCloseIcon: {
    fontSize: 16,
  },
  button: {
    border: `1px solid ${theme.palette.divider}`,
  },
  chainTitle: {
    textTransform: "capitalize",
    fontSize: 14,
  },
}));

const useWalletEntryButtonStyles = makeStyles({
  root: {
    marginTop: 20,
    fontSize: 16,
    padding: "11px 20px 11px 20px",
  },
  label: {
    display: "flex",
    justifyContent: "space-between",
    alignContent: "center",
  },
  icon: {
    fontSize: 36,
    display: "inline-flex",
  },
});

export const WalletEntryButton: WalletPickerProps<
  any,
  any
>["WalletEntryButton"] = ({ onClick, name, logo }) => {
  const { icon: iconClassName, ...classes } = useWalletEntryButtonStyles();
  const walletConfig = getWalletConfigByRentxName(name);
  const { MainIcon } = walletConfig;
  return (
    <Button
      classes={classes}
      variant="outlined"
      size="large"
      fullWidth
      onClick={onClick}
    >
      <span>{walletConfig.full}</span>{" "}
      <span className={iconClassName}>
        <MainIcon fontSize="inherit" />
      </span>
    </Button>
  );
};

const getLabels = (
  chainConfig: BridgeChainConfig,
  walletConfig: BridgeWalletConfig
) => {
  return {
    initialTitle: "Connecting",
    actionTitle: `${walletConfig.short} action required`,
    initialMessage: `Connecting to ${chainConfig.full}`,
    actionMessage: `When prompted, connect securely via the ${walletConfig.full} browser extension.`,
  };
};

export const WalletConnectingInfo: WalletPickerProps<
  any,
  any
>["ConnectingInfo"] = ({ chain, onClose }) => {
  const theme = useTheme();
  const chainConfig = getChainConfigByRentxName(chain);

  // TODO: There should be better mapping.
  const walletSymbol =
    chain === "ethereum" ? BridgeWallet.METAMASKW : BridgeWallet.BINANCESMARTW;
  const walletConfig = getWalletConfig(walletSymbol);

  const labels = getLabels(chainConfig, walletConfig);
  const { MainIcon } = walletConfig;
  const [isPassed] = useTimeout(3000);
  const passed = isPassed();
  return (
    <>
      <Debug it={{ chainConfig }} />
      <BridgeModalTitle
        title={passed ? labels.actionTitle : labels.initialTitle}
        onClose={onClose}
      />
      <PaperContent bottomPadding>
        <ProgressWrapper>
          <ProgressWithContent
            size={128}
            color={theme.customColors.skyBlueLight}
            fontSize="big"
            processing
          >
            <MainIcon fontSize="inherit" />
          </ProgressWithContent>
        </ProgressWrapper>
        <Typography variant="h6" align="center">
          {passed ? labels.actionMessage : labels.initialMessage}
        </Typography>
      </PaperContent>
    </>
  );
};

const useWalletConnectionProgressStyles = makeStyles((theme) => ({
  iconWrapper: {
    borderRadius: "50%",
    padding: 13,
    backgroundColor: theme.palette.divider,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 44,
  },
}));

export const WalletConnectionProgress: FunctionComponent = () => {
  const theme = useTheme();
  const styles = useWalletConnectionProgressStyles();
  return (
    <ProgressWithContent color={theme.customColors.redLighter} size={128}>
      <div className={styles.iconWrapper}>
        <WalletIcon fontSize="inherit" color="secondary" />
      </div>
    </ProgressWithContent>
  );
};

export const WalletWrongNetworkInfo: WalletPickerProps<
  any,
  any
>["WrongNetworkInfo"] = ({ chain, targetNetwork, onClose }) => {
  console.log(targetNetwork);
  const theme = useTheme();
  const chainName = getChainConfigByRentxName(chain).full;
  const networkName = getNetworkConfigByRentxName(targetNetwork).full;
  return (
    <>
      <BridgeModalTitle title="Wrong Network" onClose={onClose} />
      <PaperContent bottomPadding>
        <ProgressWrapper>
          <ProgressWithContent
            size={128}
            color={theme.customColors.redLighter}
            fontSize="big"
          >
            <AccountBalanceWalletIcon fontSize="inherit" color="secondary" />
          </ProgressWithContent>
        </ProgressWrapper>
        <Typography variant="h5" align="center" gutterBottom>
          Switch to {chainName} {networkName}
        </Typography>
        <Typography variant="body1" align="center" color="textSecondary">
          RenBridge requires you to connect to the {chainName} {networkName}
        </Typography>
      </PaperContent>
    </>
  );
};

const createIndicatorClass = (className: string, color: string) => {
  const { pulsingStyles, pulsingKeyframes } = createPulseAnimation(
    color,
    3,
    className
  );

  return {
    ...pulsingKeyframes,
    [className]: {
      ...pulsingStyles,
      backgroundColor: color,
    },
  };
};

type WalletConnectionIndicatorStyles = Record<
  "root" | "connected" | "disconnected" | "wrongNetwork" | "connecting",
  string
>;
const useWalletConnectionIndicatorStyles = makeStyles((theme) => {
  return {
    root: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.palette.divider,
    },
    ...createIndicatorClass("connected", theme.palette.success.main),
    ...createIndicatorClass("disconnected", theme.palette.error.main),
    ...createIndicatorClass("connecting", theme.palette.info.main),
    ...createIndicatorClass("wrongNetwork", theme.palette.warning.main),
  };
});

type WalletConnectionIndicatorProps = {
  status?: WalletConnectionStatusType;
  className?: string; // TODO: find a better way
};

export const WalletConnectionIndicator: FunctionComponent<WalletConnectionIndicatorProps> = ({
  status,
  className: classNameProp,
}) => {
  const styles = useWalletConnectionIndicatorStyles() as WalletConnectionIndicatorStyles;
  const className = classNames(styles.root, classNameProp, {
    [styles.connected]: status === WalletStatus.CONNECTED,
    [styles.wrongNetwork]: status === WalletStatus.WRONG_NETWORK,
    [styles.disconnected]: status === WalletStatus.DISCONNECTED,
    [styles.connecting]: status === WalletStatus.CONNECTING,
  });
  return <div className={className} />;
};

const getWalletConnectionLabel = (status: WalletConnectionStatusType) => {
  switch (status) {
    case "disconnected":
      return "Connect a Wallet";
    case "connecting":
      return "Connecting...";
    case "connected":
      return "Connected";
    case "wrong_network":
      return "Wrong Network!";
  }
};

const useWalletConnectionStatusButtonStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.common.white,
    borderColor: theme.palette.divider,
    boxShadow: defaultShadow,
    "&:hover": {
      borderColor: theme.palette.divider,
      backgroundColor: theme.palette.divider,
    },
  },
  hoisted: {
    zIndex: theme.zIndex.tooltip,
  },
  indicator: {
    marginRight: 10,
  },
  account: { marginLeft: 20 },
}));

type WalletConnectionStatusButtonProps = ButtonProps & {
  status: WalletConnectionStatusType;
  wallet: BridgeWallet;
  hoisted?: boolean;
  account?: string;
};

export const WalletConnectionStatusButton: FunctionComponent<WalletConnectionStatusButtonProps> = ({
  status,
  account,
  wallet,
  hoisted,
  className,
  ...rest
}) => {
  const {
    indicator: indicatorClassName,
    account: accountClassName,
    hoisted: hoistedClassName,
    ...classes
  } = useWalletConnectionStatusButtonStyles();

  const label =
    status === WalletStatus.CONNECTED
      ? getWalletConfig(wallet).short
      : getWalletConnectionLabel(status);
  const trimmedAddress = trimAddress(account);
  const resolvedClassName = classNames(className, {
    [hoistedClassName]: hoisted,
  });
  return (
    <Button
      className={resolvedClassName}
      variant="outlined"
      color="secondary"
      classes={classes}
      {...rest}
    >
      <WalletConnectionIndicator
        status={status}
        className={indicatorClassName}
      />
      <span>{label}</span>
      {trimmedAddress && (
        <span className={accountClassName}>{trimmedAddress}</span>
      )}
    </Button>
  );
};
