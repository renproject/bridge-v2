import {
  Box,
  Button,
  ButtonProps,
  Fade,
  IconButton,
  IconButtonProps,
  styled,
  withStyles,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
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
import { defaultShadow } from "../../theme/other";
import {
  copyToClipboard,
  copyToClipboardAsync,
} from "../../utils/copyToClipboard";
import {
  BrowserNotificationsIcon,
  CustomSvgIconComponent,
  HomeIcon,
  LanguageIcon,
  QrCodeIcon,
  TxHistoryIcon,
} from "../icons/RenIcons";
import { Hide } from "../layout/LayoutHelpers";
import { PulseIndicator } from "../progress/ProgressHelpers";
import { MiddleEllipsisText } from "../typography/TypographyHelpers";

export type ToggleIconButtonProps = IconButtonProps & {
  variant?: "settings" | "notifications" | "history";
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
      case "notifications":
        return BrowserNotificationsIcon;
      case "settings":
        return MoreVertIcon;
      case "history":
        return TxHistoryIcon;
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

const useCircledIconButtonStyles = makeStyles((theme) => ({
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
  const { icon: iconClassName, ...classes } = useCircledIconButtonStyles();
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
    // userSelect: "all",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 265,
  },
  contentValue: {
    maxWidth: "100%",
    paddingLeft: 9,
    paddingRight: 9,
  },
  copy: {
    flexGrow: 0,
    flexShrink: 0,
  },
}));

type CopyContentButtonProps = {
  content: string;
  copiedMessage?: string;
};

export const CopyContentButton: FunctionComponent<CopyContentButtonProps> = ({
  content,
  copiedMessage = "Copied!",
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
            <span>{copiedMessage}</span>
          </Fade>
        )}
        <Hide when={copied} className={styles.contentValue}>
          <MiddleEllipsisText hoverable>{content}</MiddleEllipsisText>
        </Hide>
      </div>
      <div className={styles.copy}>
        <IconButton classes={iconClasses} onClick={handleClick}>
          <CopyIcon fontSize="inherit" />
        </IconButton>
      </div>
    </div>
  );
};

export const CopyContentTypography: FunctionComponent<
  CopyContentButtonProps
> = ({ content, copiedMessage = "Copied!" }) => {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(() => {
    if (!copied) {
      copyToClipboardAsync(content).then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 4000);
      });
    }
  }, [content, copied]);
  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <span>
        {copied && (
          <Fade in={copied} timeout={1200}>
            <span>{copiedMessage}</span>
          </Fade>
        )}
        <Hide when={copied}>
          <strong>
            <MiddleEllipsisText hoverable>{content}</MiddleEllipsisText>
          </strong>
        </Hide>
      </span>
      <IconButton onClick={handleClick}>
        <CopyIcon fontSize="inherit" />
      </IconButton>
    </Box>
  );
};

const useMiddleEllipsisCopyStyles = makeStyles({
  root: {
    width: "100%",
    textAlign: "center",
    "&:hover $hideForHover": {
      display: "none",
    },
    "&:hover $showForHover": {
      display: "block",
    },
  },
  hideForHover: {
    maxWidth: "100%",
    display: "block",
  },
  showForHover: {
    display: "none",
    overflow: "hidden",
    textOverflow: "ellipsis",
    paddingLeft: 15,
    paddingRight: 15,
  },
});

type MiddleEllipsisCopyProps = {
  content: string;
};
export const MiddleEllipsisCopy: FunctionComponent<MiddleEllipsisCopyProps> = ({
  content,
}) => {
  const styles = useMiddleEllipsisCopyStyles();
  return (
    <div className={styles.root}>
      <div className={styles.hideForHover}>
        <MiddleEllipsisText>
          <span>{content}</span>
        </MiddleEllipsisText>
      </div>
      <div className={styles.showForHover}>{content}</div>
    </div>
  );
};

