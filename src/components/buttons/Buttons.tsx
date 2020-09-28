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
import { BrowserNotificationsIcon, QrCodeIcon } from "../icons/RenIcons";

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

const useGatewayButtonStyles = makeStyles((theme) => ({
  root: {
    fontSize: 13,
    color: blue,
    minWidth: 320,
    backgroundColor: skyBlueLight,
    "&:hover": {
      backgroundColor: skyBlue,
      "@media (hover: none)": {
        backgroundColor: "transparent",
      },
    },
  },
  label: {
    paddingLeft: 20,
    paddingRight: 20,
  },
}));

type GatewayButtonProps = ButtonProps;

export const GatewayButton: FunctionComponent<GatewayButtonProps> = (props) => {
  const classes = useGatewayButtonStyles();
  return <Button classes={classes} {...props} />;
};

type CopyGatewayButton = GatewayButtonProps & {
  address: string;
};

export const CopyGatewayButton: FunctionComponent<CopyGatewayButton> = ({
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
    <GatewayButton onClick={handleClick}>
      {copied && (
        <Fade in={copied} timeout={1200}>
          <span>Copied!</span>
        </Fade>
      )}
      {!copied && address}
    </GatewayButton>
  );
};
