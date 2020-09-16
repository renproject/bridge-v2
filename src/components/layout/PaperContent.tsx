import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent } from "react";
import classNames from "classnames";

const padding = 20;
const useStyles = makeStyles({
  root: {
    paddingLeft: padding,
    paddingRight: padding,
  },
  top: {
    paddingTop: padding,
  },
  bottom: {
    paddingBottom: padding,
  },
});

type PaperContentProps = {
  top?: boolean;
  bottom?: boolean;
};

export const PaperContent: FunctionComponent<PaperContentProps> = ({
  top,
  bottom,
}) => {
  const styles = useStyles();
  const className = classNames(styles.root, {
    [styles.top]: top,
    [styles.bottom]: bottom,
  });
  return <div className={className}>a</div>;
};
