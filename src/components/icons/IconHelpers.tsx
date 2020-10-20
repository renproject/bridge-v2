import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { SvgIconComponent } from "@material-ui/icons";
import React, { FunctionComponent } from "react";
import { CustomSvgIconComponent } from "./RenIcons";

const useStyles = makeStyles(() => ({
  root: {
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: 50
  },
  icon: {
    fontSize: 66,
    height: 62,
    lineHeight: 1,
  },
  label: {
    marginTop: 12,
    lineHeight: 1
  },
}));

type IconWithLabelProps = {
  label: string;
  Icon: CustomSvgIconComponent | SvgIconComponent;
};

export const IconWithLabel: FunctionComponent<IconWithLabelProps> = ({
  label,
  Icon,
}) => {
  const styles = useStyles();
  return (
    <span className={styles.root}>
      <span className={styles.icon}>
        <Icon fontSize="inherit" />
      </span>
      <Typography variant="overline" className={styles.label}>{label}</Typography>
    </span>
  );
};
