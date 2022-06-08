import { IconProps, SvgIcon, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { SvgIconComponent } from "@material-ui/icons";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import { getPaddedScalingProps } from "../../utils/icons";
import { CustomSvgIconComponent } from "./RenIcons";

export const createPaddedIcon = (
  Icon: FunctionComponent,
  viewBoxWidth = 24,
  viewBoxHeight = viewBoxWidth
) => {
  const GeneratedIcon: CustomSvgIconComponent = (props) => {
    const { viewBox } = getPaddedScalingProps(viewBoxWidth, viewBoxHeight);
    return <SvgIcon component={Icon} viewBox={viewBox} {...props} />;
  };
  return GeneratedIcon;
};

const nativeTokenIconSize = 200;
const wrappedTokenIconSize = 256;

export const nativeTokenIcon = (Icon: FunctionComponent) => {
  return createPaddedIcon(Icon, nativeTokenIconSize);
};

export const wrappedTokenIcon = (Icon: FunctionComponent) => {
  return createPaddedIcon(Icon, wrappedTokenIconSize);
};

const walletIconSize = 256;
export const walletIcon = (Icon: FunctionComponent) => {
  return createPaddedIcon(Icon, walletIconSize);
};

const chainIconSize = 254;
export const chainIcon = (Icon: FunctionComponent) => {
  return createPaddedIcon(Icon, chainIconSize);
};

export const chainIconFromToken = (Icon: FunctionComponent) => {
  return createPaddedIcon(Icon, nativeTokenIconSize);
};

const useIconWithLabelStyles = makeStyles((theme) => ({
  root: {
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    [theme.breakpoints.up("sm")]: {
      width: 60,
    },
    [theme.breakpoints.up("md")]: {
      width: 70,
    },
  },
  icon: {
    fontSize: 66,
    height: 62,
    lineHeight: 1,
  },
  label: {
    marginTop: 12,
    fontSize: 12,
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

type IconWithLabelProps = {
  label: string;
  Icon: CustomSvgIconComponent | SvgIconComponent;
  iconClassName?: string;
};

export const IconWithLabel: FunctionComponent<IconWithLabelProps> = ({
  label,
  Icon,
  iconClassName,
}) => {
  const styles = useIconWithLabelStyles();
  return (
    <span className={styles.root}>
      <span className={classNames(styles.icon, iconClassName)}>
        <Icon fontSize="inherit" />
      </span>
      <Typography className={styles.label}>{label}</Typography>
    </span>
  );
};

const useCircleIconStyles = makeStyles((theme) => ({
  root: {
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
    padding: 3,
    fontSize: 15,
  },
  solid: {
    // fontSize: 66,
    // height: 62,
    // lineHeight: 1,
    backgroundColor: theme.customColors.grayLight,
  },
  outlined: {
    border: `1px solid ${theme.palette.grey["700"]}`,
  },
}));

type CircleIconProps = IconProps & {
  Icon: CustomSvgIconComponent | SvgIconComponent;
  variant: "outlined" | "solid";
};

export const CircleIcon: FunctionComponent<CircleIconProps> = ({
  Icon,
  variant,
}) => {
  const styles = useCircleIconStyles();
  const resolvedClassName = classNames(styles.root, {
    [styles.solid]: variant === "solid",
    [styles.outlined]: variant === "outlined",
  });

  return (
    <span className={resolvedClassName}>
      <Icon color="secondary" fontSize="inherit" />
    </span>
  );
};
