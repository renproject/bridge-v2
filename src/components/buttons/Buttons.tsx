import {
  Button,
  ButtonProps,
  Fade,
  IconButton,
  IconButtonProps,
  styled,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CopyIcon from "@material-ui/icons/FileCopyOutlined";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import classNames from "classnames";
import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  blue,
  graphiteLight,
  gray,
  grayLight,
  skyBlue,
  skyBlueLighter,
} from "../../theme/colors";
import { copyToClipboard } from "../../utils/copyToClipboard";
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
    backgroundColor: skyBlueLighter,
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

const useLightIconButtonStyles = makeStyles((theme) => ({
  root: {
    color: blue,
    backgroundColor: skyBlueLighter,
    fontSize: 19,
    "&:hover": {
      backgroundColor: skyBlue,
      "@media (hover: none)": {
        backgroundColor: "transparent",
      },
    },
  },
  label: {
    padding: 10,
  },
}));

const useCopyContentButtonStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "stretch",
    maxWidth: 320,
  },
  content: {
    flexGrow: 2,
    fontSize: 13,
    borderRadius: 20,
    marginRight: 10,
    color: blue,
    backgroundColor: skyBlueLighter,
    userSelect: "all",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 265,
  },
  contentValue: {
    display: "block",
    paddingRight: 20,
    paddingLeft: 20,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  copy: {
    flexGrow: 0,
    flexShrink: 0,
  },
}));

type CopyContentButtonProps = {
  content: string;
};

export const CopyContentButton: FunctionComponent<CopyContentButtonProps> = ({
  content,
}) => {
  const styles = useCopyContentButtonStyles();
  const iconClasses = useLightIconButtonStyles();
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(() => {
    if (!copied) {
      copyToClipboard(content);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 4000);
    }
  }, [content, copied]);
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        {copied && (
          <Fade in={copied} timeout={1200}>
            <span>Copied!</span>
          </Fade>
        )}
        {!copied && <span className={styles.contentValue}>{content}</span>}
      </div>
      <div className={styles.copy}>
        <IconButton classes={iconClasses} onClick={handleClick}>
          <CopyIcon fontSize="inherit" />
        </IconButton>
      </div>
    </div>
  );
};

const useTransactionDetailsButtonStyles = makeStyles((theme) => ({
  button: {
    fontSize: 13,
    color: theme.palette.primary.main,
    backgroundColor: theme.customColors.skyBlueLighter,
    maxWidth: "100%",
    padding: `12px 20px 11px 20px`,
    "&:hover": {
      backgroundColor: theme.customColors.skyBlueLight,
      "@media (hover: none)": {
        backgroundColor: "transparent",
      },
    },
  },
  wrapper: {
    display: "flex",
    maxWidth: "100%",
  },
  chain: {
    flexGrow: 0,
    color: theme.palette.common.black,
    whiteSpace: "nowrap",
    marginRight: 4,
  },
  addressWrapper: {
    flexGrow: 1,
    display: "flex",
    overflow: "hidden",
    textOverflow: "ellipsis",
    // userSelect: "all",
    // "&::after": { // experimental
    //   color: "red",
    //   display: "inline-flex",
    //   marginLeft: 0,
    //   // position: "absolute",
    //   // right: 0,
    //   // display: "none",
    //   content: "attr(data-address)",
    //   textAlign: "right",
    //   direction: "rtl",
    //   overflow: "hidden",
    //   // width: "50%",
    // },
  },
  address: {
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
}));

type TransactionDetailsButton = ButtonProps & {
  chain: string;
  address: string;
  link?: string;
};

export const TransactionDetailsButton: FunctionComponent<TransactionDetailsButton> = ({
  chain,
  address,
  link = "",
}) => {
  const styles = useTransactionDetailsButtonStyles();

  return (
    <Button className={styles.button} href={link} target="_blank">
      <span className={styles.wrapper}>
        <span className={styles.chain}>{chain} Tx: </span>{" "}
        <span className={styles.addressWrapper} data-address={address}>
          <span className={styles.address}>{address}</span>
        </span>
      </span>
    </Button>
  );
};

export const BigQrCode = styled("div")(({ theme }) => ({
  width: 132,
  height: 132,
  padding: 15,
  borderRadius: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: skyBlueLighter,
  color: theme.palette.common.black,
  fontSize: 150, // TODO: remove when QR codes done
}));

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

export const ActionButton: FunctionComponent<ButtonProps> = (props) => (
  <Button
    variant="contained"
    size="large"
    color="primary"
    fullWidth
    {...props}
  />
);

export const ActionButtonWrapper = styled("div")(() => ({
  marginTop: 20,
}));

const useSmallActionButtonStyles = makeStyles({
  root: {
    borderRadius: 8,
  },
});

export const SmallActionButton: FunctionComponent<ButtonProps> = (props) => {
  const classes = useSmallActionButtonStyles();
  return (
    <Button
      classes={classes}
      variant="contained"
      size="small"
      color="primary"
      {...props}
    />
  );
};
