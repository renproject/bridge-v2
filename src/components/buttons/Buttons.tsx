import {
  Button,
  ButtonProps,
  Fade,
  IconButton,
  IconButtonProps,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FunctionComponent, useCallback, useMemo, useState } from "react";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import React from "react";
import {
  blue,
  graphiteLight,
  gray,
  grayLight,
  skyBlue,
  skyBlueLight,
} from "../../theme/colors";
import classNames from "classnames";
import { copyToClipboard } from "../../utils/copyToClipboard";
import CopyIcon from "@material-ui/icons/FileCopy"
import {
  BrowserNotificationsIcon,
  QrCodeIcon,
  TxHistoryIcon,
} from "../icons/RenIcons";

type ToggleIconButtonProps = IconButtonProps & {
  variant?: "settings" | "notifications";
  pressed?: boolean;
};

const useToggleIconButtonStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.secondary.light,
    backgroundColor: grayLight,
    "&:hover": {
      backgroundColor: gray,
      "@media (hover: none)": {
        backgroundColor: "transparent",
      },
    },
  },
  label: {
    padding: 3,
  },
  icon: {
    fontSize: 20,
  },
  pressed: {
    color: theme.palette.common.white,
    backgroundColor: graphiteLight,
    "&:hover": {
      backgroundColor: theme.palette.secondary.dark,
      "@media (hover: none)": {
        backgroundColor: "transparent",
      },
    },
  },
}));

export const ToggleIconButton: FunctionComponent<ToggleIconButtonProps> = ({
  pressed,
  variant,
  children,
  ...rest
}) => {
  const { label, ...styles } = useToggleIconButtonStyles();
  const className = classNames(styles.root, {
    [styles.pressed]: pressed,
  });
  const Icon = useMemo(() => {
    switch (variant) {
      case "settings":
        return BrowserNotificationsIcon;
      case "notifications":
        return MoreVertIcon;
      default:
        return () => null;
    }
  }, [variant]);
  return (
    <IconButton classes={{ label }} className={className} {...rest}>
      <Icon className={styles.icon} />
      {children}
    </IconButton>
  );
};

const useQrCodeIconButtonStyles = makeStyles((theme) => ({
  root: {
    color: blue,
    backgroundColor: skyBlueLight,
    "&:hover": {
      backgroundColor: skyBlue,
      "@media (hover: none)": {
        backgroundColor: "transparent",
      },
    },
  },
  label: {
    padding: 3,
  },
  icon: {
    fontSize: 20,
  },
}));

export const QrCodeIconButton: FunctionComponent<IconButtonProps> = (props) => {
  const { icon: iconClassName, ...classes } = useQrCodeIconButtonStyles();
  return (
    <IconButton classes={classes} {...props}>
      <QrCodeIcon className={iconClassName} />
    </IconButton>
  );
};

// TODO: remove
const useTxHistoryIconButtonStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.secondary.light,
    backgroundColor: grayLight,
    "&:hover": {
      backgroundColor: gray,
      "@media (hover: none)": {
        backgroundColor: "transparent",
      },
    },
  },
  label: {
    padding: 3,
  },
  icon: {
    fontSize: 20,
  },
}));

export const TxHistoryIconButton: FunctionComponent<IconButtonProps> = (
  props
) => {
  const { icon: iconClassName, ...classes } = useTxHistoryIconButtonStyles();
  return (
    <IconButton classes={classes} {...props}>
      <TxHistoryIcon className={iconClassName} />
    </IconButton>
  );
};

const useLightButtonStyles = makeStyles(() => ({
  root: {
    fontSize: 13,
    minWidth: 320,
    userSelect: "all",
    color: blue,
    backgroundColor: skyBlueLight,
    "&:hover": {
      backgroundColor: skyBlue,
      "@media (hover: none)": {
        backgroundColor: "transparent",
      },
    },
  },
  label: {
    paddingTop: 6,
    paddingBottom: 5,
    paddingLeft: 20,
    paddingRight: 20,
  },
}));

type LightButtonProps = ButtonProps;

export const LightButton: FunctionComponent<LightButtonProps> = (props) => {
  const classes = useLightButtonStyles();
  return <Button classes={classes} {...props} component="span" />;
};

type CopyGatewayButtonProps = LightButtonProps & {
  address: string;
};

export const CopyGatewayButton: FunctionComponent<CopyGatewayButtonProps> = ({
  address,
}) => {
  const [copied, setCopied] = useState(false);
  const handleClick = useCallback(() => {
    if (!copied) {
      copyToClipboard(address);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 4000);
    }
  }, [address, copied]);
  return (
    <LightButton onDoubleClick={handleClick} title="Double click to copy">
      {copied && (
        <Fade in={copied} timeout={1200}>
          <span>Copied!</span>
        </Fade>
      )}
      {!copied && address}
    </LightButton>
  );
};

const useCopyContentButtonStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "stretch",
  },
  content: {
    flexGrow: 2,
  },
  copy: {
    flexGrow: 0,
    flexShrink: 0,
  },
}));

type CopyContentButtonProps = {
  content: string;
};

export const CopyContentButton: FunctionComponent<CopyContentButtonProps> = () => {
  const styles = useCopyContentButtonStyles();
  return (
    <div className={styles.root}>
      <div className={styles.content}>a</div>
      <div className={styles.copy}>
        <IconButton>
          <CopyIcon />
        </IconButton>
      </div>
    </div>
  );
};

const useTransactionHistoryIconButtonStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.secondary.light,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: "transparent",
    padding: 6,
    "&:hover": {
      backgroundColor: theme.palette.divider,
      "@media (hover: none)": {
        backgroundColor: "transparent",
      },
    },
  },
  label: {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.divider,
    padding: 3,
  },
  icon: {
    fontSize: 20,
  },
}));

type TransactionHistoryMenuIconButtonProps = IconButtonProps & {};

export const TransactionHistoryMenuIconButton: FunctionComponent<TransactionHistoryMenuIconButtonProps> = (
  props
) => {
  const {
    icon: iconClassName,
    ...classes
  } = useTransactionHistoryIconButtonStyles();
  return (
    <IconButton classes={classes} {...props}>
      <TxHistoryIcon className={iconClassName} />
    </IconButton>
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
  warning: {
    backgroundColor: theme.palette.warning.main,
  },
  error: {
    backgroundColor: theme.palette.error.main,
  },
}));

type WalletConnectionIndicatorProps = {
  status?: "connected" | "warning" | "error";
  className?: string; // TODO: find a better way
};

export const WalletConnectionIndicator: FunctionComponent<WalletConnectionIndicatorProps> = ({
  status,
  className: classNameProp,
}) => {
  const styles = useWalletConnectionIndicatorStyles();
  const className = classNames(styles.root, classNameProp, {
    [styles.connected]: status === "connected",
    [styles.warning]: status === "warning",
    [styles.error]: status === "error",
  });
  return <div className={className} />;
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
    marginRight: 10,
  },
}));

export const WalletConnectionStatusButton: FunctionComponent = () => {
  const {
    indicator: indicatorClassName,
    ...classes
  } = useWalletConnectionStatusButtonStyles();
  return (
    <Button variant="outlined" color="secondary" classes={classes}>
      <WalletConnectionIndicator
        status="warning"
        className={indicatorClassName}
      />
      <span>Connect a Wallet</span>
    </Button>
  );
};
