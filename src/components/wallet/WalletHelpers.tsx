import { Button, ButtonProps, Typography, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { QuestionAnswer } from "@material-ui/icons";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import { WalletPickerProps } from "@renproject/multiwallet-ui";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import { useTimeout } from "react-use";
import {
  BridgeWallet,
  getChainConfigByRentxName,
  getNetworkConfigByRentxName,
  getWalletConfig,
  BridgeWalletConfig,
  BridgeChainConfig,
} from "../../utils/assetConfigs";
import { trimAddress } from "../../utils/strings";
import {
  BinanceChainFullIcon,
  MetamaskFullIcon,
  WalletConnectFullIcon,
  WalletIcon,
} from "../icons/RenIcons";
import { PaperContent } from "../layout/Paper";
import { BridgeModalTitle } from "../modals/BridgeModal";
import {
  ProgressWithContent,
  ProgressWrapper,
} from "../progress/ProgressHelpers";
import { Debug } from '../utils/Debug'
import { WalletConnectionStatusType, WalletStatus } from "../utils/types";

export const useWalletPickerStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 400,
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
  },
}));

const mapWalletEntryIcon = (chain: string, name: string) => {
  console.log(chain, name);
  if (chain === "ethereum") {
    switch (name.toLowerCase()) {
      case "metamask":
        return <MetamaskFullIcon fontSize="inherit" />;
      case "walletconnect":
        return <WalletConnectFullIcon fontSize="inherit" />;
    }
  }
  if (chain === "binanceSmartChain") {
    return <BinanceChainFullIcon fontSize="inherit" />;
  }
  return <QuestionAnswer />;
};

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
>["WalletEntryButton"] = ({ chain, onClick, name, logo }) => {
  const { icon: iconClassName, ...classes } = useWalletEntryButtonStyles();
  const Icon = mapWalletEntryIcon(chain, name);
  return (
    <Button
      classes={classes}
      variant="outlined"
      size="large"
      fullWidth
      onClick={onClick}
    >
      <span>{name}</span> <span className={iconClassName}>{Icon}</span>
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
    chain === "ethereum"
      ? BridgeWallet.METAMASKW
      : BridgeWallet.BINANCESMARTCHAINW;
  const walletConfig = getWalletConfig(walletSymbol);

  const labels = getLabels(chainConfig, walletConfig);
  const { MainIcon } = walletConfig;
  const [isPassed] = useTimeout(3000);
  const passed = isPassed();
  return (
    <>
      <Debug it={{chainConfig}} />
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

const useWalletConnectionIndicatorStyles = makeStyles((theme) => ({
  root: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: theme.palette.divider,
  },
  connected: {
    backgroundColor: theme.palette.success.main,
  },
  wrongNetwork: {
    backgroundColor: theme.palette.warning.main,
  },
  disconnected: {
    backgroundColor: theme.palette.error.main,
  },
  connecting: {
    backgroundColor: theme.palette.info.main,
  },
}));

type WalletConnectionIndicatorProps = {
  status?: WalletConnectionStatusType;
  className?: string; // TODO: find a better way
};

export const WalletConnectionIndicator: FunctionComponent<WalletConnectionIndicatorProps> = ({
  status,
  className: classNameProp,
}) => {
  const styles = useWalletConnectionIndicatorStyles();
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
    borderColor: theme.palette.divider,
    "&:hover": {
      borderColor: theme.palette.divider,
      backgroundColor: theme.palette.divider,
    },
  },
  indicator: {
    // TODO: remove
    marginRight: 10,
  },
  account: { marginLeft: 20 },
}));

type WalletConnectionStatusButtonProps = ButtonProps & {
  status: WalletConnectionStatusType;
  account?: string;
};

export const WalletConnectionStatusButton: FunctionComponent<WalletConnectionStatusButtonProps> = ({
  status,
  account,
  ...rest
}) => {
  const {
    indicator: indicatorClassName,
    account: accountClassName,
    ...classes
  } = useWalletConnectionStatusButtonStyles();

  const label = getWalletConnectionLabel(status);
  const trimmedAddress = trimAddress(account);

  return (
    <Button variant="outlined" color="secondary" classes={classes} {...rest}>
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