const useTransactionDetailsButtonStyles = makeStyles((theme) => ({
  button: {
    fontSize: 13,
    color: theme.palette.primary.main,
    backgroundColor: theme.customColors.skyBlueLighter,
    maxWidth: "100%",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 12,
    paddingBottom: 11,
    "&:hover": {
      backgroundColor: theme.customColors.skyBlueLight,
      "@media (hover: none)": {
        backgroundColor: "transparent",
      },
    },
  },
  buttonSmall: {
    fontSize: 12,
    paddingTop: 7,
    paddingBottom: 5,
  },
  wrapper: {
    display: "flex",
    maxWidth: "100%",
  },
  label: {
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
  },
  address: {
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
}));

type TransactionDetailsButtonProps = ButtonProps & {
  label: string;
  address: string;
  isTx?: boolean;
  link?: string;
};

export const TransactionDetailsButton: FunctionComponent<
  TransactionDetailsButtonProps
> = ({ label, address, isTx = true, link = "", size }) => {
  const styles = useTransactionDetailsButtonStyles();

  const buttonClassName = classNames(styles.button, {
    [styles.buttonSmall]: size === "small",
  });
  return (
    <Button
      className={buttonClassName}
      href={link}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className={styles.wrapper}>
        <span className={styles.label}>
          {label} {isTx ? "Tx: " : ""}
        </span>{" "}
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

const useMenuIconButtonStyles = makeStyles((theme) => ({
  root: {
    padding: 6,
    color: theme.palette.secondary.light,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.common.white,
    boxShadow: defaultShadow,
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

export const HomeMenuIconButton: FunctionComponent<IconButtonProps> = (
  props
) => {
  const { icon, ...classes } = useMenuIconButtonStyles();
  return (
    <IconButton classes={classes} {...props}>
      <HomeIcon className={icon} />
    </IconButton>
  );
};

export const LanguageMenuIconButton: FunctionComponent<IconButtonProps> = (
  props
) => {
  const { icon, ...classes } = useMenuIconButtonStyles();
  return (
    <IconButton classes={classes} {...props}>
      <LanguageIcon className={icon} />
    </IconButton>
  );
};

const useTransactionHistoryIconButtonStyles = makeStyles((theme) => ({
  indicator: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  hoisted: {
    zIndex: theme.zIndex.tooltip,
  },
}));

type ClosableMenuIconButtonProps = IconButtonProps & {
  Icon: CustomSvgIconComponent;
  opened?: boolean;
  indicator?: boolean;
};

export const ClosableMenuIconButton: FunctionComponent<
  ClosableMenuIconButtonProps
> = ({ opened, indicator, className, Icon, ...props }) => {
  const { icon: iconClassName, ...classes } = useMenuIconButtonStyles();
  const { hoisted: hoistedClassName, indicator: indicatorClassname } =
    useTransactionHistoryIconButtonStyles();
  const ResolvedIcon = opened ? CloseIcon : Icon;
  const resolvedClassName = classNames(className, {
    [hoistedClassName]: opened,
  });
  return (
    <IconButton className={resolvedClassName} classes={classes} {...props}>
      <ResolvedIcon className={iconClassName} />
      {indicator && !opened && (
        <PulseIndicator className={indicatorClassname} pulsing />
      )}
    </IconButton>
  );
};

const useActionButtonStyles = makeStyles({
  root: { maxWidth: 360 },
});

export const ActionButton: FunctionComponent<ButtonProps> = ({
  color = "primary",
  ...props
}) => {
  const styles = useActionButtonStyles();
  return (
    <Button
      className={styles.root}
      variant="contained"
      size="large"
      fullWidth
      color={color}
      {...props}
    />
  );
};

export const ActionButtonWrapper = styled("div")(() => ({
  marginTop: 20,
  display: "flex",
  justifyContent: "center",
  flexDirection: "row",
}));

export const MultipleActionButtonWrapper = styled("div")(() => ({
  marginTop: 20,
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
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

const useSecondaryActionButtonStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 16,
    color: theme.palette.text.primary,
    borderWidth: "2px!important",
    fontSize: 14,
  },
  outlined: {
    border: `2px solid ${theme.palette.primary.main}`,
    "&$disabled": {
      border: `2px solid ${theme.palette.action.disabledBackground}`,
    },
  },
}));

export const SecondaryActionButton: FunctionComponent<ButtonProps> = (
  props
) => {
  const classes = useSecondaryActionButtonStyles();
  return <Button fullWidth variant="outlined" {...props} classes={classes} />;
};

export const RedButton = withStyles((theme) => ({
  root: {
    color: theme.palette.error.main,
    borderColor: theme.palette.error.light,
    "&:hover": {
      borderColor: theme.palette.error.dark,
    },
  },
}))(Button);
