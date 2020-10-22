import { Button, ButtonProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { QuestionAnswer } from "@material-ui/icons";
import { WalletPickerProps } from "@renproject/multiwallet-ui";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import { MetamaskFullIcon, WalletConnectFullIcon } from "../icons/RenIcons";
import { WalletConnectionStatusType } from "../utils/types";

export const useWalletPickerStyles = makeStyles((theme) => ({
  root: {},
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
    switch (name) {
      case "Metamask":
        return <MetamaskFullIcon fontSize="inherit" />;
      case "WalletConnect":
        return <WalletConnectFullIcon fontSize="inherit" />;
    }
  }
  return <QuestionAnswer />;
};

const useWalletEntryButtonStyles = makeStyles({
  root: {
    marginTop: 20,
    fontSize: 16,
    padding: "11px 20px 11px 40px",
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
    [styles.connected]: status === "connected",
    [styles.wrongNetwork]: status === "wrong_network",
    [styles.disconnected]: status === "disconnected",
    [styles.connecting]: status === "connecting",
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
}));

type WalletConnectionStatusButtonProps = ButtonProps & {
  status: WalletConnectionStatusType;
};

export const WalletConnectionStatusButton: FunctionComponent<WalletConnectionStatusButtonProps> = ({
  status,
  ...rest
}) => {
  const {
    indicator: indicatorClassName,
    ...classes
  } = useWalletConnectionStatusButtonStyles();
  const label = getWalletConnectionLabel(status);
  return (
    <Button variant="outlined" color="secondary" classes={classes} {...rest}>
      <WalletConnectionIndicator
        status={status}
        className={indicatorClassName}
      />
      <span>{label}</span>
    </Button>
  );
};
